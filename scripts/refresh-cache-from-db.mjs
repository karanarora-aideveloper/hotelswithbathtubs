// Re-reads the link fields of every hotel from MongoDB and patches .cache/all-hotels.json, so the cache
// agrees with the database after a run that wrote from two machines.
//   node scripts/refresh-cache-from-db.mjs
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const FIELDS = ['bookingUrl', 'agodaUrl', 'tripUrl', 'url', 'mmtUrl', 'expediaUrl', 'airbnbUrl'];
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const docs = await mongoose.connection.db.collection('hotels').find({}, { projection: Object.fromEntries([...FIELDS, 'updatedAt'].map((f) => [f, 1])) }).toArray();
const cache = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const byId = new Map(cache.map((h) => [String(h._id), h]));
let changed = 0;
for (const d of docs) {
  const h = byId.get(String(d._id)); if (!h) continue;
  let c = false;
  for (const f of FIELDS) { const v = d[f] ?? null; if ((h[f] ?? null) !== v) { h[f] = v; c = true; } }
  if (c) changed++;
}
fs.copyFileSync('.cache/all-hotels.json', '.cache/all-hotels.before-refresh.json');
fs.writeFileSync('.cache/all-hotels.json.tmp', JSON.stringify(cache)); fs.renameSync('.cache/all-hotels.json.tmp', '.cache/all-hotels.json');
console.log(`db hotels ${docs.length}, cache hotels ${cache.length}, patched ${changed}`);
await mongoose.disconnect();
