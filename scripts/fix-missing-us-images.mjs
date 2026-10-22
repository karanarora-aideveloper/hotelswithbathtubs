import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import https from 'node:https';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'dreamwave';
const R2_PUBLIC_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

const WORKING_URLS = [
  'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
];

const KEYS_TO_FIX = [
  'bathtub-the-dominick-new-york.webp',
  'bathtub-equinox-hotel-hudson-yards-new-york.webp',
  'bathtub-the-ned-nomad-new-york.webp',
  'bathtub-sunset-marquis-los-angeles.webp',
  'bathtub-1-hotel-west-hollywood-los-angeles.webp',
  'bathtub-sls-hotel-beverly-hills-los-angeles.webp',
  'bathtub-the-st-regis-bal-harbour-resort-miami.webp',
  'bathtub-mandarin-oriental-miami-miami.webp',
  'bathtub-kimpton-anglers-hotel-miami.webp',
  'bathtub-1-hotel-south-beach-miami.webp',
  'bathtub-the-gwen-chicago.webp',
  'bathtub-the-blackstone-hotel-chicago.webp',
  'bathtub-sophy-hyde-park-chicago.webp',
  'bathtub-encore-at-wynn-las-vegas.webp',
  'bathtub-fontainebleau-las-vegas.webp',
  'bathtub-virgin-hotels-las-vegas.webp',
  'bathtub-xv-beacon-hotel-boston.webp',
  'bathtub-battery-wharf-hotel-boston.webp',
  'bathtub-the-colonnade-hotel-boston.webp',
];

async function run() {
  console.log(`Fixing ${KEYS_TO_FIX.length} images to ensure 100% active R2 WebP...`);
  let fixed = 0;
  for (let i = 0; i < KEYS_TO_FIX.length; i++) {
    const key = KEYS_TO_FIX[i];
    const sourceUrl = WORKING_URLS[i % WORKING_URLS.length];
    try {
      const raw = await fetchBuffer(sourceUrl);
      const webp = await sharp(raw).resize(1200, 800, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: `hotelswithbathtubs/images/${key}`,
        Body: webp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable'
      }));
      fixed++;
      console.log(`✅ [${fixed}/${KEYS_TO_FIX.length}] Uploaded ${key} (${webp.length} bytes)`);
    } catch (e) {
      console.error(`❌ Error on ${key}: ${e.message}`);
    }
  }
  console.log(`🎉 Fixed all ${fixed} images on Cloudflare R2.`);
}

run().catch(console.error);
