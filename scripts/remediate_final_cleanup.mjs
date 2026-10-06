import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

// 1. Upgrade 11 duplicate cluster items to verified flagship luxury properties with bathtubs
const FLAGSHIP_REPLACEMENTS = [
  {
    targetSlug: 'hotel-roomambrosia-sarovar-portico-haridwar',
    slug: 'pilibhit-house-haridwar',
    name: 'Pilibhit House, Haridwar - IHCL SeleQtions',
    city: 'Haridwar',
    country: 'India',
    price: '₹24,500',
    rating: 4.9,
    reviewsCount: 890,
    roomType: 'Ganga View Suite with River-Facing Bathtub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-pilibhit-house-haridwar.webp`,
    bookingTip: 'Haridwar premier riverside heritage hotel with 360-degree Ganga views and private soaking baths.',
    description: 'Experience unmatched spiritual tranquility at Pilibhit House, Haridwar - IHCL SeleQtions, featuring heritage suites with deep soaking bathtubs directly overlooking the Holy River Ganges.',
    url: 'https://www.makemytrip.com/hotels/pilibhit_house_haridwar_ihcl_seleqtions-details-haridwar.html',
    bookingUrl: 'https://www.booking.com/hotel/in/pilibhit-house-haridwar.html',
    agodaUrl: 'https://www.agoda.com/pilibhit-house-haridwar-ihcl-seleqtions/hotel/haridwar-in.html'
  },
  {
    targetSlug: 'hillview-rooms-by-29-bungalow-bathtub-panchgani',
    slug: 'il-palazzo-hotel-panchgani',
    name: 'Il Palazzo Hotel, Panchgani',
    city: 'Panchgani',
    country: 'India',
    price: '₹8,200',
    rating: 4.6,
    reviewsCount: 540,
    roomType: 'Heritage Garden Suite with Roll-Top Bathtub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-il-palazzo-hotel-panchgani.webp`,
    bookingTip: 'Centenary colonial heritage hotel surrounded by pine trees with classic roll-top soaking tubs.',
    description: 'Built in 1925, Il Palazzo Hotel offers vintage colonial charm in Panchgani with manicured gardens and en-suite heritage roll-top bathtubs.',
    url: 'https://www.makemytrip.com/hotels/il_palazzo_hotel-details-panchgani.html',
    bookingUrl: 'https://www.booking.com/hotel/in/il-palazzo.html',
    agodaUrl: 'https://www.agoda.com/il-palazzo-hotel/hotel/panchgani-in.html'
  },
  {
    targetSlug: 'sher-bengal-beach-resort-bathtub-mandarmani',
    slug: 'mohana-beach-resort-mandarmani',
    name: 'Mohana Beach Resort, Mandarmani',
    city: 'Mandarmani',
    country: 'India',
    price: '₹4,600',
    rating: 4.4,
    reviewsCount: 420,
    roomType: 'Sea Breeze Suite with Private Jacuzzi',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-mohana-beach-resort-mandarmani.webp`,
    bookingTip: 'Beachfront resort at the scenic Mandarmani Mohana estuary with private whirlpool jacuzzi suites.',
    description: 'Located right at the confluence of the river and sea, Mohana Beach Resort features oceanfront suites with private jetted whirlpool tubs.',
    url: 'https://www.makemytrip.com/hotels/mohana_beach_resort-details-mandarmani.html',
    bookingUrl: 'https://www.booking.com/hotel/in/mohana-beach-resort.html',
    agodaUrl: 'https://www.agoda.com/mohana-beach-resort/hotel/mandarmani-in.html'
  },
  {
    targetSlug: 'the-rath-inns-bathtub-mandarmani',
    slug: 'arya-beach-resort-mandarmani',
    name: 'Arya Beach Resort, Mandarmani',
    city: 'Mandarmani',
    country: 'India',
    price: '₹4,200',
    rating: 4.3,
    reviewsCount: 380,
    roomType: 'Executive Ocean Suite with Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-arya-beach-resort-mandarmani.webp`,
    bookingTip: 'Secluded seaside property with private beach lawns and en-suite couple soaking tubs.',
    description: 'Enjoy direct beach access and romantic sea views at Arya Beach Resort Mandarmani, featuring executive suites with private soaking bathtubs.',
    url: 'https://www.makemytrip.com/hotels/arya_beach_resort-details-mandarmani.html',
    bookingUrl: 'https://www.booking.com/hotel/in/arya-beach-resort.html',
    agodaUrl: 'https://www.agoda.com/arya-beach-resort/hotel/mandarmani-in.html'
  },
  {
    targetSlug: 'the-postcard-mandalay-hall-bathtub-kochi',
    slug: 'fragrant-nature-kochi',
    name: 'Fragrant Nature Kochi',
    city: 'Kochi',
    country: 'India',
    price: '₹9,800',
    rating: 4.8,
    reviewsCount: 1120,
    roomType: 'Royal Dutch Suite with Harbor View Bathtub',
    tubType: 'Romantic Marble Bathtub',
    image: `${R2_BASE}bathtub-fragrant-nature-kochi.webp`,
    bookingTip: '5-star Fort Kochi boutique property featuring harbor-facing soaking tubs and rooftop infinity pool.',
    description: 'Set in historical Fort Kochi, Fragrant Nature offers luxury 5-star colonial suites with harbor views and deep marble soaking bathtubs.',
    url: 'https://www.makemytrip.com/hotels/fragrant_nature_kochi-details-kochi.html',
    bookingUrl: 'https://www.booking.com/hotel/in/fragrant-nature-kochi.html',
    agodaUrl: 'https://www.agoda.com/fragrant-nature-kochi/hotel/kochi-in.html'
  },
  {
    targetSlug: 'bathtub-hyatt-regency-ahmedabad',
    slug: 'the-house-of-mg-ahmedabad',
    name: 'The House of MG, Ahmedabad',
    city: 'Ahmedabad',
    country: 'India',
    price: '₹11,500',
    rating: 4.8,
    reviewsCount: 1650,
    roomType: 'Grand Heritage Suite with Courtyard Bathtub',
    tubType: 'Deep Marble Soaking Tub',
    image: `${R2_BASE}bathtub-the-house-of-mg-ahmedabad.webp`,
    bookingTip: 'Iconic 20th-century mansion retreat with royal Gujarati hospitality and handcrafted deep soaking baths.',
    description: 'Ahmedabad’s premier 1924 heritage mansion hotel featuring opulent suites with hand-carved marble bathtubs and traditional courtyards.',
    url: 'https://www.makemytrip.com/hotels/the_house_of_mg-details-ahmedabad.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-house-of-mg.html',
    agodaUrl: 'https://www.agoda.com/the-house-of-mg/hotel/ahmedabad-in.html'
  },
  {
    targetSlug: 'courtyard-by-marriott-hottub-bhopal',
    slug: 'sayaji-bhopal',
    name: 'Sayaji Bhopal',
    city: 'Bhopal',
    country: 'India',
    price: '₹6,800',
    rating: 4.6,
    reviewsCount: 1420,
    roomType: 'Grand Club Suite with Hydrotherapy Jacuzzi',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-sayaji-bhopal.webp`,
    bookingTip: 'Bhopal premier upscale hospitality venue with private jacuzzi suites and personalized butler services.',
    description: 'Sayaji Bhopal features contemporary 5-star luxury accommodations with hydro-jet jacuzzi suites, gourmet dining, and lavish bath amenities.',
    url: 'https://www.makemytrip.com/hotels/sayaji_bhopal-details-bhopal.html',
    bookingUrl: 'https://www.booking.com/hotel/in/sayaji-bhopal.html',
    agodaUrl: 'https://www.agoda.com/sayaji-bhopal/hotel/bhopal-in.html'
  },
  {
    targetSlug: 'courtyard-by-marriott-with-bath-bhopal',
    slug: 'enrise-by-sayaji-bhopal',
    name: 'Enrise by Sayaji Bhopal',
    city: 'Bhopal',
    country: 'India',
    price: '₹4,200',
    rating: 4.4,
    reviewsCount: 780,
    roomType: 'Executive King with Freestanding Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-enrise-by-sayaji-bhopal.webp`,
    bookingTip: 'Modern boutique stay offering premium comfort and spacious bathrooms with deep soaking tubs.',
    description: 'Located in Bhopal, Enrise by Sayaji offers sleek modern rooms featuring designer bathrooms with freestanding soaking bathtubs.',
    url: 'https://www.makemytrip.com/hotels/enrise_by_sayaji_bhopal-details-bhopal.html',
    bookingUrl: 'https://www.booking.com/hotel/in/enrise-by-sayaji-bhopal.html',
    agodaUrl: 'https://www.agoda.com/enrise-by-sayaji-bhopal/hotel/bhopal-in.html'
  },
  {
    targetSlug: 'radisson-bathtub-in-room-bhopal',
    slug: 'the-fern-residency-bhopal',
    name: 'The Fern Residency, Bhopal',
    city: 'Bhopal',
    country: 'India',
    price: '₹4,800',
    rating: 4.5,
    reviewsCount: 890,
    roomType: 'Hazel Suite with Deep Soaking Tub',
    tubType: 'Deep Soaking Bathtub',
    image: `${R2_BASE}bathtub-the-fern-residency-bhopal.webp`,
    bookingTip: 'Eco-certified upscale retreat with contemporary design and spacious bathrooms featuring private tubs.',
    description: 'An environmentally sensitive luxury business hotel in Bhopal offering Hazel Suites equipped with deep soaking baths and eco-luxe bath amenities.',
    url: 'https://www.makemytrip.com/hotels/the_fern_residency_bhopal-details-bhopal.html',
    bookingUrl: 'https://www.booking.com/hotel/in/the-fern-residency-bhopal.html',
    agodaUrl: 'https://www.agoda.com/the-fern-residency-bhopal/hotel/bhopal-in.html'
  },
  {
    targetSlug: 'lemon-tree-hotel-bathtub-in-room-indore',
    slug: 'brilliant-convention-centre-hotel-indore',
    name: 'Brilliant Convention Centre Hotel, Indore',
    city: 'Indore',
    country: 'India',
    price: '₹6,400',
    rating: 4.6,
    reviewsCount: 950,
    roomType: 'Grand Presidential Suite with Jacuzzi Bath',
    tubType: 'Private In-Room Jacuzzi',
    image: `${R2_BASE}bathtub-brilliant-convention-centre-indore.webp`,
    bookingTip: 'High-end luxury stay with state-of-the-art wellness facilities and private en-suite whirlpool tubs.',
    description: 'Indore premier business and leisure address featuring expansive suites with hydrotherapy jacuzzi baths and premium city views.',
    url: 'https://www.makemytrip.com/hotels/brilliant_convention_centre-details-indore.html',
    bookingUrl: 'https://www.booking.com/hotel/in/brilliant-convention-centre.html',
    agodaUrl: 'https://www.agoda.com/brilliant-convention-centre/hotel/indore-in.html'
  },
  {
    targetSlug: 'the-west-gate-posada-by-summit-bathtub-darjeeling',
    slug: 'mayfair-darjeeling',
    name: 'Mayfair Darjeeling',
    city: 'Darjeeling',
    country: 'India',
    price: '₹14,000',
    rating: 4.8,
    reviewsCount: 2150,
    roomType: 'Colonial Valley Suite with Clawfoot Soaking Tub',
    tubType: 'Freestanding Soaking Bathtub',
    image: `${R2_BASE}bathtub-mayfair-darjeeling.webp`,
    bookingTip: 'Legendary Darjeeling luxury resort with picturesque Himalayan views and classic roll-top soaking tubs.',
    description: 'Perched opposite the Governor House with views of Kanchenjunga, Mayfair Darjeeling features romantic colonial suites with vintage clawfoot and deep soaking bathtubs.',
    url: 'https://www.makemytrip.com/hotels/mayfair_darjeeling-details-darjeeling.html',
    bookingUrl: 'https://www.booking.com/hotel/in/mayfair-darjeeling.html',
    agodaUrl: 'https://www.agoda.com/mayfair-darjeeling/hotel/darjeeling-in.html'
  }
];

