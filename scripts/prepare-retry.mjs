// Prepares the retry pass: for every hotel whose Booking.com link the repair run emptied (on this machine
// or on the spare laptop), put the ORIGINAL link back in MongoDB and the cache, and write the list of
// hotel ids to re-check to .cache/retry-ids.json. Run scripts/refresh-cache-from-db.mjs first.
//   node scripts/prepare-retry.mjs            (dry run)
//   node scripts/prepare-retry.mjs --apply
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const APPLY = process.argv.includes('--apply');
const readJson = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : d);

const cache = readJson('.cache/all-hotels.json', []);
const byId = new Map(cache.map((h) => [String(h._id), h]));
const main = readJson('.cache/link-repair-state.json', {});
const remote = readJson('.cache/link-repair-state.remote.json', {});
const firstOld = new Map();
for (const l of (fs.existsSync('.cache/link-repair-backup-all.jsonl') ? fs.readFileSync('.cache/link-repair-backup-all.jsonl', 'utf8').trim().split('\n') : []).map((x) => JSON.parse(x)))
  if (!firstOld.has(l._id)) firstOld.set(l._id, l.old);

const todo = new Map();
const consider = (id, old) => {
  const h = byId.get(id);
  if (!h || !old?.bookingUrl || h.bookingUrl) return;           // only hotels still without a Booking.com link
  const set = { bookingUrl: old.bookingUrl };
  if (old.url && old.url.split('?')[0] === old.bookingUrl.split('?')[0]) set.url = old.url;
  todo.set(id, { id, name: h.name, set });
};
for (const [id, v] of Object.entries(main)) if (v.b === 'nulled') consider(id, firstOld.get(id));
for (const [id, v] of Object.entries(remote)) if (v.b === 'nulled') consider(id, v.old);
console.log(`${todo.size} hotels with an emptied Booking.com link to restore and re-check`);
if (!APPLY) process.exit(0);

const list = [...todo.values()];
fs.writeFileSync('.cache/retry-ids.json', JSON.stringify(list.map((t) => t.id)));
fs.writeFileSync(`.cache/prepare-retry-${Date.now()}.json`, JSON.stringify(list));
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const res = await mongoose.connection.db.collection('hotels').bulkWrite(list.map((t) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(t.id) }, update: { $set: t.set } } })));
for (const t of list) Object.assign(byId.get(t.id), t.set);
fs.writeFileSync('.cache/all-hotels.json.tmp', JSON.stringify(cache)); fs.renameSync('.cache/all-hotels.json.tmp', '.cache/all-hotels.json');
console.log('restored', list.length, '; db modified', res.modifiedCount, '; ids saved to .cache/retry-ids.json');
await mongoose.disconnect();
