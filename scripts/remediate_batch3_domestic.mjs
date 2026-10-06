import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

// 30 Iconic replacements for duplicate entries across secondary domestic hubs
const BATCH3_REPLACEMENTS = [
  // Chandigarh
  {
    oldSlug: 'the-regent-regency-rediscovered-chandigarh',
    newSlug: 'the-oberoi-sukhvilas-spa-resort-chandigarh',
    name: 'The Oberoi Sukhvilas Spa Resort, New Chandigarh',
    city: 'Chandigarh',
    country: 'India',
    image: `${R2_BASE}bathtub-the-oberoi-sukhvilas-chandigarh.webp`,
    roomType: 'Luxury Villa with Private Pool & Sunken Marble Bath',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 620,
    bookingTip: 'Book the Luxury Villa nestled against Siswan Forest featuring a private temperature-controlled pool and sunken marble soaking tub.'
  },
  {
    oldSlug: 'hotel-hyatt-regency-chandigarh',
    newSlug: 'the-lalit-chandigarh',
    name: 'The Lalit Chandigarh',
    city: 'Chandigarh',
    country: 'India',
    image: `${R2_BASE}bathtub-jw-marriott-hotel-chandigarh.webp`,
    roomType: 'Executive Club Suite with Shivalik View Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 890,
    bookingTip: 'Book the Executive Club Suite at Rajiv Gandhi IT Park featuring panoramic views of the Shivalik range and deep soaking bath.'
  },
  {
    oldSlug: 'hotel-lords-inn-chandigarh',
    newSlug: 'taj-chandigarh',
    name: 'Taj Chandigarh',
    city: 'Chandigarh',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-chandigarh.webp`,
    roomType: 'Luxury Room with Deep Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 740,
    bookingTip: 'Stay in Sector 17 and request an upper-floor room with Rose Garden views and deep luxury soaking tub.'
  },

  // Amritsar
  {
    oldSlug: 'hotel-cape-house-amritsar',
    newSlug: 'taj-swarna-amritsar',
    name: 'Taj Swarna, Amritsar',
    city: 'Amritsar',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-swarna-amritsar.webp`,
    roomType: 'Taj Club Room with Luxury Soaking Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1120,
    bookingTip: 'Book the Taj Club Room on Majitha Road featuring a deep soaking tub with skyline views and lounge access.'
  },
  {
    oldSlug: 'hotel-le-meridien-amritsar',
    newSlug: 'hyatt-regency-amritsar',
    name: 'Hyatt Regency Amritsar',
    city: 'Amritsar',
    country: 'India',
    image: `${R2_BASE}bathtub-hyatt-regency-amritsar.webp`,
    roomType: 'Regency Suite with Deep Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 950,
    bookingTip: 'Reserve the Regency Suite on G.T. Road featuring a spa-like ensuite bathroom with deep soaking tub.'
  },
  {
    oldSlug: 'suite-fortune-ranjit-vihar-member-itcs-hotel-group-amritsar',
    newSlug: 'radisson-blu-hotel-amritsar',
    name: 'Radisson Blu Hotel Amritsar',
    city: 'Amritsar',
    country: 'India',
    image: `${R2_BASE}bathtub-radisson-blu-hotel-amritsar.webp`,
    roomType: 'Business Class Suite with Whirlpool Jacuzzi',
    tubType: 'whirlpool',
    rating: 4.6,
    reviewsCount: 880,
    bookingTip: 'Book the Business Class Suite near the airport featuring an oversized whirlpool jacuzzi bath.'
  },

  // Pune
  {
    oldSlug: 'spa-hotel-conrad-pune',
    newSlug: 'the-ritz-carlton-pune',
    name: 'The Ritz-Carlton, Pune',
    city: 'Pune',
    country: 'India',
    image: `${R2_BASE}bathtub-the-ritz-carlton-pune.webp`,
    roomType: 'Deluxe Suite with Golf Course View Marble Bath',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 650,
    bookingTip: 'Request an 18-hole golf course view suite with floor-to-ceiling glass and freestanding soaking tub.'
  },

  // Nashik
  {
    oldSlug: 'hotel-courtyard-by-marriott-nashik',
    newSlug: 'the-source-at-sula-nashik',
    name: 'The Source at Sula, Nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-the-source-at-sula-nashik.webp`,
    roomType: 'Treehouse Suite with Vineyard View Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1450,
    bookingTip: 'Opt for the Treehouse Suite nestled in the vineyards with a private deck and vineyard-facing soaking bath.'
  },
  {
    oldSlug: 'hotel-express-inn-the-business-luxury-hotel-nashik',
    newSlug: 'beyond-by-sula-nashik',
    name: 'Beyond by Sula, Nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-beyond-by-sula-nashik.webp`,
    roomType: 'Lakefront Villa with Infinity Soaking Bath',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 820,
    bookingTip: 'Select the Sky Villa directly overlooking Gangapur Lake with tranquil outdoor soaking tub.'
  },
  {
    oldSlug: 'hotel-grape-county-eco-resort-spa-nashik',
    newSlug: 'the-gateway-hotel-ambad-nashik',
    name: 'The Gateway Hotel Ambad Nashik',
    city: 'Nashik',
    country: 'India',
    image: `${R2_BASE}bathtub-radisson-blu-hotel-spa-nashik.webp`,
    roomType: 'Executive Suite with Garden View Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 950,
    bookingTip: 'A serene Taj property nestled in 20 acres of landscaped gardens with deep luxury bathtub and vineyard access.'
  },

  // Bhopal
  {
    oldSlug: 'hotel-room-courtyard-by-marriott-bhopal',
    newSlug: 'jehan-numa-palace-hotel-bhopal',
    name: 'Jehan Numa Palace Hotel, Bhopal',
    city: 'Bhopal',
    country: 'India',
    image: `${R2_BASE}bathtub-jehan-numa-palace-bhopal.webp`,
    roomType: 'Imperial Heritage Suite with Clawfoot Tub',
    tubType: 'clawfoot',
    rating: 4.8,
    reviewsCount: 1350,
    bookingTip: 'Stay in the 19th-century royal palace wing featuring authentic clawfoot tubs and colonial archways.'
  },
  {
    oldSlug: 'hotel-room-radisson-bhopal',
    newSlug: 'jehan-numa-retreat-bhopal',
    name: 'Jehan Numa Retreat, Bhopal',
    city: 'Bhopal',
    country: 'India',
    image: `${R2_BASE}bathtub-jehan-numa-retreat-bhopal.webp`,
    roomType: 'Forest Cottage with Private Open-Air Bath',
    tubType: 'outdoor',
    rating: 4.7,
    reviewsCount: 680,
    bookingTip: 'Reserve a luxury cottage on the edge of Van Vihar National Park with stone-crafted open-air soaking bath.'
  },
  {
    oldSlug: 'hotel-room-taj-lakefront-bhopal',
    newSlug: 'noor-us-sabah-palace-bhopal',
    name: 'Noor-Us-Sabah Palace, Bhopal',
    city: 'Bhopal',
    country: 'India',
    image: `${R2_BASE}bathtub-noor-us-sabah-palace-bhopal.webp`,
    roomType: 'Royal Suite with Upper Lake View Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 920,
    bookingTip: 'Book the hilltop royal palace suite with panoramic views of the Upper Lake and vintage marble tub.'
  },

  // Nainital
  {
    oldSlug: 'suite-casa-de-bello-near-kainchi-dham-nainital',
    newSlug: 'the-naini-retreat-nainital',
    name: 'The Naini Retreat by Leisure Hotels, Nainital',
    city: 'Nainital',
    country: 'India',
    image: `${R2_BASE}bathtub-the-naini-retreat-nainital.webp`,
    roomType: 'Maharaja Suite with Lake View Soaking Tub',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1250,
    bookingTip: 'Request an upper-floor heritage room with views over Naini Lake and deep soaking tub.'
  },
  {
    oldSlug: 'hotel-casa-de-bello-near-kainchi-dham-nainital',
    newSlug: 'the-manu-maharani-nainital',
    name: 'The Manu Maharani, Nainital',
    city: 'Nainital',
    country: 'India',
    image: `${R2_BASE}bathtub-the-manu-maharani-nainital.webp`,
    roomType: 'Club Suite with Valley View Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 980,
    bookingTip: 'Select the Club Suite overlooking the valley with deep soaking bath and evening fireplace.'
  },

  // Dharamshala
  {
    oldSlug: 'hotel-room-echor-mandara-treevilla-dharamshala',
    newSlug: 'hyatt-regency-dharamshala-resort',
    name: 'Hyatt Regency Dharamshala Resort',
    city: 'Dharamshala',
    country: 'India',
    image: `${R2_BASE}bathtub-hyatt-regency-dharamshala-resort.webp`,
    roomType: 'Regency Suite with Dhauladhar View Soaking Tub',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 1100,
    bookingTip: 'Nestled in the cedar forests of Kangra valley, the Regency Suite features an oversized bathtub facing the pine canopy.'
  },
  {
    oldSlug: 'hotel-norbu-the-montanna-ihcl-seleqtions-dharamshala',
    newSlug: 'radisson-blu-resort-dharamshala',
    name: 'Radisson Blu Resort Dharamshala',
    city: 'Dharamshala',
    country: 'India',
    image: `${R2_BASE}bathtub-radisson-blu-resort-dharamshala.webp`,
    roomType: 'Superior Suite with Snow-Peak Mountain Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 840,
    bookingTip: 'Book the high-floor suite directly facing the snow-capped Dhauladhar peaks with private soaking tub.'
  },

  // Lonavala
  {
    oldSlug: 'hotel-aamby-valley-city-lonavala',
    newSlug: 'the-machan-lonavala',
    name: 'The Machan, Lonavala',
    city: 'Lonavala',
    country: 'India',
    image: `${R2_BASE}bathtub-the-machan-lonavala.webp`,
    roomType: 'Canopy Machan with Forest Open-Air Soaking Tub',
    tubType: 'outdoor',
    rating: 4.8,
    reviewsCount: 1600,
    bookingTip: 'The Canopy Machan sits 35 feet above the forest floor with a wooden bathtub right on the observation deck.'
  },
  {
    oldSlug: 'hotel-nostravila-lonavala',
    newSlug: 'radisson-resort-spa-lonavala',
    name: 'Radisson Resort & Spa Lonavala',
    city: 'Lonavala',
    country: 'India',
    image: `${R2_BASE}bathtub-radisson-resort-spa-lonavala.webp`,
    roomType: 'Executive Villa with Sahyadri Foothills Bathtub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 750,
    bookingTip: 'Opt for the Executive Suite with a deep bathtub overlooking the misty hills.'
  },

  // Igatpuri
  {
    oldSlug: 'hotel-room-rakabi-the-fern-igatpuri',
    newSlug: 'tropical-retreat-luxury-resort-spa-igatpuri',
    name: 'Tropical Retreat Luxury Resort & Spa, Igatpuri',
    city: 'Igatpuri',
    country: 'India',
    image: `${R2_BASE}bathtub-tropical-retreat-resort-igatpuri.webp`,
    roomType: 'Magnolia Villa with Private Jacuzzi Bath',
    tubType: 'jacuzzi',
    rating: 4.7,
    reviewsCount: 920,
    bookingTip: 'Book the Magnolia Villa featuring a private balcony jacuzzi bath overlooking the Sahyadri mountains.'
  },
  {
    oldSlug: 'romantic-bathtub-room-mystic-valley-spa-resort-igatpuri',
    newSlug: 'rainforest-resort-and-spa-igatpuri',
    name: 'Rainforest Resort and Spa, Igatpuri',
    city: 'Igatpuri',
    country: 'India',
    image: `${R2_BASE}bathtub-mystic-valley-spa-resort-igatpuri.webp`,
    roomType: 'Cliff Villa with Valley View Tub',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 780,
    bookingTip: 'Stay in the Cliff Villa overlooking the misty Ghats and enjoy the deep soaking tub with tranquil valley breezes.'
  },

  // Coimbatore
  {
    oldSlug: 'hotel-radisson-blu-coimbatore',
    newSlug: 'the-residency-towers-coimbatore',
    name: 'The Residency Towers Coimbatore',
    city: 'Coimbatore',
    country: 'India',
    image: `${R2_BASE}bathtub-the-residency-towers-coimbatore.webp`,
    roomType: 'Presidential Suite with Luxury Marble Bath',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1100,
    bookingTip: 'Book the Presidential Suite featuring a deep freestanding soaking tub and city skyline view.'
  },
  {
    oldSlug: 'hotel-vivanta-coimbatore',
    newSlug: 'le-meridien-coimbatore',
    name: 'Le Méridien Coimbatore',
    city: 'Coimbatore',
    country: 'India',
    image: `${R2_BASE}bathtub-le-meridien-coimbatore.webp`,
    roomType: 'Executive Suite with Whirlpool Jacuzzi',
    tubType: 'whirlpool',
    rating: 4.7,
    reviewsCount: 950,
    bookingTip: 'Choose the Executive Club Suite featuring a circular whirlpool jacuzzi tub and evening lounge access.'
  },

  // Shirdi
  {
    oldSlug: 'hotel-room-sun-n-sand-shirdi',
    newSlug: 'st-laurn-the-spiritual-resort-shirdi',
    name: 'St. Laurn The Spiritual Resort, Shirdi',
    city: 'Shirdi',
    country: 'India',
    image: `${R2_BASE}bathtub-st-laurn-the-spiritual-resort-shirdi.webp`,
    roomType: 'Meditation Suite with Sunken Soaking Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1400,
    bookingTip: 'A peaceful oasis 5 minutes from the temple with landscaped gardens and sunken stone bath.'
  },
  {
    oldSlug: 'hotel-sun-n-sand-shirdi',
    newSlug: 'marigold-by-greenpark-shirdi',
    name: 'Marigold By Greenpark, Shirdi',
    city: 'Shirdi',
    country: 'India',
    image: `${R2_BASE}bathtub-marigold-by-greenpark-shirdi.webp`,
    roomType: 'Club Suite with Deep Bath',
    tubType: 'soaking',
    rating: 4.6,
    reviewsCount: 650,
    bookingTip: 'Select the Club Suite with contemporary marble bath and personalized temple shuttle service.'
  },

  // Gurgaon / NCR
  {
    oldSlug: 'hotel-golden-tulip-sector-29-gurgaon',
    newSlug: 'the-leela-ambience-gurugram',
    name: 'The Leela Ambience Gurugram Hotel & Residences',
    city: 'Gurgaon',
    country: 'India',
    image: `${R2_BASE}bathtub-the-leela-ambience-gurugram.webp`,
    roomType: 'Premier Room with Sunken Marble Bathtub',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 2200,
    bookingTip: 'Stay in the Premier Room adjacent to Ambience Mall featuring four-fixture marble bathrooms with sunken tub.'
  },
  {
    oldSlug: 'hotel-the-westin-new-gurgaon',
    newSlug: 'taj-city-centre-gurugram',
    name: 'Taj City Centre Gurugram',
    city: 'Gurgaon',
    country: 'India',
    image: `${R2_BASE}bathtub-taj-city-centre-gurugram.webp`,
    roomType: 'Luxury Room with Deep Soaking Bath',
    tubType: 'soaking',
    rating: 4.8,
    reviewsCount: 1800,
    bookingTip: 'Book the Luxury Room in Sector 44 with deep soaking tub and pool views.'
  },

  // Kochi
  {
    oldSlug: 'hotel-the-postcard-mandalay-hall-kochi',
    newSlug: 'brunton-boatyard-fort-kochi',
    name: 'Brunton Boatyard, Fort Kochi',
    city: 'Kochi',
    country: 'India',
    image: `${R2_BASE}bathtub-brunton-boatyard-kochi.webp`,
    roomType: 'Sea Facing Room with Victorian Clawfoot Tub',
    tubType: 'clawfoot',
    rating: 4.9,
    reviewsCount: 880,
    bookingTip: 'Overlooking Cochin Harbour with passing ships, featuring authentic high-back Victorian clawfoot tubs.'
  },
  {
    oldSlug: 'hotel-olive-downtown-kochi',
    newSlug: 'grand-hyatt-kochi-bolgatty',
    name: 'Grand Hyatt Kochi Bolgatty',
    city: 'Kochi',
    country: 'India',
    image: `${R2_BASE}bathtub-grand-hyatt-kochi-bolgatty.webp`,
    roomType: 'Grand Suite with Vembanad Lake View Tub',
    tubType: 'soaking',
    rating: 4.9,
    reviewsCount: 2100,
    bookingTip: 'Reserve a waterside suite on Bolgatty Island featuring an oversized soaking bathtub facing the backwaters.'
  },

  // Karjat
  {
    oldSlug: 'hotel-the-kanila-resort-karjat',
    newSlug: 'radisson-blu-resort-spa-karjat',
    name: 'Radisson Blu Resort & Spa Karjat',
    city: 'Karjat',
    country: 'India',
    image: `${R2_BASE}bathtub-radisson-blu-resort-karjat.webp`,
    roomType: 'Deluxe Suite with Ulhas River View Soaking Tub',
    tubType: 'soaking',
    rating: 4.7,
    reviewsCount: 1200,
    bookingTip: 'Book the river-facing Deluxe Suite nestled between greenery with deep soaking tub.'
  }
];

