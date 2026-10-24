// Empties Agoda links that only carry a property id (search?selectedproperty=...). They were confirmed in a
// real browser to land on the Agoda homepage or a city list, never the hotel. The old links are kept in
// .cache/agoda-search-pending.json so a later pass can still resolve them to real hotel pages.
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const pend = JSON.parse(fs.readFileSync('.cache/agoda-search-pending.json', 'utf8'));
const ids = Object.keys(pend);
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const col = mongoose.connection.db.collection('hotels');
const res = await col.bulkWrite(ids.map((id) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(id), agodaUrl: pend[id] }, update: { $set: { agodaUrl: null } } } })));
const cache = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const byId = new Map(cache.map((h) => [String(h._id), h]));
for (const id of ids) { const h = byId.get(id); if (h && h.agodaUrl === pend[id]) h.agodaUrl = null; }
fs.writeFileSync('.cache/all-hotels.json.tmp', JSON.stringify(cache)); fs.renameSync('.cache/all-hotels.json.tmp', '.cache/all-hotels.json');
console.log('emptied', ids.length, '; db modified', res.modifiedCount);
await mongoose.disconnect();
