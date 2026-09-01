import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Extract headers injected by Vercel
  const country = request.headers.get('x-vercel-ip-country') || 'India';
  let city = request.headers.get('x-vercel-ip-city') || '';
  
  // Clean up URL encoding if necessary
  if (city) {
    city = decodeURIComponent(city);
  }

  // Next.js automatically maps ISO country codes in `x-vercel-ip-country` (e.g. "IN" -> "India")
  // Wait, x-vercel-ip-country returns the ISO code (e.g., 'US', 'IN').
  // Let's map a few common ones, or default to India.
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
  };

  const fullCountryName = countryMap[country] || 'India';

  return NextResponse.json({
    country: fullCountryName,
    city: city
  });
}
