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
    const isAllowedDomain =
      host.endsWith('makemytrip.com') ||
      host.endsWith('agoda.com') ||
      host.endsWith('agoda.net') ||
      host.endsWith('booking.com') ||
      host.endsWith('trivago.in') ||
      host.endsWith('trivago.com') ||
      host.endsWith('tripadvisor.in') ||
      host.endsWith('tripadvisor.com') ||
      host.endsWith('tripadvisor.co.in') ||
      host.endsWith('amazon.in') ||
      host.endsWith('nykaa.com') ||
      host.endsWith('earnkaro.com') ||
      host.endsWith('ekaro.in') ||
      host.endsWith('linkredirect.in') ||
      host.endsWith('google.com') ||
      host.endsWith('google.co.in');

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
