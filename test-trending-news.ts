// test-trending-news.ts
require('dotenv').config();

import { getTrendingAINews } from './app/lib/gemini';

async function testTrendingNews() {
    console.log("=== TESTING TRENDING AI NEWS ===\n");
    console.log("This test will:");
    console.log("1. Fetch news using Google Custom Search");
    console.log("2. Process with Gemini AI");
    console.log("3. Return formatted trending news\n");

    try {
        const news = await getTrendingAINews();
        console.log("SUCCESS! Trending AI News:\n");
        console.log(news);
    } catch (error) {
        console.error("FAILED:", error);
    }
}

testTrendingNews();
