import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function getSearchQuery(name, city) {
  if (!name) return city || '';
  let cleaned = name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const c = (city || '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  if (c && !cleaned.toLowerCase().includes(c.toLowerCase())) {
    return `${cleaned} ${c}`;
  }
  return cleaned;
}

async function healAllLinks() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');
  const allHotels = await collection.find({}).toArray();
  console.log(`Total hotels in database: ${allHotels.length}`);

  let agodaUrlHealed = 0;
  let bookingUrlHealed = 0;
  let mmtUrlHealed = 0;
  let bookingUrlFieldHealed = 0;
  let agodaUrlFieldHealed = 0;
  let mmtVerifiedPreserved = 0;

  const bulkOps = [];

  for (const h of allHotels) {
    const update = {};
    const query = getSearchQuery(h.name, h.city);
    const encodedQuery = encodeURIComponent(query);

    // 1. Guaranteed Agoda Partner Deep Search URL
    const targetAgodaUrl = `https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&hl=en&searchText=${encodedQuery}`;
    if (h.agodaUrl !== targetAgodaUrl) {
      update.agodaUrl = targetAgodaUrl;
      agodaUrlFieldHealed++;
    }

    // 2. Guaranteed Booking.com Search URL
    const targetBookingUrl = `https://www.booking.com/searchresults.html?ss=${encodedQuery}&lang=en-us`;
    if (h.bookingUrl !== targetBookingUrl) {
      update.bookingUrl = targetBookingUrl;
      bookingUrlFieldHealed++;
    }

    // 3. Primary url field healing
    if (h.url) {
      if (h.url.includes('makemytrip.com')) {
        // If it has verified numerical hotelId, preserve it 100%!
        if (h.url.includes('hotelId=') || h.url.includes('hotelid=')) {
          mmtVerifiedPreserved++;
        } else {
          // Legacy broken .html slug like /hotels/hotel-details-city.html -> heal to working search
          const targetMmtUrl = `https://www.makemytrip.com/hotels/hotel-listing/?searchText=${encodedQuery}`;
          if (h.url !== targetMmtUrl) {
            update.url = targetMmtUrl;
            mmtUrlHealed++;
          }
        }
      } else if (h.url.includes('booking.com')) {
        if (h.url !== targetBookingUrl) {
          update.url = targetBookingUrl;
          bookingUrlHealed++;
        }
      } else if (h.url.includes('agoda.com')) {
        if (h.url !== targetAgodaUrl) {
          update.url = targetAgodaUrl;
          agodaUrlHealed++;
        }
      }
    }

    if (Object.keys(update).length > 0) {
      update.updatedAt = new Date();
      bulkOps.push({
        updateOne: {
          filter: { _id: h._id },
          update: { $set: update }
        }
      });
    }
  }

  console.log('\n--- HEALING PLAN BREAKDOWN ---');
  console.log(`Hotels requiring updates: ${bulkOps.length} / ${allHotels.length}`);
  console.log(`- agodaUrl field healed: ${agodaUrlFieldHealed}`);
  console.log(`- bookingUrl field healed: ${bookingUrlHealedCount(allHotels)} -> ${bookingUrlFieldHealed}`);
  console.log(`- MakeMyTrip primary url healed: ${mmtUrlHealed}`);
  console.log(`- Booking.com primary url healed: ${bookingUrlHealed}`);
  console.log(`- Agoda primary url healed: ${agodaUrlHealed}`);
  console.log(`- Verified MakeMyTrip deep links preserved: ${mmtVerifiedPreserved}`);

  if (bulkOps.length > 0) {
    console.log('\nExecuting bulk updates in MongoDB Atlas...');
    const result = await collection.bulkWrite(bulkOps);
    console.log(`Bulk write completed! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } else {
    console.log('\nAll hotel links are already up to date!');
  }

  // Verification step
  const postHotels = await collection.find({}).toArray();
  console.log(`\nPost-heal check: Total hotels in database: ${postHotels.length}`);

  let postBrokenAgoda = 0;
  let postBrokenBooking = 0;
  let postBrokenMmt = 0;

  for (const h of postHotels) {
    if (h.agodaUrl && h.agodaUrl.includes('.html')) postBrokenAgoda++;
    if (h.bookingUrl && h.bookingUrl.includes('/hotel/')) postBrokenBooking++;
    if (h.url && h.url.includes('makemytrip.com') && h.url.includes('-details-')) postBrokenMmt++;
  }

  console.log(`Post-heal Broken/Synthetic Link Counts:`);
  console.log(`- Agoda synthetic .html slugs: ${postBrokenAgoda}`);
  console.log(`- Booking synthetic slugs: ${postBrokenBooking}`);
  console.log(`- MakeMyTrip legacy slugs: ${postBrokenMmt}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

function bookingUrlHealedCount(hotels) {
  return hotels.filter(h => h.bookingUrl && !h.bookingUrl.includes('searchresults.html?ss=')).length;
}

healAllLinks().catch((err) => {
  console.error('Error during link healing:', err);
  process.exit(1);
});
