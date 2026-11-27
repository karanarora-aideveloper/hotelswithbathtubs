import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redirects } from './redirects.mjs';
// Plain JSON so the cloud build (Node 20, no .ts loading) can read it.
import { readFileSync as readDupFile } from 'node:fs';
const DUPLICATE_DROP_SLUGS = new Set(JSON.parse(readDupFile(new URL('../src/data/duplicateHotels.json', import.meta.url), 'utf8')).map((p) => p.dropSlug));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const baseUrl = 'https://www.hotelswithbathtubs.com';

const redirectSet = new Set(redirects.map((r) => r.source.replace(/\/$/, '')));

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&+/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const countryMap = {
  'usa': { slug: 'usa', displayName: 'USA' },
  'united-states': { slug: 'usa', displayName: 'USA' },
  'united states': { slug: 'usa', displayName: 'USA' },
  'uk': { slug: 'uk', displayName: 'UK' },
  'united-kingdom': { slug: 'uk', displayName: 'UK' },
  'united kingdom': { slug: 'uk', displayName: 'UK' },
  'uae': { slug: 'uae', displayName: 'UAE' },
  'united-arab-emirates': { slug: 'uae', displayName: 'UAE' },
  'united arab emirates': { slug: 'uae', displayName: 'UAE' },
  'india': { slug: 'india', displayName: 'India' },
};

function isJacuzziRoom(h) {
  if (!h) return false;
  const tub = typeof h.tubType === 'string' ? h.tubType : '';
  const room = typeof h.roomType === 'string' ? h.roomType : '';
  const amenities = Array.isArray(h.amenities) ? h.amenities.join(' ') : (typeof h.amenities === 'string' ? h.amenities : '');
  const pattern = /jacuzzi|whirlpool|hot tub|jetted|hydro/i;
  return pattern.test(tub) || pattern.test(room) || pattern.test(amenities);
}

function resolveCountry(country) {
  if (!country) return { slug: '', displayName: '' };
  const raw = country.toLowerCase().trim();
  if (countryMap[raw]) return countryMap[raw];
  const s = slugify(country);
  return { slug: s, displayName: country };
}

const US_STATES = [
  'california',
  'florida',
  'hawaii',
  'texas',
  'massachusetts',
  'new-york-state',
  'illinois',
  'colorado',
  'nevada',
  'south-carolina',
  'arizona',
  'tennessee',
  'georgia',
  'pennsylvania',
  'washington',
  'oregon',
  'north-carolina',
];

const neighborhoodCanonicalMap = {
  'calangute': 'goa',
  'panjim': 'goa',
  'koramangala': 'bangalore',
  'mahipalpur': 'delhi',
  'paharganj': 'delhi',
};

// Keep in step with src/lib/indexing.ts (GROWTH-FIX1, 25 Nov 2026).
const MIN_HOTELS_TO_INDEX = 3;

function isHotelConfirmed(h) {
  return Boolean(h.importBatch && Array.isArray(h.bookingTubLabels) && h.bookingTubLabels.length > 0);
}

function shouldIndexHotel(h, countrySlug) {
  if (isHotelConfirmed(h)) return true;
  if (h.importBatch) return false;
  return countrySlug === 'usa' || countrySlug === 'india';
}

function shouldIndexDestination(hotelCount) {
  return (hotelCount || 0) >= MIN_HOTELS_TO_INDEX;
}

