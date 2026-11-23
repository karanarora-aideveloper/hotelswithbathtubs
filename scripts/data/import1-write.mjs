#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWriteMode = process.argv.includes('--write');

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const candidatePaths = [
    '/Users/karanarora/my_brain/01_startups/hotelswithbathtubs/.env.local',
    path.resolve(__dirname, '../../../../hotelswithbathtubs/.env.local'),
    path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local'),
    path.resolve(process.cwd(), '.env.local')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^MONGODB_URI=(.*)$/);
        if (m) {
          return m[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  throw new Error('MONGODB_URI not found in environment or .env.local');
}

const inputPath = path.resolve(__dirname, '../../data-collect/private/us-new-hotels.json');
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found at ${inputPath}`);
  process.exit(1);
}

const rawHotels = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
console.log(`Loaded ${rawHotels.length} candidate hotel records from us-new-hotels.json`);

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Generate unique keys with deterministic discriminator for collisions
const seenKeys = new Map();
function generateKey(name, town, state) {
  const baseKey = `${norm(name)}|${norm(town)}|${norm(state)}`;
  if (!seenKeys.has(baseKey)) {
    seenKeys.set(baseKey, 1);
    return baseKey;
  }
  const count = seenKeys.get(baseKey) + 1;
  seenKeys.set(baseKey, count);
  return `${baseKey}|${count}`;
}

const now = new Date();
const preparedDocs = rawHotels.map(h => {
  const key = generateKey(h.name, h.town, h.state);
  return {
    key,
    name: h.name || '',
    brand: h.brand || null,
    stars: h.stars || null,
    address: {
      street: h.address?.street || '',
      locality: h.address?.locality || '',
      region: h.address?.region || '',
      country: 'US',
      formatted: h.address?.formatted || ''
    },
    geo: (h.geo && h.geo.lat != null && h.geo.lng != null) ? { lat: h.geo.lat, lng: h.geo.lng } : null,
    town: h.town || null,
    state: h.state || null,
    citySlug: h.citySlug || null,
    nearCity: h.nearCity || null,
    tubPlacement: h.tubPlacement || null,
    tubPlacementLabel: h.tubPlacementLabel || null,
    roomName: h.verifiedRoomName || null,
    roomMeta: h.roomMeta || null,
    ...(h.variants && h.variants.length > 0 ? { variants: h.variants } : {}),
    bathtubConfirmed: false,
    roomNameStatus: 'unconfirmed',
    status: 'hidden',
    bookingLinks: [],
    factSource: {
      source: 'tubhotels',
      url: h.factSource?.url || h.sourceUrl,
      seenAt: '2026-10-27'
    },
    importBatch: 'IMPORT1-2026-10-28',
    createdAt: now,
    updatedAt: now
  };
});

async function main() {
  const uri = getMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log(`Connected to database: ${db.databaseName}`);

  // 1. Record Before Counts
  const hotelsCol = db.collection('hotels');
  const candidatesCol = db.collection('hotel_candidates');

  const beforeHotelsCount = await hotelsCol.countDocuments();
  const collections = await db.listCollections().toArray();
  const candidatesExists = collections.some(c => c.name === 'hotel_candidates');
  const beforeCandidatesCount = candidatesExists ? await candidatesCol.countDocuments() : 0;
  const beforeUsaHotelsCount = await hotelsCol.countDocuments({
    $or: [
      { countrySlug: 'usa' },
      { country: { $regex: /^united states$/i } },
      { country: { $regex: /^usa$/i } }
    ]
  });

  console.log('\n--- BEFORE COUNTS ---');
  console.log(`hotels collection count: ${beforeHotelsCount}`);
  console.log(`hotel_candidates collection count: ${beforeCandidatesCount}`);
  console.log(`hotels collection matching USA: ${beforeUsaHotelsCount}`);

  if (!isWriteMode) {
    // DRY RUN MODE
    console.log('\n--- DRY RUN EXECUTION ---');
    console.log('Mode: DRY RUN (no writes performed, use --write to execute)');

    const existingKeys = new Set(
      candidatesExists ? (await candidatesCol.find({}, { projection: { key: 1 } }).toArray()).map(d => d.key) : []
    );

    let wouldInsert = 0;
    let wouldUpdate = 0;
    for (const doc of preparedDocs) {
      if (existingKeys.has(doc.key)) {
        wouldUpdate++;
      } else {
        wouldInsert++;
      }
    }

    console.log(`Dry run projection:`);
    console.log(`  Would insert: ${wouldInsert}`);
    console.log(`  Would update: ${wouldUpdate}`);
    console.log(`  Total candidate documents: ${preparedDocs.length}`);

    console.log('\n--- 3 EXAMPLE DOCUMENTS ---');
    console.log('Example 1 (City page attached):');
    const ex1 = preparedDocs.find(d => d.citySlug !== null) || preparedDocs[0];
    console.log(JSON.stringify(ex1, null, 2));

    console.log('\nExample 2 (Suburb with nearCity):');
    const ex2 = preparedDocs.find(d => d.nearCity !== null) || preparedDocs[1];
    console.log(JSON.stringify(ex2, null, 2));

    console.log('\nExample 3 (New town):');
    const ex3 = preparedDocs.find(d => !d.citySlug && !d.nearCity) || preparedDocs[2];
    console.log(JSON.stringify(ex3, null, 2));

    console.log('\n[DRY RUN] Complete. No changes made to database. Pass --write to execute.');
    await client.close();
    return;
  }

  // WRITE MODE
  console.log('\n--- WRITE EXECUTION (--write) ---');
  console.log('Mode: WRITE');

  // Ensure unique index on key
  console.log('Ensuring unique index on { key: 1 } in hotel_candidates...');
  await candidatesCol.createIndex({ key: 1 }, { unique: true });
  console.log('Unique index on key verified.');

  const BATCH_SIZE = 1000;
  let totalUpserted = 0;
  let totalMatched = 0;
  let totalModified = 0;

  for (let i = 0; i < preparedDocs.length; i += BATCH_SIZE) {
    const chunk = preparedDocs.slice(i, i + BATCH_SIZE);
    const ops = chunk.map(doc => ({
      updateOne: {
        filter: { key: doc.key },
        update: {
          $set: {
            key: doc.key,
            name: doc.name,
            brand: doc.brand,
            stars: doc.stars,
            address: doc.address,
            geo: doc.geo,
            town: doc.town,
            state: doc.state,
            citySlug: doc.citySlug,
            nearCity: doc.nearCity,
            tubPlacement: doc.tubPlacement,
            tubPlacementLabel: doc.tubPlacementLabel,
            roomName: doc.roomName,
            roomMeta: doc.roomMeta,
            ...(doc.variants ? { variants: doc.variants } : {}),
            bathtubConfirmed: false,
            roomNameStatus: 'unconfirmed',
            status: 'hidden',
            bookingLinks: doc.bookingLinks,
            factSource: doc.factSource,
            importBatch: doc.importBatch,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        upsert: true
      }
    }));

    const result = await candidatesCol.bulkWrite(ops, { ordered: false });
    totalUpserted += result.upsertedCount;
    totalMatched += result.matchedCount;
    totalModified += result.modifiedCount;
    console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(preparedDocs.length / BATCH_SIZE)}: ${chunk.length} items (upserted: ${result.upsertedCount}, matched: ${result.matchedCount})`);
  }

  console.log('\n--- WRITE RESULTS ---');
  console.log(`Total documents processed: ${preparedDocs.length}`);
  console.log(`Inserted (upserted): ${totalUpserted}`);
  console.log(`Updated (matched): ${totalMatched}`);

  // 2. Record After Counts
  const afterHotelsCount = await hotelsCol.countDocuments();
  const afterCandidatesCount = await candidatesCol.countDocuments();
  const afterCandidatesHiddenCount = await candidatesCol.countDocuments({
    status: 'hidden',
    bathtubConfirmed: false
  });
  const afterUsaHotelsCount = await hotelsCol.countDocuments({
    $or: [
      { countrySlug: 'usa' },
      { country: { $regex: /^united states$/i } },
      { country: { $regex: /^usa$/i } }
    ]
  });

  console.log('\n--- AFTER COUNTS ---');
  console.log(`hotels collection count: ${afterHotelsCount} (unchanged: ${afterHotelsCount === beforeHotelsCount})`);
  console.log(`hotel_candidates collection count: ${afterCandidatesCount} (expected: 6035)`);
  console.log(`hotel_candidates hidden & unconfirmed: ${afterCandidatesHiddenCount}`);
  console.log(`hotels collection matching USA: ${afterUsaHotelsCount} (unchanged: ${afterUsaHotelsCount === beforeUsaHotelsCount})`);

  // Print 3 example stored documents
  console.log('\n--- 3 EXAMPLE STORED DOCUMENTS ---');
  const ex1 = await candidatesCol.findOne({ citySlug: { $ne: null } }, { projection: { _id: 0 } });
  console.log('Example 1 (City page attached):');
  console.log(JSON.stringify(ex1, null, 2));

  const ex2 = await candidatesCol.findOne({ nearCity: { $ne: null } }, { projection: { _id: 0 } });
  console.log('\nExample 2 (Suburb with nearCity):');
  console.log(JSON.stringify(ex2, null, 2));

  const ex3 = await candidatesCol.findOne({ citySlug: null, nearCity: null }, { projection: { _id: 0 } });
  console.log('\nExample 3 (New town):');
  console.log(JSON.stringify(ex3, null, 2));

  await client.close();
}

main().catch(err => {
  console.error('Fatal error during execution:', err);
  process.exit(1);
});
