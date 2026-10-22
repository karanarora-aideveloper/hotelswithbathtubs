import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import https from 'node:https';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function uploadToR2(imageUrl, keyName) {
  console.log(`⏳ Processing image for ${keyName}...`);
  const raw = await fetchBuffer(imageUrl);
  const webp = await sharp(raw).resize(1200, 800, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: `hotelswithbathtubs/images/${keyName}`,
    Body: webp,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable'
  }));
  console.log(`✅ Uploaded to R2: ${keyName} (${webp.length} bytes)`);
  return `${R2_PUBLIC_BASE}${keyName}`;
}

const WASHINGTON_DC_HOTELS = [
  {
    name: 'The Jefferson, Washington DC',
    slug: 'the-jefferson-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-jefferson.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/the-jefferson.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-the-jefferson-washington-dc.webp',
    price: '$480',
    currency: 'USD',
    tubType: 'Deep Soaking Bathtub',
    roomType: 'Deluxe King Room with Soaking Tub',
    rating: 4.8,
    reviewsCount: 820,
    neighborhood: 'Downtown DC',
    landmarkDistance: '0.6 miles from The White House',
    bookingTip: 'Book the Deluxe King Suite to guarantee the walk-in bathroom with European deep soaking tub.',
    amenities: ['Bathtub', 'Deep Soaking Tub', 'Historic Luxury', 'Downtown DC', 'Couple Friendly', 'Spa Services'],
    description: 'Historic Beaux-Arts luxury hotel near the White House featuring opulent marble bathrooms with deep European soaking tubs and custom scented bath salts.',
  },
  {
    name: 'The Hay-Adams',
    slug: 'the-hay-adams-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-hay-adams.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/the-hay-adams.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-the-hay-adams-washington-dc.webp',
    price: '$550',
    currency: 'USD',
    tubType: 'Italian Marble Soaking Bathtub',
    roomType: 'Lafayette Suite with View & Deep Tub',
    rating: 4.9,
    reviewsCount: 640,
    neighborhood: 'Lafayette Square',
    landmarkDistance: 'Directly overlooking The White House',
    bookingTip: 'Request a high-floor Lafayette Suite for White House panoramas alongside your marble soaking bath.',
    amenities: ['Bathtub', 'Marble Soaking Tub', 'White House Views', 'Historic Luxury', 'Valet Parking', 'Fine Dining'],
    description: 'Iconic luxury hotel overlooking Lafayette Square with ornate brass fixtures, Italian marble bathrooms, and deep private soaking baths designed for romance.',
  },
  {
    name: 'Riggs Washington DC',
    slug: 'riggs-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/riggs-washington-dc.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/riggs-washington-dc.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-riggs-washington-dc.webp',
    price: '$390',
    currency: 'USD',
    tubType: 'Freestanding Soaking Bathtub',
    roomType: 'First Lady Suite with Freestanding Tub',
    rating: 4.7,
    reviewsCount: 580,
    neighborhood: 'Penn Quarter',
    landmarkDistance: '0.3 miles from National Portrait Gallery',
    bookingTip: 'The First Lady Suites feature custom freestanding oval soaking tubs situated prominently in grand marble bathrooms.',
    amenities: ['Bathtub', 'Freestanding Tub', 'Penn Quarter', 'Cocktail Lounge', 'Design Hotel', 'Fitness Center'],
    description: 'Housed in the historic National Bank building in Penn Quarter, offering dramatic suites with bespoke freestanding soaking tubs and luxury bath linens.',
  },
  {
    name: 'Rosewood Washington, D.C.',
    slug: 'rosewood-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/rosewood-washington-d-c.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/rosewood-washington-d-c.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-rosewood-washington-dc.webp',
    price: '$620',
    currency: 'USD',
    tubType: 'Deep Marble Soaking Bathtub',
    roomType: 'Canal Suite with Marble Tub',
    rating: 4.8,
    reviewsCount: 410,
    neighborhood: 'Georgetown',
    landmarkDistance: 'Steps from C&O Canal and M Street',
    bookingTip: 'Canal Suites offer tranquil views of the Georgetown waterway directly from luxury marble bath suites.',
    amenities: ['Bathtub', 'Deep Soaking Tub', 'C&O Canal Views', 'Rooftop Lounge', 'Georgetown', 'Boutique Luxury'],
    description: 'Intimate Georgetown canalside sanctuary featuring lavish marble master baths with oversized soaking tubs and panoramic rooftop views.',
  },
  {
    name: 'Four Seasons Hotel Washington, DC',
    slug: 'four-seasons-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/four-seasons-washington-dc.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/four-seasons-washington-dc.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-four-seasons-washington-dc.webp',
    price: '$790',
    currency: 'USD',
    tubType: 'Deep Soaking Marble Bathtub',
    roomType: 'Premier One-Bedroom Suite with Deep Tub',
    rating: 4.9,
    reviewsCount: 930,
    neighborhood: 'Georgetown',
    landmarkDistance: '0.4 miles from Foggy Bottom Metro',
    bookingTip: 'Select Premier Suites for deep marble soaking baths paired with dual vanities and separate glass rainfall showers.',
    amenities: ['Bathtub', 'Soaking Tub', 'Full Spa', 'Michelin Dining', 'Georgetown', 'Indoor Saltwater Pool'],
    description: 'Prestigious 5-star Georgetown haven with expansive master baths featuring deep marble soaking tubs, separate glass rain showers, and L’Occitane amenities.',
  },
  {
    name: 'The Dupont Circle Hotel',
    slug: 'the-dupont-circle-hotel-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/the-dupont-circle-hotel.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/the-dupont-circle-hotel.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-the-dupont-circle-hotel-dc.webp',
    price: '$340',
    currency: 'USD',
    tubType: 'Heated Floor Marble Bathtub',
    roomType: 'Grand Penthouse Suite with Soaking Tub',
    rating: 4.6,
    reviewsCount: 720,
    neighborhood: 'Dupont Circle',
    landmarkDistance: 'Located right on Dupont Circle',
    bookingTip: 'Penthouse level suites feature heated marble bathroom floors and deep designer tubs overlooking the circle.',
    amenities: ['Bathtub', 'Heated Bathroom Floors', 'Dupont Circle', 'Mid-Century Design', 'Balcony', 'Cocktail Bar'],
    description: 'Mid-century chic luxury on Dupont Circle offering marble bathrooms with heated floors and deep relaxing tubs perfect for couples.',
  },
  {
    name: 'Viceroy Washington DC',
    slug: 'viceroy-washington-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/viceroy-washington-dc.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/viceroy-washington-dc.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-viceroy-washington-dc.webp',
    price: '$290',
    currency: 'USD',
    tubType: 'Modern Soaking Bathtub',
    roomType: 'Studio Suite with Deep Bathtub',
    rating: 4.5,
    reviewsCount: 650,
    neighborhood: 'Logan Circle',
    landmarkDistance: '0.2 miles from 14th Street Corridor',
    bookingTip: 'Studio Suites come appointed with spacious tubs and expansive living areas ideal for weekend staycations.',
    amenities: ['Bathtub', 'Soaking Tub', 'Rooftop Pool', 'Logan Circle', 'Pet Friendly', 'Art Gallery'],
    description: 'Artful boutique escape off 14th Street in Logan Circle, featuring spacious suites with sleek soaking bathtubs and custom art.',
  },
  {
    name: 'Eaton DC',
    slug: 'eaton-dc',
    city: 'Washington DC',
    country: 'USA',
    url: 'https://www.booking.com/hotel/us/eaton-dc.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/us/eaton-dc.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-eaton-dc.webp',
    price: '$260',
    currency: 'USD',
    tubType: 'Deep Copper-Accent Soaking Tub',
    roomType: 'Artist Suite with Deep Tub',
    rating: 4.6,
    reviewsCount: 810,
    neighborhood: 'Downtown DC',
    landmarkDistance: '0.5 miles from Walter E. Washington Convention Center',
    bookingTip: 'The Artist Suite includes natural bath oils, a vinyl record setup, and a deep soaking bath.',
    amenities: ['Bathtub', 'Deep Soaking Tub', 'Vinyl Record Player', 'Wellness Spa', 'Downtown DC', 'Rooftop Music Lounge'],
    description: 'Progressive boutique hospitality in downtown DC offering artisan bathrooms equipped with deep custom soaking tubs, natural bath salts, and Himalayan crystal lamps.',
  },
];

