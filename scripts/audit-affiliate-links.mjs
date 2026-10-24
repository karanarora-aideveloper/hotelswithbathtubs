import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');

// Parse CLI arguments
const args = process.argv.slice(2);
const isFull = args.includes('--full');
const isCi = args.includes('--ci');
const sampleArgIdx = args.indexOf('--sample');
const sampleSize = sampleArgIdx !== -1 ? parseInt(args[sampleArgIdx + 1], 10) : (isCi ? 25 : (isFull ? 0 : 50));
const platformFilterIdx = args.indexOf('--platform');
const platformFilter = platformFilterIdx !== -1 ? args[platformFilterIdx + 1].toLowerCase() : null;

function getRegion(country) {
  const c = (country || '').toLowerCase().trim();
  if (c === 'united states' || c === 'usa') return 'USA';
  if (c === 'india') return 'India';
  if (c === 'united kingdom' || c === 'uk') return 'UK';
  const eu = ['france', 'italy', 'spain', 'germany', 'netherlands', 'switzerland', 'greece', 'austria', 'portugal'];
  if (eu.includes(c)) return 'EU';
  return 'Global';
}

function classifyUrl(platform, initialUrl, finalUrl = '', title = '', status = 200, bodyText = '') {
  const init = (initialUrl || '').toLowerCase();
  const fin = (finalUrl || '').toLowerCase();

  // 1. Not Found / Error
  if (status === 404 || status === 410 || fin.includes('pagenotfound')) {
    return 'not-found';
  }
  if (status >= 500) {
    return 'error';
  }

  // 2. Booking.com
  if (platform === 'booking') {
    if (!initialUrl.includes('aid=304142')) return 'wrong-params';
    // Dead slug redirects to city page or closed_msg in title/URL
    if (
      fin.includes('/city/') ||
      fin.includes('dest_type=city') ||
      fin.includes('searchresults.html') ||
      fin.includes('closed_msg') ||
      title.includes('closed_msg') ||
      title.includes('10 Best') ||
      title.includes('Search hotels in')
    ) {
      return 'search-page';
    }
    if (fin.includes('/hotel/') || (!fin && init.includes('/hotel/') && !init.includes('searchresults'))) {
      return 'property-page';
    }
    return 'search-page';
  }

  // 3. Agoda
  if (platform === 'agoda') {
    if (init.includes('cid=1951559')) return 'wrong-params';
    if (init.includes('/en-in/')) return 'wrong-locale';
    if (fin.includes('/pagenotfound.html')) return 'not-found';
    if (fin === 'https://www.agoda.com/' || fin.startsWith('https://www.agoda.com/?ds=')) return 'search-page';
    if (init.includes('hid=') || init.includes('selectedproperty=') || init.includes('/hotel/')) {
      return 'property-page';
    }
    return 'search-page';
  }

  // 4. Trip.com
  if (platform === 'trip') {
    if (init.includes('/hotels/list') || init.includes('keyword=')) return 'search-page';
    if (init.includes('/hotels/detail')) return 'property-page';
    return 'search-page';
  }

  // 5. Airbnb
  if (platform === 'airbnb') {
    if (init.includes('/s/') || init.includes('/homes') || init.includes('query=')) return 'search-page';
    if (init.includes('/rooms/')) return 'property-page';
    return 'search-page';
  }

  // 6. MakeMyTrip
  if (platform === 'mmt') {
    if (init.includes('hotel-listing') || init.includes('searchText=')) return 'search-page';
    if (init.includes('hotel-details') || init.includes('hotelid=') || init.includes('-details-')) return 'property-page';
    return 'search-page';
  }

  // 7. Expedia / Hotels.com / Vrbo
  if (platform === 'expedia' || platform === 'hotelscom' || platform === 'vrbo') {
    if (init.includes('/hotel/') || init.includes('/p') || init.includes('/unit/') || init.includes('.h')) return 'property-page';
    return 'search-page';
  }

  return 'property-page';
}

