'use server';

export async function generateImage(prompt: string) {
    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) {
        console.error('FREEPIK_API_KEY is not set');
        throw new Error('FREEPIK_API_KEY is not set');
    }

    try {
        console.log('[Freepik] Generating image with prompt:', prompt.substring(0, 100));
        
        const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
            method: 'POST',
            headers: {
                'x-freepik-api-key': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Freepik] API Error: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Freepik API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[Freepik] Response received successfully');

        if (data.data && data.data.length > 0) {
            return data.data[0];
        }

        throw new Error('No image data received from Freepik');
    } catch (error) {
        console.error('[Freepik] Error generating image:', error);
        throw error;
    }
}
