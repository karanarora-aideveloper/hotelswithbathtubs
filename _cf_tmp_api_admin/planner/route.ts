import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ScrapeTask from '@/models/ScrapeTask';
import Hotel from '@/models/Hotel';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch planned tasks
    const tasks = await ScrapeTask.find().sort({ createdAt: -1 });
    
    // Aggregate existing hotels by country and city
    const existingLocations = await Hotel.aggregate([
      { $match: { flagged: { $ne: true } } },
      {
        $group: {
          _id: { country: '$country', city: '$city' },
          hotelCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          city: '$_id.city',
          hotelCount: 1
        }
      },
      { $sort: { country: 1, city: 1 } }
    ]);

    return NextResponse.json({ tasks, existingLocations });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch planner data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { city, country } = await req.json();
    await connectToDatabase();
    const task = await ScrapeTask.create({ city, country });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
