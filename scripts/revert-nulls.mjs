// Restores old link values for hotels the repair run emptied, and un-marks them so they are re-processed.
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const rows = fs.readFileSync('.cache/link-repair-backup-all.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const nulls = rows.filter((r) => Object.values(r.set).some((v) => v === null));
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const col = mongoose.connection.db.collection('hotels');
const res = await col.bulkWrite(nulls.map((r) => {
  const set = {}; for (const k of Object.keys(r.set)) set[k] = r.old[k] ?? null;
  return { updateOne: { filter: { _id: new mongoose.Types.ObjectId(r._id) }, update: { $set: set } } };
}));
const cache = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const m = new Map(cache.map((h) => [String(h._id), h]));
const state = JSON.parse(fs.readFileSync('.cache/link-repair-state.json', 'utf8'));
for (const r of nulls) { const h = m.get(String(r._id)); if (h) for (const k of Object.keys(r.set)) h[k] = r.old[k] ?? null; delete state[r._id]; }
fs.writeFileSync('.cache/all-hotels.json', JSON.stringify(cache));
fs.writeFileSync('.cache/link-repair-state.json', JSON.stringify(state));
console.log('restored', nulls.length, 'rows; db modified', res.modifiedCount, '; state now', Object.keys(state).length);
await mongoose.disconnect();
