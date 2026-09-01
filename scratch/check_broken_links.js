const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cheerio = require('cheerio');

dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }));
  const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));

  // 1. Get all valid destinations
  const hotels = await Hotel.find({ flagged: { $ne: true } });
  const validDestinations = new Set(
    hotels.map(h => `/${h.country.toLowerCase().replace(/\s+/g, '-')}/${h.city.toLowerCase().replace(/\s+/g, '-')}`)
  );
  console.log('Valid destinations:', Array.from(validDestinations));

  // 2. Get all valid blogs
  const blogs = await Blog.find({ published: true });
  const validBlogs = new Set(blogs.map(b => `/blog/${b.slug}`));
  console.log('Valid blogs count:', validBlogs.size);

  const staticPages = new Set([
    '/',
    '/about',
    '/affiliate-policy',
    '/privacy',
    '/terms',
    '/cookies',
    '/blog',
  ]);

  function isValidInternalUrl(url) {
    let clean = url.replace('https://www.hotelswithbathtubs.com', '').replace('https://hotelswithbathtubs.com', '');
    if (!clean.startsWith('/')) clean = '/' + clean;
    const [pathPart, hash] = clean.split('#');
    if (pathPart === '' || pathPart === '/') return true;
    if (staticPages.has(pathPart)) return true;
    if (validDestinations.has(pathPart)) return true;
    if (validBlogs.has(pathPart)) return true;
    return false;
  }

  // 3. Inspect all blogs for broken links
  for (const blog of blogs) {
    const content = blog.content || '';
    // find all markdown links [text](url) and href="url"
    const mdLinks = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => m[2]);
    const htmlLinks = [...content.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    const allLinks = [...mdLinks, ...htmlLinks];

    const broken = [];
    for (const link of allLinks) {
      if (link.startsWith('http') && !link.includes('hotelswithbathtubs.com')) {
        // external link
        continue;
      }
      if (!isValidInternalUrl(link)) {
        broken.push(link);
      }
    }

    if (broken.length > 0) {
      console.log(`❌ Blog "${blog.title}" (/blog/${blog.slug}) has broken links:`, broken);
    }
  }

  process.exit(0);
}

check().catch(console.error);
