const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function fullAuditWithFetch() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
  
  const hotels = await Hotel.find({ flagged: { $ne: true } }).lean();

  const cityCountryPairs = new Map();
  const countrySlugs = new Set();

  hotels.forEach(h => {
    if (h.city && h.country) {
      const citySlug = h.city.toLowerCase().trim().replace(/\s+/g, '-');
      const countrySlug = h.country.toLowerCase().trim().replace(/\s+/g, '-');
      cityCountryPairs.set(`${countrySlug}/${citySlug}`, { city: h.city, country: h.country });
      countrySlugs.add(countrySlug);
    }
  });

  const footerContent = fs.readFileSync('src/components/Footer.tsx', 'utf8');
  const footerMatches = [...footerContent.matchAll(/'([^']+)':\s*'([^']+)'/g)];

  const urlsToTest = new Set([
    'https://www.hotelswithbathtubs.com/',
    'https://www.hotelswithbathtubs.com/about',
    'https://www.hotelswithbathtubs.com/privacy',
    'https://www.hotelswithbathtubs.com/terms',
    'https://www.hotelswithbathtubs.com/affiliate-policy',
    'https://www.hotelswithbathtubs.com/cookies',
    'https://www.hotelswithbathtubs.com/sitemap.xml',
    'https://www.hotelswithbathtubs.com/robots.txt',
    'https://www.hotelswithbathtubs.com/blog',
    'https://www.hotelswithbathtubs.com/india/gwalior'
  ]);

  for (const slugPair of cityCountryPairs.keys()) {
    urlsToTest.add(`https://www.hotelswithbathtubs.com/${slugPair}`);
  }
  for (const c of countrySlugs) {
    urlsToTest.add(`https://www.hotelswithbathtubs.com/${c}`);
  }

  for (const [_, cityName, regionName] of footerMatches) {
    if (regionName === 'International Romantic Escapes' || regionName === 'North India' || regionName === 'South India' || regionName === 'West & Central India' || regionName === 'East & North East') {
      continue;
    }
    const cSlug = cityName.toLowerCase().trim().replace(/\s+/g, '-');
    urlsToTest.add(`https://www.hotelswithbathtubs.com/india/${cSlug}`);
  }

  const list = Array.from(urlsToTest);
  console.log(`Starting complete audit of ${list.length} URLs across the platform...\n`);

  const results = [];
  let done = 0;

  for (let i = 0; i < list.length; i += 10) {
    const chunk = list.slice(i, i + 10);
    const chunkResults = await Promise.all(chunk.map(async (url) => {
      try {
        const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'HotelsWithBathtubs-Auditor/1.0' } });
        return { url, status: res.status };
      } catch (err) {
        return { url, status: 'ERROR', error: err.message };
      }
    }));

    results.push(...chunkResults);
    done += chunkResults.length;
    process.stdout.write(`\rProgress: ${done}/${list.length} checked`);
  }

  console.log('\n\n================ AUDIT REPORT ================');
  const notFound = results.filter(r => r.status === 404);
  const serverErrors = results.filter(r => typeof r.status === 'number' && r.status >= 500);
  const networkErrors = results.filter(r => r.status === 'ERROR');
  const successes = results.filter(r => r.status === 200);

  console.log(`Total URLs Audited: ${results.length}`);
  console.log(`✅ 200 OK: ${successes.length}`);
  console.log(`❌ 404 Not Found: ${notFound.length}`);
  console.log(`🔥 5xx Server Errors: ${serverErrors.length}`);
  console.log(`⚠️ Network Errors: ${networkErrors.length}`);
  console.log(`==============================================`);

  if (notFound.length > 0) {
    console.log('\n🚨 404 Not Found URLs:');
    notFound.forEach(e => console.log(`[404] ${e.url}`));
  } else {
    console.log('\n🎉 ZERO 404s found across all audited URLs!');
  }

  if (serverErrors.length > 0) {
    console.log('\n🚨 500 Server Error URLs:');
    serverErrors.forEach(e => console.log(`[${e.status}] ${e.url}`));
  }

  await mongoose.disconnect();
}

fullAuditWithFetch().catch(console.error);
