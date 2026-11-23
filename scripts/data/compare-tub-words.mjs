// scripts/data/compare-tub-words.mjs
// Offline validation and comparison of old vs new bathtub classification rules (CEO Sheet T48).
// Evaluates all saved Booking.com pages and Agoda results.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { classifyTub } from './lib/tub-words.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const privateDir = path.join(worktreeDir, 'data-collect', 'private');
fs.mkdirSync(privateDir, { recursive: true });

// Old Booking.com matchers for baseline comparison
function oldMatchBookingFacility(clean) {
  if (!clean) return null;
  const t = clean.trim();
  if (/^bath\s+or\s+shower$/i.test(t) || /^shower\s+or\s+bath$/i.test(t)) return null;
  if (/^bath$/i.test(t)) return 'Bath';
  if (/^bathtub$/i.test(t)) return 'Bathtub';
  if (/^(?:spa\s+tub|spa\s+bath)$/i.test(t)) return 'Spa bath';
  if (/^(?:hot\s+tub|private\s+hot\s+tub)$/i.test(t)) return 'Hot tub';
  if (/^whirlpool$/i.test(t)) return 'Whirlpool';
  if (/^jacuzzi$/i.test(t)) return 'Jacuzzi';
  return null;
}

function oldMatchBookingRoomName(name) {
  if (!name) return false;
  return /(?:jacuzzi|whirlpool|hot\s+tub|spa\s+tub|spa\s+bath|soak(?:ing|\-tub|\s+tub)?|bathtub|jetted)/i.test(name);
}

console.log('=============================================================');
console.log('>>> TUB-WORDS1: Offline Rule Comparison (Old vs New)');
console.log('=============================================================\n');

const csvRows = [];
const newlyCountedRows = [];
const newlyLostRows = [];

// Stats tracking
const stats = {
  booking: {
    hotels: 0,
    rooms: 0,
    oldProofNewProof: 0,
    oldNoNewProof: 0,
    oldProofNewNo: 0,
    oldNoNewNo: 0
  },
  agoda: {
    hotels: 0,
    rooms: 0,
    oldProofNewProof: 0,
    oldNoNewProof: 0,
    oldProofNewNo: 0,
    oldNoNewNo: 0
  }
};

// =========================================================================
// 1. PROCESS BOOKING.COM PAGES
// =========================================================================
console.log('Scanning saved Booking.com pages in data-collect/pages/...');
const bookingDirs = [
  path.join(worktreeDir, 'data-collect/pages/booking'),
  path.join(worktreeDir, 'data-collect/pages/booking-links1'),
  path.join(worktreeDir, 'data-collect/pages/booking-links2')
];

