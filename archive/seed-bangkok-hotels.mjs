// Seed Bangkok hotels
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  price: { type: Number },
  rating: { type: Number },
  bathtubType: { type: String },
  description: { type: String },
  bookingUrl: { type: String },
  agodaUrl: { type: String },
  makemytripUrl: { type: String },
  amenities: [String],
  flagged: { type: Boolean, default: false },
}, { timestamps: true });

const PLACEHOLDER_IMAGE = 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp';

function toSlug(name, city) {
  return (name + '-' + city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const hotels = [
  {
    name: 'Capella Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 28000,
    rating: 9.8,
    bathtubType: 'Freestanding tub with Chao Phraya river views',
    description: 'Opened in 2021, Capella Bangkok instantly claimed the title of best new hotel in Southeast Asia. All 101 suites face the Chao Phraya River — every one includes a deep soaking tub positioned to frame the water at golden hour.',
    bookingUrl: 'https://www.booking.com/hotel/th/capella-bangkok.html',
    agodaUrl: 'https://www.agoda.com/capella-bangkok',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000198876',
    amenities: ['In-room bathtub', 'River view', 'Spa', 'Pool', 'Butler service', 'Fine dining'],
    flagged: false,
  },
  {
    name: 'Mandarin Oriental Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 22000,
    rating: 9.7,
    bathtubType: 'Marble soaking tub, riverside — open since 1879',
    description: 'The oldest hotel in Thailand and the most storied hotel address in Asia. Oriental Wing suites feature deep marble soaking tubs with riverside views. Past guests include Joseph Conrad, Somerset Maugham, and Noël Coward.',
    bookingUrl: 'https://www.booking.com/hotel/th/mandarin-oriental-bangkok.html',
    agodaUrl: 'https://www.agoda.com/mandarin-oriental-bangkok',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000012345',
    amenities: ['In-room bathtub', 'River view', 'Spa', 'Pool', 'Butler service', 'Historic property'],
    flagged: false,
  },
  {
    name: 'The Peninsula Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 18000,
    rating: 9.6,
    bathtubType: 'Deep soaking tub, Grand Palace & river panorama',
    description: 'Situated on the west bank of the Chao Phraya, directly opposite the Grand Palace. River Suites feature marble bathrooms with separate deep soaking tubs — at night, illuminated temples across the water create an extraordinary backdrop.',
    bookingUrl: 'https://www.booking.com/hotel/th/the-peninsula-bangkok.html',
    agodaUrl: 'https://www.agoda.com/the-peninsula-bangkok',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000034567',
    amenities: ['In-room bathtub', 'Grand Palace view', 'River view', 'Spa', 'Pool', 'Butler service'],
    flagged: false,
  },
  {
    name: 'Rosewood Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 21000,
    rating: 9.5,
    bathtubType: 'Freestanding tub, panoramic Bangkok skyline views',
    description: 'A sky-high statement of contemporary Thai design in a striking 30-storey tower above Ploenchit. Estate Suites feature freestanding soaking tubs behind floor-to-ceiling windows with a panoramic Bangkok city canvas.',
    bookingUrl: 'https://www.booking.com/hotel/th/rosewood-bangkok.html',
    agodaUrl: 'https://www.agoda.com/rosewood-bangkok',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000167890',
    amenities: ['In-room bathtub', 'City view', 'Spa', 'Rooftop bar', 'Fine dining', 'Concierge'],
    flagged: false,
  },
  {
    name: 'Four Seasons Hotel Bangkok at Chao Phraya',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 24000,
    rating: 9.5,
    bathtubType: 'Freestanding tub, river and city skyline views',
    description: 'A 73-storey dual-tower complex with direct Chao Phraya river frontage. River Suites feature deep soaking tubs facing the water, and the hotel\'s 80-metre riverside pool makes it Bangkok\'s most complete luxury resort experience.',
    bookingUrl: 'https://www.booking.com/hotel/th/four-seasons-chao-phraya-bangkok.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-bangkok-at-chao-phraya',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000178901',
    amenities: ['In-room bathtub', 'River view', 'Pool', 'Spa', 'Fine dining', 'Butler service'],
    flagged: false,
  },
  {
    name: '137 Pillars Suites & Residences Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    image: PLACEHOLDER_IMAGE,
    price: 15000,
    rating: 9.4,
    bathtubType: 'Rooftop outdoor soaking tub, 360° Bangkok skyline',
    description: 'A contemporary boutique tower in the heart of Sukhumvit. Penthouse Suites offer rooftop outdoor soaking tubs with a private terrace, plunge pool, and 360-degree Bangkok skyline views — one of the city\'s most Instagram-worthy bathtub experiences.',
    bookingUrl: 'https://www.booking.com/hotel/th/137-pillars-suites-residences-bangkok.html',
    agodaUrl: 'https://www.agoda.com/137-pillars-suites-residences-bangkok',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000189012',
    amenities: ['In-room bathtub', 'Rooftop terrace', 'Outdoor tub', 'City view', 'Pool', 'Concierge'],
    flagged: false,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not found');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

  let created = 0, updated = 0;
  for (const hotel of hotels) {
    const slug = toSlug(hotel.name, hotel.city);
    const existing = await Hotel.findOne({ $or: [{ name: hotel.name, city: hotel.city }, { slug }] });
    if (existing) {
      await Hotel.updateOne({ _id: existing._id }, { $set: { ...hotel, slug } });
      updated++;
    } else {
      await Hotel.create({ ...hotel, slug });
      created++;
    }
  }

  console.log(`✅ Done — created: ${created}, updated: ${updated}`);
  console.log(`   Bangkok: ${hotels.length} hotels`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
