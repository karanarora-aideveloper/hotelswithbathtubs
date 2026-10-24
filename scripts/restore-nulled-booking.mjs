// Restores the ORIGINAL bookingUrl (and the legacy `url` that mirrored it) for hotels whose Booking.com
// link the repair run emptied, and un-marks them so the next run re-checks them.
// Agoda and Trip.com links that were emptied stay empty.
//   node scripts/restore-nulled-booking.mjs            (dry run: counts only)
//   node scripts/restore-nulled-booking.mjs --apply
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const APPLY = process.argv.includes('--apply');

const lines = fs.readFileSync('.cache/link-repair-backup-all.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const first = new Map();            // first record per hotel holds the value from before any repair
for (const r of lines) if (!first.has(r._id)) first.set(r._id, r);
const state = JSON.parse(fs.readFileSync('.cache/link-repair-state.json', 'utf8'));
const cache = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const byId = new Map(cache.map((h) => [String(h._id), h]));

const todo = [];
for (const [id, v] of Object.entries(state)) {
  if (v.b !== 'nulled') continue;
  const h = byId.get(id), orig = first.get(id);
  if (!h || !orig?.old?.bookingUrl || h.bookingUrl) continue;      // only still-empty hotels with a known original
  todo.push({ id, name: h.name, set: { bookingUrl: orig.old.bookingUrl, ...(orig.old.url && orig.old.url.split('?')[0] === orig.old.bookingUrl.split('?')[0] ? { url: orig.old.url } : {}) } });
}
console.log(`${todo.length} emptied Booking.com links to restore and re-check`);
if (!APPLY) process.exit(0);

fs.writeFileSync(`.cache/restore-nulled-booking-${Date.now()}.json`, JSON.stringify(todo));
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const col = mongoose.connection.db.collection('hotels');
const res = await col.bulkWrite(todo.map((t) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(t.id) }, update: { $set: t.set } } })));
for (const t of todo) { Object.assign(byId.get(t.id), t.set); delete state[t.id]; }
fs.writeFileSync('.cache/all-hotels.json.tmp', JSON.stringify(cache)); fs.renameSync('.cache/all-hotels.json.tmp', '.cache/all-hotels.json');
fs.writeFileSync('.cache/link-repair-state.json', JSON.stringify(state));
console.log('restored', todo.length, '; db modified', res.modifiedCount, '; state now', Object.keys(state).length);
await mongoose.disconnect();
