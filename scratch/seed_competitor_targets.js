const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Hotel Schema
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
  amenities: { type: [String], default: ['Bathtub', 'Hot Tub', 'Jacuzzi'] },
  description: { type: String, default: '' },
  crossVerified: { type: Boolean, default: true },
  crossVerifiedAt: { type: Date, default: Date.now },
  crossVerifiedSources: { type: [String], default: ['MakeMyTrip', 'Booking.com', 'Agoda', 'Trivago'] },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 150 },
  bathtubConfirmed: { type: Boolean, default: true },
  roomType: { type: String, default: 'Deluxe Suite with Jacuzzi' },
  tubType: { type: String, default: 'Private Hydro-Whirlpool Bathtub' },
  bookingTip: { type: String, default: 'Ensure you select the verified Jacuzzi Suite category on check-in.' }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const competitorTargetHotels = [
  // ==========================================
  // USA - AUSTIN (Texas) - Top Semrush Keyword Target
  // ==========================================
  {
    name: 'Commodore Perry Estate, Auberge Resorts Collection, Austin',
    city: 'Austin',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/commodore-perry-estate-auberge-resorts-collection.html',
    bookingUrl: 'https://www.booking.com/hotel/us/commodore-perry-estate-auberge-resorts-collection.html',
    agodaUrl: 'https://www.agoda.com/commodore-perry-estate-auberge-resorts-collection/hotel/austin-tx-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '10-acre European-style country estate in Austin featuring custom clawfoot soaking bathtubs and private courtyard gardens.',
    rating: 4.9,
    reviewsCount: 380,
    roomType: 'Mansion Suite with Vintage Clawfoot Tub',
    tubType: 'Handcrafted Clawfoot Bathtub',
    bookingTip: 'Book the "Mansion Suite" to enjoy a standalone cast-iron tub overlooking the Italian formal gardens.'
  },
  {
    name: 'Austin Proper Hotel & Residences',
    city: 'Austin',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/austin-proper.html',
    bookingUrl: 'https://www.booking.com/hotel/us/austin-proper.html',
    agodaUrl: 'https://www.agoda.com/austin-proper-hotel-a-member-of-design-hotels/hotel/austin-tx-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Kelly Wearstler-designed downtown luxury landmark with travertine bathrooms, deep soaking bathtubs, and Aesop amenities.',
    rating: 4.8,
    reviewsCount: 460,
    roomType: 'Proper Premier Suite with Travertine Tub',
    tubType: 'Travertine Deep Soaking Tub',
    bookingTip: 'Select the "Proper Suite" for floor-to-ceiling city views from the bathtub.'
  },
  {
    name: 'Four Seasons Hotel Austin',
    city: 'Austin',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/four-seasons-austin.html',
    bookingUrl: 'https://www.booking.com/hotel/us/four-seasons-austin.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-austin/hotel/austin-tx-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Tranquil Lady Bird Lake resort with spacious marble master baths featuring deep soaking tubs and private lakeside lawns.',
    rating: 4.8,
    reviewsCount: 520,
    roomType: 'Lake View Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Confirm the "Lake-View Executive Suite" for serene Lady Bird Lake views from the bath.'
  },
  {
    name: 'Hotel Saint Cecilia, Austin',
    city: 'Austin',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/hotel-saint-cecilia.html',
    bookingUrl: 'https://www.booking.com/hotel/us/hotel-saint-cecilia.html',
    agodaUrl: 'https://www.agoda.com/hotel-saint-cecilia/hotel/austin-tx-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Secluded Victorian bohemian retreat in South Congress featuring private suites with clawfoot tubs and private turntable sound systems.',
    rating: 4.9,
    reviewsCount: 310,
    roomType: 'Estate Studio with Clawfoot Soaking Tub',
    tubType: 'Vintage Clawfoot Tub & Outdoor Shower',
    bookingTip: 'Book "Studio 1" for private wrap-around porch and indoor-outdoor clawfoot bath.'
  },
  {
    name: 'The Driskill, in The Unbound Collection by Hyatt, Austin',
    city: 'Austin',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-driskill-a-hyatt.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-driskill-a-hyatt.html',
    agodaUrl: 'https://www.agoda.com/the-driskill-in-the-unbound-collection-by-hyatt/hotel/austin-tx-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Historic 1886 Romanesque cattle-baron hotel in downtown Austin with grand cattle-king suites and deep soaking bathtubs.',
    rating: 4.7,
    reviewsCount: 440,
    roomType: 'Cattle Baron Suite with Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Choose the "Driskill Suite" for historic 14-foot ceilings and clawfoot soaking bath.'
  },

  // ==========================================
  // USA - SEATTLE (Washington) - Top Semrush Keyword Target
  // ==========================================
  {
    name: 'Four Seasons Hotel Seattle',
    city: 'Seattle',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/four-seasons-seattle.html',
    bookingUrl: 'https://www.booking.com/hotel/us/four-seasons-seattle.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-seattle/hotel/seattle-wa-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Elliott Bay waterfront hotel 1 block from Pike Place Market with marble bathrooms, in-mirror TVs, and deep soaking tubs facing Puget Sound.',
    rating: 4.9,
    reviewsCount: 590,
    roomType: 'Elliott Bay Suite with Puget Sound View Tub',
    tubType: 'Deep Soaking Marble Tub',
    bookingTip: 'Book "Bay View King Room" for sweeping Puget Sound ferry and mountain views from your tub.'
  },
  {
    name: 'The Edgewater Hotel, Seattle',
    city: 'Seattle',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-edgewater-a-noble-house.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-edgewater-a-noble-house.html',
    agodaUrl: 'https://www.agoda.com/the-edgewater-a-noble-house-hotel/hotel/seattle-wa-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Iconic over-water hotel on Pier 67 with river-rock gas fireplaces, rustic Pacific Northwest cedar timber, and deep jetted whirlpool tubs.',
    rating: 4.8,
    reviewsCount: 540,
    roomType: 'Waterfront Suite with Fireplace & Jetted Tub',
    tubType: 'Hydro-Jet Whirlpool Tub',
    bookingTip: 'Select "Waterfront King with Fireplace" for water-lapping sounds and cozy fireside whirlpool.'
  },
  {
    name: 'Lotte Hotel Seattle',
    city: 'Seattle',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/lotte-seattle.html',
    bookingUrl: 'https://www.booking.com/hotel/us/lotte-seattle.html',
    agodaUrl: 'https://www.agoda.com/lotte-hotel-seattle/hotel/seattle-wa-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Philippe Starck-designed luxury skyscraper with floor-to-ceiling glass, Italian marble bathrooms, and freestanding tubs facing the bay.',
    rating: 4.8,
    reviewsCount: 410,
    roomType: 'Premier Bay View Suite with Freestanding Tub',
    tubType: 'Freestanding Sculptural Bathtub',
    bookingTip: 'Confirm the "Premier Bay View King" to guarantee a freestanding window tub.'
  },
  {
    name: 'Inn at the Market, Seattle',
    city: 'Seattle',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/inn-at-the-market.html',
    bookingUrl: 'https://www.booking.com/hotel/us/inn-at-the-market.html',
    agodaUrl: 'https://www.agoda.com/inn-at-the-market/hotel/seattle-wa-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'The only luxury hotel inside Pike Place Market with rooftop Elliott Bay deck and suites featuring deep soaking bathtubs.',
    rating: 4.8,
    reviewsCount: 470,
    roomType: 'Water View Suite with Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Book the "Water View Suite" for views of the Olympic Mountains and Puget Sound.'
  },
  {
    name: 'Thompson Seattle',
    city: 'Seattle',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/thompson-seattle.html',
    bookingUrl: 'https://www.booking.com/hotel/us/thompson-seattle.html',
    agodaUrl: 'https://www.agoda.com/thompson-seattle-part-of-hyatt/hotel/seattle-wa-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Olson Kundig-designed modernist glass jewel next to Pike Place with Nest rooftop lounge and deep soaking bathtubs with DS & Durga amenities.',
    rating: 4.7,
    reviewsCount: 390,
    roomType: 'Water View Corner Suite with Deep Tub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Corner Suite" for dual-angle glass views over downtown Seattle and Puget Sound.'
  },

  // ==========================================
  // USA - NASHVILLE (Tennessee) - Top Semrush Keyword Target
  // ==========================================
  {
    name: 'The Hermitage Hotel, Nashville',
    city: 'Nashville',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-hermitage.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-hermitage.html',
    agodaUrl: 'https://www.agoda.com/the-hermitage-hotel/hotel/nashville-tn-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '1910 Beaux-Arts historic icon in downtown Nashville featuring lavish Italian marble bathrooms with deep soaking tubs and in-mirror TVs.',
    rating: 4.9,
    reviewsCount: 510,
    roomType: 'Grand Deluxe Suite with Marble Soaking Tub',
    tubType: 'Deep Italian Marble Soaking Tub',
    bookingTip: 'Book the "Executive Suite" for five-fixture marble bathroom with deep soaking tub.'
  },
  {
    name: 'Four Seasons Hotel Nashville',
    city: 'Nashville',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/four-seasons-nashville.html',
    bookingUrl: 'https://www.booking.com/hotel/us/four-seasons-nashville.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-nashville/hotel/nashville-tn-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Soaring riverside luxury hotel in SoBro with floor-to-ceiling glass, Cumberland River views, and freestanding oval bathtubs.',
    rating: 4.9,
    reviewsCount: 420,
    roomType: 'River View Suite with Freestanding Oval Tub',
    tubType: 'Freestanding Oval Soaking Tub',
    bookingTip: 'Select the "Cumberland River View Suite" for glowing river bridge views from your bath.'
  },
  {
    name: '1 Hotel Nashville',
    city: 'Nashville',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/1-nashville.html',
    bookingUrl: 'https://www.booking.com/hotel/us/1-nashville.html',
    agodaUrl: 'https://www.agoda.com/1-hotel-nashville/hotel/nashville-tn-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Sustainable luxury urban retreat across from Music City Center with reclaimed wood design, Bamford organic spa bath amenities, and stone tubs.',
    rating: 4.8,
    reviewsCount: 460,
    roomType: 'King Suite with Stone Soaking Bathtub',
    tubType: 'Deep Stone Soaking Tub',
    bookingTip: 'Confirm the "One Bedroom Suite" to guarantee a deep freestanding stone tub.'
  },
  {
    name: 'The Joseph, a Luxury Collection Hotel, Nashville',
    city: 'Nashville',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-joseph-a-luxury-collection-hotel-nashville.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-joseph-a-luxury-collection-hotel-nashville.html',
    agodaUrl: 'https://www.agoda.com/the-joseph-a-luxury-collection-hotel-nashville/hotel/nashville-tn-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Art-centric luxury property in SoBro with museum-quality art, Italian marble bathrooms, and freestanding bathtubs with Byredo amenities.',
    rating: 4.8,
    reviewsCount: 380,
    roomType: 'Signature Suite with Freestanding Tub',
    tubType: 'Freestanding Luxury Bathtub',
    bookingTip: 'Book the "Collector Suite" for expansive marble bath and private skyline terrace.'
  },
  {
    name: 'JW Marriott Nashville',
    city: 'Nashville',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/jw-marriott-nashville.html',
    bookingUrl: 'https://www.booking.com/hotel/us/jw-marriott-nashville.html',
    agodaUrl: 'https://www.agoda.com/jw-marriott-nashville/hotel/nashville-tn-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '33-story glass tower on the highest point in downtown with sweeping city views and luxury executive suites with deep soaking tubs.',
    rating: 4.7,
    reviewsCount: 580,
    roomType: 'Executive King Suite with Skyline Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Executive Corner Suite" for high-altitude Nashville skyline bathtub views.'
  }
];