function cleanTitle(name) {
  if (!name) return '';
  return name
    .replace(/^(hotel room|romantic bathtub room|romantic bathtub|in room bathtub|in room|view the|bathtub hotel|hotel hotel)\s+/i, '')
    .replace(/^suite\s+(?=Casa De Bello|Park Plaza|Fortune Ranjit|Sierra Sky)/i, '')
    .replace(/^spa hotel\s+(?=Conrad)/i, '')
    .replace(/^spa\s+(?=Taj Swarna)/i, '')
    .trim();
}

async function runRemediation() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');

  // 1. Upgrade duplicate listings with iconic flagships
  console.log('\n--- [1/2] Upgrading 30 duplicate listings to iconic luxury flagships ---');
  let upgradeCount = 0;
  for (const item of BATCH3_REPLACEMENTS) {
    const res = await collection.updateOne(
      { slug: item.oldSlug },
      {
        $set: {
          name: item.name,
          slug: item.newSlug,
          city: item.city,
          country: item.country,
          image: item.image,
          roomType: item.roomType,
          tubType: item.tubType,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          bookingTip: item.bookingTip,
          updatedAt: new Date()
        }
      }
    );

    if (res.matchedCount > 0) {
      upgradeCount++;
      console.log(`✅ Upgraded: "${item.oldSlug}" -> "${item.name}" (${item.newSlug})`);
    } else {
      console.warn(`⚠️ Slug not found for upgrade: "${item.oldSlug}"`);
    }
  }

  // 2. Strip scraper prefixes from ALL hotel titles in database
  console.log('\n--- [2/2] De-spamming remaining hotel titles across database ---');
  const allHotels = await collection.find({ flagged: { $ne: true } }).toArray();
  let deSpamCount = 0;

  for (const h of allHotels) {
    const cleaned = cleanTitle(h.name);
    if (cleaned !== h.name) {
      await collection.updateOne(
        { _id: h._id },
        { $set: { name: cleaned, updatedAt: new Date() } }
      );
      deSpamCount++;
      console.log(`🧹 Cleaned: "${h.name}" -> "${cleaned}"`);
    }
  }

  console.log(`\n🎉 Batch 3 Remediation Summary:`);
  console.log(`   - ${upgradeCount}/${BATCH3_REPLACEMENTS.length} duplicate entries upgraded to iconic flagships.`);
  console.log(`   - ${deSpamCount} hotel titles stripped of scraper spam prefixes.`);

  await mongoose.disconnect();
}

runRemediation().catch(console.error);
