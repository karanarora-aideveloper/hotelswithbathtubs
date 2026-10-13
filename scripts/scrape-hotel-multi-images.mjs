import http from 'http';
import https from 'https';
import tls from 'tls';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// S3 / Cloudflare R2 Client
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'dreamwave';
const R2_PREFIX = 'hotelswithbathtubs/images/';
const R2_PUBLIC_DOMAIN = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev';

// JoyProxy Configuration
const PROXY_HOST = '162.19.235.156'; // Resolved IP for gate.joyproxy.com
const PROXY_PORT = Number(process.env.JOYPROXY_PORT || 9001);
const PROXY_USER = process.env.JOYPROXY_USER || '';
const PROXY_PASS = process.env.JOYPROXY_PASS || '';

function randomSessId() {
  return Math.random().toString(36).slice(2, 10);
}

// Low-level HTTP CONNECT proxy fetch for Agoda metadata JSON with retries
function proxyFetchJsonOnce(targetUrl, headers = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(targetUrl);
    const sessId = randomSessId();
    const username = `customer-jp-${PROXY_USER}r-cc-rand-iptype-residential-sessid-${sessId}-sesstime-1-backup-1`;
    const auth = Buffer.from(`${username}:${PROXY_PASS}`).toString('base64');

    const connectReq = http.request({
      host: PROXY_HOST,
      port: PROXY_PORT,
      method: 'CONNECT',
      path: `${parsed.hostname}:443`,
      headers: { 'Proxy-Authorization': `Basic ${auth}` },
      timeout: 10000,
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return resolve(null);
      }

      const tlsSocket = tls.connect(
        { socket, servername: parsed.hostname, rejectUnauthorized: false },
        () => {
          let reqStr =
            `GET ${parsed.pathname}${parsed.search} HTTP/1.1\r\n` +
            `Host: ${parsed.hostname}\r\n` +
            `User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36\r\n` +
            `Accept: application/json, text/plain, */*\r\n` +
            `Referer: https://www.agoda.com/\r\n`;
          for (const [k, v] of Object.entries(headers)) {
            reqStr += `${k}: ${v}\r\n`;
          }
          reqStr += `Connection: close\r\n\r\n`;
          tlsSocket.write(reqStr);
        }
      );

      let raw = '';
      tlsSocket.on('data', (d) => {
        raw += d.toString('utf8');
      });

      tlsSocket.on('close', () => {
        const [h, ...bodyParts] = raw.split('\r\n\r\n');
        resolve(bodyParts.join('\r\n\r\n'));
      });

      tlsSocket.on('error', () => resolve(null));
      tlsSocket.setTimeout(10000, () => {
        tlsSocket.destroy();
        resolve(null);
      });
    });

    connectReq.on('error', () => resolve(null));
    connectReq.on('timeout', () => {
      connectReq.destroy();
      resolve(null);
    });
    connectReq.end();
  });
}

async function proxyFetchJson(targetUrl, headers = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const res = await proxyFetchJsonOnce(targetUrl, headers);
    if (res && res.length > 500) return res;
  }
  return null;
}

// Low-level HTTP CONNECT proxy fetch for Agoda HTML with retries
function proxyFetchHtmlOnce(targetUrl) {
  return new Promise((resolve) => {
    const parsed = new URL(targetUrl);
    const sessId = randomSessId();
    const username = `customer-jp-${PROXY_USER}r-cc-rand-iptype-residential-sessid-${sessId}-sesstime-1-backup-1`;
    const auth = Buffer.from(`${username}:${PROXY_PASS}`).toString('base64');

    const connectReq = http.request({
      host: PROXY_HOST,
      port: PROXY_PORT,
      method: 'CONNECT',
      path: `${parsed.hostname}:443`,
      headers: { 'Proxy-Authorization': `Basic ${auth}` },
      timeout: 10000,
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return resolve(null);
      }

      const tlsSocket = tls.connect(
        { socket, servername: parsed.hostname, rejectUnauthorized: false },
        () => {
          const reqStr =
            `GET ${parsed.pathname}${parsed.search} HTTP/1.1\r\n` +
            `Host: ${parsed.hostname}\r\n` +
            `User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36\r\n` +
            `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n` +
            `Connection: close\r\n\r\n`;
          tlsSocket.write(reqStr);
        }
      );

      let raw = '';
      tlsSocket.on('data', (d) => {
        raw += d.toString('utf8');
      });

      tlsSocket.on('close', () => {
        const [h, ...bodyParts] = raw.split('\r\n\r\n');
        resolve(bodyParts.join('\r\n\r\n'));
      });

      tlsSocket.on('error', () => resolve(null));
      tlsSocket.setTimeout(10000, () => {
        tlsSocket.destroy();
        resolve(null);
      });
    });

    connectReq.on('error', () => resolve(null));
    connectReq.on('timeout', () => {
      connectReq.destroy();
      resolve(null);
    });
    connectReq.end();
  });
}

