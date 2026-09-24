import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const moves = [
  { from: path.join(rootDir, 'src/app/api/admin'), to: path.join(rootDir, '_cf_tmp_api_admin') },
  { from: path.join(rootDir, 'src/app/admin'), to: path.join(rootDir, '_cf_tmp_admin') },
  { from: path.join(rootDir, 'src/app/api/geo'), to: path.join(rootDir, '_cf_tmp_api_geo') },
  { from: path.join(rootDir, 'src/app/out'), to: path.join(rootDir, '_cf_tmp_out') },
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

async function build() {
  console.log('🚀 Starting Cloudflare Pages Static Build Pipeline...');

  // 1. Generate locations.json
  console.log('\n[1/4] Generating locations.json from MongoDB...');
  execSync('node scripts/generate-locations.mjs', { cwd: rootDir, stdio: 'inherit' });

  // 2. Generate _redirects
  console.log('\n[2/4] Generating public/_redirects...');
  execSync('node scripts/generate-redirects.mjs', { cwd: rootDir, stdio: 'inherit' });

  // 3. Stash dynamic admin/server routes
  console.log('\n[3/4] Stashing local admin & dynamic routes for static export...');
  for (const item of moves) {
    move(item.from, item.to);
  }

  // 4. Run Next.js Export
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

    const publicHeaders = path.join(rootDir, 'public/_headers');
    const outHeaders = path.join(rootDir, 'out/_headers');
    if (fs.existsSync(publicHeaders)) {
      fs.copyFileSync(publicHeaders, outHeaders);
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
