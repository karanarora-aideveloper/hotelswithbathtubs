#!/usr/bin/env node

/**
 * Import blog posts from markdown files to MongoDB
 *
 * Usage:
 * node import-blogs.js              # Import all blog posts
 * node import-blogs.js --delete     # Delete existing posts and reimport
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // Try default .env as fallback
}

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return; // Already connected
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Blog model
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

const Blog = mongoose.model('Blog', BlogSchema);

/**
 * Parse markdown frontmatter
 * Format:
 * ---
 * key: value
 * ---
 * # Content here
 */
const parseFrontmatter = (content) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatterText = match[1];
  const body = match[2];

  // Parse YAML-like frontmatter
  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // Remove quotes if present
    frontmatter[key] = value.replace(/^["']|["']$/g, '');
  }

  return { frontmatter, body };
};

/**
 * Read all blog post files from blog_posts directory
 */
const readBlogPosts = () => {
  const postsDir = path.join(__dirname, 'blog_posts');

  if (!fs.existsSync(postsDir)) {
    console.error(`❌ blog_posts directory not found at ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  console.log(`📝 Found ${files.length} blog post files`);

  return files.map((file) => {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    return {
      file,
      ...frontmatter,
      content: body.trim(),
    };
  });
};

/**
 * Import blog posts to MongoDB
 */
const importBlogPosts = async (posts, deleteExisting = false) => {
  try {
    // Delete existing posts if requested
    if (deleteExisting) {
      const slugs = posts.map((p) => p.slug);
      const result = await Blog.deleteMany({ slug: { $in: slugs } });
      console.log(`🗑️  Deleted ${result.deletedCount} existing blog posts`);
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const post of posts) {
      try {
        // Validate required fields
        if (!post.title) throw new Error('Missing title');
        if (!post.slug) throw new Error('Missing slug');
        if (!post.content) throw new Error('Missing content');

        const excerpt = post.description || post.excerpt || post.content.substring(0, 200);
        const date = post.date || post.publishedDate || new Date().toISOString().split('T')[0];
        const published = post.published !== 'false' && post.published !== false;
        const author = post.author || 'Travel Editor';

        // Check if post already exists
        const existing = await Blog.findOne({ slug: post.slug });
        if (existing && !deleteExisting) {
          console.log(`⏭️  Skipped: ${post.slug} (already exists)`);
          skipped++;
          continue;
        }

        // Create or update blog post
        const blogPost = await Blog.findOneAndUpdate(
          { slug: post.slug },
          {
            title: post.title,
            slug: post.slug,
            excerpt: excerpt.substring(0, 500), // Limit excerpt to 500 chars
            content: post.content,
            date,
            published,
            author,
            image: post.image || undefined,
          },
          { upsert: true, new: true }
        );

        console.log(`✅ Imported: ${post.slug}`);
        imported++;
      } catch (error) {
        errors.push({
          file: post.file,
          error: error.message,
        });
        console.log(`❌ Error: ${post.file} - ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    if (errors.length > 0) {
      console.log(`❌ Errors: ${errors.length}`);
      errors.forEach((e) => {
        console.log(`   - ${e.file}: ${e.error}`);
      });
    }
    console.log('='.repeat(50));

    if (imported === 0 && errors.length === 0 && skipped === 0) {
      console.log('⚠️  No posts to import');
    }
  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
};

/**
 * Main execution
 */
const main = async () => {
  try {
    console.log('🚀 Starting blog import...\n');

    // Check for --delete flag
    const deleteExisting = process.argv.includes('--delete');
    if (deleteExisting) {
      console.log('⚠️  Delete flag detected - existing posts will be replaced');
    }

    // Connect to database
    await connectToDatabase();

    // Read blog posts
    const posts = readBlogPosts();
    console.log();

    // Import blog posts
    await importBlogPosts(posts, deleteExisting);

    console.log('\n✨ Import complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

// Run the script
main();
