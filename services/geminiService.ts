import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please check your environment variables.");
    }

    // Using the mandated model: imagen-4.0-generate-001
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No image generated.");
    }

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
