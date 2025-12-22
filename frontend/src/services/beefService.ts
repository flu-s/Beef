import type { BeefAnalysisResult } from "../types";

// 백엔드 API 주소
const API_URL = "https://beef-q0ke.onrender.com/api/cut/analyze";

export const analyzeBeefImage = async (imageFile: File, token: string | null): Promise<BeefAnalysisResult> => {
  try {
    // 1. FormData 생성
    const formData = new FormData();
    formData.append("file", imageFile);

    // 2. 헤더 설정 (주의: fetch 사용 시 FormData에는 Content-Type을 직접 설정하면 안 됩니다!)
    const headers: Record<string, string> = {};

    // 토큰이 있을 때만 Authorization 헤더 추가
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // beefService.ts의 헤더 설정 부분
    if (token && token !== "null" && token !== "undefined") { // 안전장치 추가
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. fetch로 요청 보내기 (axios 대신 사용)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers, // Content-Type 없이 보냄 (브라우저가 알아서 'multipart/form-data'로 설정함)
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    // 4. 결과 JSON 파싱 및 반환
    const result: BeefAnalysisResult = await response.json();
    return result;

  } catch (error) {
    console.error("Beef analysis failed:", error);
    throw error;
  }
};
