import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Extract headers injected by the edge platform (Cloudflare Pages / legacy Vercel headers)
  const headerCountry =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    '';

  const hasCountry = Boolean(headerCountry && headerCountry.trim() !== '');
  const countryCode = hasCountry ? headerCountry.trim().toUpperCase() : 'XX';
  
  let city = request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity') || '';
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
    'ES': 'Spain',
    'DE': 'Germany',
    'MX': 'Mexico',
    'TR': 'Turkey',
    'MV': 'Maldives',
    'ZA': 'South Africa',
    'PT': 'Portugal',
    'AT': 'Austria',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
  };

  const isIndia = countryCode === 'IN';
  const isUS = countryCode === 'US';
  const fullCountryName = countryCode === 'XX' ? '' : (countryMap[countryCode] || countryCode);

  return NextResponse.json({
    countryCode,
    country: fullCountryName,
    city,
    isIndia,
    isUS,
  });
}
