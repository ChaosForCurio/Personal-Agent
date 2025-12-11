// test-serper-simple.ts
require('dotenv').config();

async function testSerper() {
    const apiKey = process.env.SERPER_API_KEY;

    console.log("=== SERPER API TEST ===");
    console.log("API Key present:", apiKey ? "YES" : "NO");
    console.log("API Key length:", apiKey ? apiKey.length : 0);
    console.log("API Key preview:", apiKey ? `${apiKey.substring(0, 10)}...` : "N/A");

    if (!apiKey) {
        console.error("ERROR: SERPER_API_KEY not found!");
        return;
    }

    try {
        console.log("\n--- Testing News Search ---");
        const response = await fetch('https://google.serper.dev/news', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: "latest trending AI news today",
                num: 5,
                tbs: "qdr:d"
            }),
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        const data = await response.json();
        console.log("Response data keys:", Object.keys(data));
        console.log("News count:", data.news ? data.news.length : 0);

        if (data.news && data.news.length > 0) {
            console.log("\nFirst news item:");
            console.log("  Title:", data.news[0].title);
            console.log("  Link:", data.news[0].link);
        }

        if (data.error) {
            console.error("API Error:", data.error);
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSerper();
