<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Hotels With Bathtubs (hotelswithbathtubs.com)

## Deployment — Cloudflare Pages (only target)
- **Platform**: Cloudflare Pages, static export. Build & deploy with `npm run build:cf` / `npm run deploy:cf` (wrangler project `hotelswithbathtubs`, branch `main`). Vercel is no longer used.
- **Pipeline**: `scripts/build-cloudflare.mjs` → generates `locations.json` + `public/_redirects` (source of truth: `scripts/redirects.mjs`), stashes dynamic routes (`src/app/admin`, `src/app/api/*`, `src/app/out`), runs `next build` with `output: 'export'` into `out/`, restores the stashed routes.
- **Edge functions**: `functions/_middleware.ts` (apex→www 301, 404 slug fallback, cache headers), `functions/out.ts` (affiliate redirect proxy), `functions/api/geo.ts` (geo API). The `src/app` equivalents of `/out` and `/api/geo` exist for local dev only.
- **Custom Domains**: `https://hotelswithbathtubs.com` & `https://www.hotelswithbathtubs.com`
- **Image Storage & Delivery**: All images are hosted on **Cloudflare R2** (`dreamwave` bucket) at `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/` ($0 egress fees). Do not introduce a different image host.
- **Image Rule**: `images: { unoptimized: true }` in `next.config.ts` — all images are served directly from R2 with no `/_next/image` optimizer, which a static Cloudflare Pages export couldn't run anyway.
---

# Analytics Tracking — Google Analytics 4 (GA4) & Outbound Click Logging

This project uses **Google Analytics 4 (GA4)** and an edge-intercepted **Outbound Click Log** (`/out` -> `functions/out.ts`) for product analytics, outbound affiliate conversion measurement, and visitor funnel tracking.

---

## Google Analytics 4 (GA4) Integration & 4-Step Funnel

Google Analytics 4 is integrated via `next/script` (lazyOnload) and our centralized telemetry module (`src/lib/events.ts` and `src/lib/gtag.ts`).

### The 4-Step Core Funnel
1. **Arrive** (`page_view`): Visitor enters any page on the site.
2. **Pick a place** (`view_destination` or `search`): Visitor explores a city, country, or destination collection.
3. **Look at a hotel** (`view_hotel`): Visitor inspects a specific hotel and its bathtub proof.
4. **Booking click** (`booking_click`): Visitor taps an outbound booking button (Booking.com, Agoda, MakeMyTrip, Cleartrip, EaseMyTrip, Expedia, or other partner).

Every event carries uniform core parameters (`page_type`, `country`, `city`, and `hotel_name` where present, plus `visitor_country` via `useGeo()`), allowing the funnel and drop-offs to be cleanly segmented by destination and visitor origin.

### Configuration
- **Measurement ID Location**: `.env.local` -> `NEXT_PUBLIC_GA_MEASUREMENT_ID` (or MongoDB `Settings.googleAnalyticsId` managed in `/admin/seo`).
- **Internal Traffic Exclusion**: Respects `localStorage.getItem('ignore_ga') === 'true'`. When toggled in `/admin` or `/opt-out`, `window['ga-disable-' + GA_ID] = true` is set, blocking tracking for developers and admins.
- **Privacy & Consent**: In UK, EEA, and Switzerland, analytics events are blocked unless consent has been granted (`hasAnalyticsConsent()`). Never collects or passes PII.

### Approved 10 GA4 Events

| Event | Trigger / Condition | Parameters | Funnel Stage / Purpose |
|---|---|---|---|
| `page_view` | GA4 built-in page view on initial load or route transition | Core parameters (`page_type`, `country`, `city`, `hotel_name`, `visitor_country`), `page_location`, `page_path`, `page_title` | Step 1: Arrive |
| `view_destination` | Destination city or country page loads | Core parameters (`page_type: 'destination'`, `country`, `city`, `visitor_country`) | Step 2: Pick a place |
| `view_hotel` | Hotel detail page loads | Core parameters (`page_type: 'hotel'`, `country`, `city`, `hotel_name`, `visitor_country`) | Step 3: Look at a hotel |
| `booking_click` | Visitor taps an outbound partner booking link (via `OutboundLink`) | Core parameters, `partner` (booking, agoda, makemytrip, cleartrip, easemytrip, expedia, other), `placement` (city_card, hotel_page, matchmaker, blog, other) | Step 4: Booking click (Conversion) |
| `search` | Destination search term selected or returns 0 results | Core parameters, `term`, `results_count` | Discovery & inventory demand |
| `filter_used` | Bathtub filter pill or sort order toggled | Core parameters, `filter`, `results_count` | Preference & inventory refinement |
| `wishlist_add` | Hotel saved to wishlist (heart toggled ON) | Core parameters (`hotel_name`, `country`, `city`) | High intent / consideration save |
| `matchmaker_start` | First question answered in Dream Soak Matchmaker | Core parameters (`page_type: 'matchmaker'`) | Interactive discovery start |
| `matchmaker_complete` | Matchmaker results revealed | Core parameters (`page_type: 'matchmaker'`, `country`), `answers` (all 4 options joined by " / ") | Interactive discovery completion |
| `page_not_found` | Visitor reaches 404 error page | Core parameters, `path`, `referrer` | Broken links & missing routes |

---

## Outbound Click Log Architecture

Affiliate redirects pass through `/out?id={hotelId}&url={encodedUrl}&source={source}&city={city}&country={country}`.
The edge worker `functions/out.ts` logs conversion clicks directly to database/analytics storage before 302 redirecting to the partner OTA.

---

## What Not to Do

- **Do not track PII as properties** — no emails, full names, phone numbers, or payment details.
- **Do not fire analytics events inside loops** — each event call is a network request.
- **Do not hardcode tokens or measurement IDs** — read them from environment config or database settings.

---

# Google Stitch MCP Guidelines

When using Google Stitch MCP to generate or refine UI designs:
1. **Plain Language & Simple Baselines First**: Use clean, focused prompts to establish the initial screen rather than monolithic prompts (avoid >3,000–5,000 chars, which cause Stitch to omit components).
2. **Iterative Screen-by-Screen Refinement**: Generate a clean baseline with `generate_screen_from_text`, then iteratively complexify and fine-tune using `edit_screens` and `generate_variants`.
3. **Core Anchor Focus**: Specify screen type, brand aesthetic & emotional palette, hero focal point, and 2–3 core structural modules. Leave micro-details to the editing flow.

