// app/api/post-twitter/route.ts
import { NextResponse } from 'next/server';
import { postToTwitter } from '@/lib/twitter';

export async function POST(request: Request) {
    try {
        const { content } = await request.json();
        const result = await postToTwitter(content);
        return NextResponse.json({ success: true, data: result });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to post to X' }, { status: 500 });
    }
}