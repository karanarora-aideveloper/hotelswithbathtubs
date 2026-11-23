// scripts/data/guide-write2.mjs
// GUIDE-WRITE2: Write the 5 batch-2 city guides into the Blog collection
// and unpublish the 4 merged posts (CEO Sheet T53).
// Dry run by default. Use --write to write to database.

import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const isWrite = process.argv.includes('--write');

// Load environment from main checkout or current directory
const envCandidates = [
  path.resolve(process.cwd(), '../hotelswithbathtubs/.env.local'),
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

// Import claims checking from main checkout
const claimsModulePath = path.resolve(process.cwd(), '../hotelswithbathtubs/src/lib/claims.ts');
const { hasClaimPhrase } = await import(claimsModulePath);

const draftsDir = path.resolve(process.cwd(), '../hotelswithbathtubs/.agent-bridge/drafts/city-guide-batch2');
if (!fs.existsSync(draftsDir)) {
  console.error(`ERROR: Drafts directory not found at ${draftsDir}`);
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  readPreference: 'secondaryPreferred'
});
await client.connect();
const db = client.db();

console.log(`[GUIDE-WRITE2] Connected to MongoDB (Mode: ${isWrite ? 'WRITE' : 'DRY RUN'})`);

const UPDATE_SPECS = [
  { file: 'bangkok.md', slug: 'hotels-with-bathtubs-in-bangkok' },
  { file: 'manali.md', slug: 'manali-hotels-with-bathtub' },
  { file: 'singapore.md', slug: 'hotels-with-bathtubs-in-singapore' },
  { file: 'rishikesh.md', slug: 'hotel-with-bathtub-in-rishikesh' },
  { file: 'london.md', slug: 'hotels-with-bath-in-bedroom-london' }
];

const UNPUBLISH_SLUGS = [
  'manali-munnar-honeymoon-jacuzzi-resorts',
  'best-hotels-in-manali-for-honeymoon-with-bathtubs',
  'hotels-with-bathtubs-in-london',
  'londons-most-historic-hotels-with-deep-soaking-tubs'
];

const allTargetSlugs = [...UPDATE_SPECS.map(u => u.slug), ...UNPUBLISH_SLUGS];

// 1. Fetch current documents for all 9 target slugs
const currentDocs = await db.collection('blogs').find({ slug: { $in: allTargetSlugs } }).toArray();
const docMap = new Map(currentDocs.map(d => [d.slug, d]));

console.log(`Target slugs to touch: ${allTargetSlugs.length} (5 updates, 4 unpublishes)`);
console.log(`Documents found in database: ${currentDocs.length}`);

const missingSlugs = allTargetSlugs.filter(s => !docMap.has(s));
if (missingSlugs.length > 0) {
  console.error(`FATAL: Missing slugs in database: ${missingSlugs.join(', ')}`);
  await client.close();
  process.exit(1);
}

// 2. Prepare full JSON backup of the 9 documents before any write
const backupPath = path.resolve(process.cwd(), '.cache/guide-write2-backup.json');
const cacheDir = path.dirname(backupPath);
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}
fs.writeFileSync(backupPath, JSON.stringify(currentDocs, null, 2), 'utf8');
console.log(`Saved backup of all ${currentDocs.length} documents to: ${backupPath}`);

