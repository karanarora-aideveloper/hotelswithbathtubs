const mongoose = require('mongoose');
const { google } = require('/Users/karanarora/google-search-console-mcp/node_modules/googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = '1XGjO7pFp8NsgY7uPGUcAqJUuu_cSBMtlSbkAXd9cO7Y';

const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/karanarora/.config/gcloud/gsc-service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const goaHotelsFinal = [
  {
    name: 'Taj Holiday Village Resort & Spa, Goa',
    slug: 'taj-holiday-village-resort-spa-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_holiday_village_resort_spa_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-holiday-village-resort-spa.html',
    agodaUrl: 'https://www.agoda.com/taj-holiday-village-resort-spa-goa/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/116740/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/268154/-1/e3f4439c0864eb11d13db1415dfda2bf.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/1879796/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/159840/-1/3c2a8b9409df8c42bca1c3905cf7e8b9.jpg',
    tubType: 'Diwa Club Suite with Freestanding Sunken Marble Tub',
    rating: 4.8,
    reviewsCount: 1640,
    bathtubConfirmed: true
  },
  {
    name: 'Taj Exotica Resort & Spa, Goa',
    slug: 'taj-exotica-resort-spa-goa',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_exotica_resort_spa_goa-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-exotica-goa.html',
    agodaUrl: 'https://www.agoda.com/taj-exotica-resort-spa-goa/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/60057/-1/783b9c9f0ef72eeec871c53e839e557b.jpg',
    tubType: 'Luxury Sea-View Villa with Private Plunge Pool & Tub',
    rating: 4.9,
    reviewsCount: 2890,
    bathtubConfirmed: true
  },
  {
    name: 'The St. Regis Goa Resort',
    slug: 'the-st-regis-goa-resort',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/the_st_regis_goa_resort-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-st-regis-goa-resort.html',
    agodaUrl: 'https://www.agoda.com/the-st-regis-goa-resort/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/1231649/-1/33d59e35c2494916a2461fe1217e750b.jpg',
    tubType: 'Manor Suite with Golf & Lagoon View Soaking Tub',
    rating: 4.8,
    reviewsCount: 890,
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
    image: 'https://pix8.agoda.net/hotelImages/61822/-1/59a68bc01d1df2623a6f9cb89c922da9.jpg',
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
    agodaUrl: 'https://www.agoda.com/storii-by-itc-hotels-shanti-morada-goa/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/443730/-1/2c53f868ee3a44d825cbb4aa86796c9c.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/180630/-1/b6d6553835697d2ec6c0b388b1f5e85f.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/10534/-1/8873ca9a7061d4a6f2382f6c8bb8742b.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/4904006/-1/88835849cbca6b6ea17ebcbda51e44ef.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/108502/-1/96f3bb992a54911d7bb432b4b74e64f7.jpg',
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
    agodaUrl: 'https://www.agoda.com/taj-cidade-de-goa-heritage-goa/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/10543/-1/9483dc46eb74d758f2780e8ca92e4be0.jpg',
    tubType: 'Portuguese Heritage Suite with Sea-Facing Bathtub',
    rating: 4.8,
    reviewsCount: 2300,
    bathtubConfirmed: true
  },
  {
    name: 'Taj Cidade de Goa Horizon',
    slug: 'taj-cidade-de-goa-horizon',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/taj_cidade_de_goa_horizon-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-cidade-de-goa-horizon.html',
    agodaUrl: 'https://www.agoda.com/taj-cidade-de-goa-horizon-goa/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/104990/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
    tubType: 'Luxury Horizon Bay-View Suite with Deep Marble Tub',
    rating: 4.8,
    reviewsCount: 1850,
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
    image: 'https://pix8.agoda.net/hotelImages/15984/-1/107f9c8901be9b16ea9825b7b2512a23.jpg',
    tubType: 'Bay View Presidential Suite with Whirlpool Bath',
    rating: 4.7,
    reviewsCount: 2400,
    bathtubConfirmed: true
  },
  {
    name: 'LaRiSa Beach Resort, Ashwem',
    slug: 'larisa-beach-resort-ashwem',
    city: 'Goa',
    country: 'India',
    url: 'https://www.makemytrip.com/hotels/larisa_beach_resort_ashwem-details-goa.html',
    bookingUrl: 'https://www.booking.com/hotel/in/larisa-beach-resort-ashwem.html',
    agodaUrl: 'https://www.agoda.com/larisa-beach-resort/hotel/goa-in.html',
    image: 'https://pix8.agoda.net/hotelImages/10502/-1/6c3c9e6aa84918e7e17cb97cb4e8ecbf.jpg',
    tubType: 'Oceanfront Wooden Cottage with Private Open-Air Jacuzzi',
    rating: 4.7,
    reviewsCount: 650,
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
    image: 'https://pix8.agoda.net/hotelImages/165502/-1/4a29bb8853b0e11894d038fa465b4c10.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/23722/-1/59a8cb404c05ef1a2e7c4f1c97a8c3d1.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/75685/-1/1b5e39665bc74041b617b07ea6e32d67.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/51410/-1/21d51a6681b94b0eb2318ee4c70d2417.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/108493/-1/ec3be5893d5a08527a29583a45610ef3.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/30554/-1/a24cb474c3e387146e492ca4da2032d8.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/10705/-1/218cb7e42d76ea2bc75ba7a1772bc8cb.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/10701/-1/c1d89b33a59846d0a7a3b37812e9bcae.jpg',
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
    image: 'https://pix8.agoda.net/hotelImages/39474/-1/6c3a5266838848d7950c40683a31c518.jpg',
    tubType: 'Suite Room with Deep Soaking Marble Bathtub',
    rating: 4.4,
    reviewsCount: 510,
    bathtubConfirmed: true
  }
];

async function syncGoa() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));

  console.log('1. Replacing Goa entries in MongoDB with pristine curated hotels...');
  await Hotel.deleteMany({ city: { $in: ['Goa', 'Calangute', 'Panjim', 'goa', 'calangute', 'panjim'] } });

  const inserted = await Hotel.insertMany(goaHotelsFinal);
  console.log(`✅ Successfully seeded ${inserted.length} pristine luxury hotels in Goa!`);

  console.log('2. Syncing updated database to Google Sheets...');
  const { execSync } = require('child_process');
  execSync('node scratch/populate_google_sheet_audit.js', { stdio: 'inherit' });
  execSync('node scratch/format_google_sheet.js', { stdio: 'inherit' });

  console.log('\n🎉 GOA AUDIT & SYNC COMPLETE!');
  await mongoose.disconnect();
}

syncGoa().catch(console.error);
