// scripts/data/round9-part-a.mjs
// Part A of ROUND 9:
// A1: Record bookingTubLabels for 174 confirmed PROMOTE1 hotels from saved Booking pages.
// A2: Correct tubType on those 174 ('Jetted tub' vs 'Bathtub').
// A3: Remove duplicate inn-at-playa-del-rey-los-angeles-2 from hotels, mark candidate status: 'duplicate'.
// Dry run by default. Use --write to execute.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { parseBookingHtml } from './parse-booking.mjs';

const isWrite = process.argv.includes('--write');

// Load environment from main checkout
const envPath = path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local');
dotenv.config({ path: envPath, quiet: true });

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in env');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

console.log(`[ROUND 9 Part A] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

const countHotelsBefore = await db.collection('hotels').countDocuments();
console.log(`Hotels count before: ${countHotelsBefore} (Expected: 4759)`);

// 1. Index saved pages
const dir = path.resolve(process.cwd(), 'data-collect/pages/booking-links1');
const metaFiles = fs.readdirSync(dir).filter(f => f.endsWith('.meta.json'));
const urlToGz = new Map();
const keyToGz = new Map();

for (const mf of metaFiles) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, mf), 'utf8'));
    const base = mf.replace(/\.meta\.json$/, '');
    const gz = path.join(dir, base + '.html.gz');
    if (fs.existsSync(gz)) {
      if (meta.url) urlToGz.set(meta.url.split('?')[0].replace(/\/$/, ''), gz);
      if (meta.key) keyToGz.set(meta.key, gz);
      if (meta.hotelKey) keyToGz.set(meta.hotelKey, gz);
      const fromFile = base.replace(/^(hotel-|hotel-retry-)/, '');
      keyToGz.set(fromFile, gz);
    }
  } catch (e) {}
}

function cleanHotelUrl(url) {
  if (!url) return '';
  return url.split('?')[0].replace(/\/$/, '');
}

function findSavedPage(h) {
  const cleanUrl = cleanHotelUrl(h.bookingUrl || h.url);
  let gzPath = urlToGz.get(cleanUrl);
  if (!gzPath) {
    const key = (h.name + ' ' + (h.city || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    gzPath = keyToGz.get(key);
  }
  if (!gzPath) {
    const cSlug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    for (const [k, p] of keyToGz.entries()) {
      if (k.replace(/[^a-z0-9]+/g, '').includes(cSlug) || cSlug.includes(k.replace(/[^a-z0-9]+/g, ''))) {
        gzPath = p;
        break;
      }
    }
  }
  return gzPath;
}

// 2. Fetch the 174 confirmed PROMOTE1 hotels
const confirmedHotels = await db.collection('hotels').find({
  importBatch: 'PROMOTE1-2026-10-29',
  bathtubConfirmed: true
}).toArray();

console.log(`Found ${confirmedHotels.length} confirmed PROMOTE1 hotels.`);

const updates = [];
for (const h of confirmedHotels) {
  const gzPath = findSavedPage(h);
  if (!gzPath || !fs.existsSync(gzPath)) {
    console.error(`FATAL: Missing saved page for ${h.name} (${h.slug})`);
    process.exit(1);
  }

  const html = zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8');
  const parsed = parseBookingHtml(html);

  const targetRoomName = (h.roomType || '').toLowerCase().trim();
  let matchedRoom = parsed.rooms.find(r => r.name.toLowerCase().trim() === targetRoomName);
  if (!matchedRoom) {
    matchedRoom = parsed.rooms.find(r => r.name.toLowerCase().includes(targetRoomName) || targetRoomName.includes(r.name.toLowerCase()));
  }
  if (!matchedRoom) {
    matchedRoom = parsed.rooms.find(r => r.bathWords && r.bathWords.length > 0);
  }

  const labels = matchedRoom?.bathWords || [];
  
  // Rule A2:
  // labels include Spa tub, Hot tub, Whirlpool or Jacuzzi, or the room name says jacuzzi, whirlpool, jetted, hot tub or spa tub -> "Jetted tub";
  // otherwise (only Bath or Bathtub) -> "Bathtub".
  const roomNameLower = (h.roomType || matchedRoom?.name || '').toLowerCase();
  const hasJettedInRoomName = /(?:jacuzzi|whirlpool|jetted|hot\s+tub|spa\s+tub)/i.test(roomNameLower);
  const hasJettedInLabels = labels.some(l => /^(?:spa\s+tub|spa\s+bath|hot\s+tub|whirlpool|jacuzzi|jetted)/i.test(l));

  const newTubType = (hasJettedInRoomName || hasJettedInLabels) ? 'Jetted tub' : 'Bathtub';

  updates.push({
    hotelId: h._id,
    name: h.name,
    slug: h.slug,
    roomType: h.roomType,
    bookingTubLabels: labels,
    newTubType,
    oldTubType: h.tubType,
  });
}

const jettedCount = updates.filter(u => u.newTubType === 'Jetted tub').length;
const bathtubCount = updates.filter(u => u.newTubType === 'Bathtub').length;

console.log(`\n======================================================`);
console.log(`A1 & A2 RESULTS:`);
console.log(`- Confirmed PROMOTE1 hotels evaluated: ${updates.length}`);
console.log(`- New tubType counts:`);
console.log(`    Jetted tub: ${jettedCount}`);
console.log(`    Bathtub: ${bathtubCount}`);
console.log(`======================================================\n`);

console.log(`5 EXAMPLES:`);
for (const ex of updates.slice(0, 5)) {
  console.log(`  Name: ${ex.name}`);
  console.log(`  Room: ${ex.roomType}`);
  console.log(`  Labels: [${ex.bookingTubLabels.join(', ')}]`);
  console.log(`  New tubType: ${ex.newTubType} (was: "${ex.oldTubType}")\n`);
}

const pth = updates.find(u => u.name === 'Pacific Terrace Hotel');
if (pth) {
  console.log(`Pacific Terrace Hotel detail:`);
  console.log(`  Name: ${pth.name}`);
  console.log(`  Room: ${pth.roomType}`);
  console.log(`  Labels: [${pth.bookingTubLabels.join(', ')}]`);
  console.log(`  New tubType: ${pth.newTubType} (was: "${pth.oldTubType}")\n`);
}

// 3. Duplicate check (A3)
const dupHotel = await db.collection('hotels').findOne({ slug: 'inn-at-playa-del-rey-los-angeles-2' });
console.log(`A3: Duplicate hotel inn-at-playa-del-rey-los-angeles-2 in hotels:`, dupHotel ? 'FOUND' : 'NOT FOUND');

const dupCandidate = await db.collection('hotel_candidates').findOne({ _id: new ObjectId('6ae1963005111ca1747762af') });
console.log(`A3: Duplicate candidate in hotel_candidates:`, dupCandidate ? `FOUND (status: ${dupCandidate.status})` : 'NOT FOUND');

if (!isWrite) {
  console.log(`\n[DRY RUN COMPLETE] To execute updates and delete duplicate, re-run with --write`);
  await client.close();
  process.exit(0);
}

// ======================================================
// WRITE MODE
// ======================================================
console.log(`\nExecuting WRITE operations...`);

// Update the 174 confirmed hotels
let updatedCount = 0;
for (const u of updates) {
  await db.collection('hotels').updateOne(
    { _id: u.hotelId },
    {
      $set: {
        bookingTubLabels: u.bookingTubLabels,
        tubType: u.newTubType,
        updatedAt: new Date()
      }
    }
  );
  updatedCount++;
}
console.log(`Updated bookingTubLabels and tubType on ${updatedCount} confirmed PROMOTE1 hotels.`);

// Delete duplicate from hotels
const deleteResult = await db.collection('hotels').deleteOne({ slug: 'inn-at-playa-del-rey-los-angeles-2' });
console.log(`Deleted duplicate hotel inn-at-playa-del-rey-los-angeles-2: ${deleteResult.deletedCount} deleted.`);

// Mark duplicate candidate in hotel_candidates
const candResult = await db.collection('hotel_candidates').updateOne(
  { _id: new ObjectId('6ae1963005111ca1747762af') },
  {
    $set: { status: 'duplicate', updatedAt: new Date() },
    $unset: { hotelId: '' }
  }
);
console.log(`Updated duplicate candidate status to 'duplicate': ${candResult.modifiedCount} modified.`);

// Final counts check
const countHotelsAfter = await db.collection('hotels').countDocuments();
const countUsHotelsAfter = await db.collection('hotels').countDocuments({ country: 'USA' });
console.log(`\n======================================================`);
console.log(`AFTER COUNTS:`);
console.log(`- hotels count: ${countHotelsBefore} -> ${countHotelsAfter} (Expected: 4758)`);
console.log(`- USA hotels count: 851 -> ${countUsHotelsAfter} (Expected: 850)`);
console.log(`======================================================\n`);

await client.close();
