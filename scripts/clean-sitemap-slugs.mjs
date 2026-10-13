import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/&+/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function cleanSlugs() {
  const cachePath = path.resolve(process.cwd(), '.cache/all-hotels.json');
  const hotels = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  let modifiedCount = 0;
  const ops = [];

  for (const h of hotels) {
    const rawSlug = h.slug || slugify(h.name);
    const clean = slugify(rawSlug);
    if (h.slug !== clean) {
      h.slug = clean;
      modifiedCount++;
      if (h._id) {
        ops.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(h._id) },
            update: { $set: { slug: clean } },
          },
        });
      }
    }
  }

  console.log(`Cleaned slugs in cache: ${modifiedCount}`);
  fs.writeFileSync(cachePath, JSON.stringify(hotels, null, 2));

  if (process.env.MONGODB_URI && ops.length > 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    const res = await mongoose.connection.collection('hotels').bulkWrite(ops, { ordered: false });
    console.log(`Updated MongoDB slugs: ${res.modifiedCount}`);
    await mongoose.disconnect();
  }
}

cleanSlugs().catch(console.error);
