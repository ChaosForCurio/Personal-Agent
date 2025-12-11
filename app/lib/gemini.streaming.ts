'use server';
// lib/gemini-streaming.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function* streamResponse(prompt: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    try {
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            yield chunk.text();
        }
    } catch (error) {
        console.warn("Gemini 2.0 Flash failed (streamResponse), attempting fallback to 1.5 Flash:", error);
        try {
            const modelFallback = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await modelFallback.generateContentStream(prompt);

            for await (const chunk of result.stream) {
                yield chunk.text();
            }
        } catch (fallbackError) {
            console.error("Gemini Streaming Error (All models failed):", fallbackError);
            yield "Unable to stream response due to service limits. Please try again later.";
        }
    }
}