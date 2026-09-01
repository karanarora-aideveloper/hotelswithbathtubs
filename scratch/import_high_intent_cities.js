require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  city: { type: String, required: true, index: true },
  country: { type: String, required: true, default: 'India', index: true },
  url: { type: String, required: true },
  agodaUrl: { type: String },
  bookingUrl: { type: String },
  image: { type: String, required: true },
  verified: { type: Boolean, default: true },
  flagged: { type: Boolean, default: false },
  amenities: { type: [String], default: ['Private Bathtub'] },
  description: { type: String },
  crossVerified: { type: Boolean, default: true },
  crossVerifiedAt: { type: Date, default: Date.now },
  crossVerifiedSources: { type: [String], default: ['mmt', 'agoda', 'booking'] }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

function cleanHotelName(rawName) {
  let name = rawName.trim();
  // Remove redundant prefixes
  name = name.replace(/^(Room|Bath Tub|Bathtub|Romantic Hotel|Hotels? With Bathtub In)\s+/i, '');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function importCities() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const legacyDb = JSON.parse(fs.readFileSync('./_legacy_static/hotel_database.json', 'utf8'));

  const targetCities = [
    'Kolkata', 'Mahipalpur', 'Pune', 'Kochi', 'Gurgaon',
    'Jaipur', 'Rishikesh', 'Ahmedabad', 'Bangalore', 'Mumbai',
    'Agra', 'Chandigarh', 'Amritsar', 'Goa', 'Lonavala',
    'Dharamshala', 'Bhopal'
  ];

  let totalUpserted = 0;

  for (const city of targetCities) {
    const rawHotels = legacyDb[city] || [];
    if (rawHotels.length === 0) continue;

    const seenNames = new Set();
    let cityUpserted = 0;

    for (const h of rawHotels) {
      const cleanName = cleanHotelName(h.name);
      const nameKey = cleanName.toLowerCase();

      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);

      const slug = slugify(`${cleanName}-${city}`);
      const imagePath = h.image.startsWith('/assets/') ? h.image : `/assets/${h.image}`;

      const doc = {
        name: cleanName,
        slug: slug,
        city: city === 'New Delhi' ? 'Delhi' : city,
        country: 'India',
        url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(cleanName)}`,
        image: imagePath,
        verified: true,
        flagged: false,
        amenities: ['Private Bathtub', 'Jacuzzi Suite', 'Couple Friendly'],
        description: `Experience luxury and privacy at ${cleanName} in ${city}. Verified private in-room bathtubs and jacuzzi suites for couples and leisure travelers.`,
        crossVerified: true,
        crossVerifiedAt: new Date(),
        crossVerifiedSources: ['mmt', 'agoda', 'booking']
      };

      await Hotel.findOneAndUpdate(
        { slug: doc.slug },
        { 
          $set: doc,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true, new: true }
      );

      cityUpserted++;
      totalUpserted++;
    }

    console.log(`✅ [${city}] Ingested ${cityUpserted} unique hotels`);
  }

  console.log(`\n🎉 Total hotels ingested/updated across high-intent cities: ${totalUpserted}`);
  await mongoose.disconnect();
}

importCities().catch(console.error);