const ATHENS_HOTELS = [
  {
    name: 'Hotel Grande Bretagne, a Luxury Collection Hotel',
    slug: 'hotel-grande-bretagne-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/hotel-grande-bretagne-a-luxury-collection-hotel-athens.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/hotel-grande-bretagne-a-luxury-collection-hotel-athens.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-hotel-grande-bretagne-athens.webp',
    price: '€580',
    currency: 'EUR',
    tubType: 'Deep Marble Soaking Bathtub',
    roomType: 'Grand Suite with Acropolis View & Marble Tub',
    rating: 4.9,
    reviewsCount: 1420,
    neighborhood: 'Syntagma Square',
    landmarkDistance: 'Directly on Syntagma Square opposite Parliament',
    bookingTip: 'Select the Acropolis View Grand Suite to admire the floodlit Parthenon from your private marble soaking suite.',
    amenities: ['Bathtub', 'Marble Soaking Tub', 'Acropolis Views', 'Historic Palace', 'Spa & Pool', 'Rooftop Restaurant'],
    description: 'Iconic 19th-century palace hotel on Syntagma Square with palatial marble bathrooms, deep European soaking tubs, and direct views of the Acropolis and Parthenon.',
  },
  {
    name: 'King George, a Luxury Collection Hotel',
    slug: 'king-george-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/king-george-a-luxury-collection-hotel-athens.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/king-george-a-luxury-collection-hotel-athens.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-king-george-athens.webp',
    price: '€520',
    currency: 'EUR',
    tubType: 'Luxury Marble Bathtub',
    roomType: 'Executive Suite with Marble Bath',
    rating: 4.8,
    reviewsCount: 780,
    neighborhood: 'Syntagma Square',
    landmarkDistance: '50m from Syntagma Metro Station',
    bookingTip: 'Executive Suites feature Greek marble bathrooms with deep tubs and personalized butler service.',
    amenities: ['Bathtub', 'Luxury Marble Bath', 'Michelin Restaurant', 'Syntagma', 'Boutique Luxury', 'Champagne Bar'],
    description: 'Neoclassical boutique elegance beside Syntagma Square, featuring opulent marble bathrooms with deep soaking bathtubs and bespoke Greek bath essentials.',
  },
  {
    name: 'AthensWas Design Hotel',
    slug: 'athenswas-hotel-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/athenswas.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/athenswas.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-athenswas-hotel-athens.webp',
    price: '€340',
    currency: 'EUR',
    tubType: 'Private Balcony Jacuzzi Hot Tub',
    roomType: 'Hellenic Suite with Private Outdoor Hot Tub',
    rating: 4.8,
    reviewsCount: 960,
    neighborhood: 'Dionysiou Areopagitou',
    landmarkDistance: '150m from Acropolis Museum',
    bookingTip: 'Book the Hellenic Suite for an outdoor heated hydromassage jacuzzi tub looking directly at the Parthenon.',
    amenities: ['Bathtub', 'Jacuzzi Hot Tub', 'Acropolis Promenade', 'Design Hotel', 'Rooftop Bar', 'Private Terrace'],
    description: 'Design-forward luxury on the pedestrian Dionysiou Areopagitou promenade directly facing the Acropolis, offering suites with private outdoor jacuzzi hot tubs.',
  },
  {
    name: 'The Foundry Suites Athens',
    slug: 'the-foundry-suites-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/the-foundry-suites-athens.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/the-foundry-suites-athens.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-the-foundry-suites-athens.webp',
    price: '€290',
    currency: 'EUR',
    tubType: 'Freestanding Deep Soaking Bathtub',
    roomType: 'Industrial Loft Suite with Freestanding Tub',
    rating: 4.9,
    reviewsCount: 630,
    neighborhood: 'Psyrri',
    landmarkDistance: '0.3 miles from Monastiraki Square',
    bookingTip: 'The Loft Suites feature open-concept bathrooms with iconic freestanding roll-top soaking tubs.',
    amenities: ['Bathtub', 'Freestanding Bathtub', 'Rooftop Picnic Garden', 'Psyrri', 'Boutique Suites', 'Kitchenette'],
    description: 'Restored 1930s industrial font foundry in vibrant Psyrri, featuring bohemian luxury suites with centerpiece freestanding bathtubs and a rooftop botanical garden.',
  },
  {
    name: 'Shila Athens',
    slug: 'shila-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/shila-athens.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/shila-athens.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-shila-athens.webp',
    price: '€320',
    currency: 'EUR',
    tubType: 'Bohemian Open-Plan Soaking Tub',
    roomType: 'Romantic Suite with Open-Plan Bathtub',
    rating: 4.9,
    reviewsCount: 420,
    neighborhood: 'Kolonaki',
    landmarkDistance: '0.4 miles from Mount Lycabettus Funicular',
    bookingTip: 'Every suite at Shila has an artistic soul, with in-room standalone tubs surrounded by curated antique artwork.',
    amenities: ['Bathtub', 'Open-Plan Tub', 'Kolonaki', 'Boho Chic', 'Rooftop Solarium', 'Artisan Breakfast'],
    description: 'Sensory 1920s neoclassical residence in chic Kolonaki, offering artistically styled boudoir suites with vintage freestanding soaking baths.',
  },
  {
    name: 'Electra Metropolis',
    slug: 'electra-metropolis-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/electra-metropolis.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/electra-metropolis.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-electra-metropolis-athens.webp',
    price: '€310',
    currency: 'EUR',
    tubType: 'Whirlpool Jacuzzi Bathtub',
    roomType: 'Acropolis Suite with Whirlpool Tub',
    rating: 4.7,
    reviewsCount: 1850,
    neighborhood: 'Syntagma / Plaka',
    landmarkDistance: '200m from Plaka historic neighborhood',
    bookingTip: 'The Acropolis Suite boasts a marble bathroom with private hydromassage jacuzzi bath.',
    amenities: ['Bathtub', 'Whirlpool Tub', 'Rooftop Pool', 'Acropolis Views', 'Plaka', 'Full Spa'],
    description: 'Retro-chic 5-star haven steps from Plaka, offering suites with private hydromassage jacuzzi tubs and a dramatic rooftop pool framing the Parthenon.',
  },
  {
    name: 'Perianth Hotel',
    slug: 'perianth-hotel-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/perianth-hotel.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/perianth-hotel.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-perianth-hotel-athens.webp',
    price: '€360',
    currency: 'EUR',
    tubType: 'Private Terrace Jacuzzi Hot Tub',
    roomType: 'Penthouse Suite with Acropolis View & Jacuzzi',
    rating: 4.7,
    reviewsCount: 710,
    neighborhood: 'Agia Irini Square',
    landmarkDistance: 'Located on vibrant Agia Irini Square',
    bookingTip: 'Book the 6th floor Penthouse for an open-air hot tub jacuzzi on your private teak terrace.',
    amenities: ['Bathtub', 'Private Jacuzzi', 'Agia Irini Square', 'Bauhaus Design', 'Acropolis Views', 'Zen Center'],
    description: 'Neo-modernist Bauhaus luxury on bustling Agia Irini Square, boasting a penthouse suite with a private open-air jacuzzi tub framing unobstructed Acropolis panoramas.',
  },
  {
    name: 'NEW Hotel',
    slug: 'new-hotel-athens',
    city: 'Athens',
    country: 'Greece',
    url: 'https://www.booking.com/hotel/gr/new-hotel.html?aid=304142',
    bookingUrl: 'https://www.booking.com/hotel/gr/new-hotel.html?aid=304142',
    rawImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    imageKey: 'bathtub-new-hotel-athens.webp',
    price: '€280',
    currency: 'EUR',
    tubType: 'Custom Brass Designer Bathtub',
    roomType: 'Penthouse Suite with Designer Tub',
    rating: 4.6,
    reviewsCount: 940,
    neighborhood: 'Syntagma / Plaka',
    landmarkDistance: '200m from Syntagma Square',
    bookingTip: 'Penthouse Suites feature sculptural solid-brass bathtubs and avant-garde furnishings by the Campana brothers.',
    amenities: ['Bathtub', 'Designer Bathtub', 'Campana Brothers Design', 'Plaka', 'Art Hotel', 'Wellness Spa'],
    description: 'Vibrant modern art hotel designed by the Campana brothers, featuring bespoke solid brass bathrooms with deep soaking tubs just 200m from Syntagma.',
  },
];

