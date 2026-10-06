import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import fs from 'node:fs';

async function auditGlobalInventory() {
  console.log('🔌 Connecting to MongoDB for Global Inventory Audit...');
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('hotels');

  const allHotels = await col.find({}).toArray();
  console.log(`📦 Loaded ${allHotels.length} hotels into memory.`);

  // 1. Image analysis
  const imageUsage = new Map();
  const invalidImages = [];
  
  // 2. Text pollution analysis
  const textPollution = [];
  const textPollutionRegex = /MMT Luxe|Handpicked Luxury|Exclusive Handpicked|Extraordinary Signature|Never before offers|<[a-z]|&amp;|undefined|null|\[object/i;

  // 3. Name analysis
  const nameSpam = [];
  const allCapsRegex = /^[A-Z0-9\s\-_.,&()]{6,}$/;
  const otaSpamRegex = /@\s*\d+\s*min|\bNear\b|\bOpposite\b|\bMain Road\b|\bBuilding\b|\bHotel Room\b|\bBehind\b|\bAdjacent to\b/i;

  // 4. Generic placeholders
  let genericRoomCount = 0;
  let genericTubCount = 0;

  // 5. OTA Links analysis
  let missingBooking = 0;
  let missingAgoda = 0;
  let missingMmt = 0;
  let singleOtaOnly = 0;
  let allThreeOtas = 0;

  // 6. Price analysis
  const budgetRiskHotels = [];
  let missingPriceCount = 0;

  // 7. City & Country aggregations
  const cityMap = new Map();
  const countryMap = new Map();

  for (const h of allHotels) {
    const city = (h.city || 'Unknown').trim();
    const country = (h.country || 'Unknown').trim();
    const cityKey = `${city.toLowerCase()}|||${country.toLowerCase()}`;

    // Aggregations
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, { city, country, count: 0, hotels: [] });
    }
    cityMap.get(cityKey).count++;
    cityMap.get(cityKey).hotels.push(h);

    if (!countryMap.has(country)) {
      countryMap.set(country, { country, count: 0, cities: new Set() });
    }
    countryMap.get(country).count++;
    countryMap.get(country).cities.add(city.toLowerCase());

    // Image Check
    const img = (h.image || '').trim();
    if (!img || !img.startsWith('http')) {
      invalidImages.push({ id: h._id, name: h.name, city, country, image: img });
    } else {
      if (!imageUsage.has(img)) {
        imageUsage.set(img, []);
      }
      imageUsage.get(img).push({ id: h._id, name: h.name, city, country });
    }

    // Text Pollution Check
    const combinedText = `${h.name || ''} ${h.description || ''} ${h.neighborhood || ''} ${h.bookingTip || ''} ${h.roomType || ''}`;
    if (textPollutionRegex.test(combinedText)) {
      textPollution.push({
        id: h._id,
        name: h.name,
        city,
        country,
        match: combinedText.match(textPollutionRegex)?.[0] || 'Unknown',
        descriptionSnippet: (h.description || '').substring(0, 100)
      });
    }

    // Name Spam Check
    const name = (h.name || '').trim();
    const isAllCaps = allCapsRegex.test(name) && name.length > 5 && /[A-Z]/.test(name);
    const hasOtaKeywords = otaSpamRegex.test(name);
    const isLower = name.length > 3 && name === name.toLowerCase();

    if (isAllCaps || hasOtaKeywords || isLower) {
      nameSpam.push({
        id: h._id,
        name,
        city,
        country,
        issues: [
          isAllCaps ? 'ALL_CAPS' : null,
          hasOtaKeywords ? 'OTA_KEYWORDS' : null,
          isLower ? 'ALL_LOWERCASE' : null
        ].filter(Boolean)
      });
    }

    // Generic Placeholders
    if (!h.roomType || h.roomType === 'Deluxe Suite with Bathtub') {
      genericRoomCount++;
    }
    if (!h.tubType || h.tubType === 'Private Soaking Bathtub') {
      genericTubCount++;
    }

    // OTA Deep Links
    const hasMmt = !!(h.url && h.url.includes('makemytrip'));
    const hasBooking = !!(h.bookingUrl && h.bookingUrl.includes('booking.com'));
    const hasAgoda = !!(h.agodaUrl && h.agodaUrl.includes('agoda.com'));

    if (!hasBooking) missingBooking++;
    if (!hasAgoda) missingAgoda++;
    if (!hasMmt) missingMmt++;

    const otasCount = (hasMmt ? 1 : 0) + (hasBooking ? 1 : 0) + (hasAgoda ? 1 : 0);
    if (otasCount === 1) singleOtaOnly++;
    if (otasCount >= 3) allThreeOtas++;

    // Price & Authenticity Risk
    const priceStr = (h.price || '').trim();
    if (!priceStr) {
      missingPriceCount++;
    } else {
      // Check for suspiciously cheap "luxury tubs" in India (< ₹1,200)
      if (country.toLowerCase() === 'india') {
        const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
        if (num > 0 && num < 1200) {
          budgetRiskHotels.push({ id: h._id, name: h.name, city, price: priceStr, rating: h.rating });
        }
      }
    }
  }

  // Cloned images analysis (images used by >= 2 distinct hotels)
  const clonedImages = [];
  for (const [imgUrl, hotels] of imageUsage.entries()) {
    if (hotels.length >= 2) {
      clonedImages.push({
        imageUrl: imgUrl,
        count: hotels.length,
        cities: Array.from(new Set(hotels.map(h => `${h.city}, ${h.country}`))),
        hotels: hotels.map(h => ({ name: h.name, city: h.city }))
      });
    }
  }
  clonedImages.sort((a, b) => b.count - a.count);

  // Thin cities analysis
  const thinCities = [];
  const healthyCities = [];
  for (const [key, data] of cityMap.entries()) {
    if (data.count === 1) {
      thinCities.push({ city: data.city, country: data.country, count: 1 });
    } else if (data.count <= 3) {
      thinCities.push({ city: data.city, country: data.country, count: data.count });
    } else {
      healthyCities.push({ city: data.city, country: data.country, count: data.count });
    }
  }

  // Country ranking
  const countryRankings = Array.from(countryMap.values()).map(c => ({
    country: c.country,
    hotelsCount: c.count,
    citiesCount: c.cities.size
  })).sort((a, b) => b.hotelsCount - a.hotelsCount);

  // City ranking
  const cityRankings = Array.from(cityMap.values()).map(c => ({
    city: c.city,
    country: c.country,
    count: c.count
  })).sort((a, b) => b.count - a.count);

  const report = {
    totalHotels: allHotels.length,
    totalCities: cityMap.size,
    totalCountries: countryMap.size,
    countryRankings: countryRankings.slice(0, 15),
    topCities: cityRankings.slice(0, 30),
    thinCitiesCount: thinCities.length,
    thinCitiesSample: thinCities.slice(0, 20),
    clonedImagesSummary: {
      totalClonedImageUrls: clonedImages.length,
      totalHotelsAffected: clonedImages.reduce((sum, c) => sum + c.count, 0),
      topClonedImages: clonedImages.slice(0, 15)
    },
    invalidImagesCount: invalidImages.length,
    textPollutionSummary: {
      totalAffectedHotels: textPollution.length,
      samplePollution: textPollution.slice(0, 20)
    },
    nameSpamSummary: {
      totalAffectedHotels: nameSpam.length,
      sampleSpam: nameSpam.slice(0, 25)
    },
    genericPlaceholders: {
      genericRoomCount,
      genericRoomPct: ((genericRoomCount / allHotels.length) * 100).toFixed(1) + '%',
      genericTubCount,
      genericTubPct: ((genericTubCount / allHotels.length) * 100).toFixed(1) + '%'
    },
    monetizationCoverage: {
      missingBookingCount: missingBooking,
      missingBookingPct: ((missingBooking / allHotels.length) * 100).toFixed(1) + '%',
      missingAgodaCount: missingAgoda,
      missingAgodaPct: ((missingAgoda / allHotels.length) * 100).toFixed(1) + '%',
      missingMmtCount: missingMmt,
      singleOtaOnlyCount: singleOtaOnly,
      singleOtaOnlyPct: ((singleOtaOnly / allHotels.length) * 100).toFixed(1) + '%',
      allThreeOtasCount: allThreeOtas,
      allThreeOtasPct: ((allThreeOtas / allHotels.length) * 100).toFixed(1) + '%'
    },
    pricingAuthenticity: {
      missingPriceCount,
      budgetRiskHotelsCount: budgetRiskHotels.length,
      budgetRiskSamples: budgetRiskHotels.slice(0, 15)
    }
  };

  fs.writeFileSync('scratch/global_audit_results.json', JSON.stringify(report, null, 2));
  console.log('✅ Global audit results written to scratch/global_audit_results.json');

  // Print summary to console
  console.log('\n================ GLOBAL AUDIT SUMMARY ================');
  console.log(`📊 Hotels: ${report.totalHotels} across ${report.totalCities} cities in ${report.totalCountries} countries`);
  console.log(`🖼️  Cloned Images: ${report.clonedImagesSummary.totalClonedImageUrls} distinct URLs shared across ${report.clonedImagesSummary.totalHotelsAffected} hotels!`);
  console.log(`🗑️  Scraper Banner Pollution: ${report.textPollutionSummary.totalAffectedHotels} hotels contain MMT/OTA raw banner text!`);
  console.log(`🏷️  OTA Name Spam / Formatting: ${report.nameSpamSummary.totalAffectedHotels} hotels with keyword stuffing or all-caps!`);
  console.log(`📋 Generic Room Types: ${report.genericPlaceholders.genericRoomCount} (${report.genericPlaceholders.genericRoomPct}) say "Deluxe Suite with Bathtub"!`);
  console.log(`🔗 Single OTA Only: ${report.monetizationCoverage.singleOtaOnlyCount} (${report.monetizationCoverage.singleOtaOnlyPct}) only have 1 OTA!`);
  console.log(`⚠️ Budget Tub Risks (< ₹1,200 in India): ${report.pricingAuthenticity.budgetRiskHotelsCount} hotels!`);
  console.log(`📍 Thin Cities (<= 3 hotels): ${report.thinCitiesCount} destinations!`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

auditGlobalInventory().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
