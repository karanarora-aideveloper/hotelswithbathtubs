import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function generateBlogsCache() {
  console.log('📝 Connecting to MongoDB to generate .cache/all-blogs.json...');
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const col = db.collection('blogs');

    const blogs = await col
      .find({ published: true })
      .sort({ createdAt: -1, date: -1 })
      .toArray();

    const cacheDir = path.join(rootDir, '.cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cachePath = path.join(cacheDir, 'all-blogs.json');
    fs.writeFileSync(cachePath, JSON.stringify(blogs, null, 2), 'utf-8');
    console.log(`✅ .cache/all-blogs.json generated successfully: ${blogs.length} published blogs.`);
  } catch (err) {
    console.error('❌ Error generating blogs cache:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

generateBlogsCache();
