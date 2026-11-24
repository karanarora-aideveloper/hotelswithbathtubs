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

/** Partner name from the final destination (inside a CJ wrapper when there is one). */
function partnerOf(parsed: URL): string {
  let host = parsed.hostname.toLowerCase();
  if (CJ_DOMAINS.some((d) => host === d || host.endsWith('.' + d))) {
    try {
      let inner = parsed.searchParams.get('url') || '';
      if (!inner) {
        const m = parsed.pathname.match(/\/type\/dlg\/(?:sid\/[^/]+\/)?(https?:\/\/?.+)$/i);
        inner = m ? m[1].replace(/^(https?:)\/(?!\/)/i, '$1//') : '';
      }
      host = new URL(inner).hostname.toLowerCase();
    } catch {
      /* keep CJ host */
    }
  }
  const map: [RegExp, string][] = [
    [/(^|\.)booking\.com$/, 'booking'], [/(^|\.)agoda\.(com|net)$/, 'agoda'], [/(^|\.)makemytrip\.com$/, 'makemytrip'],
    [/(^|\.)cleartrip\.com$/, 'cleartrip'], [/(^|\.)easemytrip\.com$/, 'easemytrip'], [/(^|\.)expedia\./, 'expedia'],
    [/(^|\.)trip\.com$/, 'trip'], [/(^|\.)airbnb\./, 'airbnb'], [/(^|\.)hotels\.com$/, 'hotels_com'], [/(^|\.)vrbo\.com$/, 'vrbo'],
  ];
  for (const [re, name] of map) if (re.test(host)) return name;
  return 'other';
}

/** Page type from our own path (same buckets as src/lib/events getRouteContext). */
function pageTypeOf(path: string): string {
  const seg = path.split('/').filter(Boolean);
  if (seg.length === 0) return 'home';
  if (seg[0] === 'matchmaker') return 'matchmaker';
  if (seg[0] === 'blog') return 'blog';
  if (seg.length <= 2 || (seg.length === 3 && seg[2] === 'jacuzzi')) return 'destination';
  return 'hotel';
}

const clip = (v: string | null, n: number) => (v || '').slice(0, n);

/**
 * One row per booking click in D1 table out_clicks (binding DB). No IP, no user agent,
 * no referrer, nothing personal: only what the link itself carries plus the visitor's country.
 * Runs after the redirect is sent (waitUntil); a failed write never blocks the visitor.
 */
async function logClick(context: EventContext, parsed: URL, isCj: boolean): Promise<void> {
  const db = context.env?.DB;
  if (!db) return;
  const q = new URL(context.request.url).searchParams;
  const from = clip(q.get('from'), 200);
  const path = from.startsWith('/') ? from.split('?')[0] : '';
  const cc = (context.request.headers.get('CF-IPCountry') || '').toUpperCase();
  try {
    await db
      .prepare(
        'INSERT INTO out_clicks (ts, partner, link_type, page_type, page_path, placement, hotel_name, visitor_country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        new Date().toISOString(),
        partnerOf(parsed),
        isCj ? 'affiliate' : 'direct',
        path ? pageTypeOf(path) : '',
        path,
        clip(q.get('pl'), 30),
        clip(q.get('h'), 120),
        /^[A-Z]{2}$/.test(cc) ? cc : ''
      )
      .run();
  } catch {
    /* logging must never affect the redirect */
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

    // HEAD requests and bots that prefetch are not clicks; log GET only
    if (request.method === 'GET') context.waitUntil(logClick(context, parsed, isCjHost));

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
