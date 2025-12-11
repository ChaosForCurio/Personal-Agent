// test-google-search.ts
require('dotenv').config();

import { searchGoogleCustom, searchGoogleNews } from './app/lib/google-search';

async function testGoogleSearch() {
    console.log("=== GOOGLE CUSTOM SEARCH TEST ===\n");

    try {
        console.log("--- Testing General Search ---");
        const results = await searchGoogleCustom("latest trending AI news today");
        console.log(`Results count: ${results.length}`);

        if (results.length > 0) {
            console.log("\nFirst 3 results:");
            results.slice(0, 3).forEach((result: any, index: number) => {
                console.log(`\n${index + 1}. ${result.title}`);
                console.log(`   ${result.snippet}`);
                console.log(`   Link: ${result.link}`);
            });
        }
    } catch (error) {
        console.error("General search failed:", error);
    }

    console.log("\n\n--- Testing News Search ---");
    try {
        const newsResults = await searchGoogleNews("AI news");
        console.log(`News results count: ${newsResults.length}`);

        if (newsResults.length > 0) {
            console.log("\nFirst 3 news items:");
            newsResults.slice(0, 3).forEach((result: any, index: number) => {
                console.log(`\n${index + 1}. ${result.title}`);
                console.log(`   ${result.snippet}`);
                console.log(`   Link: ${result.link}`);
            });
        }
    } catch (error) {
        console.error("News search failed:", error);
    }
}

testGoogleSearch();