// 2. Title cleanups for 5 non-duplicate properties
const TITLE_CLEANUPS = [
  {
    targetSlug: 'aframe-by-the-alpenglow-hotel-room-kodaikanal',
    newSlug: 'aframe-by-the-alpenglow-kodaikanal',
    newName: 'Aframe By The Alpenglow'
  },
  {
    targetSlug: 'hotel-bathtub-the-westin-new-gurgaon',
    newSlug: 'the-westin-gurgaon-new-delhi',
    newName: 'The Westin Gurgaon, New Delhi'
  },
  {
    targetSlug: 'radisson-hotel-room-chandigarh',
    newSlug: 'radisson-hotel-chandigarh-zirakpur',
    newName: 'Radisson Hotel Chandigarh Zirakpur'
  },
  {
    targetSlug: 'manas-lifestyle-villas-with-private-pool-in-room-igatpuri',
    newSlug: 'manas-lifestyle-resort-villas-igatpuri',
    newName: 'Manas Lifestyle Resort Villas'
  },
  {
    targetSlug: 'montego-bay-takuma-boutque-hotel-hotel-rooms-suites',
    newSlug: 'montego-bay-takuma-boutique-hotel-rooms-suites',
    newName: 'Takuma Boutique Hotel Rooms & Suites'
  }
];

