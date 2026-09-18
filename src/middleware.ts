import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl;

  // 301: Apex domain to WWW canonical domain redirect
  if (host === 'hotelswithbathtubs.com') {
    return NextResponse.redirect(`https://www.hotelswithbathtubs.com${url.pathname}${url.search}`, 301);
  }

  // 301: Country alias redirects to canonical slugs
  if (url.pathname.startsWith('/united-states')) {
    const newPath = url.pathname.replace('/united-states', '/usa');
    return NextResponse.redirect(new URL(newPath + url.search, req.url), 301);
  }
  if (url.pathname.startsWith('/united-kingdom')) {
    const newPath = url.pathname.replace('/united-kingdom', '/uk');
    return NextResponse.redirect(new URL(newPath + url.search, req.url), 301);
  }
  if (url.pathname.startsWith('/united-arab-emirates')) {
    const newPath = url.pathname.replace('/united-arab-emirates', '/uae');
    return NextResponse.redirect(new URL(newPath + url.search, req.url), 301);
  }

  // Clone request headers and add current pathname
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', url.pathname);

  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
    const basicAuth = req.headers.get('authorization');

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    // Never expose an admin endpoint with predictable fallback credentials.
    if (!adminUser || !adminPass) {
      return new NextResponse('Admin authentication is not configured', { status: 503 });
    }

    const expectedAuth = `Basic ${Buffer.from(`${adminUser}:${adminPass}`).toString('base64')}`;

    if (basicAuth !== expectedAuth) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Run middleware on all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
