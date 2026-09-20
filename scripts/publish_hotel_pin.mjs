import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

async function main() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    console.error('Error: PINTEREST_ACCESS_TOKEN is missing in .env.local.');
    console.log('Run `node scripts/pinterest_auth.mjs` first to authorize and generate your token.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

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
  }, { strict: false });

  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  // Pick a luxury hotel with an image
  const hotel = await Hotel.findOne({
    flagged: { $ne: true },
    image: { $regex: '^https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/' }
  }).sort({ rating: -1 });

  if (!hotel) {
    console.error('No suitable hotel found with an R2 image.');
    process.exit(1);
  }

  console.log(`Selected Hotel: ${hotel.name} in ${hotel.city}, ${hotel.country}`);
  console.log(`Image: ${hotel.image}`);

  // Fetch or create board
  const boardsRes = await fetch(`${PINTEREST_API_BASE}/boards`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const boardsData = await boardsRes.json();
  let board = (boardsData.items || []).find(b => b.name.includes('Hotels with Bathtubs'));

  if (!board) {
    console.log('Creating board: "Hotels with Bathtubs & Jacuzzi Suites"...');
    const createBoardRes = await fetch(`${PINTEREST_API_BASE}/boards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Hotels with Bathtubs & Jacuzzi Suites',
        description: 'Curated luxury romantic hotels featuring private in-room bathtubs, deep soaking tubs, and jacuzzi suites.',
        privacy: 'PUBLIC',
      }),
    });
    board = await createBoardRes.json();
  }

  console.log(`Using Board: "${board.name}" (ID: ${board.id})`);

  // Build high-converting SEO copy
  const citySlug = hotel.city.toLowerCase().replace(/\s+/g, '-');
  const countrySlug = (hotel.country || 'india').toLowerCase().replace(/\s+/g, '-');
  const destinationUrl = `https://www.hotelswithbathtubs.com/${countrySlug}/${citySlug}?utm_source=pinterest&utm_medium=social&utm_campaign=pin_${citySlug}`;
  
  const title = `${hotel.name} - Luxury Bathtub Suite in ${hotel.city}`;
  const description = `Looking for the ultimate romantic getaway in ${hotel.city}? ${hotel.name} features private in-room soaking tubs and jacuzzi suites hand-verified for couples. Plan your romantic escape at HotelsWithBathtubs.com. #romanticgetaway #hotelswithbathtubs #${citySlug}hotel #jacuzzisuite`;

  console.log('Creating Pin on Pinterest...');
  const pinRes = await fetch(`${PINTEREST_API_BASE}/pins`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: board.id,
      title: title.slice(0, 100),
      description: description.slice(0, 500),
      link: destinationUrl,
      media_source: {
        source_type: 'image_url',
        url: hotel.image,
      },
    }),
  });

  const pinData = await pinRes.json();
  if (!pinRes.ok) {
    console.error('Pinterest API returned error:', pinData);
  } else {
    console.log('\nPIN CREATED SUCCESSFULLY! 🎉');
    console.log(`Pin ID: ${pinData.id}`);
    console.log(`Pin Title: ${pinData.title}`);
    console.log(`Destination Link: ${pinData.link}`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
