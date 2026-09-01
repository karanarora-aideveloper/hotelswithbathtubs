const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

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

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🔌 Connected to MongoDB Atlas");
  
  const blogs = await Blog.find({}).select('slug title image');
  console.log(`Found ${blogs.length} blogs in MongoDB:`);
  console.log('='.repeat(80));
  blogs.forEach((b) => {
    console.log(`Slug: ${b.slug}\nTitle: ${b.title}\nImage: ${b.image || '❌ MISSING'}`);
    console.log('-'.repeat(80));
  });

  await mongoose.disconnect();
}

main().catch(console.error);
