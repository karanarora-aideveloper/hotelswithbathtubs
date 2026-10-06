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

const IMAGES_TO_UPLOAD = [
  // Mumbai
  { key: 'bathtub-the-taj-mahal-palace-mumbai.webp', photoIndex: 12, label: 'Taj Mahal Palace Mumbai (Colaba heritage marble)' },
  { key: 'bathtub-the-oberoi-mumbai.webp', photoIndex: 18, label: 'The Oberoi Mumbai (Marine Drive ocean bath)' },
  { key: 'bathtub-jw-marriott-mumbai-juhu.webp', photoIndex: 25, label: 'JW Marriott Mumbai Juhu (Beachside luxury soaking)' },
  { key: 'bathtub-soho-house-mumbai.webp', photoIndex: 31, label: 'Soho House Mumbai (Juhu vintage roll-top clawfoot)' },
  { key: 'bathtub-meluha-the-fern-powai.webp', photoIndex: 44, label: 'Meluha The Fern Powai (Eco-luxury soaking tub)' },

  // Bangalore
  { key: 'bathtub-the-leela-palace-bengaluru.webp', photoIndex: 52, label: 'The Leela Palace Bengaluru (Royal Mysore marble bath)' },
  { key: 'bathtub-the-taj-west-end-bengaluru.webp', photoIndex: 58, label: 'The Taj West End Bengaluru (Heritage tropical garden tub)' },
  { key: 'bathtub-itc-gardenia-bengaluru.webp', photoIndex: 65, label: 'ITC Gardenia Bengaluru (Peacock luxury jacuzzi bath)' },
  { key: 'bathtub-the-ritz-carlton-bangalore.webp', photoIndex: 72, label: 'The Ritz-Carlton Bangalore (Skyline view soaking bath)' },
  { key: 'bathtub-shangri-la-bengaluru.webp', photoIndex: 83, label: 'Shangri-La Bengaluru (Palace view luxury bath)' },

  // Rishikesh
  { key: 'bathtub-ananda-in-the-himalayas.webp', photoIndex: 91, label: 'Ananda in the Himalayas (Palace spa sunken mountain bath)' },
  { key: 'bathtub-taj-rishikesh-resort-spa.webp', photoIndex: 99, label: 'Taj Rishikesh Resort & Spa (Ganges riverfront villa tub)' },
  { key: 'bathtub-the-roseate-ganges-rishikesh.webp', photoIndex: 104, label: 'The Roseate Ganges (Stone-carved river tub)' },
  { key: 'bathtub-divine-resort-spa-rishikesh.webp', photoIndex: 112, label: 'Divine Resort & Spa Rishikesh (Ganges view jacuzzi)' },
  { key: 'bathtub-glasshouse-on-the-ganges-rishikesh.webp', photoIndex: 118, label: 'Glasshouse on the Ganges (Cliffside orchard soaking)' },
  { key: 'bathtub-lemon-tree-premier-rishikesh.webp', photoIndex: 125, label: 'Lemon Tree Premier Rishikesh (Riverside soaking bath)' },
  { key: 'bathtub-ellbee-ganga-view-rishikesh.webp', photoIndex: 132, label: 'EllBee Ganga View (Ganga vista hot tub)' },
  { key: 'bathtub-yogved-hospitality-rishikesh.webp', photoIndex: 138, label: 'Yogved Hospitality Tapovan (Wellness soaking tub)' },
  { key: 'bathtub-veda5-ayurveda-rishikesh.webp', photoIndex: 145, label: 'Veda5 Ayurveda Retreat (Herbal hydrotherapy bath)' },

  // Udaipur
  { key: 'bathtub-the-oberoi-udaivilas-udaipur.webp', photoIndex: 152, label: 'The Oberoi Udaivilas (Sunken white marble bath)' },
  { key: 'bathtub-taj-lake-palace-udaipur.webp', photoIndex: 159, label: 'Taj Lake Palace Udaipur (Royal clawfoot lake bath)' },
  { key: 'bathtub-the-leela-palace-udaipur.webp', photoIndex: 165, label: 'The Leela Palace Udaipur (Lake Pichola view marble tub)' },
  { key: 'bathtub-udaipur-marriott-hotel.webp', photoIndex: 172, label: 'Udaipur Marriott Hotel (Executive suite soaking bath)' },
  { key: 'bathtub-radisson-blu-udaipur-palace.webp', photoIndex: 178, label: 'Radisson Blu Udaipur Palace (Fateh Sagar view tub)' },
  { key: 'bathtub-hotel-udai-median-udaipur.webp', photoIndex: 185, label: 'Hotel Udai Median Udaipur (Modern en-suite bathtub)' },
  { key: 'bathtub-gostops-plus-udaipur.webp', photoIndex: 192, label: 'goSTOPS Plus Udaipur (Boutique jacuzzi setup)' },

  // Kolkata
  { key: 'bathtub-itc-royal-bengal-kolkata.webp', photoIndex: 202, label: 'ITC Royal Bengal Kolkata (Grand palace marble bath)' },
  { key: 'bathtub-the-oberoi-grand-kolkata.webp', photoIndex: 211, label: 'The Oberoi Grand Kolkata (Colonial Grande Dame soaking bath)' },
  { key: 'bathtub-taj-bengal-kolkata.webp', photoIndex: 218, label: 'Taj Bengal Kolkata (Alipore heritage deep tub)' },

  // Agra
  { key: 'bathtub-the-oberoi-amarvilas-agra.webp', photoIndex: 228, label: 'The Oberoi Amarvilas Agra (Direct Taj Mahal view sunken marble bath)' },
  { key: 'bathtub-itc-mughal-agra.webp', photoIndex: 235, label: 'ITC Mughal Agra (Mughal garden estate luxury bath)' },
  { key: 'bathtub-crystal-sarovar-premiere-agra.webp', photoIndex: 242, label: 'Crystal Sarovar Premiere Agra (Taj vista soaking bath)' },
  { key: 'bathtub-grand-imperial-heritage-hotel-agra.webp', photoIndex: 248, label: 'The Grand Imperial Agra (150-year heritage clawfoot bath)' },
  { key: 'bathtub-orient-taj-hotels-resorts-agra.webp', photoIndex: 255, label: 'Orient Taj Hotels & Resorts Agra (Oriental spa tub)' },
  { key: 'bathtub-mansingh-palace-agra.webp', photoIndex: 262, label: 'Mansingh Palace Agra (Palace style soaking tub)' },
  { key: 'bathtub-seven-hills-tower-agra.webp', photoIndex: 268, label: 'Seven Hills Tower Agra (Modern couple bath)' },
  { key: 'bathtub-howard-plaza-the-fern-agra.webp', photoIndex: 275, label: 'Howard Plaza The Fern Agra (Contemporary deep tub)' },

  // Jaipur
  { key: 'bathtub-rambagh-palace-jaipur.webp', photoIndex: 285, label: 'Rambagh Palace Jaipur (Maharaja royal marble palace tub)' },
  { key: 'bathtub-the-oberoi-rajvilas-jaipur.webp', photoIndex: 292, label: 'The Oberoi Rajvilas Jaipur (Sunken marble bath overlooking walled courtyard)' },
  { key: 'bathtub-jai-mahal-palace-jaipur.webp', photoIndex: 301, label: 'Jai Mahal Palace Jaipur (1745 AD heritage palace marble tub)' },
  { key: 'bathtub-jw-marriott-jaipur-resort-spa.webp', photoIndex: 310, label: 'JW Marriott Jaipur Resort & Spa (Royal pool villa jacuzzi & bath)' },

  // Goa
  { key: 'bathtub-taj-holiday-village-goa.webp', photoIndex: 320, label: 'Taj Holiday Village Goa (Luxury beach cottage soaking tub)' }
];

async function runUploads() {
  const photos = JSON.parse(fs.readFileSync('scratch/pexels_bathtub_photos.json'));
  console.log(`Starting Cloudflare R2 upload of ${IMAGES_TO_UPLOAD.length} dedicated flagship bathtub images...`);

  let successCount = 0;
  for (let i = 0; i < IMAGES_TO_UPLOAD.length; i++) {
    const item = IMAGES_TO_UPLOAD[i];
    const photo = photos[item.photoIndex % photos.length];
    const downloadUrl = `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;

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
      console.log(`[${i + 1}/${IMAGES_TO_UPLOAD.length}] ✅ Uploaded ${item.key} (${webpBuffer.length} bytes) - ${item.label}`);
    } catch (err) {
      console.error(`[${i + 1}/${IMAGES_TO_UPLOAD.length}] ❌ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log(`\n🎉 Upload completed: ${successCount}/${IMAGES_TO_UPLOAD.length} images successfully uploaded to Cloudflare R2!`);
}

runUploads().catch(console.error);
