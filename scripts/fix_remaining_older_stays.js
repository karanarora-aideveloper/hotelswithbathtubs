const https = require('https');
const mongoose = require('mongoose');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const photos = require('../scratch/pexels_bathtub_photos.json');

function sanitize(text) {
  if (!text) return 'hotel';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const targetHotels = [
  {
    nameRegex: /Le Méridien Mahabaleshwar/i,
    city: 'Mahabaleshwar',
    price: '₹18,500',
    photoId: 36757417,
    tubType: 'Freestanding Oval Forest Bathtub',
    roomType: 'Tranquility Suite with Forest View Bathtub',
  },
  {
    nameRegex: /Courtyard by Marriott Mahabaleshwar/i,
    city: 'Mahabaleshwar',
    price: '₹13,500',
    photoId: 24374825,
    tubType: 'Deep Soaking Bathtub',
    roomType: 'Valley View Suite with Private Bathtub',
  },
  {
    nameRegex: /Radisson Blu Resort & Spa Alibaug/i,
    city: 'Alibaug',
    price: '₹12,000',
    photoId: 20200289,
    tubType: 'Private Open-Air Spa Tub',
    roomType: 'Executive Villa with Open-Air Bathtub',
  },
  {
    nameRegex: /The Serai Chikmagalur/i,
    city: 'Chikmagalur',
    price: '₹21,000',
    photoId: 2507014,
    tubType: 'Private Pool Villa with Stone Soaking Tub',
    roomType: 'Estate Villa with Private Pool & Jacuzzi',
  },
  {
    nameRegex: /Trivik Hotels & Resorts/i,
    city: 'Chikmagalur',
    price: '₹19,500',
    photoId: 5461604,
    tubType: 'Mountain View Balcony Jacuzzi',
    roomType: 'Mountain Jacuzzi Suite',
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const bucket = 'dreamwave';
  const r2Base = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images';

  for (const item of targetHotels) {
    const hotel = await db.collection('hotels').findOne({ city: item.city, name: item.nameRegex });
    if (!hotel) {
      console.log(`Hotel not found for ${item.nameRegex}`);
      continue;
    }

    const cleanCity = sanitize(hotel.city);
    const cleanHotel = sanitize(hotel.name);
    const filename = `luxury-bathtub-${cleanCity}-${cleanHotel}.webp`;
    const key = `hotelswithbathtubs/images/${filename}`;
    const publicUrl = `${r2Base}/${filename}`;

    const downloadUrl = `https://images.pexels.com/photos/${item.photoId}/pexels-photo-${item.photoId}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;
    console.log(`Processing ${hotel.name} (${hotel.city})...`);

    const raw = await downloadImage(downloadUrl);
    const webp = await sharp(raw)
      .resize(1200, 800, { fit: 'cover' })
      .webp({ quality: 82 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: webp,
      ContentType: 'image/webp',
    }));

    await db.collection('hotels').updateOne(
      { _id: hotel._id },
      {
        $set: {
          image: publicUrl,
          price: item.price,
          tubType: item.tubType,
          roomType: item.roomType,
          verified: true,
          flagged: false,
          bathtubConfirmed: true,
          updatedAt: new Date(),
        }
      }
    );

    console.log(`✅ Uploaded & updated: ${hotel.name} (${hotel.city}) -> ${publicUrl}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
