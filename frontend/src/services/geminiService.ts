import type { BeefAnalysisResult } from '../types';

/**
 * AI 서버 주소 설정
 * ⚠️ 404 에러 방지를 위해 /api/cut을 제거하고 AI 서버의 @app.route와 일치시켰습니다.
 */
const AI_API_URL = 'https://ai-server-05pj.onrender.com/analyze/beef'; 

/**
 * 소고기 이미지 분석 요청 함수
 * @param file 업로드할 이미지 파일
 * @param token 로그인 사용자의 JWT 토큰 (선택사항)
 */
export async function analyzeBeefImage(file: File, token: string | null): Promise<BeefAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        // 응답 상태 확인 (404, 500 등 에러 처리)
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI 서버 오류 (${response.status}): ${errorText || '서버 응답 없음'}`);
        }

        const responseText = await response.text();
        console.log("DEBUG: AI 서버 응답 성공", responseText);

        if (!responseText) {
            throw new Error("AI 서버로부터 빈 응답을 받았습니다.");
        }

        // JSON 파싱 후 반환
        return JSON.parse(responseText) as BeefAnalysisResult;

    } catch (e) {
        console.error("analyzeBeefImage 서비스 에러:", e);
        if (e instanceof SyntaxError) {
            throw new Error("서버 응답 형식 오류: JSON이 아닌 데이터가 반환되었습니다.");
        }
        throw e;
    }
}
