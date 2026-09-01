const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
const { put } = require('@vercel/blob');
const mongoose = require('mongoose');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const PEXELS_API_KEY = "CgkJbk9KEfh7u2qIVMAj7kGAgb1VJzV7rsmB7TWrfwcXWGm5bQSZcaJU";

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

async function processBlog(filename) {
  const postsDir = path.join(__dirname, '..', 'blog_posts');
  const filePath = path.join(postsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing file: ${filename}`);
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(rawContent);

  // Determine search query based on tags or title
  let searchQuery = "luxury hotel bathtub";
  if (frontmatter.tags) {
    // Parse tags (tags string might be like [bali, indonesia])
    const cleanTags = frontmatter.tags.replace(/[\[\]"]/g, '').split(',').map(t => t.trim());
    if (cleanTags.includes('bali')) {
      searchQuery = "bali luxury bathtub pool";
    } else if (cleanTags.includes('london')) {
      searchQuery = "london hotel room luxury";
    } else if (cleanTags.includes('dubai')) {
      searchQuery = "dubai luxury hotel room";
    } else if (cleanTags.includes('jaipur') || cleanTags.includes('udaipur')) {
      searchQuery = "india luxury heritage hotel palace";
    } else {
      searchQuery = cleanTags[0] + " luxury hotel bathtub";
    }
  }

  console.log(`Searching Pexels for query: "${searchQuery}"`);
  const searchResults = await queryPexels(searchQuery);

  if (!searchResults.photos || searchResults.photos.length === 0) {
    console.log("No images found on Pexels.");
    return;
  }

  const photo = searchResults.photos[0];
  const imageUrl = photo.src.large2x;
  console.log(`Found Pexels photo ID ${photo.id} by ${photo.photographer}`);

  // Download buffer
  console.log("Downloading image...");
  const buffer = await downloadImageBuffer(imageUrl);

  // Upload to Vercel Blob
  console.log("Uploading to Vercel Blob...");
  const blobName = `blog_${frontmatter.slug}.jpeg`;
  const blob = await put(`images/${blobName}`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  console.log(`Uploaded! Blob URL: ${blob.url}`);

  // Update markdown file frontmatter
  frontmatter.image = blob.url;
  const updatedContent = stringifyFrontmatter(frontmatter, body);
  fs.writeFileSync(filePath, updatedContent, 'utf-8');
  console.log("Updated markdown file successfully.");

  // Import to MongoDB
  console.log("Syncing to MongoDB Atlas...");
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env.local");
  }
  await mongoose.connect(process.env.MONGODB_URI);

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
    { upsert: true, new: true }
  );

  console.log(`✅ MongoDB Synced for slug: ${frontmatter.slug}`);
}

async function main() {
  try {
    const filename = process.argv[2] || "bali-villas-private-pool-bathtub.md";
    await processBlog(filename);
  } catch (error) {
    console.error("Workflow failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
