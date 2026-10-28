// scripts/data/links1b-backfill.mjs
// Backfill F1, F2 and F3 on hotel_candidates based on LINKS1 results and saved pages.
// Safe to run multiple times. Dry-run by default; use --write to persist.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { parseBookingHtml } from './parse-booking.mjs';
import { matchHotelAddress, extractStreetNumber } from './match-utils.mjs';

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

console.log(`[links1b-backfill] Connected to database (dry run: ${!isWrite})`);

// 1. Sanity check counts before
const countHotelsBefore = await db.collection('hotels').countDocuments();
const countCandidatesBefore = await db.collection('hotel_candidates').countDocuments();
console.log(`Before: hotels=${countHotelsBefore}, hotel_candidates=${countCandidatesBefore}`);

if (countHotelsBefore !== 4470) {
  console.error(`FATAL: hotels count is ${countHotelsBefore}, expected 4470`);
  process.exit(1);
}

// 2. Load links1-results.json
const links1ResultsPath = path.resolve(process.cwd(), 'data-collect/private/links1-results.json');
if (!fs.existsSync(links1ResultsPath)) {
  console.error(`ERROR: ${links1ResultsPath} does not exist`);
  process.exit(1);
}

const links1Data = JSON.parse(fs.readFileSync(links1ResultsPath, 'utf8'));
const links1Map = new Map();
for (const r of links1Data.results) {
  links1Map.set(r.key, r);
}

// 3. Process the 137 candidates that had links
const candidatesWithLink = await db.collection('hotel_candidates').find({ 'bookingLinks.0': { $exists: true } }).toArray();
console.log(`Found ${candidatesWithLink.length} candidates with booking links`);

const wrongHotels = [];
const validHotels = [];

