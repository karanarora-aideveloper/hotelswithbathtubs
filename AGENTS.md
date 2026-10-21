<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

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

# Analytics Tracking — Mixpanel & Google Analytics 4 (GA4)

This project uses **Mixpanel** and **Google Analytics 4 (GA4)** for product analytics, outbound affiliate conversion measurement, and specialized user churn / pain point tracking.

---

## Google Analytics 4 (GA4) Integration & Churn Telemetry

Google Analytics 4 is integrated via `@next/third-parties/google` and our custom telemetry layer (`src/lib/gtag.ts` and `src/components/GoogleAnalyticsProvider.tsx`).

### Configuration
- **Measurement ID Location**: `.env.local` -> `NEXT_PUBLIC_GA_MEASUREMENT_ID` (or MongoDB `Settings.googleAnalyticsId` managed in `/admin/seo`).
- **Internal Traffic Exclusion**: Respects `localStorage.getItem('ignore_ga') === 'true'`. When toggled in `/admin`, `window['ga-disable-' + GA_ID] = true` is set, blocking tracking for developers and admins.

### GA4 Events & Churn / Pain Point Tracking Plan

| GA4 Event | Trigger / Condition | Key Parameters | Purpose / Pain Point Identified |
|---|---|---|---|
| `page_view` | User loads or transitions to a route | `page_location`, `page_path`, `page_title`, `page_type`, `country`, `city` | Baseline navigation & funnel entry |
| `user_churn` | Page unmount, visibility hidden, or tab close without conversion | `churn_type`, `page_path`, `page_type`, `country`, `city`, `time_spent_seconds`, `max_scroll_depth`, `last_visible_section`, `hotels_viewed_count`, `has_converted`, `failed_search`, `failed_filter` | **Primary Churn Metric**. Pinpoints where and why user exited (`quick_bounce`, `shallow_browse`, `engaged_no_click`, `search_abandoned`, `filter_dead_end`, `rage_click_churn`, `converted_exit`) |
| `search_zero_results` | User searches for a destination that returns 0 matches | `search_term`, `search_source`, `page_path`, `page_type` | **Pain Point**: Missing city / destination inventory demand |
| `search_abandoned` | User types query (>= 3 chars) but dismisses dropdown without selection | `search_term`, `chars_count`, `page_path` | **Pain Point**: Search UX or incomplete autocomplete matches |
| `search_selection` | User clicks or selects a city from search | `selected_city`, `selected_country`, `search_term`, `page_path` | Search success & destination intent |
| `filter_dead_end` | Bathtub filter or hotel keyword returns 0 hotels | `filter_type`, `filter_query`, `city_name`, `page_path` | **Pain Point**: City lacks specific tub type (e.g. Jacuzzi) or hotel |
| `filter_reset` | User clicks "Reset Filters" after a dead end | `city_name`, `page_path` | Recovery from dead-end filter |
| `filter_applied` | User toggles bathtub filter pill | `filter_type`, `result_count`, `city_name`, `page_path` | Filter usage & preference trends |
| `hotel_card_view` | Hotel card enters viewport (>= 30% visibility) | `hotel_name`, `hotel_position`, `has_price`, `city`, `country`, `page_path` | Exact hotels seen before drop-off |
| `scroll_depth` | User reaches scroll milestones (25%, 50%, 75%, 90%, 100%) | `percent`, `page_path`, `page_type`, `country`, `city` | Drop-off curve & engagement cliff |
| `exit_intent` | Desktop cursor rapidly moves to browser top bar | `time_spent_seconds`, `max_scroll_depth`, `last_visible_section`, `page_path`, `city`, `country` | Pre-churn hesitation signal |
| `rage_click` | User clicks 3+ times within 1200ms in a 40px radius | `element_tag`, `element_text`, `element_class`, `page_path`, `page_type` | **Pain Point**: Unresponsive elements, broken buttons, misleading UI |
| `page_not_found` | User hits a 404 page | `missing_path`, `referrer` | **Pain Point**: Broken internal links or dead backlinks |
| `hotel_booking_click` | User clicks outbound affiliate link (MakeMyTrip, Booking.com, Agoda) | `hotel_name`, `city_name`, `country_name`, `booking_source`, `destination_url`, `time_to_click_seconds`, `hotels_viewed_count` | **Primary Conversion Event** (marks session as `converted_exit`) |

---

## Mixpanel Tracking Plan

These are the Mixpanel events currently tracked in this project. All new Mixpanel events must follow the same conventions.

### Current Mixpanel events

| Mixpanel Event | Trigger | Key Properties | File |
|---|---|---|---|
| `page_view` | User loads or transitions to a route | `path`, `url`, `title` | `src/components/MixpanelProvider.tsx` |
| `hotel_booking_click` | User clicks an outbound booking link | `hotel_name`, `city_name`, `booking_source`, `destination_url` | `src/components/OutboundLink.tsx` |
| `outbound_exit_click` | User clicks non-affiliate outbound link | `destination_url`, `link_text` | `src/components/MixpanelProvider.tsx` |
| `site_exit` | User closes page or tab (unload event) | `time_spent_seconds`, `last_viewed_page` | `src/components/MixpanelProvider.tsx` |

### Super Properties

These properties are automatically attached to **every** event fired during the page session:

| Property | Type | Description |
|---|---|---|
| `page_type` | string | Renders category: `"homepage"`, `"country_hub"`, `"city_listings"`, `"blog_index"`, `"blog_post"` |
| `country` | string | Current country context parsed from pathname (e.g. `"india"`, `"usa"`) |
| `city` | string | Current city context parsed from pathname (e.g. `"munnar"`, `"new-york"`) |

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

