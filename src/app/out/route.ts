import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing redirect URL', { status: 400 });
  }

  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase();

    // Security validation to prevent open redirect vulnerabilities
    const ALLOWED_DOMAINS = [
      'makemytrip.com',
      'trip.com',
      'expedia.com',
      'expedia.co.uk',
      'hotels.com',
      'vrbo.com',
      'airbnb.com',
      'airbnb.co.in',
      'agoda.com',
      'agoda.net',
      'booking.com',
      'trivago.in',
      'trivago.com',
      'tripadvisor.in',
      'tripadvisor.com',
      'tripadvisor.co.in',
      'amazon.in',
      'nykaa.com',
      'earnkaro.com',
      'ekaro.in',
      'linkredirect.in',
      'linksredirect.com',
      'clnk.in',
      'bitli.in',
    ];

    const isAllowedDomain = ALLOWED_DOMAINS.some(
      (domain) => host === domain || host.endsWith('.' + domain)
    );

    if (!isAllowedDomain) {
      return new Response('Invalid redirect destination', { status: 400 });
    }

    // Use 307 temporary redirect with X-Robots-Tag to ensure search bots never index redirect URLs
    const response = NextResponse.redirect(targetUrl, 307);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  } catch {
    return new Response('Invalid URL format', { status: 400 });
  }
}
