import connectToDatabase from '@/lib/mongodb';
import HotelClick from '@/models/HotelClick';
import HotelClicksClient from '@/components/admin/HotelClicksClient';

export const dynamic = 'force-dynamic';

export default async function AdminHotelClicksPage() {
  await connectToDatabase();

  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Initial SSR fetch
  const [rawClicks, totalFiltered, totalAllTime, todayCount, weekCount] = await Promise.all([
    HotelClick.find({ clickedAt: { $gte: thirtyDaysAgo } }).sort({ clickedAt: -1 }).limit(50).lean(),
    HotelClick.countDocuments({ clickedAt: { $gte: thirtyDaysAgo } }),
    HotelClick.countDocuments(),
    HotelClick.countDocuments({ clickedAt: { $gte: startOfDay } }),
    HotelClick.countDocuments({ clickedAt: { $gte: sevenDaysAgo } }),
  ]);

  const providerBreakdown = await HotelClick.aggregate([
    { $match: { clickedAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$provider', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const topHotels = await HotelClick.aggregate([
    { $match: { clickedAt: { $gte: thirtyDaysAgo } } },
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

  const topCities = await HotelClick.aggregate([
    { $match: { clickedAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$cityName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    { $project: { _id: 0, cityName: '$_id', count: 1 } },
  ]);

  const initialData = {
    clicks: JSON.parse(JSON.stringify(rawClicks)),
    pagination: {
      total: totalFiltered,
      page: 1,
      limit: 50,
      pages: Math.ceil(totalFiltered / 50) || 1,
    },
    summary: {
      totalAllTime,
      totalFiltered,
      todayCount,
      weekCount,
      providerBreakdown: providerBreakdown.map((p) => ({
        provider: p._id || 'unknown',
        count: p.count,
        percentage: totalFiltered > 0 ? Math.round((p.count / totalFiltered) * 100) : 0,
      })),
      topHotels,
      topCities,
    },
  };

  return <HotelClicksClient initialData={initialData} />;
}
