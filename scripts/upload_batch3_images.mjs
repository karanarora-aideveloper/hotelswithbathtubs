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

// Batch 3: 30 luxury flagship bathtub webp images to replace duplicate clusters
const BATCH3_IMAGES = [
  // Chandigarh
  { key: 'bathtub-the-oberoi-sukhvilas-chandigarh.webp', photoId: 18246436, label: 'The Oberoi Sukhvilas Spa Resort (Siswan Forest luxury villa pool & tub)' },
  { key: 'bathtub-jw-marriott-hotel-chandigarh.webp', photoId: 14815614, label: 'JW Marriott Hotel Chandigarh (Sector 35 marble bathtub)' },
  { key: 'bathtub-taj-chandigarh.webp', photoId: 20200289, label: 'Taj Chandigarh (Sector 17 presidential soaking bath)' },

  // Amritsar
  { key: 'bathtub-taj-swarna-amritsar.webp', photoId: 5461604, label: 'Taj Swarna Amritsar (Majitha Road luxury soaking tub)' },
  { key: 'bathtub-hyatt-regency-amritsar.webp', photoId: 18559645, label: 'Hyatt Regency Amritsar (G.T. Road soaking bath)' },
  { key: 'bathtub-radisson-blu-hotel-amritsar.webp', photoId: 19754222, label: 'Radisson Blu Hotel Amritsar (Airport Road sunken jacuzzi suite)' },

  // Pune
  { key: 'bathtub-the-ritz-carlton-pune.webp', photoId: 7722156, label: 'The Ritz-Carlton Pune (Golf course view marble bath)' },

  // Nashik
  { key: 'bathtub-the-source-at-sula-nashik.webp', photoId: 27626174, label: 'The Source at Sula (Iconic vineyard view bathtub suite)' },
  { key: 'bathtub-beyond-by-sula-nashik.webp', photoId: 27626179, label: 'Beyond by Sula (Gangapur lake-facing soaking tub)' },
  { key: 'bathtub-radisson-blu-hotel-spa-nashik.webp', photoId: 8146153, label: 'Radisson Blu Hotel & Spa Nashik (Luxury spa soaking bath)' },

  // Bhopal
  { key: 'bathtub-jehan-numa-palace-bhopal.webp', photoId: 38773320, label: 'Jehan Numa Palace Hotel Bhopal (19th century royal clawfoot bath)' },
  { key: 'bathtub-jehan-numa-retreat-bhopal.webp', photoId: 13806240, label: 'Jehan Numa Retreat Bhopal (Van Vihar jungle luxury cottage tub)' },
  { key: 'bathtub-noor-us-sabah-palace-bhopal.webp', photoId: 7195883, label: 'Noor-Us-Sabah Palace Bhopal (Historic lakeview marble tub)' },

  // Nainital
  { key: 'bathtub-the-naini-retreat-nainital.webp', photoId: 14036383, label: 'The Naini Retreat Nainital (Heritage mountain view tub overlooking lake)' },
  { key: 'bathtub-the-manu-maharani-nainital.webp', photoId: 27638206, label: 'The Manu Maharani Nainital (Valley view luxury soaking bath)' },

  // Dharamshala
  { key: 'bathtub-hyatt-regency-dharamshala-resort.webp', photoId: 38183825, label: 'Hyatt Regency Dharamshala Resort (Cedar forest view soaking tub)' },
  { key: 'bathtub-radisson-blu-resort-dharamshala.webp', photoId: 27626180, label: 'Radisson Blu Resort Dharamshala (Dhauladhar mountain range view soaking bath)' },

  // Lonavala
  { key: 'bathtub-the-machan-lonavala.webp', photoId: 33638433, label: 'The Machan Lonavala (Canopy treehouse wooden soaking tub)' },
  { key: 'bathtub-radisson-resort-spa-lonavala.webp', photoId: 16113325, label: 'Radisson Resort & Spa Lonavala (Sahyadri foothills bathtub)' },

  // Igatpuri
  { key: 'bathtub-tropical-retreat-resort-igatpuri.webp', photoId: 32426753, label: 'Tropical Retreat Luxury Resort & Spa (Valley view jacuzzi bath)' },
  { key: 'bathtub-mystic-valley-spa-resort-igatpuri.webp', photoId: 36777901, label: 'Mystic Valley Spa Resort (Cliffside deep soaking tub)' },

  // Coimbatore
  { key: 'bathtub-the-residency-towers-coimbatore.webp', photoId: 8925979, label: 'The Residency Towers Coimbatore (Presidential suite soaking bath)' },
  { key: 'bathtub-le-meridien-coimbatore.webp', photoId: 18200683, label: 'Le Méridien Coimbatore (Whirlpool jacuzzi suite)' },

  // Shirdi
  { key: 'bathtub-st-laurn-the-spiritual-resort-shirdi.webp', photoId: 3771784, label: 'St. Laurn The Spiritual Resort Shirdi (Sunken meditation soaking bath)' },
  { key: 'bathtub-marigold-by-greenpark-shirdi.webp', photoId: 36650041, label: 'Marigold By Greenpark Shirdi (Executive luxury bath)' },

  // Gurgaon / NCR
  { key: 'bathtub-the-leela-ambience-gurugram.webp', photoId: 6724408, label: 'The Leela Ambience Gurugram Hotel (Sunken marble bath)' },
  { key: 'bathtub-taj-city-centre-gurugram.webp', photoId: 6634828, label: 'Taj City Centre Gurugram (Luxury soaking bath)' },

  // Kochi
  { key: 'bathtub-brunton-boatyard-kochi.webp', photoId: 3764147, label: 'Brunton Boatyard Fort Kochi (Heritage harbour-facing clawfoot tub)' },
  { key: 'bathtub-grand-hyatt-kochi-bolgatty.webp', photoId: 33651276, label: 'Grand Hyatt Kochi Bolgatty (Vembanad Lake view marble bathtub)' },

  // Karjat
  { key: 'bathtub-radisson-blu-resort-karjat.webp', photoId: 3926159, label: 'Radisson Blu Resort & Spa Karjat (Riverfront luxury soaking bath)' }
];

async function runUploads() {
  console.log(`Starting Cloudflare R2 upload of ${BATCH3_IMAGES.length} flagship bathtub images...`);

  let successCount = 0;
  for (let i = 0; i < BATCH3_IMAGES.length; i++) {
    const item = BATCH3_IMAGES[i];
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
      console.log(`[${i + 1}/${BATCH3_IMAGES.length}] ✅ Uploaded ${item.key} (${webpBuffer.length} bytes) - ${item.label}`);
    } catch (err) {
      console.error(`[${i + 1}/${BATCH3_IMAGES.length}] ❌ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log(`\n🎉 Batch 3 Upload completed: ${successCount}/${BATCH3_IMAGES.length} images successfully uploaded to Cloudflare R2!`);
}

runUploads().catch(console.error);
