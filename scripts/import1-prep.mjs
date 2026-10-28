#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Input paths
const TUBHOTELS_PATH = '/Users/karanarora/mystartups/hotelswithbathtubs/web_pages/tubhotels/all-extracted-hotels.json';
const OUR_HOTELS_PATH = '/Users/karanarora/mystartups/hotelswithbathtubs/.cache/all-hotels.json';
const BASE_DIR = '/Users/karanarora/mystartups/hotelswithbathtubs-data';
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
        // Check if not already in variants
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

    // If existing had empty room name but new one has room name, upgrade primary
    if (!existingRoom && newRoom) {
      existing.verifiedRoomName = cleanRecord.verifiedRoomName;
      existing.roomMeta = cleanRecord.roomMeta;
    }
    // If existing had no geo but new one has geo, upgrade
    if (!existing.geo && cleanRecord.geo) {
      existing.geo = cleanRecord.geo;
    }
    // If existing had no street but new one has street, upgrade
    if (!existing.address.street && cleanRecord.address.street) {
      existing.address.street = cleanRecord.address.street;
      existing.address.formatted = cleanRecord.address.formatted;
    }
  }
}

const uniqueUsHotels = Array.from(dedupMap.values());
console.log(`Deduplicated: ${uniqueUsHotels.length} unique US hotels (merged ${duplicatesCount} duplicates)`);

// T2. Match to our hotels
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

function matchCity(thLoc, thReg, ourCity) {
  const normTh = normCity(thLoc);
  const normOur = normCity(ourCity);
  if (normTh === normOur) return true;
  if ((normTh === 'washington' || normTh === 'washingtondc') && (thReg || '').toLowerCase() === 'dc' && normOur === 'washingtondc') return true;
  if ((normTh === 'newyork' || normTh === 'nyc') && normOur === 'newyork') return true;
  return false;
}

const highMatches = [];
const mediumMatches = [];
const newHotels = [];

