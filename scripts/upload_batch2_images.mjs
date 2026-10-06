import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'dreamwave';
const PREFIX = 'hotelswithbathtubs/images/';

// Batch 2: US Regional Hubs Cross-Border Cleanup (12 properties)
const BATCH2_IMAGES = [
  // Gatlinburg
  {
    key: 'bathtub-margaritaville-resort-gatlinburg.webp',
    photoId: 9899900,
    label: 'Margaritaville Resort Gatlinburg (Charming rustic whirlpool & jacuzzi)'
  },
  {
    key: 'bathtub-bearskin-lodge-gatlinburg.webp',
    photoId: 38183824,
    label: 'Bearskin Lodge on the River Gatlinburg (Rustic exposed wood beams bathtub suite)'
  },
  {
    key: 'bathtub-the-park-vista-gatlinburg.webp',
    photoId: 27626180,
    label: 'The Park Vista DoubleTree Gatlinburg (Panoramic mountain view jacuzzi bath)'
  },

  // Palm Springs
  {
    key: 'bathtub-the-parker-palm-springs.webp',
    photoId: 31808305,
    label: 'The Parker Palm Springs (Designer freestanding clawfoot soaking tub)'
  },
  {
    key: 'bathtub-korakia-pensione-palm-springs.webp',
    photoId: 4946764,
    label: 'Korakia Pensione Palm Springs (Moroccan hand-carved stone bath)'
  },
  {
    key: 'bathtub-lhorizon-resort-palm-springs.webp',
    photoId: 34607966,
    label: "L'Horizon Resort & Spa Palm Springs (Mid-century outdoor stone soaking tub)"
  },

  // Poconos
  {
    key: 'bathtub-cove-haven-resort-poconos.webp',
    photoId: 37760262,
    label: 'Cove Haven Resort Poconos (Iconic luxury whirlpool tower jacuzzi)'
  },
  {
    key: 'bathtub-paradise-stream-resort-poconos.webp',
    photoId: 26859044,
    label: 'Paradise Stream Resort Poconos (Romantic couple jacuzzi with candlelit ambience)'
  },
  {
    key: 'bathtub-the-french-manor-poconos.webp',
    photoId: 38183825,
    label: 'The French Manor Inn and Spa Poconos (Chateau stone spa bath with mountain vistas)'
  },

  // Sedona
  {
    key: 'bathtub-lauberge-de-sedona.webp',
    photoId: 27638226,
    label: "L'Auberge de Sedona (Red rock canyon mountain view soaking tub)"
  },
  {
    key: 'bathtub-enchantment-resort-sedona.webp',
    photoId: 14036382,
    label: 'Enchantment Resort Sedona (Boynton canyon picturesque mountain bath)'
  },
  {
    key: 'bathtub-amara-resort-sedona.webp',
    photoId: 10825191,
    label: 'Amara Resort and Spa Sedona (Cleopatra Rock view modern stone tub)'
  }
];

async function runUploads() {
  console.log(`Starting Cloudflare R2 upload of ${BATCH2_IMAGES.length} US Regional Hub bathtub images...`);

  let successCount = 0;
  for (let i = 0; i < BATCH2_IMAGES.length; i++) {
    const item = BATCH2_IMAGES[i];
    const downloadUrl = `https://images.pexels.com/photos/${item.photoId}/pexels-photo-${item.photoId}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from Pexels`);
      const arrayBuffer = await res.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      const webpBuffer = await sharp(inputBuffer)
        .resize(1200, 800, { fit: 'cover', position: 'center' })
        .webp({ quality: 82 })
        .toBuffer();

      const r2Key = `${PREFIX}${item.key}`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable'
      }));

      successCount++;
      console.log(`[${i + 1}/${BATCH2_IMAGES.length}] ✅ Uploaded ${item.key} (${webpBuffer.length} bytes) - ${item.label}`);
    } catch (err) {
      console.error(`[${i + 1}/${BATCH2_IMAGES.length}] ❌ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log(`\n🎉 Batch 2 Upload completed: ${successCount}/${BATCH2_IMAGES.length} images successfully uploaded to Cloudflare R2!`);
}

runUploads().catch(console.error);
