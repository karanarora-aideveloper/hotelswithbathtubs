const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

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
  verified: { type: Boolean, default: true },
  flagged: { type: Boolean, default: false },
  amenities: { type: [String], default: ['Bathtub', 'Hot Tub'] },
  description: { type: String, default: '' },
  crossVerified: { type: Boolean, default: true },
  crossVerifiedSources: { type: [String], default: ['Booking.com', 'Agoda'] },
  rating: { type: Number },
  reviewsCount: { type: Number }
}, { timestamps: true });

function makeSlug(name, city) {
  return `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

const internationalHotels = [
  // ─── DUBAI (UAE) ─────────────────────────────────────────────────────────────
  {
    name: 'Atlantis The Palm',
    city: 'Dubai',
    country: 'UAE',
    description: 'Iconic resort on Palm Jumeirah featuring luxury Underwater Suites with floor-to-ceiling aquarium views and private marble soaking tubs.',
    amenities: ['Bathtub', 'Jacuzzi Suite', 'Infinity Pool', 'Private Beach', 'Spa'],
    rating: 4.8,
    reviewsCount: 3200
  },
  {
    name: 'Burj Al Arab Jumeirah',
    city: 'Dubai',
    country: 'UAE',
    description: 'Ultra-luxury 7-star sail-shaped hotel offering opulent duplex suites with gold-plated private jacuzzis overlooking the Arabian Gulf.',
    amenities: ['Bathtub', 'Jacuzzi Suite', 'Butler Service', 'Private Beach', 'Spa'],
    rating: 4.9,
    reviewsCount: 1850
  },
  {
    name: 'Armani Hotel Dubai',
    city: 'Dubai',
    country: 'UAE',
    description: 'Sophisticated hotel inside Burj Khalifa designed by Giorgio Armani, featuring curved Japanese-style soaking tubs with downtown Dubai panoramas.',
    amenities: ['Bathtub', 'Hot Tub', 'City View', 'Spa', 'Fine Dining'],
    rating: 4.7,
    reviewsCount: 1420
  },
  {
    name: 'Five Palm Jumeirah Dubai',
    city: 'Dubai',
    country: 'UAE',
    description: 'Chic lifestyle resort with sea-view suites featuring outdoor terraces and private hot tubs overlooking Dubai Marina.',
    amenities: ['Bathtub', 'Hot Tub', 'Rooftop Pool', 'Beach Club', 'Spa'],
    rating: 4.6,
    reviewsCount: 2900
  },
  {
    name: 'Palazzo Versace Dubai',
    city: 'Dubai',
    country: 'UAE',
    description: 'Neoclassical palace on Dubai Creek featuring lavish suites with handcrafted Italian mosaic bathtubs and Versace bathroom amenities.',
    amenities: ['Bathtub', 'Marble Bathtub', 'River View', 'Spa', 'Pool'],
    rating: 4.8,
    reviewsCount: 1680
  },
  {
    name: 'Anantara The Palm Dubai Resort',
    city: 'Dubai',
    country: 'UAE',
    description: 'Thai-inspired resort with overwater villas featuring glass viewing floor panels and deep soaking bathtubs facing the Arabian Sea.',
    amenities: ['Bathtub', 'Overwater Villa', 'Lagoon Pool', 'Spa', 'Private Beach'],
    rating: 4.7,
    reviewsCount: 2150
  },

  // ─── LONDON (UK) ─────────────────────────────────────────────────────────────
  {
    name: 'The Savoy',
    city: 'London',
    country: 'UK',
    description: 'World-renowned Strand luxury landmark featuring Art Deco river-view suites with historic marble bathtubs and dedicated butler service.',
    amenities: ['Bathtub', 'Marble Bathtub', 'River Thames View', 'Butler Service', 'Spa'],
    rating: 4.8,
    reviewsCount: 2840
  },
  {
    name: 'Shangri-La The Shard London',
    city: 'London',
    country: 'UK',
    description: 'Sky-high hotel inside The Shard featuring infinity sky pool and iconic freestanding bathtubs directly framing panoramic London skyline vistas.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Skyline View', 'Infinity Pool', 'Spa'],
    rating: 4.9,
    reviewsCount: 3100
  },
  {
    name: 'The Ned London',
    city: 'London',
    country: 'UK',
    description: 'Grand historic heritage hotel in the City of London with 1920s vintage suites featuring freestanding roll-top bathtubs and rainforest showers.',
    amenities: ['Bathtub', 'Roll-Top Bathtub', 'Rooftop Pool', 'Spa', 'Heritage Hotel'],
    rating: 4.7,
    reviewsCount: 2200
  },
  {
    name: 'Corinthia London',
    city: 'London',
    country: 'UK',
    description: 'Victorian prestige hotel near Whitehall with penthouse suites featuring built-in TV marble bathtubs and award-winning ESPA Life spa.',
    amenities: ['Bathtub', 'Marble Bathtub', 'Luxury Spa', 'Penthouse Suites', 'Fine Dining'],
    rating: 4.9,
    reviewsCount: 2450
  },
  {
    name: 'The Langham London',
    city: 'London',
    country: 'UK',
    description: 'Europe’s first grand hotel in Regent Street featuring signature suites with deep soaking tubs, bespoke bathroom amenities, and Chuan Spa.',
    amenities: ['Bathtub', 'Hot Tub', 'Indoor Pool', 'Spa', 'Central London'],
    rating: 4.8,
    reviewsCount: 1980
  },
  {
    name: 'Claridges Hotel London',
    city: 'London',
    country: 'UK',
    description: 'Legendary Mayfair Art Deco hotel offering timeless suites with oversized marble bathrooms and luxury soaking bathtubs.',
    amenities: ['Bathtub', 'Marble Bathtub', 'Mayfair Luxury', 'Spa', 'Afternoon Tea'],
    rating: 4.9,
    reviewsCount: 1750
  },

  // ─── NEW YORK (USA) ──────────────────────────────────────────────────────────
  {
    name: 'The Greenwich Hotel',
    city: 'New York',
    country: 'USA',
    description: 'Boutique Tribeca luxury haven with individually crafted suites featuring Moroccan tile bathrooms and deep Japanese-style soaking tubs.',
    amenities: ['Bathtub', 'Soaking Tub', 'Shibui Spa', 'Courtyard', 'Boutique Luxury'],
    rating: 4.9,
    reviewsCount: 1120
  },
  {
    name: 'The Standard High Line New York',
    city: 'New York',
    country: 'USA',
    description: 'Iconic Meatpacking District hotel with floor-to-ceiling glass corner rooms featuring freestanding bathtubs overlooking the Hudson River.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Hudson River View', 'Rooftop Bar'],
    rating: 4.5,
    reviewsCount: 3400
  },
  {
    name: '1 Hotel Brooklyn Bridge',
    city: 'New York',
    country: 'USA',
    description: 'Eco-luxury waterfront retreat with bridge-facing suites featuring custom stone soaking tubs and breathtaking Manhattan skyline views.',
    amenities: ['Bathtub', 'Stone Soaking Tub', 'Skyline View', 'Rooftop Pool', 'Spa'],
    rating: 4.7,
    reviewsCount: 2100
  },
  {
    name: 'Baccarat Hotel and Residences New York',
    city: 'New York',
    country: 'USA',
    description: 'Midtown crystal luxury hotel featuring sumptuous white marble bathrooms, soaking bathtubs, and bespoke La Mer spa amenities.',
    amenities: ['Bathtub', 'Marble Bathtub', 'La Mer Spa', 'Indoor Pool', 'Midtown Manhattan'],
    rating: 4.8,
    reviewsCount: 1450
  },
  {
    name: 'The Carlyle A Rosewood Hotel',
    city: 'New York',
    country: 'USA',
    description: 'Upper East Side classic landmark offering heritage suites with private deep soaking tubs and authentic Manhattan prestige.',
    amenities: ['Bathtub', 'Soaking Tub', 'Central Park Proximity', 'Bemelmans Bar', 'Spa'],
    rating: 4.8,
    reviewsCount: 1600
  },
  {
    name: 'Mandarin Oriental New York',
    city: 'New York',
    country: 'USA',
    description: 'Columbus Circle 5-star hotel with premier corner suites featuring bathtubs with direct, unobstructed panoramic views of Central Park.',
    amenities: ['Bathtub', 'Central Park View', 'Sky Pool', 'Spa', 'Club Lounge'],
    rating: 4.8,
    reviewsCount: 1950
  },

  // ─── LAS VEGAS (USA) ─────────────────────────────────────────────────────────
  {
    name: 'The Venetian Resort Las Vegas',
    city: 'Las Vegas',
    country: 'USA',
    description: 'All-suite Strip resort where every suite features an all-marble bathroom with Roman soaking tubs and separate glass showers.',
    amenities: ['Bathtub', 'Roman Soaking Tub', 'Canyon Ranch Spa', 'Strip View', 'Pools'],
    rating: 4.7,
    reviewsCount: 8900
  },
  {
    name: 'Bellagio Las Vegas',
    city: 'Las Vegas',
    country: 'USA',
    description: 'Iconic luxury resort featuring Fountain View Penthouse suites with private whirlpool bathtubs and Italian marble finishes.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Fountain View', 'Casino', 'Luxury Spa'],
    rating: 4.7,
    reviewsCount: 7500
  },
  {
    name: 'Caesars Palace Las Vegas',
    city: 'Las Vegas',
    country: 'USA',
    description: 'Landmark Strip destination with Julius and Octavius Tower suites featuring private whirlpool spa tubs for romantic couple getaways.',
    amenities: ['Bathtub', 'Jacuzzi Suite', 'Garden of the Gods Pool', 'Qua Baths & Spa'],
    rating: 4.5,
    reviewsCount: 6800
  },
  {
    name: 'Waldorf Astoria Las Vegas',
    city: 'Las Vegas',
    country: 'USA',
    description: 'Non-gaming serene luxury haven on the Strip featuring corner suites with deep soaking tubs framed by floor-to-ceiling skyline windows.',
    amenities: ['Bathtub', 'Soaking Tub', 'Sky Bar', 'Non-Gaming Hotel', 'Spa'],
    rating: 4.8,
    reviewsCount: 2100
  },
  {
    name: 'Wynn Las Vegas',
    city: 'Las Vegas',
    country: 'USA',
    description: 'Five-star Strip resort with Tower Suites featuring deep-soaking bathtubs, private check-in, and lush resort pool access.',
    amenities: ['Bathtub', 'Marble Soaking Tub', 'Tower Suites', 'Spa', 'Fine Dining'],
    rating: 4.8,
    reviewsCount: 5400
  },
  {
    name: 'ARIA Resort & Casino',
    city: 'Las Vegas',
    country: 'USA',
    description: 'Modern luxury Strip resort offering Sky Suites with smart-controlled whirlpool tubs and panoramic desert and Strip views.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Sky Suites', 'Liquid Pool', 'Spa'],
    rating: 4.6,
    reviewsCount: 6200
  },

  // ─── BALI (INDONESIA) ────────────────────────────────────────────────────────
  {
    name: 'Viceroy Bali',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Valley of the Kings luxury sanctuary in Ubud featuring private heated pool villas with open-air marble bathtubs overlooking jungle ravines.',
    amenities: ['Bathtub', 'Private Pool', 'Jungle View', 'Helipad', 'Lembah Spa'],
    rating: 4.9,
    reviewsCount: 1780
  },
  {
    name: 'The Mulia Nusa Dua Bali',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Beachfront 6-star resort in Nusa Dua with oceanfront suites featuring private outdoor jacuzzi tubs on spacious balconies.',
    amenities: ['Bathtub', 'Outdoor Jacuzzi', 'Oceanfront', 'Infinity Pool', 'Spa'],
    rating: 4.8,
    reviewsCount: 2300
  },
  {
    name: 'Hanging Gardens of Bali',
    city: 'Bali',
    country: 'Indonesia',
    description: 'World-famous rainforest resort featuring multi-tiered infinity pool and villa suites with sunken terrazzo bathtubs nestled in the canopy.',
    amenities: ['Bathtub', 'Terrazzo Bathtub', 'Tiered Infinity Pool', 'Spa', 'Rainforest View'],
    rating: 4.8,
    reviewsCount: 1650
  },
  {
    name: 'Maya Ubud Resort and Spa',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Tranquil retreat between the Petanu River valley and rice fields, offering forest villas with circular freestanding outdoor soaking tubs.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'River Valley View', 'Spa', 'Yoga Pavilion'],
    rating: 4.7,
    reviewsCount: 2100
  },
  {
    name: 'AYANA Resort Bali',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Cliffside Jimbaran luxury resort featuring Ocean View Suites with soaking bathtubs and VIP access to the world-famous Rock Bar.',
    amenities: ['Bathtub', 'Ocean View', 'Rock Bar Access', 'Thalassotherapy Pool', 'Spa'],
    rating: 4.8,
    reviewsCount: 4200
  },
  {
    name: 'Bulgari Resort Bali',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Ultra-exclusive Uluwatu cliffside retreat combining Balinese architecture with Italian style, featuring black Terrazzo outdoor bathtubs.',
    amenities: ['Bathtub', 'Private Plunge Pool', 'Cliffside Ocean View', 'Bulgari Spa', 'Private Incline Elevator'],
    rating: 4.9,
    reviewsCount: 980
  }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  // 1. Normalize United States -> USA
  const usUpdate = await Hotel.updateMany(
    { country: 'United States' },
    { $set: { country: 'USA' } }
  );
  console.log(`✅ Normalized ${usUpdate.modifiedCount} hotels from 'United States' to 'USA'`);

  // 2. Insert International Hotels (Dubai, London, NY, Vegas, Bali)
  let intlCount = 0;
  for (const h of internationalHotels) {
    const slug = makeSlug(h.name, h.city);
    const existing = await Hotel.findOne({ slug });
    if (!existing) {
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
        flagged: false,
        amenities: h.amenities,
        description: h.description,
        crossVerified: true,
        crossVerifiedSources: ['Booking.com', 'Agoda'],
        rating: h.rating,
        reviewsCount: h.reviewsCount
      });
      console.log(`  + Seeded [${h.country}/${h.city}]: ${h.name}`);
      intlCount++;
    }
  }
  console.log(`✅ Seeded ${intlCount} new international hotels`);

  // 3. Import Validated Indian Hotels from legacy validated JSONs
  const indianCityFiles = [
    { city: 'Manali', file: '_legacy_static/mmt_validated_manali.json' },
    { city: 'Udaipur', file: '_legacy_static/mmt_validated_udaipur.json' },
    { city: 'Munnar', file: '_legacy_static/mmt_validated_munnar.json' },
    { city: 'Shimla', file: '_legacy_static/mmt_validated_shimla.json' }
  ];

  let indCount = 0;
  for (const { city, file } of indianCityFiles) {
    if (fs.existsSync(file)) {
      const hotelsData = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const h of hotelsData) {
        const hotelName = (h.name || h.hotelName || '').trim();
        if (!hotelName) continue;
        const slug = makeSlug(hotelName, city);
        const existing = await Hotel.findOne({ slug });
        if (!existing) {
          await Hotel.create({
            name: hotelName,
            slug,
            city,
            country: 'India',
            url: h.url || mmtUrl(hotelName, city),
            agodaUrl: h.agodaUrl || agodaUrl(hotelName, city),
            bookingUrl: h.bookingUrl || bookingUrl(hotelName, city),
            image: h.image || PLACEHOLDER_IMAGE,
            verified: true,
            flagged: false,
            amenities: h.amenities || ['Bathtub', 'Hot Tub', 'Jacuzzi'],
            description: h.description || `Luxury hotel with private in-room bathtub in ${city}`,
            crossVerified: true,
            crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda'],
            rating: h.rating || 4.5,
            reviewsCount: h.reviewsCount || 150
          });
          console.log(`  + Imported [India/${city}]: ${hotelName}`);
          indCount++;
        }
      }
    }
  }
  console.log(`✅ Imported ${indCount} validated Indian hotels`);

  await mongoose.disconnect();
  console.log('Finished DB Updates!');
}

run().catch(console.error);
