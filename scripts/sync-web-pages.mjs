import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const BOOKING_AID = '304142';
const AGODA_CID = '1972736';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing in environment variables.');
  process.exit(1);
}

function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function parseBookingHtml(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('[data-testid="property-card"]').each((_, el) => {
    const card = $(el);
    const titleEl = card.find('[data-testid="title"]');
    const name = titleEl.text().trim();
    const titleLink = card.find('a[data-testid="title-link"]').attr('href') ||
                      card.find('a[href*="/hotel/"]').attr('href');

    if (name && titleLink) {
      try {
        const full = titleLink.startsWith('http') ? titleLink : `https://www.booking.com${titleLink}`;
        const u = new URL(full);
        const cleanUrl = `https://www.booking.com${u.pathname}`;
        if (cleanUrl.includes('/hotel/')) {
          results.push({
            name,
            cleanUrl: `${cleanUrl}?aid=${BOOKING_AID}`,
            slug: u.pathname.split('/').pop() || '',
          });
        }
      } catch {}
    }
  });

  return results;
}

function parseAgodaHtml(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('li[data-selenium="hotel-item"], [data-selenium="hotel-card"]').each((_, el) => {
    const card = $(el);
    const name = card.find('[data-selenium="hotel-name"]').text().trim();
    const link = card.find('a[href*="/hotel/"]').attr('href');

    if (name && link) {
      try {
        const full = link.startsWith('http') ? link : `https://www.agoda.com${link}`;
        const u = new URL(full);
        const cleanUrl = `https://www.agoda.com${u.pathname}`;
        results.push({
          name,
          cleanUrl: `${cleanUrl}?cid=${AGODA_CID}`,
          slug: u.pathname.split('/').pop() || '',
        });
      } catch {}
    }
  });

  return results;
}

async function syncWebPages() {
  const webPagesDir = path.join(rootDir, 'web_pages');
  if (!fs.existsSync(webPagesDir)) {
    console.log('No web_pages directory found. Please create web_pages/<platform>/<city>.html');
    return;
  }

  console.log('🚀 Scanning web_pages/ folder for platform-saved HTML files...');
  await mongoose.connect(MONGODB_URI);
  const coll = mongoose.connection.collection('hotels');

  const platforms = fs.readdirSync(webPagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);

  let totalMatched = 0;

  for (const platform of platforms) {
    const platformDir = path.join(webPagesDir, platform);
    const files = fs.readdirSync(platformDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));

    for (const file of files) {
      const cityGuess = path.basename(file, path.extname(file)).replace(/[-_]/g, ' ').toLowerCase();
      const filePath = path.join(platformDir, file);
      console.log(`\n📁 Processing ${platform} -> ${file} (City target: "${cityGuess}")...`);

      const html = fs.readFileSync(filePath, 'utf8');
      let extracted = [];

      if (platform.includes('booking')) {
        extracted = parseBookingHtml(html);
      } else if (platform.includes('agoda')) {
        extracted = parseAgodaHtml(html);
      }

      console.log(`   Extracted ${extracted.length} hotels from ${file}`);

      if (extracted.length === 0) continue;

      // Find hotels in DB for this city
      const dbHotels = await coll.find({
        city: { $regex: new RegExp(cityGuess, 'i') },
        flagged: { $ne: true },
      }).toArray();

      console.log(`   Found ${dbHotels.length} hotels in database for city "${cityGuess}"`);

      for (const ext of extracted) {
        const normExt = normalizeName(ext.name);

        const match = dbHotels.find(h => {
          const normDb = normalizeName(h.name);
          return normExt.includes(normDb) || normDb.includes(normExt);
        });

        if (match) {
          const update = {};
          if (platform.includes('booking')) {
            update.bookingUrl = ext.cleanUrl;
            // Also upgrade generic search url
            if (!match.url || match.url.includes('searchresults.html')) {
              update.url = ext.cleanUrl;
            }
          } else if (platform.includes('agoda')) {
            update.agodaUrl = ext.cleanUrl;
          }

          if (Object.keys(update).length > 0) {
            await coll.updateOne({ _id: match._id }, { $set: update });
            console.log(`   ✅ Matched & Updated: "${match.name}" -> ${ext.cleanUrl}`);
            totalMatched++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 Web pages sync complete! Total updated records: ${totalMatched}`);

  // Refresh locations and search caches
  console.log('🔄 Regenerating static caches...');
  const allHotels = await coll.find({ flagged: { $ne: true } }).toArray();
  const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
  fs.writeFileSync(cachePath, JSON.stringify(allHotels, null, 2), 'utf8');
  console.log(`✅ Cached ${allHotels.length} hotels in .cache/all-hotels.json.`);

  process.exit(0);
}

syncWebPages().catch(err => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});
