import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '/Users/karanarora/mystartups/hotelswithbathtubs/.env.local', quiet: true });
const root = '/Users/karanarora/mystartups/hotelswithbathtubs/.cache/';
const rows = fs.readFileSync(root + 'link-repair-backup-all.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection('hotels');
const ops = rows.map((r) => {
  const set = {};
  for (const k of Object.keys(r.set)) set[k] = r.old[k] ?? null;
  return { updateOne: { filter: { _id: new mongoose.Types.ObjectId(r._id) }, update: { $set: set } } };
});
const res = await col.bulkWrite(ops);
console.log('db modified', res.modifiedCount, 'of', rows.length);
const cache = JSON.parse(fs.readFileSync(root + 'all-hotels.json', 'utf8'));
const m = new Map(cache.map((h) => [String(h._id), h]));
for (const r of rows) { const h = m.get(String(r._id)); if (h) for (const k of Object.keys(r.set)) h[k] = r.old[k] ?? null; }
fs.writeFileSync(root + 'all-hotels.json', JSON.stringify(cache));
await mongoose.disconnect();
