// test-serper-debug.ts
require('dotenv').config();

async function testSerper() {
    const apiKey = process.env.SERPER_API_KEY;

    console.log("API Key:", apiKey);

    try {
        const response = await fetch('https://google.serper.dev/news', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: "latest trending AI news today",
                num: 5
            }),
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response body:", text);

    } catch (error) {
        console.error("Error:", error);
    }
}

testSerper();
