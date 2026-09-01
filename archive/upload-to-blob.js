#!/usr/bin/env node
/**
 * Helper script for Python scrapers to upload images to Vercel Blob
 *
 * Usage from Python:
 *   import subprocess
 *   result = subprocess.run(['node', 'upload-to-blob.js', 'filename.webp'],
 *                           capture_output=True, text=True)
 *   blob_url = result.stdout.strip()
 */

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

async function uploadToBlob(filename) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Fallback to local if no token (for backwards compatibility)
    console.error('');
    process.exit(0);
  }

  // File should be in current directory
  const filepath = path.join(process.cwd(), filename);

  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(filepath);
    const blob = await put(`images/${filename}`, buffer, {
      access: 'public',
      contentType: 'image/webp',
    });

    // Print just the URL (Python script will capture this)
    console.log(blob.url);

    // Delete local file after successful upload
    fs.unlinkSync(filepath);
  } catch (error) {
    console.error(`Failed to upload ${filename}: ${error.message}`);
    process.exit(1);
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node upload-to-blob.js <filename>');
  process.exit(1);
}

uploadToBlob(filename).catch(err => {
  console.error(err);
  process.exit(1);
});
