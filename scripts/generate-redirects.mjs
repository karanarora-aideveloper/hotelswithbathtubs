import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Middleware redirects
const middlewareRedirects = [
  { source: '/united-states', destination: '/usa', permanent: true },
  { source: '/united-states/*', destination: '/usa/:splat', permanent: true },
  { source: '/united-kingdom', destination: '/uk', permanent: true },
  { source: '/united-kingdom/*', destination: '/uk/:splat', permanent: true },
  { source: '/united-arab-emirates', destination: '/uae', permanent: true },
  { source: '/united-arab-emirates/*', destination: '/uae/:splat', permanent: true },
];

async function generateRedirects() {
  console.log('🔄 Generating public/_redirects for Cloudflare Pages...');

  const nextConfigFile = path.join(rootDir, 'next.config.ts');
  const content = fs.readFileSync(nextConfigFile, 'utf-8');

  // Extract redirect objects using regex
  const redirectMatches = [
    ...content.matchAll(/\{\s*source:\s*['"]([^'"]+)['"],\s*destination:\s*['"]([^'"]+)['"](?:,\s*permanent:\s*(true|false))?\s*\}/g),
  ];

  const extractedRedirects = redirectMatches.map((match) => ({
    source: match[1],
    destination: match[2],
    permanent: match[3] !== 'false',
  }));

  const allRedirects = [...middlewareRedirects, ...extractedRedirects];

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
