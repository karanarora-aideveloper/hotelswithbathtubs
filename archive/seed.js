const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "process.env.MONGODB_URI";

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  city: { type: String, required: true, index: true },
  country: { type: String, required: true, default: 'India', index: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
  verified: { type: Boolean, default: true },
  amenities: { type: [String], default: ['Bathtub'] }
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const legacyDir = path.join(__dirname, '_legacy_static');
    const files = fs.readdirSync(legacyDir).filter(f => f.startsWith('mmt_validated_') && f.endsWith('.json'));
    
    let totalInserted = 0;
    
    for (const file of files) {
      const city = file.replace('mmt_validated_', '').replace('.json', '');
      const cityName = city.charAt(0).toUpperCase() + city.slice(1);
      
      const filePath = path.join(legacyDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      for (const h of data) {
        const doc = {
          name: h.name,
          slug: slugify(h.name) + '-' + city,
          city: cityName,
          country: 'India',
          url: h.url || `https://www.makemytrip.com/hotels/hotel-details/?hotelId=${slugify(h.name)}`,
          image: h.image || '/assets/fallback.webp',
          verified: true,
          amenities: ['Private Bathtub / Jacuzzi']
        };
        
        await Hotel.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true, new: true });
        totalInserted++;
      }
      console.log(`✅ Migrated ${data.length} hotels for ${cityName}`);
    }
    
    console.log(`\n🎉 Data Migration Complete! Total unique hotels in MongoDB: ${totalInserted}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
