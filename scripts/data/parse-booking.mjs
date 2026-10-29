import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');

const ALLOWED_BATH_FACILITIES = [
  { match: /^bath$/i, canonical: 'Bath' },
  { match: /^bathtub$/i, canonical: 'Bathtub' },
  { match: /^(?:spa\s+tub|spa\s+bath)$/i, canonical: 'Spa bath' },
  { match: /^(?:hot\s+tub|private\s+hot\s+tub)$/i, canonical: 'Hot tub' },
  { match: /^whirlpool$/i, canonical: 'Whirlpool' },
  { match: /^jacuzzi$/i, canonical: 'Jacuzzi' }
];

export function matchBathFacility(facilityTitle) {
  if (!facilityTitle) return null;
  const clean = facilityTitle.trim();
  // "Bath or shower" must never count as a bath. Ignore it completely.
  if (/^bath\s+or\s+shower$/i.test(clean) || /^shower\s+or\s+bath$/i.test(clean)) {
    return null;
  }
  for (const { match, canonical } of ALLOWED_BATH_FACILITIES) {
    if (match.test(clean)) return canonical;
  }
  return null;
}

export function extractBathWords(text) {
  if (!text) return [];
  // Strip "bath or shower" / "shower or bath" completely so it never triggers a match
  const sanitized = text.replace(/\b(?:bath\s+or\s+shower|shower\s+or\s+bath)\b/gi, ' ');
  const found = new Set();
  if (/\b(?:spa\s+bath|spa\s+tub)\b/i.test(sanitized)) found.add('Spa bath');
  if (/\b(?:private\s+)?hot\s+tub\b/i.test(sanitized)) found.add('Hot tub');
  if (/\bjacuzzi\b/i.test(sanitized)) found.add('Jacuzzi');
  if (/\bwhirlpool\b/i.test(sanitized)) found.add('Whirlpool');
  if (/\bbathtub\b/i.test(sanitized)) found.add('Bathtub');
  if (/\bbath\b/i.test(sanitized)) found.add('Bath');
  return Array.from(found);
}

