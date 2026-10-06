import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const COUNTRY_ISO_MAP = {
  "india": "in", "usa": "us", "uk": "gb", "united kingdom": "gb", "uae": "ae",
  "united arab emirates": "ae", "singapore": "sg", "thailand": "th", "malaysia": "my",
  "japan": "jp", "france": "fr", "indonesia": "id", "italy": "it", "netherlands": "nl",
  "greece": "gr", "switzerland": "ch", "canada": "ca", "spain": "es", "maldives": "mv",
  "turkey": "tr", "australia": "au", "mexico": "mx", "new zealand": "nz",
  "french polynesia": "pf", "seychelles": "sc", "mauritius": "mu", "fiji": "fj",
  "germany": "de", "portugal": "pt", "south africa": "za", "austria": "at",
  "czechia": "cz", "hungary": "hu", "ireland": "ie", "brazil": "br", "costa rica": "cr",
  "saint lucia": "lc", "jamaica": "jm", "bahamas": "bs", "dominican republic": "do",
  "barbados": "bb", "aruba": "aw", "iceland": "is", "norway": "no", "finland": "fi",
  "sweden": "se", "denmark": "dk", "south korea": "kr", "taiwan": "tw", "vietnam": "vn",
  "sri lanka": "lk", "croatia": "hr", "morocco": "ma", "tanzania": "tz", "chile": "cl",
  "argentina": "ar", "peru": "pe", "colombia": "co", "poland": "pl", "slovenia": "si",
  "qatar": "qa", "oman": "om", "bahrain": "bh", "jordan": "jo", "saudi arabia": "sa",
  "philippines": "ph", "cambodia": "kh", "albania": "al", "antigua and barbuda": "ag",
  "azerbaijan": "az", "belize": "bz", "bermuda": "bm", "bolivia": "bo",
  "bosnia and herzegovina": "ba", "botswana": "bw", "cape verde": "cv", "cook islands": "ck",
  "curacao": "cw", "cyprus": "cy", "ecuador": "ec", "egypt": "eg", "estonia": "ee",
  "faroe islands": "fo", "georgia": "ge", "greenland": "gl", "guatemala": "gt",
  "honduras": "hn", "kazakhstan": "kz", "kenya": "ke", "laos": "la", "latvia": "lv",
  "lithuania": "lt", "madagascar": "mg", "malta": "mt", "mongolia": "mn",
  "montenegro": "me", "mozambique": "mz", "namibia": "na", "nepal": "np",
  "new caledonia": "nc", "nicaragua": "ni", "north macedonia": "mk", "panama": "pa",
  "paraguay": "py", "rwanda": "rw", "samoa": "ws", "tunisia": "tn",
  "turks and caicos": "tc", "uruguay": "uy", "uzbekistan": "uz", "vanuatu": "vu",
  "zambia": "zm", "zimbabwe": "zw"
};

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanHotelNameForOTA(name, city) {
  if (!name) return '';
  let cleaned = name;

  // Remove city suffix if already present at the end, e.g. "The Oberoi, Mumbai" -> "The Oberoi"
  if (city) {
    const cityRegex = new RegExp(`[,\\s\\-–]+${city}.*$`, 'i');
    cleaned = cleaned.replace(cityRegex, '');
  }

  // Remove parentheses if they just specify neighborhood or city, e.g. "(Colaba)"
  cleaned = cleaned.replace(/\([^)]*\)/g, '');

  return cleaned.trim() || name;
}

async function enrichOTAs() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const collection = mongoose.connection.collection('hotels');
  const allHotels = await collection.find({ flagged: { $ne: true } }).toArray();

  console.log(`Analyzing ${allHotels.length} hotels for multi-OTA enrichment...`);

  let addedBookingCount = 0;
  let addedAgodaCount = 0;
  const bulkOps = [];

  for (const h of allHotels) {
    const countryKey = (h.country || '').toLowerCase();
    const isoCode = COUNTRY_ISO_MAP[countryKey] || 'in';
    const citySlug = slugify(h.city);
    const cleanName = cleanHotelNameForOTA(h.name, h.city);
    const hotelSlug = slugify(cleanName) || slugify(h.name);

    const updateFields = {};

    const query = cleanHotelNameForOTA(h.name, h.city);
    const encodedQuery = encodeURIComponent(h.city && !query.toLowerCase().includes(h.city.toLowerCase()) ? `${query} ${h.city}` : query);

    // 1. Missing Booking.com URL
    if (!h.bookingUrl || !h.bookingUrl.trim()) {
      const generatedBooking = `https://www.booking.com/searchresults.html?ss=${encodedQuery}&lang=en-us`;
      updateFields.bookingUrl = generatedBooking;
      addedBookingCount++;
    }

    // 2. Missing Agoda URL
    if (!h.agodaUrl || !h.agodaUrl.trim()) {
      const generatedAgoda = `https://www.agoda.com/partners/partnersearch.aspx?cid=1972736&hl=en&searchText=${encodedQuery}`;
      updateFields.agodaUrl = generatedAgoda;
      addedAgodaCount++;
    }

    if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = new Date();
      bulkOps.push({
        updateOne: {
          filter: { _id: h._id },
          update: { $set: updateFields }
        }
      });
    }
  }

  console.log(`Prepared ${bulkOps.length} database updates:`);
  console.log(`   - Adding Booking.com URLs: ${addedBookingCount}`);
  console.log(`   - Adding Agoda URLs:       ${addedAgodaCount}`);

  if (bulkOps.length > 0) {
    console.log('Executing bulk updates in MongoDB Atlas...');
    const result = await collection.bulkWrite(bulkOps);
    console.log(`✅ Bulk write completed! Modified ${result.modifiedCount} documents.`);
  }

  // Verification check
  const updatedAll = await collection.find({ flagged: { $ne: true } }).toArray();
  const all3 = updatedAll.filter(h => h.url && h.bookingUrl && h.agodaUrl).length;
  const atLeast2 = updatedAll.filter(h => {
    const count = (h.url ? 1 : 0) + (h.bookingUrl ? 1 : 0) + (h.agodaUrl ? 1 : 0);
    return count >= 2;
  }).length;

  console.log(`\n🎉 Post-Enrichment Multi-OTA Status:`);
  console.log(`   - Total hotels: ${updatedAll.length}`);
  console.log(`   - Hotels with ALL 3 OTAs (MakeMyTrip + Booking.com + Agoda): ${all3} (${((all3 / updatedAll.length) * 100).toFixed(1)}%)`);
  console.log(`   - Hotels with at least 2 OTAs (Rate comparison active): ${atLeast2} (${((atLeast2 / updatedAll.length) * 100).toFixed(1)}%)`);

  await mongoose.disconnect();
}

enrichOTAs().catch(console.error);
