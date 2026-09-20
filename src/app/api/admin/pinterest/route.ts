import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export async function GET() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      connected: false,
      message: 'No Pinterest access token configured',
    });
  }

  try {
    // Fetch user profile
    const userRes = await fetch(`${PINTEREST_API_BASE}/user_account`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const userData = await userRes.json();

    // Fetch boards
    const boardsRes = await fetch(`${PINTEREST_API_BASE}/boards`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const boardsData = await boardsRes.json();

    // Fetch 10 sample hotels with images
    await connectToDatabase();
    const hotels = await Hotel.find({
      flagged: { $ne: true },
      image: { $regex: '^https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/' }
    })
      .select('name city country image slug')
      .limit(20);

    return NextResponse.json({
      connected: userRes.ok,
      user: userData,
      boards: boardsData.items || [],
      hotels,
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated with Pinterest' }, { status: 401 });
  }

  try {
    const { boardId, title, description, link, imageUrl } = await req.json();

    const pinRes = await fetch(`${PINTEREST_API_BASE}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        title: (title || '').slice(0, 100),
        description: (description || '').slice(0, 500),
        link: link || 'https://www.hotelswithbathtubs.com',
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
      }),
    });

    const pinData = await pinRes.json();

    if (!pinRes.ok) {
      return NextResponse.json({
        success: false,
        error: pinData.message || JSON.stringify(pinData),
        details: pinData,
      }, { status: pinRes.status });
    }

    return NextResponse.json({
      success: true,
      pin: pinData,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
