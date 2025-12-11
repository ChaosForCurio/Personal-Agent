'use server';

export async function generateImage(prompt: string) {
    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) {
        throw new Error('FREEPIK_API_KEY is not set');
    }

    const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
        method: 'POST',
        headers: {
            'x-freepik-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            // Using a reliable model if possible, or letting it default. 
            // Based on docs, specifying model usually works. 
            // Let's try 'flux-realism' or just standard if not sure. 
            // I'll leave model unspecified to use default or 'mystic' if it's the premium key.
            // But user said 'FPSX...' which looks like a standard key.
            // Let's stick to simple prompt only first.
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Freepik API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    // Response format usually contains an accumulation of base64 or a url.
    // Checking typical valid response... 
    // Expecting { data: [{ url: "...", base64: "..." }] }

    if (data.data && data.data.length > 0) {
        return data.data[0]; // Returns object with url/base64
    }

    throw new Error('No image data received from Freepik');
}
