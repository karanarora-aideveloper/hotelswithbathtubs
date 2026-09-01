const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const replacements = [
  // Blog slug fixes
  { from: /\/blog\/verify-hotel-amenities(?=[)\s"'])/g, to: '/blog/verify-hotel-amenities-accurate-booking' },
  { from: /\/blog\/budget-romantic-trips-india(?=[)\s"'])/g, to: '/blog/budget-romantic-getaway-india' },
  { from: /\/blog\/honeymoon-hotels-bathtubs(?=[)\s"'])/g, to: '/blog/honeymoon-hotels-freestanding-bathtubs-india' },
  { from: /\/blog\/how-verification-works(?=[)\s"'])/g, to: '/#verification' },
  { from: /\/blog\/luxury-couple-hotels-india-cities(?=[)\s"'])/g, to: '/blog/best-hotels-private-jacuzzi-couples-india' },
  
  // Destination URL fixes
  { from: /\/usa\/new-york-city(?=[)\s"'])/g, to: '/usa/new-york' },
  { from: /\/india\/gurgaon(?=[)\s"'])/g, to: '/india/delhi' },
  { from: /\/india\/jaipur(?=[)\s"'])/g, to: '/india/udaipur' },
  { from: /\/india\/lucknow(?=[)\s"'])/g, to: '/india/delhi' },
  { from: /\/india\/rishikesh(?=[)\s"'])/g, to: '/india/shimla' },
  { from: /https:\/\/www\.hotelswithbathtubs\.com\/india\/jaipur(?=[)\s"'])/g, to: 'https://www.hotelswithbathtubs.com/india/udaipur' },
  { from: /https:\/\/www\.hotelswithbathtubs\.com\/india\/bangalore(?=[)\s"'])/g, to: 'https://www.hotelswithbathtubs.com/india/kolkata' },
  { from: /https:\/\/www\.hotelswithbathtubs\.com\/india\/goa(?=[)\s"'])/g, to: 'https://www.hotelswithbathtubs.com/india/munnar' },
  { from: /\/india\/goa(?=[)\s"'])/g, to: '/india/munnar' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Blog = mongoose.model('Blog', new mongoose.Schema({
    content: String,
    slug: String,
    title: String
  }, { strict: false }));

  const postsDir = path.join(__dirname, '..', 'blog_posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated file: ${file}`);
    }
  }

  // Update DB directly
  const blogs = await Blog.find({});
  for (const blog of blogs) {
    let content = blog.content || '';
    let changed = false;

    for (const r of replacements) {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    }

    if (changed) {
      blog.content = content;
      await blog.save();
      console.log(`✅ Updated MongoDB Blog: ${blog.slug}`);
    }
  }

  console.log('Finished fixing all broken links!');
  process.exit(0);
}

run().catch(console.error);
