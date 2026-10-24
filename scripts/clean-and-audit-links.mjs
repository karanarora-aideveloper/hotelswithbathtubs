import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');

async function cleanAndAudit() {
  console.log('🧹 Starting Hotel Links Cleanup & Data Remediation...\n');

  if (!fs.existsSync(cachePath)) {
    console.error('❌ Cache file .cache/all-hotels.json not found!');
    process.exit(1);
  }

  const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  console.log(`Loaded ${allHotels.length} hotels from cache.`);

  let bookingAidFixed = 0;
  let airbnbSearchPurged = 0;
  let agodaCidFixed = 0;
  let agodaEnInFixed = 0;
  let agodaPartnerHopsResolved = 0;
  let mmtDetailMigrated = 0;
  let mmtSearchPurged = 0;

  const mongoOps = [];

  for (let i = 0; i < allHotels.length; i++) {
    const h = allHotels[i];
    const update = {};
    const unsets = {};

    // 1. Booking.com: ensure aid=304142 is present
    if (h.bookingUrl && !h.bookingUrl.includes('aid=')) {
      const sep = h.bookingUrl.includes('?') ? '&' : '?';
      const fixedBooking = `${h.bookingUrl}${sep}aid=304142`;
      h.bookingUrl = fixedBooking;
      update.bookingUrl = fixedBooking;
      bookingAidFixed++;
    }

    // 2. Airbnb: purge search links (/s/{city}/homes?query=...) on branded properties
    if (h.airbnbUrl && !h.airbnbUrl.includes('/rooms/')) {
      delete h.airbnbUrl;
      unsets.airbnbUrl = 1;
      airbnbSearchPurged++;
    }

    // 3. Agoda cleanup: standardize CID to 1972736, strip /en-in/, resolve partnersearch hops
    if (h.agodaUrl) {
      let cleanedAgoda = h.agodaUrl;
      let changed = false;

      // Fix rogue CID 1951559 -> 1972736
      if (cleanedAgoda.includes('cid=1951559')) {
        cleanedAgoda = cleanedAgoda.replace('cid=1951559', 'cid=1972736');
        agodaCidFixed++;
        changed = true;
      }

      // Replace /en-in/ with /en-us/
      if (cleanedAgoda.includes('/en-in/')) {
        cleanedAgoda = cleanedAgoda.replace('/en-in/', '/en-us/');
        agodaEnInFixed++;
        changed = true;
      }

      // Resolve partnersearch.aspx?hid= redirect hops to direct canonical search?selectedproperty=
      if (cleanedAgoda.includes('partnersearch.aspx') && cleanedAgoda.includes('hid=')) {
        const hidMatch = cleanedAgoda.match(/hid=(\d+)/);
        if (hidMatch) {
          cleanedAgoda = `https://www.agoda.com/search?pcs=1&cid=1972736&selectedproperty=${hidMatch[1]}&pslc=1`;
          agodaPartnerHopsResolved++;
          changed = true;
        }
      }

      if (changed) {
        h.agodaUrl = cleanedAgoda;
        update.agodaUrl = cleanedAgoda;
      }
    }

    // 4. MakeMyTrip: migrate genuine property details to mmtUrl, purge generic search listings
    if (h.url && h.url.includes('makemytrip.com')) {
      const isDirectMmt = (h.url.includes('hotel-details') || h.url.includes('hotelid=') || h.url.includes('hotelId=')) && !h.url.includes('hotel-listing');
      if (isDirectMmt) {
        h.mmtUrl = h.url;
        update.mmtUrl = h.url;
        delete h.url;
        unsets.url = 1;
        mmtDetailMigrated++;
      } else if (h.url.includes('hotel-listing') || h.url.includes('searchText=')) {
        delete h.url;
        unsets.url = 1;
        mmtSearchPurged++;
      }
    }

    // Prepare Mongo Bulk Op
    if (Object.keys(update).length > 0 || Object.keys(unsets).length > 0) {
      update.updatedAt = new Date();
      const op = {};
      if (Object.keys(update).length > 0) op.$set = update;
      if (Object.keys(unsets).length > 0) op.$unset = unsets;

      if (h._id) {
        mongoOps.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(h._id) },
            update: op,
          },
        });
      }
    }
  }

  console.log('Cleanup Statistics:');
  console.log(`  - Booking.com AID (aid=304142) appended: ${bookingAidFixed}`);
  console.log(`  - Airbnb fake search URLs purged: ${airbnbSearchPurged}`);
  console.log(`  - Agoda rogue CIDs (1951559 -> 1972736) fixed: ${agodaCidFixed}`);
  console.log(`  - Agoda /en-in/ locales converted to /en-us/: ${agodaEnInFixed}`);
  console.log(`  - Agoda partnersearch hops resolved to direct property search: ${agodaPartnerHopsResolved}`);
  console.log(`  - MakeMyTrip direct property links migrated to mmtUrl: ${mmtDetailMigrated}`);
  console.log(`  - MakeMyTrip generic search URLs purged from detail fields: ${mmtSearchPurged}`);
  console.log(`  - Total MongoDB update operations queued: ${mongoOps.length}`);

  // Write updated cache
  fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2), 'utf8');
  console.log('\n✅ Updated .cache/all-hotels.json successfully.');

  // Execute MongoDB bulkWrite
  if (process.env.MONGODB_URI && mongoOps.length > 0) {
    console.log('\nConnecting to MongoDB to persist updates...');
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('hotels');
    const res = await collection.bulkWrite(mongoOps, { ordered: false });
    console.log(`✅ MongoDB bulkWrite finished: matched ${res.matchedCount}, modified ${res.modifiedCount}.`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanAndAudit().catch((err) => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
