
import { postToTwitter } from '@/lib/twitter';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { content, image } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await postToTwitter(content, image);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error posting to Twitter:', error);
    const errorMessage = (error as Error).message || 'Failed to post to Twitter';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
