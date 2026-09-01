import connectToDatabase from '@/lib/mongodb';
import AffiliateTracker from '@/models/AffiliateTracker';
import AffiliateTrackerClient from '@/components/admin/AffiliateTrackerClient';

export default async function AdminTrackerPage() {
  await connectToDatabase();
  
  const rawTrackers = await AffiliateTracker.find().sort({ createdAt: -1 }).lean();
  const trackers = JSON.parse(JSON.stringify(rawTrackers));

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Strategy & Tracker</h1>
        <p className="text-gray-500 mt-2">Manage applications, track sub-campaigns, and strategize which affiliate networks yield the best economics.</p>
      </div>

      <AffiliateTrackerClient trackers={trackers} />
    </div>
  );
}
