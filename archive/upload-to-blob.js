#!/usr/bin/env node
/**
 * Helper script for Python scrapers to upload images to Cloudflare R2
 *
 * Usage from Python:
 *   import subprocess
 *   result = subprocess.run(['node', 'upload-to-blob.js', 'filename.webp'],
 *                           capture_output=True, text=True)
 *   r2_url = result.stdout.strip()
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function uploadToStorage(filename) {
  if (!process.env.R2_SECRET_ACCESS_KEY) {
    console.error('R2 credentials not set');
    process.exit(0);
  }

  const filepath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(filepath);
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const bucket = process.env.R2_BUCKET_NAME || 'dreamwave';
    const key = `hotelswithbathtubs/images/${filename}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
    }));

    const publicUrl = `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/${filename}`;
    console.log(publicUrl);

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

uploadToStorage(filename).catch(err => {
  console.error(err);
  process.exit(1);
});
