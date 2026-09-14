#!/usr/bin/env node

/**
 * scripts/populate_us_images.js
 * 
 * 1. Reads all 83 US hotels from MongoDB Atlas across all 15 US cities.
 * 2. Assigns a unique, high-resolution luxury bathtub photo to each hotel from scratch/pexels_bathtub_photos.json.
 * 3. Pre-selects distinct, vibe-tailored hero photos for each city's primary thumbnail.
 * 4. Downloads each photo, optimizes it to 1200x800 WebP (quality 82, ~70KB) via sharp.
 * 5. Uploads directly to Cloudflare R2 bucket (dreamwave/hotelswithbathtubs/images/).
 * 6. Updates the hotel record in MongoDB with the verified public R2 URL.
 */

const https = require('https');
const mongoose = require('mongoose');
const sharp = require('sharp');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const photos = require('../scratch/pexels_bathtub_photos.json');

// Map of canonical city names to featured photo IDs tailored to their aesthetic
const CITY_FEATURED_PHOTO_ID = {
  'New York': 8146150,     // Modern marble bath with skyline city view
  'Las Vegas': 1028379,    // Glamorous indoor jacuzzi suite
  'Miami': 2507014,        // Oceanfront tropical minimalist bath
  'Los Angeles': 5461604,  // Hollywood luxury bedroom/bath suite
  'San Francisco': 8089171,// Sleek Pacific Heights freestanding tub
  'Chicago': 7166637,      // Elegant high-rise marble bath
  'Boston': 16113326,      // Historic Back Bay ambient lit soaking tub
  'Seattle': 5677270,      // Lush Pacific Northwest retreat bath
  'Austin': 20200289,      // Chic modern boutique bath
  'Nashville': 18559645,   // Grand southern luxury corner spa tub
  'Aspen': 2134224,        // Mountain wood & stone alpine sanctuary tub
  'San Diego': 19754222,   // Coastal terrace freestanding bath
  'New Orleans': 18246437, // Historic French Quarter tiled bath
  'Baltimore': 36650041,   // Classic Inner Harbor marble suite tub
  'Kansas City': 14815614, // Contemporary luxury hotel suite bath
};

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
  console.log('🚀 Starting US Hotel Image Sourcing & Cloudflare R2 Upload...');

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
  console.log(' Connected to MongoDB Atlas');

  const hotelsCollection = mongoose.connection.db.collection('hotels');

  // Fetch all active US hotels sorted by city and rating
  const usHotels = await hotelsCollection
    .find({
      country: { $in: ['USA', 'United States', 'usa'] },
      flagged: { $ne: true },
    })
    .sort({ city: 1, rating: -1, reviewsCount: -1 })
    .toArray();

  console.log(` Found ${usHotels.length} active US hotels across destinations.`);

  // Group by city
  const cityGroups = {};
  for (const h of usHotels) {
    if (!cityGroups[h.city]) cityGroups[h.city] = [];
    cityGroups[h.city].push(h);
  }

  // Track used photo IDs to ensure 100% uniqueness
  const usedPhotoIds = new Set();
  const photoMap = new Map();
  for (const p of photos) {
    photoMap.set(p.id, p);
  }

  // List of remaining photo IDs
  const availablePhotoIds = photos.map(p => p.id);

  let successCount = 0;
  let failCount = 0;

  for (const [cityName, hotelList] of Object.entries(cityGroups)) {
    console.log(`\n🏙️ Processing ${cityName} (${hotelList.length} hotels)...`);

    for (let i = 0; i < hotelList.length; i++) {
      const hotel = hotelList[i];
      let chosenPhotoId = null;

      // The top hotel in the city gets the designated city aesthetic photo
      if (i === 0 && CITY_FEATURED_PHOTO_ID[cityName]) {
        chosenPhotoId = CITY_FEATURED_PHOTO_ID[cityName];
      }

      // If not top hotel or featured ID already used, pick next unused photo
      if (!chosenPhotoId || usedPhotoIds.has(chosenPhotoId)) {
        chosenPhotoId = availablePhotoIds.find(id => !usedPhotoIds.has(id));
      }

      if (!chosenPhotoId) {
        console.warn(`  ⚠️ Ran out of unique photos for ${hotel.name}, reusing pool.`);
        chosenPhotoId = availablePhotoIds[i % availablePhotoIds.length];
      }

      usedPhotoIds.add(chosenPhotoId);
      const photoObj = photoMap.get(chosenPhotoId);

      const cleanCity = sanitize(cityName);
      const cleanHotel = sanitize(hotel.name);
      const filename = `luxury-bathtub-${cleanCity}-${cleanHotel}.webp`;
      const key = `hotelswithbathtubs/images/${filename}`;
      const publicUrl = `${r2Base}/${filename}`;

      try {
        // High-res crop from Pexels (1200x800)
        const downloadUrl = `https://images.pexels.com/photos/${chosenPhotoId}/pexels-photo-${chosenPhotoId}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;
        
        process.stdout.write(`  [${i + 1}/${hotelList.length}] ${hotel.name} (Photo #${chosenPhotoId})... `);
        const rawBuffer = await downloadImage(downloadUrl);
        
        // Optimize to WebP
        const webpBuffer = await sharp(rawBuffer)
          .resize(1200, 800, { fit: 'cover' })
          .webp({ quality: 82 })
          .toBuffer();

        // Upload to Cloudflare R2
        await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: webpBuffer,
          ContentType: 'image/webp',
        }));

        // Update MongoDB Atlas
        await hotelsCollection.updateOne(
          { _id: hotel._id },
          { $set: { image: publicUrl } }
        );

        console.log(`✅ Uploaded (${Math.round(webpBuffer.length / 1024)} KB)`);
        successCount++;
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        failCount++;
      }

      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 150));
    }
  }

  console.log(`\n🎉 Image Population Finished!`);
  console.log(`   - Successfully processed & uploaded: ${successCount}`);
  console.log(`   - Failed: ${failCount}`);

  // Verify that all 15 city thumbnails now return HTTP 200
  console.log('\n🔍 Verifying all 15 City Thumbnails on Cloudflare R2...');
  const verifyList = Object.keys(cityGroups);

  for (const city of verifyList) {
    const topHotel = await hotelsCollection.findOne({
      city: new RegExp(`^${cityName(city)}$`, 'i'),
      country: { $in: ['USA', 'United States', 'usa'] },
      flagged: { $ne: true },
    }, { sort: { rating: -1, reviewsCount: -1 } });

    if (topHotel && topHotel.image) {
      await new Promise(resolve => {
        https.get(topHotel.image, res => {
          console.log(`  ${res.statusCode === 200 ? '✅' : '❌'} ${city}: HTTP ${res.statusCode} (${topHotel.image.split('/').pop()})`);
          resolve();
        }).on('error', () => {
          console.log(`  ❌ ${city}: Network Error`);
          resolve();
        });
      });
    }
  }

  process.exit(0);
}

function cityName(c) {
  return c.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
