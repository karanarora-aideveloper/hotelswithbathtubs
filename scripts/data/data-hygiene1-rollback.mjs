// scripts/data/data-hygiene1-rollback.mjs
// DATA-HYGIENE1: Rollback country and city name standardizations from live hotels collection.
// DRY RUN by default. Use --write to apply rollback.

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
console.log(`>>> DATA-HYGIENE1 ROLLBACK SCRIPT (Mode: ${isWrite ? 'WRITE (ROLLBACK)' : 'DRY RUN'})`);
console.log('=============================================================\n');

// Masked connection message - NEVER print credentials
console.log('Connected to MongoDB (URI masked for security).');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('hotelsWithBathtubs');

const totalHotelsBefore = await db.collection('hotels').countDocuments();
console.log(`Total hotels in collection before: ${totalHotelsBefore}`);

const rollbackItems = [
  {
    id: '6ad5bdc82f66532e90d1399c',
    type: 'country',
    name: 'Wombat’s City Hostel London',
    currentExpected: { country: 'UK' },
    rollbackTarget: { country: 'United Kingdom' },
    reason: 'Revert country standardization to original "United Kingdom"'
  },
  {
    id: '6ae442b72a8cd9159de12c9f',
    type: 'city',
    name: 'Hilton Grand Vacations Club Elara Center Strip Las Vegas',
    currentExpected: { city: 'Las Vegas' },
    rollbackTarget: { city: 'Las Vegas Strip' },
    reason: 'Revert city standardization to original "Las Vegas Strip"'
  },
  {
    id: '6ae442b72a8cd9159de12d51',
    type: 'city',
    name: 'Sonesta Resort',
    currentExpected: { city: 'Hilton Head' },
    rollbackTarget: { city: 'Hilton Head Island' },
    reason: 'Revert city standardization to original "Hilton Head Island"'
  },
  {
    id: '6ae442b72a8cd9159de12d13',
    type: 'city',
    name: 'Quality Inn – East Stroudsburg – Poconos',
    currentExpected: { city: 'Stroudsburg' },
    rollbackTarget: { city: 'East Stroudsburg' },
    reason: 'Revert city standardization to original "East Stroudsburg"'
  },
  {
    id: '6ac8c1d42f66532e90cfbbca',
    type: 'city',
    name: 'Tatva Bir Resort Bir Billing',
    currentExpected: { city: 'Bir' },
    rollbackTarget: { city: 'Bir Billing' },
    reason: 'Revert city standardization to original "Bir Billing"'
  }
];

console.log(`\nPlanned rollback items: ${rollbackItems.length}`);

let eligibleCount = 0;
let alreadyRevertedCount = 0;
let writesExecuted = 0;

for (const item of rollbackItems) {
  const doc = await db.collection('hotels').findOne({ _id: new ObjectId(item.id) });
  if (!doc) {
    console.log(`[SKIP] Document not found: ${item.id} (${item.name})`);
    continue;
  }

  let needsRollback = false;
  const updateFields = {};

  if (item.type === 'country') {
    if (doc.country === item.currentExpected.country) {
      needsRollback = true;
      updateFields.country = item.rollbackTarget.country;
    } else if (doc.country === item.rollbackTarget.country) {
      alreadyRevertedCount++;
      console.log(`[IDEMPOTENT] Already in original state: ${item.name} has country="${doc.country}"`);
    }
  } else if (item.type === 'city') {
    if (doc.city === item.currentExpected.city) {
      needsRollback = true;
      updateFields.city = item.rollbackTarget.city;
    } else if (doc.city === item.rollbackTarget.city) {
      alreadyRevertedCount++;
      console.log(`[IDEMPOTENT] Already in original state: ${item.name} has city="${doc.city}"`);
    }
  }

  if (needsRollback) {
    eligibleCount++;
    console.log(`[${isWrite ? 'ROLLING BACK' : 'DRY-RUN ROLLBACK'}] ${item.name} (${item.id}):`);
    console.log(`    Field: ${item.type} | Current: "${item.type === 'country' ? doc.country : doc.city}" -> Target: "${item.type === 'country' ? item.rollbackTarget.country : item.rollbackTarget.city}"`);
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
console.log(`Total rollback items: ${rollbackItems.length}`);
console.log(`Eligible for rollback: ${eligibleCount}`);
console.log(`Already in original state: ${alreadyRevertedCount}`);
console.log(`Actual rollback writes performed: ${writesExecuted}`);
console.log(`Total hotels in collection before: ${totalHotelsBefore}`);
console.log(`Total hotels in collection after: ${totalHotelsAfter}`);
console.log('-------------------------------------------------------------');

if (!isWrite) {
  console.log('\nDRY RUN complete. 0 writes executed. Use --write to apply rollback.');
} else {
  console.log(`\nROLLBACK complete. ${writesExecuted} records reverted.`);
}

await client.close();
