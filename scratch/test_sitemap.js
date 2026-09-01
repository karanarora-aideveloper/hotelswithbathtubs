require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testSitemap() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hotelsCol = mongoose.connection.collection('hotels');
  const blogsCol = mongoose.connection.collection('blogs');

  const hotels = await hotelsCol.find({ flagged: { $ne: true } }).project({ country: 1, city: 1 }).toArray();
  const uniqueLocations = new Set(
    hotels.map(h => `${encodeURIComponent(h.country.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(h.city.toLowerCase().replace(/\s+/g, '-'))}`)
  );

  const blogs = await blogsCol.find({ published: true }).project({ slug: 1 }).toArray();

  console.log(`Total Location URLs in Sitemap: ${uniqueLocations.size}`);
  console.log(`Total Blog URLs in Sitemap: ${blogs.length}`);
  console.log(`Total Sitemap URLs: ${8 + uniqueLocations.size + blogs.length}`);

  console.log("\nSample Location URLs:");
  Array.from(uniqueLocations).slice(0, 15).forEach(l => console.log(`  https://www.hotelswithbathtubs.com/${l}`));

  console.log("\nSample Blog URLs:");
  blogs.slice(0, 10).forEach(b => console.log(`  https://www.hotelswithbathtubs.com/blog/${b.slug}`));

  await mongoose.disconnect();
}

testSitemap().catch(console.error);
