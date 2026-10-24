// Empties tripUrl values that are Trip.com keyword searches (they render "0 properties found").
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env.local', quiet: true });
const cache = JSON.parse(fs.readFileSync('.cache/all-hotels.json', 'utf8'));
const hits = cache.filter((h) => h.tripUrl && (h.tripUrl.includes('/hotels/list') || h.tripUrl.includes('keyword=')));
fs.writeFileSync('.cache/trip-search-removed.json', JSON.stringify(Object.fromEntries(hits.map((h) => [h._id, h.tripUrl]))));
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
const res = await mongoose.connection.db.collection('hotels').bulkWrite(hits.map((h) => ({ updateOne: { filter: { _id: new mongoose.Types.ObjectId(h._id), tripUrl: h.tripUrl }, update: { $set: { tripUrl: null } } } })));
for (const h of hits) h.tripUrl = null;
fs.writeFileSync('.cache/all-hotels.json.tmp', JSON.stringify(cache)); fs.renameSync('.cache/all-hotels.json.tmp', '.cache/all-hotels.json');
console.log('emptied', hits.length, '; db modified', res.modifiedCount);
await mongoose.disconnect();
