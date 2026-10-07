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

const IMAGES = [
  { city: 'turin', photoId: 6585757, label: 'Turin (Italian neoclassical marble soaking bath)' },
  { city: 'bristol', photoId: 6969865, label: 'Bristol (Georgian roll-top boutique soaking tub)' },
  { city: 'penang', photoId: 13806241, label: 'Penang (George Town colonial heritage soaking bath)' },
  { city: 'frankfurt', photoId: 6585760, label: 'Frankfurt (Skyline luxury marble soaking tub)' },
  { city: 'helsinki', photoId: 27626182, label: 'Helsinki (Nordic design sauna & soaking bath suite)' },
  { city: 'geneva', photoId: 33651275, label: 'Geneva (Lake Geneva palace marble soaking bath)' },
  { city: 'naples', photoId: 7061661, label: 'Naples (Bay of Naples luxury panoramic tub)' },
  { city: 'hamburg', photoId: 6585758, label: 'Hamburg (Alster lake-facing luxury soaking tub)' },
  { city: 'porto', photoId: 7535072, label: 'Porto (Douro riverfront wine spa soaking bath)' },
  { city: 'seville', photoId: 7018388, label: 'Seville (Andalusian courtyard palace jacuzzi tub)' },
  { city: 'lyon', photoId: 6585763, label: 'Lyon (Historic palace luxury soaking tub)' },
  { city: 'osaka', photoId: 27626181, label: 'Osaka (Japanese skyline luxury onsen soaking tub)' }
];

async function runUploads() {
  console.log(`Starting Cloudflare R2 upload of ${IMAGES.length} luxury bathtub images for GSC cities...`);

  let successCount = 0;
  for (let i = 0; i < IMAGES.length; i++) {
    const item = IMAGES[i];
    const key = `bathtub-${item.city}.webp`;
    const downloadUrl = `https://images.pexels.com/photos/${item.photoId}/pexels-photo-${item.photoId}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from Pexels`);
      const arrayBuffer = await res.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Compress and convert to high-efficiency webp
      const webpBuffer = await sharp(inputBuffer)
        .resize({ width: 1200, height: 800, fit: 'cover', position: 'center' })
        .webp({ quality: 84, effort: 4 })
        .toBuffer();

      const r2Key = `${PREFIX}${key}`;
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }));

      successCount++;
      console.log(`[${successCount}/${IMAGES.length}] Uploaded: ${key} (${Math.round(webpBuffer.length / 1024)} KB) -> ${item.label}`);
    } catch (err) {
      console.error(`Failed uploading ${key}:`, err.message);
    }
  }

  console.log(`\nCompleted! Successfully uploaded ${successCount}/${IMAGES.length} images to Cloudflare R2.`);
}

runUploads().catch(console.error);
