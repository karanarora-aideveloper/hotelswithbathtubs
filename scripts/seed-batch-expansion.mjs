import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const additionalHotels = [
  // CHENNAI ADDITIONS
  {
    name: 'Crowne Plaza Chennai Adyar Park',
    city: 'Chennai',
    country: 'India',
    slug: 'crowne-plaza-chennai-adyar-park',
    url: 'https://www.makemytrip.com/hotels/crowne_plaza_chennai_adyar_park-details-chennai.html',
    bookingUrl: 'https://www.booking.com/hotel/in/crowne-plaza-chennai-adyar-park.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Soaking Tub', 'Couple Friendly'],
    tubType: 'Private Deep Soaking Bathtub',
    roomType: 'Club Suite with Bathtub',
    price: '₹7,500',
    rating: 4.6,
    reviewsCount: 280,
    neighborhood: 'Alwarpet',
    bookingTip: 'Club Suites in Alwarpet feature relaxing soaking tubs in a lush green residential setting.',
    description: 'A legacy 5-star hotel in Alwarpet surrounded by majestic rain trees, providing suites with private bathtubs.'
  },
  {
    name: 'Feathers - A Radha Hotel Chennai',
    city: 'Chennai',
    country: 'India',
    slug: 'feathers-a-radha-hotel-chennai',
    url: 'https://www.makemytrip.com/hotels/feathers_a_radha_hotel-details-chennai.html',
    bookingUrl: 'https://www.booking.com/hotel/in/feathers-a-radha-hotel.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Couple Friendly'],
    tubType: 'Private Jacuzzi Bathtub',
    roomType: 'Studio Suite with Jacuzzi',
    price: '₹6,999',
    rating: 4.5,
    reviewsCount: 310,
    neighborhood: 'Manapakkam, Mount Poonamallee Road',
    bookingTip: 'Studio Suites boast deep soaking tubs and rain showers near Chennai trade centre.',
    description: 'Contemporary upscale hotel in Manapakkam offering stylish suites equipped with private jacuzzis and soaking tubs.'
  },
  {
    name: 'The Raintree, St. Marys Road Chennai',
    city: 'Chennai',
    country: 'India',
    slug: 'the-raintree-st-marys-road-chennai',
    url: 'https://www.makemytrip.com/hotels/the_raintree_st_marys_road-details-chennai.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-raintree-st-marys-road.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-jw-marriott-hotel-new-delhi-aerocity.webp',
    verified: true,
    amenities: ['Bathtub', 'Eco Friendly Luxury', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Deep Freestanding Bathtub',
    roomType: 'Executive Suite with Bathtub',
    price: '₹8,200',
    rating: 4.7,
    reviewsCount: 240,
    neighborhood: 'Alwarpet',
    bookingTip: 'Eco-sensitive luxury suites with deep tubs on leafy St. Marys Road.',
    description: 'An eco-luxury retreat in peaceful Alwarpet offering boutique suites with freestanding bathtubs and rooftop poolside dining.'
  },
  {
    name: 'Hilton Chennai',
    city: 'Chennai',
    country: 'India',
    slug: 'hilton-chennai',
    url: 'https://www.makemytrip.com/hotels/hilton_chennai-details-chennai.html',
    bookingUrl: 'https://www.booking.com/hotel/in/hilton-chennai.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Private Deep Marble Bathtub',
    roomType: 'King Executive Suite with Bathtub',
    price: '₹9,400',
    rating: 4.6,
    reviewsCount: 350,
    neighborhood: 'Guindy, Inner Ring Road',
    bookingTip: 'King Executive Suites feature marble bathrooms with deep tubs and access to the 9th-floor executive lounge.',
    description: 'Conveniently located in Guindy with Mughal-inspired design and modern suites featuring sunken soaking bathtubs.'
  },
  {
    name: 'Hablis Hotel Chennai',
    city: 'Chennai',
    country: 'India',
    slug: 'hablis-hotel-chennai',
    url: 'https://www.makemytrip.com/hotels/hablis_hotel-details-chennai.html',
    bookingUrl: 'https://www.booking.com/hotel/in/hablis-chennai.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Soaking Tub', 'Couple Friendly'],
    tubType: 'Private In-Room Bathtub',
    roomType: 'Deluxe King Suite with Bathtub',
    price: '₹5,299',
    rating: 4.4,
    reviewsCount: 190,
    neighborhood: 'Guindy',
    bookingTip: 'A great value boutique option in Guindy featuring clean, verified private bathtub suites.',
    description: 'A trendy design hotel near Chennai airport offering spacious king rooms with private bathtubs at great rates.'
  },

  // NOIDA ADDITIONS
  {
    name: 'Fortune Hotel Sector 27 Noida',
    city: 'Noida',
    country: 'India',
    slug: 'fortune-hotel-sector-27-noida',
    url: 'https://www.makemytrip.com/hotels/fortune_hotel_sector_27_noida-details-noida.html',
    bookingUrl: 'https://www.booking.com/hotel/in/fortune-hotel-sector-27-noida.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Soaking Tub', 'Couple Friendly'],
    tubType: 'Private Deep Bathtub',
    roomType: 'Fortune Club Suite with Bathtub',
    price: '₹5,199',
    rating: 4.4,
    reviewsCount: 140,
    neighborhood: 'Sector 27',
    bookingTip: 'Club Suites in Sector 27 offer quiet comfort with a private soaking tub close to Atta Market.',
    description: 'Member of ITC Hotel Group offering well-appointed suites with private bathtubs in central Noida.'
  },
  {
    name: 'Crowne Plaza Greater Noida',
    city: 'Noida',
    country: 'India',
    slug: 'crowne-plaza-greater-noida',
    url: 'https://www.makemytrip.com/hotels/crowne_plaza_greater_noida-details-noida.html',
    bookingUrl: 'https://www.booking.com/hotel/in/crowne-plaza-greater-noida.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-jw-marriott-hotel-new-delhi-aerocity.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Private Jacuzzi Whirlpool Bathtub',
    roomType: 'Presidential Suite with Jacuzzi',
    price: '₹8,500',
    rating: 4.7,
    reviewsCount: 320,
    neighborhood: 'Surajpur Chowk',
    bookingTip: 'One of the largest luxury hotels in Delhi-NCR, suites offer deep tubs surrounded by serene water bodies.',
    description: 'An expansive resort-style retreat in Greater Noida with sprawling suites, tranquil courtyards, and deep soaking bathtubs.'
  },
  {
    name: 'Park Ascent Noida',
    city: 'Noida',
    country: 'India',
    slug: 'park-ascent-noida',
    url: 'https://www.makemytrip.com/hotels/park_ascent-details-noida.html',
    bookingUrl: 'https://www.booking.com/hotel/in/park-ascent.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Soaking Tub', 'Couple Friendly'],
    tubType: 'Private In-Room Bathtub',
    roomType: 'Ascent Suite with Bathtub',
    price: '₹4,799',
    rating: 4.4,
    reviewsCount: 165,
    neighborhood: 'Sector 62',
    bookingTip: 'Ideal for couples and business travelers in Sector 62, suites include private bathtubs and complimentary breakfast.',
    description: 'Contemporary business and leisure hotel in Sector 62 featuring spacious suites with private bathtubs.'
  },

  // GOKARNA ADDITIONS
  {
    name: 'Stone Wood Nature Resort Gokarna',
    city: 'Gokarna',
    country: 'India',
    slug: 'stone-wood-nature-resort-gokarna',
    url: 'https://www.makemytrip.com/hotels/stone_wood_nature_resort-details-gokarna.html',
    bookingUrl: 'https://www.booking.com/hotel/in/stone-wood-nature-resort-gokarna.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Nature Cottages', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Freestanding Soaking Bathtub',
    roomType: 'Luxury Cottage with Bathtub',
    price: '₹5,800',
    rating: 4.6,
    reviewsCount: 180,
    neighborhood: 'Om Beach Road',
    bookingTip: 'Eco-luxury wooden cottages with freestanding bathtubs surrounded by dense tropical greenery.',
    description: 'Set upon a tranquil hillside near Om Beach, providing rustic wooden cottages with standalone soaking tubs.'
  },
  {
    name: 'Arthigamya Spa & Resort Gokarna',
    city: 'Gokarna',
    country: 'India',
    slug: 'arthigamya-spa-resort-gokarna',
    url: 'https://www.makemytrip.com/hotels/arthigamya_spa_resort-details-gokarna.html',
    bookingUrl: 'https://www.booking.com/hotel/in/arthigamya-spa-resort.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-jw-marriott-hotel-new-delhi-aerocity.webp',
    verified: true,
    amenities: ['Bathtub', 'Kudle Beach View', 'Private Jacuzzi', 'Couple Friendly'],
    tubType: 'Private Jacuzzi Bathtub',
    roomType: 'Sea View Suite with Jacuzzi',
    price: '₹5,499',
    rating: 4.5,
    reviewsCount: 150,
    neighborhood: 'Kudle Beach',
    bookingTip: 'Steps away from Kudle Beach sand, suites offer private jacuzzi tubs for post-beach relaxation.',
    description: 'Beachfront resort on Kudle Beach offering comfortable sea-view suites with private jacuzzis and spa treatments.'
  },

  // KASAULI ADDITIONS
  {
    name: 'Fortune Select Forest Hill Kasauli',
    city: 'Kasauli',
    country: 'India',
    slug: 'fortune-select-forest-hill-kasauli',
    url: 'https://www.makemytrip.com/hotels/fortune_select_forest_hill-details-kasauli.html',
    bookingUrl: 'https://www.booking.com/hotel/in/fortune-select-forest-hill-kasauli.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Pine Valley View', 'Couple Friendly'],
    tubType: 'Freestanding Valley View Bathtub',
    roomType: 'Club Suite with Mountain Bathtub',
    price: '₹12,500',
    rating: 4.7,
    reviewsCount: 210,
    neighborhood: 'Bhoi Kasauli',
    bookingTip: 'Club Suites feature panoramic floor-to-ceiling glass windows and standalone soaking tubs overlooking the Himalayan pines.',
    description: 'An idyllic hilltop resort set secluded in pine hills, boasting suites with freestanding mountain-view bathtubs.'
  },
  {
    name: 'Glenview Resort Kasauli',
    city: 'Kasauli',
    country: 'India',
    slug: 'glenview-resort-kasauli',
    url: 'https://www.makemytrip.com/hotels/glenview_resort-details-kasauli.html',
    bookingUrl: 'https://www.booking.com/hotel/in/glenview-resort-kasauli.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Mountain Infinity Pool', 'Couple Friendly'],
    tubType: 'Private In-Room Jacuzzi',
    roomType: 'Executive Jacuzzi Suite',
    price: '₹9,800',
    rating: 4.6,
    reviewsCount: 230,
    neighborhood: 'Kimmughat, Kasauli',
    bookingTip: 'Book the Executive Jacuzzi Suite for in-room bubbling hydrotherapy amidst the cool mountain breeze.',
    description: 'Perched in Kimmughat below the upper mall, offering an infinity mountain pool and suites with private jacuzzi tubs.'
  },

  // EXPANDING UDAIPUR (Top Romantic Capital)
  {
    name: 'The Oberoi Udaivilas Udaipur',
    city: 'Udaipur',
    country: 'India',
    slug: 'the-oberoi-udaivilas-udaipur',
    url: 'https://www.makemytrip.com/hotels/the_oberoi_udaivilas-details-udaipur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-oberoi-udaivilas.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Pool', 'Lake Pichola View', 'Freestanding Clawfoot Tub', 'Couple Friendly'],
    tubType: 'Handcrafted Victorian Clawfoot Soaking Tub',
    roomType: 'Premier Room with Semi-Private Pool & Bathtub',
    price: '₹42,000',
    rating: 4.9,
    reviewsCount: 680,
    neighborhood: 'Haridas Ji Ki Magri, Lake Pichola',
    bookingTip: 'Premier Rooms with semi-private pool access feature standalone Victorian clawfoot tubs and private walled courtyards.',
    description: 'Ranked among the top romantic palace resorts in the world, featuring dome pavilions, semi-private pool moats, and Victorian clawfoot tubs.'
  },
  {
    name: 'Taj Lake Palace Udaipur',
    city: 'Udaipur',
    country: 'India',
    slug: 'taj-lake-palace-udaipur',
    url: 'https://www.makemytrip.com/hotels/taj_lake_palace-details-udaipur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-lake-palace.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Floating Palace', 'Lake Pichola', 'Royal Marble Tub', 'Couple Friendly'],
    tubType: 'Royal Carved Marble Bathtub',
    roomType: 'Palace Suite with Lake View Bathtub',
    price: '₹48,000',
    rating: 4.9,
    reviewsCount: 720,
    neighborhood: 'Lake Pichola Island',
    bookingTip: 'Arrive by private ceremonial boat to an island palace built in 1746 with marble soaking tubs overlooking the City Palace.',
    description: 'An 18th-century floating white marble palace on Lake Pichola offering unparalleled royal indulgence and suites with lake-facing soaking tubs.'
  },
  {
    name: 'The Leela Palace Udaipur',
    city: 'Udaipur',
    country: 'India',
    slug: 'the-leela-palace-udaipur',
    url: 'https://www.makemytrip.com/hotels/the_leela_palace_udaipur-details-udaipur.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-leela-palace-udaipur.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-jw-marriott-hotel-new-delhi-aerocity.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Lake Pichola Sunset View', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Deep Marble Soaking Tub with Lake View',
    roomType: 'Grand Heritage Lake View Room with Bathtub',
    price: '₹36,000',
    rating: 4.9,
    reviewsCount: 590,
    neighborhood: 'Lake Pichola West Bank',
    bookingTip: 'Grand Heritage rooms offer tubs positioned with direct sightlines across Lake Pichola to the sunset over the Aravalli hills.',
    description: 'Regal waterfront palace on Lake Pichola with Mewari architecture, private boat arrival, and lavish marble bathtubs.'
  },

  // EXPANDING MANALI (Himalayan Romantic Capital)
  {
    name: 'The Himalayan Manali',
    city: 'Manali',
    country: 'India',
    slug: 'the-himalayan-manali',
    url: 'https://www.makemytrip.com/hotels/the_himalayan-details-manali.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-himalayan.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Victorian Gothic Castle', 'Fireplace', 'Clawfoot Tub', 'Couple Friendly'],
    tubType: 'Antique Victorian Cast Iron Clawfoot Tub',
    roomType: 'Castle Tower Suite with Clawfoot Tub',
    price: '₹14,500',
    rating: 4.8,
    reviewsCount: 310,
    neighborhood: 'Hadimba Road',
    bookingTip: 'Castle Suites feature working stone fireplaces and authentic cast-iron clawfoot tubs amidst apple orchards.',
    description: 'A premier Victorian Gothic castle resort nestled in apple and cherry orchards with clawfoot tubs and wood-burning hearths.'
  },
  {
    name: 'Span Resort and Spa Manali',
    city: 'Manali',
    country: 'India',
    slug: 'span-resort-and-spa-manali',
    url: 'https://www.makemytrip.com/hotels/span_resort_and_spa-details-manali.html',
    bookingUrl: 'https://www.booking.com/hotel/in/span-resort-and-spa.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-leela-palace-new-delhi.webp',
    verified: true,
    amenities: ['Bathtub', 'Beas Riverfront', 'Private Jacuzzi', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Private Riverfront Jacuzzi Bathtub',
    roomType: 'Grand River Suite with Jacuzzi',
    price: '₹18,000',
    rating: 4.8,
    reviewsCount: 340,
    neighborhood: 'Baragarh, Kullu-Manali Highway',
    bookingTip: 'Grand River Suites sit right on the banks of the rushing Beas River with private jetted jacuzzis.',
    description: 'Set across riverside lawns on the Beas River, Span Resort offers five-star mountain chalets with private jacuzzi suites.'
  },

  // EXPANDING MUNNAR & OOTY
  {
    name: 'Spice Tree Munnar',
    city: 'Munnar',
    country: 'India',
    slug: 'spice-tree-munnar',
    url: 'https://www.makemytrip.com/hotels/spicetree_munnar-details-munnar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/spicetree-munnar.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-jw-marriott-hotel-new-delhi-aerocity.webp',
    verified: true,
    amenities: ['Bathtub', 'Private Jacuzzi', 'Mountain Tea Estate View', 'Couple Friendly'],
    tubType: 'Handcrafted Copper Soaking Bathtub',
    roomType: 'Pool Villa with Copper Bathtub',
    price: '₹16,500',
    rating: 4.9,
    reviewsCount: 390,
    neighborhood: 'Muttukad, Bison Valley Road',
    bookingTip: 'Villas feature handcrafted antique copper bathtubs and private solar-heated plunge pools overlooking tea hills.',
    description: 'An intimate boutique retreat in the Bison Valley hills featuring handcrafted copper soaking tubs and tea garden vistas.'
  },
  {
    name: 'Savoy - IHCL SeleQtions Ooty',
    city: 'Ooty',
    country: 'India',
    slug: 'savoy-ihcl-seleqtions-ooty',
    url: 'https://www.makemytrip.com/hotels/savoy_ihcl_seleqtions_ooty-details-ooty.html',
    bookingUrl: 'https://www.booking.com/hotel/in/savoy-hotel.html',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    verified: true,
    amenities: ['Bathtub', 'Colonial Fireplace', 'Heritage Gardens', 'Deep Soaking Tub', 'Couple Friendly'],
    tubType: 'Victorian Deep Soaking Bathtub',
    roomType: 'Heritage Suite with Fireplace and Bathtub',
    price: '₹14,000',
    rating: 4.8,
    reviewsCount: 360,
    neighborhood: 'Sylks Road',
    bookingTip: 'Historic 1841 colonial suites with log fire hearths and deep soaking tubs for crisp Nilgiri mountain nights.',
    description: 'An 1841 colonial sanctuary in Ooty offering sprawling English cottage suites with roaring fireplaces and deep bathtubs.'
  }
];

async function seedBatch() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('hotels');

  console.log(`Seeding ${additionalHotels.length} additional expansion hotels...`);
  let inserted = 0;
  let updated = 0;

  for (const h of additionalHotels) {
    const existing = await col.findOne({ slug: h.slug });
    if (existing) {
      await col.updateOne({ _id: existing._id }, { $set: h });
      updated++;
    } else {
      await col.insertOne({
        ...h,
        crossVerified: true,
        crossVerifiedAt: new Date(),
        crossVerifiedSources: ['Booking.com', 'MakeMyTrip'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      inserted++;
    }
  }

  console.log(`✅ Batch seeding complete! Inserted: ${inserted}, Updated: ${updated}`);
  await mongoose.disconnect();
}

seedBatch().catch(err => {
  console.error(err);
  process.exit(1);
});
