interface EventContext {
  request: Request;
  env: Record<string, any>;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const request = context.request;

  // Cloudflare provides cf-ipcountry and cf-ipcity headers natively
  const headerCountry =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    '';

  const hasCountry = Boolean(headerCountry && headerCountry.trim() !== '');
  const countryCode = hasCountry ? headerCountry.trim().toUpperCase() : 'XX';

  let city = request.headers.get('cf-ipcity') || request.headers.get('x-vercel-ip-city') || '';
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

  return new Response(
    JSON.stringify({
      countryCode,
      country: fullCountryName,
      city,
      isIndia,
      isUS,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
