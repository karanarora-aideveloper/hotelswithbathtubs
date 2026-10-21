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

  // Trailing slash normalization: 301 redirect /path/ to /path (except root / and /api)
  if (url.pathname.length > 1 && url.pathname.endsWith('/') && !url.pathname.startsWith('/api')) {
    const target = new URL(context.request.url);
    target.pathname = url.pathname.slice(0, -1);
    return Response.redirect(target.toString(), 301);
  }

  const response = await context.next();

  // If 404 on a 3-segment route (/country/city/hotel-slug), check alternate slug variations
  if (response.status === 404) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 3 && segments[0] !== 'api' && segments[0] !== '_next') {
      const [country, city, hotelSlug] = segments;
      const citySlug = city.toLowerCase();

      // Avoid redirect loops
      if (!url.searchParams.has('__r')) {
        const candidates: string[] = [];

        // Scenario 1: Suffix slug requested (e.g. broncks-apartment-1-torshavn or capella-bangkok)
        // Canonical page may be city-prefixed (torshavn-broncks-apartment-1), bare, or double-suffixed (capella-bangkok-bangkok)
        if (hotelSlug.endsWith(`-${citySlug}`)) {
          const stripped = hotelSlug.slice(0, -(citySlug.length + 1));
          if (stripped) {
            candidates.push(`/${country}/${city}/${citySlug}-${stripped}`);
            candidates.push(`/${country}/${city}/${stripped}`);
          }
          candidates.push(`/${country}/${city}/${hotelSlug}-${citySlug}`);
        }
        // Scenario 2: City-prefixed slug requested (e.g. torshavn-hotel-name)
        // Canonical page may be city-suffixed (hotel-name-torshavn) or bare
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
        } else if (candidates.length > 0) {
          // Fallback if ASSETS fetcher is not available: redirect to first candidate
          const redirectUrl = new URL(candidates[0], url.origin);
          return Response.redirect(redirectUrl.toString(), 301);
        }
      }
    }
  }

  // Attach Edge caching headers for HTML pages:
  // Must revalidate so clients always get latest JS chunk hashes from new deployments
  // Never cache 404/error statuses or use aggressive s-maxage on HTML (prevents ChunkLoadError)
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
