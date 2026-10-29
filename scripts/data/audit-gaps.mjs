import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const dir = path.join(worktreeDir, 'data-collect', 'pages', 'booking-links2');

export function computeGaps(directory = dir) {
  if (!fs.existsSync(directory)) {
    return { total: 0, minGapMs: null, under10s: 0, gaps: [] };
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.meta.json'));
  const metas = [];
  for (const f of files) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(directory, f), 'utf8'));
      if (m.fetchedAt) metas.push(m);
    } catch {}
  }

  metas.sort((a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime());

  if (metas.length < 2) {
    return { total: metas.length, minGapMs: null, under10s: 0, gaps: [] };
  }

  let minGapMs = Infinity;
  let under10s = 0;
  const gaps = [];

  for (let i = 1; i < metas.length; i++) {
    const tPrev = new Date(metas[i - 1].fetchedAt).getTime();
    const tCurr = new Date(metas[i].fetchedAt).getTime();
    const diff = tCurr - tPrev;
    gaps.push(diff);
    if (diff < minGapMs) minGapMs = diff;
    if (diff < 10000) under10s++;
  }

  return {
    total: metas.length,
    minGapMs: minGapMs === Infinity ? null : minGapMs,
    minGapSec: minGapMs === Infinity ? null : (minGapMs / 1000).toFixed(2),
    under10s,
    gaps
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const res = computeGaps();
  console.log(`Total saved pages in booking-links2: ${res.total}`);
  if (res.total >= 2) {
    console.log(`Smallest gap: ${res.minGapSec}s`);
    console.log(`Gaps under 10 seconds: ${res.under10s}`);
  }
}
