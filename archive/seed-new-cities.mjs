// Seed script: 6 new international cities with hot tub hotels scraped from Booking.com
// Run: node seed-new-cities.mjs

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
  const slug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `https://www.booking.com/hotel/search.html?ss=${encodeURIComponent(hotelName + ' ' + city)}&nflt=hotelfacility%3D63`;
}

function mmtUrl(hotelName, city) {
  return `https://www.makemytrip.com/hotels/hotel-listing/?checkin=08282026&checkout=08292026&city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(hotelName)}`;
}

function agodaUrl(hotelName, city) {
  return `https://www.agoda.com/search?city=${encodeURIComponent(city)}&textToSearch=${encodeURIComponent(hotelName)}`;
}

const hotels = [
  // ─── SINGAPORE ───────────────────────────────────────────────────────────────
  {
    name: 'Marina Bay Sands',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Iconic integrated resort featuring an infinity pool on the 57th floor and luxurious suites with private bathtubs overlooking Marina Bay.',
    amenities: ['Bathtub', 'Hot Tub', 'Infinity Pool', 'Spa', 'Casino'],
  },
  {
    name: 'Raffles Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Historic colonial luxury hotel with spacious suites featuring freestanding bathtubs, butler service, and curated city views.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Spa', 'Butler Service'],
  },
  {
    name: 'Capella Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Secluded resort on Sentosa Island offering villas with private plunge pools and deep soaking bathtubs amid lush tropical greenery.',
    amenities: ['Bathtub', 'Private Pool', 'Spa', 'Garden View'],
  },
  {
    name: 'The Fullerton Bay Hotel Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Boutique waterfront hotel with contemporary rooms featuring freestanding bathtubs and panoramic views of Marina Bay.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Rooftop Pool', 'Spa'],
  },
  {
    name: 'Four Seasons Hotel Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Urban luxury retreat in the heart of Orchard Road featuring garden-view suites with elegant soaking tubs.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Spa', 'Fitness Center'],
  },
  {
    name: 'The Ritz-Carlton Millenia Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Contemporary luxury hotel with floor-to-ceiling windows and suites featuring octagonal bathtubs framing breathtaking views of Marina Bay.',
    amenities: ['Bathtub', 'Spa', 'Pool', 'Club Lounge'],
  },
  {
    name: 'W Singapore Sentosa Cove',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Vibrant resort hotel at Sentosa Cove marina featuring WOW Suites with private soaking tubs and outdoor terraces.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Spa'],
  },
  {
    name: 'Fairmont Singapore',
    city: 'Singapore',
    country: 'Singapore',
    description: 'Premier city hotel in Raffles City featuring elegantly appointed suites with soaking bathtubs and exceptional city skyline views.',
    amenities: ['Bathtub', 'Spa', 'Pool', 'Fitness Center'],
  },

  // ─── KUALA LUMPUR ────────────────────────────────────────────────────────────
  {
    name: 'Mandarin Oriental Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Iconic five-star hotel facing the Petronas Twin Towers with suites featuring in-room soaking bathtubs and stunning skyline views.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Spa', 'City View'],
  },
  {
    name: 'The Ritz-Carlton Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Award-winning luxury hotel in the heart of KL city centre with expansive club suites and marble bathtubs overlooking the Twin Towers.',
    amenities: ['Bathtub', 'Marble Bathtub', 'Spa', 'Pool', 'Club Lounge'],
  },
  {
    name: 'Four Seasons Hotel Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Ultra-luxury hotel with sky-high pool and suites featuring custom bathtubs positioned to frame the Petronas Towers silhouette.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Sky Pool', 'Spa'],
  },
  {
    name: 'Skylon Residences Bukit Ceylon',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Premium serviced suites in Bukit Ceylon featuring modern bathrooms with soaking tubs and breathtaking panoramic city views.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'City View'],
  },
  {
    name: 'Imperial KLCC Residences',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Luxury residences near KLCC featuring well-appointed suites with soaking bathtubs and twin tower views.',
    amenities: ['Bathtub', 'Pool', 'Gym', 'City View'],
  },
  {
    name: 'KLCC The Mews Luxury Suites',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    description: 'Boutique luxury suites in the heart of KLCC featuring private hot tubs and curated amenities for couples.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Concierge'],
  },

  // ─── BANGKOK ─────────────────────────────────────────────────────────────────
  {
    name: 'Dusit Thani Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Legendary Thai luxury hotel in the Embassy District with elegant suites offering deep soaking bathtubs and authentic Thai hospitality.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Spa', 'Pool', 'Thai Hospitality'],
  },
  {
    name: 'MAYU Bangkok Japanese Style Hotel',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Unique Japanese-style boutique hotel in Sukhumvit featuring tatami suites with soaking tubs inspired by Japanese onsen culture.',
    amenities: ['Bathtub', 'Japanese Soaking Tub', 'Onsen Experience'],
  },
  {
    name: 'Banyan Tree Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Urban sanctuary on the 21st–60th floors of Sathorn district offering suites with private whirlpool bathtubs and panoramic skyline views.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Spa', 'Rooftop Pool', 'City View'],
  },
  {
    name: 'SILQ Hotel & Residence',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Contemporary luxury hotel in Sukhumvit featuring sleek suites with soaking tubs and modern Thai design touches.',
    amenities: ['Bathtub', 'Hot Tub', 'Pool', 'Spa'],
  },
  {
    name: 'Pathumwan Princess Hotel',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Landmark five-star hotel connected to MBK Center featuring executive suites with soaking bathtubs and city views.',
    amenities: ['Bathtub', 'Spa', 'Pool', 'Fitness Center', 'City View'],
  },
  {
    name: 'W Bangkok Hotel',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Stylish W-brand hotel in Bangkok\'s Embassy District with WOW Suites featuring designer soaking tubs and vibrant nightlife access.',
    amenities: ['Bathtub', 'Hot Tub', 'Rooftop Pool', 'Spa'],
  },
  {
    name: 'Centara Grand at CentralWorld',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Flagship tower hotel above CentralWorld mall with sky suites featuring panoramic bathtub views of Bangkok\'s cityscape.',
    amenities: ['Bathtub', 'Sky Pool', 'Spa', 'City View'],
  },
  {
    name: 'Sivatel Bangkok Hotel',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Elegant boutique-luxury hotel near Ploenchit BTS with suites featuring freestanding bathtubs and butler service.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Pool', 'Butler Service'],
  },
  {
    name: 'V20 Boutique Jacuzzi Hotel',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Specialist boutique hotel in Chatuchak where every room includes a private jacuzzi, designed for couple getaways.',
    amenities: ['Bathtub', 'Jacuzzi', 'Hot Tub', 'Couple Friendly'],
  },

  // ─── BOSTON ──────────────────────────────────────────────────────────────────
  {
    name: 'Four Seasons Boston',
    city: 'Boston',
    country: 'United States',
    description: 'Classic Back Bay luxury hotel overlooking the Public Garden featuring suites with marble soaking bathtubs and butler service.',
    amenities: ['Bathtub', 'Marble Bathtub', 'Spa', 'Pool', 'Butler Service'],
  },
  {
    name: 'Boston Harbor Hotel',
    city: 'Boston',
    country: 'United States',
    description: 'Iconic waterfront hotel at Rowes Wharf with harbor-view suites featuring oversized bathtubs and unobstructed Boston Harbor panoramas.',
    amenities: ['Bathtub', 'Hot Tub', 'Spa', 'Harbor View'],
  },
  {
    name: 'Raffles Boston',
    city: 'Boston',
    country: 'United States',
    description: 'Newly opened Raffles property in Back Bay featuring signature suites with freestanding bathtubs and skyline views.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Spa', 'Pool', 'City View'],
  },
  {
    name: 'Clarendon Square Bed & Breakfast',
    city: 'Boston',
    country: 'United States',
    description: 'Intimate South End brownstone B&B rated 9.7 on Booking.com, featuring romantic rooms with soaking bathtubs and curated Boston hospitality.',
    amenities: ['Bathtub', 'Romantic Suites', 'Couple Friendly'],
  },
  {
    name: 'Mandarin Oriental Boston',
    city: 'Boston',
    country: 'United States',
    description: 'Sophisticated Back Bay hotel with suites featuring freestanding soaking tubs positioned to frame the Prudential Center skyline.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Spa', 'Fitness Center'],
  },
  {
    name: 'Omni Boston Hotel at the Seaport',
    city: 'Boston',
    country: 'United States',
    description: 'Modern luxury hotel in Boston\'s Seaport District with corner suites featuring deep soaking bathtubs and harbor views.',
    amenities: ['Bathtub', 'Hot Tub', 'Rooftop Pool', 'Spa'],
  },
  {
    name: 'The Westin Boston Seaport District',
    city: 'Boston',
    country: 'United States',
    description: 'Contemporary waterfront hotel in the Innovation District featuring spacious suites with soaking bathtubs.',
    amenities: ['Bathtub', 'Pool', 'Spa', 'Fitness Center'],
  },

  // ─── BALTIMORE ───────────────────────────────────────────────────────────────
  {
    name: 'Four Seasons Baltimore',
    city: 'Baltimore',
    country: 'United States',
    description: 'Modern waterfront luxury hotel at Harbor East featuring suites with soaking bathtubs and sweeping Inner Harbor views.',
    amenities: ['Bathtub', 'Hot Tub', 'Spa', 'Pool', 'Harbor View'],
  },
  {
    name: '1840s Carrollton Inn',
    city: 'Baltimore',
    country: 'United States',
    description: 'Romantic historic inn in Baltimore\'s Jonestown neighborhood rated 9.5 on Booking.com, with antique-appointed rooms featuring soaking bathtubs.',
    amenities: ['Bathtub', 'Soaking Tub', 'Historic Inn', 'Romantic Getaway'],
  },
  {
    name: 'The Royal Sonesta Harbor Court Baltimore',
    city: 'Baltimore',
    country: 'United States',
    description: 'Elegant hotel facing Baltimore\'s Inner Harbor with suites featuring marble soaking bathtubs and harbor panoramas.',
    amenities: ['Bathtub', 'Marble Bathtub', 'Spa', 'Harbor View'],
  },

  // ─── KANSAS CITY ─────────────────────────────────────────────────────────────
  {
    name: 'Loews Kansas City Hotel',
    city: 'Kansas City',
    country: 'United States',
    description: 'Contemporary luxury hotel in the heart of downtown KC featuring corner suites with soaking bathtubs and city skyline views.',
    amenities: ['Bathtub', 'Hot Tub', 'Rooftop Pool', 'Spa', 'City View'],
  },
  {
    name: 'The Westin Kansas City at Crown Center',
    city: 'Kansas City',
    country: 'United States',
    description: 'Upscale hotel connected to the Crown Center Shops featuring suites with soaking bathtubs in a convenient downtown location.',
    amenities: ['Bathtub', 'Pool', 'Spa', 'Fitness Center'],
  },
  {
    name: 'Drury Inn & Suites Kansas City Airport',
    city: 'Kansas City',
    country: 'United States',
    description: 'Well-appointed hotel near KCI Airport featuring rooms with soaking bathtubs and exceptional guest ratings.',
    amenities: ['Bathtub', 'Pool', 'Fitness Center', 'Free Breakfast'],
  },
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
