# Analytics plan — 24 Nov 2026 (ANALYTICS-TAPS1)

Goal (founder): capture every meaningful tap on the site, and see affiliate clicks per partner, per page and per country.

## 1. Audit: what the site sent before this change

Numbers are GA4, 26 Oct – 22 Nov 2026 (1,117 visitors, 1,232 sessions).

| Event | Where it fires | Count | Finding |
|---|---|---|---|
| `page_view` | `GoogleAnalyticsProvider`, once per route | 2,954 | OK |
| `view_destination` | `CityHotelsClient`, `CountryCitiesClient` on load | 649 | OK |
| `view_hotel` | `RecordHotelView` on load | 620 | OK |
| `booking_click` | `OutboundLink` on tap | 260 (+108 as old `hotel_booking_click`) | **Partner often wrong**: callers pass a placement name (`matchmaker_cta`, `wishlist_cta`, `soaking_hub_card`) as `source`, which became partner `other`. Trip.com, Airbnb, Hotels.com and Vrbo were not partners at all. |
| `search` | `HomeSearch`, `DarkHomeSearch`, `LuxuryHero` | about 47 | OK |
| `filter_used` | `CityHotelsClient` filter pills and sort | about 80 | OK |
| `wishlist_add` | `Favorites` heart | low | OK |
| `matchmaker_start` / `matchmaker_complete` | `DreamSoakMatchmaker` | low | OK |
| `page_not_found` | `NotFoundTracker` | low | OK |
| `scroll`, `click`, `form_start`, `user_engagement`, `session_start`, `first_visit` | GA4 automatic (enhanced measurement) | — | `scroll` only fires at 90%; `click` only counts links to other domains, and booking buttons go through `/out` on our own domain, so it misses them |
| `hotel_card_view`, `user_churn`, `scroll_depth`, `rage_click`, `exit_intent`, `hotel_booking_click` | removed from code on 3 Nov | still in old data | History only |

What was missing:

1. **No custom dimensions were registered in GA4.** Every parameter the site sends (`partner`, `placement`, `page_type`, `country`, `city`, `hotel_name`, `term`, `filter`…) was collected but could not be used in any report.
2. **No tap tracking** outside booking buttons, search and filters: hotel cards, city and country links, guide links, header, footer, breadcrumbs, gallery, outbound links, other buttons.
3. **No scroll depth** on hotel pages.
4. **`booking_click` is not marked as a key event** in GA4, so GA shows 0 conversions.
5. **Click log only from the page.** `functions/api/track-click.ts` writes each booking tap to the D1 table `hotel_clicks` (database `hotelswithbathtubs-clicks`, binding `DB`; 665 rows since 20 Oct). It depends on a beacon sent by the page, and it stores user agent, visitor city and the full referrer. `functions/out.ts` itself logged nothing. (An earlier version of this plan wrongly said the beacon returned 404.)
6. The site has **no map**, so there is nothing to track for "map opens".

## 2. The scheme: 12 events

Ten funnel events stay as they are. Two are added. There are no per-button event names: one event, `ui_click`, describes every tap with four parameters.

| Event | Fires when | Parameters (plus the core ones) |
|---|---|---|
| `page_view` | route loads | `page_location`, `page_path`, `page_title` |
| `view_destination` | city or country page loads | — |
| `view_hotel` | hotel page loads | `hotel_name` |
| `booking_click` | any booking button is tapped | `partner`, `placement`, `link_type` (new), `hotel_name` |
| `search` | search result chosen, or 0 results | `term`, `results_count` |
| `filter_used` | filter pill or sort changed | `filter`, `results_count` |
| `wishlist_add` | heart turned on | `hotel_name` |
| `matchmaker_start` / `matchmaker_complete` | quiz start / results | `answers` |
| `page_not_found` | 404 page | `path`, `referrer` |
| **`ui_click`** (new) | any other meaningful tap | `element`, `section`, `label`, `target` |
| **`scroll_depth`** (new) | hotel page scrolled to 25 / 50 / 75 / 90% (once each per page) | `percent` |

Core parameters on every event: `page_type`, `country`, `city`, and `hotel_name`, `visitor_country` when known.

### `booking_click` values

- `partner`: `booking`, `agoda`, `makemytrip`, `cleartrip`, `easemytrip`, `expedia`, `trip`, `airbnb`, `hotels_com`, `vrbo`, `other`. Now taken from the destination address, so it is right for every button.
- `placement`: `city_card`, `hotel_page`, `matchmaker`, `blog`, `other`.
- `link_type`: `affiliate` (wrapped in a CJ link: Booking.com, Trip.com) or `direct`.

### `ui_click` values

| `element` | What was tapped | `target` holds |
|---|---|---|
| `hotel_card` | any link to a hotel page | the hotel page path |
| `destination_link` | any link to a city or country page | the page path |
| `guide_link` | any link to the blog or a guide | the page path |
| `matchmaker_link` | link to the matchmaker | the page path |
| `internal_link` | any other link on our site (home, policies, hubs) | the page path |
| `outbound_link` | link to another site that is not a booking button (social, Pinterest save) | the site's host name |
| `contact_link` | `mailto:` or `tel:` link | `mailto` or `tel` only, never the address |
| `gallery` | hotel photo grid or photo viewer | — (`label` is `open` or `viewer`) |
| `button` | any other button (menus, country picker, filter pills, show more) | — |

