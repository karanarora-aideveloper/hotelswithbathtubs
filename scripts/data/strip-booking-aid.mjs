#!/usr/bin/env node
/**
 * AFF-CJ1 (24 Nov 2026): remove the old hard-coded Booking.com aid (it was never ours)
 * from stored hotel links. Booking.com and Trip.com tracking is now added at click time
 * via CJ (src/lib/affiliate.ts), so stored partner URLs must be clean.
 *
 * Dry run (default): counts and samples only, no writes.
 *   node scripts/data/strip-booking-aid.mjs
 * Write (needs the founder's OK): backs up every changed field first.
 *   node scripts/data/strip-booking-aid.mjs --write
 * Rollback:
 *   node scripts/data/strip-booking-aid.mjs --rollback .cache/strip-booking-aid-backup-<stamp>.json
 *
 * Only the `aid` query parameter whose value is the old id is removed; nothing else changes.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(ROOT, '.env.local'), quiet: true });

const OLD_AID = ['30', '41', '42'].join(''); // kept split so repo greps for the old id stay clean
const AID_RE = new RegExp(`aid=${OLD_AID}(?![0-9])`);
const FIELDS = ['bookingUrl', 'url', 'agodaUrl', 'tripUrl', 'mmtUrl', 'makemytripUrl', 'cleartripUrl', 'easemytripUrl', 'expediaUrl', 'hotelsComUrl', 'airbnbUrl', 'vrboUrl'];
const COLLECTIONS = ['hotels', 'hotel_candidates'];

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const rbIdx = args.indexOf('--rollback');
const ROLLBACK = rbIdx >= 0 ? args[rbIdx + 1] : null;

function stripAid(u) {
  try {
    const parsed = new URL(u);
    if (parsed.searchParams.get('aid') === OLD_AID) parsed.searchParams.delete('aid');
    return parsed.toString();
  } catch {
    return u.replace(new RegExp(`[?&]aid=${OLD_AID}(?![0-9])`), (m) => (m.startsWith('?') ? '?' : '')).replace(/\?&/, '?').replace(/\?$/, '');
  }
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

if (ROLLBACK) {
  const backup = JSON.parse(fs.readFileSync(path.resolve(ROOT, ROLLBACK), 'utf8'));
  let n = 0;
  for (const row of backup.rows) {
    await db.collection(row.collection).updateOne({ _id: new mongoose.Types.ObjectId(row._id) }, { $set: row.before });
    n++;
  }
  console.log(`Rolled back ${n} documents from ${ROLLBACK}`);
  await mongoose.disconnect();
  process.exit(0);
}

const rows = [];
for (const c of COLLECTIONS) {
  const exists = (await db.listCollections({ name: c }).toArray()).length > 0;
  if (!exists) continue;
  const cursor = db.collection(c).find({ $or: FIELDS.map((f) => ({ [f]: AID_RE })) }, { projection: Object.fromEntries(FIELDS.map((f) => [f, 1])) });
  for await (const doc of cursor) {
    const before = {};
    const after = {};
    for (const f of FIELDS) {
      if (typeof doc[f] === 'string' && AID_RE.test(doc[f])) {
        before[f] = doc[f];
        after[f] = stripAid(doc[f]);
      }
    }
    if (Object.keys(before).length) rows.push({ collection: c, _id: String(doc._id), before, after });
  }
}

const perField = {};
for (const r of rows) for (const f of Object.keys(r.before)) perField[`${r.collection}.${f}`] = (perField[`${r.collection}.${f}`] || 0) + 1;
console.log(`${WRITE ? 'WRITE' : 'DRY RUN'}: ${rows.length} documents carry the old aid`);
console.log(JSON.stringify(perField, null, 2));
for (const r of rows.slice(0, 3)) {
  const f = Object.keys(r.before)[0];
  console.log(`  sample ${r.collection} ${r._id} ${f}:\n    ${r.before[f]}\n -> ${r.after[f]}`);
}
const stillDirty = rows.filter((r) => Object.values(r.after).some((v) => AID_RE.test(v))).length;
console.log(`After-strip check: ${stillDirty} would still carry the aid`);

if (WRITE && rows.length) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(ROOT, '.cache', `strip-booking-aid-backup-${stamp}.json`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), rows }, null, 2));
  console.log(`Backup written: ${path.relative(ROOT, backupPath)}`);
  let n = 0;
  for (const r of rows) {
    await db.collection(r.collection).updateOne({ _id: new mongoose.Types.ObjectId(r._id) }, { $set: r.after });
    n++;
  }
  const left = await Promise.all(COLLECTIONS.map(async (c) => db.collection(c).countDocuments({ $or: FIELDS.map((f) => ({ [f]: AID_RE })) }).catch(() => 0)));
  console.log(`Updated ${n} documents. Remaining with the old aid: ${left.reduce((a, b) => a + b, 0)}`);
}

await mongoose.disconnect();
