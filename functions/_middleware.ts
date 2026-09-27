interface EventContext {
  request: Request;
  next: () => Promise<Response>;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  // Canonical domain enforcement: 301 permanent redirect apex domain to www
  if (host === 'hotelswithbathtubs.com') {
    url.hostname = 'www.hotelswithbathtubs.com';
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();

  // If 404 on a 3-segment route (/country/city/hotel-slug), check if appending -city resolves it
  if (response.status === 404) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 3 && segments[0] !== 'api' && segments[0] !== '_next') {
      const [country, city, hotelSlug] = segments;
      const citySlug = city.toLowerCase();
      if (!hotelSlug.endsWith(`-${citySlug}`)) {
        url.pathname = `/${country}/${city}/${hotelSlug}-${citySlug}`;
        return Response.redirect(url.toString(), 301);
      }
    }
  }

  // Attach Edge CDN caching headers for HTML pages (sub-50ms TTFB worldwide)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set(
      'Cache-Control',
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
}
