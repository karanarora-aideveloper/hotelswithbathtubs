import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const moves = [
  { from: path.join(rootDir, 'src/app/api/admin'), to: path.join(rootDir, '_cf_tmp_api_admin') },
  { from: path.join(rootDir, 'src/app/api/track-click'), to: path.join(rootDir, '_cf_tmp_api_track_click') },
  { from: path.join(rootDir, 'src/app/admin'), to: path.join(rootDir, '_cf_tmp_admin') },
  { from: path.join(rootDir, 'src/app/api/geo'), to: path.join(rootDir, '_cf_tmp_api_geo') },
  { from: path.join(rootDir, 'src/app/out'), to: path.join(rootDir, '_cf_tmp_out') },
  // admin UI components import from the stashed admin routes, so they must be stashed with them
  { from: path.join(rootDir, 'src/components/admin'), to: path.join(rootDir, '_cf_tmp_components_admin') },
  // proxy.ts (formerly middleware.ts) cannot run in a static export; edge logic lives in functions/_middleware.ts
  { from: path.join(rootDir, 'src/proxy.ts'), to: path.join(rootDir, '_cf_tmp_proxy.ts') },
  // Stash /redesign from static export (saves 292 KB from production bundle)
  { from: path.join(rootDir, 'src/app/redesign'), to: path.join(rootDir, '_cf_tmp_redesign') },
];

function move(from, to) {
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
  }
}

function restoreAll() {
  for (const item of moves) {
    if (fs.existsSync(item.to)) {
      move(item.to, item.from);
    }
  }
  console.log('🔄 Restored local admin and API routes.');
}

const SNAPSHOT_BASE = process.env.DATA_SNAPSHOT_URL || 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/data';

async function downloadSnapshot() {
  const zlib = await import('node:zlib');
  fs.mkdirSync(path.join(rootDir, '.cache'), { recursive: true });
  for (const f of ['all-hotels.json', 'all-blogs.json']) {
    const res = await fetch(`${SNAPSHOT_BASE}/${f}.gz`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`snapshot download failed for ${f}: HTTP ${res.status}`);
    const json = zlib.gunzipSync(Buffer.from(await res.arrayBuffer()));
    const count = JSON.parse(json).length;
    if (!count) throw new Error(`snapshot ${f} is empty`);
    fs.writeFileSync(path.join(rootDir, '.cache', f), json);
    console.log(`   ${f}: ${count} records`);
  }
}

