#!/usr/bin/env node

/**
 * scripts/data/audit-booking-names.mjs
 *
 * NAME-MATCH-AUDIT1 (CEO Sheet T46)
 * Offline check that every saved Booking.com page we have already saved belongs
 * to the hotel it is linked from. Compares Booking.com page title and address
 * with our hotel name, street address, and town according to the F1 rule.
 *
 * Outputs CSV to data-collect/private/booking-name-audit.csv
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

// 1. Snapshot path
const SNAPSHOT_PATH = path.resolve(REPO_ROOT, '../hotelswithbathtubs-r10/.cache/all-hotels.json');
if (!fs.existsSync(SNAPSHOT_PATH)) {
  console.error(`Missing hotel snapshot: ${SNAPSHOT_PATH}`);
  process.exit(1);
}

// 2. Saved pages directories
const BOOKING_DIRS = [
  path.join(REPO_ROOT, 'data-collect/pages/booking'),
  path.join(REPO_ROOT, 'data-collect/pages/booking-links1'),
  path.join(REPO_ROOT, 'data-collect/pages/booking-links2'),
];

// 3. Output CSV path
const OUTPUT_CSV_PATH = path.join(REPO_ROOT, 'data-collect/private/booking-name-audit.csv');

// Clean and normalize URLs for matching
function cleanUrl(u) {
  if (!u) return '';
  let clean = u.split('?')[0].toLowerCase().trim().replace(/\/$/, '');
  clean = clean.replace(/^http:\/\//, 'https://');
  clean = clean.replace(/^https:\/\/booking\.com/, 'https://www.booking.com');
  return clean;
}

// HTML decoding helper
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean title of typical booking suffixes
function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*\(\s*updated prices.*?\)/i, '')
    .replace(/\s*-\s*updated\s+\d{4}\s+prices.*$/i, '')
    .replace(/\s*-\s*booking\.com.*$/i, '')
    .trim();
}

// Extract street number from address string
function extractStreetNumber(addrStr) {
  if (!addrStr) return null;
  const m = addrStr.trim().match(/^(\d+[\w\-]*)/);
  if (m) return m[1].toLowerCase();
  const m2 = addrStr.match(/\b(\d+)\b/);
  return m2 ? m2[1] : null;
}

// Aliases for town matching across metropolitan and resort regions
const TOWN_ALIASES = {
  'paradise': ['las vegas', 'paradise'],
  'las vegas': ['las vegas', 'paradise', 'north las vegas', 'boulder city', 'henderson'],
  'new york': ['new york', 'new york city', 'brooklyn', 'queens', 'manhattan', 'long island city', 'bronx', 'staten island'],
  'new york city': ['new york', 'new york city', 'brooklyn', 'queens', 'manhattan', 'long island city', 'bronx', 'staten island'],
  'orlando': ['orlando', 'kissimmee', 'lake buena vista', 'celebration', 'winter garden'],
  'san diego': ['san diego', 'poway', 'el cajon', 'otay mesa', 'la jolla', 'coronado', 'chula vista', 'del mar'],
  'portland': ['portland', 'gresham', 'interlachen', 'parkrose', 'beaverton', 'tigard'],
  'miami': ['miami', 'miami beach', 'coral gables', 'doral', 'key biscayne', 'sunny isles beach', 'surfside', 'bal harbour'],
  'los angeles': ['los angeles', 'santa monica', 'west hollywood', 'beverly hills', 'burbank', 'north hollywood', 'hollywood', 'venice', 'playa del rey', 'marina del rey', 'culver city', 'universal city', 'pasadena'],
  'washington': ['washington', 'washington dc', 'georgetown', 'arlington', 'alexandria'],
  'washington dc': ['washington', 'washington dc', 'georgetown', 'arlington', 'alexandria'],
  'san francisco': ['san francisco', 'fisherman\'s wharf', 'south san francisco'],
  'napa': ['napa', 'sonoma', 'st helena', 'calistoga', 'yountville', 'rutherford'],
  'denver': ['denver', 'denver airport area', 'aurora', 'lakewood'],
  'gatlinburg': ['gatlinburg', 'pigeon forge', 'sevierville', 'townsend'],
  'sedona': ['sedona', 'oak creek', 'village of oak creek'],
  'scottsdale': ['scottsdale', 'phoenix', 'paradise valley'],
  'phoenix': ['phoenix', 'scottsdale', 'tempe', 'mesa', 'chandler'],
  'seattle': ['seattle', 'bellevue', 'seatac', 'kirkland', 'redmond'],
  'lake tahoe': ['lake tahoe', 'truckee', 'south lake tahoe', 'incline village', 'tahoe city', 'stateline', 'olympic valley'],
  'poconos': ['poconos', 'lakeville', 'hawley', 'mount pocono', 'east stroudsburg', 'tannersville', 'pocono manor', 'bushkill'],
  'cancun': ['cancun', 'cancún', 'zona hotelera', 'puerto juarez'],
  'playa del carmen': ['playa del carmen', 'playacar', 'riviera maya'],
  'tulum': ['tulum', 'zona hotelera tulum'],
  'mumbai': ['mumbai', 'bombay', 'bandra', 'colaba', 'juhu', 'andheri'],
  'delhi': ['delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida'],
  'new delhi': ['delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida'],
  'bangalore': ['bangalore', 'bengaluru'],
  'bengaluru': ['bangalore', 'bengaluru']
};

function normalizeText(s) {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkTownMatch(ourCity, bookingAddress, bookingLocality, bookingRegion) {
  if (!ourCity) return false;
  const fullBText = normalizeText(`${bookingAddress || ''} ${bookingLocality || ''} ${bookingRegion || ''}`);

  // Handle city strings with state suffixes (e.g. "Newport RI" -> "newport")
  let cleanOurCity = ourCity.toLowerCase().trim();
  const stateMatch = cleanOurCity.match(/^(.+?)\s+([a-z]{2})$/);
  let townOnly = cleanOurCity;
  if (stateMatch) {
    townOnly = stateMatch[1].trim();
  }

  const normTown = normalizeText(townOnly);
  if (normTown && fullBText.includes(normTown)) {
    return true;
  }

  const aliases = TOWN_ALIASES[normTown] || TOWN_ALIASES[cleanOurCity] || [];
  for (const a of aliases) {
    const normA = normalizeText(a);
    if (normA && fullBText.includes(normA)) {
      return true;
    }
  }

  return false;
}

const STOP_WORDS = new Set([
  'hotel', 'hotels', 'resort', 'resorts', 'spa', 'suites', 'suite', 'inn', 'lodge',
  'the', 'a', 'an', 'and', 'in', 'at', 'of', 'by', 'city', 'new', 'york', 'delhi',
  'luxury', 'boutique', 'international', 'collection', 'updated', 'prices'
]);

function getSignificantWords(str, ourCity) {
  const cityWords = new Set(normalizeText(ourCity).split(/\s+/));
  return normalizeText(str)
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w) && !cityWords.has(w));
}

function getWordOverlap(name1, name2, ourCity) {
  const w1 = new Set(getSignificantWords(name1, ourCity));
  const w2 = new Set(getSignificantWords(name2, ourCity));
  if (w1.size === 0 || w2.size === 0) return 0;
  let common = 0;
  for (const w of w1) {
    if (w2.has(w)) common++;
  }
  return common / Math.max(w1.size, w2.size);
}

function normalizeSimple(s) {
  return normalizeText(s).replace(/\s+/g, '');
}

function isSameHotelName(ourName, bName, bTitle, ourCity) {
  const sOur = normalizeSimple(ourName);
  const sBName = normalizeSimple(bName);
  const sBTitle = normalizeSimple(cleanTitle(bTitle));

  if (sOur && (sOur === sBName || sOur === sBTitle)) return true;

  if (sBName && (sOur.includes(sBName) || sBName.includes(sOur))) return true;
  if (sBTitle && (sOur.includes(sBTitle) || sBTitle.includes(sOur))) return true;

  const overlapBName = getWordOverlap(ourName, bName, ourCity);
  const overlapBTitle = getWordOverlap(ourName, cleanTitle(bTitle), ourCity);
  if (overlapBName >= 0.70 || overlapBTitle >= 0.70) return true;

  return false;
}

function parseBookingHtml(html) {
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = decodeHtmlEntities(titleMatch[1]);

  let jsonLd = null;
  const jsonLdMatches = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const m of jsonLdMatches) {
      try {
        const p = JSON.parse(m.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, ''));
        if (p['@type'] === 'Hotel' || p['@type'] === 'LodgingBusiness' || p.address) {
          jsonLd = p;
          break;
        }
      } catch (e) {}
    }
  }

  let bookingName = '';
  let bookingStreet = '';
  let bookingLocality = '';
  let bookingRegion = '';
  let bookingPostal = '';
  let bookingCountry = '';
  let fullAddress = '';

  if (jsonLd) {
    bookingName = decodeHtmlEntities(jsonLd.name || '');
    if (jsonLd.address) {
      if (typeof jsonLd.address === 'object') {
        bookingStreet = decodeHtmlEntities(jsonLd.address.streetAddress || '');
        bookingLocality = decodeHtmlEntities(jsonLd.address.addressLocality || '');
        bookingRegion = decodeHtmlEntities(jsonLd.address.addressRegion || '');
        bookingPostal = decodeHtmlEntities(jsonLd.address.postalCode || '');
        bookingCountry = decodeHtmlEntities(jsonLd.address.addressCountry || '');
      } else if (typeof jsonLd.address === 'string') {
        fullAddress = decodeHtmlEntities(jsonLd.address);
      }
    }
  }

  if (!fullAddress) {
    fullAddress = bookingStreet;
  }

  return {
    title,
    bookingName,
    bookingStreet,
    bookingLocality,
    bookingRegion,
    bookingPostal,
    bookingCountry,
    fullAddress,
  };
}

function escapeCsvField(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  console.log('Loading hotels snapshot...');
  const hotels = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  console.log(`Loaded ${hotels.length} hotels from snapshot.`);

  console.log('Indexing saved Booking.com HTML pages...');
  const savedByUrl = new Map();
  for (const d of BOOKING_DIRS) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d);
    for (const f of files) {
      if (!f.endsWith('.meta.json')) continue;
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
        if (meta.status !== 200) continue;
        const u = cleanUrl(meta.url);
        if (!u) continue;
        const baseName = f.slice(0, -'.meta.json'.length);
        const gz = path.join(d, `${baseName}.html.gz`);
        const h = path.join(d, `${baseName}.html`);
        const htmlFile = fs.existsSync(gz) ? gz : (fs.existsSync(h) ? h : null);
        if (htmlFile) {
          savedByUrl.set(u, htmlFile);
        }
      } catch (err) {}
    }
  }
  console.log(`Indexed ${savedByUrl.size} unique saved 200 URLs.`);

  const statusCounts = { same: 0, renamed: 0, mismatch: 0, no_saved_page: 0 };
  const rows = [];
  const mismatches = [];
  const renameds = [];

  for (const h of hotels) {
    const bu = cleanUrl(h.bookingUrl);
    const u = cleanUrl(h.url);
    const ourUrl = (bu && bu.includes('booking.com')) ? bu : ((u && u.includes('booking.com')) ? u : '');

    let bTitle = '';
    let bAddr = '';
    let status = '';
    let reason = '';

    if (!ourUrl || !savedByUrl.has(ourUrl)) {
      status = 'no_saved_page';
      reason = 'no_saved_page';
    } else {
      const file = savedByUrl.get(ourUrl);
      const raw = file.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file);
      const parsed = parseBookingHtml(raw.toString('utf8'));
      bTitle = parsed.title;
      bAddr = parsed.fullAddress;

      // Check for challenge page or missing address
      if (!parsed.fullAddress && !parsed.bookingName && parsed.title.includes('booking.com')) {
        status = 'mismatch';
        reason = 'challenge_page_no_address';
      } else {
        const num1 = extractStreetNumber(h.streetAddress);
        const num2 = extractStreetNumber(parsed.fullAddress || parsed.bookingLocality);
        const tMatch = checkTownMatch(h.city, parsed.fullAddress, parsed.bookingLocality, parsed.bookingRegion);
        const nameSame = isSameHotelName(h.name, parsed.bookingName, parsed.title, h.city);

        if (!tMatch) {
          status = 'mismatch';
          reason = `town_mismatch: our "${h.city}" not in Booking address`;
        } else if (num1 && num2 && num1 !== num2) {
          status = 'mismatch';
          reason = `street_number_mismatch: ${num1} vs ${num2}`;
        } else if (nameSame) {
          status = 'same';
          reason = 'name_and_town_match';
        } else if (num1 && num2 && num1 === num2) {
          status = 'renamed';
          reason = `renamed_same_street_num_${num1}`;
        } else {
          // No street number on one or both sides
          const overlap = Math.max(
            getWordOverlap(h.name, parsed.bookingName, h.city),
            getWordOverlap(h.name, cleanTitle(parsed.title), h.city)
          );
          if (overlap >= 0.50) {
            status = 'renamed';
            reason = `renamed_partial_overlap_${overlap.toFixed(2)}`;
          } else {
            status = 'mismatch';
            reason = 'name_mismatch_without_street_number_match';
          }
        }
      }
    }

    statusCounts[status]++;
    const row = {
      hotelId: h._id,
      ourName: h.name,
      ourStreet: h.streetAddress || '',
      ourTown: h.city || '',
      bTitle,
      bAddr,
      ourUrl: h.bookingUrl || (h.url && h.url.includes('booking.com') ? h.url : ''),
      status,
      reason,
    };
    rows.push(row);

    if (status === 'mismatch') mismatches.push(row);
    if (status === 'renamed') renameds.push(row);
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_CSV_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write CSV
  const header = ['hotel id', 'our name', 'our street', 'our town', 'Booking title', 'Booking address', 'our URL', 'status', 'reason'];
  const csvLines = [header.join(',')];
  for (const r of rows) {
    csvLines.push([
      escapeCsvField(r.hotelId),
      escapeCsvField(r.ourName),
      escapeCsvField(r.ourStreet),
      escapeCsvField(r.ourTown),
      escapeCsvField(r.bTitle),
      escapeCsvField(r.bAddr),
      escapeCsvField(r.ourUrl),
      escapeCsvField(r.status),
      escapeCsvField(r.reason),
    ].join(','));
  }
  fs.writeFileSync(OUTPUT_CSV_PATH, csvLines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${rows.length} rows to ${OUTPUT_CSV_PATH}\n`);

  // Definition of done output
  console.log('=== DEFINITION OF DONE 1: Totals by status ===');
  console.log(`same: ${statusCounts.same}`);
  console.log(`renamed: ${statusCounts.renamed}`);
  console.log(`mismatch: ${statusCounts.mismatch}`);
  console.log(`no_saved_page: ${statusCounts.no_saved_page}`);
  console.log(`total: ${rows.length}\n`);

  console.log(`=== DEFINITION OF DONE 2: All mismatch rows (Count: ${mismatches.length}) ===`);
  for (const m of mismatches) {
    console.log(`ID: ${m.hotelId} | Name: "${m.ourName}" | Street: "${m.ourStreet}" | Town: "${m.ourTown}" | Booking Title: "${m.bTitle}" | Booking Address: "${m.bAddr}" | Reason: ${m.reason} | URL: ${m.ourUrl}`);
  }
  console.log('');

  console.log('=== DEFINITION OF DONE 3: 10 random renamed rows ===');
  // Deterministic random selection for reproducibility (sample 10)
  const sampledRenamed = [...renameds].sort((a, b) => a.hotelId.localeCompare(b.hotelId));
  const step = Math.floor(sampledRenamed.length / 10) || 1;
  const picked = [];
  for (let i = 0; i < sampledRenamed.length && picked.length < 10; i += step) {
    picked.push(sampledRenamed[i]);
  }
  for (const r of picked) {
    console.log(`ID: ${r.hotelId} | Name: "${r.ourName}" | Street: "${r.ourStreet}" | Town: "${r.ourTown}" | Booking Title: "${r.bTitle}" | Booking Address: "${r.bAddr}" | Reason: ${r.reason} | URL: ${r.ourUrl}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
