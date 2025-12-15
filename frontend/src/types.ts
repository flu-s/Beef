export interface Recipe {
    title: string;
    description: string;
    thumbnailUrl: string;
}

export interface BeefAnalysisResult {
    // 1. 서버 기본 응답 필드
    status: 'success' | 'error';
    insight: string;
    memberId: string | null;
    isBeef: boolean;

    detectedPart: string;
    detectedGrade: string;

    partConfidence: string;
    gradeConfidence: string;

    cut: string;
    grade: string;

    recipes: Recipe[];
}


export type UploadState = 'idle' | 'analyzing' | 'result' | 'error';