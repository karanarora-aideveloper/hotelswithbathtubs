import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Extract headers injected by Vercel or Cloudflare
  const countryCode = (
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    'US'
  ).toUpperCase();
  
  let city = request.headers.get('x-vercel-ip-city') || '';
  if (city) {
    city = decodeURIComponent(city);
  }

  const countryMap: Record<string, string> = {
    'IN': 'India',
    'US': 'USA',
    'GB': 'UK',
    'AE': 'UAE',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'JP': 'Japan',
    'FR': 'France',
    'ID': 'Indonesia',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'GR': 'Greece',
    'CH': 'Switzerland',
    'CA': 'Canada',
    'AU': 'Australia',
  };

  const isIndia = countryCode === 'IN';
  const isUS = countryCode === 'US';
  const fullCountryName = countryMap[countryCode] || (isIndia ? 'India' : 'USA');

  return NextResponse.json({
    countryCode,
    country: fullCountryName,
    city,
    isIndia,
    isUS,
  });
}
