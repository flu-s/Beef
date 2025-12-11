import type { BeefAnalysisResult } from '../types';

// Spring Boot 백엔드의 통합 분석 API 경로
const BACKEND_API_URL = 'http://localhost:8080/api/cut/analyze'; 

/**
 * 소고기 이미지를 백엔드 서버(Spring Boot)로 전송하고 분석 결과를 받아옵니다.
 *
 * @param file 업로드할 File 객체 (MultipartFile로 전송됨)
 * @returns 분석 결과 객체 (BeefAnalysisResult)
 */
export async function analyzeBeefImage(file: File): Promise<BeefAnalysisResult> {
    
    // 1. Multipart/form-data 생성
    const formData = new FormData();
    // 백엔드 CutController의 @RequestParam("file")과 이름(file)을 일치시켜야 합니다.
    formData.append('file', file);

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            // 파일 업로드 시에는 Content-Type 헤더를 설정하지 않습니다.
            // FormData를 사용할 경우 브라우저가 자동으로 multipart/form-data와 boundary를 설정합니다.
            body: formData, 
        });

        // HTTP 상태 코드 확인
        if (!response.ok) {
            // 서버에서 보낸 에러 메시지를 파싱 시도
            const errorText = await response.text();
            
            // ❌ Spring Boot에서 500 에러 발생 시 (AI 서버 통신 실패 등)
            if (response.status >= 500) {
                throw new Error(`백엔드 서버 오류: AI 분석 실패 (상태 코드: ${response.status})`);
            }
            // ❌ 기타 4xx, 5xx 에러
            throw new Error(`분석 API 호출 실패 (상태 코드: ${response.status}, 메시지: ${errorText.substring(0, 100)}...)`);
        }

        const data = await response.json();
        
        // 백엔드 CutDto.java의 필드명과 일치시켜 결과를 매핑합니다.
        // 프론트엔드 타입: BeefAnalysisResult (isBeef, grade, cut, insight, recipes 등)
        // 백엔드 DTO: CutDto (detectedPart, detectedGrade, insight, status)
        
        // ********************************************
        // 💡 중요: 백엔드 CutDto의 필드명을 프론트엔드 타입에 맞게 매핑합니다.
        // ********************************************
        const isBeefDetected = data.status === 'success' && data.detectedPart;

        return {
            // 통신 상태 (status)가 success이면서 부위가 감지되었는지 확인
            isBeef: isBeefDetected,
            
            // 등급/부위는 백엔드에서 받은 값을 사용합니다.
            grade: data.detectedGrade || '판정 불가',
            cut: data.detectedPart || '소고기 아님',
            
            // Insight는 백엔드에서 결합된 최종 Insight를 사용합니다.
            insight: data.insight || '분석 결과를 받지 못했습니다.', 
            
            // 현재 프론트엔드 코드(App.tsx)의 RecipeList와 ShopList는 
            // result 객체의 recipes 필드와 cut 필드를 사용합니다.
            // recipes 필드는 백엔드 CutDto에 없으므로, 여기에 목업 데이터를 추가하거나 
            // 프론트엔드에서 데이터를 가져오는 로직을 추가해야 합니다.
            recipes: [
                { id: 1, title: `${data.detectedPart || '부위'} 레시피 1`, desc: "최적의 숙성 방법." },
                { id: 2, title: `${data.detectedPart || '부위'} 레시피 2`, desc: "특별한 요리법." },
            ],
        };
        
    } catch (error) {
        console.error('Fetch error in analyzeBeefImage:', error);
        // 에러를 다시 던져서 BeefAnalysisApp 컴포넌트의 catch 블록에서 처리하도록 합니다.
        throw error;
    }
}