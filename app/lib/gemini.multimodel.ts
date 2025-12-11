'use server';
// lib/gemini-multimodal.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}

export async function analyzeImage(imageUrl: string, prompt: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const base64Data = await fetchImageAsBase64(imageUrl);
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
        },
    };

    try {
        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } catch (error) {
        console.warn("Gemini 2.5 Flash failed (analyzeImage), attempting fallback to 1.5 Flash:", error);
        try {
            const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await modelFallback.generateContent([prompt, imagePart]);
            return result.response.text();
        } catch (fallbackError) {
            console.error("Gemini API Error (analyzeImage - All models failed):", fallbackError);
            return "Unable to analyze image at this time due to high traffic or service limits. Please try again later.";
        }
    }
}