// scripts/data/data-hygiene1-write.mjs
// DATA-HYGIENE1: Apply country and city name standardizations to live hotels collection.
// DRY RUN by default. Use --write to apply updates.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');

const isWrite = process.argv.includes('--write');

// Load environment safely
const envCandidates = [
  path.resolve(worktreeDir, '.env.local'),
  path.resolve(worktreeDir, '../hotelswithbathtubs/.env.local'),
  path.resolve(process.cwd(), '.env.local')
];
for (const p of envCandidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, quiet: true });
    break;
  }
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in env');
  process.exit(1);
}

console.log('=============================================================');
console.log(`>>> DATA-HYGIENE1 WRITE SCRIPT (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);
console.log('=============================================================\n');

// Masked connection message - NEVER print credentials
console.log('Connected to MongoDB (URI masked for security).');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('hotelsWithBathtubs');

const totalHotelsBefore = await db.collection('hotels').countDocuments();
console.log(`Total hotels in collection before: ${totalHotelsBefore}`);

// Target standardizations:
// 1. Country: "United Kingdom" -> "UK" (1 hotel)
// 2. City: "Las Vegas Strip" -> "Las Vegas" (1 hotel)
// 3. City: "Hilton Head Island" -> "Hilton Head" (1 hotel)
// 4. City: "East Stroudsburg" -> "Stroudsburg" (1 hotel)
// 5. City: "Bir Billing" -> "Bir" (1 hotel)

const plannedUpdates = [
  {
    id: '6ad5bdc82f66532e90d1399c',
    type: 'country',
    name: 'Wombat’s City Hostel London',
    current: { country: 'United Kingdom' },
    target: { country: 'UK' },
    reason: 'Standardize single "United Kingdom" record to match all 79 "UK" records'
  },
  {
    id: '6ae442b72a8cd9159de12c9f',
    type: 'city',
    name: 'Hilton Grand Vacations Club Elara Center Strip Las Vegas',
    current: { city: 'Las Vegas Strip', country: 'USA' },
    target: { city: 'Las Vegas' },
    reason: 'Standardize "Las Vegas Strip" to "Las Vegas" destination inventory'
  },
  {
    id: '6ae442b72a8cd9159de12d51',
    type: 'city',
    name: 'Sonesta Resort',
    current: { city: 'Hilton Head Island', country: 'USA' },
    target: { city: 'Hilton Head' },
    reason: 'Standardize "Hilton Head Island" to "Hilton Head" resort destination'
  },
  {
    id: '6ae442b72a8cd9159de12d13',
    type: 'city',
    name: 'Quality Inn – East Stroudsburg – Poconos',
    current: { city: 'East Stroudsburg', country: 'USA' },
    target: { city: 'Stroudsburg' },
    reason: 'Standardize "East Stroudsburg" to "Stroudsburg" urban core'
  },
  {
    id: '6ac8c1d42f66532e90cfbbca',
    type: 'city',
    name: 'Tatva Bir Resort Bir Billing',
    current: { city: 'Bir Billing', country: 'India' },
    target: { city: 'Bir' },
    reason: 'Standardize "Bir Billing" takeoff site to "Bir" destination'
  }
];

console.log(`\nPlanned hygiene standardizations: ${plannedUpdates.length}`);

let eligibleCount = 0;
let alreadyUpdatedCount = 0;
let writesExecuted = 0;

for (const item of plannedUpdates) {
  const doc = await db.collection('hotels').findOne({ _id: new ObjectId(item.id) });
  if (!doc) {
    console.log(`[SKIP] Document not found: ${item.id} (${item.name})`);
    continue;
  }

  // Check if update is needed
  let needsUpdate = false;
  const updateFields = {};

  if (item.type === 'country') {
    if (doc.country === item.current.country) {
      needsUpdate = true;
      updateFields.country = item.target.country;
    } else if (doc.country === item.target.country) {
      alreadyUpdatedCount++;
      console.log(`[IDEMPOTENT] Already updated: ${item.name} has country="${doc.country}"`);
    }
  } else if (item.type === 'city') {
    if (doc.city === item.current.city) {
      needsUpdate = true;
      updateFields.city = item.target.city;
    } else if (doc.city === item.target.city) {
      alreadyUpdatedCount++;
      console.log(`[IDEMPOTENT] Already updated: ${item.name} has city="${doc.city}"`);
    }
  }

  if (needsUpdate) {
    eligibleCount++;
    console.log(`[${isWrite ? 'UPDATING' : 'DRY-RUN'}] ${item.name} (${item.id}):`);
    console.log(`    Field: ${item.type} | Current: "${item.type === 'country' ? doc.country : doc.city}" -> Target: "${item.type === 'country' ? item.target.country : item.target.city}"`);
    console.log(`    Reason: ${item.reason}`);

    if (isWrite) {
      await db.collection('hotels').updateOne(
        { _id: new ObjectId(item.id) },
        { $set: updateFields }
      );
      writesExecuted++;
    }
  }
}

const totalHotelsAfter = await db.collection('hotels').countDocuments();

console.log('\n-------------------------------------------------------------');
console.log('SUMMARY:');
console.log(`Total candidates: ${plannedUpdates.length}`);
console.log(`Eligible for update: ${eligibleCount}`);
console.log(`Already standardized: ${alreadyUpdatedCount}`);
console.log(`Actual writes performed: ${writesExecuted}`);
console.log(`Total hotels in collection before: ${totalHotelsBefore}`);
console.log(`Total hotels in collection after: ${totalHotelsAfter}`);
console.log('-------------------------------------------------------------');

if (!isWrite) {
  console.log('\nDRY RUN complete. 0 writes executed. Use --write to apply updates.');
} else {
  console.log(`\nWRITE complete. ${writesExecuted} records updated.`);
}

await client.close();
