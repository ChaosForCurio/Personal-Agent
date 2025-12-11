'use server';

/**
 * Google Custom Search API implementation
 * Docs: https://developers.google.com/custom-search/v1/overview
 */

export async function searchGoogleCustom(query: string) {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
        console.error('Google Custom Search API credentials missing');
        throw new Error('GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID is not set');
    }

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', cx);
        url.searchParams.set('q', query);
        url.searchParams.set('num', '10'); // Max 10 results per request

        console.log(`[Google Custom Search] Searching for: "${query}"`);

        const response = await fetch(url.toString(), {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Google Custom Search] API Error: ${response.status} - ${errorText}`);
            throw new Error(`Google Custom Search API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`[Google Custom Search] No results found for: "${query}"`);
            return [];
        }

        // Transform to match Serper format
        return data.items.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
        }));

    } catch (error) {
        console.error('[Google Custom Search] Error:', error);
        throw error;
    }
}

export async function searchGoogleNews(query: string) {
    // For news, we'll use the same custom search but with date sorting
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !cx) {
        console.error('Google Custom Search API credentials missing');
        throw new Error('GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID is not set');
    }

    try {
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.set('key', apiKey);
        url.searchParams.set('cx', cx);
        url.searchParams.set('q', query);
        url.searchParams.set('num', '10');
        url.searchParams.set('sort', 'date'); // Sort by date for news
        url.searchParams.set('dateRestrict', 'd1'); // Last 1 day

        console.log(`[Google Custom Search News] Searching for: "${query}"`);

        const response = await fetch(url.toString(), {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Google Custom Search News] API Error: ${response.status} - ${errorText}`);
            throw new Error(`Google Custom Search API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`[Google Custom Search News] No results found for: "${query}"`);
            return [];
        }

        // Transform to match Serper format
        return data.items.map((item: any) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
        }));

    } catch (error) {
        console.error('[Google Custom Search News] Error:', error);
        throw error;
    }
}
