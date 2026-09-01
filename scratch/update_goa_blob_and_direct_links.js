const mongoose = require('mongoose');
const { google } = require('/Users/karanarora/google-search-console-mcp/node_modules/googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = '1XGjO7pFp8NsgY7uPGUcAqJUuu_cSBMtlSbkAXd9cO7Y';

const goaVerifiedHotels = [
  {
    name: 'Taj Holiday Village Resort & Spa, Goa',
    slug: 'taj-holiday-village-resort-spa-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_holiday_village_resort_spa_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-holiday-village-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/taj-holiday-village-resort-spa-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-taj-holiday-village-resort-spa-goa.webp',
    tubType: 'Luxury Garden Villa with Deep Soaking Bathtub',
    rating: 4.8,
    reviewsCount: 1420,
    bathtubConfirmed: true
  },
  {
    name: 'Grand Hyatt Goa',
    slug: 'grand-hyatt-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/grand_hyatt_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/grand-hyatt-goa.html',
    agodaUrl: 'https://www.agoda.com/grand-hyatt-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/grand-hyatt-goa-with-private-jacuzzi-in-room.webp',
    tubType: 'Grand Suite Oceanview Whirlpool Jacuzzi',
    rating: 4.8,
    reviewsCount: 2150,
    bathtubConfirmed: true
  },
  {
    name: 'W Goa, Vagator',
    slug: 'w-goa-vagator',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/w_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/w-goa.html',
    agodaUrl: 'https://www.agoda.com/w-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hottub-resort-w-goa.webp',
    tubType: 'Marvelous Suite with Plunge Pool & Freestanding Tub',
    rating: 4.7,
    reviewsCount: 980,
    bathtubConfirmed: true
  },
  {
    name: 'Alila Diwa Goa - A Hyatt Brand',
    slug: 'alila-diwa-goa-a-hyatt-brand',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/alila_diwa_goa_a_hyatt_brand-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/alila-diwa-goa.html',
    agodaUrl: 'https://www.agoda.com/alila-diwa-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hottub-alila-diwa-goa-a-hyatt-brand.webp',
    tubType: 'Diwa Club Suite with Freestanding Sunken Marble Tub',
    rating: 4.8,
    reviewsCount: 1640,
    bathtubConfirmed: true
  },
  {
    name: 'The Postcard Saligao, Goa',
    slug: 'the-postcard-saligao-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_postcard_saligao_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-postcard-saligao.html',
    agodaUrl: 'https://www.agoda.com/the-postcard-saligao/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hottub-the-postcard-saligao-calangute.webp',
    tubType: 'Boutique Heritage Suite with Handcrafted Clawfoot Tub',
    rating: 4.9,
    reviewsCount: 340,
    bathtubConfirmed: true
  },
  {
    name: 'Storii by ITC Hotels Shanti Morada, Goa',
    slug: 'storii-by-itc-hotels-shanti-morada-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/storii_by_itc_hotels_shanti_morada_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/storii-by-itc-hotels-shanti-morada-goa.html',
    agodaUrl: 'https://www.agoda.com/shanti-morada/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-room-calangute-storii-by-itc-hotels-shanti-morada-goa.webp',
    tubType: 'Luxury Suite with Victorian Freestanding Copper Tub',
    rating: 4.8,
    reviewsCount: 520,
    bathtubConfirmed: true
  },
  {
    name: 'The Park Calangute Goa',
    slug: 'the-park-calangute-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_park_calangute_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-park-calangute.html',
    agodaUrl: 'https://www.agoda.com/the-park-calangute-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-room-the-park-calangute-goa.webp',
    tubType: 'Studio Suite with Balcony Plunge Bath & Jacuzzi',
    rating: 4.5,
    reviewsCount: 1100,
    bathtubConfirmed: true
  },
  {
    name: 'The Baga Beach Resort',
    slug: 'the-baga-beach-resort',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_baga_beach_resort-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-baga-beach-resort.html',
    agodaUrl: 'https://www.agoda.com/the-baga-beach-resort/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/the-baga-beach-resort-north-goa-jacuzzi-in-room.webp',
    tubType: 'Beachfront Wooden Cottage with Private In-Room Jacuzzi',
    rating: 4.6,
    reviewsCount: 1250,
    bathtubConfirmed: true
  },
  {
    name: 'Hard Rock Hotel Goa',
    slug: 'hard-rock-hotel-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/hard_rock_hotel_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/hard-rock-goa.html',
    agodaUrl: 'https://www.agoda.com/hard-rock-hotel-goa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hard-rock-hotel-goa-calangute-with-bathtub.webp',
    tubType: 'Rock Suite Platinum with Deep Soaking Tub',
    rating: 4.6,
    reviewsCount: 1450,
    bathtubConfirmed: true
  },
  {
    name: 'Adamo The Bellus, Calangute',
    slug: 'adamo-the-bellus-calangute',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/adamo_the_bellus_calangute-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/adamo-the-bellus.html',
    agodaUrl: 'https://www.agoda.com/adamo-the-bellus/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hotel-adamo-the-bellus-calangute-with-jacuzzi-in-room.webp',
    tubType: 'Bellus Jacuzzi Suite with Private Whirlpool',
    rating: 4.4,
    reviewsCount: 980,
    bathtubConfirmed: true
  },
  {
    name: 'Taj Cidade de Goa Heritage',
    slug: 'taj-cidade-de-goa-heritage',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_cidade_de_goa_heritage-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/cidade-de-goa-ihcl-seleqtions.html',
    agodaUrl: 'https://www.agoda.com/cidade-de-goa-ihcl-seleqtions/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hotel-taj-cidade-de-goa-heritage-panjim-goa-with-bathtub-in-room.webp',
    tubType: 'Portuguese Heritage Suite with Sea-Facing Bathtub',
    rating: 4.8,
    reviewsCount: 2300,
    bathtubConfirmed: true
  },
  {
    name: 'Goa Marriott Resort & Spa',
    slug: 'goa-marriott-resort-spa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/goa_marriott_resort_spa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/goa-marriott-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/goa-marriott-resort-spa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/goa-marriott-resort-spa-panjim-with-bathtub.webp',
    tubType: 'Bay View Presidential Suite with Whirlpool Bath',
    rating: 4.7,
    reviewsCount: 2400,
    bathtubConfirmed: true
  },
  {
    name: 'Cola Beach Sunset Bay Resort',
    slug: 'cola-beach-sunset-bay-resort',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/cola_beach_sunset_bay_resort-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/cola-beach-sunset-bay.html',
    agodaUrl: 'https://www.agoda.com/cola-beach-sunset-bay/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/cola-goa-beach-resort-room-in-south-goa-with-jacuzzi-and-sea-view.webp',
    tubType: 'Cliffside Lagoon Villa with Outdoor Jacuzzi Tub',
    rating: 4.6,
    reviewsCount: 420,
    bathtubConfirmed: true
  },
  {
    name: 'WelcomHeritage Panjim Inn',
    slug: 'welcomheritage-panjim-inn',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/welcomheritage_panjim_inn-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/panjim-inn.html',
    agodaUrl: 'https://www.agoda.com/welcomheritage-panjim-inn/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/welcomheritage-panjim-inn-with-bathtub-in-room.webp',
    tubType: 'Heritage Scindia Scored Room with Antique Clawfoot Tub',
    rating: 4.5,
    reviewsCount: 780,
    bathtubConfirmed: true
  },
  {
    name: 'Chances Resort and Casino',
    slug: 'chances-resort-and-casino',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/chances_resort_and_casino-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/chances-resort-and-casino-an-indy-resort.html',
    agodaUrl: 'https://www.agoda.com/chances-resort-and-casino/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/chances-resort-and-casino-an-indy-resort-panjim-with-jacuzzi.webp',
    tubType: 'Presidential Casino Suite with Jacuzzi Tub',
    rating: 4.4,
    reviewsCount: 910,
    bathtubConfirmed: true
  },
  {
    name: 'Grandeur De Sanchi Resort & Spa',
    slug: 'grandeur-de-sanchi-resort-spa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/grandeur_de_sanchi_resort_spa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/grandeur-de-sanchi.html',
    agodaUrl: 'https://www.agoda.com/grandeur-de-sanchi-luxury-beach-resort-spa/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/grandeur-de-sanchi-luxury-beach-resort-spa-north-goa-with-jacuzzi.webp',
    tubType: 'Deluxe Room with In-Room Couple Jacuzzi',
    rating: 4.3,
    reviewsCount: 840,
    bathtubConfirmed: true
  },
  {
    name: 'Wild Berry Resort Agonda',
    slug: 'wild-berry-resort-agonda',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/wild_berry_resort_agonda-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/wild-berry-resort-agonda.html',
    agodaUrl: 'https://www.agoda.com/wild-berry-resort-agonda/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-room-wild-berry-resort-agonda-south-goa.webp',
    tubType: 'Forest Cottage with Open-Air Stone Bathtub',
    rating: 4.6,
    reviewsCount: 460,
    bathtubConfirmed: true
  },
  {
    name: 'Longuinhos Beach Resort',
    slug: 'longuinhos-beach-resort',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/longuinhos_beach_resort-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/longuinhos-beach-resort.html',
    agodaUrl: 'https://www.agoda.com/longuinhos-beach-resort/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/longuinhos-beach-resort-south-goa-with-private-jacuzzi.webp',
    tubType: 'Sea-Facing Luxury Suite with Whirlpool Jacuzzi',
    rating: 4.4,
    reviewsCount: 1120,
    bathtubConfirmed: true
  },
  {
    name: 'BloomSuites Calangute',
    slug: 'bloomsuites-calangute',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/bloomsuites_calangute-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/bloomsuites-calangute.html',
    agodaUrl: 'https://www.agoda.com/bloomsuites-calangute/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-bloomsuites-l-calangute.webp',
    tubType: 'Suite with Deep Soaking Tub',
    rating: 4.5,
    reviewsCount: 670,
    bathtubConfirmed: true
  },
  {
    name: 'Estrela Do Mar Beach Resort',
    slug: 'estrela-do-mar-beach-resort',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/estrela_do_mar_beach_resort-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/estrela-do-mar-beach-resort.html',
    agodaUrl: 'https://www.agoda.com/estrela-do-mar-beach-resort/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-calangute-estrela-do-mar-beach-resort-a-beach-property.webp',
    tubType: 'Beach Cottage with Private In-Room Jacuzzi',
    rating: 4.5,
    reviewsCount: 1350,
    bathtubConfirmed: true
  },
  {
    name: 'The Crescent, Miramar',
    slug: 'the-crescent-miramar',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_crescent_miramar-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-crescent.html',
    agodaUrl: 'https://www.agoda.com/the-crescent/hotel/goa-in.html',
    image: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/hotel-the-crescent-panjim-with-bathtub-in-room.webp',
    tubType: 'Suite Room with Deep Soaking Marble Bathtub',
    rating: 4.4,
    reviewsCount: 510,
    bathtubConfirmed: true
  }
];

async function updateGoaHotels() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  console.log('1. Replacing Goa entries in MongoDB with verified Blob images & direct links...');
  await Hotel.deleteMany({ city: { $in: ['Goa', 'Calangute', 'Panjim', 'goa', 'calangute', 'panjim'] } });

  const inserted = await Hotel.insertMany(goaVerifiedHotels);
  console.log(`✅ Successfully seeded ${inserted.length} verified luxury hotels in Goa!`);

  console.log('2. Syncing updated database to Google Sheets...');
  const { execSync } = require('child_process');
  execSync('node scratch/populate_google_sheet_audit.js', { stdio: 'inherit' });
  execSync('node scratch/format_google_sheet.js', { stdio: 'inherit' });

  await mongoose.disconnect();
}

updateGoaHotels().catch(console.error);
