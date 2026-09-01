import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

// GET /api/admin/review?city=Jaipur&skip=0
// Returns next unreviewed hotel + progress stats
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || '';
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const baseFilter: Record<string, any> = {
      flagged: { $ne: true },
      bathtubConfirmed: { $ne: true }, // not yet confirmed
    };
    if (city) {
      baseFilter.city = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    // Stats (always full-set, not filtered by city)
    const [total, confirmed, flagged, unreviewed, cities] = await Promise.all([
      Hotel.countDocuments({ flagged: { $ne: true } }),
      Hotel.countDocuments({ bathtubConfirmed: true }),
      Hotel.countDocuments({ flagged: true }),
      Hotel.countDocuments({ flagged: { $ne: true }, bathtubConfirmed: { $ne: true } }),
      Hotel.distinct('city', { flagged: { $ne: true } }),
    ]);

    // Unreviewed count for current city filter
    const unreviewedInFilter = city
      ? await Hotel.countDocuments(baseFilter)
      : unreviewed;

    // Next hotel to review
    const hotel = await Hotel.findOne(baseFilter)
      .skip(skip)
      .select('name city country image url agodaUrl bookingUrl amenities crossVerified crossVerifiedSources bathtubConfirmed')
      .lean();

    return NextResponse.json({
      hotel,
      stats: { total, confirmed, flagged, unreviewed, unreviewedInFilter },
      cities: cities.sort(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch review data' }, { status: 500 });
  }
}