- `section`: `header`, `footer`, `breadcrumb` or `main`. "Header links" = `section = header`; "footer links" = `section = footer`.
- `label`: the visible text or aria-label of what was tapped, cut to 60 characters.
- Filter pills send both `filter_used` and a `ui_click` with `element = button`. Count filters from `filter_used`.

### How it works

`GoogleAnalyticsProvider` adds one click listener for the whole site (`classifyClick` and `sendUiClick` in `src/lib/events.ts`). It reads the link address and the visible label of the tapped element. New links and buttons are tracked automatically with no extra code.

To name a non-link area, add `data-track="name"` (and optionally `data-track-label`) to its wrapper, as `HotelGallery` does. To exclude an area, add `data-track="off"`.

### Privacy

- Nothing a visitor types is read. Form fields are never read; only link addresses and on-page labels.
- Link targets are sent without query strings. `mailto:` and `tel:` targets are sent as the scheme only.
- Consent and the internal-traffic opt-out apply to the new events exactly as to the old ones (`shouldSendEvent`).
- Taps on booking buttons send `booking_click` only, not `ui_click`.

## 3. Custom dimensions registered in GA4 (24 Nov 2026)

All event-scoped, in the "Hotels with Bathtubs" property. 17 of the 50 allowed.

| Dimension | Parameter | Used by |
|---|---|---|
| Partner | `partner` | `booking_click` |
| Placement | `placement` | `booking_click` |
| Link type | `link_type` | `booking_click` |
| Page type | `page_type` | all events |
| Page country | `country` | all events (country of the page, not of the visitor) |
| Page city | `city` | all events |
| Hotel name | `hotel_name` | `view_hotel`, `booking_click`, `wishlist_add` |
| Tap element | `element` | `ui_click` |
| Tap section | `section` | `ui_click` |
| Tap label | `label` | `ui_click` |
| Tap target | `target` | `ui_click` |
| Search term | `term` | `search` |
| Filter | `filter` | `filter_used` |
| Scroll percent | `percent` | `scroll_depth` |
| Matchmaker answers | `answers` | `matchmaker_complete` |
| Missing path | `path` | `page_not_found` |
| Visitor country | `visitor_country` | all events, only when the visitor picked a country |

Custom dimensions only fill from the day they are registered. Data before 24 Nov 2026 cannot be split by them. New dimensions take up to 48 hours to appear in reports.

## 4. How to see affiliate clicks in GA4

Open **Explore → Blank exploration**, pick the date range, then:

| Question | Rows | Values | Filter |
|---|---|---|---|
| Clicks per partner | Partner | Event count | Event name = `booking_click` |
| Affiliate vs direct | Link type, Partner | Event count | Event name = `booking_click` |
| Per page type | Page type, Placement | Event count | Event name = `booking_click` (add Link type = `affiliate` for affiliate only) |
| Per exact page | Page path | Event count | Event name = `booking_click` |
| Per visitor country | Country (GA's own) | Event count | Event name = `booking_click` |
| Per destination | Page country, Page city | Event count | Event name = `booking_click` |
| Per hotel | Hotel name | Event count | Event name = `booking_click` |
| Which taps happen most | Tap element, Tap section | Event count | Event name = `ui_click` |
| Which header or footer links | Tap label, Tap target | Event count | Event name = `ui_click`, Tap section = `header` or `footer` |
| How far hotel pages are read | Scroll percent | Total users | Event name = `scroll_depth` |

CJ reports the bookings and commission per `sid` (`{visitor country}-{page type}`, for example `in-hotel`). GA4 shows clicks; CJ shows what they earned.

## 5. Click logging on `/out` — built 24 Nov 2026 (ANALYTICS-OUTLOG1)

Why: GA4 misses visitors with ad blockers, visitors in the UK/EEA who have not consented, and taps where the page closes before the event is sent. `/out` sees every click.

- **Where:** new table `out_clicks` in the existing D1 database `hotelswithbathtubs-clicks`, already bound to the Pages project as `DB`. No new Cloudflare setup. Table definition: `scripts/d1/out_clicks.sql` (created in the live database 24 Nov).
- **How:** `functions/out.ts` inserts one row per GET with `waitUntil`, after the redirect is sent; a failed write never affects the visitor. HEAD requests, invalid links and blocked destinations are not logged.
- **Row:** `ts`, `partner`, `link_type` (`affiliate` = CJ, else `direct`), `page_type`, `page_path` (no query string), `placement`, `hotel_name`, `visitor_country` (from `CF-IPCountry`). No IP, no user agent, no referrer.
- **Where the fields come from:** `OutboundLink` adds `from` (page path), `pl` (placement) and `h` (hotel name) to the `/out` link. Partner and link type are read from the destination; country from Cloudflare.
- **Cost:** D1 free tier is 100,000 writes a day and 5 GB; we have about 15–30 clicks a day. ₹0.
- **Report:** `node scripts/out-clicks-report.mjs [days]` prints clicks per day, partner, page type and placement, visitor country and top pages.

The older beacon log (`/api/track-click` → `hotel_clicks`) still runs unchanged. Once `out_clicks` has a couple of weeks of data, the founder can decide whether to switch the beacon off, since it stores more than we need (user agent, city, referrer).

## 6. Still to decide

- Mark `booking_click` as a **key event** in GA4 (Admin → Events), so GA reports conversions and conversion rate.
- GA4 keeps event-level data for 2 months by default; Admin → Data retention can raise it to 14 months.
