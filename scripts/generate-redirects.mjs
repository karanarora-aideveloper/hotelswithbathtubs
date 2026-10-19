import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redirects as allRedirects } from './redirects.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function generateRedirects() {
  console.log('🔄 Generating public/_redirects for Cloudflare Pages...');

  const lines = [
    '# Cloudflare Pages Redirects',
    '# Generated automatically during build',
    '',
  ];

  // Keep track of sources to prevent duplicates
  const seenSources = new Set();

  for (const r of allRedirects) {
    if (seenSources.has(r.source)) continue;
    seenSources.add(r.source);

    const code = r.permanent ? '301' : '302';
    lines.push(`${r.source} ${r.destination} ${code}`);
  }

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, '_redirects');
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf-8');

  console.log(`✅ _redirects generated with ${allRedirects.length} rules.`);
  console.log(`💾 Saved to: ${outputPath}`);
}

generateRedirects();