for (const c of candidatesWithLink) {
  const normKey = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normTown = (c.town || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normState = (c.state || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const slug = `hotel-${normKey}-${normTown}-${normState}`;
  const filePath = path.resolve(process.cwd(), `data-collect/pages/booking-links1/${slug}.html.gz`);

  if (!fs.existsSync(filePath)) {
    console.error(`Missing saved page: ${filePath}`);
    continue;
  }

  const gz = fs.readFileSync(filePath);
  const html = zlib.gunzipSync(gz).toString('utf-8');
  const parsed = parseBookingHtml(html);

  const res = matchHotelAddress(c, parsed.address, parsed.pageTitle);
  const candNum = extractStreetNumber(c.address?.street);
  const bkNum = extractStreetNumber(parsed.address);

  if (!res.pass) {
    wrongHotels.push({
      candidate: c,
      parsed,
      candNum,
      bkNum,
      reason: res.reason
    });
  } else {
    validHotels.push({
      candidate: c,
      parsed,
      candNum,
      bkNum,
      matchWeak: res.matchWeak
    });
  }
}

console.log(`F1 Address Evaluation:`);
console.log(`  Passed (valid): ${validHotels.length}`);
console.log(`  Failed (wrong):  ${wrongHotels.length}`);

console.log(`\nWrong Hotels (${wrongHotels.length}):`);
for (const w of wrongHotels) {
  console.log(` - ${w.candidate.name} (${w.candidate.address?.street}, ${w.candidate.town}) -> Booking: ${w.parsed.pageTitle} | ${w.parsed.address} [${w.candNum} vs ${w.bkNum}] | ${w.reason}`);
}

let confirmedTubCount = 0;
let noTubCount = 0;
for (const v of validHotels) {
  if (v.parsed.hasTubRoom) confirmedTubCount++;
  else noTubCount++;
}

console.log(`\nTub Evaluation among ${validHotels.length} valid matches:`);
console.log(`  confirmed_booking: ${confirmedTubCount}`);
console.log(`  no_tub_on_booking: ${noTubCount}`);

// 4. Backfill updates in DB
const nowIso = new Date().toISOString();

// Helper to filter out existing booking.com platformChecks to avoid duplicates
function cleanPlatformChecks(existingChecks, newCheck) {
  const filtered = (existingChecks || []).filter(c => c.platform !== 'booking.com');
  filtered.push(newCheck);
  return filtered;
}

// A. Update wrong hotels
for (const w of wrongHotels) {
  const c = w.candidate;
  const query = `${c.name}, ${c.town}, ${c.state}`;
  const checkEntry = {
    platform: 'booking.com',
    result: 'wrong_hotel',
    query,
    checkedAt: nowIso
  };

  if (isWrite) {
    const updatedChecks = cleanPlatformChecks(c.platformChecks, checkEntry);
    await db.collection('hotel_candidates').updateOne(
      { _id: c._id },
      {
        $set: {
          bookingLinks: [],
          roomNameStatus: 'pending',
          platformChecks: updatedChecks,
          updatedAt: nowIso
        },
        $unset: { bookingFacts: '' }
      }
    );
  }
}

// B. Update valid hotels
for (const v of validHotels) {
  const c = v.candidate;
  const p = v.parsed;
  const query = `${c.name}, ${c.town}, ${c.state}`;
  const checkEntry = {
    platform: 'booking.com',
    result: 'found',
    query,
    checkedAt: nowIso
  };

  const newRoomStatus = p.hasTubRoom ? 'confirmed_booking' : 'no_tub_on_booking';

  if (isWrite) {
    const updatedChecks = cleanPlatformChecks(c.platformChecks, checkEntry);
    await db.collection('hotel_candidates').updateOne(
      { _id: c._id },
      {
        $set: {
          'bookingFacts.tubRooms': p.tubRooms,
          'bookingFacts.tubRoomsCount': p.tubRoomsCount,
          'bookingFacts.pageTitle': p.pageTitle,
          'bookingFacts.address': p.address,
          roomNameStatus: newRoomStatus,
          platformChecks: updatedChecks,
          updatedAt: nowIso
        }
      }
    );
  }
}

// C. Backfill 298 not-found hotels from links1Data
const notFoundInLinks1 = links1Data.results.filter(r => r.status === 'not_found');
console.log(`Backfilling platformChecks for ${notFoundInLinks1.length} not_found candidates...`);

// Batch fetch candidates from DB for efficiency
const notFoundKeys = notFoundInLinks1.map(r => r.key);
const dbNotFoundCands = await db.collection('hotel_candidates').find({ key: { $in: notFoundKeys } }).toArray();
const dbNotFoundMap = new Map();
for (const cand of dbNotFoundCands) {
  dbNotFoundMap.set(cand.key, cand);
}

for (const r of notFoundInLinks1) {
  const c = dbNotFoundMap.get(r.key);
  const query = `${r.name}, ${r.town}, ${r.state}`;
  const resultType = r.cardsCount === 0 ? 'search_redirected' : 'not_found';
  const checkEntry = {
    platform: 'booking.com',
    result: resultType,
    query,
    checkedAt: r.processedAt || nowIso
  };

  if (isWrite) {
    const updatedChecks = cleanPlatformChecks(c?.platformChecks, checkEntry);
    await db.collection('hotel_candidates').updateOne(
      { key: r.key },
      {
        $set: {
          platformChecks: updatedChecks,
          updatedAt: nowIso
        }
      }
    );
  }
}

// 5. Generate data-collect/private/not-found-booking.csv
// Columns: name, town, state, address, last query, result, date
const notFoundRows = [];

// Add wrong hotels
for (const w of wrongHotels) {
  const c = w.candidate;
  const addr = (c.address?.street || c.address?.formatted || '').replace(/"/g, '""');
  const query = `${c.name}, ${c.town}, ${c.state}`.replace(/"/g, '""');
  notFoundRows.push({
    name: c.name,
    town: c.town,
    state: c.state,
    address: addr,
    query,
    result: 'wrong_hotel',
    date: nowIso.slice(0, 10)
  });
}

// Add 298 not-found hotels
for (const r of notFoundInLinks1) {
  const dbCand = dbNotFoundMap.get(r.key);
  const addr = (dbCand?.address?.street || dbCand?.address?.formatted || '').replace(/"/g, '""');
  const query = `${r.name}, ${r.town}, ${r.state}`.replace(/"/g, '""');
  const resultType = r.cardsCount === 0 ? 'search_redirected' : 'not_found';
  notFoundRows.push({
    name: r.name,
    town: r.town,
    state: r.state,
    address: addr,
    query,
    result: resultType,
    date: (r.processedAt || nowIso).slice(0, 10)
  });
}

const csvHeader = 'name,town,state,address,last query,result,date\n';
const csvLines = notFoundRows.map(row => 
  `"${row.name}","${row.town}","${row.state}","${row.address}","${row.query}","${row.result}","${row.date}"`
).join('\n');

const csvPath = path.resolve(process.cwd(), 'data-collect/private/not-found-booking.csv');
fs.writeFileSync(csvPath, csvHeader + csvLines + '\n', 'utf8');
console.log(`Wrote ${notFoundRows.length} rows to ${csvPath}`);

// 6. Final sanity check counts
const countHotelsAfter = await db.collection('hotels').countDocuments();
const countCandidatesAfter = await db.collection('hotel_candidates').countDocuments();
const countCandidatesWithLinkAfter = await db.collection('hotel_candidates').countDocuments({ 'bookingLinks.0': { $exists: true } });
const countCandidatesHiddenAfter = await db.collection('hotel_candidates').countDocuments({ status: 'hidden' });

console.log(`\nFinal Sanity Check:`);
console.log(`  hotels: ${countHotelsAfter} (must be 4470)`);
console.log(`  hotel_candidates: ${countCandidatesAfter} (must be 6035)`);
console.log(`  hotel_candidates status='hidden': ${countCandidatesHiddenAfter} (must be 6035)`);
console.log(`  hotel_candidates with link: ${countCandidatesWithLinkAfter} (expected ${isWrite ? 130 : 137})`);

await client.close();
