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

// Schema
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

async function processBlogDoc(blog) {
  console.log(`\n⏳ Processing Database Blog: "${blog.title}" (${blog.slug})`);

  // Build a query based on title
  let searchQuery = "luxury hotel room bathtub";
  const titleLower = blog.title.toLowerCase();
  
  if (titleLower.includes('goa')) {
    searchQuery = "goa luxury pool villa private jacuzzi";
  } else if (titleLower.includes('bangkok')) {
    searchQuery = "bangkok luxury hotel room bathroom";
  } else if (titleLower.includes('singapore')) {
    searchQuery = "singapore luxury hotel room";
  } else if (titleLower.includes('delhi')) {
    searchQuery = "delhi luxury hotel suite bathtub";
  } else if (titleLower.includes('kolkata')) {
    searchQuery = "kolkata hotel luxury bathroom";
  } else if (titleLower.includes('jacuzzi') || titleLower.includes('hot tub')) {
    searchQuery = "private jacuzzi hotel suite luxury";
  } else if (titleLower.includes('accessible') || titleLower.includes('mobility')) {
    searchQuery = "modern accessible bathroom luxury hotel";
  } else {
    searchQuery = blog.title.replace(/hotels?/i, '').replace(/bathtub/i, '').replace(/rooms?/i, '').replace(/for/i, '').replace(/couples?/i, '').trim() + " hotel bathtub";
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
  const blobName = `blog_${blog.slug}.jpeg`;
  const blob = await put(`images/${blobName}`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  console.log(`☁️  Blob URL: ${blob.url}`);

  // Update MongoDB directly
  await Blog.findByIdAndUpdate(blog._id, { $set: { image: blob.url } });
  console.log(`✅ Synced with MongoDB for slug: ${blog.slug}`);

  // Try to update corresponding markdown file if it exists locally
  const postsDir = path.join(__dirname, '..', 'blog_posts');
  const files = fs.readdirSync(postsDir);
  const matchedFile = files.find(f => {
    if (!f.endsWith('.md')) return false;
    const rawContent = fs.readFileSync(path.join(postsDir, f), 'utf-8');
    try {
      const { frontmatter } = parseFrontmatter(rawContent);
      return frontmatter.slug === blog.slug;
    } catch {
      return false;
    }
  });

  if (matchedFile) {
    const filePath = path.join(postsDir, matchedFile);
    console.log(`📝 Local file match found: ${matchedFile}. Updating local file frontmatter...`);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(rawContent);
    frontmatter.image = blob.url;
    fs.writeFileSync(filePath, stringifyFrontmatter(frontmatter, body), 'utf-8');
  }

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

    // Fetch all blogs
    const blogs = await Blog.find({});
    console.log(`📂 Found ${blogs.length} blogs in MongoDB database.`);

    const pendingBlogs = blogs.filter(b => {
      return !b.image || b.image === DEFAULT_IMAGE || b.image.includes('bathtub-hotel-the-oberoi-bengaluru-bangalore.webp');
    });

    console.log(`📊 Found ${pendingBlogs.length} blogs currently missing custom cover photos. Starting processing...`);

    for (const blog of pendingBlogs) {
      try {
        await processBlogDoc(blog);
      } catch (err) {
        console.error(`❌ Failed to process blog "${blog.title}":`, err.message);
      }
    }

    console.log("\n✨ Done! All database and local blogs updated successfully.");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
