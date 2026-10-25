// Uploads the hotel and blog data snapshot to R2 so the cloud build can run without database access.
// Run `npm run data:refresh` (which regenerates the snapshot from MongoDB first), not this file alone.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(rootDir, '.env.local'), quiet: true });
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
const bucket = process.env.R2_BUCKET_NAME || 'dreamwave';
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) { console.error('R2 credentials missing in .env.local'); process.exit(1); }

const s3 = new S3Client({ region: 'auto', endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY } });
const files = ['all-hotels.json', 'all-blogs.json'];
const manifest = { createdAt: new Date().toISOString(), files: {} };

for (const f of files) {
  const raw = fs.readFileSync(path.join(rootDir, '.cache', f));
  const count = JSON.parse(raw).length;
  const body = zlib.gzipSync(raw, { level: 9 });
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: `hotelswithbathtubs/data/${f}.gz`, Body: body, ContentType: 'application/gzip', CacheControl: 'no-cache' }));
  manifest.files[f] = { count, bytes: body.length };
  console.log(`uploaded ${f}.gz: ${count} records, ${(body.length / 1024).toFixed(0)} KB`);
}
await s3.send(new PutObjectCommand({ Bucket: bucket, Key: 'hotelswithbathtubs/data/manifest.json', Body: JSON.stringify(manifest, null, 2), ContentType: 'application/json', CacheControl: 'no-cache' }));
console.log('snapshot manifest:', JSON.stringify(manifest));