// 3. Process the 5 updates from markdown files
const updatePlans = [];
for (const spec of UPDATE_SPECS) {
  const filePath = path.join(draftsDir, spec.file);
  if (!fs.existsSync(filePath)) {
    console.error(`FATAL: File not found: ${filePath}`);
    await client.close();
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  // H1 title
  const h1Match = lines[0].match(/^#\s+(.+)$/);
  if (!h1Match) {
    console.error(`FATAL: No H1 title on line 1 in ${spec.file}`);
    await client.close();
    process.exit(1);
  }
  const newTitle = h1Match[1].trim();

  // Verify slug comment
  const slugMatch = raw.match(/<!--\s*slug:\s*([^\s>]+)\s*-->/);
  if (!slugMatch || slugMatch[1].trim() !== spec.slug) {
    console.error(`FATAL: Slug comment mismatch in ${spec.file}. Expected ${spec.slug}, found ${slugMatch ? slugMatch[1] : 'none'}`);
    await client.close();
    process.exit(1);
  }

  // First R2 image
  const r2Match = raw.match(/https:\/\/pub-c12991664bbf475e918cb03e3ac5b910\.r2\.dev\/hotelswithbathtubs\/images\/[^\s\)\"\']+/i);
  if (!r2Match) {
    console.error(`FATAL: No R2 image found in ${spec.file}`);
    await client.close();
    process.exit(1);
  }
  const newImage = r2Match[0];

  // Body content: strip H1 line and slug comment
  const bodyLines = lines.filter((l, idx) => {
    if (idx === 0 && l.startsWith('#')) return false;
    if (l.includes('<!-- slug:')) return false;
    return true;
  });
  const newContent = bodyLines.join('\n').trim();

  // Excerpt: opening 1-2 sentences
  const proseLines = newContent.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('!'));
  const firstParagraph = proseLines.slice(0, 2).join(' ').replace(/\s+/g, ' ').trim();
  const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || [];
  const newExcerpt = (sentences.slice(0, 2).join(' ') || firstParagraph).replace(/\s+/g, ' ').trim();

  // Check claims
  if (hasClaimPhrase(newExcerpt)) {
    console.error(`FATAL: hasClaimPhrase triggered on excerpt for ${spec.file}`);
    await client.close();
    process.exit(1);
  }
  if (hasClaimPhrase(newContent)) {
    console.error(`FATAL: hasClaimPhrase triggered on content for ${spec.file}`);
    await client.close();
    process.exit(1);
  }

  const oldDoc = docMap.get(spec.slug);
  const oldWords = oldDoc.content ? oldDoc.content.split(/\s+/).filter(Boolean).length : 0;
  const newWords = newContent.split(/\s+/).filter(Boolean).length;

  updatePlans.push({
    slug: spec.slug,
    file: spec.file,
    oldDoc,
    newTitle,
    newContent,
    newExcerpt,
    newImage,
    oldWords,
    newWords,
    fieldsChanging: ['title', 'content', 'excerpt', 'image', 'updatedAt']
  });
}

// 4. Process the 4 unpublishes
const unpublishPlans = [];
for (const slug of UNPUBLISH_SLUGS) {
  const oldDoc = docMap.get(slug);
  const oldWords = oldDoc.content ? oldDoc.content.split(/\s+/).filter(Boolean).length : 0;

  unpublishPlans.push({
    slug,
    oldDoc,
    oldTitle: oldDoc.title,
    oldWords,
    oldPublished: oldDoc.published,
    newPublished: false,
    fieldsChanging: ['published', 'updatedAt']
  });
}

// 5. Print dry run plan
console.log('\n======================================================');
console.log('DRY RUN PLAN: 5 UPDATES');
console.log('======================================================');
updatePlans.forEach((p, i) => {
  console.log(`[${i + 1}/5] Slug: ${p.slug} (${p.file})`);
  console.log(`  Fields changing: [${p.fieldsChanging.join(', ')}]`);
  console.log(`  Old Title: "${p.oldDoc.title}"`);
  console.log(`  New Title: "${p.newTitle}"`);
  console.log(`  Old Words: ${p.oldWords} -> New Words: ${p.newWords}`);
  console.log(`  Published: ${p.oldDoc.published} -> true (kept true)`);
  console.log(`  Image:     ${p.newImage}`);
  console.log(`  Excerpt:   "${p.newExcerpt}"`);
});

console.log('\n======================================================');
console.log('DRY RUN PLAN: 4 UNPUBLISHES');
console.log('======================================================');
unpublishPlans.forEach((p, i) => {
  console.log(`[${i + 1}/4] Slug: ${p.slug}`);
  console.log(`  Fields changing: [${p.fieldsChanging.join(', ')}]`);
  console.log(`  Title:     "${p.oldTitle}"`);
  console.log(`  Words:     ${p.oldWords}`);
  console.log(`  Published: ${p.oldPublished} -> false`);
});

const countPublishedBefore = await db.collection('blogs').countDocuments({ published: true });
const countTotalBefore = await db.collection('blogs').countDocuments();
console.log(`\nCurrent database counts: Total blogs = ${countTotalBefore}, Published blogs = ${countPublishedBefore}`);

if (!isWrite) {
  console.log('\n------------------------------------------------------');
  console.log('[DRY RUN COMPLETE]');
  console.log('What would be touched: Exactly 5 updates and 4 unpublishes (9 documents total).');
  console.log('Database writes performed: 0 writes made.');
  console.log(`Published blogs would change: ${countPublishedBefore} -> ${countPublishedBefore - unpublishPlans.filter(p => p.oldPublished === true).length}`);
  console.log('To execute database writes, re-run with --write.');
  console.log('------------------------------------------------------\n');
  await client.close();
  process.exit(0);
}

// ==============================================================
// WRITE MODE EXECUTION (Executed with --write)
// ==============================================================
console.log('\nStarting WRITE execution for 5 updates and 4 unpublishes...');

const now = new Date();

// Execute updates
let updatedCount = 0;
for (const p of updatePlans) {
  await db.collection('blogs').updateOne(
    { _id: p.oldDoc._id },
    {
      $set: {
        title: p.newTitle,
        content: p.newContent,
        excerpt: p.newExcerpt,
        image: p.newImage,
        updatedAt: now
      }
    }
  );
  updatedCount++;
}
console.log(`Updated ${updatedCount} city guide posts in 'blogs' collection.`);

// Execute unpublishes
let unpublishedCount = 0;
for (const p of unpublishPlans) {
  await db.collection('blogs').updateOne(
    { _id: p.oldDoc._id },
    {
      $set: {
        published: false,
        updatedAt: now
      }
    }
  );
  unpublishedCount++;
}
console.log(`Unpublished ${unpublishedCount} merged posts in 'blogs' collection.`);

// Verify counts after
const countPublishedAfter = await db.collection('blogs').countDocuments({ published: true });
const countTotalAfter = await db.collection('blogs').countDocuments();
const publishedDrop = countPublishedBefore - countPublishedAfter;

console.log('\n======================================================');
console.log('WRITE COMPLETE — FINAL COUNTS:');
console.log(`- Total blogs:     ${countTotalBefore} -> ${countTotalAfter} (diff: 0)`);
console.log(`- Published blogs: ${countPublishedBefore} -> ${countPublishedAfter} (drop: -${publishedDrop})`);
console.log('======================================================\n');

// 6. Re-read the 9 documents from database
console.log('======================================================');
console.log('RE-READ TABLE (ALL 9 TOUCHED DOCUMENTS):');
console.log('slug | published | title | content word count | updatedAt');
console.log('------------------------------------------------------');

for (const slug of allTargetSlugs) {
  const current = await db.collection('blogs').findOne({ slug });
  const words = current?.content ? current.content.split(/\s+/).filter(Boolean).length : 0;
  const updatedIso = current?.updatedAt?.toISOString ? current.updatedAt.toISOString() : current?.updatedAt;
  console.log(`${current?.slug} | ${current?.published} | ${current?.title} | ${words} | ${updatedIso}`);
}
console.log('======================================================\n');

await client.close();
