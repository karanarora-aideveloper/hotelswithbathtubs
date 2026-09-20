import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generatePinImage } from './generate_pin_image.mjs';
import { imageUrl } from '../src/lib/imageUrl.ts';
import { publishPinViaBrowser } from './pinterest_playwright.mjs';

dotenv.config({ path: '.env.local' });

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    city: '',
    country: '',
    hotel: '',
    count: 1,
    board: 'Hotels with Bathtubs & Jacuzzi Suites',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) params.city = args[++i];
    else if (args[i] === '--country' && args[i + 1]) params.country = args[++i];
    else if (args[i] === '--hotel' && args[i + 1]) params.hotel = args[++i];
    else if (args[i] === '--count' && args[i + 1]) params.count = parseInt(args[++i], 10);
    else if (args[i] === '--board' && args[i + 1]) params.board = args[++i];
  }

  return params;
}

async function main() {
  const params = parseArgs();
  console.log('📌 Pinterest Auto-Publisher Initializing...');
  console.log(`Parameters:`, params);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const HotelSchema = new mongoose.Schema({
    name: String,
    slug: String,
    city: String,
    country: String,
    image: String,
    roomType: String,
    tubType: String,
    description: String,
    flagged: Boolean,
    rating: Number,
  }, { strict: false });

  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  // Build MongoDB query
  const query = { flagged: { $ne: true } };
  if (params.city) query.city = new RegExp(`^${params.city.trim()}$`, 'i');
  if (params.country) query.country = new RegExp(`^${params.country.trim()}$`, 'i');
  if (params.hotel) query.name = new RegExp(params.hotel.trim(), 'i');

  const hotels = await Hotel.find(query)
    .sort({ rating: -1, _id: -1 })
    .limit(params.count);

  if (hotels.length === 0) {
    console.error(`No hotels found matching criteria: city="${params.city}", country="${params.country}", hotel="${params.hotel}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Found ${hotels.length} hotel(s) to process.`);

  // Get board ID
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  let boardId = null;

  if (token) {
    try {
      const boardsRes = await fetch(`${PINTEREST_API_BASE}/boards`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const boardsData = await boardsRes.json();
      const board = (boardsData.items || []).find((b) =>
        b.name.toLowerCase().includes('hotels with bathtubs') || b.name.toLowerCase().includes(params.board.toLowerCase())
      );
      if (board) {
        boardId = board.id;
        console.log(`✓ Using Pinterest Board: "${board.name}" (ID: ${boardId})`);
      }
    } catch (e) {
      console.warn('Could not fetch board via API:', e.message);
    }
  }

  const results = [];

  for (let idx = 0; idx < hotels.length; idx++) {
    const hotel = hotels[idx];
    console.log(`\n-----------------------------------------------------`);
    console.log(`[${idx + 1}/${hotels.length}] Processing: ${hotel.name} in ${hotel.city}, ${hotel.country}`);

    const citySlug = (hotel.city || '').toLowerCase().replace(/\s+/g, '-');
    const countrySlug = (hotel.country || 'india').toLowerCase().replace(/\s+/g, '-');
    const destUrl = `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}?utm_source=pinterest&utm_medium=social&utm_campaign=pin_${citySlug}`;

    // 1. Generate 2:3 Vertical Pin Image
    const outputFileName = `pin_${hotel.slug || citySlug}_${Date.now()}.jpg`;
    const localPinPath = path.join(process.cwd(), 'scratch', 'pins', outputFileName);

    const sourceImage = imageUrl(hotel.image);
    console.log(`Generating 2:3 vertical pin graphic from: ${sourceImage}`);

    try {
      await generatePinImage({
        imageUrl: sourceImage,
        hotelName: hotel.name,
        city: hotel.city,
        country: hotel.country || 'Global',
        roomType: hotel.tubType || hotel.roomType || 'Private In-Room Bathtub',
        outputPath: localPinPath,
      });
      console.log(`✓ Vertical Pin Graphic Created: ${localPinPath}`);
    } catch (err) {
      console.error(`Failed to generate pin image for ${hotel.name}:`, err.message);
      continue;
    }

    // 2. Prepare Pin metadata
    const pinTitle = `${hotel.name} - Luxury Bathtub Suite in ${hotel.city}`;
    const pinDescription = `Looking for the ultimate romantic getaway in ${hotel.city}? ${hotel.name} features private in-room soaking tubs and jacuzzi suites hand-verified for couples. Plan your romantic escape at HotelsWithBathtubs.com. #romanticgetaway #hotelswithbathtubs #${citySlug}hotel #jacuzzisuite #honeymoontravel`;

    // 3. Attempt API publishing if token exists
    let publishStatus = 'ready';
    let pinId = null;

    if (token && boardId) {
      try {
        const pinRes = await fetch(`${PINTEREST_API_BASE}/pins`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            board_id: boardId,
            title: pinTitle.slice(0, 100),
            description: pinDescription.slice(0, 500),
            link: destUrl,
            media_source: {
              source_type: 'image_url',
              url: sourceImage,
            },
          }),
        });

        const pinData = await pinRes.json();
        if (pinRes.ok && pinData.id) {
          publishStatus = 'published';
          pinId = pinData.id;
          console.log(`✓ PUBLISHED TO PINTEREST via API! Pin ID: ${pinId}`);
        } else {
          console.log(`ℹ️ API note: ${pinData.message || 'Trial access active'}`);
          console.log(`Attempting headless browser publishing to board "${params.board}"...`);
          try {
            const browserResult = await publishPinViaBrowser({
              imagePath: localPinPath,
              title: pinTitle,
              description: pinDescription,
              link: destUrl,
              boardName: params.board,
            });
            if (browserResult && browserResult.success) {
              publishStatus = 'published';
              console.log(`✓ PUBLISHED TO PINTEREST via Browser Automation!`);
            }
          } catch (bErr) {
            console.warn(`Browser publisher note: ${bErr.message}`);
            publishStatus = bErr.message.includes('Not logged in') ? 'needs_browser_login' : 'pending_review';
          }
        }
      } catch (err) {
        console.warn('API call error:', err.message);
      }
    }

    // Direct Web 1-Click Save Link
    const webPinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(destUrl)}&media=${encodeURIComponent(sourceImage)}&description=${encodeURIComponent(pinTitle + ' - ' + pinDescription)}`;

    results.push({
      hotelName: hotel.name,
      city: hotel.city,
      country: hotel.country,
      title: pinTitle,
      description: pinDescription,
      link: destUrl,
      localPinPath,
      publishStatus,
      pinId,
      webPinUrl,
    });
  }

  await mongoose.disconnect();

  console.log('\n=====================================================');
  console.log('           PINTEREST BATCH SUMMARY');
  console.log('=====================================================\n');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

main().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
