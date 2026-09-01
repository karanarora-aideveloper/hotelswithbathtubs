require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function fixBlogs() {
  await mongoose.connect(process.env.MONGODB_URI);
  const blogsCol = mongoose.connection.collection('blogs');

  // 1. Read markdown blog posts to get clean titles
  const postsDir = path.join(__dirname, '../blog_posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    
    // Extract title from frontmatter or first H1
    let title = '';
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const titleLine = fmMatch[1].split('\n').find(l => l.startsWith('title:'));
      if (titleLine) {
        title = titleLine.replace(/^title:\s*["']?/, '').replace(/["']?$/, '').trim();
      }
    }
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      if (h1Match) title = h1Match[1].trim();
    }

    if (title && title !== 'Hotels With Bathtubs') {
      await blogsCol.updateOne({ slug }, { $set: { title } });
      console.log(`Updated blog [${slug}] -> "${title}"`);
    }
  }

  // Check blogs in DB
  const allBlogs = await blogsCol.find({}).project({ slug: 1, title: 1 }).toArray();
  console.log("\n=== ALL BLOGS IN DB ===");
  allBlogs.forEach(b => console.log(`- ${b.slug}: "${b.title}"`));

  await mongoose.disconnect();
}

fixBlogs().catch(console.error);
