#!/usr/bin/env node

/**
 * scripts/seed_phase2_global_expansion.js
 * 
 * 1. Seeds 95 luxury hotels across 19 major global destinations (Europe, Africa, South America, Oceania).
 * 2. Uses authentic local currency pricing.
 * 3. Downloads unused photos from the Pexels pool, optimizes via sharp, and uploads to Cloudflare R2.
 */

const https = require('https');
const mongoose = require('mongoose');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const photos = require('../scratch/pexels_bathtub_photos.json');
const HOTELS_TO_ADD = require('../scratch/phase2_hotels.js');

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

async function main() {
  console.log('🚀 Starting Phase 2 Global Expansion...');

  if (!process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ACCESS_KEY_ID) {
    throw new Error('Missing Cloudflare R2 credentials in .env.local');
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.R2_BUCKET_NAME || 'dreamwave';
  const r2Base = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images';

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');
  const hotelsCollection = mongoose.connection.db.collection('hotels');

  // Start picking photos from index 150 to avoid overlapping with Phase 1
  let photoPointer = 150;

  async function processAndUploadImage(photoObj, cleanCity, cleanHotel) {
    const filename = `luxury-bathtub-${cleanCity}-${cleanHotel}.webp`;
    const key = `hotelswithbathtubs/images/${filename}`;
    const publicUrl = `${r2Base}/${filename}`;

    const downloadUrl = `https://images.pexels.com/photos/${photoObj.id}/pexels-photo-${photoObj.id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;
    const rawBuffer = await downloadImage(downloadUrl);
    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 800, { fit: 'cover' })
      .webp({ quality: 82 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
    }));

    return { publicUrl, sizeKb: Math.round(webpBuffer.length / 1024) };
  }

  for (const h of HOTELS_TO_ADD) {
    const cleanHotel = sanitize(h.name);
    const cleanCity = sanitize(h.city);
    const slug = `${cleanHotel}-${cleanCity}`;
    
    const existing = await hotelsCollection.findOne({ slug });
    if (existing) {
      console.log(`⚡ Hotel already exists: ${h.name} (${h.city})`);
      continue;
    }

    const photoObj = photos[photoPointer++];
    if (!photoObj) {
      console.error('❌ Ran out of Pexels photos in the pool!');
      process.exit(1);
    }

    console.log(`Processing: ${h.name} in ${h.city} (Currency: ${h.price})`);
    
    try {
      const { publicUrl, sizeKb } = await processAndUploadImage(photoObj, cleanCity, cleanHotel);
      
      const newHotel = {
        name: h.name,
        slug,
        city: h.city,
        country: h.country,
        description: `Experience unparalleled luxury at ${h.name} in ${h.city}. This exquisite property offers exclusive private bathtub or jacuzzi suites, allowing you to unwind in complete privacy. Perfect for romantic getaways, honeymoons, or a lavish weekend escape in ${h.country}.`,
        price: h.price,
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        bookingLink: h.bookingLink,
        bathtubType: ['Jacuzzi', 'Freestanding Bathtub', 'Hot Tub', 'Spa Bath'][Math.floor(Math.random() * 4)],
        images: [publicUrl],
        amenities: ["Private Bathtub", "Room Service", "Spa", "Free WiFi", "Luxury Toiletries", "Couples Massage"],
        flagged: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await hotelsCollection.insertOne(newHotel);
      console.log(`   ✅ Inserted to DB. Image uploaded (${sizeKb}KB) -> ${publicUrl}`);
    } catch (err) {
      console.error(`   ❌ Failed to process ${h.name}: ${err.message}`);
    }
  }

  console.log('\n🎉 Phase 2 Seed Complete!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
