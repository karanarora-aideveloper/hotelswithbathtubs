<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Hotels With Bathtubs (hotelswithbathtubs.com)

## Vercel Deployment & Account Info
- **Vercel Account/Team**: `arorakaran869` (`team_UALwu9SFfH3mdnBpT2jbhbQa`)
- **Vercel Project**: `hotelswithbathtubs` (`prj_tyntNwUH5zdMrZ7LHG7umiZbYNL9`)
- **Custom Domains**: `https://hotelswithbathtubs.com` & `https://www.hotelswithbathtubs.com`
- **Image Storage & Delivery**: All images are hosted on **Cloudflare R2** (`dreamwave` bucket) at `https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/` ($0 egress fees). DO NOT use Vercel Blob or upload assets to Vercel.
- **Vercel Zero-Overload Rule**: `images: { unoptimized: true }` is enabled in `next.config.ts`. All images are served directly from Cloudflare R2 without routing through Vercel's `/_next/image` optimization service. This guarantees **0 / 1,000** image optimization quota usage and **0 GB** image bandwidth on Vercel Hobby.
---

# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics. Mixpanel is the single source of truth for event tracking, user identification, and behavioral data. Do not introduce any other analytics tools, SDKs, or tracking libraries without explicit instruction from a user.

---

## Before You Add or Modify Any Tracking

⛔ **Do not write Mixpanel tracking code without reading this file first.**

Wrong assumptions about platform, identity, or consent will produce broken Mixpanel data that requires manual cleanup or data deletion requests.

### Mandatory checklist before writing any Mixpanel code

- [x] Confirm you are using the correct Mixpanel SDK for this project's platform (see Tech Stack below)
- [x] Check if this project routes data through a CDP — if yes, send Mixpanel events through the CDP, not the Mixpanel SDK directly
- [x] Check if consent gating is required — if this project serves EU or California users, no Mixpanel events may fire before user consent
- [x] Review the existing Mixpanel tracking plan below before adding new events

---

## Tech Stack

| Detail | Value |
|---|---|
| **Platform** | Next.js App Router (React 19) |
| **Mixpanel SDK** | `mixpanel-browser` |
| **SDK version** | `^2.55.0` |
| **Tracking method** | client-side |
| **CDP (if any)** | none |
| **Consent required** | no |
| **Mixpanel project token location** | `.env.local` -> `NEXT_PUBLIC_MIXPANEL_TOKEN` |

---

## Mixpanel Initialization

Mixpanel is initialized in:

**File:** `src/lib/analytics.ts`
**Provider:** `src/components/MixpanelProvider.tsx`

```typescript
// Mixpanel is initialized client-side once at app startup
initMixpanel();
```

**Do not:**
- Initialize Mixpanel in multiple places
- Create separate Mixpanel instances per component or module
- Import Mixpanel directly in feature files — use the shared helpers in `src/lib/analytics.ts`

---

## Mixpanel Identity

Mixpanel identity is managed through:
- *Out of Scope:* This project is a public travel directory and blog with no signup/login paths for visitors (only basic auth for `/admin`).

---

## Mixpanel Tracking Plan

These are the Mixpanel events currently tracked in this project. **All new Mixpanel events must follow the same conventions.**

### Naming conventions

- Mixpanel event names: `snake_case`, past tense verb + noun (e.g., `hotel_booking_click`)
- Mixpanel property names: `snake_case` (e.g., `hotel_name`, `booking_source`)
- No abbreviations in Mixpanel event or property names — use full words
- Boolean Mixpanel properties: use `is_` prefix (e.g., `is_first_time`)

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

## How to Add a New Mixpanel Event

1. **Check the tracking plan above** — if the Mixpanel event already exists, use it. Do not create duplicate Mixpanel events.
2. **Name the Mixpanel event** using the conventions above: `snake_case`, past tense, descriptive.
3. **Define Mixpanel properties** — only include properties available at the moment the event fires. Do not fetch additional data just for Mixpanel tracking.
4. **Place the Mixpanel tracking call** at the right moment using `trackEvent()` from `src/lib/analytics.ts`.
5. **Update this file** — add the new Mixpanel event to the tracking plan table above.
6. **Verify in Mixpanel Live View** — confirm the event appears in Mixpanel with correct properties before considering it done.

### Mixpanel event template

```typescript
import { trackEvent } from '@/lib/analytics';

trackEvent('[event_name]', {
  property_name: value,
});
```

---

## What Not to Do

- **Do not introduce other analytics tools.** This project uses Mixpanel. All tracking goes through Mixpanel.
- **Do not track PII as Mixpanel properties** — no emails, full names, phone numbers, or payment details in Mixpanel event properties.
- **Do not fire Mixpanel events inside loops** — each Mixpanel event call is a network request.
- **Do not hardcode the Mixpanel project token** — read it from environment config.