export function parseBookingHtml(html, meta = {}) {
  const $ = cheerio.load(html);

  const pageTitle = $('title').text().trim() || null;
  let lat = null;
  let lng = null;
  let address = null;
  let district = null;
  let score10 = null;
  let reviewCount = null;
  const rooms = [];

  // Parse ApolloState script if present
  let apolloState = null;
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    if (text.includes('__typename":"BasicPropertyData"') || text.includes('__typename":"RoomDetails"')) {
      try {
        apolloState = JSON.parse(text);
      } catch {}
    }
  });

  // 1. Map Position (lat, lng)
  const atlas = $('[data-atlas-latlng]').attr('data-atlas-latlng');
  if (atlas) {
    const parts = atlas.split(',');
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      lng = parseFloat(parts[1]);
    }
  }

  // Fallback to JSON-LD
  let jsonLdHotel = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (data['@type'] === 'Hotel' || data['@type'] === 'Resort' || data.geo || data.address) {
        jsonLdHotel = data;
      }
    } catch {}
  });

  if ((lat === null || isNaN(lat)) && jsonLdHotel?.geo) {
    lat = parseFloat(jsonLdHotel.geo.latitude);
    lng = parseFloat(jsonLdHotel.geo.longitude);
  }

  // Fallback to ApolloState location
  if (apolloState && (lat === null || isNaN(lat))) {
    for (const v of Object.values(apolloState)) {
      if (v.__typename === 'BasicPropertyData' && v.location) {
        if (v.location.latitude != null) lat = parseFloat(v.location.latitude);
        if (v.location.longitude != null) lng = parseFloat(v.location.longitude);
        break;
      }
    }
  }

  // 2. Address & District
  if (apolloState) {
    for (const v of Object.values(apolloState)) {
      if (v.__typename === 'BasicPropertyData' && v.location) {
        if (v.location.formattedAddress) address = v.location.formattedAddress;
        if (v.location.formattedAddressShort) {
          const parts = v.location.formattedAddressShort.split(',').map(s => s.trim());
          if (parts.length >= 2) district = parts[1];
        }
        break;
      }
    }
  }

  if (!address && jsonLdHotel?.address) {
    const a = jsonLdHotel.address;
    if (typeof a === 'string') {
      address = a;
    } else if (a.streetAddress) {
      address = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
        .filter(Boolean)
        .join(', ');
    }
  }

  if (!address) {
    const domAddr = $('[data-node_tt_id="location-shown-pin"], .hp_address_subtitle, [data-testid="address"]').first().text().replace(/\s+/g, ' ').trim();
    if (domAddr) address = domAddr;
  }

  if (!district) {
    const districtText = $('.hp-desc-district, a[href*="district"]').first().text().trim();
    if (districtText) district = districtText;
    else if (address) {
      // Extract from address (e.g. "377 Greenwich Street, Tribeca, New York...")
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        district = parts[1];
      }
    }
  }

  // 3. Guest score (out of 10) & review count
  if (apolloState) {
    for (const v of Object.values(apolloState)) {
      if (v.__typename === 'Reviews' && v.reviewsCount != null) {
        reviewCount = parseInt(v.reviewsCount, 10);
        if (Array.isArray(v.questions)) {
          const totalQ = v.questions.find(q => q.name === 'total');
          if (totalQ?.score != null) score10 = parseFloat(totalQ.score);
        }
      }
    }
  }

  if (score10 === null && jsonLdHotel?.aggregateRating) {
    if (jsonLdHotel.aggregateRating.ratingValue != null) score10 = parseFloat(jsonLdHotel.aggregateRating.ratingValue);
    if (jsonLdHotel.aggregateRating.reviewCount != null) reviewCount = parseInt(jsonLdHotel.aggregateRating.reviewCount, 10);
  }

  if (score10 === null || reviewCount === null) {
    $('[data-testid="review-score-component"]').each((_, el) => {
      const text = $(el).text();
      const scoreMatch = text.match(/(\d+(?:\.\d+)?)/);
      const countMatch = text.match(/([\d,]+)\s*reviews?/i);
      if (scoreMatch && score10 === null) score10 = parseFloat(scoreMatch[1]);
      if (countMatch && reviewCount === null) reviewCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
    });
  }

  // 4. Rooms and bathWords
  const seenRoomNames = new Set();

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
        if (!roomName || seenRoomNames.has(roomName)) continue;
        seenRoomNames.add(roomName);

        const bathWords = new Set();
        const labels = new Set();

        // (b) Room name check
        const roomNameLower = roomName.toLowerCase();
        if (/(?:jacuzzi|whirlpool|hot\s+tub|spa\s+tub|spa\s+bath|soak(?:ing|\-tub|\s+tub)?|bathtub|jetted)/i.test(roomNameLower)) {
          labels.add('room name');
          if (/jacuzzi/i.test(roomNameLower)) bathWords.add('Jacuzzi');
          if (/whirlpool/i.test(roomNameLower)) bathWords.add('Whirlpool');
          if (/hot\s+tub/i.test(roomNameLower)) bathWords.add('Hot tub');
          if (/spa\s+tub|spa\s+bath/i.test(roomNameLower)) bathWords.add('Spa bath');
          if (/soak/i.test(roomNameLower)) bathWords.add('Soaking tub');
          if (/bathtub/i.test(roomNameLower)) bathWords.add('Bathtub');
          if (/jetted/i.test(roomNameLower)) bathWords.add('Jetted tub');
        }

        // (a) RTRoomCard.facilities check
        if (Array.isArray(v.facilities)) {
          for (const fid of v.facilities) {
            const title = instances[fid];
            const matched = matchBathFacility(title);
            if (matched) {
              bathWords.add(matched);
              if (matched === 'Spa bath') labels.add('Spa tub');
              else labels.add(matched);
            }
          }
        }

        // (a) RoomData amenities check for explicit tub facilities
        const roomId = v.roomId;
        const roomData = apolloState['RoomData:' + roomId];
        if (roomData && Array.isArray(roomData.amenities)) {
          for (const a of roomData.amenities) {
            const ref = a.__ref || '';
            if (/slug\":\"(?:spa_bath|hot_tub|whirlpool|jacuzzi|bathtub)\"/i.test(ref)) {
              if (/spa_bath/i.test(ref)) { bathWords.add('Spa bath'); labels.add('Spa tub'); }
              if (/hot_tub/i.test(ref)) { bathWords.add('Hot tub'); labels.add('Hot tub'); }
              if (/whirlpool/i.test(ref)) { bathWords.add('Whirlpool'); labels.add('Whirlpool'); }
              if (/jacuzzi/i.test(ref)) { bathWords.add('Jacuzzi'); labels.add('Jacuzzi'); }
              if (/bathtub/i.test(ref)) { bathWords.add('Bathtub'); labels.add('Bathtub'); }
            }
          }
        }

        rooms.push({ name: roomName, bathWords: Array.from(bathWords), labels: Array.from(labels) });
      }
    }
  }

  // Fallback to table parsing if no rooms found in Apollo
  if (rooms.length === 0) {
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
      if (name && !seenRoomNames.has(name) && !name.startsWith('Room type') && !name.startsWith('MoTuWe')) {
        seenRoomNames.add(name);
        const bathWords = new Set();
        const labels = new Set();

        const roomNameLower = name.toLowerCase();
        if (/(?:jacuzzi|whirlpool|hot\s+tub|spa\s+tub|spa\s+bath|soak(?:ing|\-tub|\s+tub)?|bathtub|jetted)/i.test(roomNameLower)) {
          labels.add('room name');
          if (/jacuzzi/i.test(roomNameLower)) bathWords.add('Jacuzzi');
          if (/whirlpool/i.test(roomNameLower)) bathWords.add('Whirlpool');
          if (/hot\s+tub/i.test(roomNameLower)) bathWords.add('Hot tub');
          if (/spa\s+tub|spa\s+bath/i.test(roomNameLower)) bathWords.add('Spa bath');
          if (/soak/i.test(roomNameLower)) bathWords.add('Soaking tub');
          if (/bathtub/i.test(roomNameLower)) bathWords.add('Bathtub');
          if (/jetted/i.test(roomNameLower)) bathWords.add('Jetted tub');
        }

        row.find('.hprt-facilities-facility, .facility-badge, [data-name="facility"], li').each((_, facEl) => {
          const facText = $(facEl).text().trim();
          const matched = matchBathFacility(facText);
          if (matched) {
            bathWords.add(matched);
            if (matched === 'Spa bath') labels.add('Spa tub');
            else labels.add(matched);
          }
        });
        rooms.push({ name, bathWords: Array.from(bathWords), labels: Array.from(labels) });
      }
    });
  }

  const tubRooms = rooms.filter(r => (r.labels && r.labels.length > 0) || (r.bathWords && r.bathWords.length > 0));
  const formattedTubRooms = tubRooms.map(r => ({
    roomName: r.name,
    labels: Array.from(new Set(r.labels && r.labels.length > 0 ? r.labels : r.bathWords))
  }));

  const photos = extractPhotos(html);

  return {
    pageTitle,
    lat: isNaN(lat) ? null : lat,
    lng: isNaN(lng) ? null : lng,
    address: address || null,
    district: district || null,
    score10: isNaN(score10) ? null : score10,
    reviewCount: isNaN(reviewCount) ? null : reviewCount,
    rooms,
    tubRooms: formattedTubRooms,
    tubRoomNames: tubRooms.map(r => r.name),
    tubRoomsCount: formattedTubRooms.length,
    hasTubRoom: formattedTubRooms.length > 0,
    tubFacilitiesFound: Array.from(new Set(tubRooms.flatMap(r => r.bathWords))),
    photos
  };
}

