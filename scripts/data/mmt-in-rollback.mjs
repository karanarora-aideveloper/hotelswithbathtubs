// scripts/data/mmt-in-rollback.mjs
// MMT-LINKS1: Rollback MakeMyTrip URL updates from hotels collection.
// DRY RUN by default. Use --write to apply rollback.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
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
console.log(`>>> MAKEMYTRIP-IN ROLLBACK SCRIPT (Mode: ${isWrite ? 'WRITE (ROLLBACK)' : 'DRY RUN'})`);
console.log('=============================================================\n');

// Masked connection message - NEVER print credentials
console.log('Connected to MongoDB (URI masked for security).');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('hotelsWithBathtubs');

const countTotalBefore = await db.collection('hotels').countDocuments();
const matchingQuery = {
  $or: [
    { makemytripUrl: { $exists: true, $ne: '' } },
    { 'platformChecks.platform': 'makemytrip' }
  ]
};

const recordsToRollback = await db.collection('hotels').find(matchingQuery).toArray();
const N = recordsToRollback.length;

console.log(`Initial 'hotels' total count: ${countTotalBefore}`);
console.log(`Hotels found with makemytripUrl or makemytrip platformCheck: ${N}`);

if (N === 0) {
  console.log('\nNo MakeMyTrip records found to roll back.');
  await client.close();
  process.exit(0);
}

console.log(`\nSample of records to roll back (first 5 of ${N}):`);
recordsToRollback.slice(0, 5).forEach((h, idx) => {
  console.log(`  [${idx + 1}/${N}] ${h.name} (${h.city}) | makemytripUrl: ${h.makemytripUrl || 'none'}`);
});

if (!isWrite) {
  console.log('\n-------------------------------------------------------------');
  console.log('[DRY RUN COMPLETE]');
  console.log(`Hotels to be reverted: Exactly ${N} records.`);
  console.log(`Reversion changes per record:`);
  console.log(`  - $unset: { makemytripUrl: "" }`);
  console.log(`  - $pull:  { platformChecks: { platform: "makemytrip" } }`);
  console.log(`Live database writes performed: 0`);
  console.log('To execute rollback, re-run with --write (requires owner explicit approval).');
  console.log('-------------------------------------------------------------');
  await client.close();
  process.exit(0);
}

// WRITE MODE
console.log(`\nExecuting rollback on ${N} records...`);

const result = await db.collection('hotels').updateMany(
  matchingQuery,
  {
    $unset: { makemytripUrl: '' },
    $pull: { platformChecks: { platform: 'makemytrip' } }
  }
);

const countTotalAfter = await db.collection('hotels').countDocuments();
const countRemaining = await db.collection('hotels').countDocuments(matchingQuery);

console.log(`Modified records: ${result.modifiedCount}`);
console.log(`Hotels total count after: ${countTotalAfter} (change: ${countTotalAfter - countTotalBefore})`);
console.log(`Remaining hotels with MakeMyTrip data: ${countRemaining}`);

await client.close();
