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

const WORLD_IMAGES = [
  { key: 'bathtub-lake-como.webp', photoId: 33651276, label: 'Lake Como (Lake-facing luxury marble soaking bath)' },
  { key: 'bathtub-capri.webp', photoId: 7061662, label: 'Capri (Faraglioni cliffside Mediterranean tub)' },
  { key: 'bathtub-mykonos.webp', photoId: 6782567, label: 'Mykonos (Cycladic cave whirlpool jacuzzi)' },
  { key: 'bathtub-hong-kong.webp', photoId: 14815614, label: 'Hong Kong (Victoria Harbour skyline marble tub)' },
  { key: 'bathtub-macau.webp', photoId: 6587907, label: 'Macau (Palatial casino luxury suite jacuzzi)' },
  { key: 'bathtub-whistler.webp', photoId: 38183825, label: 'Whistler (Blackcomb alpine lodge cedar hot tub)' },
  { key: 'bathtub-courchevel.webp', photoId: 6585764, label: 'Courchevel (French Alps luxury chalet clawfoot tub)' },
  { key: 'bathtub-chamonix.webp', photoId: 14036383, label: 'Chamonix (Mont Blanc glacier view soaking bath)' },
  { key: 'bathtub-niseko.webp', photoId: 27626180, label: 'Niseko (Hokkaido snow onsen & cedarwood tub)' },
  { key: 'bathtub-mount-fuji.webp', photoId: 27626179, label: 'Mount Fuji (Open-air Kawaguchiko onsen bath)' },
  { key: 'bathtub-koh-samui.webp', photoId: 33638433, label: 'Koh Samui (Gulf of Thailand tropical pool villa tub)' },
  { key: 'bathtub-chiang-mai.webp', photoId: 13806240, label: 'Chiang Mai (Misty jungle teak sanctuary soaking bath)' },
  { key: 'bathtub-tulum.webp', photoId: 32426753, label: 'Tulum (Bohemian jungle stone soaking tub)' },
  { key: 'bathtub-los-cabos.webp', photoId: 7018389, label: 'Los Cabos (Pacific oceanfront cliffside jacuzzi bath)' },
  { key: 'bathtub-istanbul.webp', photoId: 7061678, label: 'Istanbul (Bosphorus Turkish marble hammam & soaking bath)' },
  { key: 'bathtub-the-cotswolds.webp', photoId: 6969866, label: 'The Cotswolds (Honey-stone countryside roll-top bath)' },
  { key: 'bathtub-bath-uk.webp', photoId: 6585614, label: 'Bath UK (Historic Roman mineral thermal bath)' },
  { key: 'bathtub-st-barthelemy.webp', photoId: 7535073, label: 'St. Barthélemy (Caribbean ultra-luxe ocean plunge tub)' },
  { key: 'bathtub-anguilla.webp', photoId: 7535056, label: 'Anguilla (Meads Bay white-sand freestanding tub)' },
  { key: 'bathtub-brussels.webp', photoId: 6585759, label: 'Brussels (Grand Place presidential marble soaking bath)' },
  { key: 'bathtub-bruges.webp', photoId: 3764147, label: 'Bruges (Romantic canal-side clawfoot tub)' },
  { key: 'bathtub-kruger-national-park.webp', photoId: 36777901, label: 'Kruger National Park (Open-air safari bush bathtub)' },
  { key: 'bathtub-serengeti.webp', photoId: 38773320, label: 'Serengeti (Savanna tented suite copper soaking tub)' },
  { key: 'bathtub-bhutan.webp', photoId: 18246436, label: 'Bhutan (Himalayan traditional hot-stone herbal tub)' },
  { key: 'bathtub-melbourne.webp', photoId: 7722156, label: 'Melbourne (Urban luxury skyline soaking bath)' },
  { key: 'bathtub-hamilton-island.webp', photoId: 27638206, label: 'Hamilton Island (Great Barrier Reef oceanfront soaking bath)' },
  { key: 'bathtub-puerto-rico.webp', photoId: 3926159, label: 'Puerto Rico (Rainforest coastal marble soaking tub)' }
];

async function runUploads() {
  console.log(`Starting Cloudflare R2 upload of ${WORLD_IMAGES.length} global luxury bathtub images...`);

  let successCount = 0;
  for (let i = 0; i < WORLD_IMAGES.length; i++) {
    const item = WORLD_IMAGES[i];
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
      console.log(`[${i + 1}/${WORLD_IMAGES.length}] ✅ Uploaded ${item.key} (${webpBuffer.length} bytes) - ${item.label}`);
    } catch (err) {
      console.error(`[${i + 1}/${WORLD_IMAGES.length}] ❌ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log(`\n🎉 World Expansion Upload completed: ${successCount}/${WORLD_IMAGES.length} images successfully uploaded to Cloudflare R2!`);
}

runUploads().catch(console.error);
