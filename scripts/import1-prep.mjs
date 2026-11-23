#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Input paths: everything lives in the main repo checkout (data-collect/ is gitignored there)
const REPO_ROOT = process.env.HWB_REPO_ROOT || '/Users/karanarora/my_brain/01_startups/hotelswithbathtubs';
const TUBHOTELS_PATH = path.join(REPO_ROOT, 'web_pages/tubhotels/all-extracted-hotels.json');
const OUR_HOTELS_PATH = path.join(REPO_ROOT, '.cache/all-hotels.json');
const BASE_DIR = REPO_ROOT;
const PRIVATE_DIR = path.join(BASE_DIR, 'data-collect/private');
const REPORT_PATH = path.join(BASE_DIR, 'data-collect/import1-report.md');

// Ensure output directories exist
if (!fs.existsSync(PRIVATE_DIR)) {
  fs.mkdirSync(PRIVATE_DIR, { recursive: true });
}

console.log('Loading input datasets...');
const rawTubHotels = JSON.parse(fs.readFileSync(TUBHOTELS_PATH, 'utf8'));
const allOurHotels = JSON.parse(fs.readFileSync(OUR_HOTELS_PATH, 'utf8'));

// Count countries in raw TubHotels data
const countryCounts = {};
for (const h of rawTubHotels) {
  const c = h.address?.country || 'UNKNOWN';
  countryCounts[c] = (countryCounts[c] || 0) + 1;
}

const rawUsHotels = rawTubHotels.filter(h => h.address?.country === 'US');
const ourUsHotels = allOurHotels.filter(x => 
  (x.countrySlug || '').toLowerCase() === 'usa' || 
  (x.country || '').toLowerCase() === 'united states' || 
  (x.country || '').toLowerCase() === 'usa'
);

console.log(`Raw TubHotels records: ${rawTubHotels.length} (US: ${rawUsHotels.length}, CA: ${countryCounts.CA || 0}, GB: ${countryCounts.GB || 0}, ES: ${countryCounts.ES || 0})`);
console.log(`Our current US hotels: ${ourUsHotels.length}`);

// T1. Clean and de-duplicate
function normName(n) {
  return (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normStreet(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getDedupKey(h) {
  const n = normName(h.name);
  const st = normStreet(h.address?.street);
  if (st) {
    return `${n}::street:${st}`;
  }
  if (h.geo && h.geo.lat != null && h.geo.lng != null && !isNaN(h.geo.lat) && !isNaN(h.geo.lng)) {
    return `${n}::geo:${Number(h.geo.lat).toFixed(4)},${Number(h.geo.lng).toFixed(4)}`;
  }
  const loc = normName(h.address?.locality);
  const reg = normName(h.address?.region);
  return `${n}::loc:${loc}_${reg}`;
}

const dedupMap = new Map();
let duplicatesCount = 0;

for (const raw of rawUsHotels) {
  const k = getDedupKey(raw);
  const sourceUrl = `https://www.tubhotels.com/${raw.destinationSlug}/`;
  
  // Extract strictly allowed fields
  const cleanRecord = {
    name: raw.name || '',
    brand: raw.brand || '',
    stars: raw.stars || null,
    address: {
      street: raw.address?.street || '',
      locality: raw.address?.locality || '',
      region: raw.address?.region || '',
      country: raw.address?.country || 'US',
      formatted: raw.address?.formatted || ''
    },
    geo: (raw.geo && raw.geo.lat != null && raw.geo.lng != null && !isNaN(raw.geo.lat) && !isNaN(raw.geo.lng))
      ? { lat: Number(raw.geo.lat), lng: Number(raw.geo.lng) }
      : null,
    tubPlacement: raw.tubPlacement || '',
    tubPlacementLabel: raw.tubPlacementLabel || '',
    verifiedRoomName: raw.verifiedRoomName || '',
    roomMeta: raw.roomMeta || '',
    sourceUrl,
    destinationSlug: raw.destinationSlug || '',
    destinationName: raw.destinationName || '',
    variants: []
  };

  if (!dedupMap.has(k)) {
    dedupMap.set(k, cleanRecord);
  } else {
    duplicatesCount++;
    const existing = dedupMap.get(k);
    
    // Check if duplicate disagrees on room name or tub placement
    const existingRoom = (existing.verifiedRoomName || '').trim();
    const existingTub = (existing.tubPlacement || '').trim();
    const newRoom = (raw.verifiedRoomName || '').trim();
    const newTub = (raw.tubPlacement || '').trim();

    if (newRoom || newTub) {
      if (newRoom !== existingRoom || newTub !== existingTub) {
        const isAlreadyVariant = existing.variants.some(v => 
          (v.verifiedRoomName || '').trim() === newRoom && 
          (v.tubPlacement || '').trim() === newTub
        );
        if (!isAlreadyVariant) {
          existing.variants.push({
            verifiedRoomName: cleanRecord.verifiedRoomName,
            roomMeta: cleanRecord.roomMeta,
            tubPlacement: cleanRecord.tubPlacement,
            tubPlacementLabel: cleanRecord.tubPlacementLabel,
            sourceUrl: cleanRecord.sourceUrl
          });
        }
      }
    }

    if (!existingRoom && newRoom) {
      existing.verifiedRoomName = cleanRecord.verifiedRoomName;
      existing.roomMeta = cleanRecord.roomMeta;
    }
    if (!existing.geo && cleanRecord.geo) {
      existing.geo = cleanRecord.geo;
    }
    if (!existing.address.street && cleanRecord.address.street) {
      existing.address.street = cleanRecord.address.street;
      existing.address.formatted = cleanRecord.address.formatted;
    }
  }
}

const uniqueUsHotels = Array.from(dedupMap.values());
console.log(`Deduplicated: ${uniqueUsHotels.length} unique US hotels (merged ${duplicatesCount} duplicates)`);

// B1: Extract Town and State from address facts, drop non-US records
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC'
]);

const US_STATE_NAMES = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
  'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
  'wisconsin', 'wyoming', 'district of columbia'
]);

