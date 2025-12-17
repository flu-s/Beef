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

export interface ButcherShop {
  id: number;
  name: string;
  address: string;
  phone?: string;
  distance: string;
  rating?: number;
  isOpen?: boolean;
  lat: number;
  lng: number;
  mapUrl: string;
}



export type UploadState = 'idle' | 'analyzing' | 'result' | 'error';