import { cityToCountry, CITY_ALIASES } from './cityMap';

interface EventContext {
  request: Request;
  env?: Record<string, any>;
  next: () => Promise<Response>;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  // Canonical domain enforcement: 301 permanent redirect apex domain to www
  if (host === 'hotelswithbathtubs.com') {
    const target = new URL(context.request.url);
    target.protocol = 'https:';
    target.hostname = 'www.hotelswithbathtubs.com';
    target.port = '';
    if (target.pathname.length > 1 && target.pathname.endsWith('/') && !target.pathname.startsWith('/api')) {
      target.pathname = target.pathname.slice(0, -1);
    }
    return Response.redirect(target.toString(), 301);
  }

  // Canonical blog redirects
  if (url.pathname === '/blog/kolkata-hotels-with-bathtub-couples-guide' || url.pathname === '/blog/kolkata-hotels-with-bathtub-couples-guide/') {
    return Response.redirect(new URL('/blog/kolkata-jacuzzi-hotels-romantic-staycation', url.origin).toString(), 301);
  }

  // Case normalization: 301 redirect any URL with uppercase letters to lowercase in a single hop
  if (/[A-Z]/.test(url.pathname) && !url.pathname.startsWith('/api')) {
    const target = new URL(context.request.url);
    let newPath = url.pathname.toLowerCase();
    if (newPath.length > 1 && newPath.endsWith('/')) {
      newPath = newPath.slice(0, -1);
    }
    const segs = newPath.split('/').filter(Boolean);
    if (segs.length === 1) {
      const alias = CITY_ALIASES[segs[0]];
      if (alias) {
        newPath = `/${alias.country}/${alias.city}`;
      } else if (cityToCountry[segs[0]]) {
        newPath = `/${cityToCountry[segs[0]]}/${segs[0]}`;
      }
    } else if (segs.length === 2) {
      const alias = CITY_ALIASES[segs[1]];
      if (alias) {
        newPath = `/${alias.country}/${alias.city}`;
      }
    }
    target.pathname = newPath;
    return Response.redirect(target.toString(), 301);
  }

  // Trailing slash normalization: 301 redirect /path/ to canonical /path (except root / and /api)
  if (url.pathname.length > 1 && url.pathname.endsWith('/') && !url.pathname.startsWith('/api')) {
    const target = new URL(context.request.url);
    let newPath = url.pathname.slice(0, -1);
    const segs = newPath.split('/').filter(Boolean);
    if (segs.length === 1) {
      const alias = CITY_ALIASES[segs[0]];
      if (alias) {
        newPath = `/${alias.country}/${alias.city}`;
      } else if (cityToCountry[segs[0]]) {
        newPath = `/${cityToCountry[segs[0]]}/${segs[0]}`;
      }
    } else if (segs.length === 2) {
      const alias = CITY_ALIASES[segs[1]];
      if (alias) {
        newPath = `/${alias.country}/${alias.city}`;
      }
    }
    target.pathname = newPath;
    return Response.redirect(target.toString(), 301);
  }

  // Answer Next.js segment prefetch trees (__next.*) with an empty-body 404
  // Prevents serving the 66 KB HTML 404 page repeatedly on every card prefetch
  if (url.pathname.includes('/__next.')) {
    return new Response(null, {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'content-type': 'text/plain',
        'cache-control': 'public, max-age=86400',
      },
    });
  }

  const response = await context.next();

  // On 404: check legacy naked city URLs, aliases, and 3-part hotel slugs
  if (response.status === 404) {
    const segments = url.pathname.split('/').filter(Boolean);

    // 1-segment route (e.g. /kochi, /bengaluru, /paris)
    if (segments.length === 1 && segments[0] !== 'api' && segments[0] !== '_next') {
      const slug = segments[0].toLowerCase();
      if (CITY_ALIASES[slug]) {
        const alias = CITY_ALIASES[slug];
        return Response.redirect(new URL(`/${alias.country}/${alias.city}`, url.origin).toString(), 301);
      }
      if (cityToCountry[slug]) {
        const country = cityToCountry[slug];
        return Response.redirect(new URL(`/${country}/${slug}`, url.origin).toString(), 301);
      }
    }

    // 2-segment route with city alias (e.g. /india/bengaluru -> /india/bangalore)
    if (segments.length === 2 && segments[0] !== 'api' && segments[0] !== '_next') {
      const [country, city] = segments;
      const cityLower = city.toLowerCase();
      if (CITY_ALIASES[cityLower]) {
        const alias = CITY_ALIASES[cityLower];
        return Response.redirect(new URL(`/${alias.country}/${alias.city}`, url.origin).toString(), 301);
      }
    }

    // 3-segment route (/country/city/hotel-slug), check alternate slug variations
    if (segments.length === 3 && segments[0] !== 'api' && segments[0] !== '_next') {
      const [country, city, hotelSlug] = segments;
      const citySlug = city.toLowerCase();

      // Avoid redirect loops
      if (!url.searchParams.has('__r')) {
        const candidates: string[] = [];

        // Scenario 1: Suffix slug requested (e.g. broncks-apartment-1-torshavn or capella-bangkok)
        if (hotelSlug.endsWith(`-${citySlug}`)) {
          const stripped = hotelSlug.slice(0, -(citySlug.length + 1));
          if (stripped) {
            candidates.push(`/${country}/${city}/${citySlug}-${stripped}`);
            candidates.push(`/${country}/${city}/${stripped}`);
          }
          candidates.push(`/${country}/${city}/${hotelSlug}-${citySlug}`);
        }
        // Scenario 2: City-prefixed slug requested (e.g. torshavn-hotel-name)
        else if (hotelSlug.startsWith(`${citySlug}-`)) {
          const stripped = hotelSlug.slice(citySlug.length + 1);
          if (stripped) {
            candidates.push(`/${country}/${city}/${stripped}-${citySlug}`);
            candidates.push(`/${country}/${city}/${stripped}`);
          }
        }
        // Scenario 3: Bare slug without city (e.g. broncks-apartment-1)
        else {
          candidates.push(`/${country}/${city}/${hotelSlug}-${citySlug}`);
          candidates.push(`/${country}/${city}/${citySlug}-${hotelSlug}`);
          candidates.push(`/${country}/${city}/${hotelSlug}-${citySlug}-${citySlug}`);
        }

        // In Cloudflare Pages, context.env.ASSETS can test if candidate file exists
        if (context.env?.ASSETS && typeof context.env.ASSETS.fetch === 'function') {
          for (const candidate of candidates) {
            try {
              const testUrl = new URL(candidate, url.origin);
              const testRes = await context.env.ASSETS.fetch(new Request(testUrl.toString(), { method: 'GET' }));
              if (testRes.status === 200) {
                return Response.redirect(testUrl.toString(), 301);
              }
            } catch {
              // Ignore and check next candidate
            }
          }
        }
      }
    }
  }

  // Attach Edge caching headers for HTML pages:
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    // Protect against 304/204 response body construction errors in Cloudflare Workers
    if (response.status === 304 || response.status === 204) {
      return response;
    }

    const newHeaders = new Headers(response.headers);
    if (response.status === 200) {
      newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      newHeaders.set('Cache-Control', 'no-store');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
}