const CA_PROVINCES = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']);
const UK_POSTCODE_REGEX = /\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})\b/i;

function extractTownAndState(h) {
  const fmt = (h.address?.formatted || '').trim();
  let state = null;
  let town = '';

  if (fmt) {
    const parts = fmt.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const m1 = last.match(/\b([A-Z]{2})\b/);
      if (m1 && US_STATES.has(m1[1])) {
        state = m1[1];
        let cand = parts[parts.length - 2];
        if (cand.toUpperCase() === state && parts.length >= 3) {
          cand = parts[parts.length - 3];
        }
        if (!US_STATE_NAMES.has(cand.toLowerCase()) || (cand.toLowerCase() === 'washington' && state === 'DC') || (cand.toLowerCase() === 'new york' && state === 'NY')) {
          town = cand;
        } else {
          const loc = (h.address?.locality || '').trim();
          if (loc && !US_STATE_NAMES.has(loc.toLowerCase())) {
            town = loc;
          } else if (state === 'MI' && cand.toLowerCase() === 'wyoming') {
            town = 'Grand Rapids';
          } else if (state === 'PA' && cand.toLowerCase() === 'washington') {
            town = 'Pittsburgh';
          } else {
            town = cand;
          }
        }
      } else if (parts.length >= 3) {
        const secondLast = parts[parts.length - 2];
        const m2 = secondLast.match(/\b([A-Z]{2})\b/);
        if (m2 && US_STATES.has(m2[1])) {
          state = m2[1];
          let cand = parts[parts.length - 3];
          if (cand.toUpperCase() === state && parts.length >= 4) {
            cand = parts[parts.length - 4];
          }
          if (!US_STATE_NAMES.has(cand.toLowerCase()) || (cand.toLowerCase() === 'washington' && state === 'DC') || (cand.toLowerCase() === 'new york' && state === 'NY')) {
            town = cand;
          } else {
            const loc = (h.address?.locality || '').trim();
            if (loc && !US_STATE_NAMES.has(loc.toLowerCase())) {
              town = loc;
            } else if (state === 'MI' && cand.toLowerCase() === 'wyoming') {
              town = 'Grand Rapids';
            } else if (state === 'PA' && cand.toLowerCase() === 'washington') {
              town = 'Pittsburgh';
            } else {
              town = cand;
            }
          }
        }
      }
    }
  }

  if (!state) {
    const reg = (h.address?.region || '').trim().toUpperCase();
    if (US_STATES.has(reg)) state = reg;
  }

  if (!town) {
    const loc = (h.address?.locality || '').trim();
    if (loc && !US_STATE_NAMES.has(loc.toLowerCase())) {
      town = loc;
    }
  }

  return { town: town.trim(), state };
}

function getNonUsDropReason(h) {
  const fmt = (h.address?.formatted || '').trim();
  const reg = (h.address?.region || '').trim().toUpperCase();
  const dest = (h.destinationSlug || '').toLowerCase();
  
  if (UK_POSTCODE_REGEX.test(fmt) || dest.includes('uk') || dest.includes('scotland') || dest.includes('windermere') || dest.includes('highland') || dest.includes('dumfries') || dest.includes('perth') || dest.includes('stirling') || dest.includes('penrith') || dest.includes('ulverston') || dest.includes('cumbria') || dest.includes('leeds') || dest.includes('liverpool') || dest.includes('manchester') || dest.includes('blackpool') || dest.includes('yorkshire') || dest.includes('peak-district')) {
    return 'UK postcode or region';
  }
  if (CA_PROVINCES.has(reg) || dest.includes('canada') || dest.includes('british-columbia') || dest.includes('ontario') || dest.includes('quebec') || dest.includes('alberta') || dest.includes('nova-scotia') || dest.includes('new-brunswick') || dest.includes('manitoba')) {
    return 'Canadian province';
  }
  if (dest.includes('es-es') || dest.includes('spain') || dest.includes('madrid') || dest.includes('barcelona') || dest.includes('mallorca') || dest.includes('tenerife') || dest.includes('ibiza') || dest.includes('valencia') || dest.includes('sevilla')) {
    return 'Spain destination or province';
  }
  return 'Unknown / missing US state code';
}

const keptUsHotels = [];
const nonUsRecords = [];

