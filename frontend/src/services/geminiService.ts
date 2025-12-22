// src/services/geminiService.ts
import type { BeefAnalysisResult } from '../types';

// ❌ 기존: 'https://beef-q0ke.onrender.com/api/cut/analyze'
// ✅ 수정: AI 전용 서버 주소로 변경
const AI_API_URL = 'https://ai-server-05pj.onrender.com/api/cut/analyze/beef'; 

/**
 * @param file 업로드할 File 객체
 * @param token JWT 토큰
 * @returns 분석 결과 객체
 */
export async function analyzeBeefImage(file: File, token: string | null): Promise<BeefAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // AI 서버로 요청을 보냅니다.
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI 서버 오류 (${response.status}): ${errorText || response.statusText}`);
        }

        const responseText = await response.text();
        console.log("DEBUG: AI 서버 응답:", responseText);

        if (!responseText) {
            throw new Error("AI 서버로부터 빈 응답을 받았습니다.");
        }

        return JSON.parse(responseText) as BeefAnalysisResult;

    } catch (e) {
        console.error("AI 서비스 에러:", e);
        if (e instanceof SyntaxError) {
            throw new Error("데이터 형식 오류: AI 서버가 올바른 JSON을 반환하지 않았습니다.");
        }
        throw e;
    }
}
