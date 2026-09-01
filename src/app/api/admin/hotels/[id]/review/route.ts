import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { action } = await req.json(); // 'confirm' | 'flag'

    if (!['confirm', 'flag'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await connectToDatabase();

    const update =
      action === 'confirm'
        ? { bathtubConfirmed: true }
        : { flagged: true, bathtubConfirmed: false };

    const hotel = await Hotel.findByIdAndUpdate(resolvedParams.id, update, { new: true });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch {
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
}
