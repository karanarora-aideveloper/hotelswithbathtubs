import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = '/Users/karanarora/.gemini/antigravity/brain/4c517188-baf3-471d-ad9c-6d4b51061529';

const tasks = [
  {
    id: 1,
    priority: 'P0 - CRITICAL',
    priorityClass: 'p0',
    title: 'Fix GSC Sitemap Index 404 & Partition XML Sitemaps by Entity',
    category: 'Technical SEO & Crawl Budget',
    evidence: 'GSC shows 1 critical error on https://www.hotelswithbathtubs.com/sitemap_index.xml (404 Not Found). Flat sitemap with 4,400+ URLs stalls crawling on Googlebot.',
    actions: [
      'Add permanent 301 redirect in scripts/redirects.mjs: /sitemap_index.xml -> /sitemap.xml (or sitemap index).',
      'Partition the monolithic sitemap into 3 dedicated sitemaps: sitemap-cities.xml (daily priority 0.9), sitemap-blogs.xml (weekly priority 0.8), and sitemap-hotels.xml (monthly priority 0.65).',
      'Submit the clean sitemaps to Google Search Console via GSC API / submit_sitemap.'
    ],
    targetFiles: ['scripts/redirects.mjs', 'src/app/sitemap.ts', 'scripts/build-cloudflare.mjs'],
    roi: 'Eliminates sitemap errors in GSC and unblocks Googlebot crawler scheduling for 4,100+ deep pages.'
  },
  {
    id: 2,
    priority: 'P0 - CRITICAL',
    priorityClass: 'p0',
    title: 'Unlock Indexing for 4,000+ Hotel Pages ("Discovered - Currently Not Indexed")',
    category: 'Indexation & Internal Linking',
    evidence: 'GSC URL Inspection on Capella Bangkok, Taj Palace Delhi, and Delhi apartments shows "Discovered - currently not indexed". City pages only render first 24 hotels in HTML (visibleCount = 24), cutting off hotels 25+ from Googlebot without JavaScript.',
    actions: [
      'In CityHotelsClient.tsx and CityHotelsPage, add an accessible SSR crawlable directory index (<nav aria-label="All Verified Bathtub Hotels in {City}">) containing direct HTML links (<a href="/country/city/slug">) to every single hotel in the city.',
      'Add reciprocal cross-links on hotel detail pages back to their parent neighborhood and city hubs with optimized anchor text.',
      'Implement IndexNow API submission ping on build for newly updated hotel entities.'
    ],
    targetFiles: ['src/components/CityHotelsClient.tsx', 'src/app/[country]/[city]/page.tsx', 'src/app/[country]/[city]/[hotel]/page.tsx'],
    roi: 'Directly solves the "Discovered - currently not indexed" cliff by passing internal PageRank to all 4,162 hotel pages.'
  },
  {
    id: 3,
    priority: 'P0 - REVENUE',
    priorityClass: 'p0',
    title: 'Inject Direct EarnKaro / Booking.com Booking Widgets into High-Traffic Blogs',
    category: 'Affiliate CRO & Monetization',
    evidence: 'Blog posts capture 50%+ of all organic clicks (e.g. NYC Tubs 727 imp / 8 clicks, Ahmedabad 983 imp / 5 clicks, Kolkata 477 imp / 8 clicks, Paris 272 imp / 6 clicks), but currently link to the city directory rather than providing 1-click booking.',
    actions: [
      'In src/app/blog/[slug]/page.tsx and markdown renderer, auto-detect hotel recommendations and inject rich Verified Bathtub Hotel Cards with live pricing and direct EarnKaro (Agoda / MMT) & direct Booking.com outbound buttons.',
      'Add a sticky "Top Pick in This Guide" quick-booking banner on mobile blog views.',
      'Ensure OutboundLink telemetry tags each blog conversion with blog_source=slug.'
    ],
    targetFiles: ['src/app/blog/[slug]/page.tsx', 'src/lib/markdown.ts', 'src/components/OutboundLink.tsx'],
    roi: 'Cuts user booking friction from 3 hops down to 1 direct click. Expected 2.5x–4x lift in outbound affiliate click volume from existing blog traffic.'
  },
  {
    id: 4,
    priority: 'P1 - HIGH IMPACT',
    priorityClass: 'p1',
    title: 'Optimize Striking Distance Queries (Positions 7–13) for Page 1 & Top 3 Takeover',
    category: 'Search Intent & CTR Optimization',
    evidence: 'GSC Search Analytics reveals high-volume buyer queries hovering just off page 1: "hotel with bathtub" (347 imp, pos 18.6), "hotels with bathtub" (181 imp, pos 9.3), "bathtub hotel near me" (160 imp, pos 11.6), "room with bathtub" (126 imp, pos 12.3), "bathtub hotel room" (70 imp, pos 11.4), Jaipur couples (43 imp, pos 9.1), Ahmedabad couples (30 imp, pos 8.7), Bhopal (30 imp, pos 10.1).',
    actions: [
      'Rewrite <title> and <meta description> tags on top city pages (Delhi, Mumbai, Jaipur, Bangalore, Ahmedabad, Bhopal, NYC) to include proven click triggers: "Private Jacuzzis & In-Room Bathtubs (2026 Prices & Photos) - Couple-Friendly".',
      'Add targeted H2 sections answering conversational queries: "Are these bathtub hotels couple friendly?" and "Which rooms guarantee private in-room bathtubs?".'
    ],
    targetFiles: ['src/app/[country]/[city]/page.tsx', 'src/app/[country]/page.tsx', 'src/app/page.tsx'],
    roi: 'Moving keywords from positions 8–12 to top 3 increases organic traffic by an estimated 300%–500% based on Google SERP click curves.'
  },
  {
    id: 5,
    priority: 'P1 - HIGH IMPACT',
    priorityClass: 'p1',
    title: 'Audit & Consolidate Legacy Naked City URLs & Old Backlink Paths',
    category: 'SEO Equity & 301 Health',
    evidence: 'GSC logs show legacy URLs like https://www.hotelswithbathtubs.com/kochi/ still ranking at position 6.6 with 106 impressions. Previous DA audit showed checkers landing on naked or suffixed slugs (e.g. Broncks Apartment).',
    actions: [
      'Audit all 160+ legacy redirects in scripts/redirects.mjs to ensure 100% of naked city paths (/kochi, /jaipur, /delhi, /manali) return immediate 301 Moved Permanently without intermediate chains.',
      'Add self-canonical tags (<link rel="canonical">) verification across all country and city hubs to prevent duplicate parameter indexing.'
    ],
    targetFiles: ['scripts/redirects.mjs', 'functions/_middleware.ts', 'src/app/[country]/[city]/page.tsx'],
    roi: 'Consolidates split ranking signals into canonical URLs and protects historical domain authority backlinks.'
  },
  {
    id: 6,
    priority: 'P1 - HIGH IMPACT',
    priorityClass: 'p1',
    title: 'Enhance Schema.org with AggregateOffer & PriceRange on Destination Hubs',
    category: 'Rich Snippets & Search Appearance',
    evidence: 'City pages currently emit basic ItemList and BreadcrumbList schemas. They lack AggregateOffer (lowPrice, highPrice, priceCurrency) and AggregateRating, missing out on rich search result stars and price tags in Google SERP.',
    actions: [
      'In src/app/[country]/[city]/page.tsx, compute lowest and highest hotel prices dynamically.',
      'Emit Schema.org AggregateOffer and AggregateRating on every city destination page.',
      'Validate with Google Rich Results Test API to ensure zero warnings.'
    ],
    targetFiles: ['src/app/[country]/[city]/page.tsx', 'src/components/StructuredData.tsx'],
    roi: 'Eligible for Google Hotel / Lodging rich snippets with star ratings and pricing badges, increasing SERP CTR by ~25%–35%.'
  },
  {
    id: 7,
    priority: 'P1 - PERFORMANCE',
    priorityClass: 'p1',
    title: 'Optimize Largest Contentful Paint (LCP) & Preload Hero Images on Cloudflare CDN',
    category: 'Core Web Vitals & Page Speed',
    evidence: 'Next.js runs with unoptimized: true for Cloudflare static export. Heavy hero images fetched from Cloudflare R2 bucket dreamwave can cause LCP delays on 4G mobile devices.',
    actions: [
      'Inject <link rel="preload" as="image" fetchpriority="high"> for above-the-fold hero and card images on city listing pages.',
      'Ensure all hotel card image wrappers specify explicit aspect-ratio or aspect-[16/9] to completely eliminate Cumulative Layout Shift (CLS).',
      'Verify Cloudflare Edge CDN cache headers (s-maxage=86400, stale-while-revalidate=604800) for instant sub-50ms TTFB worldwide.'
    ],
    targetFiles: ['src/app/[country]/[city]/page.tsx', 'src/components/CityHotelsClient.tsx', 'next.config.ts', 'functions/_middleware.ts'],
    roi: 'Guarantees green Core Web Vitals (LCP < 1.8s, CLS = 0), boosting mobile search ranking weight across Google.'
  },
  {
    id: 8,
    priority: 'P2 - CONVERSION',
    priorityClass: 'p2',
    title: 'Implement Mobile "Sticky Reservation Bar" on Hotel Detail Pages',
    category: 'Mobile UX & Conversion Rate',
    evidence: 'Over 70% of buyer clicks occur on mobile devices (Android/iOS). When users scroll down hotel galleries, verified bathtub tips, and amenities, booking CTA buttons scroll out of view.',
    actions: [
      'Add a high-converting sticky bottom drawer on mobile viewports (< 768px) that stays fixed at the bottom: displays hotel price, bathtub badge, and one-tap "Check Rates on Booking.com / Agoda" button.',
      'Animate subtly when the user reaches 40% scroll depth to avoid banner blindness.',
      'Integrate with OutboundLink and Mixpanel/GA4 click telemetry.'
    ],
    targetFiles: ['src/app/[country]/[city]/[hotel]/page.tsx', 'src/components/OutboundLink.tsx'],
    roi: 'Captures impulse mobile bookers and reduces abandoned scroll-throughs by an estimated 15%–20%.'
  },
  {
    id: 9,
    priority: 'P2 - EXPANSION',
    priorityClass: 'p2',
    title: 'Generate New Destination Hubs for High-Demand Unserviced Cities',
    category: 'Inventory & Geographic Expansion',
    evidence: 'GSC search data logs organic queries for cities with thin or missing inventory: Bhopal (30 imp, pos 10.1), Kolhapur (192 imp, 4 clicks, pos 7.0), Pondicherry (41 imp, pos 7.1), Matheran (48 imp, pos 9.6), Jabalpur (55 imp, pos 7.6), Rajkot (38 imp, pos 9.4).',
    actions: [
      'Curate and ingest 10–15 verified bathtub hotels for each top emerging city in MongoDB.',
      'Generate static city listing pages, update locations.json, and submit to sitemap.',
      'Create 1 targeted cluster blog post per city linking to the new directory hub.'
    ],
    targetFiles: ['scripts/generate-locations.mjs', 'src/models/Hotel.ts', 'src/app/[country]/[city]/page.tsx'],
    roi: 'Captures zero-competition, high-intent local search demand where commercial competitor directories are absent.'
  },
  {
    id: 10,
    priority: 'P2 - AUTOMATION',
    priorityClass: 'p2',
    title: 'Automated Daily Cloudflare D1 Click Sync & Affiliate Conversion Reconciliation',
    category: 'Data Analytics & Revenue Tracking',
    evidence: 'In our last session, we created /admin/clicks and resolved Cloudflare OAuth expiration. Currently, click sync requires manual admin button click to import D1 clicks into MongoDB.',
    actions: [
      'Create a Cloudflare Scheduled Cron Worker (or GitHub Actions cron) that runs daily at 00:00 UTC to sync D1 clicks directly to MongoDB Atlas.',
      'Add an automated reconciliation view in /admin/clicks comparing daily outbound clicks against EarnKaro and Booking.com recorded payouts to detect affiliate commission leakage.'
    ],
    targetFiles: ['functions/api/track-click.ts', 'src/app/api/track-click/sync/route.ts', 'src/components/admin/HotelClicksClient.tsx'],
    roi: 'Zero manual maintenance, automated revenue reconciliation, and immediate detection of broken or non-tracking affiliate partner links.'
  }
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HotelsWithBathtubs — 10-Task Growth & Engineering Roadmap</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #1a6fde;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #1a6fde, #0a4fa8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-title span {
      color: #1a6fde;
    }
    .brand-subtitle {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
      font-weight: 500;
    }
    .doc-meta {
      text-align: right;
      font-size: 9px;
      color: #475569;
    }
    .doc-meta strong {
      color: #0f172a;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 10px;
    }
    .stat-card-title {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
    }
    .stat-card-value {
      font-size: 14px;
      font-weight: 800;
      color: #1a6fde;
      margin-top: 2px;
    }
    .stat-card-desc {
      font-size: 8px;
      color: #475569;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 12px 0 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 3px solid #1a6fde;
      padding-left: 6px;
    }
    .task-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .task-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .task-title-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .task-num {
      width: 22px;
      height: 22px;
      background: #0f172a;
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .task-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
    }
    .task-meta {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .priority-badge {
      font-size: 8px;
      font-weight: 800;
      padding: 2.5px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .p0 { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .p1 { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
    .p2 { background: #e0f2fe; color: #075985; border: 1px solid #38bdf8; }
    .print-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid #64748b;
      border-radius: 4px;
      background: #fff;
      display: inline-block;
      margin-left: 6px;
    }
    .category-tag {
      font-size: 8.5px;
      color: #475569;
      font-weight: 600;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 5px;
    }
    .task-detail {
      margin-bottom: 4px;
      font-size: 9.5px;
      color: #334155;
      line-height: 1.45;
    }
    .task-detail strong {
      color: #0f172a;
    }
    .action-list {
      margin: 3px 0 4px 14px;
      padding: 0;
      font-size: 9.5px;
      color: #1e293b;
    }
    .action-list li {
      margin-bottom: 2.5px;
    }
    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 5px 8px;
      border-radius: 4px;
      margin-top: 6px;
      font-size: 8.5px;
      border: 1px dashed #e2e8f0;
    }
    .task-files {
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8px;
    }
    .task-roi {
      color: #047857;
      font-weight: 700;
    }
    .footer {
      margin-top: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 8px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <div class="logo-icon">🛁</div>
      <div>
        <h1 class="brand-title">Hotels<span>WithBathtubs</span>.com</h1>
        <div class="brand-subtitle">Executive Growth Audit & 10-Task Printable Action Plan</div>
      </div>
    </div>
    <div class="doc-meta">
      <div><strong>Date:</strong> October 21, 2026</div>
      <div><strong>Audit Sources:</strong> Google Search Console, PostHog, D1 Edge Telemetry</div>
      <div><strong>Status:</strong> Approved for Immediate Execution</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="stat-card">
      <div class="stat-card-title">Catalog Inventory</div>
      <div class="stat-card-value">4,162 Hotels</div>
      <div class="stat-card-desc">150+ Verified Destination Hubs</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-title">Content Engine</div>
      <div class="stat-card-value">140 Guides</div>
      <div class="stat-card-desc">50%+ Organic Search Clicks</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-title">Top Growth Cities</div>
      <div class="stat-card-value">Delhi, Mumbai, NYC</div>
      <div class="stat-card-desc">3,500+ Mo. Impressions</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-title">Striking Distance</div>
      <div class="stat-card-value">Positions 7–13</div>
      <div class="stat-card-desc">Targeted for Top 3 SERP Lift</div>
    </div>
  </div>

  <div class="section-title">
    <span>Next 10 Prioritized Engineering & Growth Tasks</span>
    <span style="font-size: 9px; font-weight: normal; color: #64748b;">Mark checkbox [ ] with pen as completed</span>
  </div>

  ${tasks.map(t => `
    <div class="task-card">
      <div class="task-card-header">
        <div class="task-title-area">
          <div class="task-num">${t.id}</div>
          <div class="task-title">${escapeHtml(t.title)}</div>
        </div>
        <div class="task-meta">
          <span class="priority-badge ${t.priorityClass}">${escapeHtml(t.priority)}</span>
          <span class="print-checkbox" title="Mark when done"></span>
        </div>
      </div>
      <div>
        <span class="category-tag">${escapeHtml(t.category)}</span>
      </div>
      <div class="task-detail">
        <strong>Evidence & Metric:</strong> ${escapeHtml(t.evidence)}
      </div>
      <div class="task-detail" style="margin-top: 3px;">
        <strong>Action Steps:</strong>
        <ul class="action-list">
          ${t.actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
      <div class="task-footer">
        <div class="task-files"><strong>Target:</strong> ${escapeHtml(t.targetFiles.join(' • '))}</div>
        <div class="task-roi">★ ${escapeHtml(t.roi)}</div>
      </div>
    </div>
  `).join('')}

  <div class="footer">
    <div>HotelsWithBathtubs.com • Confidential Growth Roadmap • Generated for Print Tracking</div>
    <div>System Build: Cloudflare Pages Edge (Static Export)</div>
  </div>
</body>
</html>
`;

async function generate() {
  console.log('🚀 Generating Print-Ready HTML & PDF...');

  // 1. Save HTML version
  const htmlPath = path.join(rootDir, 'HOTELSWITHBATHTUBS_GROWTH_AUDIT_10_TASKS.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ HTML file saved to:', htmlPath);

  // 2. Copy HTML to artifact directory
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, 'HOTELSWITHBATHTUBS_GROWTH_AUDIT_10_TASKS.html'), htmlContent, 'utf8');

  // 3. Generate PDF using system Google Chrome
  const pdfPath = path.join(rootDir, 'HOTELSWITHBATHTUBS_GROWTH_AUDIT_10_TASKS.pdf');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 8px; font-family: -apple-system, sans-serif; color: #94a3b8; width: 100%; text-align: right; padding-right: 15mm; padding-top: 4mm;">HotelsWithBathtubs.com • Executive Growth Audit & 10-Task Roadmap</div>',
    footerTemplate: '<div style="font-size: 8px; font-family: -apple-system, sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding-left: 15mm; padding-right: 15mm; padding-bottom: 4mm;"><span>Confidential • Printable Engineering Checklist</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: {
      top: '14mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm',
    },
  });

  await browser.close();
  console.log('✅ PDF file generated successfully at:', pdfPath);

  // Copy PDF to artifact directory as well
  fs.copyFileSync(pdfPath, path.join(artifactDir, 'HOTELSWITHBATHTUBS_GROWTH_AUDIT_10_TASKS.pdf'));
  console.log('💾 Copied PDF to artifact directory.');
}

generate().catch(err => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});
