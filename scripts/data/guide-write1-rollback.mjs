// scripts/data/guide-write1-rollback.mjs
// Rollback script for GUIDE-WRITE1 (CEO Sheet T53).
// Restores the 10 touched Blog documents from .cache/guide-write1-backup.json.
// Dry run by default. Use --write to restore to database.

import fs from 'fs';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
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

const backupPath = path.resolve(process.cwd(), '.cache/guide-write1-backup.json');

console.log(`[GUIDE-WRITE1 Rollback] Mode: ${isWrite ? 'WRITE (RESTORE)' : 'DRY RUN'}`);

if (!fs.existsSync(backupPath)) {
  console.log(`Backup file not found at ${backupPath}. Nothing to roll back.`);
  process.exit(0);
}

const backupDocs = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
console.log(`Loaded ${backupDocs.length} documents from backup: ${backupPath}`);

if (backupDocs.length !== 10) {
  console.error(`WARNING: Expected 10 documents in backup, found ${backupDocs.length}`);
}

console.log('\nBackup documents to restore:');
backupDocs.forEach((doc, idx) => {
  const wordCount = doc.content ? doc.content.split(/\s+/).filter(Boolean).length : 0;
  console.log(`  [${idx + 1}/10] ${doc.slug} | published: ${doc.published} | title: "${doc.title}" | words: ${wordCount}`);
});

if (!isWrite) {
  console.log('\n------------------------------------------------------');
  console.log('[DRY RUN COMPLETE]');
  console.log(`Exactly ${backupDocs.length} documents would be restored to their pre-guide-write1 state.`);
  console.log('To execute restore to database, re-run with --write.');
  console.log('------------------------------------------------------\n');
  process.exit(0);
}

// WRITE MODE
console.log('\nConnecting to MongoDB to execute rollback restore...');
const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  readPreference: 'secondaryPreferred'
});
await client.connect();
const db = client.db();

const countPublishedBefore = await db.collection('blogs').countDocuments({ published: true });
console.log(`Published blogs before rollback: ${countPublishedBefore}`);

let restoredCount = 0;
for (const doc of backupDocs) {
  const cleanDoc = { ...doc };
  if (cleanDoc._id) {
    cleanDoc._id = new ObjectId(cleanDoc._id);
  }
  if (cleanDoc.createdAt) cleanDoc.createdAt = new Date(cleanDoc.createdAt);
  if (cleanDoc.updatedAt) cleanDoc.updatedAt = new Date(cleanDoc.updatedAt);

  await db.collection('blogs').replaceOne(
    { _id: cleanDoc._id },
    cleanDoc,
    { upsert: true }
  );
  restoredCount++;
}

console.log(`Successfully restored ${restoredCount} documents.`);

const countPublishedAfter = await db.collection('blogs').countDocuments({ published: true });
console.log(`Published blogs after rollback: ${countPublishedAfter}`);

console.log('\n======================================================');
console.log('ROLLBACK COMPLETE — RE-READ VERIFICATION TABLE:');
console.log('slug | published | title | content word count | updatedAt');
console.log('------------------------------------------------------');

for (const b of backupDocs) {
  const current = await db.collection('blogs').findOne({ slug: b.slug });
  const words = current?.content ? current.content.split(/\s+/).filter(Boolean).length : 0;
  console.log(`${current?.slug} | ${current?.published} | ${current?.title} | ${words} | ${current?.updatedAt?.toISOString ? current.updatedAt.toISOString() : current?.updatedAt}`);
}
console.log('======================================================\n');

await client.close();
