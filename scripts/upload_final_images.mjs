import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
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

const FINAL_IMAGES = [
  { key: 'bathtub-pilibhit-house-haridwar.webp', photoId: 6585614, label: 'Pilibhit House Haridwar (IHCL SeleQtions Ganga riverside bath)' },
  { key: 'bathtub-il-palazzo-hotel-panchgani.webp', photoId: 6969866, label: 'Il Palazzo Hotel Panchgani (1925 colonial heritage roll-top bath)' },
  { key: 'bathtub-mohana-beach-resort-mandarmani.webp', photoId: 6782567, label: 'Mohana Beach Resort Mandarmani (Sea view whirlpool jacuzzi bath)' },
  { key: 'bathtub-arya-beach-resort-mandarmani.webp', photoId: 7018389, label: 'Arya Beach Resort Mandarmani (Coastal executive soaking tub)' },
  { key: 'bathtub-fragrant-nature-kochi.webp', photoId: 7061662, label: 'Fragrant Nature Fort Kochi (5-star harbour view marble bath)' },
  { key: 'bathtub-the-house-of-mg-ahmedabad.webp', photoId: 7061678, label: 'The House of MG Ahmedabad (1924 heritage mansion marble tub)' },
  { key: 'bathtub-sayaji-bhopal.webp', photoId: 6587907, label: 'Sayaji Bhopal (Grand club suite hydrotherapy jacuzzi)' },
  { key: 'bathtub-enrise-by-sayaji-bhopal.webp', photoId: 7535073, label: 'Enrise by Sayaji Bhopal (Modern freestanding soaking tub)' },
  { key: 'bathtub-the-fern-residency-bhopal.webp', photoId: 7535056, label: 'The Fern Residency Bhopal (Eco-luxe Hazel suite deep soaking tub)' },
  { key: 'bathtub-brilliant-convention-centre-indore.webp', photoId: 6585759, label: 'Brilliant Convention Centre Indore (Presidential jacuzzi suite)' },
  { key: 'bathtub-mayfair-darjeeling.webp', photoId: 6585764, label: 'Mayfair Darjeeling (Perched colonial clawfoot soaking tub)' }
];

async function runUploads() {
  console.log(`Starting Cloudflare R2 upload of ${FINAL_IMAGES.length} flagship bathtub images...`);

  let successCount = 0;
  for (let i = 0; i < FINAL_IMAGES.length; i++) {
    const item = FINAL_IMAGES[i];
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
      console.log(`[${i + 1}/${FINAL_IMAGES.length}] ✅ Uploaded ${item.key} (${webpBuffer.length} bytes) - ${item.label}`);
    } catch (err) {
      console.error(`[${i + 1}/${FINAL_IMAGES.length}] ❌ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log(`\n🎉 Final Batch Upload completed: ${successCount}/${FINAL_IMAGES.length} images successfully uploaded to Cloudflare R2!`);
}

runUploads().catch(console.error);
