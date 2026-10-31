// scripts/data/slug-fix-write.mjs
// SLUG-FIX-INDIA: Apply planned slug fixes to hotels collection.
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
const csvPath = path.join(privateDir, 'slug-fix-plan.csv');

const isWrite = process.argv.includes('--write');

// Load environment from main checkout or current directory
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
  console.error(`ERROR: CSV plan file not found at ${csvPath}. Run slug-fix-plan.mjs first.`);
  process.exit(1);
}

// Parse CSV
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

const okRows = rows.filter(r => r.status === 'ok');

console.log('=============================================================');
console.log(`>>> SLUG-FIX WRITE SCRIPT (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);
console.log('=============================================================\n');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const countBefore = await db.collection('hotels').countDocuments();
console.log(`Initial 'hotels' collection count: ${countBefore}`);
console.log(`Loaded ${rows.length} total rows from ${csvPath} (${okRows.length} with status 'ok').\n`);

if (!isWrite) {
  console.log('-------------------------------------------------------------');
  console.log('[DRY RUN COMPLETE]');
  console.log(`Hotels to be updated: Exactly ${okRows.length} records.`);
  console.log(`Field changes per record:`);
  console.log(`  - slug: updated to new_slug`);
  console.log(`  - previousSlugs: adds old_slug to array`);
  console.log(`Database writes performed: 0 writes made.`);
  console.log(`Hotels collection count remains: ${countBefore} (unchanged).`);
  console.log(`To execute database writes, re-run with --write.`);
  console.log('-------------------------------------------------------------\n');
  await client.close();
  process.exit(0);
}

// WRITE MODE EXECUTION (only when approved)
console.log(`Starting WRITE execution for ${okRows.length} hotels...`);
let updatedCount = 0;
let unchangedCount = 0;

for (const r of okRows) {
  const filter = { _id: new ObjectId(r.hotel_id) };
  const update = {
    $set: { slug: r.new_slug },
    $addToSet: { previousSlugs: r.old_slug }
  };
  const res = await db.collection('hotels').updateOne(filter, update);
  if (res.modifiedCount > 0) {
    updatedCount++;
  } else {
    unchangedCount++;
  }
}

const countAfter = await db.collection('hotels').countDocuments();
console.log('\n=============================================================');
console.log('WRITE COMPLETE — FINAL SUMMARY:');
console.log(`- Hotels updated:   ${updatedCount}`);
console.log(`- Hotels unchanged: ${unchangedCount}`);
console.log(`- Collection count: ${countBefore} -> ${countAfter} (net change: ${countAfter - countBefore})`);
console.log('=============================================================\n');

await client.close();
