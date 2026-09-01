require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function enrichBlogTitles() {
  await mongoose.connect(process.env.MONGODB_URI);
  const blogsCol = mongoose.connection.collection('blogs');

  const postsDir = path.join(__dirname, '../blog_posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const slug = file.replace('.md', '');
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    
    // Find the first H1 in the markdown body
    const bodyMatch = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
    const h1Match = bodyMatch.match(/^#\s+(.+)$/m);
    
    if (h1Match && h1Match[1]) {
      const fullTitle = h1Match[1].trim();
      await blogsCol.updateOne({ slug }, { $set: { title: fullTitle } });
      console.log(`Enriched [${slug}] -> "${fullTitle}"`);
    }
  }

  await mongoose.disconnect();
}

enrichBlogTitles().catch(console.error);
