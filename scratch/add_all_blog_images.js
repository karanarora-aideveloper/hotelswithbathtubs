const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
const { put } = require('@vercel/blob');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const PEXELS_API_KEY = "CgkJbk9KEfh7u2qIVMAj7kGAgb1VJzV7rsmB7TWrfwcXWGm5bQSZcaJU";
const DEFAULT_IMAGE = "https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp";

// Schema (duplicated from import-blogs)
const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    published: { type: Boolean, default: true },
    author: { type: String, default: 'Travel Editor' },
    image: { type: String },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

// Helper to download image into a Buffer
function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadImageBuffer(response.headers.location).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Helper to query Pexels
function queryPexels(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      headers: { 'Authorization': PEXELS_API_KEY }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) throw new Error('Invalid frontmatter format');
  const frontmatterText = match[1];
  const body = match[2];

  const frontmatter = {};
  frontmatterText.split('\n').forEach((line) => {
    if (!line.trim()) return;
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
    frontmatter[key] = value;
  });

  return { frontmatter, body };
}

function stringifyFrontmatter(frontmatter, body) {
  let fmText = '---\n';
  for (const [key, val] of Object.entries(frontmatter)) {
    fmText += `${key}: "${val}"\n`;
  }
  fmText += '---\n';
  return fmText + body;
}

async function processBlogFile(filename) {
  const postsDir = path.join(__dirname, '..', 'blog_posts');
  const filePath = path.join(postsDir, filename);

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(rawContent);

  // Check if image is missing or is any variation of the default fallback image
  const hasNoCustomImage = !frontmatter.image || 
                           frontmatter.image === DEFAULT_IMAGE || 
                           frontmatter.image.includes('bathtub-hotel-the-oberoi-bengaluru-bangalore.webp');

  if (!hasNoCustomImage) {
    console.log(`⏭️  Skipping ${filename} (already has customized image: ${frontmatter.image})`);
    return;
  }

  console.log(`\n⏳ Processing: ${filename}`);

  // Build a query based on tags or title
  let searchQuery = "luxury hotel room bathtub";
  if (frontmatter.tags) {
    const cleanTags = frontmatter.tags.replace(/[\[\]"]/g, '').split(',').map(t => t.trim());
    
    if (cleanTags.includes('bali')) {
      searchQuery = "bali luxury resort private pool bathtub";
    } else if (cleanTags.includes('london')) {
      searchQuery = "london luxury hotel room bathroom";
    } else if (cleanTags.includes('dubai')) {
      searchQuery = "dubai luxury suite hotel";
    } else if (cleanTags.includes('bangalore')) {
      searchQuery = "bangalore luxury hotel jacuzzi";
    } else if (cleanTags.includes('kolkata')) {
      searchQuery = "kolkata hotel luxury bathtub";
    } else if (cleanTags.includes('delhi')) {
      searchQuery = "delhi luxury hotel suite";
    } else if (cleanTags.includes('jaipur') || cleanTags.includes('udaipur')) {
      searchQuery = "india luxury heritage hotel palace room";
    } else if (cleanTags.includes('manali') || cleanTags.includes('rishikesh')) {
      searchQuery = "luxury mountain resort suite bathtub";
    } else {
      searchQuery = cleanTags[0] + " luxury hotel room";
    }
  } else {
    // Fallback search using title keywords
    searchQuery = frontmatter.title.replace(/hotels?/i, '').replace(/bathtub/i, '').replace(/rooms?/i, '').replace(/for/i, '').replace(/couples?/i, '').trim() + " hotel room";
  }

  console.log(`🔍 Searching Pexels for: "${searchQuery}"`);
  const searchResults = await queryPexels(searchQuery);

  if (!searchResults.photos || searchResults.photos.length === 0) {
    console.log(`⚠️  No images found on Pexels for "${searchQuery}". Trying fallback query.`);
    const fallbackResults = await queryPexels("luxury hotel bathtub");
    if (!fallbackResults.photos || fallbackResults.photos.length === 0) {
      console.log("❌ Fallback search failed. Skipping.");
      return;
    }
    searchResults.photos = fallbackResults.photos;
  }

  const photo = searchResults.photos[0];
  const imageUrl = photo.src.large2x;
  console.log(`📷 Selected Pexels photo ID ${photo.id} by ${photo.photographer}`);

  // Download
  console.log("📥 Downloading image...");
  const buffer = await downloadImageBuffer(imageUrl);

  // Upload to Vercel Blob
  console.log("📤 Uploading to Vercel Blob...");
  const blobName = `blog_${frontmatter.slug}.jpeg`;
  const blob = await put(`images/${blobName}`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  console.log(`☁️  Blob URL: ${blob.url}`);

  // Update markdown file
  frontmatter.image = blob.url;
  const updatedContent = stringifyFrontmatter(frontmatter, body);
  fs.writeFileSync(filePath, updatedContent, 'utf-8');

  // Update MongoDB
  const excerpt = frontmatter.description || frontmatter.excerpt || body.substring(0, 200);
  const date = frontmatter.date || new Date().toISOString().split('T')[0];
  const published = frontmatter.published !== 'false' && frontmatter.published !== false;
  const author = frontmatter.author || 'Travel Editor';

  await Blog.findOneAndUpdate(
    { slug: frontmatter.slug },
    {
      title: frontmatter.title,
      slug: frontmatter.slug,
      excerpt: excerpt.substring(0, 500),
      content: body.trim(),
      date,
      published,
      author,
      image: blob.url,
    },
    { upsert: true }
  );

  console.log(`✅ Synced with MongoDB for slug: ${frontmatter.slug}`);
  
  // Sleep for 1 second to respect Pexels rate limits (max 200 requests/hr)
  await new Promise(resolve => setTimeout(resolve, 1000));
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in .env.local");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔌 Connected to MongoDB Atlas");

    const postsDir = path.join(__dirname, '..', 'blog_posts');
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
    console.log(`📂 Found ${files.length} markdown blog posts. Starting auto-update...`);

    for (const file of files) {
      try {
        await processBlogFile(file);
      } catch (err) {
        console.error(`❌ Failed to process ${file}:`, err.message);
      }
    }

    console.log("\n✨ Done! All blog images updated successfully.");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
