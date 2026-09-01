import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

// GET /api/admin/url-fixer?city=Kolkata
// Returns next hotel with a generic MMT hotel-listing URL
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || '';

    const genericFilter: Record<string, any> = {
      url: { $regex: 'hotel-listing', $options: 'i' },
      flagged: { $ne: true },
    };
    if (city) {
      genericFilter.city = new RegExp(
        `^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        'i'
      );
    }

    const [total, fixed, remaining, cities] = await Promise.all([
      Hotel.countDocuments({ url: { $regex: 'makemytrip', $options: 'i' }, flagged: { $ne: true } }),
      Hotel.countDocuments({ url: { $regex: 'hotelId', $options: 'i' }, flagged: { $ne: true } }),
      Hotel.countDocuments({ url: { $regex: 'hotel-listing', $options: 'i' }, flagged: { $ne: true } }),
      Hotel.distinct('city', { url: { $regex: 'hotel-listing', $options: 'i' }, flagged: { $ne: true } }),
    ]);

    const remainingInFilter = city
      ? await Hotel.countDocuments(genericFilter)
      : remaining;

    const hotel = await Hotel.findOne(genericFilter)
      .select('name city country url amenities image')
      .lean();

    return NextResponse.json({
      hotel,
      stats: { total, fixed, remaining, remainingInFilter },
      cities: cities.sort(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH /api/admin/url-fixer
// Body: { hotelId: string, newUrl: string }
export async function PATCH(req: NextRequest) {
  try {
    const { hotelId, newUrl } = await req.json();

    if (!hotelId || !newUrl) {
      return NextResponse.json({ error: 'Missing hotelId or newUrl' }, { status: 400 });
    }

    // Validate it's a real MMT hotel-details URL with a hotelId
    if (!newUrl.includes('makemytrip.com') || !newUrl.includes('hotelId')) {
      return NextResponse.json(
        { error: 'URL must be a makemytrip.com hotel-details URL containing hotelId' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const hotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { url: newUrl },
      { new: true }
    );

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, hotel });
  } catch {
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 });
  }
}

// DELETE /api/admin/url-fixer — skip a hotel (mark as needing manual check later)
// We just advance by skipping in the GET query using skip param
