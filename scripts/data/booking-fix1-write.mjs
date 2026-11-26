#!/usr/bin/env node
/**
 * BOOKING-FIX1 (26 Nov 2026): hotels that carried ANOTHER hotel's Booking.com page get their own,
 * found by Booking.com search (exact hotel name in the top result, looked up 20 s apart).
 * Only clear same-name matches are here; the rest are listed for a person in LINK_AUDIT_2026-11-26.md.
 *
 *   node scripts/data/booking-fix1-write.mjs             # dry run
 *   node scripts/data/booking-fix1-write.mjs --write     # backup to .cache, then write
 *   node scripts/data/booking-fix1-write.mjs --rollback <backup.json> --write
 * Changes bookingUrl, and url only where url held the same wrong page. Only when the old value still matches.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
const WRITE = process.argv.includes('--write');
const rb = process.argv.indexOf('--rollback');
const B = 'https://www.booking.com/hotel/';

const FIXES = [
  { name: 'Bellagio Las Vegas', city: 'Las Vegas', old: `${B}us/flamingo-casino.html`, new: `${B}us/bellagio.html` },
  { name: 'Embassy Suites by Hilton Waikiki Beach Walk', city: 'Honolulu', old: `${B}us/hilton-hawaiian-village.html`, new: `${B}us/embassy-suites-waikiki-beach-walk.html` },
  { name: 'David Dead Sea Resort & Spa', city: 'Dead Sea', old: `${B}il/oasis-spa-club-dead-sea-hotel.html`, new: `${B}il/david-dead-sea-resort-spa.html` },
  { name: 'Hyatt Regency', city: 'Ahmedabad', old: `${B}in/hyatt-regency.html`, new: `${B}in/hyatt-regency-ahmedabad.html` },
  { name: 'Hyatt Regency', city: 'Chandigarh', old: `${B}in/hyatt-regency.html`, new: `${B}in/hyatt-regency-chandigarh.html` },
];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const hotels = client.db().collection('hotels');

if (rb >= 0) {
  const rows = JSON.parse(fs.readFileSync(path.resolve(process.argv[rb + 1]), 'utf8')).rows;
  console.log(`${WRITE ? 'ROLLBACK' : 'DRY RUN rollback'}: ${rows.length} hotels`);
  if (WRITE) for (const r of rows) await hotels.updateOne({ _id: new ObjectId(r._id) }, { $set: { bookingUrl: r.bookingUrl, url: r.url } });
  await client.close();
  process.exit(0);
}

const rows = [];
for (const f of FIXES) {
  const h = await hotels.findOne({ name: f.name, city: f.city, bookingUrl: f.old }, { projection: { bookingUrl: 1, url: 1 } });
  if (!h) { console.log(`skip (not found or already changed): ${f.name}, ${f.city}`); continue; }
  rows.push({ _id: String(h._id), name: f.name, city: f.city, bookingUrl: h.bookingUrl, url: h.url ?? null, newUrl: f.new, urlToo: (h.url || '').split('?')[0] === f.old });
}
for (const r of rows) console.log(`${r.name}, ${r.city}: ${r.bookingUrl.replace(B, '')} -> ${r.newUrl.replace(B, '')}${r.urlToo ? ' (url too)' : ''}`);
console.log(`${WRITE ? 'WRITE' : 'DRY RUN'}: ${rows.length} hotels`);
if (WRITE && rows.length) {
  const bp = path.join(ROOT, '.cache', `booking-fix1-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(bp, JSON.stringify({ rows }, null, 1));
  console.log(`Backup: ${path.relative(ROOT, bp)}`);
  for (const r of rows) {
    const set = { bookingUrl: r.newUrl, ...(r.urlToo ? { url: r.newUrl } : {}) };
    await hotels.updateOne({ _id: new ObjectId(r._id), bookingUrl: r.bookingUrl }, { $set: set });
  }
  console.log('Done.');
}
await client.close();