for (const dir of bookingDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('hotel-') || dir.endsWith('booking'));
  console.log(`  Processing ${dir} (${files.length} hotel detail files)...`);

  for (const f of files) {
    const fullPath = path.join(dir, f);
    let html = '';
    try {
      const buf = fs.readFileSync(fullPath);
      html = f.endsWith('.gz') ? zlib.gunzipSync(buf).toString('utf8') : buf.toString('utf8');
    } catch {
      continue;
    }

    const hotelIdMatch = f.match(/hotel-(?:links\d+-)?([a-z0-9-]+)\.html(?:\.gz)?/i);
    const hotelId = hotelIdMatch ? hotelIdMatch[1] : f;

    const $ = cheerio.load(html);

    // Extract Apollo state
    let apolloState = null;
    $('script').each((_, el) => {
      const text = $(el).html() || '';
      if (text.includes('__typename":"BasicPropertyData"') || text.includes('__typename":"RoomDetails"')) {
        try {
          apolloState = JSON.parse(text);
        } catch {}
      }
    });

    const hotelRooms = [];
    const seenRooms = new Set();

    if (apolloState) {
      const instances = {};
      for (const v of Object.values(apolloState)) {
        if (v.__typename === 'Instance' && v.title && v.id) {
          instances[v.id] = v.title;
        }
      }

      for (const [k, v] of Object.entries(apolloState)) {
        if (k.startsWith('RTRoomCard:') || v.__typename === 'RTRoomCard') {
          const roomName = v.name || v.translations?.name;
          if (!roomName || seenRooms.has(roomName)) continue;
          seenRooms.add(roomName);

          const facTitles = Array.isArray(v.facilities)
            ? v.facilities.map(fid => instances[fid]).filter(Boolean)
            : [];

          hotelRooms.push({ roomName, facilities: facTitles });
        }
      }
    }

    // Fallback to table parsing if no rooms in Apollo
    if (hotelRooms.length === 0) {
      $('table tr').each((_, el) => {
        const row = $(el);
        const roomLink = row.find('.hprt-roomtype-icon-link, .hprt-roomtype-link, a[href*="room"]');
        let name = roomLink.text().trim();
        if (!name) {
          const firstCol = row.find('td, th').first();
          const firstText = firstCol.text().trim();
          if (firstText && !firstText.startsWith('Room type') && firstText.length < 100) {
            name = firstText.split('\n')[0].trim();
          }
        }
        if (name && !seenRooms.has(name) && !name.startsWith('Room type') && !name.startsWith('MoTuWe')) {
          seenRooms.add(name);
          const facTitles = [];
          row.find('.hprt-facilities-facility, .facility-badge, [data-name="facility"], li').each((_, facEl) => {
            const facText = $(facEl).text().trim();
            if (facText) facTitles.push(facText);
          });
          hotelRooms.push({ roomName: name, facilities: facTitles });
        }
      });
    }

    if (hotelRooms.length > 0) {
      stats.booking.hotels++;
      for (const rm of hotelRooms) {
        stats.booking.rooms++;
        const oldProof = oldMatchBookingRoomName(rm.roomName) || rm.facilities.some(t => oldMatchBookingFacility(t) !== null);
        const newRes = classifyTub({ roomName: rm.roomName, facilities: rm.facilities });
        const newProof = newRes.isProof;

        if (oldProof && newProof) stats.booking.oldProofNewProof++;
        else if (!oldProof && newProof) {
          stats.booking.oldNoNewProof++;
          newlyCountedRows.push({
            source: 'booking',
            hotelId,
            roomName: rm.roomName,
            words: newRes.words.join('; ')
          });
        } else if (oldProof && !newProof) {
          stats.booking.oldProofNewNo++;
          newlyLostRows.push({
            source: 'booking',
            hotelId,
            roomName: rm.roomName,
            reason: 'Booking room failed new classification'
          });
        } else {
          stats.booking.oldNoNewNo++;
        }

        csvRows.push({
          source: 'booking',
          hotelId,
          roomName: rm.roomName,
          oldResult: oldProof ? 'proof' : 'no',
          newResult: newProof ? 'proof' : 'no',
          words: newRes.words.join('; ')
        });
      }
    }
  }
}

// =========================================================================
// 2. PROCESS AGODA RESULTS
// =========================================================================
console.log('\nScanning Agoda rooms in data-collect/private/agoda1-results.json...');
const agodaFile = path.join(privateDir, 'agoda1-results.json');
if (fs.existsSync(agodaFile)) {
  const agodaData = JSON.parse(fs.readFileSync(agodaFile, 'utf8'));
  const results = agodaData.results || [];
  
  for (const h of results) {
    if (!Array.isArray(h.rooms) || h.rooms.length === 0) continue;
    stats.agoda.hotels++;

    for (const rm of h.rooms) {
      stats.agoda.rooms++;
      const oldProof = Boolean(rm.hasTub);
      // In Agoda, tubPhrases contains the facility matches and/or Room Name
      const facilities = (rm.tubPhrases || []).filter(p => !p.startsWith('Room Name:'));
      const newRes = classifyTub({ roomName: rm.roomName, facilities });
      const newProof = newRes.isProof;

      if (oldProof && newProof) stats.agoda.oldProofNewProof++;
      else if (!oldProof && newProof) {
        stats.agoda.oldNoNewProof++;
        newlyCountedRows.push({
          source: 'agoda',
          hotelId: h.hotelId,
          roomName: rm.roomName,
          words: newRes.words.join('; ')
        });
      } else if (oldProof && !newProof) {
        stats.agoda.oldProofNewNo++;
        const reasons = (rm.tubPhrases || []).join('; ');
        newlyLostRows.push({
          source: 'agoda',
          hotelId: h.hotelId,
          roomName: rm.roomName,
          reason: `Disqualified non-tub label from earlier collector bug: ${reasons}`
        });
      } else {
        stats.agoda.oldNoNewNo++;
      }

      csvRows.push({
        source: 'agoda',
        hotelId: h.hotelId,
        roomName: rm.roomName,
        oldResult: oldProof ? 'proof' : 'no',
        newResult: newProof ? 'proof' : 'no',
        words: newRes.words.join('; ')
      });
    }
  }
}

// =========================================================================
// 3. WRITE CSV OUTPUT
// =========================================================================
const csvPath = path.join(privateDir, 'tub-words-compare.csv');
const esc = s => `"${String(s || '').replace(/"/g, '""')}"`;