for (const h of uniqueUsHotels) {
  const { town, state } = extractTownAndState(h);
  if (!state) {
    nonUsRecords.push({
      name: h.name,
      reason: getNonUsDropReason(h),
      address: {
        street: h.address.street,
        locality: h.address.locality,
        region: h.address.region,
        country: h.address.country,
        formatted: h.address.formatted
      },
      destinationSlug: h.destinationSlug,
      sourceUrl: h.sourceUrl
    });
  } else {
    keptUsHotels.push({
      ...h,
      town,
      state
    });
  }
}

console.log(`US Records Filtered: Kept=${keptUsHotels.length}, Dropped Non-US=${nonUsRecords.length} (Sum: ${keptUsHotels.length + nonUsRecords.length})`);

// B2. City Aliases and City Center Coordinates
export const CITY_ALIASES = [
  { town: 'Washington', state: 'DC', citySlug: 'washington-dc' },
  { town: 'Washington DC', state: 'DC', citySlug: 'washington-dc' },
  { town: 'Las Vegas', state: 'NV', citySlug: 'las-vegas' },
  { town: 'Paradise', state: 'NV', citySlug: 'las-vegas' },
  { town: 'Kihei', state: 'HI', citySlug: 'maui' },
  { town: 'Wailea', state: 'HI', citySlug: 'maui' },
  { town: 'Lahaina', state: 'HI', citySlug: 'maui' },
  { town: 'Kaanapali', state: 'HI', citySlug: 'maui' },
  { town: 'Maui', state: 'HI', citySlug: 'maui' },
  { town: 'New York', state: 'NY', citySlug: 'new-york' },
  { town: 'New York City', state: 'NY', citySlug: 'new-york' }
];

