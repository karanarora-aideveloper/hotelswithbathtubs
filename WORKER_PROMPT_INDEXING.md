# Worker brief: get more hotel and city pages into Google's index

You are the **worker** on hotelswithbathtubs.com. Another agent is the **auditor**: it wrote this brief and will verify your work against the checks below before the owner approves a merge. Read `AGENTS.md` first. This is Next.js 16.4 with a static export on Cloudflare Pages. Read `node_modules/next/dist/docs/` before using any Next.js API. Also read `AUDIT_2026-10-26.md`, because several items there overlap with this brief. If you already fixed an item from the audit, say so and don't redo it.

## Why this work matters

- Google Search Console shows **114 pages "Crawled – currently not indexed"**. The owner asked Google to validate a fix, and validation **failed on 20 Oct**.
- The auditor's checks on 26 Oct with the URL Inspection API found:
  - All 10 example URLs from that report are now **indexed** (recrawled 20 Oct). The report data is from 19 Oct and is stale.
  - Of 15 random hotel pages, 12 are indexed. The other 3 are **"Discovered – currently not indexed"**: Google knows them but hasn't crawled them yet. Examples: `/usa/new-york/the-ned-nomad-new-york`, `/india/jaipur/the-raj-palace-jaipur`.
  - `/usa/new-york`, the most important US page, is **"URL is unknown to Google"**, even though the home page, `/usa`, `/destinations` and the sitemap all link to it.
- **Conclusion:** the main limit is **crawl budget and discovery** on a young site (about 5,500 URLs, live since mid-August), not page quality. A smaller group of pages is crawled and rejected as thin.
- **Goal:** make every Googlebot visit count (no wasted requests), tell Google clearly which pages changed, and give the thinnest hotel pages more facts unique to that hotel.
- **Baseline:** about 1,750 impressions a day, about 50k over 3 months.

## Rules you must follow

- Work on a **new branch from `main`**, for example `phase1/indexing`. Push it to GitHub so Cloudflare builds a **preview**. Never merge to `main`; the owner approves merges after the auditor verifies. Never build or deploy from the Mac. Builds happen on Cloudflare's cloud when you push.
- **Do not touch** `.cache/all-hotels.json`, `scripts/collect-partner-photos.mjs` or the `partnerImages` field. A background photo run is writing them; it's finished when `.cache/partner-photos.log` ends with `Done.`. Do not run any Playwright or browser job on the Mac. The owner's limit is 2 scripts with 2 workers, and the photo run is using it.
- **No database writes** in this brief. Code changes only.
- **No affiliate link changes.**
- **Don't noindex** any hotel page. The owner decided to keep all hotel pages indexed (D10, D11), and to leave the 152 broken-word slugs alone (D12).
- **Don't invent facts.** Every sentence you add to a hotel page must come from a field already in the data (room type, tub type, booking tip, rating, review count, price, landmark distance, a real neighbourhood). No AI-written filler.
- Keep commits small, one per task below, with clear messages.

## Tasks

### T1. Fix and split the sitemaps, so we can see indexing per page type
- `/sitemap_index.xml` currently redirects to itself forever: `scripts/redirects.mjs:91-92` → `public/_redirects`. Remove those rules.
- Today `src/app/sitemap.ts` builds one `sitemap.xml` with about 5,506 URLs. Split it into separate files and list them all in `sitemap_index.xml`:
  - `sitemap-pages.xml`: home, hubs, country pages, city pages, static pages
  - `sitemap-hotels-usa.xml`
  - `sitemap-hotels-india.xml`
  - `sitemap-hotels-world.xml`
  - `sitemap-blog.xml`
  - plus the existing `sitemap-images.xml`
- Use whatever works in a static export: `generateSitemaps` if the docs confirm it works with `output: 'export'`, otherwise a script in `scripts/` run by `scripts/build-cloudflare.mjs`.
- Keep `/sitemap.xml` working: either keep it as an index, or make it list the same URLs. Search Console already has it submitted.
- `robots.txt` (`src/app/robots.ts`) must list `sitemap_index.xml`.
- **`lastmod` must be honest:**
  - hotel: its `updatedAt`
  - city page: the newest `updatedAt` among its hotels
  - blog: `updatedAt`
  - Never use build time.
- **Done when:** every sitemap file returns 200 with XML. The total URL count across the new files equals the old `sitemap.xml` count (±5; explain any difference). No URL in any sitemap redirects or returns 404 (check a 300-URL random sample).

### T2. Stop wasting Googlebot's requests
- Every page asks for `/<path>/__next._tree.txt?_rsc=…` and gets a 404, because `scripts/build-cloudflare.mjs:166-169` deletes those files to stay under Cloudflare's 20,000-file limit. Google renders pages with JavaScript, so these requests eat crawl budget and add errors. Each 404 also returns the full 66 KB HTML 404 page.
- **Fix:**
  - (a) Add `prefetch={false}` to `<Link>` in hotel-card grids, the destination lists, the header, footer and breadcrumbs. A small wrapper component is fine.
  - (b) In `functions/_middleware.ts`, before `context.next()`, answer any path containing `/__next.` with `new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=86400' } })`.
