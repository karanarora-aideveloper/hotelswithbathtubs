import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const today = new Date().toISOString().split('T')[0];

const sitemaps = [
  'https://www.hotelswithbathtubs.com/sitemap.xml',
  'https://www.hotelswithbathtubs.com/sitemap-images.xml'
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`;

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap_index.xml'), xml.trim() + '\n', 'utf8');
console.log('✅ Generated public/sitemap_index.xml successfully with', sitemaps.length, 'sitemaps.');
