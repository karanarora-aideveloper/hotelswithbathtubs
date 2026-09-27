import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { flagged } = await req.json();
    
    await connectToDatabase();
    const hotel = await Hotel.findByIdAndUpdate(
      resolvedParams.id,
      { flagged },
      { new: true }
    );

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
}