async function proxyFetchHtml(targetUrl, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    const res = await proxyFetchHtmlOnce(targetUrl);
    if (res && res.length > 500) return res;
  }
  return null;
}

function cleanChunked(raw) {
  if (!raw) return null;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    let candidate = raw.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      const stripped = candidate.replace(/\r\n[0-9a-fA-F]+\r\n/g, '');
      try {
        return JSON.parse(stripped);
      } catch (err) {
        return null;
      }
    }
  }
  return null;
}

function extractHotelIdFromHtml(html) {
  if (!html) return null;
  const m1 = html.match(/hotel_id=(\d+)/);
  if (m1 && m1[1] !== '0') return m1[1];
  const m2 = html.match(/hotelId:(\d+)/);
  if (m2 && m2[1] !== '0') return m2[1];
  const m3 = html.match(/propertyId:(\d+)/);
  if (m3 && m3[1] !== '0') return m3[1];
  return null;
}

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 15 });

function fetchSuggest(query) {
  const url = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https.get(
      url,
      {
        agent: httpsAgent,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(null);
          }
        });
      }
    ).on('error', () => resolve(null));
  });
}

const CITY_ALIASES = {
  'delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'aerocity', 'ghaziabad', 'faridabad'],
  'new delhi': ['delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram', 'noida', 'aerocity'],
  'gurgaon': ['gurgaon', 'gurugram', 'delhi', 'ncr'],
  'faridabad': ['faridabad', 'delhi', 'ncr'],
  'mumbai': ['mumbai', 'bombay', 'navi mumbai', 'thane'],
  'bangalore': ['bangalore', 'bengaluru'],
  'bengaluru': ['bangalore', 'bengaluru'],
  'kolkata': ['kolkata', 'calcutta'],
  'chennai': ['chennai', 'madras'],
  'kochi': ['kochi', 'cochin', 'ernakulam'],
  'varanasi': ['varanasi', 'benares', 'banaras', 'kashi'],
  'agra': ['agra', 'tajganj'],
  'jaipur': ['jaipur', 'amer', 'kukas'],
  'udaipur': ['udaipur', 'pichola'],
  'goa': ['goa', 'panaji', 'calangute', 'candolim', 'anjuna', 'vagator', 'bardez', 'salcete', 'morjim', 'baga', 'colva', 'benaulim'],
  'munnar': ['munnar', 'idukki', 'devikulam', 'chinnakanal'],
  'kodaikanal': ['kodaikanal', 'vattakanal'],
  'panchgani': ['panchgani', 'mahabaleshwar'],
  'mahabaleshwar': ['mahabaleshwar', 'panchgani'],
  'lonavala': ['lonavala', 'khandala'],
  'shimla': ['shimla', 'mashobra', 'kufri', 'chail'],
  'manali': ['manali', 'kullu'],
  'dharamshala': ['dharamshala', 'mcleodganj', 'kangra'],
  'rishikesh': ['rishikesh', 'tapovan', 'haridwar'],
  'haridwar': ['haridwar', 'rishikesh'],
  'amritsar': ['amritsar'],
  'chandigarh': ['chandigarh', 'panchkula', 'mohali', 'zirakpur'],
  'karjat': ['karjat'],
  'alibaug': ['alibaug'],
  'nashik': ['nashik'],
  'siliguri': ['siliguri'],
  'darjeeling': ['darjeeling'],
};

