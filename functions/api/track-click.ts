interface EventContext {
  request: Request;
  env: {
    DB?: any;
    [key: string]: any;
  };
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  const request = context.request;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      clickId,
      hotelName,
      cityName,
      countryName,
      provider,
      destinationUrl,
      pagePath,
      referrer,
      deviceCategory,
      userType,
      posthogDistinctId,
      posthogSessionId,
      clickedAt,
    } = body as any;

    if (!hotelName || !destinationUrl) {
      return new Response(JSON.stringify({ error: 'Missing required click attributes' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const finalClickId = clickId || `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const finalClickedAt = clickedAt || new Date().toISOString();
    const finalProvider = (provider || 'unknown').toLowerCase();
    const ipCountry = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    const ipCity = decodeURIComponent(request.headers.get('cf-ipcity') || '');
    const userAgent = request.headers.get('user-agent') || '';

    // Insert into Cloudflare D1 if binding is available
    if (context.env?.DB) {
      await context.env.DB.prepare(`
        INSERT OR IGNORE INTO hotel_clicks (
          click_id, hotel_name, city_name, country_name, provider,
          destination_url, page_path, referrer, device_category,
          user_type, posthog_distinct_id, posthog_session_id,
          ip_country, ip_city, user_agent, clicked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        finalClickId,
        hotelName,
        cityName || '',
        countryName || '',
        finalProvider,
        destinationUrl,
        pagePath || '',
        referrer || '',
        deviceCategory || 'desktop',
        userType || 'new',
        posthogDistinctId || '',
        posthogSessionId || '',
        ipCountry,
        ipCity,
        userAgent,
        finalClickedAt
      ).run();
    }

    return new Response(JSON.stringify({ success: true, clickId: finalClickId }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 1000);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const provider = url.searchParams.get('provider') || '';

  if (!context.env?.DB) {
    return new Response(JSON.stringify({ clicks: [], total: 0, message: 'D1 not bound' }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    let query = 'SELECT * FROM hotel_clicks';
    const params: any[] = [];

    if (provider) {
      query += ' WHERE provider = ?';
      params.push(provider.toLowerCase());
    }

    query += ' ORDER BY clicked_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await context.env.DB.prepare(query).bind(...params).all();
    const countQuery = provider
      ? 'SELECT COUNT(*) as total FROM hotel_clicks WHERE provider = ?'
      : 'SELECT COUNT(*) as total FROM hotel_clicks';
    const countRes = provider
      ? await context.env.DB.prepare(countQuery).bind(provider.toLowerCase()).first()
      : await context.env.DB.prepare(countQuery).first();

    return new Response(
      JSON.stringify({
        clicks: result.results || [],
        total: countRes?.total || 0,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
