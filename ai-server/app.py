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

def get_prediction(model_name, image_path, is_class=False):
    """
    메모리 절약을 위해 함수 호출 시에만 모델을 로드하고,
    사용 직후 메모리에서 해제(del)합니다.
    """
    model_path = os.path.join(MODEL_DIR, f"{model_name}.pt")
    
    # 모델 파일 존재 여부 확인
    if not os.path.exists(model_path):
        print(f"Error: Model file {model_path} not found.")
        return "N/A", 0.0

    try:
        # 1. 모델 로드 (함수 실행 시점에 로드)
        model = YOLO(model_path)
        
        # 2. 예측 (imgsz를 320으로 낮춰 메모리 폭발 방지)
        with torch.no_grad():
            results = model.predict(image_path, imgsz=320, conf=0.25, verbose=False)
            
            label, conf = "N/A", 0.0
            if results and len(results) > 0:
                res = results[0]
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
            
            # 3. 결과 객체와 모델 객체 즉시 삭제하여 메모리 확보
            del results
            del model
            return label, conf
            
    except Exception as e:
        print(f"Error prediction {model_name}: {e}")
        return "N/A", 0.0
    finally:
        # 가비지 컬렉션 및 캐시 비우기
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
        # 소고기 부위 분석 (로드 -> 분석 -> 삭제)
        part_label, part_conf = get_prediction("beef_part", path)
        
        # 소고기 등급 분석 (로드 -> 분석 -> 삭제)
        # 순차적으로 진행하므로 메모리 피크치가 낮게 유지됩니다.
        grade_label, grade_conf = get_prediction("beef_grade", path, is_class=True)

        return jsonify({
            "detectedPart": part_label,
            "partConfidence": f"{part_conf * 100:.1f}%",
            "detectedGrade": grade_label,
            "gradeConfidence": f"{grade_conf * 100:.1f}%",
            "status": "success"
        })
    except Exception as e:
        print(f"Analyze Beef Error: {e}")
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
        # 닭고기 부위 분석
        label, conf = get_prediction("chicken_part", path)
        return jsonify({
            "detectedChickenPart": label,
            "partConfidence": f"{conf * 100:.1f}%",
            "status": "success"
        })
    except Exception as e:
        print(f"Analyze Chicken Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)
        gc.collect()

# 기본 경로 (Render 헬스체크용)
@app.route('/', methods=['GET', 'HEAD'])
def index():
    return "AI Server is Running", 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    # Render 무료 플랜 환경에서는 debug=False 권장
    app.run(host='0.0.0.0', port=port, debug=False)
