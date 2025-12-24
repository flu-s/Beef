import { ButcherShop, Coordinates } from "../types";

const BACKEND_URL = "https://beef-q0ke.onrender.com"; 

export const fetchNearbyShops = async (location: Coordinates): Promise<ButcherShop[]> => {
  try {
    // 404 에러 해결을 위해 절대 경로(https://...)를 사용합니다.
    const response = await fetch(`${BACKEND_URL}/api/shops?lat=${location.lat}&lng=${location.lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`백엔드 서버 응답 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("fetchNearbyShops 에러:", error);
    throw error;
  }
};
