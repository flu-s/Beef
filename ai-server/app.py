import os
from flask import Flask, request, jsonify
from ultralytics import YOLO
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)

# --- 설정 ---
PART_MODEL_PATH = 'C:/Python_workspace/beef/ai-server/weight/best_part.pt'
GRADE_MODEL_PATH = 'C:/Python_workspace/beef/ai-server/weight/best_grade.pt'

# 파일 업로드를 위한 임시 폴더 설정
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- 모델 로드 ---
try:
    PART_MODEL = YOLO(PART_MODEL_PATH)
    GRADE_MODEL = YOLO(GRADE_MODEL_PATH)
    print("AI 모델이 성공적으로 로드되었습니다.")
except Exception as e:
    print(f"AI 모델 로드 실패: {e}")
    exit()


# --- 유틸리티 함수 (확률 반환 추가) ---

def parse_results(results, model_type, names_map=None):
    """
    YOLOv8 분석 결과를 파싱하고, detected_item과 함께 확률(max_conf)을 반환합니다.
    :return: (detected_item, insight, max_conf)
    """

    detected_item = "판정 불가"
    insight = "감지된 정보가 명확하지 않습니다."
    max_conf = 0.0  # ⭐ 확률 값 초기화 및 반환값에 추가 ⭐

    if not results:
        return detected_item, insight, max_conf

    # --- 1. 부위 탐지 모델 (Detection) 로직 ---
    if model_type == 'part':
        if results[0].boxes:
            names = results[0].names
            classes = results[0].boxes.cls.tolist()
            confidences = results[0].boxes.conf.tolist()

            # 최대 확률 및 항목 찾기
            temp_conf = 0.0
            for cls, conf in zip(classes, confidences):
                if conf > temp_conf:
                    temp_conf = conf
                    detected_item = names.get(int(cls), "알 수 없음")

            max_conf = temp_conf  # ⭐ 찾은 최대 확률 저장 ⭐

            if detected_item != "알 수 없음":
                insight = f"부위 판정 {detected_item}가 {max_conf:.2f}의 확률로 감지되었습니다."

    # --- 2. 등급 분류 모델 (Classification) 로직 (1++ 시작 반영) ---
    elif model_type == 'grade':
        if results and results[0].probs:
            probs = results[0].probs
            top_index = int(probs.top1)
            max_conf = probs.top1conf.item()  # ⭐ 확률 값 저장 ⭐

            if names_map and top_index in names_map:
                detected_item = names_map[top_index]
            else:
                detected_item = str(top_index)

            insight = f"등급 판정 {detected_item}이 {max_conf:.2f} 확률로 감지되었습니다."
        else:
            insight = "등급 분류 결과를 찾을 수 없습니다."
            max_conf = 0.0

    # ⭐ max_conf를 포함하여 3개의 값 반환 ⭐
    return detected_item, insight, max_conf


# --- 엔드포인트: 부위 분석 (JSON 응답 수정) ---

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

        results = PART_MODEL.predict(filepath, conf=0.5, iou=0.5, verbose=False)

        detected_part, insight_text, confidence = parse_results(results, 'part')

        os.remove(filepath)
        filepath = None

        return jsonify({
            "detectedPart": detected_part,
            "insight": insight_text,
            "confidence": f"{confidence * 100:.1f}%",
            "status": "success"
        })

    except Exception as e:
        error_message = f"부위 분석 중 오류 발생: {e}"
        print(error_message)
        if filepath and os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({"error": error_message}), 500


# --- 엔드포인트: 등급 분석 (JSON 응답 수정) ---

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

        results = GRADE_MODEL.predict(filepath, conf=0.5, verbose=False)

        # ⭐ 확률 값(confidence)까지 받도록 변경 ⭐
        detected_grade, insight_text, confidence = parse_results(
            results,
            'grade',
            names_map=GRADE_MODEL.names
        )

        os.remove(filepath)
        filepath = None

        return jsonify({
            "detectedGrade": detected_grade,
            "insight": insight_text,
            "confidence": f"{confidence * 100:.1f}%",
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
    print("Flask 서버를 시작합니다. http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)