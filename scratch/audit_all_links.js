/**
 * Fast hotel link audit — uses 4s timeout and higher concurrency.
 * Booking.com: check via HEAD (202 = OK)
 * Agoda: check via HEAD (200 = OK, 302 = redirect/stale, 502 = broken)
 * MMT: mark as NEEDS_VERIFY (blocks all bots)
 * 
 * Results written to "Link Audit" tab in Google Sheets.
 */

const mongoose = require('mongoose');
const https = require('https');
const { google } = require('/Users/karanarora/google-search-console-mcp/node_modules/googleapis');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = '1XGjO7pFp8NsgY7uPGUcAqJUuu_cSBMtlSbkAXd9cO7Y';

function checkUrl(url) {
  if (!url || !url.startsWith('http')) return Promise.resolve({ status: 'MISSING' });
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ status: res.statusCode });
    });
    req.on('error', () => resolve({ status: 'ERR' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
    req.end();
  });
}

function label(status, platform) {
  if (platform === 'mmt') return 'NEEDS_VERIFY';
  if (status === 200 || status === 202) return 'OK';
  if (status === 301 || status === 302 || status === 308) return 'REDIRECT';
  if (status === 404) return '404_BROKEN';
  if (status === 502 || status === 503) return 'BROKEN';
  if (status === 403) return 'FORBIDDEN';
  if (status === 'MISSING') return 'MISSING';
  if (status === 'TIMEOUT') return 'TIMEOUT';
  if (status === 'ERR') return 'ERROR';
  return `OTHER_${status}`;
}

// Process in chunks to avoid socket exhaustion
async function checkAll(hotels, concurrency = 15) {
  const results = [];
  for (let i = 0; i < hotels.length; i += concurrency) {
    const chunk = hotels.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(async h => {
      const [booking, agoda] = await Promise.all([
        checkUrl(h.bookingUrl),
        checkUrl(h.agodaUrl),
      ]);
      const bLabel = label(booking.status, 'booking');
      const aLabel = label(agoda.status, 'agoda');
      const overallOk = bLabel === 'OK';  // Booking is source of truth
      return {
        city: h.city || '',
        name: h.name || '',
        mmtUrl: h.url || '',
        mmtStatus: 'NEEDS_VERIFY',
        bookingUrl: h.bookingUrl || '',
        bookingStatus: bLabel,
        agodaUrl: h.agodaUrl || '',
        agodaStatus: aLabel,
        overall: overallOk ? 'OK' : 'NEEDS_FIX',
      };
    }));
    results.push(...chunkResults);
    process.stdout.write(`  Checked ${Math.min(i + concurrency, hotels.length)}/${hotels.length}...\r`);
  }
  return results;
}

async function run() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
  
  const hotels = await Hotel.find({ flagged: { $ne: true } })
    .select('name city country url bookingUrl agodaUrl')
    .lean();
  
  console.log(`📋 ${hotels.length} hotels loaded. Checking Booking.com + Agoda links...`);
  
  const results = await checkAll(hotels);
  console.log('\n✅ All checks complete.');
  
  // Stats
  const broken = results.filter(r => r.overall === 'NEEDS_FIX');
  const agodaBroken = results.filter(r => !['OK', 'NEEDS_VERIFY'].includes(r.agodaStatus));
  const byCity = {};
  broken.forEach(r => { byCity[r.city] = (byCity[r.city] || 0) + 1; });
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total: ${results.length}`);
  console.log(`  Booking OK: ${results.filter(r => r.bookingStatus === 'OK').length}`);
  console.log(`  Agoda OK: ${results.filter(r => r.agodaStatus === 'OK').length}`);
  console.log(`  Agoda broken: ${agodaBroken.length}`);
  console.log(`  Overall NEEDS_FIX (Booking broken): ${broken.length}`);
  
  console.log('\nTop cities needing fixes:');
  Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([c, n]) => {
    console.log(`  ${c}: ${n}`);
  });
  
  // Write to Sheets
  console.log('\n📝 Writing to Google Sheets "Link Audit" tab...');
  const auth = new google.auth.GoogleAuth({
    keyFile: '/Users/karanarora/.config/gcloud/gsc-service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = spreadsheet.data.sheets.map(s => s.properties.title);
  
  if (existing.includes('Link Audit')) {
    const sheetId = spreadsheet.data.sheets.find(s => s.properties.title === 'Link Audit').properties.sheetId;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ deleteSheet: { sheetId } }] }
    });
  }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title: 'Link Audit', index: 1 } } }] }
  });

  const headers = [['City', 'Hotel Name', 'Booking.com URL', 'Booking Status', 'Agoda URL', 'Agoda Status', 'MakeMyTrip URL', 'MMT Status', 'Overall']];
  
  // Sort: NEEDS_FIX first, then by city
  const sorted = [...results].sort((a, b) => {
    if (a.overall !== b.overall) return a.overall === 'NEEDS_FIX' ? -1 : 1;
    return a.city.localeCompare(b.city);
  });

  const rows = sorted.map(r => [r.city, r.name, r.bookingUrl, r.bookingStatus, r.agodaUrl, r.agodaStatus, r.mmtUrl, r.mmtStatus, r.overall]);
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Link Audit!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [...headers, ...rows] }
  });
  
  // Get updated sheet ID for formatting
  const updated = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetId = updated.data.sheets.find(s => s.properties.title === 'Link Audit').properties.sheetId;
  
  const allRows = [...headers, ...rows];
  const formatRequests = [];
  
  // Freeze header + style it
  formatRequests.push({
    updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' }
  });
  formatRequests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 9 },
      cell: { userEnteredFormat: { backgroundColor: { red: 0.118, green: 0.227, blue: 0.541 }, textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } } } },
      fields: 'userEnteredFormat(backgroundColor,textFormat)'
    }
  });
  
  // Color code status cells (cols: 3=booking, 5=agoda, 7=mmt, 8=overall)
  const colorByStatus = (val) => {
    if (val === 'OK') return { red: 0.82, green: 0.94, blue: 0.82 };       // green
    if (val === 'NEEDS_VERIFY') return { red: 1, green: 0.96, blue: 0.8 }; // yellow
    if (val === 'REDIRECT') return { red: 1, green: 0.96, blue: 0.8 };     // yellow
    return { red: 0.96, green: 0.8, blue: 0.8 };                           // red
  };
  
  const statusCols = [3, 5, 7, 8];
  for (let row = 1; row < allRows.length; row++) {
    statusCols.forEach((col) => {
      const val = allRows[row][col];
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { backgroundColor: colorByStatus(val) } },
          fields: 'userEnteredFormat.backgroundColor'
        }
      });
    });
  }
  
  formatRequests.push({ autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 9 } } });
  
  // Sheets API has a limit of 1000 requests per batchUpdate
  for (let i = 0; i < formatRequests.length; i += 900) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: formatRequests.slice(i, i + 900) }
    });
  }

  console.log(`✅ Done! Link Audit tab written to Google Sheets.`);
  console.log(`🔗 https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}#gid=`);
  
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
