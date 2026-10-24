import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HotelClick from '@/models/HotelClick';
import { escapeRegex } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      clickId,
      hotelName,
      cityName,
      countryName,
      provider,
      destinationUrl,
      pagePath,
      referrer,
      deviceCategory,
      userType,
      posthogDistinctId,
      posthogSessionId,
      clickedAt,
    } = body;

    if (!hotelName || !destinationUrl) {
      return NextResponse.json({ error: 'Missing required click attributes' }, { status: 400 });
    }

    const finalClickId = clickId || `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalClickedAt = clickedAt ? new Date(clickedAt) : new Date();
    const finalProvider = (provider || 'unknown').toLowerCase();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';
    const ipCountry = req.headers.get('cf-ipcountry') || '';
    const ipCity = decodeURIComponent(req.headers.get('cf-ipcity') || '');

    await connectToDatabase();

    const clickDoc = await HotelClick.findOneAndUpdate(
      { clickId: finalClickId },
      {
        $setOnInsert: {
          clickId: finalClickId,
          hotelName,
          cityName: cityName || '',
          countryName: countryName || '',
          provider: finalProvider,
          destinationUrl,
          pagePath: pagePath || '',
          referrer: referrer || '',
          deviceCategory: deviceCategory || 'desktop',
          userType: userType || 'new',
          posthogDistinctId: posthogDistinctId || '',
          posthogSessionId: posthogSessionId || '',
          ipCountry,
          ipCity,
          userAgent,
          clickedAt: finalClickedAt,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, clickId: finalClickId, id: clickDoc._id });
  } catch (err: any) {
    console.error('Error in /api/track-click POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const provider = searchParams.get('provider');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const timeRange = searchParams.get('range') || '30d'; // 'today', '7d', '30d', 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const skip = (page - 1) * limit;

    // Date filtering
    const now = new Date();
    let dateFilter: any = {};
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { clickedAt: { $gte: startOfDay } };
    } else if (timeRange === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { clickedAt: { $gte: sevenDaysAgo } };
    } else if (timeRange === '30d') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { clickedAt: { $gte: thirtyDaysAgo } };
    }

    // Build query
    const query: any = { ...dateFilter };
    if (provider && provider !== 'all') {
      query.provider = provider.toLowerCase();
    }
    if (city && city !== 'all') {
      query.cityName = new RegExp(`^${escapeRegex(city)}$`, 'i');
    }
    if (search) {
      const sRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { hotelName: sRegex },
        { cityName: sRegex },
        { countryName: sRegex },
        { destinationUrl: sRegex },
        { clickId: sRegex },
      ];
    }

    // Parallel fetch: Clicks list, Total count, and Metrics
    const [clicks, totalMatching, totalAllTime, todayCount, weekCount] = await Promise.all([
      HotelClick.find(query).sort({ clickedAt: -1 }).skip(skip).limit(limit).lean(),
      HotelClick.countDocuments(query),
      HotelClick.countDocuments(),
      HotelClick.countDocuments({
        clickedAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
      }),
      HotelClick.countDocuments({
        clickedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Provider Breakdown
    const providerBreakdown = await HotelClick.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top Hotels
    const topHotels = await HotelClick.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { hotel: '$hotelName', city: '$cityName', provider: '$provider' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          hotelName: '$_id.hotel',
          cityName: '$_id.city',
          provider: '$_id.provider',
          count: 1,
        },
      },
    ]);

    // Top Cities
    const topCities = await HotelClick.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$cityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, cityName: '$_id', count: 1 } },
    ]);

    return NextResponse.json({
      clicks,
      pagination: {
        total: totalMatching,
        page,
        limit,
        pages: Math.ceil(totalMatching / limit) || 1,
      },
      summary: {
        totalAllTime,
        totalFiltered: totalMatching,
        todayCount,
        weekCount,
        providerBreakdown: providerBreakdown.map((p) => ({
          provider: p._id || 'unknown',
          count: p.count,
          percentage: totalMatching > 0 ? Math.round((p.count / totalMatching) * 100) : 0,
        })),
        topHotels,
        topCities,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/track-click GET:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
