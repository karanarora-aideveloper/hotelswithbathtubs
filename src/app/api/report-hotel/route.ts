import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  hotelName: String,
  hotelId: String,
  cityName: String,
  issues: [String],
  reportedAt: String,
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelName, hotelId, cityName, issues, reportedAt } = body;

    if (!hotelName || !issues?.length) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();
    await Report.create({ hotelName, hotelId, cityName, issues, reportedAt });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Report submission error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
