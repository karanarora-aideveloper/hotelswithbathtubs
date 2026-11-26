#!/usr/bin/env node
/**
 * TRIP-FIX1 (26 Nov 2026, founder: "fix those links instead of removing them").
 * 190 hotels had tripUrl = trip.com/hotels/detail/?hotelId=<Expedia id>; Trip.com numbers its hotels
 * differently, so those links open another hotel or a 404. This replaces each with the Trip.com id
 * found by Trip.com's own search box, only when the match passes a name check and a distance check.
 *
 *   node scripts/data/trip-fix-write.mjs <lookup.json>              # dry run: plan + unmatched list
 *   node scripts/data/trip-fix-write.mjs <lookup.json> --write      # backup, then write
 *   node scripts/data/trip-fix-write.mjs --rollback <backup.json> [--write]
 *
 * <lookup.json>: { "<hotel _id>": { q, ks: [{ hid, name, type, city, prov, country, lat, lng }] } }
 * Only tripUrl changes, and only where it still holds the old Expedia-number link.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const rb = args.indexOf('--rollback');

const STOP = new Set(['the', 'hotel', 'hotels', 'resort', 'resorts', 'spa', 'and', 'at', 'a', 'an', 'by', 'of', 'on', 'in', 'suites', 'suite', 'collection', 'portfolio', 'tribute', 'autograph', 'luxury', 'inn', 'house', 'lodge']);
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const tokens = (s, drop = []) => norm(s).split(' ').filter((t) => t && !STOP.has(t) && !drop.includes(t));
const share = (a, b) => (a.length ? a.filter((t) => b.includes(t)).length / a.length : 0);
const km = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const tripUrl = (hid) => `https://www.trip.com/hotels/detail/?hotelId=${hid}`;

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const hotels = client.db().collection('hotels');
const before = await hotels.countDocuments();

if (rb >= 0) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(args[rb + 1]), 'utf8'));
  console.log(`${WRITE ? 'ROLLBACK' : 'DRY RUN rollback'}: ${backup.rows.length} tripUrl values restored`);
  if (WRITE) for (const r of backup.rows) await hotels.updateOne({ _id: new ObjectId(r.id) }, { $set: { tripUrl: r.oldUrl } });
  await client.close();
  process.exit(0);
}

// --manual <file>: hand-reviewed pairs [{ id, hid, tripName }] for hotels the automatic rule left
// (renamed or rebranded properties, e.g. "Hotel ZaZa Austin Downtown" = Trip.com "Hotel ZaZa Austin").
const man = args.indexOf('--manual');
const lookup = man >= 0 ? {} : JSON.parse(fs.readFileSync(path.resolve(args[0]), 'utf8'));
const plan = [];
const unmatched = [];
if (man >= 0) {
  for (const m of JSON.parse(fs.readFileSync(path.resolve(args[man + 1]), 'utf8'))) {
    const h = await hotels.findOne({ _id: new ObjectId(m.id) }, { projection: { name: 1, city: 1, tripUrl: 1, expediaUrl: 1, flagged: 1 } });
    const oldId = (h?.tripUrl || '').match(/hotelId=(\d+)/)?.[1];
    if (!h || !oldId || oldId !== (h.expediaUrl || '').match(/\.h(\d+)\./)?.[1]) continue;
    plan.push({ id: m.id, name: h.name, city: h.city, flagged: !!h.flagged, oldUrl: h.tripUrl, newUrl: tripUrl(m.hid), tripName: m.tripName, tripCity: m.tripCity, distKm: null, reviewed: true });
  }
}
for (const [id, res] of Object.entries(lookup)) {
  const h = await hotels.findOne({ _id: new ObjectId(id) }, { projection: { name: 1, city: 1, latitude: 1, longitude: 1, tripUrl: 1, expediaUrl: 1, flagged: 1 } });
  if (!h) continue;
  const oldId = (h.tripUrl || '').match(/hotelId=(\d+)/)?.[1];
  const expId = (h.expediaUrl || '').match(/\.h(\d+)\./)?.[1];
  if (!oldId || oldId !== expId) continue; // already fixed or changed by someone else
  const cityWords = norm(h.city).split(' ');
  const ours = tokens(h.name.split('|')[0], cityWords);
  let pick = null;
  for (const k of res.ks || []) {
    if (k.type !== 'H' || !k.hid || !/united states/i.test(k.country || '')) continue;
    const theirs = tokens(k.name, cityWords);
    const a = share(ours, theirs), b = share(theirs, ours);
    const dist = k.lat && +k.lat !== -1 && h.latitude ? km(+h.latitude, +h.longitude, +k.lat, +k.lng) : null;
    // Trip.com often adds a brand tail ("in the Unbound Collection by Hyatt"): accept a shorter
    // overlap the other way only when Trip.com's name STARTS with our name and the hotel is close.
    // (Plain word overlap let "W Atlanta - Downtown" match a holiday home mentioning W and downtown.)
    const core = norm(h.name.split(/[,|]/)[0]).replace(/^the /, '');
    const startsWithOurs = norm(k.name).replace(/^the /, '').startsWith(core);
    const nameOk = ours.length > 0
      ? a >= 0.75 && (b >= 0.5 || (a === 1 && startsWithOurs && dist !== null && dist <= 25))
      : norm(k.name).includes(norm(h.name));
    // "Lodge" and "Hotel" of one brand in one town are different properties (Grand Bohemian Asheville).
    const lodge = (s) => /\blodge\b/.test(norm(s));
    const typeClash = lodge(h.name) !== lodge(k.name);
    const placeOk = (dist !== null && dist <= 40) || norm(k.city) === norm(h.city);
    if (nameOk && placeOk && !typeClash) { pick = { k, a, b, dist }; break; }
  }
  if (pick) plan.push({ id, name: h.name, city: h.city, flagged: !!h.flagged, oldUrl: h.tripUrl, newUrl: tripUrl(pick.k.hid), tripName: pick.k.name, tripCity: pick.k.city, distKm: pick.dist === null ? null : Math.round(pick.dist) });
  else unmatched.push({ id, name: h.name, city: h.city, flagged: !!h.flagged, top: (res.ks || []).slice(0, 2).map((k) => `${k.name} (${k.city}, ${k.type})`) });
}

console.log(`${WRITE ? 'WRITE' : 'DRY RUN'}: ${plan.length} Trip.com links to fix, ${unmatched.length} without a safe match (left unchanged) (hotels: ${before})`);
const reportPath = path.join(ROOT, '.cache', 'trip-fix-plan.json');
fs.writeFileSync(reportPath, JSON.stringify({ plan, unmatched }, null, 1));
console.log(`Plan and unmatched list: ${path.relative(ROOT, reportPath)}`);

if (WRITE && plan.length) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(ROOT, '.cache', `trip-fix-backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), rows: plan.map((p) => ({ id: p.id, oldUrl: p.oldUrl, newUrl: p.newUrl })) }, null, 1));
  console.log(`Backup (old links, for --rollback): ${path.relative(ROOT, backupPath)}`);
  let n = 0;
  for (const p of plan) {
    const r = await hotels.updateOne({ _id: new ObjectId(p.id), tripUrl: p.oldUrl }, { $set: { tripUrl: p.newUrl } });
    n += r.modifiedCount;
  }
  console.log(`Done: ${n} updated. Hotels: ${before} -> ${await hotels.countDocuments()}`);
}
await client.close();
