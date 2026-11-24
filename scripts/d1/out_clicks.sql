-- Booking-click log written by functions/out.ts (D1 database hotelswithbathtubs-clicks, binding DB).
-- No IP, no user agent, no referrer: nothing that identifies a visitor.
-- Apply: npx wrangler d1 execute hotelswithbathtubs-clicks --remote --file scripts/d1/out_clicks.sql
CREATE TABLE IF NOT EXISTS out_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,                -- ISO time (UTC)
  partner TEXT NOT NULL,           -- booking, trip, agoda, makemytrip, cleartrip, easemytrip, expedia, airbnb, hotels_com, vrbo, other
  link_type TEXT NOT NULL,         -- affiliate (CJ) or direct
  page_type TEXT,                  -- home, destination, hotel, blog, matchmaker
  page_path TEXT,                  -- our page the click came from, no query string
  placement TEXT,                  -- city_card, hotel_page, matchmaker, blog, other
  hotel_name TEXT,
  visitor_country TEXT             -- 2-letter code from Cloudflare (CF-IPCountry)
);
CREATE INDEX IF NOT EXISTS idx_out_clicks_ts ON out_clicks (ts);
