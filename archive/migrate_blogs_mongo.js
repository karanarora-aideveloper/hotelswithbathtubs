const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const blogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  excerpt: String,
  content: String,
  date: String,
  published: { type: Boolean, default: true },
  author: { type: String, default: 'Travel Editor' },
}, { timestamps: true });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const blogsPath = path.join(__dirname, 'src', 'data', 'blogs.json');
    const blogsData = JSON.parse(fs.readFileSync(blogsPath, 'utf-8'));

    let count = 0;
    for (const blog of blogsData) {
      const result = await Blog.updateOne(
        { slug: blog.slug },
        { $set: { ...blog, published: true, author: 'Travel Editor' } },
        { upsert: true }
      );
      if (result.upsertedId || result.modifiedCount > 0) {
        count++;
      }
    }

    console.log(`Successfully migrated ${count} blogs to MongoDB Atlas!`);
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
