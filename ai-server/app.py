import os
from flask import Flask, request, jsonify
from ultralytics import YOLO
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)

PART_MODEL_PATH = 'C:/Python_workspace/beef/ai-server/weight/best_part.pt'
GRADE_MODEL_PATH = 'C:/Python_workspace/beef/ai-server/weight/best_grade.pt'

try:
    PART_MODEL = YOLO(PART_MODEL_PATH)
    GRADE_MODEL = YOLO(GRADE_MODEL_PATH)
    print("AI 모델이 성공적으로 로드되었습니다.")
except Exception as e:
    print(f"AI 모델 로드 실패: {e}")
    exit()

# 파일 업로드를 위한 임시 폴더 설정
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# --- 유틸리티 함수 ---

def parse_results(results, model_type, names_map=None):
    """
    YOLOv8 분석 결과를 파싱하여 반환 (마블링 제거)
    :return: (detected_item, insight)
    """

    detected_item = "판정 불가"
    insight = "감지된 정보가 명확하지 않습니다."
    max_conf = 0.0

    if not results:
        return detected_item, insight

    # --- 1. 부위 탐지 모델 (Detection) 로직 ---
    if model_type == 'part':
        if results[0].boxes:
            names = results[0].names
            classes = results[0].boxes.cls.tolist()
            confidences = results[0].boxes.conf.tolist()

            if classes:
                for cls, conf in zip(classes, confidences):
                    if conf > max_conf:
                        max_conf = conf
                        detected_item = names.get(int(cls), "알 수 없음")

                if detected_item != "알 수 없음":
                    insight = f"부위 판정 {detected_item}가 {max_conf:.2f}의 확률로 감지되었습니다."

    # --- 2. 등급 분류 모델 (Classification) 로직 (⭐중첩 제거) ---
    elif model_type == 'grade':
        if results and results[0].probs:
            probs = results[0].probs
            top_index = int(probs.top1)
            max_conf = probs.top1conf.item()

            if names_map and top_index in names_map:
                detected_item = names_map[top_index]
            else:
                # 등급은 1부터 시작한다고 가정
                detected_item = str(top_index + 1)

            insight = f"등급 판정 {detected_item}이 {max_conf:.2f} 확률로 감지되었습니다."
        else:
            insight = "등급 분류 결과를 찾을 수 없습니다."

    # ⭐ 2개의 값만 반환 ⭐
    return detected_item, insight


# --- 엔드포인트 ---

@app.route('/analyze/part', methods=['POST'])
def analyze_part():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = None
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file.save(filepath)

        results = PART_MODEL.predict(filepath, conf=0.5, iou=0.5, verbose=False) # verbose=False 추가

        # ⭐ 2개의 값만 받음 ⭐
        detected_part, insight_text = parse_results(results, 'part')

        os.remove(filepath)
        filepath = None

        return jsonify({
            "detectedPart": detected_part,
            "insight": insight_text,
            "status": "success"
        })

    except Exception as e:
        error_message = f"부위 분석 중 오류 발생: {e}"
        print(error_message)
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({"error": error_message}), 500


@app.route('/analyze/grade', methods=['POST'])
def analyze_grade():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = None
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        file.save(filepath)

        results = GRADE_MODEL.predict(filepath, conf=0.5, verbose=False) # verbose=False 추가

        # ⭐ 2개의 값만 받음 ⭐
        detected_grade, insight_text = parse_results(
            results,
            'grade',
            names_map=GRADE_MODEL.names
        )

        # 마블링 비율이 제거되었으므로, JSON 응답에서도 제거
        os.remove(filepath)
        filepath = None

        return jsonify({
            "detectedGrade": detected_grade,
            "insight": insight_text,
            "status": "success"
        })

    except Exception as e:
        error_message = f"등급 분석 중 오류 발생: {e}"
        print(error_message)
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({"error": error_message}), 500


# --- 서버 실행 ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)