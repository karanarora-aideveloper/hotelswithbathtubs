import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const countrySlugMap = {
  'united states': 'usa',
  'united-states': 'usa',
  'usa': 'usa',
  'united kingdom': 'uk',
  'united-kingdom': 'uk',
  'uk': 'uk',
  'india': 'india',
  'uae': 'uae',
  'united arab emirates': 'uae',
  'south korea': 'south-korea',
  'new zealand': 'new-zealand',
  'saudi arabia': 'saudi-arabia',
  'czech republic': 'czech-republic',
  'sri lanka': 'sri-lanka',
  'costa rica': 'costa-rica',
  'puerto rico': 'puerto-rico',
  'bosnia and herzegovina': 'bosnia-and-herzegovina',
  'french polynesia': 'french-polynesia',
  'dominican republic': 'dominican-republic',
  'antigua and barbuda': 'antigua-and-barbuda',
  'trinidad and tobago': 'trinidad-and-tobago',
  'saint lucia': 'saint-lucia',
  'turks and caicos': 'turks-and-caicos',
  'cape verde': 'cape-verde',
  'saint kitts and nevis': 'saint-kitts-and-nevis',
  'north macedonia': 'north-macedonia',
  'sao tome and principe': 'sao-tome-and-principe',
  'el salvador': 'el-salvador',
};

function resolveCountrySlug(country) {
  if (!country) return '';
  const lower = country.toLowerCase().trim();
  if (countrySlugMap[lower]) return countrySlugMap[lower];
  return slugify(country);
}

async function generateImageSitemap() {
  console.log('🚀 Generating Google Image Sitemap for all verified hotels...');
  let hotels = [];

  const cachePath = path.join(process.cwd(), '.cache', 'all-hotels.json');
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      hotels = cached.filter((h) => !h.flagged && h.image);
      console.log(`Using .cache/all-hotels.json (${hotels.length} hotels with images).`);
    } catch {
      hotels = [];
    }
  }

  if (!hotels.length) {
    await mongoose.connect(process.env.MONGODB_URI);
    hotels = await mongoose.connection.collection('hotels').find({
      flagged: { $ne: true },
      image: { $exists: true, $ne: '' }
    }).project({
      name: 1,
      city: 1,
      country: 1,
      slug: 1,
      image: 1,
      images: 1,
      tubType: 1,
      roomType: 1
    }).toArray();
    await mongoose.disconnect();
    console.log(`Queried MongoDB (${hotels.length} hotels with images).`);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const baseUrl = 'https://www.hotelswithbathtubs.com';
  let imageCount = 0;

  for (const h of hotels) {
    if (!h.city || !h.country || !h.image) continue;

    const countrySlug = resolveCountrySlug(h.country);
    const citySlug = slugify(h.city);
    const hotelSlug = slugify(h.slug || h.name);

    if (!countrySlug || !citySlug || !hotelSlug) continue;

    const pageUrl = `${baseUrl}/${countrySlug}/${citySlug}/${hotelSlug}`;
    const tub = h.tubType || 'Private In-Room Bathtub';
    const room = h.roomType || 'Bathtub Suite';

    // Collect all valid images for this hotel
    const photoUrls = [h.image, ...(Array.isArray(h.images) ? h.images : [])]
      .map((img) =>
        typeof img === 'string' && (img.includes('agoda.net') || img.includes('agoda.com'))
          ? 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/default-hotel.jpg'
          : img
      )
      .filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx)
      .slice(0, 3); // Max 3 images per hotel

    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(pageUrl)}</loc>\n`;

    for (const imgUrl of photoUrls) {
      const fullImgUrl = imgUrl.startsWith('http')
        ? imgUrl
        : `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/${imgUrl.split('/').pop()}`;

      xml += `    <image:image>\n`;
      xml += `      <image:loc>${xmlEscape(fullImgUrl)}</image:loc>\n`;
      xml += `      <image:title>${xmlEscape(`${h.name} — ${tub}`)}</image:title>\n`;
      xml += `      <image:caption>${xmlEscape(`Verified ${tub} in ${room} at ${h.name}, ${h.city}, ${h.country}`)}</image:caption>\n`;
      xml += `    </image:image>\n`;
      imageCount++;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outputPath = path.join(process.cwd(), 'public', 'sitemap-images.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`✅ Saved Google Image Sitemap to public/sitemap-images.xml (${imageCount} total images indexed across ${hotels.length} hotels).`);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

generateImageSitemap().catch(console.error);
