import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://www.hotelswithbathtubs.com';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function toRssDate(dateVal) {
  if (!dateVal) return new Date().toUTCString();
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

async function generateRss() {
  console.log('📡 Generating public/rss.xml...');

  let blogs = [];
  const blogCachePath = path.join(rootDir, '.cache', 'all-blogs.json');
  if (fs.existsSync(blogCachePath)) {
    try {
      blogs = JSON.parse(fs.readFileSync(blogCachePath, 'utf8'));
    } catch {
      blogs = [];
    }
  }

  if (!blogs.length) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;
      blogs = await db.collection('blogs').find({ published: true }).sort({ createdAt: -1 }).toArray();
      await mongoose.disconnect();
    } catch (err) {
      console.warn('⚠️ Could not connect to DB for RSS generation:', err);
    }
  }

  const itemsXml = blogs.map((b) => {
    const slug = b.slug?.trim();
    if (!slug) return '';
    const link = `${BASE_URL}/blog/${slug}`;
    const pubDate = toRssDate(b.date || b.createdAt);
    const title = escapeXml(b.title || 'Travel Guide');
    const desc = escapeXml(b.excerpt || b.metaDescription || '');

    return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <author>editorial@hotelswithbathtubs.com (Karan Arora)</author>
    </item>`;
  }).filter(Boolean).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hotels With Bathtubs | Curated Luxury Guides &amp; Jacuzzi Stays</title>
    <link>${BASE_URL}/blog</link>
    <description>Expert travel guides, romantic getaway itineraries, and verified in-room bathtub hotel recommendations across 111 countries.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  const outputPath = path.join(rootDir, 'public', 'rss.xml');
  fs.writeFileSync(outputPath, rssXml.trim(), 'utf-8');
  console.log(`✅ Generated public/rss.xml with ${blogs.length} articles.`);
}

generateRss();
