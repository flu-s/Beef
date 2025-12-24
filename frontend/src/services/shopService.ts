import { ButcherShop, Coordinates } from "../types";

// ✅ 확인된 자바 서버 주소
const JAVA_SERVER_URL = "https://beef-q0ke.onrender.com"; 

export const fetchNearbyShops = async (location: Coordinates): Promise<ButcherShop[]> => {
  try {
    // 📌 위경도를 쿼리스트링으로 정확히 전달 (수원역 좌표가 전달됨)
    const response = await fetch(
      `${JAVA_SERVER_URL}/api/shops?lat=${location.lat}&lng=${location.lng}`
    );

    if (!response.ok) throw new Error("자바 서버 응답 실패");

    const data = await response.json();
    return data; // 이제 가짜 데이터가 아닌 Kakao API 결과가 들어옵니다.
  } catch (error) {
    console.error("정육점 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};