export function extractPhotos(html) {
  const photos = [];
  const seenIds = new Set();
  const regex = /https:\/\/[a-z0-9.-]*cf\.bstatic\.com\/xdata\/images\/hotel\/[^\s"']+/g;
  const matches = html.match(regex) || [];
  for (let m of matches) {
    const idMatch = m.match(/\/([0-9]+)\.(?:jpg|webp)/i);
    if (!idMatch) continue;
    const imgId = idMatch[1];
    if (seenIds.has(imgId)) continue;
    seenIds.add(imgId);

    let normalized = m.replace(/\/(?:max[0-9]+x[0-9]+|square[0-9]+|thumbnail[0-9]+|max[0-9]+)\//, '/max1024x768/');
    if (!normalized.includes('/max1024x768/')) {
      normalized = normalized.replace(/\/images\/hotel\/([^/]+)\/([0-9]+\.(?:jpg|webp))/, '/images/hotel/max1024x768/$2');
    }
    normalized = normalized.replace(new RegExp(`/${imgId}\\.webp`), `/${imgId}.jpg`);
    photos.push(normalized);
    if (photos.length >= 6) break;
  }
  return photos;
}

export function parseSavedBookingFile(gzFilePath) {
  const gzBuffer = fs.readFileSync(gzFilePath);
  const html = zlib.gunzipSync(gzBuffer).toString('utf-8');
  const metaPath = gzFilePath.replace(/\.html\.gz$/, '.meta.json');
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {}
  }
  return parseBookingHtml(html, meta);
}
