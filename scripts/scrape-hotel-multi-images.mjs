import http from 'http';
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

// Low-level HTTP CONNECT proxy fetch for Agoda metadata JSON
function proxyFetchJson(targetUrl, headers = {}) {
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
      timeout: 12000,
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
    });

    connectReq.on('error', () => resolve(null));
    connectReq.on('timeout', () => {
      connectReq.destroy();
      resolve(null);
    });
    connectReq.end();
  });
}

// Low-level HTTP CONNECT proxy fetch for Agoda HTML
function proxyFetchHtml(targetUrl) {
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
      timeout: 12000,
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
    });

    connectReq.on('error', () => resolve(null));
    connectReq.on('timeout', () => {
      connectReq.destroy();
      resolve(null);
    });
    connectReq.end();
  });
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
  if (m1) return m1[1];
  const m2 = html.match(/hotelId:(\d+)/);
  if (m2) return m2[1];
  const m3 = html.match(/propertyId:(\d+)/);
  if (m3) return m3[1];
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
    console.error(`Sharp/R2 upload error for ${hotelSlug}-${photoIndex}:`, err.message);
    return null;
  }
}

// Fetch Airbnb Photos
async function extractAirbnbPhotos(airbnbUrl) {
  try {
    // For Indian listings or .com listings, airbnb.co.in serves direct full SSR HTML
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

// Main runner
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const cityArg = args.find((a) => a.startsWith('--city='));
  const dryRun = args.includes('--dry-run');
  const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;
  const targetCity = cityArg ? cityArg.split('=')[1].trim() : null;

  console.log(`\n======================================================`);
  console.log(`🚀 Hotel Multi-Image Extraction & R2 Pipeline Started`);
  console.log(`Target Limit: ${LIMIT} hotels`);
  if (targetCity) console.log(`Target City: ${targetCity}`);
  console.log(`Dry Run: ${dryRun ? 'YES (No upload/DB write)' : 'NO (Live Upload to R2 & DB)'}`);
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

  // Query hotels where images array has fewer than 4 images
  const query = {
    $or: [{ images: { $exists: false } }, { images: { $size: 0 } }, { 'images.3': { $exists: false } }],
  };
  if (targetCity) {
    query.city = new RegExp(`^${targetCity}$`, 'i');
  }

  // Fetch candidate hotels with projection for maximum speed
  const candidates = await Hotel.find(query, {
    projection: {
      name: 1,
      slug: 1,
      city: 1,
      country: 1,
      agodaUrl: 1,
      airbnbUrl: 1,
      bookingUrl: 1,
      image: 1,
      images: 1,
    },
  }).toArray();
  console.log(`Found ${candidates.length} hotels needing multi-images.`);

  const prioritized = candidates
    .filter((h) => h.agodaUrl || h.airbnbUrl)
    .sort((a, b) => {
      // Prioritize Agoda direct HTML or hid
      const aAgoda = a.agodaUrl && (a.agodaUrl.includes('/hotel/') || a.agodaUrl.includes('hid='));
      const bAgoda = b.agodaUrl && (b.agodaUrl.includes('/hotel/') || b.agodaUrl.includes('hid='));
      if (aAgoda && !bAgoda) return -1;
      if (!aAgoda && bAgoda) return 1;
      return 0;
    })
    .slice(0, LIMIT);

  console.log(`Selected ${prioritized.length} candidate hotels for this run.\n`);

  let processedCount = 0;
  let successCount = 0;
  let skippedCount = 0;
  let totalUploadedImages = 0;

  for (let i = 0; i < prioritized.length; i++) {
    const hotel = prioritized[i];
    processedCount++;
    console.log(
      `\n[${processedCount}/${prioritized.length}] Processing: "${hotel.name}" (${hotel.city}, ${hotel.country})`
    );

    let extractedPhotos = [];

    // 1. Try Agoda
    if (hotel.agodaUrl) {
      let hidMatch = hotel.agodaUrl.match(/hid=(\d+)/) || hotel.agodaUrl.match(/-h(\d+)/);
      let hotelId = hidMatch ? hidMatch[1] : null;

      // If no explicit hid, fetch HTML to extract hotelId
      if (!hotelId && hotel.agodaUrl.includes('/hotel/') && hotel.agodaUrl.includes('.html')) {
        process.stdout.write(`   Fetching Agoda HTML for hid... `);
        const html = await proxyFetchHtml(hotel.agodaUrl);
        hotelId = extractHotelIdFromHtml(html);
        if (hotelId) {
          process.stdout.write(`Found HID: ${hotelId}\n`);
        } else {
          process.stdout.write(`No HID found\n`);
        }
      }

      if (hotelId) {
        process.stdout.write(`   Fetching Agoda Secondary Data for HID ${hotelId}... `);
        const secondaryRaw = await proxyFetchJson(
          `https://www.agoda.com/api/cronos/property/BelowFoldParams/GetSecondaryData?hotel_id=${hotelId}&all=false&isHostPropertiesEnabled=true`
        );
        const secondaryData = cleanChunked(secondaryRaw);
        if (secondaryData) {
          extractedPhotos = selectTop5AgodaPhotos(secondaryData);
          process.stdout.write(`Selected ${extractedPhotos.length} photos!\n`);
        } else {
          process.stdout.write(`Failed to parse secondary data\n`);
        }
      }
    }

    // 2. Try Airbnb fallback if Agoda returned < 4 photos
    if (extractedPhotos.length < 4 && hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) {
      process.stdout.write(`   Fetching Airbnb photos from ${hotel.airbnbUrl}... `);
      const airbnbPhotos = await extractAirbnbPhotos(hotel.airbnbUrl);
      if (airbnbPhotos.length >= 4) {
        extractedPhotos = airbnbPhotos;
        process.stdout.write(`Found ${airbnbPhotos.length} Airbnb photos!\n`);
      } else {
        process.stdout.write(`Found ${airbnbPhotos.length} photos\n`);
      }
    }

    if (extractedPhotos.length < 3) {
      console.log(`   ⚠️ Skipped: Only found ${extractedPhotos.length} photos (minimum 3 required).`);
      skippedCount++;
      continue;
    }

    console.log(`   📸 Extracted ${extractedPhotos.length} verified photos:`);
    extractedPhotos.forEach((p, idx) => {
      console.log(`      ${idx + 1}. [${p.tag}] ${p.url.slice(0, 80)}...`);
    });

    if (dryRun) {
      console.log(`   [DRY RUN] Would upload ${extractedPhotos.length} photos to R2 and update MongoDB.`);
      successCount++;
      continue;
    }

    // Download and upload to R2
    const uploadedR2Urls = [];
    for (let pIdx = 0; pIdx < extractedPhotos.length; pIdx++) {
      const p = extractedPhotos[pIdx];
      process.stdout.write(`   Uploading photo ${pIdx + 1}/${extractedPhotos.length}... `);
      const buf = await downloadImageBuffer(p.url);
      if (!buf) {
        process.stdout.write(`Download failed!\n`);
        continue;
      }

      const r2Url = await processAndUploadToR2(buf, hotel.slug, pIdx + 1);
      if (r2Url) {
        uploadedR2Urls.push(r2Url);
        totalUploadedImages++;
        process.stdout.write(`Uploaded: ${r2Url.split('/').pop()}\n`);
      } else {
        process.stdout.write(`Upload failed!\n`);
      }
    }

    if (uploadedR2Urls.length >= 3) {
      // Update MongoDB
      await Hotel.updateOne(
        { _id: hotel._id },
        {
          $set: {
            images: uploadedR2Urls,
            image: uploadedR2Urls[0], // Set primary image to the first uploaded photo
          },
        }
      );

      // Update in-memory local cache
      const cachedItem = localCacheHotels.find(
        (h) => String(h._id) === String(hotel._id) || h.slug === hotel.slug
      );
      if (cachedItem) {
        cachedItem.images = uploadedR2Urls;
        cachedItem.image = uploadedR2Urls[0];
      }

      console.log(`   ✅ Successfully updated MongoDB with ${uploadedR2Urls.length} images!`);
      successCount++;
    } else {
      console.log(`   ⚠️ Insufficient successful uploads (${uploadedR2Urls.length}). Did not update DB.`);
      skippedCount++;
    }
  }

  // Persist local cache update if any hotels were updated
  if (successCount > 0 && localCacheHotels.length > 0) {
    fs.writeFileSync(cachePath, JSON.stringify(localCacheHotels, null, 2));
    console.log(`💾 Persisted updates to .cache/all-hotels.json`);
  }

  console.log(`\n======================================================`);
  console.log(`🏁 Pipeline Complete Summary:`);
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
