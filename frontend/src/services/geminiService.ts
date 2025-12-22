import type { BeefAnalysisResult } from '../types';

// AI 서버 주소 (Vercel 환경변수에서 가져오거나 직접 입력)
const AI_API_URL = 'https://ai-server-05pj.onrender.com/analyze/beef'; 

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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI 서버 오류: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        return JSON.parse(responseText) as BeefAnalysisResult;
    } catch (e) {
        console.error("Gemini Service Error:", e);
        throw e;
    }
}
