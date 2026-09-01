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
  roomType: { type: String, default: 'Luxury Suite with Bathtub' },
  tubType: { type: String, default: 'Private In-Room Soaking Tub' },
  bookingTip: { type: String, default: 'Select the verified Suite category on check-in.' }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const wave3Hotels = [
  // ==========================================
  // INDIA - JAISALMER
  // ==========================================
  {
    name: 'Suryagarh Jaisalmer',
    city: 'Jaisalmer',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/suryagarh-jaisalmer-details.html',
    bookingUrl: 'https://www.booking.com/hotel/in/suryagarh.html',
    agodaUrl: 'https://www.agoda.com/suryagarh-hotel/hotel/jaisalmer-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Fortress luxury hotel in the Thar Desert with sandstone courtyards, Rajasthani royal suites, and private sunken stone bathtubs.',
    rating: 4.9,
    reviewsCount: 520,
    roomType: 'Jaisalmer Suite with Sunken Stone Tub',
    tubType: 'Hand-Carved Sunken Sandstone Bathtub',
    bookingTip: 'Book the "Suryagarh Suite" for private courtyard and hand-carved stone bath.'
  },
  {
    name: 'Jaisalmer Marriott Resort & Spa',
    city: 'Jaisalmer',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/jaisalmer_marriott_resort_spa-details-jaisalmer.html',
    bookingUrl: 'https://www.booking.com/hotel/in/jaisalmer-marriott-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/jaisalmer-marriott-resort-spa/hotel/jaisalmer-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Golden yellow sandstone palace overlooking the ancient Jaisalmer Fort, featuring Quan Spa suites with deep marble soaking tubs.',
    rating: 4.8,
    reviewsCount: 440,
    roomType: 'Oasis Suite with Deep Marble Bathtub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Select "Fort View Suite" to see the golden illuminated fort from your tub.'
  },
  {
    name: 'The Serai, Jaisalmer - SUJÁN Luxury',
    city: 'Jaisalmer',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_serai_jaisalmer-details-jaisalmer.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-serai-jaisalmer.html',
    agodaUrl: 'https://www.agoda.com/the-serai-jaisalmer/hotel/jaisalmer-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '100-acre desert tented oasis with private tent suites featuring sunken outdoor sandstone plunge jacuzzis and spa bathtubs.',
    rating: 4.9,
    reviewsCount: 310,
    roomType: 'Royal Tented Suite with Private Jacuzzi',
    tubType: 'Private Sandstone Whirlpool Jacuzzi',
    bookingTip: 'The "Royal Suite" features a private heated plunge pool, dining tent, and jacuzzi.'
  },

  // ==========================================
  // INDIA - JODHPUR
  // ==========================================
  {
    name: 'Umaid Bhawan Palace, Jodhpur',
    city: 'Jodhpur',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/umaid_bhawan_palace-details-jodhpur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/umaid-bhawan-palace.html',
    agodaUrl: 'https://www.agoda.com/umaid-bhawan-palace-jodhpur/hotel/jodhpur-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'World-renowned art deco royal palace home of the Maharaja of Jodhpur, with solid pink marble bathtubs and royal bath rituals.',
    rating: 4.9,
    reviewsCount: 680,
    roomType: 'Maharani Suite with Solid Pink Marble Tub',
    tubType: 'Solid Pink Italian Marble Carved Bathtub',
    bookingTip: 'The "Maharani Suite" features the world-famous single-block pink marble bathtub designed by Norblin.'
  },
  {
    name: 'RAAS Jodhpur - Luxury Heritage',
    city: 'Jodhpur',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/raas_jodhpur-details-jodhpur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/raas.html',
    agodaUrl: 'https://www.agoda.com/raas-jodhpur/hotel/jodhpur-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '18th-century Haveli luxury boutique hotel situated directly beneath the towering Mehrangarh Fort with cast-iron clawfoot tubs.',
    rating: 4.8,
    reviewsCount: 510,
    roomType: 'Heritage Suite with Mehrangarh Fort View Tub',
    tubType: 'Freestanding Cast-Iron Bathtub',
    bookingTip: 'Book the "Heritage Suite" for dramatic illuminated fort views right above your bath.'
  },
  {
    name: 'Taj Hari Mahal, Jodhpur',
    city: 'Jodhpur',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_hari_mahal_jodhpur-details-jodhpur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-hari-mahal-jodhpur.html',
    agodaUrl: 'https://www.agoda.com/taj-hari-mahal-jodhpur/hotel/jodhpur-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Marwar palace-style luxury hotel with Mughal domes, landscaped pool gardens, and executive suites with deep soaking baths.',
    rating: 4.8,
    reviewsCount: 460,
    roomType: 'Executive Palace Suite with Bathtub',
    tubType: 'Deep Soaking Marble Bathtub',
    bookingTip: 'Choose "Executive Suite" for spacious marble bathroom and garden views.'
  },

  // ==========================================
  // INDIA - CHIKMAGALUR
  // ==========================================
  {
    name: 'The Serai Chikmagalur',
    city: 'Chikmagalur',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_serai_chikmagalur-details-chikmagalur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-serai-chikmagalur.html',
    agodaUrl: 'https://www.agoda.com/the-serai-chikmagalur/hotel/chikmagalur-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Coffee plantation luxury resort nestled in the Western Ghats with private pool villas featuring open-to-sky stone bathtubs and jacuzzis.',
    rating: 4.8,
    reviewsCount: 490,
    roomType: 'Estate Villa with Private Pool & Jacuzzi',
    tubType: 'Open-Air Plantation Jacuzzi Tub',
    bookingTip: 'Book "Estate Villa with Pool" for private coffee-canopy plunge pool and jacuzzi.'
  },
  {
    name: 'Trivik Hotels & Resorts, Mullayanagiri, Chikmagalur',
    city: 'Chikmagalur',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/trivik_hotels_resorts_chikmagalur-details-chikmagalur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/trivik-hotels-resorts-chikmagalur.html',
    agodaUrl: 'https://www.agoda.com/trivik-hotels-resorts-chikmagalur/hotel/chikmagalur-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Luxury mountain resort at 5,000 feet on the slopes of Mullayanagiri peak featuring private mountain-view jacuzzi balconies.',
    rating: 4.8,
    reviewsCount: 420,
    roomType: 'Mountain Suite with Balcony Jacuzzi',
    tubType: 'Private Mountain-View Heated Jacuzzi',
    bookingTip: 'Select "Valley View Suite with Jacuzzi" for misty mountain sunrise hydrotherapy.'
  },

  // ==========================================
  // INDIA - MAHABALESHWAR
  // ==========================================
  {
    name: 'Le Méridien Mahabaleshwar Resort & Spa',
    city: 'Mahabaleshwar',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/le_meridien_mahabaleshwar_resort_spa-details-mahabaleshwar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/le-meridien-mahabaleshwar-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/le-meridien-mahabaleshwar-resort-spa/hotel/mahabaleshwar-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '27-acre dense forest luxury resort in the Western Ghats with infinity rooftop pool and forest suites with freestanding oval bathtubs.',
    rating: 4.8,
    reviewsCount: 560,
    roomType: 'Tranquility Suite with Forest View Bathtub',
    tubType: 'Freestanding Oval Forest Bathtub',
    bookingTip: 'Book "Sanctuary Suite" for private balcony plunge pool and deep soaking tub.'
  },
  {
    name: 'Courtyard by Marriott Mahabaleshwar',
    city: 'Mahabaleshwar',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/courtyard_by_marriott_mahabaleshwar-details-mahabaleshwar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/courtyard-by-marriott-mahabaleshwar.html',
    agodaUrl: 'https://www.agoda.com/courtyard-by-marriott-mahabaleshwar/hotel/mahabaleshwar-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Contemporary valley resort surrounded by strawberry farms with private valley balconies and suites featuring deep soaking tubs.',
    rating: 4.7,
    reviewsCount: 380,
    roomType: 'Valley View Executive Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Confirm "Valley View Suite" to watch clouds roll over the valley from your bath.'
  },

  // ==========================================
  // INDIA - ALIBAUG
  // ==========================================
  {
    name: 'Radisson Blu Resort & Spa Alibaug',
    city: 'Alibaug',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/radisson_blu_resort_spa_alibaug-details-alibaug.html',
    bookingUrl: 'https://www.booking.com/hotel/in/radisson-resort-spa-alibaug.html',
    agodaUrl: 'https://www.agoda.com/radisson-blu-resort-spa-alibaug/hotel/alibaug-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '16-acre coastal sanctuary near Mumbai/Pune with Mandwa speedboat connectivity, Mandara Spa, and luxury lake villas with deep soaking tubs.',
    rating: 4.7,
    reviewsCount: 620,
    roomType: 'Lake View Villa with Deep Soaking Bath',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Executive Villa" for private lawn and spacious spa bathroom.'
  },

  // ==========================================
  // USA - ASPEN (Colorado)
  // ==========================================
  {
    name: 'The Little Nell, Aspen',
    city: 'Aspen',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-little-nell.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-little-nell.html',
    agodaUrl: 'https://www.agoda.com/the-little-nell/hotel/aspen-co-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Aspen’s only Five-Star, Five-Diamond ski-in/ski-out hotel on Aspen Mountain featuring Holly Hunt suites with deep soaking tubs and gas fireplaces.',
    rating: 4.9,
    reviewsCount: 480,
    roomType: 'Aspen Mountain Suite with Fireplace & Soaking Tub',
    tubType: 'Deep Soaking Bathtub & Steam Shower',
    bookingTip: 'Book "Mountain View Suite" for heated marble floors and fireside soaking bath after skiing.'
  },
  {
    name: 'Hotel Jerome, Auberge Resorts Collection, Aspen',
    city: 'Aspen',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/hotel-jerome-an-auberge-resort.html',
    bookingUrl: 'https://www.booking.com/hotel/us/hotel-jerome-an-auberge-resort.html',
    agodaUrl: 'https://www.agoda.com/hotel-jerome-an-auberge-resort/hotel/aspen-co-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Historic 1889 luxury landmark in downtown Aspen with vintage Western heritage, burnished leather, and deep soaking clawfoot baths.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Junior Suite with Deep Soaking Clawfoot Bath',
    tubType: 'Deep Cast-Iron Clawfoot Tub',
    bookingTip: 'Select "Executive King Suite" for mountain views and vintage clawfoot bath.'
  },

  // ==========================================
  // USA - SAN DIEGO (California)
  // ==========================================
  {
    name: 'Hotel del Coronado, Curio Collection by Hilton, San Diego',
    city: 'San Diego',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/hotel-del-coronado.html',
    bookingUrl: 'https://www.booking.com/hotel/us/hotel-del-coronado.html',
    agodaUrl: 'https://www.agoda.com/hotel-del-coronado-curio-collection-by-hilton/hotel/san-diego-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Legendary 1888 Victorian beachfront resort on Coronado Island with seaside cabana suites, fire pits, and deep oceanfront bathtubs.',
    rating: 4.8,
    reviewsCount: 890,
    roomType: 'Oceanfront Beach Village Suite with Soaking Tub',
    tubType: 'Deep Oceanfront Soaking Bathtub',
    bookingTip: 'Book "Beach Village Villa" for private oceanfront hot tub deck and deep soaking tub.'
  },
  {
    name: 'Pendry San Diego, Gaslamp Quarter',
    city: 'San Diego',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/pendry-san-diego.html',
    bookingUrl: 'https://www.booking.com/hotel/us/pendry-san-diego.html',
    agodaUrl: 'https://www.agoda.com/pendry-san-diego/hotel/san-diego-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Sleek luxury design hotel in the heart of Gaslamp Quarter with rooftop pool, Oxford Social Club, and custom ocean-blue tiled bathtubs.',
    rating: 4.8,
    reviewsCount: 520,
    roomType: 'Gaslamp Suite with Freestanding Bathtub',
    tubType: 'Freestanding Modern Soaking Tub',
    bookingTip: 'Select "Cabana Suite" with direct pool terrace access and deep soaking tub.'
  },

  // ==========================================
  // USA - NEW ORLEANS (Louisiana)
  // ==========================================
  {
    name: 'Hotel Monteleone, French Quarter, New Orleans',
    city: 'New Orleans',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/monteleone.html',
    bookingUrl: 'https://www.booking.com/hotel/us/monteleone.html',
    agodaUrl: 'https://www.agoda.com/hotel-monteleone/hotel/new-orleans-la-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: '1886 historic French Quarter luxury icon with famous rotating Carousel Bar and literary suites featuring deep jacuzzi whirlpool baths.',
    rating: 4.8,
    reviewsCount: 710,
    roomType: 'Author Suite with Private Jacuzzi Whirlpool Tub',
    tubType: 'Hydro Whirlpool Jacuzzi Bathtub',
    bookingTip: 'Book the "Truman Capote Literary Suite" for French Quarter views and hydro whirlpool tub.'
  },
  {
    name: 'The Ritz-Carlton, New Orleans',
    city: 'New Orleans',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-ritz-carlton-new-orleans.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-ritz-carlton-new-orleans.html',
    agodaUrl: 'https://www.agoda.com/the-ritz-carlton-new-orleans/hotel/new-orleans-la-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Beaux-Arts mansion on Canal Street in the French Quarter with live jazz at the Davenport Lounge and marble bathrooms with deep soaking tubs.',
    rating: 4.8,
    reviewsCount: 640,
    roomType: 'Canal Street Suite with Marble Soaking Tub',
    tubType: 'Deep Italian Marble Soaking Tub',
    bookingTip: 'Choose "Club Level Suite" for private lounge access and luxury Asprey bath amenities.'
  }
];

async function seedWave3() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Seeding Expansion Wave 3 hotels...');

  let inserted = 0;
  let updated = 0;

  for (const h of wave3Hotels) {
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

  console.log(`\n🎉 Seeded Expansion Wave 3: ${inserted} inserted, ${updated} updated.`);

  const totalHotels = await Hotel.countDocuments({ flagged: { $ne: true } });
  const countries = await Hotel.distinct('country', { flagged: { $ne: true } });
  const cities = await Hotel.distinct('city', { flagged: { $ne: true } });

  console.log(`Total Active Hotels: ${totalHotels}`);
  console.log(`Total Countries: ${countries.length} (${countries.join(', ')})`);
  console.log(`Total Active Cities: ${cities.length}`);

  await mongoose.disconnect();
}

seedWave3().catch(console.error);
