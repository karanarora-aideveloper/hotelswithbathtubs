import fs from 'fs';
import path from 'path';

const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');

function runLinkAudit() {
  console.log('🔍 Running Link Integrity & OTA Parameter CI Audit...\n');

  if (!fs.existsSync(cachePath)) {
    console.error('❌ Cache file .cache/all-hotels.json not found!');
    process.exit(1);
  }

  const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  let violations = 0;

  let missingBookingAid = 0;
  let genericBookingSearch = 0;
  let fakeAirbnbSearch = 0;
  let rogueAgodaCid = 0;
  let agodaEnInLocale = 0;
  let agodaPartnersearchHops = 0;
  let mmtSearchInDetail = 0;
  let searchInPrimaryUrl = 0;

  for (const h of hotels) {
    // 1. Booking.com audit (clean URLs per Rule 7.3 / PROMOTE1, or legacy with aid=304142)
    if (h.bookingUrl) {
      if (!h.bookingUrl.includes('/hotel/')) {
        violations++;
      } else if (!h.bookingUrl.includes('aid=304142') && !h.importBatch?.startsWith('PROMOTE')) {
        missingBookingAid++;
        violations++;
      }
      if (h.bookingUrl.includes('searchresults.html')) {
        genericBookingSearch++;
        violations++;
      }
    }

    // 2. Airbnb audit
    if (h.airbnbUrl) {
      if (!h.airbnbUrl.includes('/rooms/') || h.airbnbUrl.includes('/s/')) {
        fakeAirbnbSearch++;
        violations++;
      }
    }

    // 3. Agoda audit
    if (h.agodaUrl) {
      if (h.agodaUrl.includes('cid=1951559')) {
        rogueAgodaCid++;
        violations++;
      }
      if (h.agodaUrl.includes('/en-in/')) {
        agodaEnInLocale++;
        violations++;
      }
      if (h.agodaUrl.includes('partnersearch.aspx')) {
        agodaPartnersearchHops++;
        violations++;
      }
    }

    // 4. MakeMyTrip detail field audit
    if (h.mmtUrl) {
      if (h.mmtUrl.includes('hotel-listing') || h.mmtUrl.includes('searchText=')) {
        mmtSearchInDetail++;
        violations++;
      }
    }

    // 5. Primary url field search audit
    if (h.url) {
      if (h.url.includes('hotel-listing') || h.url.includes('/s/') || h.url.includes('searchresults.html')) {
        searchInPrimaryUrl++;
        violations++;
      }
    }
  }

  console.log(`Audited ${hotels.length} hotels across all inventory:`);
  console.log(`  - Booking.com missing aid=304142: ${missingBookingAid}`);
  console.log(`  - Booking.com generic searchresults: ${genericBookingSearch}`);
  console.log(`  - Airbnb fake search / non-rooms URLs: ${fakeAirbnbSearch}`);
  console.log(`  - Agoda rogue CID (1951559): ${rogueAgodaCid}`);
  console.log(`  - Agoda /en-in/ locale: ${agodaEnInLocale}`);
  console.log(`  - Agoda partnersearch redirect hops: ${agodaPartnersearchHops}`);
  console.log(`  - MakeMyTrip search URLs in mmtUrl: ${mmtSearchInDetail}`);
  console.log(`  - Search URLs in primary url field: ${searchInPrimaryUrl}`);

  if (violations > 0) {
    console.error(`\n❌ FAILED: Found ${violations} link integrity violations!`);
    process.exit(1);
  } else {
    console.log('\n✅ PASSED: 100% Clean! 0 link violations found across entire catalogue.');
  }
}

runLinkAudit();
