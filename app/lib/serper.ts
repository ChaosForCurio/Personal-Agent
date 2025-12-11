'use server';

import { searchGoogleCustom, searchGoogleNews } from './google-search';

/**
 * Primary search function using Google Custom Search API
 * Falls back to Serper if Google Search fails
 */
export async function searchGoogle(query: string, timeFilter: string = 'qdr:d') {
    // Try Google Custom Search first
    try {
        console.log('[Search] Using Google Custom Search API');
        return await searchGoogleCustom(query);
    } catch (googleError) {
        console.warn('[Search] Google Custom Search failed, trying Serper fallback:', googleError);

        // Fallback to Serper
        try {
            return await searchGoogleSerper(query, timeFilter);
        } catch (serperError) {
            console.error('[Search] Both Google Custom Search and Serper failed');
            throw new Error('All search providers failed');
        }
    }
}

/**
 * News search function using Google Custom Search API
 * Falls back to Serper if Google Search fails
 */
export async function searchNews(query: string) {
    // Try Google Custom Search News first
    try {
        console.log('[Search] Using Google Custom Search API for news');
        return await searchGoogleNews(query);
    } catch (googleError) {
        console.warn('[Search] Google Custom Search News failed, trying Serper fallback:', googleError);

        // Fallback to Serper
        try {
            return await searchNewsSerper(query);
        } catch (serperError) {
            console.error('[Search] Both Google Custom Search and Serper news failed');
            throw new Error('All news search providers failed');
        }
    }
}

// Serper implementations (as backup)
async function searchGoogleSerper(query: string, timeFilter: string = 'qdr:d') {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.error("SERPER_API_KEY is missing from environment variables.");
        throw new Error('SERPER_API_KEY is not set');
    }

    try {
        console.log(`[Serper] Searching for query: "${query}" with timeFilter: "${timeFilter}"`);
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                num: 10,
                tbs: timeFilter
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Serper] API Error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.organic || data.organic.length === 0) {
            console.warn(`[Serper] No organic results found for query: "${query}". Response:`, JSON.stringify(data));
            return [];
        }

        return data.organic;
    } catch (error) {
        console.error("[Serper] Network or parsing error:", error);
        throw error;
    }
}

async function searchNewsSerper(query: string) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.error("SERPER_API_KEY is missing from environment variables.");
        throw new Error('SERPER_API_KEY is not set');
    }

    try {
        console.log(`[Serper News] Searching for query: "${query}"`);
        const response = await fetch('https://google.serper.dev/news', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                num: 10,
                tbs: "qdr:d" // Default to past 24 hours for news
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Serper News] API Error: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.news || data.news.length === 0) {
            console.warn(`[Serper News] No news results found for query: "${query}". Response:`, JSON.stringify(data));
            return [];
        }

        return data.news;
    } catch (error) {
        console.error("[Serper News] Network or parsing error:", error);
        throw error;
    }
}
