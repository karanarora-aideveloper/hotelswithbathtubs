import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

const HotelSchema = new mongoose.Schema({}, { strict: false, collection: 'hotels' });
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

async function fixSearchResultsUrls() {
  console.log('🚀 Connecting to MongoDB Atlas to repair broken searchresults.html URLs...');
  await mongoose.connect(MONGODB_URI);

  const query = { url: { $regex: /searchresults\.html/i } };
  const hotels = await Hotel.find(query).lean();
  console.log(`Found ${hotels.length} hotels with broken searchresults.html in 'url' field.`);

  const bulkOps = [];
  let upgradedToBooking = 0;
  let upgradedToAgoda = 0;
  let skipped = 0;

  for (const h of hotels) {
    let newUrl = null;

    if (h.bookingUrl && h.bookingUrl.includes('/hotel/') && !h.bookingUrl.includes('searchresults.html')) {
      newUrl = h.bookingUrl;
      upgradedToBooking++;
    } else if (h.agodaUrl && h.agodaUrl.includes('/hotel/') && h.agodaUrl.includes('.html')) {
      newUrl = h.agodaUrl;
      upgradedToAgoda++;
    } else if (h.agodaUrl) {
      newUrl = h.agodaUrl;
      upgradedToAgoda++;
    }

    if (newUrl) {
      bulkOps.push({
        updateOne: {
          filter: { _id: h._id },
          update: { $set: { url: newUrl } },
        },
      });
    } else {
      skipped++;
    }
  }

  console.log(`Prepared bulk operations:
  - Upgraded to direct bookingUrl: ${upgradedToBooking}
  - Upgraded to direct agodaUrl:   ${upgradedToAgoda}
  - Skipped (no alternative):     ${skipped}`);

  if (bulkOps.length > 0) {
    const result = await Hotel.bulkWrite(bulkOps);
    console.log(`✅ Successfully updated ${result.modifiedCount} hotel records in MongoDB.`);
  }

  // Update .cache/all-hotels.json if it exists
  const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
  if (fs.existsSync(cachePath)) {
    try {
      console.log('🔄 Refreshing .cache/all-hotels.json...');
      const allHotels = await Hotel.find({ flagged: { $ne: true } }).lean();
      fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2), 'utf8');
      console.log(`✅ Refreshed .cache/all-hotels.json with ${allHotels.length} hotels.`);
    } catch (e) {
      console.warn('⚠️ Could not refresh cache:', e.message);
    }
  }

  console.log('🎉 Done fixing searchresults.html URLs!');
  process.exit(0);
}

fixSearchResultsUrls().catch(err => {
  console.error('❌ Error fixing search results URLs:', err);
  process.exit(1);
});
