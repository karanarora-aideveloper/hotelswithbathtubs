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

const newExpansionHotels = [
  // ==========================================
  // INDIA - COORG (Karnataka)
  // ==========================================
  {
    name: 'The Tamara Coorg',
    city: 'Coorg',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_tamara_coorg-details-coorg.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-tamara-coorg.html',
    agodaUrl: 'https://www.agoda.com/the-tamara-coorg/hotel/coorg-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Nestled deep in lush coffee and spice plantations, featuring luxury cottages with private wooden-deck hot tubs and deep soaking valley-facing baths.',
    rating: 4.9,
    reviewsCount: 430,
    roomType: 'Luxury Villa with Private Jacuzzi',
    tubType: 'Outdoor Heated Jacuzzi & Soaking Bath',
    bookingTip: 'Book the "Eden Lotus Cottage" or "Suite with Jacuzzi" for an open-air hot tub over the rainforest.'
  },
  {
    name: 'Evolve Back, Coorg',
    city: 'Coorg',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/evolve_back_coorg-details-coorg.html',
    bookingUrl: 'https://www.booking.com/hotel/in/orange-county-resorts-spa-coorg.html',
    agodaUrl: 'https://www.agoda.com/evolve-back-coorg/hotel/coorg-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Sprawling 300-acre plantation estate featuring private pool villas with deep outdoor soaking bathtubs and royal Kodava courtyards.',
    rating: 4.9,
    reviewsCount: 510,
    roomType: 'Heritage Pool Villa with Bathtub',
    tubType: 'Private Soaking Tub & Plunge Pool',
    bookingTip: 'Select the "Lily Pool Cottage" for a private stone bath overlooking the lily pond.'
  },
  {
    name: 'Taj Madikeri Resort & Spa, Coorg',
    city: 'Coorg',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_madikeri_resort_spa_coorg-details-coorg.html',
    bookingUrl: 'https://www.booking.com/hotel/in/vivanta-by-taj-madikeri.html',
    agodaUrl: 'https://www.agoda.com/taj-madikeri-resort-spa-coorg/hotel/coorg-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Perched 4,000 feet above sea level in a cloud-forest canopy, with freestanding tubs facing misty mountain ridges.',
    rating: 4.8,
    reviewsCount: 380,
    roomType: 'Luxury Pool Villa with Valley Bathtub',
    tubType: 'Freestanding Deep Soaking Tub',
    bookingTip: 'Opt for the "Luxury Pool Villa" for floor-to-ceiling glass bathroom views over the rainforest.'
  },
  {
    name: 'The Ibnii - Eco Luxury Resort',
    city: 'Coorg',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_ibnii_eco_luxury_resort-details-coorg.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-ibnii-spa-resort.html',
    agodaUrl: 'https://www.agoda.com/the-ibnii-eco-luxury-resort/hotel/coorg-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Eco-luxury retreat offering private wooden cottages with outdoor private jacuzzis surrounded by pristine western ghats flora.',
    rating: 4.8,
    reviewsCount: 290,
    roomType: 'Kopi Luwak Wooden Cottage with Jacuzzi',
    tubType: 'Private In-Deck Jacuzzi',
    bookingTip: 'Book the "Kopi Luwak Private Pool Villa" for private jacuzzi and infinity plunge pool.'
  },
  {
    name: 'Heritage Resort Coorg',
    city: 'Coorg',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/heritage_resort_coorg-details-coorg.html',
    bookingUrl: 'https://www.booking.com/hotel/in/heritage-resort-coorg.html',
    agodaUrl: 'https://www.agoda.com/heritage-resort-coorg/hotel/coorg-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Hilltop resort with sunset viewpoints and romantic suites featuring private marble soaking bathtubs.',
    rating: 4.6,
    reviewsCount: 220,
    roomType: 'Deluxe Cottage with Bathtub',
    tubType: 'Marble Soaking Tub',
    bookingTip: 'Choose the "Estate View Cottage" for private hillside bathtub views.'
  },

  // ==========================================
  // INDIA - WAYANAD (Kerala)
  // ==========================================
  {
    name: 'Mountain Shadows Resort Wayanad',
    city: 'Wayanad',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/mountain_shadows_resort_wayanad-details-wayanad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/mountain-shadows-resorts.html',
    agodaUrl: 'https://www.agoda.com/mountain-shadows-resort/hotel/wayanad-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Set on a secluded peninsula inside the Karapuzha reservoir with lakefront private jacuzzi villas and infinity pools.',
    rating: 4.9,
    reviewsCount: 340,
    roomType: 'Lake View Jacuzzi Villa',
    tubType: 'Private Lakefront Jacuzzi',
    bookingTip: 'The "Romantic Jacuzzi Villa" includes a private hydro-massage tub looking over the water.'
  },
  {
    name: 'Vythiri Village Resort',
    city: 'Wayanad',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/vythiri_village-details-wayanad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/vythiri-village.html',
    agodaUrl: 'https://www.agoda.com/vythiri-village-resort/hotel/wayanad-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Luxury five-star spa resort offering pool villas with private in-room bathtubs and high-altitude mountain breeze.',
    rating: 4.7,
    reviewsCount: 460,
    roomType: 'Pool Villa with In-Room Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Celebrity Pool Villa" for an enclosed garden bathtub and private pool.'
  },
  {
    name: 'Morickap Resort Wayanad',
    city: 'Wayanad',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/morickap_resort-details-wayanad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/morickap-resort.html',
    agodaUrl: 'https://www.agoda.com/morickap-resort/hotel/wayanad-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Swiss-chalet style hilltop villas featuring private jacuzzis with panoramic views of the Vythiri tea estates.',
    rating: 4.8,
    reviewsCount: 310,
    roomType: 'Jacuzzi Villa with Valley View',
    tubType: 'Private Jacuzzi Tub',
    bookingTip: 'Book the "Morickap Jacuzzi Suite" for in-room couple whirlpool.'
  },
  {
    name: 'Contour Island Resort & Spa',
    city: 'Wayanad',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/contour_island_resort_spa-details-wayanad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/contour-island-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/contour-island-resort-spa/hotel/wayanad-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Overlooking the Banasura Sagar dam with lakeview pool villas and expansive in-room freestanding bathtubs.',
    rating: 4.7,
    reviewsCount: 210,
    roomType: 'Lake View Villa with Bathtub',
    tubType: 'Freestanding Bathtub',
    bookingTip: 'Choose "Lake Front Villa" for floor-to-ceiling bathroom views over Banasura reservoir.'
  },
  {
    name: 'Wild Planet Resort',
    city: 'Wayanad',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/wild_planet_resort-details-wayanad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/wild-planet-jungle-resort.html',
    agodaUrl: 'https://www.agoda.com/wild-planet-resort/hotel/wayanad-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Intimate rainforest jungle resort with cliff cottages offering open-air bathtubs in nature.',
    rating: 4.8,
    reviewsCount: 280,
    roomType: 'Valley View Cottage with Bathtub',
    tubType: 'Deep Soaking Tub',
    bookingTip: 'Select "Luxury Pavilion Cottage" for scenic valley-view bathing.'
  },

  // ==========================================
  // INDIA - ALLEPPEY (Kerala)
  // ==========================================
  {
    name: 'Lake Palace Resort Alleppey',
    city: 'Alleppey',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/lake_palace_resort-details-alleppey.html',
    bookingUrl: 'https://www.booking.com/hotel/in/lake-palace-resort.html',
    agodaUrl: 'https://www.agoda.com/lake-palace-resort/hotel/alleppey-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Exclusive island resort on Vembanad Lake offering traditional Kerala architecture villas with luxury private bathtubs.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Lake View Cottage with Bathtub',
    tubType: 'Sunken Marble Bathtub',
    bookingTip: 'Book the "Lake View Cottage" for sunken marble tubs overlooking backwater canals.'
  },
  {
    name: 'Ramada by Wyndham Alleppey',
    city: 'Alleppey',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/ramada_alleppey-details-alleppey.html',
    bookingUrl: 'https://www.booking.com/hotel/in/ramada-alleppey.html',
    agodaUrl: 'https://www.agoda.com/ramada-by-wyndham-alleppey/hotel/alleppey-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Contemporary 5-star waterfront hotel with luxury suites featuring deep soaking bathtubs facing the Punnamada river.',
    rating: 4.6,
    reviewsCount: 350,
    roomType: 'Presidential Suite with Whirlpool',
    tubType: 'Private Whirlpool Bathtub',
    bookingTip: 'Select "Executive Suite" or "Presidential Suite" on check-in for in-room jacuzzi bath.'
  },
  {
    name: 'Vasundhara Sarovar Premiere',
    city: 'Alleppey',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/vasundhara_sarovar_premiere-details-alleppey.html',
    bookingUrl: 'https://www.booking.com/hotel/in/vasundhara-sarovar-premiere.html',
    agodaUrl: 'https://www.agoda.com/vasundhara-sarovar-premiere/hotel/alleppey-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Luxury backwater resort with private floating cottages and deluxe suites with custom glass-wall bathtubs.',
    rating: 4.7,
    reviewsCount: 290,
    roomType: 'Floating Cottage with Soaking Tub',
    tubType: 'Freestanding Soaking Tub',
    bookingTip: 'Opt for the "Heritage Villa" for open-roof bathroom and soaking tub.'
  },
  {
    name: 'Punnamada Resort',
    city: 'Alleppey',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/punnamada_resort-details-alleppey.html',
    bookingUrl: 'https://www.booking.com/hotel/in/punnamada-resort.html',
    agodaUrl: 'https://www.agoda.com/punnamada-resort/hotel/alleppey-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Heritage backwater sanctuary featuring garden villas with open-to-sky bathrooms and heritage stone bathtubs.',
    rating: 4.6,
    reviewsCount: 240,
    roomType: 'Garden Villa with Open-Sky Bath',
    tubType: 'Open-Air Stone Bathtub',
    bookingTip: 'Choose "Lake View Villa" for tranquil Vembanad lake views from your private bathroom.'
  },
  {
    name: 'Uday Backwater Resort',
    city: 'Alleppey',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/uday_backwater_resort-details-alleppey.html',
    bookingUrl: 'https://www.booking.com/hotel/in/uday-backwater-resort.html',
    agodaUrl: 'https://www.agoda.com/uday-backwater-resort/hotel/alleppey-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Serene lakeside luxury resort offering grand suites with oversized ceramic soaking bathtubs.',
    rating: 4.5,
    reviewsCount: 190,
    roomType: 'Grand Suite with Bathtub',
    tubType: 'Oversized Soaking Tub',
    bookingTip: 'Confirm "Premium Lake View Suite" for private balcony and bathtub.'
  },

  // ==========================================
  // INDIA - MUSSOORIE (Uttarakhand)
  // ==========================================
  {
    name: 'JW Marriott Mussoorie Walnut Grove Resort & Spa',
    city: 'Mussoorie',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/jw_marriott_mussoorie_walnut_grove_resort_spa-details-mussoorie.html',
    bookingUrl: 'https://www.booking.com/hotel/in/jw-marriott-mussoorie-walnut-grove-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/jw-marriott-mussoorie-walnut-grove-resort-spa/hotel/mussoorie-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Premier 5-star mountain sanctuary with sweeping Himalayan valley views and oversized marble bathtubs.',
    rating: 4.9,
    reviewsCount: 620,
    roomType: 'Executive Suite with Valley-Facing Bathtub',
    tubType: 'Deep Soaking Marble Bathtub',
    bookingTip: 'Book the "Valley View Suite" for majestic sunset views right from your soaking tub.'
  },
  {
    name: 'Welcomhotel by ITC Hotels, The Savoy, Mussoorie',
    city: 'Mussoorie',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/welcomhotel_the_savoy-details-mussoorie.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-savoy-mussoorie.html',
    agodaUrl: 'https://www.agoda.com/welcomhotel-by-itc-hotels-the-savoy-mussoorie/hotel/mussoorie-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Historic gothic luxury hotel overlooking the Doon Valley with Edwardian clawfoot bathtubs and royal fireplaces.',
    rating: 4.8,
    reviewsCount: 440,
    roomType: 'Savoy Suite with Heritage Clawfoot Tub',
    tubType: 'Antique Clawfoot Bathtub',
    bookingTip: 'Select the "Savoy Grand Suite" for a classic Victorian clawfoot tub and private fireplace.'
  },
  {
    name: 'Jaypee Residency Manor, Mussoorie',
    city: 'Mussoorie',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/jaypee_residency_manor-details-mussoorie.html',
    bookingUrl: 'https://www.booking.com/hotel/in/jaypee-residency-manor.html',
    agodaUrl: 'https://www.agoda.com/jaypee-residency-manor/hotel/mussoorie-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Hilltop manor perched across 9 acres with panoramic snow-capped peaks and suites featuring in-room jacuzzis.',
    rating: 4.7,
    reviewsCount: 390,
    roomType: 'Executive Suite with Jacuzzi',
    tubType: 'In-Room Jacuzzi Bath',
    bookingTip: 'Choose "Manor Suite" for an unobstructed 360-degree Himalayan view while relaxing in your tub.'
  },
  {
    name: 'Rokeby Manor, Landour',
    city: 'Mussoorie',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/rokeby_manor-details-mussoorie.html',
    bookingUrl: 'https://www.booking.com/hotel/in/rokeby-manor.html',
    agodaUrl: 'https://www.agoda.com/rokeby-manor/hotel/mussoorie-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Charming 1840s English country house in Landour featuring stone cottages with outdoor heated jacuzzis in the pine forest.',
    rating: 4.9,
    reviewsCount: 310,
    roomType: 'Country House Suite with Jacuzzi',
    tubType: 'Outdoor Heated Cedar Jacuzzi',
    bookingTip: 'Book the "Bothwell Bank Cottage" for private forest jacuzzi access.'
  },
  {
    name: 'Fortune Resort Grace, Mussoorie',
    city: 'Mussoorie',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/fortune_resort_grace-details-mussoorie.html',
    bookingUrl: 'https://www.booking.com/hotel/in/fortune-resort-grace.html',
    agodaUrl: 'https://www.agoda.com/fortune-resort-grace-mussoorie-member-itc-hotel-group/hotel/mussoorie-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Pine-flanked hill resort offering valley-facing deluxe suites with deep soaking bathtubs.',
    rating: 4.5,
    reviewsCount: 270,
    roomType: 'Valley View Suite with Bathtub',
    tubType: 'Deep Soaking Bathtub',
    bookingTip: 'Select "Grace Suite" for private balcony and bathtub.'
  },

  // ==========================================
  // INDIA - PONDICHERRY
  // ==========================================
  {
    name: 'Palais de Mahe - CGH Earth',
    city: 'Pondicherry',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/palais_de_mahe-details-pondicherry.html',
    bookingUrl: 'https://www.booking.com/hotel/in/palais-de-mahe.html',
    agodaUrl: 'https://www.agoda.com/palais-de-mahe-cgh-earth/hotel/pondicherry-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'French Quarter boutique heritage hotel 50 meters from the Promenade, featuring French colonial suites with deep soaking tubs.',
    rating: 4.8,
    reviewsCount: 380,
    roomType: 'Deluxe French Suite with Bathtub',
    tubType: 'Colonial Soaking Bathtub',
    bookingTip: 'Book the "Superior Room" with French arched courtyard views and private deep tub.'
  },
  {
    name: 'The Promenade Pondicherry',
    city: 'Pondicherry',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_promenade-details-pondicherry.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-promenade.html',
    agodaUrl: 'https://www.agoda.com/the-promenade-hotel/hotel/pondicherry-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Overlooking the Bay of Bengal along Goubert Avenue with sea-facing luxury suites featuring glass bathtubs.',
    rating: 4.6,
    reviewsCount: 420,
    roomType: 'Ocean Front Suite with Bathtub',
    tubType: 'Panoramic Ocean Soaking Tub',
    bookingTip: 'Select the "Presidential Ocean Suite" for ocean wave sounds and a sea-facing tub.'
  },
  {
    name: 'Le Dupleix Pondicherry',
    city: 'Pondicherry',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/le_dupleix-details-pondicherry.html',
    bookingUrl: 'https://www.booking.com/hotel/in/le-dupleix.html',
    agodaUrl: 'https://www.agoda.com/le-dupleix-hotel/hotel/pondicherry-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Former residence of the French Mayor with hand-carved woodwork and vintage clawfoot bathtubs in White Town.',
    rating: 4.7,
    reviewsCount: 290,
    roomType: 'Governor Heritage Suite with Tub',
    tubType: 'Vintage Clawfoot Bathtub',
    bookingTip: 'Choose the "Dupleix Suite" for vintage clawfoot bathtub aesthetics.'
  },
  {
    name: 'Ocean Spray Resort Pondicherry',
    city: 'Pondicherry',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/ocean_spray-details-pondicherry.html',
    bookingUrl: 'https://www.booking.com/hotel/in/ocean-spray.html',
    agodaUrl: 'https://www.agoda.com/ocean-spray-hotel/hotel/pondicherry-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Built around a 5-acre man-made lake with luxury waterfront villas featuring open-air private jacuzzi tubs.',
    rating: 4.6,
    reviewsCount: 360,
    roomType: 'Waterfront Villa with Jacuzzi',
    tubType: 'Private Open-Air Jacuzzi',
    bookingTip: 'Select the "Bermuda Villa" for a private open-air jacuzzi over the lagoon.'
  },
  {
    name: 'Accord Puducherry',
    city: 'Pondicherry',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/accord_puducherry-details-pondicherry.html',
    bookingUrl: 'https://www.booking.com/hotel/in/accord-puducherry.html',
    agodaUrl: 'https://www.agoda.com/accord-puducherry/hotel/pondicherry-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Business-luxury 5-star hotel with spacious premier suites offering private marble bathtubs.',
    rating: 4.5,
    reviewsCount: 310,
    roomType: 'Presidential Suite with Bathtub',
    tubType: 'Deep Marble Bathtub',
    bookingTip: 'Confirm the "Accord Executive Suite" for in-room bathtub.'
  },

  // ==========================================
  // USA - MIAMI (Florida)
  // ==========================================
  {
    name: 'The Setai, Miami Beach',
    city: 'Miami',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-setai.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-setai.html',
    agodaUrl: 'https://www.agoda.com/the-setai-hotel/hotel/miami-beach-fl-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Asian-inspired Art Deco luxury resort in South Beach with ocean suites featuring black granite soaking bathtubs and rainfall showers.',
    rating: 4.9,
    reviewsCount: 580,
    roomType: 'Oceanfront Suite with Black Granite Bathtub',
    tubType: 'Custom Black Granite Soaking Tub',
    bookingTip: 'Book the "One Bedroom Oceanfront Suite" for an ocean-facing black granite tub.'
  },
  {
    name: '1 Hotel South Beach',
    city: 'Miami',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/1-south-beach.html',
    bookingUrl: 'https://www.booking.com/hotel/us/1-south-beach.html',
    agodaUrl: 'https://www.agoda.com/1-hotel-south-beach/hotel/miami-beach-fl-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Eco-conscious oceanfront retreat with natural wood elements, oversized custom soaking tubs, and rooftop ocean views.',
    rating: 4.8,
    reviewsCount: 650,
    roomType: 'Ocean View King Suite with Bathtub',
    tubType: 'Deep Freestanding Tub',
    bookingTip: 'Select the "Ocean View Suite with Balcony" to guarantee a deep soaking bath.'
  },
  {
    name: 'Faena Hotel Miami Beach',
    city: 'Miami',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/faena-miami-beach.html',
    bookingUrl: 'https://www.booking.com/hotel/us/faena-miami-beach.html',
    agodaUrl: 'https://www.agoda.com/faena-hotel-miami-beach/hotel/miami-beach-fl-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Baz Luhrmann-designed theatrical luxury palace with opulent red marble bathrooms and freestanding soaking tubs.',
    rating: 4.8,
    reviewsCount: 410,
    roomType: 'Signature Oceanfront Suite with Tub',
    tubType: 'Designer Marble Bathtub',
    bookingTip: 'Choose "Imperial Suite" or "Oceanfront King" for decadent marble bathtubs.'
  },
  {
    name: 'Four Seasons Hotel at The Surf Club, Surfside',
    city: 'Miami',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/four-seasons-at-the-surf-club.html',
    bookingUrl: 'https://www.booking.com/hotel/us/four-seasons-at-the-surf-club.html',
    agodaUrl: 'https://www.agoda.com/four-seasons-hotel-at-the-surf-club/hotel/miami-beach-fl-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Historic seaside glamor updated by architect Richard Meier with vast travertine bathrooms and oceanfront soaking tubs.',
    rating: 4.9,
    reviewsCount: 320,
    roomType: 'Oceanfront King Room with Travertine Tub',
    tubType: 'Travertine Deep Soaking Tub',
    bookingTip: 'The "Oceanfront Prime Suite" features a tub facing the Atlantic ocean waves.'
  },
  {
    name: 'W South Beach',
    city: 'Miami',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/w-south-beach.html',
    bookingUrl: 'https://www.booking.com/hotel/us/w-south-beach.html',
    agodaUrl: 'https://www.agoda.com/w-south-beach/hotel/miami-beach-fl-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Vibrant luxury hotel where every suite features a private ocean-facing glass balcony and spacious Japanese soaking tubs.',
    rating: 4.7,
    reviewsCount: 490,
    roomType: 'Mega Suite with Japanese Plunge Bathtub',
    tubType: 'Japanese Soaking Tub',
    bookingTip: 'Confirm the "Fabulous Ocean Front Suite" for deep tub and ocean views.'
  },

  // ==========================================
  // USA - LOS ANGELES (California)
  // ==========================================
  {
    name: 'The Beverly Hills Hotel',
    city: 'Los Angeles',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-beverly-hills.html',
    bookingUrl: 'https://www.booking.com/hotel/us/the-beverly-hills.html',
    agodaUrl: 'https://www.agoda.com/the-beverly-hills-hotel/hotel/los-angeles-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'The iconic "Pink Palace" on Sunset Boulevard offering legendary garden bungalows with private fireplaces and jacuzzi bathtubs.',
    rating: 4.9,
    reviewsCount: 520,
    roomType: 'Historic Garden Bungalow with Jacuzzi',
    tubType: 'Deep Jacuzzi Bathtub',
    bookingTip: 'Book "Bungalow with Patio" for private garden jacuzzi suite.'
  },
  {
    name: 'Hotel Bel-Air - Dorchester Collection',
    city: 'Los Angeles',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/hotel-bel-air.html',
    bookingUrl: 'https://www.booking.com/hotel/us/hotel-bel-air.html',
    agodaUrl: 'https://www.agoda.com/hotel-bel-air/hotel/los-angeles-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Secluded 12-acre canyon paradise with swan lake, offering suites with heated limestone floors and spa bathtubs with integrated TV.',
    rating: 4.9,
    reviewsCount: 460,
    roomType: 'Swan Lake Suite with Spa Tub',
    tubType: 'Luxury Spa Bathtub',
    bookingTip: 'Select the "Stone Canyon Suite" for outdoor patio fireplace and indoor spa tub.'
  },
  {
    name: 'Shutters on the Beach, Santa Monica',
    city: 'Los Angeles',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/shutters-on-the-beach.html',
    bookingUrl: 'https://www.booking.com/hotel/us/shutters-on-the-beach.html',
    agodaUrl: 'https://www.agoda.com/shutters-on-the-beach/hotel/los-angeles-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Classic Cape Cod beach house elegance right on the Santa Monica sand, with whirlpool tubs stocked with bath salts and rubber duckies.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Ocean Front King with Whirlpool Tub',
    tubType: 'Hydro-Jet Whirlpool Tub',
    bookingTip: 'Ensure you select "Ocean Front Room" for sunset beach views from the tub.'
  },
  {
    name: 'Waldorf Astoria Beverly Hills',
    city: 'Los Angeles',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/waldorf-astoria-beverly-hills.html',
    bookingUrl: 'https://www.booking.com/hotel/us/waldorf-astoria-beverly-hills.html',
    agodaUrl: 'https://www.agoda.com/waldorf-astoria-beverly-hills/hotel/los-angeles-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Modern art-deco Beverly Hills high-rise with floor-to-ceiling glass, Italian marble bathrooms, and freestanding deep soaking tubs.',
    rating: 4.8,
    reviewsCount: 430,
    roomType: 'Beverly Hills Suite with Balcony & Tub',
    tubType: 'Freestanding Italian Marble Tub',
    bookingTip: 'Book the "Corner Junior Suite" for dual-vanity marble bath and city views.'
  },
  {
    name: 'Chateau Marmont, West Hollywood',
    city: 'Los Angeles',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/chateau-marmont.html',
    bookingUrl: 'https://www.booking.com/hotel/us/chateau-marmont.html',
    agodaUrl: 'https://www.agoda.com/chateau-marmont/hotel/los-angeles-ca-us.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Legendary Loire Valley-style castle on Sunset Strip with historic vintage tiled bathrooms and deep romantic cast-iron bathtubs.',
    rating: 4.7,
    reviewsCount: 350,
    roomType: 'Chateau Penthouse with Deep Cast-Iron Tub',
    tubType: 'Deep Cast-Iron Soaking Tub',
    bookingTip: 'Choose "Garden Cottage" for secluded romantic Hollywood retreat.'
  },

  // ==========================================
  // UK - EDINBURGH (Scotland)
  // ==========================================
  {
    name: 'The Balmoral Hotel, Edinburgh',
    city: 'Edinburgh',
    country: 'UK',
    url: 'https://www.booking.com/hotel/gb/the-balmoral.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/the-balmoral.html',
    agodaUrl: 'https://www.agoda.com/the-balmoral-hotel/hotel/edinburgh-gb.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Iconic Victorian landmark at 1 Princes Street offering majestic Edinburgh Castle views and Italian marble bathrooms with soaking tubs.',
    rating: 4.9,
    reviewsCount: 680,
    roomType: 'Castle View Suite with Italian Marble Tub',
    tubType: 'Deep Soaking Marble Tub',
    bookingTip: 'Book the "Castle View Deluxe Room" to gaze at Edinburgh Castle from your bath.'
  },
  {
    name: 'The Witchery by the Castle',
    city: 'Edinburgh',
    country: 'UK',
    url: 'https://www.booking.com/hotel/gb/the-witchery-by-the-castle.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/the-witchery-by-the-castle.html',
    agodaUrl: 'https://www.agoda.com/the-witchery-by-the-castle/hotel/edinburgh-gb.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Gothic fantasy hotel at the gates of Edinburgh Castle with velvet-draped four-poster beds and silver-gilt rolltop bathtubs for two.',
    rating: 4.9,
    reviewsCount: 420,
    roomType: 'Gothic Tapestry Suite with Rolltop Bath',
    tubType: 'Double Silver-Gilt Rolltop Tub',
    bookingTip: 'The "Inner Sanctum Suite" features a Victorian rolltop bath right in the romantic bedchamber.'
  },
  {
    name: 'Waldorf Astoria Edinburgh - The Caledonian',
    city: 'Edinburgh',
    country: 'UK',
    url: 'https://www.booking.com/hotel/gb/the-caledonian-a-waldorf-astoria-hotel.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/the-caledonian-a-waldorf-astoria-hotel.html',
    agodaUrl: 'https://www.agoda.com/waldorf-astoria-edinburgh-the-caledonian/hotel/edinburgh-gb.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Former Victorian railway hotel "The Caley" with Scottish sandstone elegance, Guerlain spa amenities, and deep clawfoot suites.',
    rating: 4.8,
    reviewsCount: 510,
    roomType: 'Caledonian Suite with Castle View Tub',
    tubType: 'Deep Soaking Clawfoot Bath',
    bookingTip: 'Confirm "Deluxe Room with Castle View" for premium soaking tub amenities.'
  },
  {
    name: 'Prestonfield House',
    city: 'Edinburgh',
    country: 'UK',
    url: 'https://www.booking.com/hotel/gb/prestonfield.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/prestonfield.html',
    agodaUrl: 'https://www.agoda.com/prestonfield-house/hotel/edinburgh-gb.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Opulent 5-star baroque country estate within parkland next to Arthur’s Seat, featuring lavish red velvet suites with freestanding baths.',
    rating: 4.9,
    reviewsCount: 390,
    roomType: 'Baroque Estate Suite with Freestanding Tub',
    tubType: 'Freestanding Luxury Bathtub',
    bookingTip: 'Select the "Churchill Suite" for decadent baroque interiors and deep soaking tub.'
  },
  {
    name: 'Kimpton Charlotte Square Hotel',
    city: 'Edinburgh',
    country: 'UK',
    url: 'https://www.booking.com/hotel/gb/the-roxburghe-hotel.html',
    bookingUrl: 'https://www.booking.com/hotel/gb/the-roxburghe-hotel.html',
    agodaUrl: 'https://www.agoda.com/kimpton-charlotte-square-hotel/hotel/edinburgh-gb.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Georgian New Town boutique hotel with glass-roof courtyard and premium suites featuring monochrome tiled bathrooms and deep tubs.',
    rating: 4.7,
    reviewsCount: 450,
    roomType: 'Georgian Townhouse Suite with Tub',
    tubType: 'Deep Soaking Tub',
    bookingTip: 'Book the "One Bedroom Suite" to guarantee a separate bathtub and rainfall shower.'
  },

  // ==========================================
  // ITALY - ROME
  // ==========================================
  {
    name: 'Hotel de Russie, Rome',
    city: 'Rome',
    country: 'Italy',
    url: 'https://www.booking.com/hotel/it/hotel-de-russie.html',
    bookingUrl: 'https://www.booking.com/hotel/it/hotel-de-russie.html',
    agodaUrl: 'https://www.agoda.com/hotel-de-russie/hotel/rome-it.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Rocco Forte landmark between Piazza del Popolo and Spanish Steps with terraced Secret Gardens and Carrara marble mosaic tubs.',
    rating: 4.9,
    reviewsCount: 530,
    roomType: 'Popolo Suite with Carrara Mosaic Bathtub',
    tubType: 'Carrara Marble Mosaic Tub',
    bookingTip: 'Select the "Junior Suite with Garden View" for peaceful courtyard bathtub relaxation.'
  },
  {
    name: 'Hassler Roma, Rome',
    city: 'Rome',
    country: 'Italy',
    url: 'https://www.booking.com/hotel/it/hassler-roma.html',
    bookingUrl: 'https://www.booking.com/hotel/it/hassler-roma.html',
    agodaUrl: 'https://www.agoda.com/hassler-roma-hotel/hotel/rome-it.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Iconic hotel at the top of the Spanish Steps with sweeping Eternal City skyline views and grand marble whirlpool suites.',
    rating: 4.9,
    reviewsCount: 470,
    roomType: 'Grand Deluxe Suite with Whirlpool Bath',
    tubType: 'Private Whirlpool Marble Bath',
    bookingTip: 'Book the "Trinità dei Monti Suite" for panoramic Rome sunsets from the tub.'
  },
  {
    name: 'Hotel Eden - Dorchester Collection, Rome',
    city: 'Rome',
    country: 'Italy',
    url: 'https://www.booking.com/hotel/it/hotel-eden-rome.html',
    bookingUrl: 'https://www.booking.com/hotel/it/hotel-eden-rome.html',
    agodaUrl: 'https://www.agoda.com/hotel-eden-dorchester-collection/hotel/rome-it.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Elevated luxury sanctuary near Villa Borghese with high ceilings, white and gold marble bathrooms, and circular soaking tubs.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Villa Medici Suite with Circular Marble Tub',
    tubType: 'Circular Soaking Marble Tub',
    bookingTip: 'Choose "Prestige Suite" for Bottega Veneta bath amenities and circular tub.'
  },
  {
    name: 'The St. Regis Rome',
    city: 'Rome',
    country: 'Italy',
    url: 'https://www.booking.com/hotel/it/the-st-regis-grand-rome.html',
    bookingUrl: 'https://www.booking.com/hotel/it/the-st-regis-grand-rome.html',
    agodaUrl: 'https://www.agoda.com/the-st-regis-rome/hotel/rome-it.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Belle Époque palazzo restored with Murano chandeliers, butler service, and deep travertine bathtubs with Acqua di Parma toiletries.',
    rating: 4.8,
    reviewsCount: 460,
    roomType: 'Imperial Palazzo Suite with Travertine Tub',
    tubType: 'Deep Travertine Bathtub',
    bookingTip: 'Select "Imperial Suite" to enjoy St. Regis signature bath butler service.'
  },
  {
    name: 'Portrait Roma - Lungarno Collection',
    city: 'Rome',
    country: 'Italy',
    url: 'https://www.booking.com/hotel/it/portrait-roma.html',
    bookingUrl: 'https://www.booking.com/hotel/it/portrait-roma.html',
    agodaUrl: 'https://www.agoda.com/portrait-roma/hotel/rome-it.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Ferragamo-owned exclusive boutique hotel above Via Condotti with rooftop terrace and black marble jacuzzi baths.',
    rating: 4.9,
    reviewsCount: 310,
    roomType: 'Via Condotti Studio with Jacuzzi',
    tubType: 'Black Marble Hydro Jacuzzi',
    bookingTip: 'Book the "Penthouse Suite" for private rooftop sauna and jacuzzi.'
  },

  // ==========================================
  // GREECE - SANTORINI
  // ==========================================
  {
    name: 'Canaves Oia Suites, Santorini',
    city: 'Santorini',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/canaves-oia-hotel-suites.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/canaves-oia-hotel-suites.html',
    agodaUrl: 'https://www.agoda.com/canaves-oia-suites/hotel/santorini-gr.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Carved into the dramatic volcanic cliffs of Oia with cave suites featuring indoor heated jacuzzi tubs and outdoor infinity plunge pools.',
    rating: 4.9,
    reviewsCount: 560,
    roomType: 'Cave Suite with Heated Jacuzzi & Caldera View',
    tubType: 'Cave Heated Jacuzzi & Caldera Plunge Pool',
    bookingTip: 'Book the "River Pool Suite" or "Executive Jacuzzi Suite" for cliffside caldera immersion.'
  },
  {
    name: 'Grace Hotel, Auberge Resorts Collection, Santorini',
    city: 'Santorini',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/grace-santorini.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/grace-santorini.html',
    agodaUrl: 'https://www.agoda.com/grace-hotel-auberge-resorts-collection/hotel/santorini-gr.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Spectacular clifftop resort in Imerovigli facing Skaros Rock with plunge pool villas and oversized monolith bathtubs.',
    rating: 4.9,
    reviewsCount: 480,
    roomType: 'Deluxe Plunge Pool Suite with Bathtub',
    tubType: 'Monolith Deep Soaking Tub',
    bookingTip: 'Select the "Grace Suite with Plunge Pool" for sunset caldera vistas directly from your private terrace tub.'
  },
  {
    name: 'Mystique, a Luxury Collection Hotel, Santorini',
    city: 'Santorini',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/mystique-oia.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/mystique-oia.html',
    agodaUrl: 'https://www.agoda.com/mystique-a-luxury-collection-hotel-santorini/hotel/santorini-gr.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Chiseled into the steep Oia caldera with organic cave architecture, expansive sun decks, and private outdoor hydromassage hot tubs.',
    rating: 4.8,
    reviewsCount: 410,
    roomType: 'Allure Suite with Outdoor Hot Tub',
    tubType: 'Private Outdoor Hydro Hot Tub',
    bookingTip: 'Confirm "Wet Allure Suite" for private open-air jacuzzi over the Aegean Sea.'
  },
  {
    name: 'Katikies Santorini, Oia',
    city: 'Santorini',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/katikies.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/katikies.html',
    agodaUrl: 'https://www.agoda.com/katikies-hotel/hotel/santorini-gr.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Whitewashed luxury sanctuary 300 feet above the azure caldera with cave bathtubs and private veranda jacuzzis.',
    rating: 4.9,
    reviewsCount: 520,
    roomType: 'Senior Suite with Open-Air Jacuzzi',
    tubType: 'Veranda Cave Jacuzzi',
    bookingTip: 'Choose "Katikies Suite" for private terrace jacuzzi and panoramic sunset views.'
  },
  {
    name: 'Andronis Luxury Suites, Santorini',
    city: 'Santorini',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/andronis-luxury-suites.html',
    bookingUrl: 'https://www.booking.com/hotel/gr/andronis-luxury-suites.html',
    agodaUrl: 'https://www.agoda.com/andronis-luxury-suites/hotel/santorini-gr.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Traditional Aegean architecture overlooking volcano islands with private infinity-edge jacuzzis on private balconies.',
    rating: 4.8,
    reviewsCount: 390,
    roomType: 'Premier Suite with Balcony Heated Jacuzzi',
    tubType: 'Balcony Heated Hydro Jacuzzi',
    bookingTip: 'Select the "Pythia Suite" for indoor cave pool and outdoor heated jacuzzi.'
  },

  // ==========================================
  // THAILAND - PHUKET
  // ==========================================
  {
    name: 'Keemala, Phuket',
    city: 'Phuket',
    country: 'Thailand',
    url: 'https://www.agoda.com/keemala-resort/hotel/phuket-th.html',
    bookingUrl: 'https://www.booking.com/hotel/th/keemala.html',
    agodaUrl: 'https://www.agoda.com/keemala-resort/hotel/phuket-th.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Magical rainforest wonderland featuring Birds Nest Pool Villas with outdoor monsoon showers and stone bathtubs overlooking Kamala bay.',
    rating: 4.9,
    reviewsCount: 590,
    roomType: 'Birds Nest Pool Villa with Stone Soaking Tub',
    tubType: 'Monolithic Stone Soaking Bathtub',
    bookingTip: 'Book the "Bird’s Nest Pool Villa" for an incredible stand-alone stone tub perched in the forest canopy.'
  },
  {
    name: 'Trisara, Phuket',
    city: 'Phuket',
    country: 'Thailand',
    url: 'https://www.agoda.com/trisara-hotel/hotel/phuket-th.html',
    bookingUrl: 'https://www.booking.com/hotel/th/trisara.html',
    agodaUrl: 'https://www.agoda.com/trisara-hotel/hotel/phuket-th.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Secluded private bay sanctuary nestled in centuries-old teak trees, with oceanfront pool villas and marble soaking baths facing the Andaman Sea.',
    rating: 4.9,
    reviewsCount: 460,
    roomType: 'Ocean View Pool Junior Suite with Deep Tub',
    tubType: 'Marble Ocean-Facing Soaking Tub',
    bookingTip: 'Select "Ocean Front Pool Villa" for uninterrupted sunset horizon views from your bath.'
  },
  {
    name: 'Banyan Tree Phuket',
    city: 'Phuket',
    country: 'Thailand',
    url: 'https://www.agoda.com/banyan-tree-phuket/hotel/phuket-th.html',
    bookingUrl: 'https://www.booking.com/hotel/th/banyan-tree-phuket.html',
    agodaUrl: 'https://www.agoda.com/banyan-tree-phuket/hotel/phuket-th.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Laguna Phuket haven of tranquility with traditional Thai villas, outdoor sunken bath pavilions, and private swimming pools.',
    rating: 4.8,
    reviewsCount: 530,
    roomType: 'Banyan Pool Villa with Sunken Bath Pavilion',
    tubType: 'Outdoor Sunken Bath Pavilion',
    bookingTip: 'The "Signature Pool Villa" includes an open-air sunken tub nestled beside the private pool.'
  },
  {
    name: 'Sri Panwa Phuket',
    city: 'Phuket',
    country: 'Thailand',
    url: 'https://www.agoda.com/sri-panwa-phuket-luxury-pool-villa-hotel/hotel/phuket-th.html',
    bookingUrl: 'https://www.booking.com/hotel/th/sri-panwa-phuket.html',
    agodaUrl: 'https://www.agoda.com/sri-panwa-phuket-luxury-pool-villa-hotel/hotel/phuket-th.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Perched 60 meters above Cape Panwa with 300-degree ocean views, glass-wrapped jacuzzi suites, and Baba Nest rooftop.',
    rating: 4.8,
    reviewsCount: 610,
    roomType: 'Ocean View Luxury Pool Villa with Jacuzzi',
    tubType: 'Glass-Wrapped Hydro Jacuzzi',
    bookingTip: 'Choose "Ocean Villa with Sunset View" for private jacuzzi overlooking the Andaman archipelago.'
  },
  {
    name: 'The Shore at Katathani, Phuket',
    city: 'Phuket',
    country: 'Thailand',
    url: 'https://www.agoda.com/the-shore-at-katathani-resort/hotel/phuket-th.html',
    bookingUrl: 'https://www.booking.com/hotel/th/the-shore-at-katathani.html',
    agodaUrl: 'https://www.agoda.com/the-shore-at-katathani-resort/hotel/phuket-th.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    description: 'Adults-only cliffside resort on Kata Noi Beach offering private infinity pool villas with sunken bathtubs overlooking turquoise waters.',
    rating: 4.9,
    reviewsCount: 540,
    roomType: 'Seaview Pool Villa with Sunken Bathtub',
    tubType: 'Sunken Seaview Soaking Tub',
    bookingTip: 'Book the "Seaview Pool Villa In Love" for honeymoon sunset perfection.'
  }
];

async function seedExpansion() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Seeding expansion hotels...');

  let inserted = 0;
  let updated = 0;

  for (const h of newExpansionHotels) {
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

  console.log(`\n🎉 Seeded Expansion Data: ${inserted} inserted, ${updated} updated.`);

  const totalHotels = await Hotel.countDocuments({ flagged: { $ne: true } });
  const countries = await Hotel.distinct('country', { flagged: { $ne: true } });
  const cities = await Hotel.distinct('city', { flagged: { $ne: true } });

  console.log(`Total Active Hotels: ${totalHotels}`);
  console.log(`Total Countries: ${countries.length} (${countries.join(', ')})`);
  console.log(`Total Active Cities: ${cities.length}`);

  await mongoose.disconnect();
}

seedExpansion().catch(console.error);