async function auditAffiliateLinks() {
  console.log('🚀 Phase 1: Outbound Link Integrity & Verification Pipeline');
  console.log(`Mode: ${isFull ? 'FULL CATALOGUE' : `SAMPLE (size: ${sampleSize})`}`);
  if (platformFilter) console.log(`Platform filter: ${platformFilter}`);

  if (!fs.existsSync(cachePath)) {
    console.error(`❌ Cache file not found at ${cachePath}`);
    process.exit(1);
  }

  const allHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  console.log(`Loaded ${allHotels.length} total hotels from cache.\n`);

  // Extract all outbound links to audit
  const linksToAudit = [];

  for (const h of allHotels) {
    const region = getRegion(h.country);

    if (h.bookingUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'booking', url: h.bookingUrl });
    if (h.agodaUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'agoda', url: h.agodaUrl });
    if (h.tripUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'trip', url: h.tripUrl });
    if (h.airbnbUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'airbnb', url: h.airbnbUrl });
    if (h.mmtUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'mmt', url: h.mmtUrl });
    if (h.expediaUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'expedia', url: h.expediaUrl });
    if (h.hotelsComUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'hotelscom', url: h.hotelsComUrl });
    if (h.vrboUrl) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'vrbo', url: h.vrboUrl });
    if (h.url) linksToAudit.push({ hotelName: h.name, city: h.city, country: h.country, region, platform: 'legacy_url', url: h.url });
  }

  let filtered = linksToAudit;
  if (platformFilter) {
    filtered = filtered.filter(l => l.platform === platformFilter);
  }

  // Apply sampling if not in --full mode
  let targetLinks = filtered;
  if (sampleSize > 0 && targetLinks.length > sampleSize) {
    const sampledByPlatform = {};
    for (const item of filtered) {
      if (!sampledByPlatform[item.platform]) sampledByPlatform[item.platform] = [];
      if (sampledByPlatform[item.platform].length < sampleSize) {
        sampledByPlatform[item.platform].push(item);
      }
    }
    targetLinks = Object.values(sampledByPlatform).flat();
  }

  console.log(`Auditing ${targetLinks.length} target link entries...\n`);

  // Audit results container
  const auditResults = [];
  const matrix = {}; // platform -> classification -> count
  const regionMatrix = {}; // region -> classification -> count

  for (const item of targetLinks) {
    // Quick classification based on patterns & known signatures
    const classification = classifyUrl(item.platform, item.url);

    auditResults.push({
      hotelName: item.hotelName,
      city: item.city,
      country: item.country,
      region: item.region,
      platform: item.platform,
      url: item.url,
      classification,
    });

    // Update Platform Matrix
    if (!matrix[item.platform]) matrix[item.platform] = {};
    matrix[item.platform][classification] = (matrix[item.platform][classification] || 0) + 1;

    // Update Region Matrix
    if (!regionMatrix[item.region]) regionMatrix[item.region] = {};
    regionMatrix[item.region][classification] = (regionMatrix[item.region][classification] || 0) + 1;
  }

  // Print Summary Table
  console.log('═'.repeat(75));
  console.log('📊 AUDIT SUMMARY BY PLATFORM');
  console.log('═'.repeat(75));
  console.table(matrix);

  console.log('\n' + '═'.repeat(75));
  console.log('🌍 AUDIT SUMMARY BY REGION');
  console.log('═'.repeat(75));
  console.table(regionMatrix);

  // Write JSON report
  const jsonReportPath = path.join(rootDir, '.cache', 'audit-affiliate-links-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(auditResults, null, 2), 'utf8');
  console.log(`\n💾 Saved JSON audit report to: ${jsonReportPath}`);

  // Write CSV report
  const csvReportPath = path.join(rootDir, '.cache', 'audit-affiliate-links-report.csv');
  const csvHeader = 'Hotel Name,City,Country,Region,Platform,Classification,URL\n';
  const csvRows = auditResults.map(r => `"${(r.hotelName || '').replace(/"/g, '""')}","${r.city}","${r.country}","${r.region}","${r.platform}","${r.classification}","${r.url}"`).join('\n');
  fs.writeFileSync(csvReportPath, csvHeader + csvRows, 'utf8');
  console.log(`💾 Saved CSV audit report to: ${csvReportPath}`);

  // CI Assertions
  const searchPageViolations = auditResults.filter(r => r.classification === 'search-page');
  const wrongParamViolations = auditResults.filter(r => r.classification === 'wrong-params');
  const notFoundViolations = auditResults.filter(r => r.classification === 'not-found');

  console.log('\n🔍 Integrity Verification:');
  console.log(`  - Search Page URLs used in detail fields: ${searchPageViolations.length}`);
  console.log(`  - Missing / Incorrect Affiliate Parameters: ${wrongParamViolations.length}`);
  console.log(`  - Dead / 404 / Delisted Properties: ${notFoundViolations.length}`);

  if (isCi && searchPageViolations.length > 0) {
    console.error(`\n❌ CI FAILURE: Found ${searchPageViolations.length} search-page URLs in active booking fields!`);
    process.exit(1);
  }

  return auditResults;
}

auditAffiliateLinks().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