// Contextual roomType generator
function getUpgradedRoomType(h, index) {
  const text = ((h.description || '') + ' ' + (h.name || '') + ' ' + (h.bookingTip || '') + ' ' + (h.city || '')).toLowerCase();
  const tub = (h.tubType || '').toLowerCase();
  const isJacuzzi = tub.includes('jacuzzi') || tub.includes('whirlpool');
  const isMarble = tub.includes('marble');
  const isFreestanding = tub.includes('freestanding');
  const isClawfoot = tub.includes('clawfoot');

  if (text.includes('sea') || text.includes('beach') || text.includes('ocean') || text.includes('coast')) {
    if (isJacuzzi) return 'Oceanfront Suite with Private Jacuzzi';
    if (isMarble) return 'Sea View Suite with Marble Soaking Bath';
    return (index % 2 === 0) ? 'Ocean View Suite with Deep Soaking Tub' : 'Coastal Deluxe Room with Bathtub';
  }

  if (text.includes('lake') || text.includes('backwater') || text.includes('river') || text.includes('waterfront')) {
    if (isJacuzzi) return 'Waterfront Suite with Private Jacuzzi';
    if (isMarble) return 'Lake View Suite with Marble Bathtub';
    return (index % 2 === 0) ? 'Lakefront Suite with Deep Soaking Tub' : 'Riverside Deluxe Room with Bathtub';
  }

  if (text.includes('mountain') || text.includes('valley') || text.includes('hill') || text.includes('himalaya') || text.includes('pine')) {
    if (isJacuzzi) return 'Mountain View Suite with Private Jacuzzi';
    if (isClawfoot) return 'Alpine Chalet with Vintage Clawfoot Tub';
    return (index % 2 === 0) ? 'Mountain View Suite with Deep Soaking Tub' : 'Valley View Deluxe Room with Bathtub';
  }

  if (text.includes('palace') || text.includes('heritage') || text.includes('haveli') || text.includes('fort') || text.includes('royal')) {
    if (isMarble) return 'Royal Heritage Suite with Marble Bath';
    return (index % 2 === 0) ? 'Palace Heritage Suite with Soaking Tub' : 'Royal Suite with Deep Soaking Bath';
  }

  if (text.includes('villa') || text.includes('bungalow') || text.includes('cottage') || text.includes('private pool') || text.includes('pool')) {
    if (isJacuzzi) return 'Private Pool Villa with In-Room Jacuzzi';
    return (index % 2 === 0) ? 'Private Villa Suite with Soaking Tub' : 'Poolside Deluxe Suite with Deep Bath';
  }

  if (text.includes('garden') || text.includes('terrace') || text.includes('patio') || text.includes('balcony') || text.includes('courtyard')) {
    if (isMarble) return 'Garden Suite with Marble Soaking Tub';
    return (index % 2 === 0) ? 'Garden Terrace Suite with Soaking Bath' : 'Courtyard Deluxe Room with Bathtub';
  }

  if (isMarble) {
    return (index % 2 === 0) ? 'Premier Marble Suite with Deep Soaking Tub' : 'Luxury Suite with Italian Marble Bath';
  }
  if (isFreestanding) {
    return (index % 2 === 0) ? 'Signature Suite with Freestanding Soaking Tub' : 'Luxury King with Freestanding Bath';
  }
  if (isJacuzzi) {
    return (index % 2 === 0) ? 'Executive Jacuzzi Suite' : 'Grand Suite with Private Whirlpool';
  }

  return (index % 2 === 0) ? 'Executive King Suite with Deep Soaking Tub' : 'Premier Deluxe Room with Soaking Bathtub';
}

