import { GoogleGenAI, Type } from "@google/genai";
import type { BeefAnalysisResult } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeBeefImage = async (file: File): Promise<BeefAnalysisResult> => {
  try {
    // Correct way to access environment variables in Vite
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Check your .env file.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Analyze this image strictly as a professional meat sommelier. 
      Determine if this image contains raw beef.
      If it is NOT raw beef, set "isBeef" to false and fill other fields with placeholders.
      If it IS beef, estimate the Korean Beef Grading System grade (1++, 1+, 1, 2, 3), identify the cut (e.g., Deungsim/Ribeye, Ansim/Tenderloin, Galbi/Ribs), and rate various qualities on a scale of 1-10.
      
      Provide a sophisticated description and a cooking recommendation.
      
      The output must be valid JSON matching the schema provided.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isBeef: { type: Type.BOOLEAN },
            grade: { type: Type.STRING, description: "Korean grade: 1++, 1+, 1, 2, or 3" },
            cut: { type: Type.STRING, description: "Name of the cut in Korean (English)" },
            scores: {
              type: Type.OBJECT,
              properties: {
                marbling: { type: Type.NUMBER, description: "Score 1-10" },
                color: { type: Type.NUMBER, description: "Score 1-10" },
                texture: { type: Type.NUMBER, description: "Score 1-10" },
                freshness: { type: Type.NUMBER, description: "Score 1-10" },
                fatDistribution: { type: Type.NUMBER, description: "Score 1-10" },
              },
              required: ["marbling", "color", "texture", "freshness", "fatDistribution"],
            },
            description: { type: Type.STRING, description: "A short professional evaluation of the meat quality." },
            cookingRecommendation: { type: Type.STRING, description: "Best way to cook this specific piece." },
            totalScore: { type: Type.NUMBER, description: "Overall quality score out of 100" },
          },
          required: ["isBeef", "grade", "cut", "scores", "description", "cookingRecommendation", "totalScore"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as BeefAnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing beef:", error);
    throw error;
  }
};