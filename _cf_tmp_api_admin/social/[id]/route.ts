import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();
    
    await connectToDatabase();
    const post = await SocialPost.findByIdAndUpdate(
      resolvedParams.id,
      { status },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
