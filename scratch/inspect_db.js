require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspectDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hotelsCol = mongoose.connection.collection('hotels');
  const candidatesCol = mongoose.connection.collection('hotelcandidates');
  const blogsCol = mongoose.connection.collection('blogs');

  const activeCities = await hotelsCol.aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: "$city", country: "$country" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  const flaggedHotels = await hotelsCol.countDocuments({ flagged: true });
  const totalHotels = await hotelsCol.countDocuments();
  const totalCandidates = await candidatesCol.countDocuments();
  const totalBlogs = await blogsCol.countDocuments();
  const blogs = await blogsCol.find({}).project({ slug: 1, title: 1, date: 1, published: 1 }).toArray();

  console.log("=== ACTIVE CITIES IN DB ===");
  activeCities.forEach(c => {
    console.log(`- ${c._id.city}, ${c._id.country}: ${c.count} hotels`);
  });

  console.log("\n=== TOTAL COUNTS ===");
  console.log(`Total Hotels in DB: ${totalHotels} (Flagged/Hidden: ${flaggedHotels}, Active: ${totalHotels - flaggedHotels})`);
  console.log(`Total Candidates in DB: ${totalCandidates}`);
  console.log(`Total Blogs in DB: ${totalBlogs}`);

  console.log("\n=== BLOGS IN DB ===");
  blogs.forEach(b => console.log(`- [${b.published ? 'LIVE' : 'DRAFT'}] "${b.title}" (slug: ${b.slug})`));

  await mongoose.disconnect();
}

inspectDb().catch(console.error);
