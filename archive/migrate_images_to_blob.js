#!/usr/bin/env node
/**
 * Migrate all images from /public/assets to Vercel Blob
 *
 * This script:
 * 1. Reads all images from /public/assets
 * 2. Uploads each to Vercel Blob
 * 3. Creates a mapping file of old paths → new Blob URLs
 * 4. Can be used to update database references
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { put } = require('@vercel/blob');

const ASSETS_DIR = path.join(__dirname, './public/assets');
const BLOB_PREFIX = 'images/'; // All images go into /images/ folder in Blob

async function migrateImages() {
  console.log('🚀 Starting image migration to Vercel Blob...\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable not set');
    console.error('   Get your token from: https://vercel.com/account/storage/blob/tokens');
    process.exit(1);
  }

  // Read all files from /public/assets
  const files = fs.readdirSync(ASSETS_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.webp', '.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });

  console.log(`📸 Found ${files.length} images to migrate\n`);

  const urlMapping = {}; // Track old path → new Blob URL
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = path.join(ASSETS_DIR, filename);
    const fileContent = fs.readFileSync(filepath);
    const blobPath = `${BLOB_PREFIX}${filename}`;

    try {
      const blob = await put(blobPath, fileContent, {
        access: 'public', // Make images publicly accessible
        contentType: getContentType(filename),
        allowOverwrite: true,
      });

      urlMapping[`/assets/${filename}`] = blob.url;
      uploaded++;

      if ((i + 1) % 100 === 0) {
        console.log(`✓ Uploaded ${i + 1}/${files.length} images...`);
      }
    } catch (error) {
      console.error(`✗ Failed to upload ${filename}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   ✓ Uploaded: ${uploaded}`);
  console.log(`   ✗ Failed: ${failed}`);

  // Save mapping for reference
  const mappingFile = path.join(__dirname, '../_blob_url_mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(urlMapping, null, 2));
  console.log(`\n💾 Mapping saved to: _blob_url_mapping.json`);
  console.log(`   Use this to update database image URLs if needed\n`);

  return urlMapping;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
  };
  return types[ext] || 'application/octet-stream';
}

// Run migration
migrateImages().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
