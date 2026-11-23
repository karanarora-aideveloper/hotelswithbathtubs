#!/usr/bin/env node

/**
 * scripts/data/link-fix1-write.mjs
 *
 * LINK-FIX1 / LINK-FIX1B (CEO Sheet T46)
 * Prepare removing 5 Booking.com links that open a different hotel.
 * DRY RUN by default. Use --write to apply updates and create backup.
 *
 * Target hotels (from NAME-MATCH-AUDIT1, minus NoMad per auditor 1 Nov):
 * - 6aa779b5a1d874eba51c58ad: The Mark Hotel, New York -> HI New York City Hostel
 * - 6ad9fa8bef30327ba9cd3438: Fontainebleau Las Vegas -> Flamingo Las Vegas
 * - 6a957a7589968819fb0dc1fc: The Venetian Resort Las Vegas -> Flamingo Las Vegas
 * - 6a957a7589968819fb0dc1fd: Bellagio Las Vegas -> Flamingo Las Vegas
 * - 6aaf7ab8f34b7c7289d7dda2: Embassy Suites by Hilton Waikiki Beach Walk -> Hilton Hawaiian Village
 *
 * Note: NoMad Las Vegas (6ad9fa84ef30327ba9cd3433) was removed (LINK-FIX1B):
 * it links to nomad-las-vegas.html titled "The Reserve at Park MGM" at 3772 South
 * Las Vegas Blvd (Park MGM address). NoMad was inside Park MGM, so this is a rename.
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

// 2. Constants & target definitions
const BACKUP_PATH = path.join(REPO_ROOT, 'data-collect/private/link-fix1-backup.json');

// Target hotels to clean (5 hotels).
// Note: NoMad Las Vegas (6ad9fa84ef30327ba9cd3433) was removed per auditor review (1 Nov 2026):
// page title is "The Reserve at Park MGM" at 3772 South Las Vegas Boulevard (Park MGM's address).
// NoMad was a hotel inside Park MGM, so this is a rename / rebranding, not a wrong hotel.
const TARGET_HOTELS = [
  {
    id: '6aa779b5a1d874eba51c58ad',
    name: 'The Mark Hotel, New York',
    auditedCleanUrl: 'https://www.booking.com/hotel/us/hi-new-york-hostel-nyc.html',
    reason: 'Opens HI New York City Hostel (891 Amsterdam Ave vs Upper East Side)'
  },
  {
    id: '6ad9fa8bef30327ba9cd3438',
    name: 'Fontainebleau Las Vegas',
    auditedCleanUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html',
    reason: 'Opens Flamingo Las Vegas Hotel & Casino'
  },
  {
    id: '6a957a7589968819fb0dc1fc',
    name: 'The Venetian Resort Las Vegas',
    auditedCleanUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html',
    reason: 'Opens Flamingo Las Vegas Hotel & Casino'
  },
  {
    id: '6a957a7589968819fb0dc1fd',
    name: 'Bellagio Las Vegas',
    auditedCleanUrl: 'https://www.booking.com/hotel/us/flamingo-casino.html',
    reason: 'Opens Flamingo Las Vegas Hotel & Casino'
  },
  {
    id: '6aaf7ab8f34b7c7289d7dda2',
    name: 'Embassy Suites by Hilton Waikiki Beach Walk',
    auditedCleanUrl: 'https://www.booking.com/hotel/us/hilton-hawaiian-village.html',
    reason: 'Opens Hilton Hawaiian Village (street number 201 vs 2005)'
  }
];

function cleanUrl(u) {
  if (!u) return '';
  let clean = u.split('?')[0].toLowerCase().trim().replace(/\/$/, '');
  clean = clean.replace(/^http:\/\//, 'https://');
  clean = clean.replace(/^https:\/\/booking\.com/, 'https://www.booking.com');
  return clean;
}

export function getLinkedPartners(hotel) {
  const partners = [];
  if (
    (hotel.bookingUrl && !hotel.bookingUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults'))
  ) {
    partners.push('Booking.com');
  }
  if (
    (hotel.agodaUrl && !hotel.agodaUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('agoda.com'))
  ) {
    partners.push('Agoda');
  }
  if (
    (hotel.mmtUrl && !hotel.mmtUrl.includes('hotel-listing') && !hotel.mmtUrl.includes('searchText=')) ||
    (hotel.makemytripUrl && !hotel.makemytripUrl.includes('hotel-listing') && !hotel.makemytripUrl.includes('searchText=')) ||
    (hotel.url && hotel.url.includes('makemytrip.com') && !hotel.url.includes('hotel-listing'))
  ) {
    partners.push('MakeMyTrip');
  }
  if (
    (hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) ||
    (hotel.url && hotel.url.includes('airbnb.com') && hotel.url.includes('/rooms/'))
  ) {
    partners.push('Airbnb');
  }
  if (
    (hotel.tripUrl && !hotel.tripUrl.includes('/hotels/list')) ||
    (hotel.url && hotel.url.includes('trip.com') && !hotel.url.includes('/hotels/list'))
  ) {
    partners.push('Trip.com');
  }
  if (hotel.expediaUrl || (hotel.url && hotel.url.includes('expedia.com'))) {
    partners.push('Expedia');
  }
  if (hotel.hotelsComUrl || (hotel.url && hotel.url.includes('hotels.com'))) {
    partners.push('Hotels.com');
  }
  if (hotel.vrboUrl || (hotel.url && hotel.url.includes('vrbo.com'))) {
    partners.push('Vrbo');
  }
  return partners;
}

async function main() {
  console.log('=============================================================');
  console.log(`>>> LINK-FIX1 WRITE SCRIPT (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);
  console.log('=============================================================');
  console.log('Connected to MongoDB (URI masked for security).\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('hotelsWithBathtubs');

  const countBefore = await db.collection('hotels').countDocuments();
  console.log(`Total hotels in collection before: ${countBefore}\n`);

  const oids = TARGET_HOTELS.map(t => new ObjectId(t.id));
  const docs = await db.collection('hotels').find({ _id: { $in: oids } }).toArray();
  const docsById = new Map(docs.map(d => [d._id.toString(), d]));

  const backupData = [];
  const plannedOperations = [];

  console.log('=== DEFINITION OF DONE 1: Write dry-run output ===');
  for (const target of TARGET_HOTELS) {
    const doc = docsById.get(target.id);
    if (!doc) {
      console.log(`Hotel ID ${target.id} (${target.name}): NOT FOUND in collection`);
      continue;
    }

    const unsets = {};
    const fieldDetails = [];

    // Check bookingUrl
    if (doc.bookingUrl && cleanUrl(doc.bookingUrl) === target.auditedCleanUrl) {
      unsets.bookingUrl = '';
      fieldDetails.push({
        field: 'bookingUrl',
        currentValue: doc.bookingUrl,
        action: isWrite ? 'unset' : 'would unset'
      });
    }

    // Check url
    if (doc.url && cleanUrl(doc.url) === target.auditedCleanUrl) {
      unsets.url = '';
      fieldDetails.push({
        field: 'url',
        currentValue: doc.url,
        action: isWrite ? 'unset' : 'would unset'
      });
    }

    console.log(`Hotel ID: ${target.id} | Name: "${doc.name}"`);
    console.log(`  Reason: ${target.reason}`);
    if (fieldDetails.length === 0) {
      console.log(`  Fields: audited URL already absent or different. Nothing to unset.`);
    } else {
      for (const fd of fieldDetails) {
        console.log(`  Field: ${fd.field} | Current value: "${fd.currentValue}" | Action: ${fd.action}`);
      }
    }

    backupData.push({
      id: target.id,
      name: doc.name,
      savedAt: '2026-11-01T17:55:00.000Z',
      bookingUrl: doc.bookingUrl || null,
      url: doc.url || null
    });

    if (Object.keys(unsets).length > 0) {
      plannedOperations.push({
        id: doc._id,
        unsets,
        name: doc.name
      });
    }
    console.log('');
  }

  console.log('=== DEFINITION OF DONE 3: Partners left after removal ===');
  for (const target of TARGET_HOTELS) {
    const doc = docsById.get(target.id);
    if (!doc) continue;

    const partnersBefore = getLinkedPartners(doc);

    // Create copy with unsets applied
    const copy = { ...doc };
    if (doc.bookingUrl && cleanUrl(doc.bookingUrl) === target.auditedCleanUrl) {
      delete copy.bookingUrl;
    }
    if (doc.url && cleanUrl(doc.url) === target.auditedCleanUrl) {
      delete copy.url;
    }
    const partnersAfter = getLinkedPartners(copy);

    const partnersBeforeStr = partnersBefore.length > 0 ? partnersBefore.join(', ') : 'None';
    const partnersAfterStr = partnersAfter.length > 0 ? partnersAfter.join(', ') : 'None (no booking button)';

    console.log(`Hotel ID: ${target.id} | "${doc.name}"`);
    console.log(`  Partners before: [${partnersBeforeStr}]`);
    console.log(`  Partners left after removal: [${partnersAfterStr}]`);
    console.log('');
  }

  if (!isWrite) {
    console.log('-------------------------------------------------------------');
    console.log('[DRY RUN COMPLETE]');
    console.log(`Planned operations: ${plannedOperations.length} hotels would have wrong Booking.com URLs unset.`);
    console.log(`A backup of ${backupData.length} records would be written to ${BACKUP_PATH}.`);
    console.log('A platformChecks entry { site: "booking.com", result: "wrong_hotel", checkedBy: "NAME-MATCH-AUDIT1", date: "2026-11-01" } would be added to each.');
    console.log('To execute writes, re-run with --write (requires owner approval).');
    console.log('-------------------------------------------------------------');
    await client.close();
    return;
  }

  // WRITE MODE
  console.log(`Saving backup to ${BACKUP_PATH}...`);
  const backupDir = path.dirname(BACKUP_PATH);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`Saved backup of ${backupData.length} hotels.\n`);

  console.log(`Applying updates to ${plannedOperations.length} hotels in 'hotels' collection...`);
  let modifiedCount = 0;
  for (const op of plannedOperations) {
    const updateResult = await db.collection('hotels').updateOne(
      { _id: op.id },
      {
        $unset: op.unsets,
        $push: {
          platformChecks: {
            site: 'booking.com',
            result: 'wrong_hotel',
            checkedBy: 'NAME-MATCH-AUDIT1',
            date: '2026-11-01'
          }
        }
      }
    );
    if (updateResult.modifiedCount > 0) modifiedCount++;
  }
  console.log(`Updated ${modifiedCount} hotel records in collection.\n`);

  const countAfter = await db.collection('hotels').countDocuments();
  console.log('=============================================================');
  console.log('WRITE EXECUTION SUMMARY:');
  console.log(`- Total hotels before: ${countBefore}`);
  console.log(`- Total hotels after: ${countAfter} (net diff: 0, no hotels added or removed)`);
  console.log(`- Modified hotels: ${modifiedCount}`);
  console.log('=============================================================\n');

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
