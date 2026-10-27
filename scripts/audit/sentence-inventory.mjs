// Usage: node scripts/audit/sentence-inventory.mjs https://<preview>.hotelswithbathtubs.pages.dev
// Collects every sentence a visitor or Google reads (visible text + JSON-LD) on every sitemap page,
// groups template sentences together, and prints the repeated ones that contain a claim word.
const P = process.argv[2].replace(/\/$/, ''), W = 'https://www.hotelswithbathtubs.com';
const idx = await (await fetch(P + '/sitemap_index.xml')).text();
const files = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(W, '')).filter((f) => !f.includes('images'));
const urls = [];
for (const f of files) { const x = await (await fetch(P + f)).text(); urls.push(...[...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(W, '') || '/')); }
const typeOf = (u) => { const p = u.split('/').filter(Boolean); if (p[0] === 'blog') return 'blog'; if (p.length === 3 && p[2] === 'jacuzzi') return 'jacuzzi'; if (p.length === 3) return 'hotel'; if (p.length === 2) return 'city'; return 'other'; };
const norm = (s) => s.replace(/[₹$€£¥]\s?[\d,.]+|\b\d[\d,.]*\b/g, 'N').replace(/\b[A-Z][\w'’.&-]*(?:\s+(?:[A-Z][\w'’.&-]*|of|the|de|la|and|&))*\b/g, 'X').replace(/\s+/g, ' ').trim();
const pat = new Map(); let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => { while (i < urls.length) { const u = urls[i++]; try {
  const h = await (await fetch(P + u)).text();
  const ld = [...h.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(' ');
  const ldText = [...ld.matchAll(/"(?:description|text|name)":"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]).join('. ');
  const vis = h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--.*?-->/g, '')
    .replace(/<\/(p|div|li|h[1-6]|section|tr|button|a|span|strong)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
  const seen = new Set();
  for (const [src, txt] of [['v', vis], ['ld', ldText]]) for (const line of txt.split('\n')) for (const s of line.split(/(?<=[.!?])\s+/)) {
    const t = s.replace(/\s+/g, ' ').trim(); if (t.split(' ').length < 4) continue;
    const k = src + ' | ' + norm(t); if (seen.has(k)) continue; seen.add(k);
    let e = pat.get(k); if (!e) { e = { n: 0, types: {}, ex: t.slice(0, 200), ld: src === 'ld' }; pat.set(k, e); }
    e.n++; const ty = typeOf(u); e.types[ty] = (e.types[ty] || 0) + 1;
  }
} catch {} } }));
const CLAIM = /\b(all|every|each|always|never|only|guarantee\w*|verif\w*|confirm\w*|checked|cross|ensur\w*|real|actual|exclusive|free|instant|discount\w*|lowest|cheapest|welcom\w*|couples?|judg\w*|discre\w*|privacy|safe|trusted|curated|selected|hand\w*|personally|rated|stars?|reviews?|award\w*|no hidden|100|zero|direct)\b/i;
const rows = [...pat.values()].filter((e) => e.n >= 5 && CLAIM.test(e.ex)).sort((a, b) => b.n - a.n);
console.log('pages', urls.length, '| repeated sentences with a claim word:', rows.length);
for (const e of rows) console.log(String(e.n).padStart(5), JSON.stringify(e.types).replace(/"/g, '').padEnd(46), e.ld ? '[LD]' : '    ', e.ex);
