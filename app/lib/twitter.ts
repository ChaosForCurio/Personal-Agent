'use server';
// lib/twitter.ts
import { TwitterApi } from 'twitter-api-v2';
import { Buffer } from 'buffer';

export async function postToTwitter(content: string, imageBase64?: string) {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    // Check for credentials inside the function to avoid build-time crashes if envs are missing
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
            // Detect mime type
            const match = imageBase64.match(/^data:(image\/\w+);base64,/);
            const mimeType = match ? match[1] : 'image/png';

            // Remove prefix
            const b64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

            // Upload media (v1.1 endpoint, required for v2 tweets with media)
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
    } catch (error) {
        console.error("Error posting tweet:", error);
        throw error;
    }
}