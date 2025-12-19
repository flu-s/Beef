import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# --- [1] 모델 경로 설정 ---
MODEL_PATHS = {
    "beef_part": "C:/Python_workspace/Beef/ai-server/weight/beef_part.pt",
    "beef_grade": "C:/Python_workspace/Beef/ai-server/weight/beef_grade.pt",
    "chicken_part": "C:/Python_workspace/Beef/ai-server/weight/chicken_part.pt"
}

UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 모델 로드
LOADED_MODELS = {}
try:
    for name, path in MODEL_PATHS.items():
        if os.path.exists(path):
            LOADED_MODELS[name] = YOLO(path)
            print(f"✅ {name} 로드 성공")
        else:
            print(f"❌ 파일 없음: {path}")
except Exception as e:
    print(f"❌ 모델 로드 중 에러: {e}")


# --- [2] 결과 처리 유틸리티 ---
def parse_yolo(results, is_classification=False):
    label, conf = "N/A", 0.0
    if not results or len(results) == 0:
        return label, conf

    if is_classification:  # 등급 모델 (Classification)
        if hasattr(results[0], 'probs') and results[0].probs is not None:
            top_idx = int(results[0].probs.top1)
            conf = float(results[0].probs.top1conf.item())
            label = results[0].names[top_idx]
    else:  # 부위 모델 (Detection)
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            box = results[0].boxes[0]
            label = results[0].names[int(box.cls[0])]
            conf = float(box.conf[0])
    return label, conf


# --- [3] 소고기 통합 분석 API (부위 + 등급) ---
@app.route('/analyze/beef', methods=['POST'])
def analyze_beef():
    file = request.files.get('file')
    if not file: return jsonify({"error": "No file"}), 400

    path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(path)

    try:
        # 1. 부위 분석
        res_part = LOADED_MODELS["beef_part"].predict(path, conf=0.4, verbose=False)
        part_label, part_conf = parse_yolo(res_part)

        # 2. 등급 분석
        res_grade = LOADED_MODELS["beef_grade"].predict(path, conf=0.3, verbose=False)
        grade_label, grade_conf = parse_yolo(res_grade, is_classification=True)

        return jsonify({
            "detectedPart": part_label,
            "partConfidence": f"{part_conf * 100:.1f}%",
            "detectedGrade": grade_label,
            "gradeConfidence": f"{grade_conf * 100:.1f}%",
            "insight": f"분석 결과 {part_label} 부위, {grade_label} 등급입니다.",
            "recipes": [{}, {}, {}],
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path): os.remove(path)


# --- [4] 닭고기 분석 API ---
@app.route('/analyze/chicken', methods=['POST'])
def analyze_chicken():
    file = request.files.get('file')
    if not file: return jsonify({"error": "No file"}), 400

    path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(path)
    try:
        res = LOADED_MODELS["chicken_part"].predict(path, conf=0.4, verbose=False)
        label, conf = parse_yolo(res)

        return jsonify({
            "detectedChickenPart": label,
            "partConfidence": f"{conf * 100:.1f}%",
            "insight": f"닭고기 {label} 분석 결과입니다.",
            "recipes": [{}, {}, {}],
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path): os.remove(path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)