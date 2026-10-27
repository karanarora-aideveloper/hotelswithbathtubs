// Usage: node scripts/audit/visible-text-scan.mjs https://<preview>.hotelswithbathtubs.pages.dev [every-Nth]
// Optional every-Nth samples the sitemap (e.g. 50 checks every 50th URL) for a quick run; omit it for the full scan.
// Fetches every URL in the sitemaps, checks status / noindex / canonical, then counts claim phrases
// in what a visitor (or Google) reads: visible text plus JSON-LD. Prints counts by page type and examples.
const P = process.argv[2].replace(/\/$/, ''), W = 'https://www.hotelswithbathtubs.com';
const CHECKS = {
  banned: /field-verified|architectural metrics|acoustic|water dynamics|sanctuary audit|triple-(?:source|verified|checked)|100% (?:in-room|en-suite)|guarantee|independently verified|every room verified|superhost|gourmet kitchen|keyless|historical benchmark|verified platforms/i,
  verified: /\bverif(?:ied|ication|y)\b/i,
  confirmed: /(?<!not yet |haven['’]t )\bconfirmed\b/i,
  inspected: /\binspect(?:ed|ion)\b/i,
  handpicked: /\bhand-?picked\b/i,
  audited: /\baudit(?:ed|s)?\b|verification team/i,
  pct100: /\b100%|\b0 shared/i,
  lastChecked: /Last checked|\(October 2026\)/,
  ratings: /★\s*\d|guest reviews/i,
  checkedOneByOne: /checked one by one/i,
  zeroFees: /zero booking fees|hidden markups|direct canonical/i,
  reviewCounts: /\b\d[\d,]*\s+reviews\b|top rated|most reviewed/i,
  noSurprises: /no surprises/i,
  debugText: /layout active|progressive streaming/i,
  tripleVerify: /triple-verif/i,
  highDemand: /in high demand/i,
  coupleTag: /✓ couple friendly/i,
  contradiction: /^(?=[\s\S]*not yet confirmed)(?=[\s\S]*(?:features an in-room|for a private in-room bathtub|for the private tub))/i,
};
const visible = (h) => h
  .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<!--.*?-->/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x27;|&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');
const typeOf = (u) => {
  const parts = u.split('/').filter(Boolean);
  if (parts[0] === 'blog') return 'blog';
  if (parts.length === 3 && parts[2] === 'jacuzzi') return 'jacuzzi';
  if (parts.length === 3) return 'hotel';
  if (parts.length === 2) return 'city';
  return 'other';
};
const idx = await (await fetch(P + '/sitemap_index.xml')).text();
const files = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(W, '')).filter((f) => !f.includes('images'));
const urls = [];
for (const f of files) {
  const x = await (await fetch(P + f)).text();
  urls.push(...[...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(W, '') || '/'));
}
const step = Number(process.argv[3] || 1);
if (step > 1) urls.splice(0, urls.length, ...urls.filter((_, n) => n % step === 0));
console.log('sitemap urls checked', urls.length, step > 1 ? `(every ${step}th)` : '(all)');
const problems = [], counts = {}, examples = {};
let i = 0, ok = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < urls.length) {
    const u = urls[i++];
    try {
      const r = await fetch(P + u, { redirect: 'manual' });
      if (r.status !== 200) { problems.push(r.status + ' ' + u); continue; }
      const h = await r.text();
      if (/<meta name="robots" content="noindex/.test(h)) { problems.push('NOINDEX ' + u); continue; }
      const c = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if ((c ? c.replace(W, '') || '/' : null) !== u) { problems.push('CANONICAL ' + c + ' on ' + u); continue; }
      ok++;
      const t = visible(h), type = typeOf(u);
      for (const [k, re] of Object.entries(CHECKS)) {
        let textToCheck = t;
        if (k === 'contradiction') {
          if (type !== 'hotel') continue;
          const cutoff = t.search(/More rooms with a bathtub in/i);
          textToCheck = cutoff !== -1 ? t.slice(0, cutoff) : t;
        }
        const m = re.exec(textToCheck);
        if (!m) continue;
        counts[k] = counts[k] || {}; counts[k][type] = (counts[k][type] || 0) + 1;
        examples[k] = examples[k] || [];
        if (examples[k].length < 5) examples[k].push(u + ' :: ' + textToCheck.slice(Math.max(0, m.index - 80), m.index + 80).trim());
      }
    } catch (e) { problems.push('ERROR ' + u + ' ' + e.message.slice(0, 60)); }
  }
}));
console.log(`ok ${ok} / ${urls.length}, problems ${problems.length}`);
if (problems.length) console.log(problems.slice(0, 20).join('\n'));
console.log('\nPages containing each phrase, by page type (target: none, see brief for exceptions):');
for (const k of Object.keys(CHECKS)) console.log('  ' + k.padEnd(16) + JSON.stringify(counts[k] || {}));
console.log('\nExamples:');
for (const [k, xs] of Object.entries(examples)) { console.log('## ' + k); for (const x of xs) console.log('  - ' + x); }