function matchesCity(itemCity, targetCity, itemCountry, targetCountry) {
  if (!itemCity || !targetCity) return false;
  const a = itemCity.toLowerCase();
  const b = targetCity.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  for (const [key, aliases] of Object.entries(CITY_ALIASES)) {
    if (b.includes(key) && aliases.some((al) => a.includes(al))) return true;
  }
  if (targetCountry && itemCountry) {
    const c1 = itemCountry.toLowerCase();
    const c2 = targetCountry.toLowerCase();
    if (c1.includes(c2) || c2.includes(c1)) {
      if (a.slice(0, 4) === b.slice(0, 4) || a.includes(b) || b.includes(a)) return true;
    }
  }
  return false;
}

function strictHotelMatch(targetName, candidateName) {
  const norm = (s) =>
    (s || '')
      .toLowerCase()
      .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const stopWords = new Set([
    'hotel', 'hotels', 'resorts', 'resort', 'spa', 'suites', 'suite', 'the', 'and', 'by', 'near',
    'in', 'of', '&', 'an', 'a', 'luxury', 'boutique', 'retreat', 'villas', 'villa', 'homestay', 'palace'
  ]);
  const t1 = norm(targetName).split(' ').filter((w) => w.length >= 3 && !stopWords.has(w));
  const t2 = norm(candidateName).split(' ').filter((w) => w.length >= 3 && !stopWords.has(w));
  if (t1.length === 0 || t2.length === 0) return norm(targetName) === norm(candidateName);
  const set2 = new Set(t2);
  const common = t1.filter((w) => set2.has(w));
  const simMax = common.length / Math.max(t1.length, t2.length);
  const simMin = common.length / Math.min(t1.length, t2.length);
  return simMax >= 0.45 && simMin >= 0.65;
}

