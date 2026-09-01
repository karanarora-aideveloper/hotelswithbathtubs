import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export const revalidate = 3600;

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get unique country/city combinations. Excludes flagged hotels — a
    // city whose only hotels are all flagged shouldn't appear in the
    // location picker, since selecting it would 404.
    const locations = await Hotel.aggregate([
      { $match: { flagged: { $ne: true } } },
      {
        $group: {
          _id: { country: "$country", city: "$city" }
        }
      },
      {
        $sort: { "_id.country": 1, "_id.city": 1 }
      }
    ]);

    // Format into { "India": ["Udaipur", "Manali"] }
    const locationMap: Record<string, string[]> = {};
    for (const loc of locations) {
      const country = loc._id.country;
      const city = loc._id.city;
      if (!locationMap[country]) {
        locationMap[country] = [];
      }
      locationMap[country].push(city);
    }

    return NextResponse.json(locationMap);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
