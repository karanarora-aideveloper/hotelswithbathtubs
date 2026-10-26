import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redirects } from './redirects.mjs';
import { DUPLICATE_DROP_SLUGS } from '../src/data/duplicateHotels.ts';

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

const MIN_HOTELS_TO_INDEX = 2;

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

    const isJacuzzi = (h.tubType && /jacuzzi|whirlpool|hot tub|jet/i.test(h.tubType)) ||
      (Array.isArray(h.amenities) && h.amenities.some((a) => /jacuzzi|hot tub|whirlpool/i.test(a)));
    if (isJacuzzi) {
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
      const hotelUrl = `${baseUrl}/${countryInfo.slug}/${citySlug}/${hotelSlug}`;
      if (!seenHotelUrls.has(hotelUrl)) {
        seenHotelUrls.add(hotelUrl);
        const item = {
          url: hotelUrl,
          lastModified: hotelUpdated,
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
    { url: `${baseUrl}/matchmaker`, lastModified: new Date('2026-10-07T00:00:00.000Z'), priority: 0.95 },
    { url: `${baseUrl}/couple-friendly`, lastModified: new Date('2026-10-19T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/soaking-tub-hotels`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/hotels-with-hot-tub-in-room`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/hostels`, lastModified: new Date('2026-10-19T00:00:00.000Z'), priority: 0.9 },
    { url: `${baseUrl}/destinations`, lastModified: new Date('2026-10-26T00:00:00.000Z'), priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/editorial-policy`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-10-22T00:00:00.000Z'), priority: 0.6 },
    { url: `${baseUrl}/affiliate-policy`, lastModified: new Date('2026-09-08T00:00:00.000Z'), priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: new Date('2026-08-01T00:00:00.000Z'), priority: 0.3 },
  ];

  const countryRoutes = Array.from(countryLastMod.keys()).map((countrySlug) => ({
    url: `${baseUrl}/${countrySlug}`,
    lastModified: countryLastMod.get(countrySlug),
    priority: 0.85,
  }));

  const usaLastMod = countryLastMod.get('usa');
  const stateRoutes = US_STATES.map((slug) => ({
    url: `${baseUrl}/usa/${slug}`,
    lastModified: usaLastMod,
    priority: 0.85,
  }));

  const locationRoutes = Array.from(locationLastMod.keys())
    .filter((loc) => shouldIndexDestination(locationHotelCount.get(loc)))
    .map((loc) => ({
      url: `${baseUrl}/${loc}`,
      lastModified: locationLastMod.get(loc),
      priority: 0.8,
    }));

  const jacuzziRoutes = Array.from(locationJacuzziCount.keys())
    .filter((loc) => shouldIndexDestination(locationJacuzziCount.get(loc)))
    .map((loc) => ({
      url: `${baseUrl}/${loc}/jacuzzi`,
      lastModified: locationLastMod.get(loc),
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
  const blogRoutes = blogs
    .filter((b) => b.published !== false && b.slug && b.slug.trim() !== '' && b.slug !== 'kolkata-hotels-with-bathtub-couples-guide')
    .filter((b) => !redirectSet.has(`/blog/${slugify(b.slug)}`))
    .map((b) => ({
      url: `${baseUrl}/blog/${slugify(b.slug)}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : null,
      priority: 0.7,
    }));

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
