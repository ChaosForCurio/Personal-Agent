
// test-serper.ts
// Load environment variables from .env
require('dotenv').config();

import { searchGoogle, searchNews } from './app/lib/serper';

async function testVercelSerper() {
    console.log("Testing Serper API...");

    try {
        console.log("\n--- Testing searchGoogle ---");
        const googleResults = await searchGoogle("latest trending AI news today");
        console.log(`Google Search Results Count: ${googleResults.length}`);
        if (googleResults.length > 0) {
            console.log("First result:", googleResults[0]);
        }
    } catch (error) {
        console.error("searchGoogle failed:", error);
    }

    try {
        console.log("\n--- Testing searchNews ---");
        const newsResults = await searchNews("latest trending AI news today");
        console.log(`News Search Results Count: ${newsResults.length}`);
        if (newsResults.length > 0) {
            console.log("First result:", newsResults[0]);
        }
    } catch (error) {
        console.error("searchNews failed:", error);
    }
}

testVercelSerper();
