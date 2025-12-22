import os
import gc  # 메모리 청소를 위한 가비지 컬렉터
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)
# 모든 도메인 접속 허용
CORS(app, resources={r"/*": {"origins": "*"}})

# --- [1] 경로 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATHS = {
    "beef_part": os.path.join(BASE_DIR, "weight", "beef_part.pt"),
    "beef_grade": os.path.join(BASE_DIR, "weight", "beef_grade.pt"),
    "chicken_part": os.path.join(BASE_DIR, "weight", "chicken_part.pt")
}

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp_uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- [2] 모델 로드 (최적화 적용) ---
LOADED_MODELS = {}
try:
    for name, path in MODEL_PATHS.items():
        if os.path.exists(path):
            # 메모리 점유를 줄이기 위해 CPU 모드로 로드
            model = YOLO(path)
            model.to('cpu') 
            LOADED_MODELS[name] = model
            print(f"✅ {name} 로드 성공")
        else:
            print(f"❌ 파일 없음: {path}")
except Exception as e:
    print(f"❌ 모델 로드 중 에러: {e}")

def parse_yolo(results, is_classification=False):
    label, conf = "N/A", 0.0
    if not results or len(results) == 0:
        return label, conf
    if is_classification:
        if hasattr(results[0], 'probs') and results[0].probs is not None:
            top_idx = int(results[0].probs.top1)
            conf = float(results[0].probs.top1conf.item())
            label = results[0].names[top_idx]
    else:
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            box = results[0].boxes[0]
            label = results[0].names[int(box.cls[0])]
            conf = float(box.conf[0])
    return label, conf

# --- [3] API 엔드포인트 ---
@app.route('/analyze/beef', methods=['POST'])
def analyze_beef():
    file = request.files.get('file')
    if not file: return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        # 분석 실행 (verbose=False로 로그 출력 억제)
        res_part = LOADED_MODELS["beef_part"].predict(path, conf=0.4, verbose=False)
        part_label, part_conf = parse_yolo(res_part)

        res_grade = LOADED_MODELS["beef_grade"].predict(path, conf=0.3, verbose=False)
        grade_label, grade_conf = parse_yolo(res_grade, is_classification=True)

        # 분석 후 메모리 강제 정리
        del res_part, res_grade
        gc.collect()

        return jsonify({
            "detectedPart": part_label,
            "partConfidence": f"{part_conf * 100:.1f}%",
            "detectedGrade": grade_label,
            "gradeConfidence": f"{grade_conf * 100:.1f}%",
            "insight": f"분석 결과 {part_label} 부위, {grade_label} 등급으로 판정되었습니다.",
            "recipes": [],
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path): os.remove(path)

@app.route('/analyze/chicken', methods=['POST'])
def analyze_chicken():
    file = request.files.get('file')
    if not file: return jsonify({"error": "No file"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        res = LOADED_MODELS["chicken_part"].predict(path, conf=0.4, verbose=False)
        label, conf = parse_yolo(res)
        
        del res
        gc.collect()

        return jsonify({
            "detectedChickenPart": label,
            "partConfidence": f"{conf * 100:.1f}%",
            "insight": f"닭고기 {label} 분석 결과입니다.",
            "recipes": [],
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path): os.remove(path)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
