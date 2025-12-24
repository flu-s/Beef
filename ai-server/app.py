import os
import gc
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)

# ✅ CORS 설정: 모든 경로 및 메소드 허용
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

# ✅ [핵심] 서버 시작 시 모델을 전역 변수로 딱 한 번만 로드
# 모델 로딩 지연을 없애고 메모리 파편화를 방지합니다.
print("--- Loading Models... ---")
models = {
    "beef_part": YOLO(os.path.join(MODEL_DIR, "beef_part.pt")),
    "beef_grade": YOLO(os.path.join(MODEL_DIR, "beef_grade.pt")),
    "chicken_part": YOLO(os.path.join(MODEL_DIR, "chicken_part.pt"))
}
print("--- Models Loaded Successfully! ---")

def get_prediction(model_name, image_path, is_class=False):
    # 전역 변수에서 모델 가져오기
    model = models.get(model_name)
    if not model:
        return "N/A", 0.0
        
    try:
        # ✅ 모델을 del 하지 않고 계속 재사용 (속도 향상)
        results = model.predict(image_path, imgsz=320, conf=0.25, verbose=False)
        
        label, conf = "N/A", 0.0
        if results and len(results) > 0:
            if is_class:
                if hasattr(results[0], 'probs') and results[0].probs is not None:
                    idx = int(results[0].probs.top1)
                    conf = float(results[0].probs.top1conf.item())
                    label = results[0].names[idx]
            else:
                if results[0].boxes is not None and len(results[0].boxes) > 0:
                    box = results[0].boxes[0]
                    label = results[0].names[int(box.cls[0])]
                    conf = float(box.conf[0])
        
        return label, conf
    except Exception as e:
        print(f"Error prediction {model_name}: {e}")
        return "N/A", 0.0
    finally:
        # 불필요한 캐시만 정리
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()

@app.route('/analyze/beef', methods=['POST'])
def analyze_beef():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        # 전역 로드된 모델로 즉시 분석
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
    # Render 환경의 포트 설정 준수
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