async function resolveHotelAgodaStrict(hotel) {
  const cleanName = (hotel.name || '')
    .replace(/\(.*?\)/g, '')
    .replace(/,\s*[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g, '')
    .replace(/\b(Near|Opposite|Behind|At|Road|Tapovan|Fatehabad Road|City Center|Sector \d+)\b.*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const queries = [
    hotel.name,
    `${cleanName} ${hotel.city}`,
    cleanName
  ];

  for (const q of queries) {
    if (!q || q.length < 3) continue;
    const data = await fetchSuggest(q);
    const list = (data?.ViewModelList || []).filter((x) => x.IsHotel && x.ObjectId > 0);
    for (const item of list) {
      if (matchesCity(item.CityName, hotel.city, item.CountryName, hotel.country)) {
        if (strictHotelMatch(hotel.name, item.Name)) {
          return item.ObjectId;
        }
      }
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
}

function normalizeAgodaImageUrl(rawUrl) {
  if (!rawUrl) return null;
  let u = rawUrl.startsWith('//') ? 'https:' + rawUrl : rawUrl;
  // Upgrade bstatic to max1024x768
  u = u.replace(/\/max\d+(?:x\d+)?\//i, '/max1024x768/');
  // Upgrade agoda to s=1024x768
  u = u.replace(/s=\d+x\d+/i, 's=1024x768');
  return u;
}

function selectTop5AgodaPhotos(secondaryData) {
  const mosaic = secondaryData?.mosaicInitData?.mosaicImages || [];
  const all = secondaryData?.mosaicInitData?.images || [];
  const selected = [];
  const seenUrls = new Set();

  function addPhoto(img, tag) {
    if (!img) return;
    const url = normalizeAgodaImageUrl(img.location || img);
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    selected.push({
      url,
      tag,
      title: img.title || img.group || tag,
    });
  }

  // 1. Bathtub / Jacuzzi / Bathroom priority (up to 2)
  const bathPhotos = all.filter((img) =>
    /bath|tub|jacuzzi|whirlpool|hot tub|soak|shower/i.test(
      `${img.title || ''} ${img.caption || ''} ${img.group || ''}`
    )
  );
  bathPhotos.slice(0, 2).forEach((img) => addPhoto(img, 'Bathtub / Bathroom'));

  // 2. Mosaic hero images (up to 3)
  mosaic.slice(0, 4).forEach((img) => {
    if (selected.length < 5) {
      addPhoto(img, img.group || 'Hero / Mosaic');
    }
  });

  // 3. Room images from all pool if still under 5
  if (selected.length < 5) {
    const roomPhotos = all.filter(
      (img) => img.isRoomImage || (img.group && img.group.toLowerCase().includes('room'))
    );
    roomPhotos.slice(0, 5).forEach((img) => {
      if (selected.length < 5) {
        addPhoto(img, 'Room / Suite');
      }
    });
  }

  // 4. Any remaining photos from all pool
  if (selected.length < 5) {
    all.slice(0, 10).forEach((img) => {
      if (selected.length < 5) {
        addPhoto(img, 'Property');
      }
    });
  }

  return selected.slice(0, 5);
}

// Download image buffer directly (bypasses proxy to save bandwidth and maximize speed)
async function downloadImageBuffer(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    return null;
  }
}

// Optimize to WebP and upload to Cloudflare R2
async function processAndUploadToR2(rawBuffer, hotelSlug, photoIndex) {
  try {
    const webpBuffer = await sharp(rawBuffer)
      .resize(1200, 800, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer();

    const r2Key = `${R2_PREFIX}${hotelSlug}-${photoIndex}.webp`;
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return `${R2_PUBLIC_DOMAIN}/${r2Key}`;
  } catch (err) {
    return null;
  }
}

// Fetch Airbnb Photos
async function extractAirbnbPhotos(airbnbUrl) {
  try {
    const localizedUrl = (airbnbUrl || '').replace(/airbnb\.(?:com|co\.uk|ca)/i, 'airbnb.co.in');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(localizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const html = await res.text();
    const muscache = html.match(/https:\/\/a0\.muscache\.com\/im\/pictures\/[^\s"'\\]+/g) || [];
    const unique = [
      ...new Set(
        muscache
          .map((u) => u.split('?')[0])
          .filter(
            (u) =>
              !u.includes('user') &&
              !u.includes('profile') &&
              !u.includes('AirbnbPlatformAssets') &&
              !u.includes('static') &&
              (u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png') || u.endsWith('.webp'))
          )
      ),
    ];

    return unique.slice(0, 5).map((u, i) => ({
      url: `${u}?im_w=1200`,
      tag: i === 0 ? 'Primary Suite' : `Room Photo ${i + 1}`,
      title: `Airbnb Room Photo ${i + 1}`,
    }));
  } catch (err) {
    return [];
  }
}

// Main runner with Worker Pool Concurrency
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const cityArg = args.find((a) => a.startsWith('--city='));
  const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
  const dryRun = args.includes('--dry-run');

  const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10000;
  const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 4;
  const targetCity = cityArg ? cityArg.split('=')[1].trim() : null;

  console.log(`\n======================================================`);
  console.log(`🚀 Hotel Multi-Image Scaled Scraper & R2 Pipeline Started`);
  console.log(`Target Limit: ${LIMIT >= 10000 ? 'ALL' : LIMIT} hotels`);
  console.log(`Concurrency Workers: ${CONCURRENCY}`);
  if (targetCity) console.log(`Target City: ${targetCity}`);
  console.log(`Dry Run: ${dryRun ? 'YES' : 'NO'}`);
  console.log(`======================================================\n`);

  await mongoose.connect(process.env.MONGODB_URI);
  const Hotel = mongoose.connection.collection('hotels');

  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  let localCacheHotels = [];
  if (fs.existsSync(cachePath)) {
    try {
      localCacheHotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (e) {
      localCacheHotels = [];
    }
  }

  // Query hotels needing multi-images
  const query = {
    $or: [{ images: { $exists: false } }, { images: { $size: 0 } }, { 'images.3': { $exists: false } }],
  };
  if (targetCity) {
    query.city = new RegExp(`^${targetCity}$`, 'i');
  }

  const candidates = await Hotel.find(query, {
    projection: {
      name: 1,
      slug: 1,
      city: 1,
      country: 1,
      agodaUrl: 1,
      agodaHotelId: 1,
      airbnbUrl: 1,
      bookingUrl: 1,
      image: 1,
      images: 1,
    },
  }).toArray();

  console.log(`Found ${candidates.length} hotels needing multi-images.`);

  // Prioritize hotels with direct Agoda or Airbnb
  const prioritized = candidates
    .filter((h) => h.agodaUrl || h.airbnbUrl || h.name)
    .sort((a, b) => {
      const aDirect =
        (a.agodaUrl && (a.agodaUrl.includes('/hotel/') || a.agodaUrl.includes('hid='))) ||
        (a.airbnbUrl && a.airbnbUrl.includes('/rooms/'));
      const bDirect =
        (b.agodaUrl && (b.agodaUrl.includes('/hotel/') || b.agodaUrl.includes('hid='))) ||
        (b.airbnbUrl && b.airbnbUrl.includes('/rooms/'));
      if (aDirect && !bDirect) return -1;
      if (!aDirect && bDirect) return 1;
      return 0;
    })
    .slice(0, LIMIT);

  console.log(`Queued ${prioritized.length} candidate hotels for processing.\n`);

  let processedCount = 0;
  let successCount = 0;
  let skippedCount = 0;
  let totalUploadedImages = 0;
  let unpersistedUpdates = 0;
  let queueIndex = 0;

  async function processHotel(hotel, itemIndex, totalItems, workerId) {
    let extractedPhotos = [];

    // 1. Agoda Extraction
    let hotelId = hotel.agodaHotelId;

    if (!hotelId && hotel.agodaUrl) {
      const hidMatch = hotel.agodaUrl.match(/hid=(\d+)/) || hotel.agodaUrl.match(/-h(\d+)/);
      hotelId = hidMatch ? hidMatch[1] : null;
    }

    if (!hotelId && hotel.agodaUrl && hotel.agodaUrl.includes('/hotel/') && hotel.agodaUrl.includes('.html')) {
      const html = await proxyFetchHtml(hotel.agodaUrl);
      hotelId = extractHotelIdFromHtml(html);
      if (hotelId) {
        await Hotel.updateOne({ _id: hotel._id }, { $set: { agodaHotelId: hotelId } }).catch(() => {});
      }
    }

    // Strict Agoda resolver fallback for partnersearch URLs or unmapped properties
    if (!hotelId) {
      const resolvedId = await resolveHotelAgodaStrict(hotel);
      if (resolvedId) {
        hotelId = String(resolvedId);
        const resolvedAgodaUrl = `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&hid=${hotelId}`;
        await Hotel.updateOne(
          { _id: hotel._id },
          {
            $set: {
              agodaHotelId: hotelId,
              agodaUrl: resolvedAgodaUrl,
            },
          }
        ).catch(() => {});
        hotel.agodaHotelId = hotelId;
        hotel.agodaUrl = resolvedAgodaUrl;
      }
    }

    if (hotelId) {
      const secondaryRaw = await proxyFetchJson(
        `https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData?hotel_id=${hotelId}&all=false&isHostPropertiesEnabled=true`
      );
      const secondaryData = cleanChunked(secondaryRaw);
      if (secondaryData) {
        extractedPhotos = selectTop5AgodaPhotos(secondaryData);
      }
    }

    // Secondary fallback: if hotel had an old/stale ID in URL that returned insufficient photos, try resolving via strict search!
    if (extractedPhotos.length < 3) {
      const resolvedId = await resolveHotelAgodaStrict(hotel);
      if (resolvedId && String(resolvedId) !== hotelId) {
        hotelId = String(resolvedId);
        const resolvedAgodaUrl = `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1972736&hid=${hotelId}`;
        await Hotel.updateOne(
          { _id: hotel._id },
          {
            $set: {
              agodaHotelId: hotelId,
              agodaUrl: resolvedAgodaUrl,
            },
          }
        ).catch(() => {});
        hotel.agodaHotelId = hotelId;
        hotel.agodaUrl = resolvedAgodaUrl;

        const secondaryRaw = await proxyFetchJson(
          `https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData?hotel_id=${hotelId}&all=false&isHostPropertiesEnabled=true`
        );
        const secondaryData = cleanChunked(secondaryRaw);
        if (secondaryData) {
          extractedPhotos = selectTop5AgodaPhotos(secondaryData);
        }
      }
    }

    // 2. Airbnb Fallback
    if (extractedPhotos.length < 4 && hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) {
      const airbnbPhotos = await extractAirbnbPhotos(hotel.airbnbUrl);
      if (airbnbPhotos.length >= 4) {
        extractedPhotos = airbnbPhotos;
      }
    }

    processedCount++;
    const pct = ((processedCount / totalItems) * 100).toFixed(1);

    if (extractedPhotos.length < 3) {
      skippedCount++;
      console.log(
        `[W${workerId} | ${processedCount}/${totalItems} (${pct}%)] ⚠️ SKIPPED: "${hotel.name}" (${hotel.city}) - insufficient photos (${extractedPhotos.length})`
      );
      return;
    }

    if (dryRun) {
      successCount++;
      console.log(
        `[W${workerId} | ${processedCount}/${totalItems} (${pct}%)] 🔍 DRY RUN: "${hotel.name}" (${hotel.city}) - found ${extractedPhotos.length} photos`
      );
      return;
    }

    // Download and upload to Cloudflare R2
    const uploadedR2Urls = [];
    for (let pIdx = 0; pIdx < extractedPhotos.length; pIdx++) {
      const p = extractedPhotos[pIdx];
      const buf = await downloadImageBuffer(p.url);
      if (!buf) continue;

      const r2Url = await processAndUploadToR2(buf, hotel.slug, pIdx + 1);
      if (r2Url) {
        uploadedR2Urls.push(r2Url);
        totalUploadedImages++;
      }
    }

    if (uploadedR2Urls.length >= 3) {
      await Hotel.updateOne(
        { _id: hotel._id },
        {
          $set: {
            images: uploadedR2Urls,
            image: uploadedR2Urls[0],
          },
        }
      );

      const cachedItem = localCacheHotels.find(
        (h) => String(h._id) === String(hotel._id) || h.slug === hotel.slug
      );
      if (cachedItem) {
        cachedItem.images = uploadedR2Urls;
        cachedItem.image = uploadedR2Urls[0];
      }

      successCount++;
      unpersistedUpdates++;

      console.log(
        `[W${workerId} | ${processedCount}/${totalItems} (${pct}%)] ✅ UPDATED: "${hotel.name}" (${hotel.city}) -> +${uploadedR2Urls.length} R2 photos (Total uploaded: ${totalUploadedImages})`
      );

      // Periodically persist to .cache/all-hotels.json every 20 hotels
      if (unpersistedUpdates >= 20 && localCacheHotels.length > 0) {
        unpersistedUpdates = 0;
        try {
          fs.writeFileSync(cachePath, JSON.stringify(localCacheHotels, null, 2));
          console.log(`   💾 Autosaved progress to .cache/all-hotels.json`);
        } catch (e) {}
      }
    } else {
      skippedCount++;
      console.log(
        `[W${workerId} | ${processedCount}/${totalItems} (${pct}%)] ⚠️ UPLOAD FAILED: "${hotel.name}" (${hotel.city}) - only ${uploadedR2Urls.length} uploaded`
      );
    }
  }

  // Worker loop
  async function worker(workerId) {
    while (queueIndex < prioritized.length) {
      const idx = queueIndex++;
      const hotel = prioritized[idx];
      try {
        await processHotel(hotel, idx, prioritized.length, workerId);
      } catch (err) {
        console.error(`[W${workerId}] Error on "${hotel.name}":`, err.message);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Final flush to cache
  if (localCacheHotels.length > 0) {
    try {
      fs.writeFileSync(cachePath, JSON.stringify(localCacheHotels, null, 2));
      console.log(`💾 Final sync to .cache/all-hotels.json completed.`);
    } catch (e) {}
  }

  console.log(`\n======================================================`);
  console.log(`🏁 Batch Pipeline Complete Summary:`);
  console.log(`- Processed: ${processedCount} hotels`);
  console.log(`- Successfully Updated: ${successCount} hotels`);
  console.log(`- Skipped: ${skippedCount} hotels`);
  console.log(`- Total Images Uploaded to R2: ${totalUploadedImages}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
