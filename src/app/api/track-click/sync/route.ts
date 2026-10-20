import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import connectToDatabase from '@/lib/mongodb';
import HotelClick from '@/models/HotelClick';

async function fetchD1Rows(accountId: string, dbId: string): Promise<any[]> {
  const wranglerPath = '/Users/karanarora/Library/Preferences/.wrangler/config/default.toml';
  let token = process.env.CLOUDFLARE_API_TOKEN || '';
  let isExpired = false;

  if (!token && fs.existsSync(wranglerPath)) {
    try {
      const toml = fs.readFileSync(wranglerPath, 'utf8');
      const tokenMatch = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (tokenMatch) token = tokenMatch[1];
      const expMatch = toml.match(/expiration_time\s*=\s*"([^"]+)"/);
      if (expMatch) {
        const expDate = new Date(expMatch[1]);
        if (expDate.getTime() <= Date.now() + 60000) {
          isExpired = true;
        }
      }
    } catch (_) {}
  }

  // 1. If token is valid and not expired, try direct Cloudflare HTTP API first
  if (token && !isExpired) {
    try {
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
      if (d1Data.success && d1Data.result?.[0]?.results) {
        return d1Data.result[0].results;
      }
      console.warn('Direct Cloudflare D1 query returned non-success, attempting wrangler CLI fallback:', d1Data.errors);
    } catch (e: any) {
      console.warn('Direct Cloudflare D1 HTTP query failed, falling back to wrangler CLI:', e.message);
    }
  }

  // 2. Fallback: Run Wrangler CLI which automatically refreshes expired OAuth tokens
  try {
    const cmd = `npx wrangler d1 execute --remote ${dbId} --json --command "SELECT * FROM hotel_clicks ORDER BY clicked_at DESC LIMIT 1000;"`;
    const stdout = execSync(cmd, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
      cwd: process.cwd(),
    });
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed) && parsed[0]?.results) {
      return parsed[0].results;
    }
  } catch (cliErr: any) {
    console.error('Wrangler CLI fallback query failed:', cliErr.message);
    throw new Error('Failed to query Cloudflare D1 via HTTP API & Wrangler CLI: ' + cliErr.message);
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '908d47f7063468485b5ed54fcd962255';
    const dbId = 'ab52ffd5-fcb3-48b2-91f9-968631f8be63'; // hotelswithbathtubs-clicks D1 database

    const rows = await fetchD1Rows(accountId, dbId);
    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Cloudflare D1 is currently empty.', syncedCount: 0 });
    }

    // Upsert into MongoDB
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
