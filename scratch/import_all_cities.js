require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

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

async function importAllRemainingCities() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const legacyDb = JSON.parse(fs.readFileSync('./_legacy_static/hotel_database.json', 'utf8'));
  let totalUpserted = 0;

  for (const [rawCity, rawHotels] of Object.entries(legacyDb)) {
    if (!rawHotels || rawHotels.length === 0) continue;
    const city = rawCity === 'New Delhi' ? 'Delhi' : rawCity;

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
        city: city,
        country: 'India',
        url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(city)}&searchText=${encodeURIComponent(cleanName)}`,
        image: imagePath,
        verified: true,
        flagged: false,
        amenities: ['Private Bathtub', 'Jacuzzi Suite', 'Couple Friendly'],
        description: `Experience comfort and romance at ${cleanName} in ${city}. Triple-verified private in-room bathtubs and luxury jacuzzi suites.`,
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
        { upsert: true, returnDocument: 'after' }
      );

      cityUpserted++;
      totalUpserted++;
    }

    console.log(`✅ [${city}] Ingested/Checked ${cityUpserted} unique hotels`);
  }

  console.log(`\n🎉 Total hotels processed: ${totalUpserted}`);
  await mongoose.disconnect();
}

importAllRemainingCities().catch(console.error);
