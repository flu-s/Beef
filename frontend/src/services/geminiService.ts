// geminiService.ts (수정된 전체 코드)
import type { BeefAnalysisResult } from '../types'; // 실제 경로에 맞게 수정해주세요

const BACKEND_API_URL = 'http://localhost:8080/api/cut/analyze';

/**
 * 소고기 이미지를 백엔드 서버로 전송하고 분석 결과를 받습니다.
 * 비회원 사용을 위해 토큰은 선택 사항(nullable)입니다.
 * * @param file 업로드할 File 객체
 * @param token JWT 토큰 (로그인 사용자만 해당, 비회원인 경우 null)
 * @returns 분석 결과 객체 (BeefAnalysisResult)
 */
export async function analyzeBeefImage(file: File, token: string | null): Promise<BeefAnalysisResult> {

    // 1. Multipart/form-data 생성
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: headers, // 조건부로 설정된 headers 객체 사용
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `API 호출 실패: ${response.status} ${response.statusText}`;

            if (response.status === 401) {
                errorMessage = "인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.";
            } else if (response.status === 500 && errorText) {
                 // 백엔드에서 500 Internal Server Error 시, 에러 메시지가 있다면 사용
                 errorMessage = `서버 내부 오류: ${errorText}`;
            } else {
                 errorMessage = errorText || errorMessage; // 백엔드에서 전달된 상세 에러 메시지를 사용
            }

            throw new Error(errorMessage);
        }

        // ⭐⭐⭐ 핵심 수정 1: response.json() 호출 전 응답 텍스트를 먼저 로깅 (디버깅용) ⭐⭐⭐
        // JSON 파싱 오류가 발생하면 여기서 멈춥니다.
        const responseText = await response.text();
        console.log("DEBUG: Backend response text:", responseText);

        if (!responseText) {
            throw new Error("서버로부터 빈 응답을 받았습니다. (분석 데이터 없음)");
        }

        // ⭐⭐⭐ 핵심 수정 2: 텍스트를 JSON으로 변환 ⭐⭐⭐
        const analysisResult: BeefAnalysisResult = JSON.parse(responseText);
        return analysisResult;

    } catch (e) {
        console.error("Error in analyzeBeefImage service:", e);

        // ⭐⭐⭐ 핵심 수정 3: JSON 파싱 오류를 명확히 알림 ⭐⭐⭐
        if (e instanceof SyntaxError) {
             // 이 에러는 백엔드가 JSON 대신 HTML/빈 문자열 등을 반환했을 때 발생합니다.
             throw new Error("분석 응답 처리 중 데이터 형식 오류: 서버에서 예상치 못한 데이터가 왔습니다.");
        }

        throw e;
    }
}