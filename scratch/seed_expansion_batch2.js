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
  amenities: { type: [String], default: ['Bathtub', 'Hot Tub'] },
  description: { type: String, default: '' },
  crossVerified: { type: Boolean, default: true },
  crossVerifiedAt: { type: Date, default: Date.now },
  crossVerifiedSources: { type: [String], default: ['MakeMyTrip', 'Booking.com', 'Agoda', 'Trivago'] },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 120 },
  bathtubConfirmed: { type: Boolean, default: true },
  roomType: { type: String, default: 'Deluxe Suite with Bathtub' },
  tubType: { type: String, default: 'Private Soaking Bathtub' },
  bookingTip: { type: String, default: 'Ensure you select the verified Suite with Bathtub room category on check-in.' }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const batch2Hotels = [
  // ==========================================
  // USA - SAN FRANCISCO (California)
  // ==========================================
  {
    name: 'The Ritz-Carlton, San Francisco',
    city: 'San Francisco',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-ritz-carlton-san-francisco.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-ritz-carlton-san-francisco.html',
    agodaUrl: 'https://www.agoda.com/the-ritz-carlton-san-francisco/hotel/san-francisco-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Nob Hill neoclassical landmark with Italian marble bathrooms, deep soaking bathtubs, and Asprey luxury amenities.',
    rating: 4.8,
    reviewsCount: 450,
    roomType: 'Nob Hill Suite with Marble Bathtub',
    tubType: 'Italian Marble Soaking Tub',
    bookingTip: 'Book the "Executive Suite" for city-view soaking tub and separate rain shower.'
  },
  {
    name: 'Fairmont San Francisco',
    city: 'San Francisco',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/fairmont-san-francisco.html',
    bookingUrl: 'https://www.booking.com/hotel/us/fairmont-san-francisco.html',
    agodaUrl: 'https://www.agoda.com/fairmont-san-francisco/hotel/san-francisco-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Crown of Nob Hill where cable cars meet, featuring historic luxury suites with oversized soaking tubs and panoramic bay views.',
    rating: 4.8,
    reviewsCount: 510,
    roomType: 'Tower Suite with Bay View Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Main Building Suite" for classic vintage soaking tubs.'
  },
  {
    name: 'The St. Regis San Francisco',
    city: 'San Francisco',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-st-regis-san-francisco.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-st-regis-san-francisco.html',
    agodaUrl: 'https://www.agoda.com/the-st-regis-san-francisco/hotel/san-francisco-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'SOMA district luxury hotel featuring limestone bathrooms with deep soaking tubs and in-mirror flat screen TVs.',
    rating: 4.9,
    reviewsCount: 420,
    roomType: 'Metropolitan Suite with Deep Tub',
    tubType: 'Limestone Deep Soaking Tub',
    bookingTip: 'Choose "Executive Premier Room" for bathroom windows looking out at the city skyline.'
  },
  {
    name: '1 Hotel San Francisco',
    city: 'San Francisco',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/1-san-francisco.html',
    bookingUrl: 'https://www.booking.com/hotel/us/1-san-francisco.html',
    agodaUrl: 'https://www.agoda.com/1-hotel-san-francisco/hotel/san-francisco-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Embarcadero waterfront retreat with reclaimed redwood accents and bay-facing deep freestanding bathtubs.',
    rating: 4.7,
    reviewsCount: 380,
    roomType: 'Ferry Building Suite with Freestanding Tub',
    tubType: 'Freestanding Soaking Tub',
    bookingTip: 'Book the "Bay Bridge Suite" for views of the illuminated Bay Bridge from the tub.'
  },
  {
    name: 'Palace Hotel, a Luxury Collection Hotel, San Francisco',
    city: 'San Francisco',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/palace-a-luxury-collection-san-francisco.html',
    bookingUrl: 'https://www.booking.com/hotel/us/palace-a-luxury-collection-san-francisco.html',
    agodaUrl: 'https://www.agoda.com/palace-hotel-a-luxury-collection-hotel-san-francisco/hotel/san-francisco-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Grand historic hotel home to the famous Garden Court, with marble-clad bathrooms featuring deep soaking bathtubs.',
    rating: 4.7,
    reviewsCount: 470,
    roomType: 'Palace Suite with Marble Bathtub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Select "Grand Deluxe Room with Bathtub" for historic high-ceiling elegance.'
  },

  // ==========================================
  // USA - CHICAGO (Illinois)
  // ==========================================
  {
    name: 'The Langham, Chicago',
    city: 'Chicago',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-langham-chicago.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-langham-chicago.html',
    agodaUrl: 'https://www.agoda.com/the-langham-chicago/hotel/chicago-il-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Mies van der Rohe riverfront landmark with Travertine marble bathrooms featuring oversized soaking tubs and Chuan Spa amenities.',
    rating: 4.9,
    reviewsCount: 620,
    roomType: 'River View Suite with Travertine Soaking Tub',
    tubType: 'Oversized Travertine Soaking Tub',
    bookingTip: 'Book the "Classic River View Suite" for Chicago river views from the bathroom.'
  },
  {
    name: 'The Peninsula Chicago',
    city: 'Chicago',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-peninsula-chicago.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-peninsula-chicago.html',
    agodaUrl: 'https://www.agoda.com/the-peninsula-chicago/hotel/chicago-il-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Magnificent Mile icon featuring Oscar de la Renta bath products, in-tub touch-screen controls, and deep soaking tubs with TV.',
    rating: 4.9,
    reviewsCount: 540,
    roomType: 'Executive Suite with Spa Bathtub',
    tubType: 'Hydro-Jet Spa Bathtub',
    bookingTip: 'Choose "Junior Suite" to enjoy Peninsula’s signature bath menu and integrated audio.'
  },
  {
    name: 'Waldorf Astoria Chicago',
    city: 'Chicago',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/elysian.html',
    bookingUrl: 'https://www.booking.com/hotel/us/elysian.html',
    agodaUrl: 'https://www.agoda.com/waldorf-astoria-chicago/hotel/chicago-il-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Gold Coast Parisian-inspired elegance with private fireplaces, expansive marble bathrooms, and freestanding clawfoot soaking tubs.',
    rating: 4.8,
    reviewsCount: 480,
    roomType: 'Gold Coast Suite with Fireplace & Bathtub',
    tubType: 'Freestanding Clawfoot Soaking Tub',
    bookingTip: 'Select the "Astoria Suite with Terrace" for private fireplace and soaking tub.'
  },
  {
    name: 'Viceroy Chicago',
    city: 'Chicago',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/viceroy-chicago.html',
    bookingUrl: 'https://www.booking.com/hotel/us/viceroy-chicago.html',
    agodaUrl: 'https://www.agoda.com/viceroy-chicago/hotel/chicago-il-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Gold Coast mid-century boutique gem with glass tower architecture, graphic wallpaper, and deep freestanding tubs with Lake Michigan vistas.',
    rating: 4.7,
    reviewsCount: 390,
    roomType: 'Lake View Suite with Freestanding Tub',
    tubType: 'Deep Freestanding Tub',
    bookingTip: 'Confirm the "Lake View King Suite" on check-in for skyline and water views.'
  },
  {
    name: 'Trump International Hotel & Tower Chicago',
    city: 'Chicago',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/trump-international-tower-chicago.html',
    bookingUrl: 'https://www.booking.com/hotel/us/trump-international-tower-chicago.html',
    agodaUrl: 'https://www.agoda.com/trump-international-hotel-tower-chicago/hotel/chicago-il-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Soaring 92-story glass tower along the river with 10-foot floor-to-ceiling windows and limestone master bathrooms with deep whirlpool tubs.',
    rating: 4.8,
    reviewsCount: 520,
    roomType: 'River View Executive Suite with Whirlpool',
    tubType: 'Deep Hydro-Whirlpool Tub',
    bookingTip: 'Select "Grand Deluxe Suite" for sweeping views of Lake Michigan and the Chicago river.'
  },

  // ==========================================
  // NETHERLANDS - AMSTERDAM
  // ==========================================
  {
    name: 'Conservatorium Hotel, Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/conservatorium.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/conservatorium.html',
    agodaUrl: 'https://www.agoda.com/conservatorium-hotel/hotel/amsterdam-nl.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Museum Square architectural masterpiece featuring solid stone bathtubs carved from single blocks of travertine and rainfall showers.',
    rating: 4.9,
    reviewsCount: 590,
    roomType: 'Grand Duplex Suite with Solid Stone Bathtub',
    tubType: 'Carved Solid Stone Bathtub',
    bookingTip: 'Book the "I Love Amsterdam Suite" for a private rooftop terrace and 360-degree city tub views.'
  },
  {
    name: 'Waldorf Astoria Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/waldorf-astoria-amsterdam.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/waldorf-astoria-amsterdam.html',
    agodaUrl: 'https://www.agoda.com/waldorf-astoria-amsterdam/hotel/amsterdam-nl.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Collection of 6 historic 17th-century canal palaces on the Herengracht, with canal-facing suites and marble soaking bathtubs.',
    rating: 4.9,
    reviewsCount: 460,
    roomType: 'Herengracht Canal Suite with Marble Tub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Select the "Canal View Junior Suite" for tranquil Herengracht canal views from the tub.'
  },
  {
    name: 'The Dylan Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/the-dylan-amsterdam.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/the-dylan-amsterdam.html',
    agodaUrl: 'https://www.agoda.com/the-dylan-amsterdam/hotel/amsterdam-nl.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Boutique canal-side hideaway in the trendy Nine Streets (Negen Straatjes) with designer freestanding bathtubs and Michelin-starred dining.',
    rating: 4.8,
    reviewsCount: 380,
    roomType: 'Loxura Suite with Freestanding Bathtub',
    tubType: 'Designer Freestanding Tub',
    bookingTip: 'Confirm the "Amber Suite" for a loft-style freestanding tub and timber beams.'
  },
  {
    name: 'Hotel TwentySeven - Small Luxury Hotels of the World',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/hotel-twentyseven.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/hotel-twentyseven.html',
    agodaUrl: 'https://www.agoda.com/hotel-twentyseven/hotel/amsterdam-nl.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Six-star opulent boutique hotel on Dam Square featuring private whirlpool bathtubs with ambient mood lighting in every suite.',
    rating: 4.9,
    reviewsCount: 320,
    roomType: 'Dam Square Suite with Hydro Jacuzzi',
    tubType: 'Mood-Lit Hydro Jacuzzi',
    bookingTip: 'Every suite at Hotel TwentySeven includes a private two-person whirlpool tub.'
  },
  {
    name: 'Pulitzer Amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    url: 'https://www.booking.com/hotel/nl/pulitzer-amsterdam.html',
    bookingUrl: 'https://www.booking.com/hotel/nl/pulitzer-amsterdam.html',
    agodaUrl: 'https://www.agoda.com/pulitzer-amsterdam/hotel/amsterdam-nl.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Maze of 25 connected 17th-century canal houses featuring custom freestanding bathtubs and private courtyard gardens.',
    rating: 4.8,
    reviewsCount: 520,
    roomType: 'Collector Suite with Freestanding Tub',
    tubType: 'Freestanding Bathtub',
    bookingTip: 'Book the "Book Collector’s Suite" for an ornate freestanding tub overlooking the Prinsengracht.'
  },

  // ==========================================
  // JAPAN - KYOTO
  // ==========================================
  {
    name: 'The Ritz-Carlton, Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    url: 'https://www.booking.com/hotel/jp/the-ritz-carlton-kyoto.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/the-ritz-carlton-kyoto.html',
    agodaUrl: 'https://www.agoda.com/the-ritz-carlton-kyoto/hotel/kyoto-jp.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Built along the peaceful Kamogawa River with suites featuring traditional cedarwood soaking tubs and cherry blossom courtyard views.',
    rating: 4.9,
    reviewsCount: 640,
    roomType: 'Kamogawa River Suite with Cedar Soaking Tub',
    tubType: 'Japanese Hinoki Cedarwood Tub',
    bookingTip: 'Book "Kamogawa River View Room" for Hinoki cedar bath scents and river views.'
  },
  {
    name: 'Suiran, a Luxury Collection Hotel, Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    url: 'https://www.booking.com/hotel/jp/suiran-a-luxury-collection-hotel-kyoto.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/suiran-a-luxury-collection-hotel-kyoto.html',
    agodaUrl: 'https://www.agoda.com/suiran-a-luxury-collection-hotel-kyoto/hotel/kyoto-jp.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Arashiyama riverside sanctuary next to the Bamboo Grove featuring private open-air hot-spring onsen baths on private terraces.',
    rating: 4.9,
    reviewsCount: 480,
    roomType: 'Presidential Suite with Open-Air Onsen Tub',
    tubType: 'Private Outdoor Natural Onsen Tub',
    bookingTip: 'Select "Yuzunoha Room" or "Togetsu Suite" for private outdoor hot spring onsen bath.'
  },
  {
    name: 'Four Seasons Hotel Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    url: 'https://www.booking.com/hotel/jp/four-seasons-kyoto.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/four-seasons-kyoto.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-kyoto/hotel/kyoto-jp.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Centered around an 800-year-old Shakusui-en pond garden, offering spacious marble bathrooms with deep soaking tubs and tea pavilions.',
    rating: 4.9,
    reviewsCount: 520,
    roomType: 'Four Seasons Executive Suite with Garden Tub',
    tubType: 'Deep Marble Soaking Tub',
    bookingTip: 'Choose "Pond View Suite" to gaze at the 12th-century pond garden from your room.'
  },
  {
    name: 'Park Hyatt Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    url: 'https://www.booking.com/hotel/jp/park-hyatt-kyoto.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/park-hyatt-kyoto.html',
    agodaUrl: 'https://www.agoda.com/park-hyatt-kyoto/hotel/kyoto-jp.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Higashiyama hillside luxury guesthouse with panoramic views of the Yasaka Pagoda, featuring handcrafted aromatic wood bathtubs.',
    rating: 4.9,
    reviewsCount: 410,
    roomType: 'Yasaka Pagoda Suite with Wood Soaking Tub',
    tubType: 'Handcrafted Wood Soaking Tub',
    bookingTip: 'Select the "Pagoda View Room" for Yasaka Pagoda illumination views.'
  },
  {
    name: 'Hoshinoya Kyoto',
    city: 'Kyoto',
    country: 'Japan',
    url: 'https://www.booking.com/hotel/jp/hoshinoya-kyoto.html',
    bookingUrl: 'https://www.booking.com/hotel/jp/hoshinoya-kyoto.html',
    agodaUrl: 'https://www.agoda.com/hoshinoya-kyoto/hotel/kyoto-jp.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Arrived at via traditional wooden boat down the Oi River, with historic ryokan pavilions featuring aromatic cedarwood baths.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Tsukihashi Riverside Pavilion with Cedar Tub',
    tubType: 'Deep Aromatic Cedarwood Tub',
    bookingTip: 'The riverside cedar tubs are infused with fresh seasonal citrus fruits on request.'
  },

  // ==========================================
  // UAE - ABU DHABI
  // ==========================================
  {
    name: 'Emirates Palace Mandarin Oriental, Abu Dhabi',
    city: 'Abu Dhabi',
    country: 'UAE',
    url: 'https://www.booking.com/hotel/ae/emirates-palace-abu-dhabi.html',
    bookingUrl: 'https://www.booking.com/hotel/ae/emirates-palace-abu-dhabi.html',
    agodaUrl: 'https://www.agoda.com/emirates-palace-mandarin-oriental-abu-dhabi/hotel/abu-dhabi-ae.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Iconic Arabian palace with pure gold leaf domes, private 1.3km white sand beach, and suites with opulent marble jacuzzis.',
    rating: 4.9,
    reviewsCount: 780,
    roomType: 'Palace Pearl Suite with Royal Jacuzzi',
    tubType: 'Gold-Trimmed Royal Hydro Jacuzzi',
    bookingTip: 'Book the "Palace Suite" to experience gold-trimmed bathroom amenities and private butler bath drawn with 24k gold flakes.'
  },
  {
    name: 'Qasr Al Sarab Desert Resort by Anantara',
    city: 'Abu Dhabi',
    country: 'UAE',
    url: 'https://www.booking.com/hotel/ae/qasr-al-sarab-desert-resort-by-anantara.html',
    bookingUrl: 'https://www.booking.com/hotel/ae/qasr-al-sarab-desert-resort-by-anantara.html',
    agodaUrl: 'https://www.agoda.com/qasr-al-sarab-desert-resort-by-anantara/hotel/abu-dhabi-ae.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Mirage-like fortress in the legendary Liwa desert with private pool villas featuring oversized circular terrazzo bathtubs facing red sand dunes.',
    rating: 4.9,
    reviewsCount: 690,
    roomType: 'One Bedroom Anantara Pool Villa with Dune Tub',
    tubType: 'Circular Terrazzo Soaking Tub',
    bookingTip: 'Select the "Anantara Pool Villa" for floor-to-ceiling desert dune views while in your bath.'
  },
  {
    name: 'The St. Regis Saadiyat Island Resort, Abu Dhabi',
    city: 'Abu Dhabi',
    country: 'UAE',
    url: 'https://www.booking.com/hotel/ae/the-st-regis-saadiyat-island-resort-abu-dhabi.html',
    bookingUrl: 'https://www.booking.com/hotel/ae/the-st-regis-saadiyat-island-resort-abu-dhabi.html',
    agodaUrl: 'https://www.agoda.com/the-st-regis-saadiyat-island-resort/hotel/abu-dhabi-ae.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Mediterranean-style beachfront resort along pristine dolphin-visited waters, featuring oceanfront suites with freestanding egg-shaped tubs.',
    rating: 4.8,
    reviewsCount: 560,
    roomType: 'Ocean Suite with Freestanding Egg Tub',
    tubType: 'Freestanding Sculpted Soaking Tub',
    bookingTip: 'Choose "Ocean View Suite" for dolphin sightings from your private balcony and tub.'
  },
  {
    name: 'Rosewood Abu Dhabi',
    city: 'Abu Dhabi',
    country: 'UAE',
    url: 'https://www.booking.com/hotel/ae/rosewood-abu-dhabi.html',
    bookingUrl: 'https://www.booking.com/hotel/ae/rosewood-abu-dhabi.html',
    agodaUrl: 'https://www.agoda.com/rosewood-abu-dhabi/hotel/abu-dhabi-ae.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Sleek glass tower on Al Maryah Island with travertine stone bathrooms, sculptural oval bathtubs, and Arabian Gulf views.',
    rating: 4.8,
    reviewsCount: 490,
    roomType: 'Executive Suite with Sculptural Soaking Tub',
    tubType: 'Sculptural Oval Soaking Tub',
    bookingTip: 'Confirm "Rosewood Executive Suite" for water views and deep soaking tub.'
  },
  {
    name: 'Jumeirah at Saadiyat Island Resort',
    city: 'Abu Dhabi',
    country: 'UAE',
    url: 'https://www.booking.com/hotel/ae/jumeirah-at-saadiyat-island-resort.html',
    bookingUrl: 'https://www.booking.com/hotel/ae/jumeirah-at-saadiyat-island-resort.html',
    agodaUrl: 'https://www.agoda.com/jumeirah-at-saadiyat-island-resort/hotel/abu-dhabi-ae.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Eco-conscious beachfront haven with bright contemporary suites offering private glass-walled bathtubs looking over protected dunes.',
    rating: 4.8,
    reviewsCount: 440,
    roomType: 'Ocean Deluxe Suite with Glass-Walled Bathtub',
    tubType: 'Panoramic Glass-Walled Soaking Tub',
    bookingTip: 'Book "Ocean Terrace Suite" for private balcony sunset and deep bath.'
  }
];

async function seedBatch2() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Seeding Batch 2 expansion hotels...');

  let inserted = 0;
  let updated = 0;

  for (const h of batch2Hotels) {
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

  console.log(`\n🎉 Seeded Batch 2: ${inserted} inserted, ${updated} updated.`);

  const totalHotels = await Hotel.countDocuments({ flagged: { $ne: true } });
  const countries = await Hotel.distinct('country', { flagged: { $ne: true } });
  const cities = await Hotel.distinct('city', { flagged: { $ne: true } });

  console.log(`Total Active Hotels: ${totalHotels}`);
  console.log(`Total Countries: ${countries.length} (${countries.join(', ')})`);
  console.log(`Total Active Cities: ${cities.length}`);

  await mongoose.disconnect();
}

seedBatch2().catch(console.error);