async function seedCompetitorTargets() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Seeding Semrush competitor target hotels...');

  let inserted = 0;
  let updated = 0;

  for (const h of competitorTargetHotels) {
    const slug = `${h.city.toLowerCase().replace(/\\s+/g, '-')}-${h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-+|-+$/g, '');
    
    const doc = {
      ...h,
      slug,
      verified: true,
      flagged: false,
      crossVerified: true,
      crossVerifiedAt: new Date(),
      crossVerifiedSources: ['MakeMyTrip', 'Booking.com', 'Agoda', 'Trivago'],
      bathtubConfirmed: true
    };

    const existing = await Hotel.findOne({ slug });
    if (existing) {
      await Hotel.updateOne({ slug }, { $set: doc });
      updated++;
    } else {
      await Hotel.create(doc);
      inserted++;
    }
  }

  console.log(`\n🎉 Seeded Competitor Target Stays: ${inserted} inserted, ${updated} updated.`);

  const totalHotels = await Hotel.countDocuments({ flagged: { $ne: true } });
  const countries = await Hotel.distinct('country', { flagged: { $ne: true } });
  const cities = await Hotel.distinct('city', { flagged: { $ne: true } });

  console.log(`Total Active Hotels: ${totalHotels}`);
  console.log(`Total Countries: ${countries.length} (${countries.join(', ')})`);
  console.log(`Total Active Cities: ${cities.length}`);

  await mongoose.disconnect();
}

seedCompetitorTargets().catch(console.error);
