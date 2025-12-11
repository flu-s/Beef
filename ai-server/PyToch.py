import torch

print(f"PyTorch 버전: {torch.__version__}")

# CUDA 사용 가능 여부 확인
is_cuda_available = torch.cuda.is_available()
print(f"CUDA 사용 가능 여부: {is_cuda_available}")

if is_cuda_available:
    print(f"사용 가능한 GPU 개수: {torch.cuda.device_count()}")
    print(f"현재 인식된 GPU 이름: {torch.cuda.get_device_name(0)}")