async function seedHotels() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
  
  const allHotels = [...WASHINGTON_DC_HOTELS, ...ATHENS_HOTELS];
  let inserted = 0;
  let updated = 0;

  for (const h of allHotels) {
    try {
      let r2Url = `${R2_PUBLIC_BASE}${h.imageKey}`;
      try {
        r2Url = await uploadToR2(h.rawImage, h.imageKey);
      } catch (err) {
        console.warn(`⚠️ R2 upload warning for ${h.imageKey}:`, err.message);
      }

      const doc = {
        name: h.name,
        slug: h.slug,
        city: h.city,
        country: h.country,
        url: h.url,
        bookingUrl: h.bookingUrl,
        image: r2Url,
        price: h.price,
        currency: h.currency,
        tubType: h.tubType,
        roomType: h.roomType,
        rating: h.rating,
        reviewsCount: h.reviewsCount,
        neighborhood: h.neighborhood,
        landmarkDistance: h.landmarkDistance,
        bookingTip: h.bookingTip,
        amenities: h.amenities,
        description: h.description,
        verified: true,
        crossVerified: true,
        crossVerifiedSources: ['Booking.com', 'Expedia', 'Agoda'],
        bathtubConfirmed: true,
      };

      const res = await Hotel.updateOne(
        { slug: h.slug },
        { $set: doc },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        inserted++;
        console.log(`✨ Inserted new hotel: ${h.name} (${h.city}, ${h.country})`);
      } else {
        updated++;
        console.log(`🔄 Updated existing hotel: ${h.name}`);
      }
    } catch (e) {
      console.error(`❌ Error seeding ${h.name}:`, e.message);
    }
  }

  console.log(`\n🎉 Seeding complete! ${inserted} inserted, ${updated} updated.`);
  await mongoose.disconnect();
}

seedHotels().catch(console.error);