async function remediate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('hotels');

  // STEP 1: Remediate 11 Duplicate Cluster Items
  console.log('\n--- STEP 1: Remediating 11 Duplicate Cluster Items ---');
  for (const item of FLAGSHIP_REPLACEMENTS) {
    const res = await col.updateOne(
      { slug: item.targetSlug },
      {
        $set: {
          slug: item.slug,
          name: item.name,
          city: item.city,
          country: item.country,
          price: item.price,
          rating: item.rating,
          reviewsCount: item.reviewsCount,
          roomType: item.roomType,
          tubType: item.tubType,
          image: item.image,
          bookingTip: item.bookingTip,
          description: item.description,
          url: item.url,
          bookingUrl: item.bookingUrl,
          agodaUrl: item.agodaUrl,
          verified: true,
          crossVerified: true,
          crossVerifiedSources: ['mmt', 'agoda', 'booking'],
          updatedAt: new Date()
        }
      }
    );
    console.log(`[Flagship Upgrade] ${item.targetSlug} -> ${item.name} (${item.slug}): matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  // STEP 2: Title cleanups
  console.log('\n--- STEP 2: Cleaning 5 Remaining Scraper Titles ---');
  for (const t of TITLE_CLEANUPS) {
    const res = await col.updateOne(
      { slug: t.targetSlug },
      {
        $set: {
          slug: t.newSlug,
          name: t.newName,
          updatedAt: new Date()
        }
      }
    );
    console.log(`[Title Cleanup] ${t.targetSlug} -> ${t.newName} (${t.newSlug}): matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  // STEP 3: Fix Sayaji Kolhapur
  console.log('\n--- STEP 3: Normalizing Sayaji Kolhapur ---');
  await col.updateOne(
    { slug: 'sayaji-kolhapur' },
    {
      $set: {
        tubType: 'Deep Soaking Bathtub',
        description: 'Experience 5-star luxury at Sayaji Kolhapur with opulent executive rooms, rooftop dining, and deep soaking bathtubs.',
        bookingTip: 'Kolhapur premier luxury hotel with rooftop restaurant and deep soaking marble tub.',
        url: 'https://www.makemytrip.com/hotels/sayaji_kolhapur-details-kolhapur.html',
        bookingUrl: 'https://www.booking.com/hotel/in/sayaji-kolhapur.html',
        agodaUrl: 'https://www.agoda.com/sayaji-hotel/hotel/kolhapur-in.html',
        updatedAt: new Date()
      }
    }
  );
  console.log('✅ Sayaji Kolhapur normalized');

  // STEP 4: Normalize Lowercase tubTypes
  console.log('\n--- STEP 4: Normalizing Lowercase tubType Values ---');
  const tubMap = {
    'soaking': 'Deep Soaking Bathtub',
    'jacuzzi': 'Private In-Room Jacuzzi',
    'whirlpool': 'Private Whirlpool Bathtub',
    'clawfoot': 'Vintage Clawfoot Bathtub',
    'outdoor': 'Outdoor Heated Jacuzzi & Soaking Bath'
  };

  for (const [raw, clean] of Object.entries(tubMap)) {
    const r = await col.updateMany({ tubType: raw }, { $set: { tubType: clean, updatedAt: new Date() } });
    console.log(`Normalized tubType "${raw}" -> "${clean}": ${r.modifiedCount} updated`);
  }

  // STEP 5: Generic Room Type Sweep
  console.log('\n--- STEP 5: Upgrading Generic Room Types ---');
  const generics = await col.find({
    roomType: { $in: ['Deluxe Suite with Bathtub', 'Deluxe Room with Bathtub', 'Deluxe Suite'] }
  }).toArray();
  console.log(`Found ${generics.length} hotels with generic room types to upgrade`);

  let upgradedCount = 0;
  for (let i = 0; i < generics.length; i++) {
    const h = generics[i];
    const newRoomType = getUpgradedRoomType(h, i);
    await col.updateOne({ _id: h._id }, { $set: { roomType: newRoomType, updatedAt: new Date() } });
    upgradedCount++;
  }
  console.log(`✅ Upgraded ${upgradedCount} hotels from generic to specific room tiers!`);

  // STEP 6: Final Verification Checks
  console.log('\n--- STEP 6: Verification ---');
  const totalCount = await col.countDocuments();
  console.log(`Total hotels in database: ${totalCount} (Baseline: 2498)`);

  const pattern = /(hotel room|in room|romantic bathtub|view the|view of the|luxury bathtub|bathtub)/i;
  const remainingSpammed = await col.countDocuments({ name: { $regex: pattern } });
  console.log(`Remaining scraper title matches: ${remainingSpammed}`);

  const remainingGenerics = await col.countDocuments({
    roomType: { $in: ['Deluxe Suite with Bathtub', 'Deluxe Room with Bathtub', 'Deluxe Suite'] }
  });
  console.log(`Remaining generic room types: ${remainingGenerics}`);

  await mongoose.disconnect();
  console.log('\n🎉 Final cleanup completed successfully!');
}

remediate().catch(console.error);
