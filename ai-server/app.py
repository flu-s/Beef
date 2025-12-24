import os
import gc
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)

# ✅ CORS 설정
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "weight")
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp_uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ✅ 전역 모델 로드 (서버 시작 시 1회)
print("--- Loading Models... ---")
models = {
    "beef_part": YOLO(os.path.join(MODEL_DIR, "beef_part.pt")),
    "beef_grade": YOLO(os.path.join(MODEL_DIR, "beef_grade.pt")),
    "chicken_part": YOLO(os.path.join(MODEL_DIR, "chicken_part.pt"))
}
print("--- Models Loaded Successfully! ---")

def get_prediction(model_name, image_path, is_class=False):
    model = models.get(model_name)
    if not model:
        return "N/A", 0.0
    
    # ✅ 메모리 절약을 위해 Gradient 계산 비활성화
    with torch.no_grad():
        try:
            # ✅ imgsz=320으로 고정하여 메모리 폭발 방지
            results = model.predict(image_path, imgsz=320, conf=0.25, verbose=False)
            
            label, conf = "N/A", 0.0
            if results and len(results) > 0:
                res = results[0] # 결과를 변수에 할당 후 즉시 처리
                if is_class:
                    if hasattr(res, 'probs') and res.probs is not None:
                        idx = int(res.probs.top1)
                        conf = float(res.probs.top1conf.item())
                        label = res.names[idx]
                else:
                    if res.boxes is not None and len(res.boxes) > 0:
                        box = res.boxes[0]
                        label = res.names[int(box.cls[0])]
                        conf = float(box.conf[0])
            
            # ✅ 사용 완료된 결과 객체 명시적 삭제
            del results
            return label, conf
            
        except Exception as e:
            print(f"Error prediction {model_name}: {e}")
            return "N/A", 0.0
        finally:
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect() # 가비지 컬렉션 강제 실행

@app.route('/analyze/beef', methods=['POST'])
def analyze_beef():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        part_label, part_conf = get_prediction("beef_part", path)
        grade_label, grade_conf = get_prediction("beef_grade", path, is_class=True)

        return jsonify({
            "detectedPart": part_label,
            "partConfidence": f"{part_conf * 100:.1f}%",
            "detectedGrade": grade_label,
            "gradeConfidence": f"{grade_conf * 100:.1f}%",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)
        gc.collect()

@app.route('/analyze/chicken', methods=['POST'])
def analyze_chicken():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        label, conf = get_prediction("chicken_part", path)
        return jsonify({
            "detectedChickenPart": label,
            "partConfidence": f"{conf * 100:.1f}%",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)
        gc.collect()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
