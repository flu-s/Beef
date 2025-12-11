from ultralytics import YOLO

if __name__ == '__main__': # 이 줄을 추가합니다.
    # 1. 모델 불러오기
    model = YOLO('yolov8n.pt')

    # 2. 학습 실행
    results = model.train(data='C:/beef/data.yaml',
                          epochs=100,
                          imgsz=640,
                          batch=8)