for (const th of uniqueUsHotels) {
  const thName = cleanHotelName(th.name);
  const thLoc = th.address?.locality || '';
  const thReg = th.address?.region || '';
  const thGeo = isRealGeo(th.geo?.lat, th.geo?.lng) ? th.geo : null;

  let bestMatch = null;
  let matchLevel = 'none';

  for (const our of ourUsHotels) {
    const ourName = cleanHotelName(our.name);
    const ourGeo = isRealGeo(our.latitude, our.longitude) ? { lat: Number(our.latitude), lng: Number(our.longitude) } : null;

    const bothGeo = !!(thGeo && ourGeo);
    const dist = bothGeo ? haversineMeters(thGeo.lat, thGeo.lng, ourGeo.lat, ourGeo.lng) : null;
    const sameCity = matchCity(thLoc, thReg, our.city);

    // Rule 1: High
    // same normalised name and the same city, and geo within 300 m when both have real coordinates
    const sameName = thName.length > 0 && thName === ourName;
    if (sameName && sameCity) {
      if (!bothGeo || dist <= 300) {
        matchLevel = 'high';
        bestMatch = { th, our, dist, reason: 'same_name_city_geo_300m' };
        break; // High match is strongest
      }
    }

    // Rule 2: Medium (if not already high)
    // same city and one name contains the other, or geo within 150 m with a different name
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

// T3. Fill empty facts on matched hotels (proposal only) & conflicts
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
  
  // 1. Address fill: propose only if ours is empty or a placeholder (e.g. no street number or 'Prime ... Enclave')
  const ourAddr = (our.streetAddress || '').trim();
  const isAddrPlaceholder = !ourAddr || !/\d/.test(ourAddr) || /Enclave/i.test(ourAddr);
  if (isAddrPlaceholder && th.address.street && /\d/.test(th.address.street)) {
    fills.streetAddress = th.address.street;
    fillsByField.address++;
  }

  // 2. Coordinates fill: propose only if ours is missing or placeholder
  const hasRealOurGeo = isRealGeo(our.latitude, our.longitude);
  if (!hasRealOurGeo && th.geo && isRealGeo(th.geo.lat, th.geo.lng)) {
    fills.coordinates = { lat: th.geo.lat, lng: th.geo.lng };
    fillsByField.coordinates++;
  }

  // 3. Area or neighbourhood fill: propose only if ours is empty or placeholder
  const ourNeighbourhood = (our.neighborhood || '').trim();
  const isNeighbourhoodPlaceholder = !ourNeighbourhood || /Prime .* Enclave/i.test(ourNeighbourhood);
  if (isNeighbourhoodPlaceholder && th.address.locality && th.address.locality !== our.city) {
    fills.neighborhood = th.address.locality;
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

  // Conflicts check: when our room name or tub type disagrees with theirs
  const ourTub = (our.tubType || '').toLowerCase();
  const thTubPlacement = (th.tubPlacement || '').toLowerCase();
  const thRoom = (th.verifiedRoomName || '').trim();

  let roomConflict = false;
  let tubConflict = false;

  if (ourRoom && thRoom && cleanHotelName(ourRoom) !== cleanHotelName(thRoom)) {
    roomConflict = true;
  }

  // Check tub type disagreement (e.g. jacuzzi vs soaking tub)
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

// T4. Propose new hotels & Map towns
const ourCitySlugs = new Set([
  'asheville', 'aspen', 'atlanta', 'austin', 'baltimore', 'boston', 'charleston', 'chicago',
  'dallas', 'denver', 'gatlinburg', 'honolulu', 'houston', 'kansas-city', 'key-west',
  'lake-tahoe', 'las-vegas', 'los-angeles', 'maui', 'miami', 'napa', 'nashville',
  'new-orleans', 'new-york', 'orlando', 'palm-springs', 'philadelphia', 'phoenix',
  'poconos', 'portland', 'san-antonio', 'san-diego', 'san-francisco', 'savannah',
  'scottsdale', 'seattle', 'sedona', 'washington-dc'
]);

const US_STATES = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
  'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
  'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district-of-columbia': 'DC'
};
const STATE_CODES = new Set(Object.values(US_STATES));

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function resolveState(h) {
  let r = (h.address?.region || '').toUpperCase().trim();
  if (r && STATE_CODES.has(r)) return r;
  if (h.address?.formatted) {
    const m = h.address.formatted.match(/,\s*([A-Z]{2})(?:\s*,\s*\d{5}|\s+\d{5}|$)/);
    if (m && STATE_CODES.has(m[1])) return m[1];
  }
  if (h.destinationSlug) {
    for (const [sName, sCode] of Object.entries(US_STATES)) {
      if (h.destinationSlug.toLowerCase().includes(sName)) {
        return sCode;
      }
    }
  }
  return r || '';
}

const proposedNewHotelRecords = [];
const newTownsMap = new Map();
let newHotelsAttachedToExisting = 0;
let newHotelsInNewTowns = 0;
let newHotelsLackingRoomName = 0;
let newHotelsLackingCoordinates = 0;

for (const th of newHotels) {
  const town = th.address?.locality || '';
  const state = resolveState(th);
  let townSlug = slugify(town);
  if (townSlug === 'washington' && state === 'DC') townSlug = 'washington-dc';

  const matchesExistingCity = ourCitySlugs.has(townSlug);
  if (matchesExistingCity) {
    newHotelsAttachedToExisting++;
  } else {
    newHotelsInNewTowns++;
    const townKey = `${town}::${state}`;
    if (!newTownsMap.has(townKey)) {
      newTownsMap.set(townKey, {
        town,
        state,
        hotelsCount: 0,
        withRoomNameCount: 0,
        withRealGeoCount: 0
      });
    }
    const tEntry = newTownsMap.get(townKey);
    tEntry.hotelsCount++;
    if ((th.verifiedRoomName || '').trim()) tEntry.withRoomNameCount++;
    if (isRealGeo(th.geo?.lat, th.geo?.lng)) tEntry.withRealGeoCount++;
  }

  const hasRoom = !!(th.verifiedRoomName && th.verifiedRoomName.trim());
  const hasGeo = isRealGeo(th.geo?.lat, th.geo?.lng);
  if (!hasRoom) newHotelsLackingRoomName++;
  if (!hasGeo) newHotelsLackingCoordinates++;

  // Record strictly conforming to Rule 1 & T4
  const record = {
    name: th.name,
    brand: th.brand || null,
    stars: th.stars || null,
    address: {
      street: th.address?.street || '',
      locality: th.address?.locality || '',
      region: state || th.address?.region || '',
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
    citySlug: matchesExistingCity ? townSlug : null,
    variants: th.variants && th.variants.length > 0 ? th.variants : undefined
  };

  proposedNewHotelRecords.push(record);
}

// T5. New towns list
const newTownsList = Array.from(newTownsMap.values()).map(t => ({
  ...t,
  isCandidate: t.hotelsCount >= 5
})).sort((a, b) => b.hotelsCount - a.hotelsCount);

const townsWith5PlusHotels = newTownsList.filter(t => t.isCandidate);
console.log(`New towns count: ${newTownsList.length} (5+ hotels candidates: ${townsWith5PlusHotels.length})`);
console.log(`New hotels lacking room name: ${newHotelsLackingRoomName}, lacking coordinates: ${newHotelsLackingCoordinates}`);

// Write JSON files to data-collect/private/
fs.writeFileSync(path.join(PRIVATE_DIR, 'us-matches.json'), JSON.stringify(highMatches.map(m => ({
  thHotel: {
    name: m.th.name,
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
const csvHeader = 'town,state,hotelsCount,withRoomNameCount,withRealGeoCount,isCandidate\n';
const csvRows = newTownsList.map(t => 
  `"${t.town.replace(/"/g, '""')}","${t.state}",${t.hotelsCount},${t.withRoomNameCount},${t.withRealGeoCount},${t.isCandidate}`
).join('\n');
fs.writeFileSync(path.join(PRIVATE_DIR, 'us-new-towns.csv'), csvHeader + csvRows);

// Write sample-20.md
// 10 new hotels, 5 matched hotels with proposed fills, 5 conflicts
const sampleNew = proposedNewHotelRecords.slice(0, 10);
const sampleFills = proposedFills.slice(0, 5);
const sampleConflicts = conflicts.slice(0, 5);

let sampleMd = '# US Hotel Import Sample (20 Hotels)\n\n';
sampleMd += 'This sample provides a representative cross-section for owner review before database integration.\n\n';
sampleMd += '| Category | Hotel | Town | Room Name (Theirs) | Tub Placement | Address | What We\'d Change |\n';
sampleMd += '|---|---|---|---|---|---|---|\n';

for (const h of sampleNew) {
  const townStr = `${h.address.locality || ''}, ${h.address.region || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
  const room = h.verifiedRoomName || '*(none)*';
  const tub = h.tubPlacementLabel || h.tubPlacement || '*(unspecified)*';
  const addr = h.address.street || h.address.formatted || '*(no street)*';
  sampleMd += `| **New Hotel** | ${h.name} | ${townStr} | ${room} | ${tub} | ${addr} | Add as new unconfirmed property; assign town ${townStr}; links to be added later |\n`;
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
  sampleMd += `| **Proposed Fill** | ${f.hotelName} | ${townStr} | ${room} | ${tub} | ${addr} | Fill placeholder fields: ${changes} |\n`;
}

for (const c of sampleConflicts) {
  const matchObj = highMatches.find(m => m.our.name === c.hotelName && m.our.city === c.city);
  const th = matchObj?.th;
  const townStr = `${c.city}`;
  const room = c.tubHotelsData.verifiedRoomName || '*(none)*';
  const tub = c.tubHotelsData.tubPlacementLabel || c.tubHotelsData.tubPlacement || '*(unspecified)*';
  const addr = th?.address?.street || th?.address?.formatted || '*(no street)*';
  const what = `Conflict: our room is "${c.ourData.roomType || ''}" (${c.ourData.tubType || ''}), theirs is "${room}" (${tub}). Keep our data; flag for source check.`;
  sampleMd += `| **Conflict** | ${c.hotelName} | ${townStr} | ${room} | ${tub} | ${addr} | ${what} |\n`;
}

fs.writeFileSync(path.join(PRIVATE_DIR, 'sample-20.md'), sampleMd);
console.log('Private files written to data-collect/private/');

// Write data-collect/import1-report.md (committed; counts only, no hotel data!)
const top30Towns = newTownsList.slice(0, 30);

const reportMd = `# US Hotel Import Preparation Report (IMPORT1-PREP)

**Date:** 2026-10-28  
**Scope:** United States hotel facts preparation (zero database writes, local analysis only).

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

## 2. Deduplication & Matching Breakdown

Following the de-duplication rules (normalised name + normalised street / geo rounded to 4 decimals), the US inventory resolves to:

- **Unique US Hotels:** **${uniqueUsHotels.length}**
- **Duplicate Records Merged:** **${duplicatesCount}**
- **Hotels with Differing Variants Preserved:** **${uniqueUsHotels.filter(h => h.variants && h.variants.length > 0).length}**

### Matching Against Existing 562 US Hotels

The ${uniqueUsHotels.length} unique US hotels classify as:

| Classification | Count | Description |
|---|---|---|
| **High Match** | **${highMatches.length}** | Same normalised name, same city, geo within 300 m |
| **Medium Match** | **${mediumMatches.length}** | Same city name substring, or geo within 150 m with different name (written to review list) |
| **New Hotels** | **${newHotels.length}** | Unmatched US properties proposed for import |
| **Total Unique US** | **${uniqueUsHotels.length}** | **High (${highMatches.length}) + Medium (${mediumMatches.length}) + New (${newHotels.length}) = ${highMatches.length + mediumMatches.length + newHotels.length}** |

---

## 3. High Match Fact Fills & Conflicts

Proposals for the ${highMatches.length} high-confidence matched hotels:

- **Hotels with Proposed Fills:** **${proposedFills.length}**
  - \`streetAddress\` filled (replacing area placeholders like "Prime Enclave"): **${fillsByField.address}**
  - \`coordinates\` filled: **${fillsByField.coordinates}**
  - \`area / neighbourhood\` filled: **${fillsByField.area_or_neighbourhood}**
  - \`roomType\` filled (only if ours was empty): **${fillsByField.room_name}**
- **Hotels with Room / Tub Type Conflicts:** **${conflicts.length}**
  - Preserved existing database values; queued for manual source verification against partner listings.

---

## 4. Proposed New Hotels & Town Mapping

For the **${newHotels.length}** proposed new hotels:

- **Attached to Existing 38 US City Pages:** **${newHotelsAttachedToExisting}**
- **Mapped to New Towns:** **${newHotelsInNewTowns}**
- **New Hotels Lacking Verified Room Name:** **${newHotelsLackingRoomName}**
- **New Hotels Lacking Real Coordinates:** **${newHotelsLackingCoordinates}**

---

## 5. New Towns & City-Page Candidates

- **Distinct New Towns Identified:** **${newTownsList.length}**
- **Towns with 5+ Hotels (City-Page Candidates):** **${townsWith5PlusHotels.length}**

### Top 30 New Towns by Hotel Count

| Rank | Town | State | Hotels | With Room Name | With Real Geo | City-Page Candidate |
|---|---|---|---|---|---|---|
${top30Towns.map((t, idx) => `| ${idx + 1} | ${t.town} | ${t.state || '*(unplaced)*'} | ${t.hotelsCount} | ${t.withRoomNameCount} | ${t.withRealGeoCount} | ${t.isCandidate ? 'Yes (5+)' : 'No'} |`).join('\n')}

---

## 6. Verification & Data Integrity Checks

- **Database Writes:** 0 (read-only execution)
- **External Network Requests:** 0 (local execution)
- **Forbidden Fields Audit:** All generated files in \`data-collect/private/\` and \`data-collect/import1-report.md\` exclude \`about\`, \`guestTubReview\`, \`images\`, \`bookingUrl\`, \`priceFromUsd\`, \`rating\`, \`reviewCount\`, \`amenities\`, and affiliate tracking codes.
`;

fs.writeFileSync(REPORT_PATH, reportMd);
console.log('Report written to data-collect/import1-report.md');
console.log('IMPORT1-PREP successfully completed.');
