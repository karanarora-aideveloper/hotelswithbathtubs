const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const blogDir = path.join(__dirname, '_legacy_static', 'blog');
const outputDir = path.join(__dirname, 'src', 'data');
const outputFile = path.join(outputDir, 'blogs.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const blogs = [];

const dirs = fs.readdirSync(blogDir);

for (const dir of dirs) {
  const fullPath = path.join(blogDir, dir);
  if (fs.statSync(fullPath).isDirectory()) {
    const indexPath = path.join(fullPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf-8');
      const $ = cheerio.load(html);
      
      const title = $('h1').first().text().trim();
      let metaStr = $('.blog-meta').text().trim();
      let date = "August 1, 2026"; // default
      if (metaStr.includes('Published on')) {
        date = metaStr.replace('Published on', '').split('by')[0].trim();
      }
      
      // Extract content
      const contentHtml = $('.blog-content').html();
      
      // We can also extract the first paragraph as a short excerpt
      const excerpt = $('.blog-content p').first().text().trim();

      blogs.push({
        slug: dir,
        title,
        date,
        excerpt,
        content: contentHtml
      });
    }
  }
}

fs.writeFileSync(outputFile, JSON.stringify(blogs, null, 2));
console.log(`Successfully migrated ${blogs.length} blogs to src/data/blogs.json`);
