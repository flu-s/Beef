import { ButcherShop, Coordinates } from "../types";

/**
 * 사용자 위치 기준 주변 3km 내 정육점 5개를 가져옵니다.
 */
export const fetchNearbyShops = async (location: Coordinates): Promise<ButcherShop[]> => {
  try {
    // Render 서버의 상대 경로 또는 전체 URL
    const response = await fetch(`/api/shops?lat=${location.lat}&lng=${location.lng}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // 서버에서 거리순 정렬 및 5개 제한이 완료된 리스트
  } catch (error) {
    console.error("fetchNearbyShops 에러:", error);
    throw error;
  }
};
