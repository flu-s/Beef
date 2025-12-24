import { ButcherShop, Coordinates } from "../types";

const JAVA_SERVER_URL = "https://beef-q0ke.onrender.com"; 

export const fetchNearbyShops = async (location: Coordinates): Promise<ButcherShop[]> => {
  try {
    const response = await fetch(
      `${JAVA_SERVER_URL}/api/shops?lat=${location.lat}&lng=${location.lng}`
    );

    if (!response.ok) throw new Error("자바 서버 응답 실패");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("정육점 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};
