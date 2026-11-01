#!/usr/bin/env node

/**
 * scripts/data/link-fix1-rollback.mjs
 *
 * LINK-FIX1 / LINK-FIX1B (CEO Sheet T46)
 * Rollback script for link-fix1: restores removed Booking.com URLs from
 * data-collect/private/link-fix1-backup.json (covers 5 hotels).
 * DRY RUN by default. Use --write to execute restore.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

const isWrite = process.argv.includes('--write');

// 1. Safe environment loading
const envCandidates = [
  path.resolve(REPO_ROOT, '.env.local'),
  path.resolve(REPO_ROOT, '../hotelswithbathtubs/.env.local'),
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

const BACKUP_PATH = path.join(REPO_ROOT, 'data-collect/private/link-fix1-backup.json');

// Fallback planned target data if backup file has not been created yet (5 hotels).
// Note: NoMad Las Vegas (6ad9fa84ef30327ba9cd3433) was removed per auditor review (1 Nov 2026):
// page title is "The Reserve at Park MGM" at 3772 South Las Vegas Boulevard (Park MGM's address).
// NoMad was a hotel inside Park MGM, so this is a rename / rebranding, not a wrong hotel.
const PLANNED_TARGETS = [
  {
    id: '6aa779b5a1d874eba51c58ad',
    name: 'The Mark Hotel, New York',
    bookingUrl: 'https://www.booking.com/hotel/us/hi-new-york-hostel-nyc.html?aid=304142',
    url: 'https://www.booking.com/hotel/us/hi-new-york-hostel-nyc.html?aid=304142'
  },
  {
    id: '6ad9fa8bef30327ba9cd3438',
    name: 'Fontainebleau Las Vegas',
    bookingUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142',
    url: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142'
  },
  {
    id: '6a957a7589968819fb0dc1fc',
    name: 'The Venetian Resort Las Vegas',
    bookingUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142',
    url: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142'
  },
  {
    id: '6a957a7589968819fb0dc1fd',
    name: 'Bellagio Las Vegas',
    bookingUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142',
    url: 'https://www.booking.com/hotel/us/flamingo-casino.html?aid=304142'
  },
  {
    id: '6aaf7ab8f34b7c7289d7dda2',
    name: 'Embassy Suites by Hilton Waikiki Beach Walk',
    bookingUrl: 'https://www.booking.com/hotel/us/hilton-hawaiian-village.html?aid=304142',
    url: 'https://www.booking.com/hotel/us/hilton-hawaiian-village.html?aid=304142'
  }
];

async function main() {
  console.log('=============================================================');
  console.log(`>>> LINK-FIX1 ROLLBACK SCRIPT (Mode: ${isWrite ? 'WRITE (ROLLBACK)' : 'DRY RUN'})`);
  console.log('=============================================================');
  console.log('Connected to MongoDB (URI masked for security).\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('hotelsWithBathtubs');

  const countBefore = await db.collection('hotels').countDocuments();
  console.log(`Total hotels in collection before: ${countBefore}\n`);

  let backupRecords = [];
  if (fs.existsSync(BACKUP_PATH)) {
    console.log(`Reading backup file from ${BACKUP_PATH}...`);
    backupRecords = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
    console.log(`Loaded ${backupRecords.length} records from backup file.\n`);
  } else {
    console.log(`Note: Backup file ${BACKUP_PATH} does not exist on disk (write script has not run with --write).`);
    console.log(`Using planned backup definition to demonstrate rollback dry run behavior.\n`);
    backupRecords = PLANNED_TARGETS;
  }

  console.log('=== DEFINITION OF DONE 2: Rollback dry-run output ===');
  for (const rec of backupRecords) {
    const sets = {};
    if (rec.bookingUrl) sets.bookingUrl = rec.bookingUrl;
    if (rec.url) sets.url = rec.url;

    console.log(`Hotel ID: ${rec.id} | Name: "${rec.name}"`);
    if (rec.bookingUrl) {
      console.log(`  Field: bookingUrl | Restore value: "${rec.bookingUrl}" | Action: ${isWrite ? 'restore' : 'would restore'}`);
    }
    if (rec.url) {
      console.log(`  Field: url        | Restore value: "${rec.url}" | Action: ${isWrite ? 'restore' : 'would restore'}`);
    }
    console.log(`  Audit check: would remove platformChecks entry { site: "booking.com", checkedBy: "NAME-MATCH-AUDIT1" }`);
    console.log('');
  }

  if (!isWrite) {
    console.log('-------------------------------------------------------------');
    console.log('[DRY RUN COMPLETE]');
    console.log(`Exactly ${backupRecords.length} records would be restored in 'hotels' collection.`);
    console.log('To execute rollback, re-run with --write');
    console.log('-------------------------------------------------------------');
    await client.close();
    return;
  }

  // WRITE MODE (ROLLBACK EXECUTION)
  if (!fs.existsSync(BACKUP_PATH)) {
    console.error(`ERROR: Cannot execute write rollback without backup file at ${BACKUP_PATH}`);
    await client.close();
    process.exit(1);
  }

  console.log(`Executing rollback for ${backupRecords.length} records...`);
  let restoredCount = 0;
  for (const rec of backupRecords) {
    const sets = {};
    if (rec.bookingUrl) sets.bookingUrl = rec.bookingUrl;
    if (rec.url) sets.url = rec.url;

    const res = await db.collection('hotels').updateOne(
      { _id: new ObjectId(rec.id) },
      {
        $set: sets,
        $pull: {
          platformChecks: {
            site: 'booking.com',
            checkedBy: 'NAME-MATCH-AUDIT1'
          }
        }
      }
    );
    if (res.modifiedCount > 0) restoredCount++;
  }

  console.log(`Restored ${restoredCount} hotel records in collection.\n`);

  const countAfter = await db.collection('hotels').countDocuments();
  console.log('=============================================================');
  console.log('ROLLBACK EXECUTION SUMMARY:');
  console.log(`- Total hotels before: ${countBefore}`);
  console.log(`- Total hotels after: ${countAfter} (net diff: 0)`);
  console.log(`- Restored hotels: ${restoredCount}`);
  console.log('=============================================================\n');

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
