// Seed Tokyo and Paris hotels
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
  // ── TOKYO ──
  {
    name: 'The Peninsula Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 45000,
    rating: 9.6,
    bathtubType: 'Deep soaking tub with city views',
    description: 'Iconic grand dame in Marunouchi with deep soaking tubs framing Tokyo Tower views. All Deluxe rooms feature marble bathrooms with separate soaking tubs.',
    bookingUrl: 'https://www.booking.com/hotel/jp/the-peninsula-tokyo.html',
    agodaUrl: 'https://www.agoda.com/the-peninsula-tokyo',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000031286',
    amenities: ['In-room bathtub', 'City view', 'Butler service', 'Spa', 'Fine dining', 'Concierge'],
    flagged: false,
  },
  {
    name: 'Aman Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 85000,
    rating: 9.7,
    bathtubType: 'Freestanding soaking tub, Mount Fuji views',
    description: 'Sky-high sanctuary on the top six floors of the Otemachi Tower. Suites feature Japanese-inspired freestanding tubs beside floor-to-ceiling windows with views to Mount Fuji on clear days.',
    bookingUrl: 'https://www.booking.com/hotel/jp/aman-tokyo.html',
    agodaUrl: 'https://www.agoda.com/aman-tokyo',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000120055',
    amenities: ['In-room bathtub', 'Mount Fuji view', 'Indoor pool', 'Spa', 'Library lounge', 'Japanese garden'],
    flagged: false,
  },
  {
    name: 'The Ritz-Carlton Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 52000,
    rating: 9.5,
    bathtubType: 'Marble soaking tub, 45th-floor skyline views',
    description: 'Occupying floors 45–53 of Midtown Tower, the Ritz-Carlton Tokyo suites feature marble soaking tubs with panoramic city or Mount Fuji views above the clouds.',
    bookingUrl: 'https://www.booking.com/hotel/jp/the-ritz-carlton-tokyo.html',
    agodaUrl: 'https://www.agoda.com/the-ritz-carlton-tokyo',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000086441',
    amenities: ['In-room bathtub', 'Sky lounge', 'Spa', 'Pool', 'Fine dining', 'Concierge'],
    flagged: false,
  },
  {
    name: 'Park Hyatt Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 38000,
    rating: 9.4,
    bathtubType: 'Soaking tub with Shinjuku skyline views',
    description: 'Made famous by Lost in Translation, the Park Hyatt Tokyo\'s Club rooms and suites feature deep soaking tubs looking out over the Shinjuku skyscraper forest and beyond.',
    bookingUrl: 'https://www.booking.com/hotel/jp/park-hyatt-tokyo.html',
    agodaUrl: 'https://www.agoda.com/park-hyatt-tokyo',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000064533',
    amenities: ['In-room bathtub', 'Rooftop pool', 'Spa', 'New York Bar', 'City views', 'Library'],
    flagged: false,
  },
  {
    name: 'Mandarin Oriental Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 48000,
    rating: 9.5,
    bathtubType: 'Freestanding tub, Tokyo skyline panorama',
    description: 'Perched on floors 30–38 of Nihonbashi Mitsui Tower, the Mandarin Oriental\'s suites feature glass-encased freestanding bathtubs that seem to float above the Tokyo skyline.',
    bookingUrl: 'https://www.booking.com/hotel/jp/mandarin-oriental-tokyo.html',
    agodaUrl: 'https://www.agoda.com/mandarin-oriental-tokyo',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000067892',
    amenities: ['In-room bathtub', 'Spa', 'Pool', 'Fine dining', 'Concierge', 'Business centre'],
    flagged: false,
  },
  {
    name: 'Four Seasons Hotel Tokyo at Otemachi',
    city: 'Tokyo',
    country: 'Japan',
    image: PLACEHOLDER_IMAGE,
    price: 55000,
    rating: 9.6,
    bathtubType: 'Deep soaking tub with Imperial Palace Garden views',
    description: 'One of the world\'s most coveted hotel rooms: a Premier Room with a deep soaking tub overlooking the Imperial Palace East Garden, the last green expanse in central Tokyo.',
    bookingUrl: 'https://www.booking.com/hotel/jp/four-seasons-otemachi-tokyo.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-tokyo-at-otemachi',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000210987',
    amenities: ['In-room bathtub', 'Imperial Palace views', 'Spa', 'Infinity pool', 'Fine dining', 'Concierge'],
    flagged: false,
  },

  // ── PARIS ──
  {
    name: 'Hôtel Ritz Paris',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 95000,
    rating: 9.8,
    bathtubType: 'Marble freestanding tub, Place Vendôme views',
    description: 'The world\'s most storied luxury hotel. Every Ritz suite features a marble-clad bathroom with a deep freestanding soaking tub. The Coco Chanel Suite bathtub overlooks Place Vendôme.',
    bookingUrl: 'https://www.booking.com/hotel/fr/ritz-paris.html',
    agodaUrl: 'https://www.agoda.com/ritz-paris',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000015432',
    amenities: ['In-room bathtub', 'Place Vendôme views', 'Spa', 'Indoor pool', 'Bar Hemingway', 'Butler service'],
    flagged: false,
  },
  {
    name: 'Le Bristol Paris',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 72000,
    rating: 9.6,
    bathtubType: 'Freestanding copper tub, garden or Rue du Faubourg views',
    description: 'A Palace hotel on Rue du Faubourg Saint-Honoré, Le Bristol\'s suites feature signature copper soaking tubs positioned to look onto the private French garden — Paris\'s largest private hotel garden.',
    bookingUrl: 'https://www.booking.com/hotel/fr/le-bristol-paris.html',
    agodaUrl: 'https://www.agoda.com/le-bristol-paris',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000033211',
    amenities: ['In-room bathtub', 'Private garden', 'Rooftop pool', 'Spa', 'Epicure restaurant', 'Butler service'],
    flagged: false,
  },
  {
    name: 'Four Seasons Hotel George V Paris',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 68000,
    rating: 9.6,
    bathtubType: 'Marble soaking tub, Eiffel Tower or courtyard views',
    description: 'Legendary Art Deco palace on Avenue George V. The Eiffel Suite\'s marble soaking tub faces the glittering tower — one of the most photographed bathtub views in Europe.',
    bookingUrl: 'https://www.booking.com/hotel/fr/four-seasons-george-v-paris.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-george-v-paris',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000028765',
    amenities: ['In-room bathtub', 'Eiffel Tower views', 'Spa', 'Indoor pool', 'Three Michelin stars', 'Concierge'],
    flagged: false,
  },
  {
    name: 'Hôtel de Crillon, A Rosewood Hotel',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 78000,
    rating: 9.7,
    bathtubType: 'Freestanding tub, Place de la Concorde views',
    description: 'Built in 1758 on Place de la Concorde, the Crillon\'s Boiserie Suites feature 18th-century panelling and freestanding bathtubs aligned with windows overlooking the grandest square in Paris.',
    bookingUrl: 'https://www.booking.com/hotel/fr/hotel-de-crillon.html',
    agodaUrl: 'https://www.agoda.com/hotel-de-crillon-a-rosewood-hotel',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000089034',
    amenities: ['In-room bathtub', 'Place de la Concorde views', 'Spa', 'Pool', 'Les Ambassadeurs bar', 'Butler'],
    flagged: false,
  },
  {
    name: 'Mandarin Oriental Paris',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 58000,
    rating: 9.5,
    bathtubType: 'Deep soaking tub, private garden terrace',
    description: 'On Rue Saint-Honoré in the heart of the Golden Triangle, Mandarin Oriental\'s suites open onto a private garden. Garden suites feature soaking tubs beside floor-to-ceiling windows that frame Paris greenery.',
    bookingUrl: 'https://www.booking.com/hotel/fr/mandarin-oriental-paris.html',
    agodaUrl: 'https://www.agoda.com/mandarin-oriental-paris',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000104521',
    amenities: ['In-room bathtub', 'Private garden', 'Spa', 'Spa pool', 'Camélia restaurant', 'Concierge'],
    flagged: false,
  },
  {
    name: 'Park Hyatt Paris-Vendôme',
    city: 'Paris',
    country: 'France',
    image: PLACEHOLDER_IMAGE,
    price: 49000,
    rating: 9.4,
    bathtubType: 'Soaking tub in glass-walled bathroom',
    description: 'A Haussmann masterpiece steps from Place Vendôme. The Vendôme Suites feature glass-walled bathrooms that slide open to the bedroom, with deep soaking tubs and hand-woven Frette linen.',
    bookingUrl: 'https://www.booking.com/hotel/fr/park-hyatt-paris-vendome.html',
    agodaUrl: 'https://www.agoda.com/park-hyatt-paris-vendome',
    makemytripUrl: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=1000052318',
    amenities: ['In-room bathtub', 'Place Vendôme area', 'Spa', 'Indoor pool', 'Pur restaurant', 'Concierge'],
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
  console.log(`   Tokyo: ${hotels.filter(h => h.city === 'Tokyo').length} hotels`);
  console.log(`   Paris: ${hotels.filter(h => h.city === 'Paris').length} hotels`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