function formatDate(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function generateSplitSitemaps() {
  const cachePath = path.join(rootDir, '.cache', 'all-hotels.json');
  const blogCachePath = path.join(rootDir, '.cache', 'all-blogs.json');

  if (!fs.existsSync(cachePath)) {
    throw new Error('.cache/all-hotels.json missing');
  }

  const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const blogs = fs.existsSync(blogCachePath) ? JSON.parse(fs.readFileSync(blogCachePath, 'utf8')) : [];

  const countryLastMod = new Map();
  const locationLastMod = new Map();
  const locationHotelCount = new Map();
  const locationJacuzziCount = new Map();

  const hotelRoutesUsa = [];
  const hotelRoutesIndia = [];
  const hotelRoutesWorld = [];
  const seenHotelUrls = new Set();

  for (const h of hotels) {
    if (!h.city || !h.country || h.flagged === true || DUPLICATE_DROP_SLUGS.has(h.slug)) continue;
    const countryInfo = resolveCountry(h.country);
    let citySlug = slugify(h.city);
    if (neighborhoodCanonicalMap[citySlug]) {
      citySlug = neighborhoodCanonicalMap[citySlug];
    }
    if (!countryInfo.slug || !citySlug) continue;

    const locKey = `${countryInfo.slug}/${citySlug}`;
    const hotelUpdated = h.updatedAt ? new Date(h.updatedAt) : null;

    locationHotelCount.set(locKey, (locationHotelCount.get(locKey) || 0) + 1);

    // Track jacuzzi hotels (M3 room-only rule)
    if (isJacuzziRoom(h)) {
      locationJacuzziCount.set(locKey, (locationJacuzziCount.get(locKey) || 0) + 1);
    }

    if (hotelUpdated && !isNaN(hotelUpdated.getTime())) {
      const currCountryDate = countryLastMod.get(countryInfo.slug);
      if (!currCountryDate || hotelUpdated > currCountryDate) {
        countryLastMod.set(countryInfo.slug, hotelUpdated);
      }
      const currLocDate = locationLastMod.get(locKey);
      if (!currLocDate || hotelUpdated > currLocDate) {
        locationLastMod.set(locKey, hotelUpdated);
      }
    }

    const hotelSlug = slugify(h.slug || h.name);
    if (hotelSlug) {
      const hotelPath = `/${countryInfo.slug}/${citySlug}/${hotelSlug}`;
      const hotelUrl = `${baseUrl}${hotelPath}`;
      if (!seenHotelUrls.has(hotelUrl) && !redirectSet.has(hotelPath) && shouldIndexHotel(h, countryInfo.slug)) {
        seenHotelUrls.add(hotelUrl);
        const item = {
          url: hotelUrl,
          // No lastmod: updatedAt is the last bulk data write, not a real page change (GROWTH-FIX1).
          lastModified: null,
          priority: 0.65,
        };
        if (countryInfo.slug === 'usa') {
          hotelRoutesUsa.push(item);
        } else if (countryInfo.slug === 'india') {
          hotelRoutesIndia.push(item);
        } else {
          hotelRoutesWorld.push(item);
        }
      }
    }
  }

  // 1. Pages Sitemap
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 1.0 },
    { url: `${baseUrl}/hotels-with-bathtub`, lastModified: new Date('2026-11-26T00:00:00.000Z'), priority: 0.95 },
    { url: `${baseUrl}/hotels-with-bathtub-near-me`, lastModified: new Date('2026-11-26T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/matchmaker`, lastModified: new Date('2026-10-07T00:00:00.000Z'), priority: 0.95 },
    { url: `${baseUrl}/couple-friendly`, lastModified: new Date('2026-10-19T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/soaking-tub-hotels`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/hotels-with-hot-tub-in-room`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/hostels`, lastModified: new Date('2026-10-19T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/destinations`, lastModified: new Date('2026-10-26T00:00:00.000Z'), priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/how-we-check-bathtubs`, lastModified: new Date('2026-10-27T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/editorial-policy`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/affiliate-policy`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
  ];

  // Every country and city with hotels, whether or not its hotels carry an updatedAt date.
  const countrySlugs = new Set(Array.from(locationHotelCount.keys()).map((k) => k.split('/')[0]));
  const countryRoutes = Array.from(countrySlugs)
    .filter((countrySlug) => !redirectSet.has(`/${countrySlug}`))
    .map((countrySlug) => ({
      url: `${baseUrl}/${countrySlug}`,
      lastModified: null,
      priority: 0.85,
    }));

  const usaLastMod = countryLastMod.get('usa');
  const stateRoutes = US_STATES
    .filter((slug) => !redirectSet.has(`/usa/${slug}`))
    .map((slug) => ({
      url: `${baseUrl}/usa/${slug}`,
      lastModified: null,
      priority: 0.85,
    }));

  const locationRoutes = Array.from(locationHotelCount.keys())
    .filter((loc) => shouldIndexDestination(locationHotelCount.get(loc)) && !redirectSet.has(`/${loc}`))
    .map((loc) => ({
      url: `${baseUrl}/${loc}`,
      lastModified: null,
      priority: 0.8,
    }));

  const jacuzziRoutes = Array.from(locationJacuzziCount.keys())
    .filter((loc) => shouldIndexDestination(locationJacuzziCount.get(loc)) && !redirectSet.has(`/${loc}/jacuzzi`))
    .map((loc) => ({
      url: `${baseUrl}/${loc}/jacuzzi`,
      lastModified: null,
      priority: 0.8,
    }));

  const pageRoutes = [
    ...staticRoutes,
    ...countryRoutes,
    ...stateRoutes,
    ...locationRoutes,
    ...jacuzziRoutes,
  ];

  // 2. Blog Routes
  const MONTH_NAMES = {
    january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
    sep: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
  };
  function parseBlogDate(val) {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val !== 'string') return null;
    const s = val.trim();
    if (!s) return null;
    const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymd) {
      if (s.length === 10) return new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3]));
      const parsed = new Date(s);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const mdy = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
    if (mdy) {
      const m = MONTH_NAMES[mdy[1].toLowerCase()];
      if (m !== undefined) return new Date(Date.UTC(+mdy[3], m, +mdy[2]));
    }
    const my = s.match(/^([A-Za-z]+)\s+(\d{4})/);
    if (my) {
      const m = MONTH_NAMES[my[1].toLowerCase()];
      if (m !== undefined) return new Date(Date.UTC(+my[2], m, 1));
    }
    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const blogRoutes = blogs
    .filter((b) => b.published !== false && b.slug && b.slug.trim() !== '' && b.slug !== 'kolkata-hotels-with-bathtub-couples-guide')
    .filter((b) => !redirectSet.has(`/blog/${slugify(b.slug)}`))
    .map((b) => {
      const pub = parseBlogDate(b.date);
      const up = parseBlogDate(b.updatedAt);
      const hasUp = Boolean(up && pub && up.getTime() > pub.getTime());
      return {
        url: `${baseUrl}/blog/${slugify(b.slug)}`,
        lastModified: hasUp ? up : (pub || up),
        priority: 0.7,
      };
    });

  function buildUrlsetXml(routes) {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];
    for (const r of routes) {
      lines.push('  <url>');
      lines.push(`    <loc>${xmlEscape(r.url)}</loc>`);
      const mod = formatDate(r.lastModified);
      if (mod) {
        lines.push(`    <lastmod>${mod}</lastmod>`);
      }
      if (r.priority) {
        lines.push(`    <priority>${r.priority}</priority>`);
      }
      lines.push('  </url>');
    }
    lines.push('</urlset>');
    return lines.join('\n') + '\n';
  }

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), buildUrlsetXml(pageRoutes), 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap-hotels-usa.xml'), buildUrlsetXml(hotelRoutesUsa), 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap-hotels-india.xml'), buildUrlsetXml(hotelRoutesIndia), 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap-hotels-world.xml'), buildUrlsetXml(hotelRoutesWorld), 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), buildUrlsetXml(blogRoutes), 'utf8');

  // Sitemap Index
  const childSitemaps = [
    { name: 'sitemap-pages.xml', lastmod: formatDate(new Date('2026-10-26T00:00:00.000Z')) },
    { name: 'sitemap-hotels-usa.xml', lastmod: formatDate(countryLastMod.get('usa')) },
    { name: 'sitemap-hotels-india.xml', lastmod: formatDate(countryLastMod.get('india')) },
    { name: 'sitemap-hotels-world.xml', lastmod: formatDate(new Date('2026-10-26T00:00:00.000Z')) },
    { name: 'sitemap-blog.xml', lastmod: formatDate(new Date('2026-10-26T00:00:00.000Z')) },
    { name: 'sitemap-images.xml', lastmod: formatDate(new Date('2026-10-26T00:00:00.000Z')) },
  ];

  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...childSitemaps.map((s) => `  <sitemap>
    <loc>${baseUrl}/${s.name}</loc>
    ${s.lastmod ? `<lastmod>${s.lastmod}</lastmod>` : ''}
  </sitemap>`),
    '</sitemapindex>',
  ].join('\n') + '\n';

  fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), indexXml, 'utf8');

  // Also maintain sitemap.xml as full list or index for backwards compatibility
  const allRoutes = [
    ...pageRoutes,
    ...blogRoutes,
    ...hotelRoutesUsa,
    ...hotelRoutesIndia,
    ...hotelRoutesWorld,
  ];
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildUrlsetXml(allRoutes), 'utf8');

  console.log('✅ Generated split sitemaps:');
  console.log(`   - sitemap-pages.xml: ${pageRoutes.length} URLs`);
  console.log(`   - sitemap-hotels-usa.xml: ${hotelRoutesUsa.length} URLs`);
  console.log(`   - sitemap-hotels-india.xml: ${hotelRoutesIndia.length} URLs`);
  console.log(`   - sitemap-hotels-world.xml: ${hotelRoutesWorld.length} URLs`);
  console.log(`   - sitemap-blog.xml: ${blogRoutes.length} URLs`);
  console.log(`   - total URLs across new sitemaps: ${allRoutes.length}`);
  console.log(`   - sitemap_index.xml: ${childSitemaps.length} child sitemaps`);
  console.log(`   - sitemap.xml: ${allRoutes.length} URLs (backwards compatible)`);

  return {
    pageRoutesCount: pageRoutes.length,
    usaCount: hotelRoutesUsa.length,
    indiaCount: hotelRoutesIndia.length,
    worldCount: hotelRoutesWorld.length,
    blogCount: blogRoutes.length,
    totalCount: allRoutes.length,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSplitSitemaps();
}
