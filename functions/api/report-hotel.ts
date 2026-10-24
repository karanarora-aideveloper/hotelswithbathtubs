// Receives "Report wrong data" submissions from the static site and stores them in D1.
// Needs the D1 binding `DB` and the table in migrations/002_hotel_reports.sql.
interface EventContext {
  request: Request;
  env: { DB?: any; [key: string]: any };
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);

export async function onRequestPost(context: EventContext): Promise<Response> {
  const body = (await context.request.json().catch(() => null)) as any;
  const issues = Array.isArray(body?.issues) ? body.issues.map((i: unknown) => clip(i, 200)).slice(0, 10) : [];

  if (!body?.hotelName || issues.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: JSON_HEADERS });
  }
  if (!context.env?.DB) {
    return new Response(JSON.stringify({ error: 'Reports are not configured' }), { status: 503, headers: JSON_HEADERS });
  }

  try {
    await context.env.DB.prepare(
      `INSERT INTO hotel_reports (hotel_name, hotel_id, city_name, issues, reported_at, ip_country)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      clip(body.hotelName, 200),
      clip(body.hotelId, 100),
      clip(body.cityName, 100),
      JSON.stringify(issues),
      clip(body.reportedAt, 40),
      (context.request.headers.get('cf-ipcountry') || '').toUpperCase()
    ).run();
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: JSON_HEADERS });
  } catch (err) {
    console.error('report-hotel insert failed', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: JSON_HEADERS });
  }
}
