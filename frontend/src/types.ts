export interface Recipe {
  title: string;
  description: string;
  cookingTime: string; // e.g., "20분"
  difficulty: string; // e.g., "쉬움"
}

export interface Shop {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  isOpen: boolean;
}

export interface BeefAnalysisResult {
  isBeef: boolean;
  grade: string; // e.g., "1++", "1+", "1", "2", "3"
  cut: string; // e.g., "Ribeye", "Sirloin"
  recipes: Recipe[];
  // Removed detailed scores and descriptions as requested
}

export type UploadState = 'idle' | 'analyzing' | 'result' | 'error';