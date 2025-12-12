export interface Recipe {
    title: string;
    description: string;
    thumbnailUrl: string;
}

export interface BeefAnalysisResult {
    status: 'success' | 'error';
    detectedPart: string;
    detectedGrade: string;
    insight: string;
    memberId: string | null;
    isBeef: boolean;
    recipes: Recipe[];
}

export interface BeefAnalysisResult {
  isBeef: boolean;
  grade: string; // e.g., "1++", "1+", "1", "2", "3"
  cut: string; // e.g., "Ribeye", "Sirloin"
  recipes: Recipe[];
  // Removed detailed scores and descriptions as requested
}

export type UploadState = 'idle' | 'analyzing' | 'result' | 'error';