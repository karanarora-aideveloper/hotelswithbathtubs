import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { revalidatePath } from 'next/cache';

async function updateAffiliates(formData: FormData) {
  'use server';
  
  await connectToDatabase();
  
  const makemytrip = formData.get('makemytrip') as string;
  const earnkaro = formData.get('earnkaro') as string;
  const agoda = formData.get('agoda') as string;
  const booking = formData.get('booking') as string;

  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }

  settings.affiliateIds = {
    makemytrip,
    earnkaro,
    agoda,
    booking
  };

  await settings.save();
  revalidatePath('/admin/affiliates');
}

export default async function AdminAffiliatesPage() {
  await connectToDatabase();
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Monetization & Tracking</h1>
        <p className="text-gray-500 mt-2">Manage your global affiliate tracking IDs for EarnKaro, MakeMyTrip, Agoda, and Booking.com.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form action={updateAffiliates} className="space-y-6">
            {/* EarnKaro Section */}
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-amber-950">EarnKaro Referral / User ID</label>
                <span className="text-2xs font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  Recommended for India
                </span>
              </div>
              <input 
                name="earnkaro"
                type="text" 
                defaultValue={settings.affiliateIds?.earnkaro || ''}
                className="w-full px-4 py-2 bg-white border border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
                placeholder="e.g. 1972736 or your EarnKaro Referral Code"
              />
              <p className="text-xs text-amber-800/90 mt-2 leading-relaxed">
                When provided, all MakeMyTrip & Indian retail outbound clicks will automatically route via EarnKaro Profit Links (<code>https://ekaro.in/...</code>) earning you 3%–7% cash commission per booking.
              </p>
            </div>

            {/* Direct MakeMyTrip Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Direct MakeMyTrip Affiliate ID (Optional)</label>
              <input 
                name="makemytrip"
                type="text" 
                defaultValue={settings.affiliateIds?.makemytrip || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                placeholder="e.g. MMT-AFF-98765"
              />
              <p className="text-xs text-gray-500 mt-1">If you have a direct MMT affiliate contract, enter your ID here (overrides EarnKaro for MMT).</p>
            </div>

            {/* Agoda Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Agoda Affiliate CID</label>
              <input 
                name="agoda"
                type="text" 
                defaultValue={settings.affiliateIds?.agoda || '1972736'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                placeholder="e.g. 1972736"
              />
              <p className="text-xs text-gray-500 mt-1">Automatically appended as <code>?cid=...</code> on all Agoda booking links.</p>
            </div>

            {/* Booking.com Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Booking.com Affiliate AID</label>
              <input 
                name="booking"
                type="text" 
                defaultValue={settings.affiliateIds?.booking || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                placeholder="e.g. 123456"
              />
              <p className="text-xs text-gray-500 mt-1">Your unique AID for tracking international and luxury hotel bookings on Booking.com.</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm">
                Save Monetization Settings
              </button>
            </div>
          </form>
        </div>

        {/* Quick EarnKaro Guide Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 text-xs text-gray-600">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <span>💡</span> EarnKaro Profit Link Guide
          </h3>
          <p className="leading-relaxed">
            <strong>How it works:</strong> EarnKaro aggregates affiliate commissions from MakeMyTrip, Goibibo, Amazon, Nykaa, and 150+ stores.
          </p>
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="font-semibold text-gray-800">Where do you find your EarnKaro ID?</div>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              <li>Log in to <a href="https://earnkaro.com" target="_blank" rel="noopener noreferrer" className="text-accent underline font-medium">EarnKaro.com</a></li>
              <li>Go to <strong>My Profile / Refer &amp; Earn</strong></li>
              <li>Copy your <strong>Referral Code / User ID</strong></li>
              <li>Paste it here and click Save!</li>
            </ol>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
            <span className="font-bold">✓ Live Tracking:</span> All hotel card clicks with MakeMyTrip automatically earn you real-time commissions.
          </div>
        </div>
      </div>
    </div>
  );
}
