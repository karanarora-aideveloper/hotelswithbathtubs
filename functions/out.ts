interface EventContext {
  request: Request;
  env: Record<string, any>;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}

// CJ affiliate click domains (Booking.com and Trip.com programmes, 24 Nov 2026)
const CJ_DOMAINS = ['jdoqocy.com', 'anrdoezrs.net', 'dpbolvw.net', 'kqzyfj.com', 'tkqlhce.com'];

/**
 * Links are built with sid "xx-{page type}"; swap the "xx" placeholder for the
 * visitor's 2-letter country (lowercase). Only touches CJ links. No personal data.
 */
function fillCjSidCountry(targetUrl: string, countryCode: string | null): string {
  const cc = (countryCode || '').trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(cc) || cc === 'xx' || cc === 't1') return targetUrl;
  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase();
    if (!CJ_DOMAINS.some((d) => host === d || host.endsWith('.' + d))) return targetUrl;
    const sid = parsed.searchParams.get('sid');
    if (sid && sid.startsWith('xx-')) {
      parsed.searchParams.set('sid', cc + sid.slice(2));
      return parsed.toString();
    }
    // Deep-link form: /links/{pid}/type/dlg/sid/xx-{page}/{partner URL}
    return targetUrl.replace(/(\/type\/dlg\/sid\/)xx-/, `$1${cc}-`);
  } catch {
    return targetUrl;
  }
}

/** For CJ links, the partner URL inside must be booking.com or trip.com (no open redirect via CJ). */
function isAllowedCjDestination(parsed: URL): boolean {
  let inner = parsed.searchParams.get('url') || '';
  if (!inner) {
    const m = parsed.pathname.match(/\/type\/dlg\/(?:sid\/[^/]+\/)?(https?:\/\/?.+)$/i);
    inner = m ? m[1].replace(/^(https?:)\/(?!\/)/i, '$1//') + parsed.search : '';
  }
  try {
    const h = new URL(inner).hostname.toLowerCase();
    return ['booking.com', 'trip.com'].some((d) => h === d || h.endsWith('.' + d));
  } catch {
    return false;
  }
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const request = context.request;
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
      'cleartrip.com',
      'easemytrip.com',
      ...CJ_DOMAINS,
    ];

    const isAllowedDomain = ALLOWED_DOMAINS.some(
      (domain) => host === domain || host.endsWith('.' + domain)
    );

    const isCjHost = CJ_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
    if (!isAllowedDomain || (isCjHost && !isAllowedCjDestination(parsed))) {
      return new Response('Invalid redirect destination', { status: 400 });
    }

    // Use 307 temporary redirect with X-Robots-Tag to ensure search bots never index redirect URLs
    return new Response(null, {
      status: 307,
      headers: {
        Location: fillCjSidCountry(targetUrl, request.headers.get('CF-IPCountry')),
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch {
    return new Response('Invalid URL format', { status: 400 });
  }
}

export const onRequestHead = onRequestGet;
