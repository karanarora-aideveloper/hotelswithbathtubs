import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, flagged

    let query: any = {};

    if (status === 'flagged') {
      query.flagged = true;
    } else if (status === 'active') {
      query.flagged = { $ne: true };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    await connectToDatabase();
    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    return NextResponse.json(hotels);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}
