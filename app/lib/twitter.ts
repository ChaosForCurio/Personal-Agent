'use server';
// lib/twitter.ts
import { TwitterApi } from 'twitter-api-v2';
import { Buffer } from 'buffer';

export async function postToTwitter(content: string, imageBase64?: string) {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.error("Missing Twitter credentials", { appKey: !!appKey, appSecret: !!appSecret, accessToken: !!accessToken, accessSecret: !!accessSecret });
        throw new Error("Missing Twitter API credentials");
    }

    const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });

    const rwClient = client.readWrite;

    let mediaId: string | undefined = undefined;

    if (imageBase64) {
        try {
            const match = imageBase64.match(/^data:(image\/\w+);base64,/);
            const mimeType = match ? match[1] : 'image/png';
            const b64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const mediaIdStr = await rwClient.v1.uploadMedia(Buffer.from(b64, 'base64'), { mimeType });
            mediaId = mediaIdStr;
        } catch (error) {
            console.error("Error uploading media to Twitter:", error);
            throw new Error("Failed to upload image to Twitter: " + (error instanceof Error ? error.message : String(error)));
        }
    }

    try {
        if (mediaId) {
            return await rwClient.v2.tweet({
                text: content,
                media: { media_ids: [mediaId] }
            });
        } else {
            return await rwClient.v2.tweet(content);
        }
    } catch (error: unknown) {
        console.error("Error posting tweet:", error);
        if (error && typeof error === 'object' && 'data' in error) {
            console.error("Twitter API response data:", JSON.stringify((error as { data: unknown }).data, null, 2));
        }
        if (error && typeof error === 'object' && 'code' in error) {
            console.error("Twitter API error code:", (error as { code: unknown }).code);
        }
        throw error;
    }
}

export async function getXPostsPreview(query: string) {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.error("Missing Twitter credentials for search");
        throw new Error("Missing Twitter API credentials");
    }

    try {
        const client = new TwitterApi({
            appKey,
            appSecret,
            accessToken,
            accessSecret,
        });

        const roClient = client.readOnly;

        console.log(`[Twitter] Searching for posts about: "${query}"`);

        const tweets = await roClient.v2.search({
            query: query,
            max_results: 10,
            'tweet.fields': 'created_at,public_metrics,author_id',
            'user.fields': 'username,name,verified',
            expansions: 'author_id',
        });

        if (!tweets.data || tweets.data.length === 0) {
            console.warn(`[Twitter] No posts found for query: "${query}"`);
            return [];
        }

        const userMap = new Map();
        if (tweets.includes?.users) {
            tweets.includes.users.forEach(user => {
                userMap.set(user.id, user);
            });
        }

        return tweets.data.map(tweet => {
            const author = userMap.get(tweet.author_id);
            return {
                id: tweet.id,
                text: tweet.text,
                created_at: tweet.created_at,
                author: {
                    id: tweet.author_id,
                    name: author?.name || 'Unknown',
                    username: author?.username || 'unknown',
                    verified: author?.verified || false,
                },
                metrics: {
                    likes: tweet.public_metrics?.like_count || 0,
                    retweets: tweet.public_metrics?.retweet_count || 0,
                    replies: tweet.public_metrics?.reply_count || 0,
                    impressions: tweet.public_metrics?.impression_count || 0,
                }
            };
        });
    } catch (error) {
        console.error('[Twitter] Error searching posts:', error);
        throw error;
    }
}