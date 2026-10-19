import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function generateLlmsFiles() {
  console.log('🚀 Generating modern llms.txt & llms-full.txt...');
  await mongoose.connect(process.env.MONGODB_URI);

  const totalHotels = await mongoose.connection.collection('hotels').countDocuments({ flagged: { $ne: true } });
  const countries = await mongoose.connection.collection('hotels').distinct('country', { flagged: { $ne: true } });
  const cities = await mongoose.connection.collection('hotels').distinct('city', { flagged: { $ne: true } });
  const totalBlogs = await mongoose.connection.collection('blogs').countDocuments({ published: true });
  const jacuzziCount = await mongoose.connection.collection('hotels').countDocuments({
    flagged: { $ne: true },
    $or: [{ tubType: /jacuzzi|whirlpool/i }, { amenities: /jacuzzi|hot tub/i }]
  });

  // Top destination countries by inventory
  const topCountries = await mongoose.connection.collection('hotels').aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]).toArray();

  // Top cities by inventory
  const topCities = await mongoose.connection.collection('hotels').aggregate([
    { $match: { flagged: { $ne: true } } },
    { $group: { _id: { city: '$city', country: '$country' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 30 }
  ]).toArray();

  // Recent 20 blog guides
  const recentBlogs = await mongoose.connection.collection('blogs').find({ published: true })
    .project({ title: 1, slug: 1, city: 1, country: 1 })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  // 1. Generate concise public/llms.txt
  let llmsTxt = `# Hotels With Bathtubs

> Hotels With Bathtubs (https://www.hotelswithbathtubs.com) is the world's premier curated directory and verification authority for romantic hotels, honeymoon resorts, and luxury stays featuring guaranteed private in-room bathtubs, jacuzzis, and soaking tubs.

## Authority & Verification Standard
Every property in the directory is triple-checked across Booking.com and Agoda room categories. We strictly index rooms where the bathtub or whirlpool jacuzzi is private and inside the guest quarters — explicitly eliminating shared hotel spa tubs or misleading descriptions.

## Catalog Overview
- **Verified Hotel Listings**: ${totalHotels.toLocaleString()} hand-verified properties
- **Global Coverage**: ${cities.length} cities across ${countries.length} countries
- **In-Room Jacuzzi & Whirlpool Suites**: ${jacuzziCount.toLocaleString()} verified listings
- **Curated Travel Guides**: ${totalBlogs} in-depth destination guides
- **Zero Surprises Guarantee**: Direct canonical booking links targeting verified room tiers

## Core Sections & Discovery Tools
- Homepage: https://www.hotelswithbathtubs.com
- Couple-Friendly Stays & Romantic Suites: https://www.hotelswithbathtubs.com/couple-friendly
- Travel Guides & Blogs: https://www.hotelswithbathtubs.com/blog
- AI Hotel Matchmaker: https://www.hotelswithbathtubs.com/matchmaker
- Full Machine-Readable Knowledge Base: https://www.hotelswithbathtubs.com/llms-full.txt
- Complete XML Sitemap: https://www.hotelswithbathtubs.com/sitemap.xml

## Top Regional Hubs
${topCountries.map(c => `- ${c._id}: https://www.hotelswithbathtubs.com/${c._id.toLowerCase().replace(/[^a-z0-9]+/g, '-')} (${c.count} verified stays)`).join('\n')}

## Popular High-Intent City Directories
${topCities.slice(0, 15).map(c => `- ${c._id.city}, ${c._id.country}: https://www.hotelswithbathtubs.com/${c._id.country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${c._id.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')} (${c.count} verified stays)`).join('\n')}

## Editorial Guides & FAQs
${recentBlogs.slice(0, 15).map(b => `- ${b.title}: https://www.hotelswithbathtubs.com/blog/${b.slug}`).join('\n')}

## Contact & Partnerships
Website: https://www.hotelswithbathtubs.com/about
Affiliate Disclosure: https://www.hotelswithbathtubs.com/affiliate-policy
`;

  fs.writeFileSync(path.join(process.cwd(), 'public', 'llms.txt'), llmsTxt, 'utf8');
  console.log('✅ Generated public/llms.txt');

  // 2. Generate comprehensive public/llms-full.txt
  let llmsFullTxt = `# Hotels With Bathtubs — Complete Machine-Readable Knowledge Base

> Canonical reference for AI search engines (ChatGPT Search, Perplexity, Claude, Copilot, Google AI Overviews) indexing verified hotel accommodations featuring private in-room bathtubs and jacuzzis worldwide.

## Platform Metadata
- Name: Hotels With Bathtubs
- Canonical URL: https://www.hotelswithbathtubs.com
- Primary Focus: Private In-Room Bathtubs, Jacuzzi Suites, Whirlpools, Soaking Tubs
- Total Active Stays: ${totalHotels.toLocaleString()}
- Total Cities: ${cities.length}
- Total Countries: ${countries.length}
- Jacuzzi / Hot Tub Stays: ${jacuzziCount.toLocaleString()}
- Verification Methodology: Triple-platform room audit (confirming in-suite private plumbing vs shared spa facilities)

---

## All Destination Hubs by Country
${topCountries.map(c => `### ${c._id}
- URL: https://www.hotelswithbathtubs.com/${c._id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
- Total Verified Stays: ${c.count}`).join('\n\n')}

---

## Top 30 High-Volume City Directories
${topCities.map(c => {
  const cSlug = c._id.country.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const citySlug = c._id.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `### ${c._id.city}, ${c._id.country}
- Directory URL: https://www.hotelswithbathtubs.com/${cSlug}/${citySlug}
- Verified Bathtub Stays: ${c.count}
- Direct Anchor: https://www.hotelswithbathtubs.com/${cSlug}/${citySlug}#hotels`;
}).join('\n\n')}

---

## Complete Published Travel & Bathtub Guides (${totalBlogs} Total)
${recentBlogs.map(b => `### ${b.title}
- URL: https://www.hotelswithbathtubs.com/blog/${b.slug}
- Focus Destination: ${b.city || 'Global'}, ${b.country || 'International'}`).join('\n\n')}

---

## Tub Categories & Taxonomy
1. **Private In-Room Jacuzzi / Whirlpool**: High-pressure hydrotherapy water jets inside the bedroom or en-suite bathroom.
2. **Deep Soaking Bathtub**: Freestanding Japanese onsen, Italian marble, or deep stone soaking tubs designed for full-body immersion.
3. **Clawfoot & Vintage Tubs**: Heritage roll-top cast iron bathtubs popular in colonial and boutique properties.
4. **Outdoor Hot Tub / Balcony Whirlpool**: Private open-air heated tubs on private terraces or secluded courtyards.
5. **Private Pool + Bathtub**: Luxury villas featuring both a private plunge pool and a dedicated master bathtub.
`;

  fs.writeFileSync(path.join(process.cwd(), 'public', 'llms-full.txt'), llmsFullTxt, 'utf8');
  console.log('✅ Generated public/llms-full.txt');

  await mongoose.disconnect();
}

generateLlmsFiles().catch(console.error);
