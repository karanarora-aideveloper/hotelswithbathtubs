// scripts/data/emt-in-write.mjs
// EMT-LINKS1: Apply matched EaseMyTrip URLs to live hotels collection.
// DRY RUN by default. Use --write to apply updates.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
const csvPath = path.join(privateDir, 'emt-in-plan.csv');

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

if (!fs.existsSync(csvPath)) {
  console.error(`ERROR: CSV plan file not found at ${csvPath}.`);
  process.exit(1);
}

// Parse CSV with quotes support
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
const lines = csvContent.split('\n');
const header = parseCsvLine(lines[0]);
const rows = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const cols = parseCsvLine(lines[i]);
  const row = {};
  header.forEach((h, idx) => {
    row[h] = cols[idx];
  });
  rows.push(row);
}

const matchRows = rows.filter(r => r.status === 'match' && r['EMT URL']);

console.log('=============================================================');
console.log(`>>> EASEMYTRIP-IN WRITE SCRIPT (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);
console.log('=============================================================\n');

// Masked connection message - NEVER print credentials
console.log('Connected to MongoDB (URI masked for security).');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('hotelsWithBathtubs');

const countBefore = await db.collection('hotels').countDocuments();
const countIndiaBefore = await db.collection('hotels').countDocuments({ country: { $in: ['India', 'IN'] } });
const countWithEmtBefore = await db.collection('hotels').countDocuments({ easemytripUrl: { $exists: true, $ne: '' } });

console.log(`Initial 'hotels' total count: ${countBefore} (India: ${countIndiaBefore})`);
console.log(`Hotels currently having easemytripUrl: ${countWithEmtBefore}`);
console.log(`Loaded ${rows.length} total rows from plan CSV (${matchRows.length} with status 'match').\n`);

if (matchRows.length === 0) {
  console.log('No matched records found to write (matches: 0).');
  console.log('DRY RUN complete. 0 writes executed.');
  await client.close();
  process.exit(0);
}

// Sample planned updates
console.log('Sample planned updates (first 5):');
for (let i = 0; i < Math.min(5, matchRows.length); i++) {
  const r = matchRows[i];
  console.log(`  [${i + 1}/${matchRows.length}] ${r.name} (${r.city})`);
  console.log(`      ID:             ${r['hotel id']}`);
  console.log(`      easemytripUrl:  ${r['EMT URL']}`);
  console.log(`      source:         easemytrip sitemap`);
  console.log(`      date:           2026-11-01`);
}

if (!isWrite) {
  console.log('\n-------------------------------------------------------------');
  console.log('[DRY RUN COMPLETE]');
  console.log(`Hotels to be updated: Exactly ${matchRows.length} records.`);
  console.log(`Field changes per record:`);
  console.log(`  - easemytripUrl: <clean EaseMyTrip URL>`);
  console.log(`  - platformChecks: append { platform: 'easemytrip', result: 'found', url, source: 'easemytrip sitemap', date: '2026-11-01' }`);
  console.log(`Live database writes performed: 0`);
  console.log('To apply writes, re-run with --write (requires owner explicit approval).');
  console.log('-------------------------------------------------------------');
  await client.close();
  process.exit(0);
}

// WRITE MODE
console.log(`\nApplying updates to ${matchRows.length} hotels in 'hotels' collection...`);
let updatedCount = 0;

for (const r of matchRows) {
  let filter = null;
  try {
    filter = { _id: new ObjectId(r['hotel id']) };
  } catch (err) {
    filter = { _id: r['hotel id'] };
  }

  const checkEntry = {
    platform: 'easemytrip',
    result: 'found',
    url: r['EMT URL'],
    source: 'easemytrip sitemap',
    date: '2026-11-01'
  };

  // Safe to run twice: remove any prior easemytrip platformCheck first, then push fresh entry
  await db.collection('hotels').updateOne(
    filter,
    {
      $pull: { platformChecks: { platform: 'easemytrip' } }
    }
  );

  const res = await db.collection('hotels').updateOne(
    filter,
    {
      $set: { easemytripUrl: r['EMT URL'] },
      $push: { platformChecks: checkEntry }
    }
  );

  if (res.matchedCount > 0) {
    updatedCount++;
  }
}

const countAfter = await db.collection('hotels').countDocuments();
const countWithEmtAfter = await db.collection('hotels').countDocuments({ easemytripUrl: { $exists: true, $ne: '' } });

console.log(`\nSuccessfully updated ${updatedCount} hotels.`);
console.log(`Hotels collection total count after: ${countAfter} (change: ${countAfter - countBefore})`);
console.log(`Hotels having easemytripUrl after: ${countWithEmtAfter} (change: ${countWithEmtAfter - countWithEmtBefore})`);

await client.close();
