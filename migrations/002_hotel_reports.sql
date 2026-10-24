-- Table for "Report wrong data" submissions (served by functions/api/report-hotel.ts).
-- Apply once:  npx wrangler d1 execute <DB_NAME> --remote --file=migrations/002_hotel_reports.sql
CREATE TABLE IF NOT EXISTS hotel_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_name TEXT NOT NULL,
  hotel_id TEXT,
  city_name TEXT,
  issues TEXT NOT NULL,
  reported_at TEXT,
  ip_country TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hotel_reports_created ON hotel_reports (created_at);