async function build() {
  console.log('🚀 Starting Cloudflare Pages Static Build Pipeline...');

  // Cloud builds (Cloudflare Pages) have no MONGODB_URI: they download the data snapshot from R2
  // (published by `npm run data:refresh`) and the pages read it through src/lib/snapshotModel.ts.
  // On Cloudflare (CF_PAGES=1) always use the snapshot, even if a MONGODB_URI is configured there.
  const snapshotMode = process.env.CF_PAGES === '1' || !process.env.MONGODB_URI;
  if (snapshotMode) {
    console.log('\n[0/4] No MONGODB_URI: building from the R2 data snapshot...');
    await downloadSnapshot();
    process.env.DATA_SNAPSHOT = '1';
  }

  // 1. Generate locations.json & blogs cache
  if (!snapshotMode) {
    console.log('\n[1/4] Generating locations.json and .cache/all-blogs.json from MongoDB...');
    execSync('node scripts/generate-locations.mjs', { cwd: rootDir, stdio: 'inherit' });
    execSync('node scripts/generate-blogs-cache.mjs', { cwd: rootDir, stdio: 'inherit' });
  } else {
    console.log('\n[1/4] Using committed public/locations.json, search-data.json and matchmaker-data.json.');
  }
  execSync('node scripts/audit-hotel-links.mjs', { cwd: rootDir, stdio: 'inherit' });

  // 2. Generate _redirects & city map
  console.log('\n[2/4] Generating functions/cityMap.ts and public/_redirects...');
  execSync('node scripts/generate-city-map.mjs', { cwd: rootDir, stdio: 'inherit' });
  execSync('node scripts/generate-redirects.mjs', { cwd: rootDir, stdio: 'inherit' });

  // 2b. Generate Image Sitemap, Split Sitemaps, LLMs & RSS Feed
  console.log('\n[2b/4] Generating public/sitemaps, public/llms.txt & public/rss.xml...');
  try {
    execSync('node scripts/generate-split-sitemaps.mjs', { cwd: rootDir, stdio: 'inherit' });
    if (snapshotMode) {
      console.log('   Using committed image sitemap, llms & rss.');
    } else {
      execSync('node scripts/generate-image-sitemap.mjs', { cwd: rootDir, stdio: 'inherit' });
      execSync('node scripts/generate-llms-txt.mjs', { cwd: rootDir, stdio: 'inherit' });
      execSync('node scripts/generate-rss.mjs', { cwd: rootDir, stdio: 'inherit' });
    }
  } catch (e) {
    console.warn('⚠️ Warning generating sitemaps / llms / rss:', e.message);
  }

  // 3. Stash dynamic admin/server routes
  console.log('\n[3/4] Stashing local admin & dynamic routes for static export...');
  for (const item of moves) {
    move(item.from, item.to);
  }

  // 4. Run Next.js Export (stale dev-server types in .next would reference the stashed routes)
  fs.rmSync(path.join(rootDir, '.next'), { recursive: true, force: true });
  console.log('\n[4/4] Running Next.js Static Export build...');
  try {
    execSync('NEXT_EXPORT=true npx next build', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_EXPORT: 'true',
      },
    });

    // Ensure _redirects and locations.json are in out/
    const publicRedirects = path.join(rootDir, 'public/_redirects');
    const outRedirects = path.join(rootDir, 'out/_redirects');
    if (fs.existsSync(publicRedirects)) {
      fs.copyFileSync(publicRedirects, outRedirects);
    }

    const publicLocations = path.join(rootDir, 'public/locations.json');
    const outLocations = path.join(rootDir, 'out/locations.json');
    if (fs.existsSync(publicLocations)) {
      fs.copyFileSync(publicLocations, outLocations);
    }

    const publicSearchData = path.join(rootDir, 'public/search-data.json');
    const outSearchData = path.join(rootDir, 'out/search-data.json');
    if (fs.existsSync(publicSearchData)) {
      fs.copyFileSync(publicSearchData, outSearchData);
    }

    const publicMatchmaker = path.join(rootDir, 'public/matchmaker-data.json');
    const outMatchmaker = path.join(rootDir, 'out/matchmaker-data.json');
    if (fs.existsSync(publicMatchmaker)) {
      fs.copyFileSync(publicMatchmaker, outMatchmaker);
    }

    const publicHeaders = path.join(rootDir, 'public/_headers');
    const outHeaders = path.join(rootDir, 'out/_headers');
    if (fs.existsSync(publicHeaders)) {
      fs.copyFileSync(publicHeaders, outHeaders);
    }

    const sitemapFiles = [
      'sitemap_index.xml',
      'sitemap.xml',
      'sitemap-pages.xml',
      'sitemap-hotels-usa.xml',
      'sitemap-hotels-india.xml',
      'sitemap-hotels-world.xml',
      'sitemap-blog.xml',
      'sitemap-images.xml',
    ];
    for (const sm of sitemapFiles) {
      const src = path.join(rootDir, 'public', sm);
      const dst = path.join(rootDir, 'out', sm);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
      }
    }

    const publicLlms = path.join(rootDir, 'public/llms.txt');
    const outLlms = path.join(rootDir, 'out/llms.txt');
    if (fs.existsSync(publicLlms)) {
      fs.copyFileSync(publicLlms, outLlms);
    }

    const publicLlmsFull = path.join(rootDir, 'public/llms-full.txt');
    const outLlmsFull = path.join(rootDir, 'out/llms-full.txt');
    if (fs.existsSync(publicLlmsFull)) {
      fs.copyFileSync(publicLlmsFull, outLlmsFull);
    }

    // Internal audit CSV/JSON lives in public/audits for scripts only; never publish it
    fs.rmSync(path.join(rootDir, 'out/audits'), { recursive: true, force: true });

    // Clean up internal Next.js segment prefetch trees (__next.*) to comply with Cloudflare 20,000 files limit
    console.log('\n[Clean] Pruning internal __next.* segment prefetch files to comply with Cloudflare 20,000 file limit...');
    try {
      execSync('find out -name "__next.*" -delete', { cwd: rootDir });
      execSync('find out -type d -empty -delete', { cwd: rootDir });
      const remainingFiles = execSync('find out -type f | wc -l', { cwd: rootDir }).toString().trim();
      console.log(`✅ Output directory optimized: ${remainingFiles} total files (well under Cloudflare 20,000 limit).`);
    } catch (e) {
      console.warn('⚠️ Pruning warning:', e.message);
    }

    console.log('\n✨ Cloudflare Pages static build completed successfully in out/ directory!');
  } finally {
    restoreAll();
  }
}

// Trap unexpected exits to guarantee files are restored
process.on('SIGINT', () => {
  restoreAll();
  process.exit(1);
});
process.on('SIGTERM', () => {
  restoreAll();
  process.exit(1);
});

build().catch((err) => {
  console.error('\n❌ Build failed:', err);
  restoreAll();
  process.exit(1);
});