- **Done when:** on the preview, the home page, `/usa/new-york` and one hotel page make zero `__next.` requests that return a 66 KB body. Clicking a card and pressing back still works.

### T3. Rescue old and alias URLs that Google still has (one 301 hop, no chains)
- **Country Georgia:** remove `/georgia` → `/usa/georgia` (`scripts/redirects.mjs:42-43`). That rule hides the country Georgia hub (18 Tbilisi hotels).
- **Middleware, single-part paths:** on a 404 for a path with one part that matches a city slug from `locations.json`, 301 to `/<country>/<city>`. `/kochi` is still in Google with 85 impressions and now returns 404.
- **Middleware, uppercase:** 301 any path with uppercase letters to its lowercase form.
- **Aliases** in `scripts/redirects.mjs`: `bengaluru`→`bangalore`, `gurugram`→`gurgaon`, `bombay`→`mumbai`, `calcutta`→`kolkata`, `madras`→`chennai`, `trivandrum`→`thiruvananthapuram`. Before adding a rule, check its target city slug exists in `locations.json`.
- **Done when:** `/kochi`, `/india/bengaluru`, `/USA/New-York` and `/georgia` each answer with one 301 (or 200 for `/georgia`) that ends on a 200 page.

### T4. Remove placeholder location text (quality signal)
- 2,674 hotels have `neighborhood = "Prime <City> Enclave"`, and 4,288 have a `streetAddress` built from it.
- **Fix:**
  - Treat `/^Prime .* Enclave$/i` neighbourhoods, and `streetAddress` values with no digit, as missing. Add a helper in `src/lib/` and use it everywhere these fields render. `grep -rn "neighborhood\|streetAddress" src` finds them.
  - In `LodgingBusiness` JSON-LD (`src/app/[country]/[city]/[hotel]/page.tsx:~282`), leave out `streetAddress` when it's missing.
  - On cards, show `City, Country`.
- **Done when:** no page on the preview contains the text "Enclave". Check `/usa/new-york`, `/india/delhi` and The Greenwich Hotel page, and grep the built HTML for 20 random hotels.

### T5. More hotel-specific facts on hotel pages with thin content
- 1,935 hotels have descriptions under 25 words. Their pages are mostly shared template text, which is the usual reason for "Crawled – currently not indexed".
- On the hotel page, add a **server-rendered "Bathtub facts" section** written as sentences from existing fields only. Leave out any sentence whose field is empty. For example:
  - "The tub is in the {roomType}: a {tubType}."
  - "Guests rate it {rating}/5 from {reviewsCount} reviews."
  - "Listed from {price} a night."
  - "{landmarkDistance}."
  - "Booking tip: {bookingTip}."
- Also add a **"More rooms with a bathtub in {city}"** list of up to 8 links. Today `getSimilarHotels` returns 4; raise it to 8. They must be plain `<a>` tags in the server HTML.
- **Done when:** for 5 thin hotels the auditor picks, the page HTML contains the new facts. No sentence shows `undefined`, `null`, `NaN` or empty values. The layout looks fine at 390 px width.

### T6. Help Google find the US money pages
- On the home page and `/usa`, make sure the top 12 US city pages (New York first) are plain `<a>` links in the server HTML, high on the page (inside the first screen or two on a phone).
- On every US city page, add a "Nearby US destinations" block of 6 links to other US city pages, also plain `<a>`.
- **Done when:** the HTML of `/` contains `href="/usa/new-york"` before the first 30% of the document. Each US city page links to 6 other US city pages.

## What to send back to the auditor (paste this to the owner)

1. Branch name and the list of commits (hash plus one line each).
2. The Cloudflare preview URL for the last commit.
3. For each task T1–T6: **Done / Partly done / Not done**, what changed (files), and the evidence. Evidence means the command you ran and its output: `curl` status codes, URL counts, a grep result.
4. Anything you couldn't do, and why.
5. Anything you noticed that's broken but outside this brief. List it; don't fix it.

## How the auditor will verify (so you can check first)

- `curl -sI <preview>/sitemap_index.xml` returns 200. Fetch every child sitemap, count the URLs, and request 300 random URLs: all must return 200.
- Open the home page, a city page and a hotel page in headless Chrome and log requests: no `__next.` requests with large 404 bodies. Navigation still works.
- `curl -sI` on `/kochi`, `/india/bengaluru`, `/USA/New-York` and `/georgia` on the preview.
- Grep 20 random hotel pages and 5 city pages for "Enclave", `undefined` and `NaN`.
- Check JSON-LD on 5 hotel pages: valid JSON, no `streetAddress` placeholder.
- Phone Lighthouse on the home page, `/usa/new-york` and one hotel page must not get worse than 58 / 63 / 69.
