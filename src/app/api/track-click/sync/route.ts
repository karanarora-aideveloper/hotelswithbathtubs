import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import connectToDatabase from '@/lib/mongodb';
import HotelClick from '@/models/HotelClick';

export async function POST(req: NextRequest) {
  try {
    // 1. Get Cloudflare OAuth token from local wrangler config or env
    let token = process.env.CLOUDFLARE_API_TOKEN || '';
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '908d47f7063468485b5ed54fcd962255';
    const dbId = 'ab52ffd5-fcb3-48b2-91f9-968631f8be63'; // hotelswithbathtubs-clicks D1 database

    const wranglerPath = '/Users/karanarora/Library/Preferences/.wrangler/config/default.toml';
    if (!token && fs.existsSync(wranglerPath)) {
      try {
        const toml = fs.readFileSync(wranglerPath, 'utf8');
        const tokenMatch = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
        if (tokenMatch) token = tokenMatch[1];
      } catch (_) {}
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No Cloudflare credentials found. Please set CLOUDFLARE_API_TOKEN.' },
        { status: 401 }
      );
    }

    // 2. Query Cloudflare D1
    const d1Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
    const res = await fetch(d1Url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: 'SELECT * FROM hotel_clicks ORDER BY clicked_at DESC LIMIT 1000',
      }),
    });

    const d1Data = await res.json();
    if (!d1Data.success) {
      return NextResponse.json({ error: 'Failed to query Cloudflare D1', details: d1Data.errors }, { status: 500 });
    }

    const rows = d1Data.result?.[0]?.results || [];
    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Cloudflare D1 is currently empty.', syncedCount: 0 });
    }

    // 3. Upsert into MongoDB
    await connectToDatabase();

    const bulkOps = rows.map((r: any) => ({
      updateOne: {
        filter: { clickId: r.click_id },
        update: {
          $setOnInsert: {
            clickId: r.click_id,
            hotelName: r.hotel_name,
            cityName: r.city_name || '',
            countryName: r.country_name || '',
            provider: (r.provider || 'unknown').toLowerCase(),
            destinationUrl: r.destination_url,
            pagePath: r.page_path || '',
            referrer: r.referrer || '',
            deviceCategory: r.device_category || 'desktop',
            userType: r.user_type || 'new',
            posthogDistinctId: r.posthog_distinct_id || '',
            posthogSessionId: r.posthog_session_id || '',
            ipCountry: r.ip_country || '',
            ipCity: r.ip_city || '',
            userAgent: r.user_agent || '',
            clickedAt: r.clicked_at ? new Date(r.clicked_at) : new Date(),
          },
        },
        upsert: true,
      },
    }));

    const mongoResult = await HotelClick.bulkWrite(bulkOps);
    const newUpserts = mongoResult.upsertedCount;

    return NextResponse.json({
      success: true,
      totalInD1: rows.length,
      syncedCount: newUpserts,
      message: `Synced ${rows.length} clicks from Cloudflare Edge D1 (${newUpserts} newly imported).`,
    });
  } catch (err: any) {
    console.error('Error syncing D1 clicks to MongoDB:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
