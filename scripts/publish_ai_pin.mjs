import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const R2_PUBLIC_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs';
const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
const DEFAULT_BOARD_ID = '1101622827543006207'; // "Hotels with Bathtubs & Jacuzzi Suites"

export async function uploadToR2(localPath, filename) {
  const buffer = fs.readFileSync(localPath);
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.R2_BUCKET_NAME || 'dreamwave';
  const key = `hotelswithbathtubs/images/ai-pins/${filename}`;

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  }));

  const publicUrl = `${R2_PUBLIC_BASE}/images/ai-pins/${filename}`;
  console.log(`✓ Uploaded to Cloudflare R2: ${publicUrl}`);
  return publicUrl;
}

export async function postPinToPinterest({ title, description, link, imageUrl, boardId = DEFAULT_BOARD_ID }) {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) throw new Error('PINTEREST_ACCESS_TOKEN missing in .env.local');

  console.log(`Posting to Pinterest board ${boardId}...`);
  console.log(`Title: "${title}"`);
  console.log(`Image: ${imageUrl}`);

  const res = await fetch(`${PINTEREST_API_BASE}/pins`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title: title.slice(0, 100),
      description: description.slice(0, 500),
      link,
      media_source: {
        source_type: 'image_url',
        url: imageUrl,
      },
    }),
  });

  // Extract rate limit headers
  const rateLimit = {
    limit: res.headers.get('x-ratelimit-limit'),
    remaining: res.headers.get('x-ratelimit-remaining'),
    reset: res.headers.get('x-ratelimit-reset'),
    status: res.status,
  };

  console.log(`📊 Pinterest Rate Limits -> Limit: ${rateLimit.limit} | Remaining: ${rateLimit.remaining} | Reset: ${rateLimit.reset}s`);

  if (res.status === 429) {
    throw new Error(`⚠️ RATE LIMIT REACHED! Status 429. Reset in ${rateLimit.reset || 'N/A'} seconds. Stopping immediately.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Pinterest API Error (${res.status}): ${JSON.stringify(data)}`);
  }

  console.log(`✓ PIN PUBLISHED SUCCESSFULLY! Pin ID: ${data.id}`);
  return {
    pinId: data.id,
    pinUrl: `https://www.pinterest.com/pin/${data.id}/`,
    rateLimit,
    data,
  };
}

// Standalone execution for Viceroy Bali
if (process.argv[1].endsWith('publish_ai_pin.mjs')) {
  async function run() {
    const localImg = 'public/pins/viceroy_bali_ai_tub.jpg';
    const filename = `viceroy_bali_ai_${Date.now()}.jpg`;
    const r2Url = await uploadToR2(localImg, filename);

    const result = await postPinToPinterest({
      title: 'Viceroy Bali - Luxury Jungle Bathtub Suite in Ubud',
      description: 'Experience the ultimate romantic escape at Viceroy Bali in Ubud. Private heated pool villas featuring hand-carved open-air soaking tubs overlooking the misty Valley of the Kings. Verified by HotelsWithBathtubs.com. #Bali #LuxuryHotels #HotelsWithBathtubs #Honeymoon #Ubud',
      link: 'https://www.hotelswithbathtubs.com/indonesia/bali?utm_source=pinterest&utm_medium=ai_pin&utm_campaign=viceroy_bali_jungle_tub',
      imageUrl: r2Url,
    });

    console.log(`Live Pin: ${result.pinUrl}`);
  }
  run().catch(console.error);
}