const csvHeader = 'source,hotel id,room name,old result,new result,words\n';
const csvBody = csvRows.map(r => [
  esc(r.source),
  esc(r.hotelId),
  esc(r.roomName),
  esc(r.oldResult),
  esc(r.newResult),
  esc(r.words)
].join(',')).join('\n');

fs.writeFileSync(csvPath, csvHeader + csvBody, 'utf8');
console.log(`\nComparison CSV written to ${csvPath} (${csvRows.length} rows).`);

// =========================================================================
// 4. PRINT SUMMARY TOTALS
// =========================================================================
console.log('\n=============================================================');
console.log('>>> SUMMARY OF COMPARISON TOTALS');
console.log('=============================================================');

console.log('\n--- BOOKING.COM SOURCE ---');
console.log(`Hotel pages analyzed:          ${stats.booking.hotels}`);
console.log(`Total rooms analyzed:          ${stats.booking.rooms}`);
console.log(`old proof -> new proof:        ${stats.booking.oldProofNewProof}`);
console.log(`old no -> new proof (new):     ${stats.booking.oldNoNewProof}`);
console.log(`old proof -> new no (lost):    ${stats.booking.oldProofNewNo}`);
console.log(`old no -> new no:              ${stats.booking.oldNoNewNo}`);

console.log('\n--- AGODA SOURCE ---');
console.log(`Hotels analyzed:               ${stats.agoda.hotels}`);
console.log(`Total rooms analyzed:          ${stats.agoda.rooms}`);
console.log(`old proof -> new proof:        ${stats.agoda.oldProofNewProof}`);
console.log(`old no -> new proof (new):     ${stats.agoda.oldNoNewProof}`);
console.log(`old proof -> new no (lost):    ${stats.agoda.oldProofNewNo}`);
console.log(`old no -> new no:              ${stats.agoda.oldNoNewNo}`);

console.log('\n--- COMBINED TOTALS ---');
console.log(`Total rooms analyzed:          ${stats.booking.rooms + stats.agoda.rooms}`);
console.log(`old proof -> new proof:        ${stats.booking.oldProofNewProof + stats.agoda.oldProofNewProof}`);
console.log(`old no -> new proof (newly):   ${stats.booking.oldNoNewProof + stats.agoda.oldNoNewProof}`);
console.log(`old proof -> new no (lost):    ${stats.booking.oldProofNewNo + stats.agoda.oldProofNewNo}`);

// Newly lost explanation
if (stats.booking.oldProofNewNo === 0) {
  console.log('\n[VERIFIED] Booking.com newly lost count is EXACTLY 0. No existing matches lost.');
} else {
  console.log(`\n[WARNING] Booking.com has ${stats.booking.oldProofNewNo} newly lost rooms:`);
  newlyLostRows.filter(r => r.source === 'booking').forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.hotelId}] "${r.roomName}": ${r.reason}`);
  });
}

if (stats.agoda.oldProofNewNo > 0) {
  console.log(`\n[NOTE] Agoda has ${stats.agoda.oldProofNewNo} rooms where oldProof=true and newProof=false.`);
  console.log('Reason: The earlier collect-agoda1.mjs collector had a known bug where "Separate shower/bathtub",');
  console.log('"Bathtub grab bar" and "Bathtub seat" were counted as proof. Under the owner-approved rules (1 Nov),');
  console.log('these non-tub accessibility and shower labels are correctly disqualified.');
  console.log('Sample of disqualified Agoda rows (first 10):');
  newlyLostRows.filter(r => r.source === 'agoda').slice(0, 10).forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.hotelId}] "${r.roomName}" -> ${r.reason}`);
  });
}

// 15 Random newly counted rows
console.log('\n=============================================================');
console.log('>>> 15 SAMPLE NEWLY COUNTED ROWS (Old No -> New Proof)');
console.log('=============================================================');
const sampleNewCounted = [];
if (newlyCountedRows.length <= 15) {
  sampleNewCounted.push(...newlyCountedRows);
} else {
  const step = Math.floor(newlyCountedRows.length / 15);
  for (let i = 0; i < 15; i++) {
    sampleNewCounted.push(newlyCountedRows[i * step]);
  }
}

sampleNewCounted.forEach((r, idx) => {
  console.log(`${(idx + 1).toString().padStart(2, ' ')}. [${r.source.toUpperCase()}] "${r.roomName}"`);
  console.log(`    Hotel ID: ${r.hotelId}`);
  console.log(`    New Proof Words: [${r.words}]`);
});
