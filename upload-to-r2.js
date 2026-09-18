const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const filename = process.argv[2];
if (!filename) {
  console.error('Filename argument required');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});

const BUCKET = process.env.R2_BUCKET_NAME || 'dreamwave';
const PREFIX = 'hotelswithbathtubs/images/';
const R2_PUBLIC_URL = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

async function main() {
  const filePath = path.join(__dirname, 'public', 'assets', filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const key = `${PREFIX}${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: 'image/webp',
  }));

  // Clean up local file after successful upload to keep repo clean
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    // ignore
  }

  // Print public URL to stdout for caller
  console.log(`${R2_PUBLIC_URL}${filename}`);
}

main().catch(err => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
