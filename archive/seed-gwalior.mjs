// Seed script: Add Gwalior hotels with bathtubs
// Run: node seed-gwalior.mjs

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PLACEHOLDER_IMAGE = 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp';

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  city: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  url: { type: String, required: true },
  agodaUrl: { type: String },
  bookingUrl: { type: String },
  image: { type: String, required: true },
  verified: { type: Boolean, default: false },
  flagged: { type: Boolean, default: false },
  amenities: { type: [String], default: ['Bathtub', 'Hot Tub'] },
  description: { type: String, default: '' },
  crossVerified: { type: Boolean, default: false },
  crossVerifiedSources: { type: [String], default: [] },
}, { timestamps: true });

function makeSlug(name, city) {
  const base = `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return base;
}

function bookingUrl(hotelName, city) {
  return `https://www.booking.com/hotel/search.html?ss=${encodeURIComponent(hotelName + ' ' + city)}&nflt=hotelfacility%3D63`;
}

function mmtUrl(hotelName, city) {
  return `https://www.makemytrip.com/hotels/hotel-listing/?checkin=08282026&checkout=08292026&city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(hotelName)}`;
}

function agodaUrl(hotelName, city) {
  return `https://www.agoda.com/search?city=${encodeURIComponent(city)}&textToSearch=${encodeURIComponent(hotelName)}`;
}

const hotels = [
  {
    name: 'Taj Usha Kiran Palace',
    city: 'Gwalior',
    country: 'India',
    description: 'Heritage hotel in Gwalior set amidst 9 acres of landscaped estates, featuring luxurious suites with heritage bathtubs.',
    amenities: ['Bathtub', 'Heritage Property', 'Spa', 'Pool'],
  },
  {
    name: 'Radisson Gwalior',
    city: 'Gwalior',
    country: 'India',
    description: 'Contemporary hotel located in the city center featuring modern suites with deep soaking bathtubs and excellent city views.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Fitness Center'],
  },
  {
    name: 'Clarks Inn Suite Gwalior',
    city: 'Gwalior',
    country: 'India',
    description: 'Premium business and leisure hotel offering spacious suites with bathtubs and world-class hospitality.',
    amenities: ['Bathtub', 'Restaurant', 'Spa', 'Free WiFi'],
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found in environment');

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  let inserted = 0;
  let skipped = 0;

  for (const h of hotels) {
    const slug = makeSlug(h.name, h.city);
    const existing = await Hotel.findOne({ slug });
    if (existing) {
      console.log(`  ⏭  Skipping (exists): ${h.name} [${h.city}]`);
      skipped++;
      continue;
    }

    await Hotel.create({
      name: h.name,
      slug,
      city: h.city,
      country: h.country,
      url: mmtUrl(h.name, h.city),
      agodaUrl: agodaUrl(h.name, h.city),
      bookingUrl: bookingUrl(h.name, h.city),
      image: PLACEHOLDER_IMAGE,
      verified: true,
      amenities: h.amenities,
      description: h.description,
      crossVerified: true,
      crossVerifiedSources: ['Booking.com'],
    });

    console.log(`  ✅ Inserted: ${h.name} [${h.city}, ${h.country}]`);
    inserted++;
  }

  console.log(`\n🏁 Done — inserted: ${inserted}, skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
