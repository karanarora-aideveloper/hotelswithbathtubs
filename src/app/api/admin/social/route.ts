import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await SocialPost.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { platform, content } = await req.json();
    await connectToDatabase();
    const post = await SocialPost.create({ platform, content });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 });
  }
}
