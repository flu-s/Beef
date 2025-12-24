import os
import gc
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)
# ✅ CORS 설정: Vercel에서 오는 요청을 허용합니다.
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "weight")
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp_uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_prediction(model_name, image_path, is_class=False):
    model_path = os.path.join(MODEL_DIR, f"{model_name}.pt")
    if not os.path.exists(model_path):
        return "N/A", 0.0
        
    try:
        # ✅ 모델 로드 (가장 가벼운 imgsz 320 권장)
        model = YOLO(model_path)
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
        
        # ✅ 메모리 해제 필수
        del model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        
        return label, conf
    except Exception as e:
        print(f"Error prediction {model_name}: {e}")
        return "N/A", 0.0

@app.route('/analyze/beef', methods=['POST', 'OPTIONS'])
def analyze_beef():
    if request.method == 'OPTIONS':
        return '', 204

    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        # 메모리 피크를 방지하기 위해 순차 실행
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

@app.route('/analyze/chicken', methods=['POST', 'OPTIONS'])
def analyze_chicken():
    if request.method == 'OPTIONS':
        return '', 204

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