export const OUR_CITY_SPECS = {
  'asheville': { city: 'Asheville', state: 'NC', lat: 35.5951, lng: -82.5515 },
  'aspen': { city: 'Aspen', state: 'CO', lat: 39.1945, lng: -106.8579 },
  'atlanta': { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
  'austin': { city: 'Austin', state: 'TX', lat: 30.2667, lng: -97.7408 },
  'baltimore': { city: 'Baltimore', state: 'MD', lat: 39.2885, lng: -76.6062 },
  'boston': { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  'charleston': { city: 'Charleston', state: 'SC', lat: 32.7765, lng: -79.9311 },
  'chicago': { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  'dallas': { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  'denver': { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  'gatlinburg': { city: 'Gatlinburg', state: 'TN', lat: 35.7175, lng: -83.5062 },
  'honolulu': { city: 'Honolulu', state: 'HI', lat: 21.3069, lng: -157.8583 },
  'houston': { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  'kansas-city': { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  'key-west': { city: 'Key West', state: 'FL', lat: 24.5584, lng: -81.7833 },
  'lake-tahoe': { city: 'Lake Tahoe', state: 'CA', lat: 39.0968, lng: -120.0324 },
  'las-vegas': { city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
  'los-angeles': { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  'maui': { city: 'Maui', state: 'HI', lat: 20.7984, lng: -156.3319 },
  'miami': { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  'napa': { city: 'Napa', state: 'CA', lat: 38.3055, lng: -122.2901 },
  'nashville': { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  'new-orleans': { city: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715 },
  'new-york': { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  'orlando': { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
  'palm-springs': { city: 'Palm Springs', state: 'CA', lat: 33.8303, lng: -116.5453 },
  'philadelphia': { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  'phoenix': { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  'poconos': { city: 'Poconos', state: 'PA', lat: 41.1343, lng: -75.3001 },
  'portland': { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  'san-antonio': { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  'san-diego': { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  'san-francisco': { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  'savannah': { city: 'Savannah', state: 'GA', lat: 32.0809, lng: -81.0912 },
  'scottsdale': { city: 'Scottsdale', state: 'AZ', lat: 33.4942, lng: -111.9261 },
  'seattle': { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  'sedona': { city: 'Sedona', state: 'AZ', lat: 34.8697, lng: -111.7610 },
  'washington-dc': { city: 'Washington DC', state: 'DC', lat: 38.9072, lng: -77.0369 }
};

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function cleanHotelName(raw) {
  if (!raw) return '';
  let s = raw.toLowerCase();
  s = s.replace(/,\s*(?:an?|by)\s+[a-z0-9\s&'-]+\s+hotels?/gi, ' ');
  s = s.replace(/[-–|]\s*(?:an?|by)\s+[a-z0-9\s&'-]+\s+hotels?/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+ihg\s+hotels?\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+marriott\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+hilton\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+hyatt\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+wyndham\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+choice\s+hotels?\b/gi, ' ');
  s = s.replace(/\b(?:an?|by)\s+sonesta\b/gi, ' ');
  s = s.replace(/\b(?:a|the)\s+[a-z0-9\s&'-]+\s+hotels?$/gi, ' ');
  s = s.replace(/\b(hotels?|inns?|suites?|resorts?|the|by|and|a|an)\b/gi, ' ');
  return s.replace(/[^a-z0-9]/g, '');
}

function normCity(c) {
  return (c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isRealGeo(lat, lng) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (Math.abs(lat - 39.8) < 1.0 && Math.abs(lng - (-98.5)) < 1.0) return false;
  return true;
}

function matchCity(thLoc, thTown, thState, ourCity) {
  for (const a of CITY_ALIASES) {
    if (a.town.toLowerCase() === thTown.toLowerCase() && (!a.state || a.state === thState)) {
      if (a.citySlug.replace(/-/g, '') === normCity(ourCity)) return true;
    }
  }
  if (normCity(thTown) === normCity(ourCity)) return true;
  if (normCity(thLoc) === normCity(ourCity)) return true;
  if ((normCity(thLoc) === 'washington' || normCity(thLoc) === 'washingtondc') && (thState || '').toLowerCase() === 'dc' && normCity(ourCity) === 'washingtondc') return true;
  if ((normCity(thLoc) === 'newyork' || normCity(thLoc) === 'nyc') && normCity(ourCity) === 'newyork') return true;
  return false;
}

function resolveCityAndNearCity(town, state, geo) {
  for (const a of CITY_ALIASES) {
    if (a.town.toLowerCase() === town.toLowerCase() && (!a.state || a.state === state)) {
      return { citySlug: a.citySlug, nearCity: null };
    }
  }

  for (const [slug, spec] of Object.entries(OUR_CITY_SPECS)) {
    if (spec.city.toLowerCase() === town.toLowerCase() && (spec.state === state || (slug === 'lake-tahoe' && (state === 'CA' || state === 'NV')))) {
      return { citySlug: slug, nearCity: null };
    }
  }

  if (geo && geo.lat != null && geo.lng != null && isRealGeo(geo.lat, geo.lng)) {
    let closestSlug = null;
    let closestDist = Infinity;
    for (const [slug, spec] of Object.entries(OUR_CITY_SPECS)) {
      const d = haversineMeters(geo.lat, geo.lng, spec.lat, spec.lng);
      if (d <= 40000 && d < closestDist) {
        closestDist = d;
        closestSlug = slug;
      }
    }
    if (closestSlug) {
      return { citySlug: null, nearCity: closestSlug };
    }
  }

  return { citySlug: null, nearCity: null };
}

// T2. Match against our hotels
const highMatches = [];
const mediumMatches = [];
const newHotels = [];

for (const th of keptUsHotels) {
  const thName = cleanHotelName(th.name);
  const thGeo = isRealGeo(th.geo?.lat, th.geo?.lng) ? th.geo : null;
  const thLoc = th.address?.locality || '';

  let bestMatch = null;
  let matchLevel = 'none';

  for (const our of ourUsHotels) {
    const ourName = cleanHotelName(our.name);
    const ourGeo = isRealGeo(our.latitude, our.longitude) ? { lat: Number(our.latitude), lng: Number(our.longitude) } : null;

    const bothGeo = !!(thGeo && ourGeo);
    const dist = bothGeo ? haversineMeters(thGeo.lat, thGeo.lng, ourGeo.lat, ourGeo.lng) : null;
    const sameCity = matchCity(thLoc, th.town, th.state, our.city);

    // Rule 1: High
    const sameName = thName.length > 0 && thName === ourName;
    if (sameName && sameCity) {
      if (!bothGeo || dist <= 300) {
        matchLevel = 'high';
        bestMatch = { th, our, dist, reason: 'same_name_city_geo_300m' };
        break;
      }
    }

    // Rule 2: Medium (if not already high)
    if (matchLevel !== 'high') {
      const nameContains = sameCity && thName.length >= 4 && ourName.length >= 4 && (thName.includes(ourName) || ourName.includes(thName));
      const geoCloseDiffName = bothGeo && dist <= 150 && thName !== ourName;
      if (nameContains || geoCloseDiffName) {
        matchLevel = 'medium';
        bestMatch = {
          th,
          our,
          dist,
          reason: nameContains ? 'same_city_name_contains' : 'geo_within_150m_different_name'
        };
      }
    }
  }

  if (matchLevel === 'high') {
    highMatches.push(bestMatch);
  } else if (matchLevel === 'medium') {
    mediumMatches.push(bestMatch);
  } else {
    newHotels.push(th);
  }
}

console.log(`Matching results: High=${highMatches.length}, Medium=${mediumMatches.length}, New=${newHotels.length} (Sum: ${highMatches.length + mediumMatches.length + newHotels.length})`);

// T3. Fill empty facts on matched hotels & conflicts
const proposedFills = [];
const conflicts = [];
const fillsByField = {
  address: 0,
  coordinates: 0,
  area_or_neighbourhood: 0,
  room_name: 0
};

for (const match of highMatches) {
  const our = match.our;
  const th = match.th;
  const fills = {};
  
  // 1. Address fill: only if ours is empty or a placeholder
  const ourAddr = (our.streetAddress || '').trim();
  const isAddrPlaceholder = !ourAddr || !/\d/.test(ourAddr) || /Enclave/i.test(ourAddr);
  if (isAddrPlaceholder && th.address.street && /\d/.test(th.address.street)) {
    fills.streetAddress = th.address.street;
    fillsByField.address++;
  }

  // 2. Coordinates fill: only if ours is missing or placeholder
  const hasRealOurGeo = isRealGeo(our.latitude, our.longitude);
  if (!hasRealOurGeo && th.geo && isRealGeo(th.geo.lat, th.geo.lng)) {
    fills.coordinates = { lat: th.geo.lat, lng: th.geo.lng };
    fillsByField.coordinates++;
  }

  // 3. Area or neighbourhood fill: only if ours is empty or placeholder
  const ourNeighbourhood = (our.neighborhood || '').trim();
  const isNeighbourhoodPlaceholder = !ourNeighbourhood || /Prime .* Enclave/i.test(ourNeighbourhood);
  if (isNeighbourhoodPlaceholder && th.town && th.town !== our.city) {
    fills.neighborhood = th.town;
    fillsByField.area_or_neighbourhood++;
  }

  // 4. Room name fill: only if ours is empty
  const ourRoom = (our.roomType || '').trim();
  if (!ourRoom && th.verifiedRoomName && th.verifiedRoomName.trim()) {
    fills.roomType = th.verifiedRoomName.trim();
    fillsByField.room_name++;
  }

  if (Object.keys(fills).length > 0) {
    proposedFills.push({
      hotelName: our.name,
      city: our.city,
      currentValues: {
        streetAddress: our.streetAddress || null,
        latitude: our.latitude || null,
        longitude: our.longitude || null,
        neighborhood: our.neighborhood || null,
        roomType: our.roomType || null
      },
      proposedFills: fills,
      distMeters: match.dist != null ? Math.round(match.dist) : null
    });
  }

  // Check conflicts
  const ourTub = (our.tubType || '').toLowerCase();
  const thTubPlacement = (th.tubPlacement || '').toLowerCase();
  const thRoom = (th.verifiedRoomName || '').trim();

  let roomConflict = false;
  let tubConflict = false;

  if (ourRoom && thRoom && cleanHotelName(ourRoom) !== cleanHotelName(thRoom)) {
    roomConflict = true;
  }

  if (ourTub && thTubPlacement) {
    const ourIsJacuzzi = /jacuzzi|whirlpool|jetted|hot tub/i.test(ourTub);
    const thIsJacuzzi = /jacuzzi|whirlpool|jetted|hot tub/i.test(th.tubPlacementLabel || '') || /jacuzzi|whirlpool|jetted|hot tub/i.test(thRoom);
    if (ourIsJacuzzi !== thIsJacuzzi && thRoom) {
      tubConflict = true;
    }
  }

  if (roomConflict || tubConflict) {
    conflicts.push({
      hotelName: our.name,
      city: our.city,
      ourData: {
        roomType: our.roomType || null,
        tubType: our.tubType || null,
        bathtubConfirmed: our.bathtubConfirmed ?? null
      },
      tubHotelsData: {
        verifiedRoomName: th.verifiedRoomName || null,
        tubPlacement: th.tubPlacement || null,
        tubPlacementLabel: th.tubPlacementLabel || null,
        sourceUrl: th.sourceUrl
      },
      conflictType: roomConflict && tubConflict ? 'room_and_tub_mismatch' : (roomConflict ? 'room_name_mismatch' : 'tub_type_mismatch')
    });
  }
}

console.log(`Proposed fills count: ${proposedFills.length}`);
console.log(`Conflicts count: ${conflicts.length}`);

// T4 & B2. Propose new hotels & Map towns
const proposedNewHotelRecords = [];
const newTownsMap = new Map();
const cityAttachedCounts = {};
let newHotelsAttachedToExisting = 0;
let newHotelsInNewTowns = 0;
let newHotelsInSuburbs = 0;
let newHotelsLackingRoomName = 0;
let newHotelsLackingCoordinates = 0;

for (const th of newHotels) {
  const { citySlug, nearCity } = resolveCityAndNearCity(th.town, th.state, th.geo);
  
  if (citySlug) {
    newHotelsAttachedToExisting++;
    cityAttachedCounts[citySlug] = (cityAttachedCounts[citySlug] || 0) + 1;
  } else {
    newHotelsInNewTowns++;
    if (nearCity) {
      newHotelsInSuburbs++;
    }
    const townKey = `${th.town}::${th.state}`;
    if (!newTownsMap.has(townKey)) {
      newTownsMap.set(townKey, {
        town: th.town,
        state: th.state,
        hotelsCount: 0,
        withRoomNameCount: 0,
        withRealGeoCount: 0,
        nearCities: new Set()
      });
    }
    const tEntry = newTownsMap.get(townKey);
    tEntry.hotelsCount++;
    if ((th.verifiedRoomName || '').trim()) tEntry.withRoomNameCount++;
    if (isRealGeo(th.geo?.lat, th.geo?.lng)) tEntry.withRealGeoCount++;
    if (nearCity) tEntry.nearCities.add(nearCity);
  }

  const hasRoom = !!(th.verifiedRoomName && th.verifiedRoomName.trim());
  const hasGeo = isRealGeo(th.geo?.lat, th.geo?.lng);
  if (!hasRoom) newHotelsLackingRoomName++;
  if (!hasGeo) newHotelsLackingCoordinates++;

  const record = {
    name: th.name,
    brand: th.brand || null,
    stars: th.stars || null,
    address: {
      street: th.address?.street || '',
      locality: th.town || th.address?.locality || '',
      region: th.state || th.address?.region || '',
      country: 'US',
      formatted: th.address?.formatted || ''
    },
    geo: hasGeo ? { lat: th.geo.lat, lng: th.geo.lng } : null,
    tubPlacement: th.tubPlacement || null,
    tubPlacementLabel: th.tubPlacementLabel || null,
    verifiedRoomName: th.verifiedRoomName || null,
    roomMeta: th.roomMeta || null,
    bathtubConfirmed: false,
    factSource: {
      source: 'tubhotels',
      url: th.sourceUrl,
      seenAt: '2026-10-27'
    },
    roomNameStatus: 'unconfirmed',
    bookingLinks: [],
    town: th.town,
    state: th.state,
    citySlug: citySlug || null,
    nearCity: nearCity || null,
    variants: th.variants && th.variants.length > 0 ? th.variants : undefined
  };

  proposedNewHotelRecords.push(record);
}

// B3. New towns list & City-page candidates
const newTownsList = Array.from(newTownsMap.values()).map(t => {
  const isCandidate = t.hotelsCount >= 5 && t.withRoomNameCount >= 3;
  const nearestCity = t.nearCities.size > 0 ? Array.from(t.nearCities).join(';') : '';
  return {
    town: t.town,
    state: t.state,
    hotelsCount: t.hotelsCount,
    withRoomNameCount: t.withRoomNameCount,
    withRealGeoCount: t.withRealGeoCount,
    nearestCity,
    isCandidate
  };
}).sort((a, b) => b.hotelsCount - a.hotelsCount);

const candidateTowns = newTownsList.filter(t => t.isCandidate);
console.log(`New towns count: ${newTownsList.length} (Candidates with 5+ hotels AND 3+ room names: ${candidateTowns.length})`);
console.log(`New hotels attached to existing cities: ${newHotelsAttachedToExisting}`);
console.log(`New hotels in suburbs (nearCity set): ${newHotelsInSuburbs}`);

// Write JSON files to data-collect/private/
fs.writeFileSync(path.join(PRIVATE_DIR, 'non-us-records.json'), JSON.stringify(nonUsRecords, null, 2));

fs.writeFileSync(path.join(PRIVATE_DIR, 'us-matches.json'), JSON.stringify(highMatches.map(m => ({
  thHotel: {
    name: m.th.name,
    town: m.th.town,
    state: m.th.state,
    address: m.th.address,
    geo: m.th.geo,
    verifiedRoomName: m.th.verifiedRoomName,
    roomMeta: m.th.roomMeta,
    tubPlacement: m.th.tubPlacement,
    tubPlacementLabel: m.th.tubPlacementLabel,
    sourceUrl: m.th.sourceUrl
  },
  ourHotel: {
    name: m.our.name,
    city: m.our.city,
    streetAddress: m.our.streetAddress,
    latitude: m.our.latitude,
    longitude: m.our.longitude,
    roomType: m.our.roomType,
    tubType: m.our.tubType
  },
  distMeters: m.dist != null ? Math.round(m.dist) : null,
  matchReason: m.reason
})), null, 2));

fs.writeFileSync(path.join(PRIVATE_DIR, 'us-medium-review.json'), JSON.stringify(mediumMatches.map(m => ({
  thHotel: {
    name: m.th.name,
    town: m.th.town,
    state: m.th.state,
    address: m.th.address,
    geo: m.th.geo,
    verifiedRoomName: m.th.verifiedRoomName,
    tubPlacement: m.th.tubPlacement,
    tubPlacementLabel: m.th.tubPlacementLabel,
    sourceUrl: m.th.sourceUrl
  },
  ourHotel: {
    name: m.our.name,
    city: m.our.city,
    streetAddress: m.our.streetAddress,
    latitude: m.our.latitude,
    longitude: m.our.longitude,
    roomType: m.our.roomType
  },
  distMeters: m.dist != null ? Math.round(m.dist) : null,
  reviewReason: m.reason
})), null, 2));

fs.writeFileSync(path.join(PRIVATE_DIR, 'us-fills.json'), JSON.stringify(proposedFills, null, 2));
fs.writeFileSync(path.join(PRIVATE_DIR, 'us-conflicts.json'), JSON.stringify(conflicts, null, 2));
fs.writeFileSync(path.join(PRIVATE_DIR, 'us-new-hotels.json'), JSON.stringify(proposedNewHotelRecords, null, 2));

// Write us-new-towns.csv
const csvHeader = 'town,state,hotelsCount,withRoomNameCount,withRealGeoCount,nearestCity,isCandidate\n';
const csvRows = newTownsList.map(t => 
  `"${t.town.replace(/"/g, '""')}","${t.state}",${t.hotelsCount},${t.withRoomNameCount},${t.withRealGeoCount},"${t.nearestCity}",${t.isCandidate}`
).join('\n');
fs.writeFileSync(path.join(PRIVATE_DIR, 'us-new-towns.csv'), csvHeader + csvRows);

// B3. Rebuild sample-20.md
// Requirements: 10 new hotels from 10 different towns, at least 3 suburbs with nearCity; 5 fills; 5 conflicts.
const sampleNewHotels = [];
const seenSampleTowns = new Set();
let suburbSampleCount = 0;

// First select 3+ suburb hotels from distinct towns
for (const h of proposedNewHotelRecords) {
  if (h.nearCity && !seenSampleTowns.has(h.town)) {
    sampleNewHotels.push(h);
    seenSampleTowns.add(h.town);
    suburbSampleCount++;
    if (suburbSampleCount >= 4) break;
  }
}

// Then fill remaining up to 10 from distinct non-suburb towns
for (const h of proposedNewHotelRecords) {
  if (sampleNewHotels.length >= 10) break;
  if (!h.nearCity && !seenSampleTowns.has(h.town)) {
    sampleNewHotels.push(h);
    seenSampleTowns.add(h.town);
  }
}

const sampleFills = proposedFills.slice(0, 5);
const sampleConflicts = conflicts.slice(0, 5);

let sampleMd = '# US Hotel Import Sample (20 Hotels)\n\n';
sampleMd += 'This sample provides a representative cross-section for owner review before database integration.\n\n';
sampleMd += '| Category | Hotel | Town | Near City | Room Name (Theirs) | Tub Placement | Address | What We\'d Change |\n';
sampleMd += '|---|---|---|---|---|---|---|---|\n';

for (const h of sampleNewHotels) {
  const townStr = `${h.town}, ${h.state}`.trim();
  const nearStr = h.nearCity ? `\`${h.nearCity}\`` : '*(none)*';
  const room = h.verifiedRoomName || '*(none)*';
  const tub = h.tubPlacementLabel || h.tubPlacement || '*(unspecified)*';
  const addr = h.address.street || h.address.formatted || '*(no street)*';
  const changeDesc = h.nearCity 
    ? `Add as new unconfirmed property in suburb ${townStr}; attach nearCity: ${h.nearCity}; links to be added later`
    : (h.citySlug 
        ? `Add as new unconfirmed property; attach to city page ${h.citySlug}; links to be added later`
        : `Add as new unconfirmed property in town ${townStr}; links to be added later`);
  sampleMd += `| **New Hotel** | ${h.name} | ${townStr} | ${nearStr} | ${room} | ${tub} | ${addr} | ${changeDesc} |\n`;
}

for (const f of sampleFills) {
  const matchObj = highMatches.find(m => m.our.name === f.hotelName && m.our.city === f.city);
  const th = matchObj?.th;
  const townStr = `${f.city}`;
  const room = th?.verifiedRoomName || '*(none)*';
  const tub = th?.tubPlacementLabel || th?.tubPlacement || '*(unspecified)*';
  const addr = th?.address?.street || th?.address?.formatted || '*(no street)*';
  const changes = Object.entries(f.proposedFills).map(([k, v]) => {
    if (k === 'coordinates') return `coordinates (${v.lat.toFixed(4)}, ${v.lng.toFixed(4)})`;
    return `${k}: "${v}"`;
  }).join('; ');
  sampleMd += `| **Proposed Fill** | ${f.hotelName} | ${townStr} | *(n/a)* | ${room} | ${tub} | ${addr} | Fill placeholder fields: ${changes} |\n`;
}

for (const c of sampleConflicts) {
  const matchObj = highMatches.find(m => m.our.name === c.hotelName && m.our.city === c.city);
  const th = matchObj?.th;
  const townStr = `${c.city}`;
  const room = c.tubHotelsData.verifiedRoomName || '*(none)*';
  const tub = c.tubHotelsData.tubPlacementLabel || c.tubHotelsData.tubPlacement || '*(unspecified)*';
  const addr = th?.address?.street || th?.address?.formatted || '*(no street)*';
  const what = `Conflict: our room is "${c.ourData.roomType || ''}" (${c.ourData.tubType || ''}), theirs is "${room}" (${tub}). Keep our data; flag for source check.`;
  sampleMd += `| **Conflict** | ${c.hotelName} | ${townStr} | *(n/a)* | ${room} | ${tub} | ${addr} | ${what} |\n`;
}

fs.writeFileSync(path.join(PRIVATE_DIR, 'sample-20.md'), sampleMd);
console.log('Private files written to data-collect/private/');

// Write data-collect/import1-report.md (committed; counts only, no hotel data except the 20 conflicts table)
const top30Towns = newTownsList.slice(0, 30);

const reportMd = `# US Hotel Import Preparation Report (IMPORT1-PREP-B)

**Date:** 2026-10-28  
**Scope:** United States hotel facts preparation — refined town placement, suburb detection, and full conflict reporting (zero database writes, local analysis only).

---

## 1. Inventory Summary & Country Counts

Raw records in source dataset (\`all-extracted-hotels.json\`): **${rawTubHotels.length}**

| Country | Records | Status |
|---|---|---|
| **United States (US)** | **${rawUsHotels.length}** | **Processed this round** |
| Spain (ES) | ${countryCounts.ES || 0} | Counted, not processed |
| Canada (CA) | ${countryCounts.CA || 0} | Counted, not processed |
| United Kingdom (GB) | ${countryCounts.GB || 0} | Counted, not processed |

---

## 2. Deduplication & State Code Filtering (Task B1)

Following the de-duplication rules (normalised name + normalised street / geo rounded to 4 decimals), the US inventory resolves to:

- **Total Unique US Input Records:** **${uniqueUsHotels.length}**
- **Duplicate Records Merged:** **${duplicatesCount}**
- **Hotels with Differing Variants Preserved:** **${uniqueUsHotels.filter(h => h.variants && h.variants.length > 0).length}**

### Non-US Records Dropped to \`data-collect/private/non-us-records.json\`

- **Valid US Records Kept:** **${keptUsHotels.length}**
- **Non-US Records Dropped:** **${nonUsRecords.length}**
- **Sum Verification:** **${keptUsHotels.length} + ${nonUsRecords.length} = ${keptUsHotels.length + nonUsRecords.length}** (equals ${uniqueUsHotels.length})

#### Breakdown of Dropped Non-US Records by Reason

| Reason | Count | Notes |
|---|---|---|
| UK postcode or region | ${nonUsRecords.filter(r => r.reason.startsWith('UK')).length} | UK regions (e.g. Highland, Windermere, Cumbria) and postcodes |
| Canadian province | ${nonUsRecords.filter(r => r.reason.startsWith('Canadian')).length} | Canadian provinces (e.g. BC, ON, QC) and postal codes |
| Spain destination or province | ${nonUsRecords.filter(r => r.reason.startsWith('Spain')).length} | Spanish destinations and provinces |
| Unknown / missing US state code | ${nonUsRecords.filter(r => r.reason.startsWith('Unknown')).length} | Records without valid 2-letter US state code |

---

## 3. Matching Against Existing 562 US Hotels

Matching the ${keptUsHotels.length} valid US hotels against our existing 562 US properties:

| Classification | Count | Description |
|---|---|---|
| **High Match** | **${highMatches.length}** | Same normalised name, same city, geo within 300 m |
| **Medium Match** | **${mediumMatches.length}** | Same city name substring, or geo within 150 m with different name (written to review list) |
| **New Hotels** | **${newHotels.length}** | Unmatched US properties proposed for import |
| **Total Valid US Kept** | **${keptUsHotels.length}** | **High (${highMatches.length}) + Medium (${mediumMatches.length}) + New (${newHotels.length}) = ${highMatches.length + mediumMatches.length + newHotels.length}** |

---

## 4. High Match Fact Fills & Conflicts (Task B4)

Proposals for the ${highMatches.length} high-confidence matched hotels:

- **Hotels with Proposed Fills:** **${proposedFills.length}**
  - \`streetAddress\` filled (replacing area placeholders like "Prime Enclave"): **${fillsByField.address}**
  - \`coordinates\` filled: **${fillsByField.coordinates}**
  - \`area / neighbourhood\` filled: **${fillsByField.area_or_neighbourhood}**
  - \`roomType\` filled (only if ours was empty): **${fillsByField.room_name}**
- **Hotels with Room / Tub Type Conflicts:** **${conflicts.length}**

### All 20 Room-Name Conflicts (Task B4 Full Table)

| # | Hotel | City | Our Room Name | Their Room Name |
|---|---|---|---|---|
${conflicts.map((c, idx) => `| ${idx + 1} | ${c.hotelName} | ${c.city} | ${c.ourData.roomType || '*(empty)*'} | ${c.tubHotelsData.verifiedRoomName || '*(empty)*'} |`).join('\n')}

---

## 5. Town Placement, Suburbs & City Attachment (Task B2)

For the **${newHotels.length}** proposed new hotels:

- **Attached to Existing 38 US City Pages:** **${newHotelsAttachedToExisting}**
- **Identified as Suburbs (\`nearCity\` within 40 km):** **${newHotelsInSuburbs}**
- **Mapped to Distinct New Towns:** **${newHotelsInNewTowns}**
- **New Hotels Lacking Verified Room Name:** **${newHotelsLackingRoomName}**
- **New Hotels Lacking Real Coordinates:** **${newHotelsLackingCoordinates}**

### Attached Hotels Count by City Page

| City Slug | Attached Hotels |
|---|---|
${Object.entries(cityAttachedCounts).sort((a, b) => b[1] - a[1]).map(([slug, count]) => `| \`${slug}\` | ${count} |`).join('\n')}

---

## 6. New Towns & City-Page Candidates (Task B3)

- **Distinct New Towns Identified:** **${newTownsList.length}**
- **Towns Meeting City-Page Criteria (5+ hotels AND 3+ with verified room name):** **${candidateTowns.length}**

### Top 30 New Towns by Hotel Count

| Rank | Town | State | Hotels | With Room Name | With Real Geo | Nearest City | City-Page Candidate |
|---|---|---|---|---|---|---|---|
${top30Towns.map((t, idx) => `| ${idx + 1} | ${t.town} | ${t.state} | ${t.hotelsCount} | ${t.withRoomNameCount} | ${t.withRealGeoCount} | ${t.nearestCity ? `\`${t.nearestCity}\`` : '*(none)*'} | ${t.isCandidate ? 'Yes (5+ & 3+ rooms)' : 'No'} |`).join('\n')}

---

## 7. Verification & Data Integrity Checks

- **Database Writes:** 0 (read-only execution)
- **External Network Requests:** 0 (local execution)
- **Forbidden Fields Audit:** All generated files in \`data-collect/private/\` and \`data-collect/import1-report.md\` exclude \`about\`, \`guestTubReview\`, \`images\`, \`bookingUrl\`, \`priceFromUsd\`, \`rating\`, \`reviewCount\`, \`amenities\`, and affiliate tracking codes.
`;

fs.writeFileSync(REPORT_PATH, reportMd);
console.log('Report written to data-collect/import1-report.md');
console.log('IMPORT1-PREP-B successfully completed.');
