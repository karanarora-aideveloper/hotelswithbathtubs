export const DEFAULT_AGODA_CID = '1972736';
// No fallback: the old hard-coded Booking aid was never ours (it came with scraped links). Booking.com now runs via CJ (below).
export const DEFAULT_BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID || '';
export const DEFAULT_EXPEDIA_CAMREF = process.env.NEXT_PUBLIC_EXPEDIA_CAMREF || '';
export const DEFAULT_CUELINKS_CID = '325472';
// Cuelinks is OFF by default: its campaign was not tracking or paying. Set NEXT_PUBLIC_USE_CUELINKS=true to re-enable.
export const USE_CUELINKS = process.env.NEXT_PUBLIC_USE_CUELINKS === 'true';
export const DEFAULT_EARNKARO_ID = '1471944';
export const EARNKARO_MMT_RETAILER_ID = '1729';
export const EARNKARO_AGODA_RETAILER_ID = '2927';
export const DEFAULT_TRIP_ALLIANCEID = process.env.NEXT_PUBLIC_TRIP_ALLIANCEID || '';
export const DEFAULT_TRIP_SID = process.env.NEXT_PUBLIC_TRIP_SID || '';

/**
 * Universal toggle for affiliate link wrapping.
 * ON since 24 Nov 2026 (founder): Booking.com and Trip.com via CJ.
 * Kill switch: set NEXT_PUBLIC_AFFILIATES_ENABLED=false at build time and every
 * outbound link goes back to the clean, unwrapped partner URL.
 */
export const AFFILIATES_ENABLED = process.env.NEXT_PUBLIC_AFFILIATES_ENABLED !== 'false';

/**
 * One-line reader disclosure shown next to booking links. Follows the switch above,
 * so the site never says "no commission" while affiliate links are live.
 */
export const BOOKING_LINK_DISCLOSURE = AFFILIATES_ENABLED
  ? 'Some booking links (Booking.com and Trip.com) are affiliate links: if you book, we may earn a commission at no extra cost to you. It never changes which hotels we list or how we label them.'
  : "Links go straight to the booking site. We don't earn a commission from them today.";

/**
 * CJ (Commission Junction) publisher website ID for hotelswithbathtubs.com, plus the
 * Booking.com link ID. Both are public by design: they appear in every tracking link.
 */
export const CJ_PID = process.env.NEXT_PUBLIC_CJ_PID || '101861781';
export const CJ_BOOKING_LINK_ID = process.env.NEXT_PUBLIC_CJ_BOOKING_LINK_ID || '17293139';

/**
 * Placeholder for the visitor country inside a CJ `sid`. The /out edge function
 * (functions/out.ts) swaps it for the visitor's CF-IPCountry; elsewhere it stays "xx".
 */
export const CJ_SID_COUNTRY_PLACEHOLDER = 'xx';

/** Builds a CJ sid like "xx-hotel": letters, digits and dashes only, no personal data. */
export function buildCjSid(pageType?: string, country: string = CJ_SID_COUNTRY_PLACEHOLDER): string {
  const clean = (v: string) => (v || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  const parts = [clean(country) || CJ_SID_COUNTRY_PLACEHOLDER, clean(pageType || '') || 'other'];
  return parts.join('-').slice(0, 64);
}

/** Booking.com via CJ: https://www.jdoqocy.com/click-{PID}-{LINK_ID}?url={encoded booking URL}&sid={sid} */
export function getBookingCjLink(url: string, sid: string = buildCjSid()): string {
  const clean = stripTrackingParams(url);
  return `https://www.jdoqocy.com/click-${CJ_PID}-${CJ_BOOKING_LINK_ID}?url=${encodeURIComponent(clean)}&sid=${encodeURIComponent(sid)}`;
}

/** Trip.com via CJ deep link (tested 24 Nov): https://www.anrdoezrs.net/links/{PID}/type/dlg/sid/{sid}/{trip.com URL} */
export function getTripCjLink(url: string, sid: string = buildCjSid()): string {
  const clean = stripTrackingParams(url);
  return `https://www.anrdoezrs.net/links/${CJ_PID}/type/dlg/sid/${encodeURIComponent(sid)}/${clean}`;
}

/** CJ click domains. They must also be in the functions/out.ts allowlist. */
export const CJ_DOMAINS = ['jdoqocy.com', 'anrdoezrs.net', 'dpbolvw.net', 'kqzyfj.com', 'tkqlhce.com'];

export const REDIRECT_HOSTS = [
  'linkredirect.in',
  'linksredirect.com',
  'ekaro.in',
  'earnkaro.com',
  'cuelinks.com',
  'clnk.in',
  'bitli.in',
];

export function isRedirectHost(hostname: string): boolean {
  if (!hostname) return false;
  const host = hostname.toLowerCase();
  return REDIRECT_HOSTS.some((d) => host === d || host.endsWith('.' + d));
}

/**
 * Recursively unwraps redirect wrapper URLs (EarnKaro, Cuelinks, Linkredirect, /out)
 * to extract the authentic destination URL.
 */
export function unwrapRedirectUrl(urlStr: string): string {
  if (!urlStr || typeof urlStr !== 'string') return urlStr;
  let current = urlStr.trim();
  for (let i = 0; i < 5; i++) {
    try {
      const parsed = current.startsWith('/')
        ? new URL(current, 'https://www.hotelswithbathtubs.com')
        : new URL(current);
      if (isRedirectHost(parsed.hostname) || parsed.pathname === '/out') {
        const target =
          parsed.searchParams.get('dl') ||
          parsed.searchParams.get('url') ||
          parsed.searchParams.get('murl') ||
          parsed.searchParams.get('target') ||
          parsed.searchParams.get('destination') ||
          parsed.searchParams.get('redirect_url');
        if (target) {
          let decoded = target;
          try {
            decoded = decodeURIComponent(target);
          } catch {
            // Keep original target if decode fails
          }
          if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
            current = decoded;
            continue;
          }
        }
      }
      break;
    } catch {
      break;
    }
  }
  return current;
}

export const STRIP_PARAM_REGEX = /^(aid|label|cid|camref|cref|allianceid|sid|tag|ouid|ascsubtag|subid|sub_id|pub_id|affid|affiliateid|affiliate_id|aff_id|affcid|gclid|fbclid|msclkid|dclid|zanpid|ref|utm_.*|affil_.*)$/i;

/**
 * Strips affiliate, advertising, and analytics tracking query parameters
 * from an outbound URL, while strictly preserving legitimate destination
 * and property identifiers (e.g. hotelId, hid, city, country, etc.).
 */
export function stripTrackingParams(urlStr: string): string {
  if (!urlStr || typeof urlStr !== 'string') return urlStr;
  try {
    const isRelative = urlStr.startsWith('/');
    const parsed = isRelative
      ? new URL(urlStr, 'https://www.hotelswithbathtubs.com')
      : new URL(urlStr);

    const keysToDelete: string[] = [];
    for (const key of parsed.searchParams.keys()) {
      if (STRIP_PARAM_REGEX.test(key)) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      parsed.searchParams.delete(key);
    }

    if (isRelative) {
      const qs = parsed.searchParams.toString();
      return `${parsed.pathname}${qs ? `?${qs}` : ''}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return urlStr;
  }
}

/**
 * Produces a completely clean outbound URL:
 * unwraps redirects, strips all affiliate & tracking params, and optionally appends trip dates.
 */
export function cleanOutboundUrl(url: string, dates?: TripDates): string {
  if (!url || typeof url !== 'string') return url;
  const unwrapped = unwrapRedirectUrl(url);
  const stripped = stripTrackingParams(unwrapped);
  return dates ? appendTripDates(stripped, dates) : stripped;
}

/**
 * Robust domain checker that prevents subdomain/domain overlap bugs
 * (e.g. 'makemytrip.com' or 'cleartrip.com' erroneously matching 'trip.com').
 */
export function matchesDomain(hostname: string, domain: string): boolean {
  if (!hostname) return false;
  const host = hostname.toLowerCase();
  const target = domain.toLowerCase();
  return host === target || host.endsWith('.' + target);
}

/**
 * Transforms an Expedia hotel URL to include partner tracking parameters
 */
export function getExpediaAffiliateLink(url: string, camref: string = DEFAULT_EXPEDIA_CAMREF): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) return url;
  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'expedia.com')) {
      if (camref) parsedUrl.searchParams.set('camref', camref);
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getExpediaAffiliateLink:', url);
  }
  return url;
}

/**
 * Transforms a Hotels.com hotel URL to include partner tracking parameters
 */
export function getHotelsComAffiliateLink(url: string, camref: string = DEFAULT_EXPEDIA_CAMREF): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) return url;
  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'hotels.com')) {
      if (camref) parsedUrl.searchParams.set('camref', camref);
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getHotelsComAffiliateLink:', url);
  }
  return url;
}

/**
 * Transforms a Trip.com hotel URL to include the affiliate tracking Allianceid and SID
 */
export function getTripAffiliateLink(
  url: string,
  allianceId: string = DEFAULT_TRIP_ALLIANCEID,
  sid: string = DEFAULT_TRIP_SID
): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'trip.com')) {
      if (allianceId) parsedUrl.searchParams.set('Allianceid', allianceId);
      if (sid) parsedUrl.searchParams.set('SID', sid);
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getTripAffiliateLink:', url);
  }
  return url;
}

/**
 * Transforms an Agoda hotel URL to route through EarnKaro profit links (Retailer 2927)
 * or falls back to direct Agoda CID if EarnKaro is disabled.
 */
export function getAgodaAffiliateLink(
  url: string,
  cid: string = DEFAULT_AGODA_CID,
  earnkaroId: string = DEFAULT_EARNKARO_ID
): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  // If already an EarnKaro or tracking redirect link, don't double-wrap
  if (url.includes('earnkaro.com') || url.includes('ekaro.in') || url.includes('linkredirect.in') || url.includes('bitli.in')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'agoda.com')) {
      // Remove any existing direct CID to avoid affiliate collision with EarnKaro CJ tracking
      parsedUrl.searchParams.delete('cid');
      const cleanUrl = parsedUrl.toString();

      // Route via approved EarnKaro Retailer 2927 (Agoda)
      if (earnkaroId) {
        return `https://trackingv3.linkredirect.in/visitretailer/${EARNKARO_AGODA_RETAILER_ID}?id=${encodeURIComponent(earnkaroId)}&dl=${encodeURIComponent(cleanUrl)}`;
      }

      // Fallback to direct Agoda CID
      const targetCid = cid || DEFAULT_AGODA_CID;
      if (targetCid) {
        parsedUrl.searchParams.set('cid', targetCid);
      }
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getAgodaAffiliateLink:', url);
  }
  return url;
}

/**
 * Transforms a Booking.com hotel URL to include a direct Booking affiliate AID.
 * Only used if NEXT_PUBLIC_BOOKING_AID is set; the live site uses getBookingCjLink instead.
 */
export function getBookingAffiliateLink(url: string, aid: string = DEFAULT_BOOKING_AID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'booking.com')) {
      if (aid) {
        parsedUrl.searchParams.set('aid', aid);
      } else {
        parsedUrl.searchParams.delete('aid');
      }
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getBookingAffiliateLink:', url);
  }
  return url;
}

/**
 * Transforms a MakeMyTrip hotel URL to route through EarnKaro profit links (Retailer 1729)
 * or falls back to direct MMT affiliate tracking.
 */
export function getMakeMyTripAffiliateLink(
  url: string,
  earnkaroId: string = DEFAULT_EARNKARO_ID,
  directAffiliateId?: string
): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  // If already an EarnKaro or Cuelinks link, don't double-wrap
  if (url.includes('earnkaro.com') || url.includes('ekaro.in') || url.includes('linkredirect.in') || url.includes('linksredirect.com') || url.includes('bitli.in')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (matchesDomain(parsedUrl.hostname, 'makemytrip.com')) {
      if (directAffiliateId) {
        parsedUrl.searchParams.set('affiliateId', directAffiliateId);
        return parsedUrl.toString();
      }

      // Route via EarnKaro (verified account). Cuelinks only when explicitly re-enabled.
      if (USE_CUELINKS && DEFAULT_CUELINKS_CID) {
        return `https://linksredirect.com/?cid=${DEFAULT_CUELINKS_CID}&source=api&url=${encodeURIComponent(url)}`;
      }

      if (earnkaroId) {
        return `https://trackingv3.linkredirect.in/visitretailer/${EARNKARO_MMT_RETAILER_ID}?id=${encodeURIComponent(earnkaroId)}&dl=${encodeURIComponent(url)}`;
      }
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getMakeMyTripAffiliateLink:', url);
  }
  return url;
}

/**
 * Converts a MakeMyTrip, Agoda, or supported merchant URL to an EarnKaro Profit Link
 */
export function getEarnkaroAffiliateLink(url: string, earnkaroId: string = DEFAULT_EARNKARO_ID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  // If already an EarnKaro link, don't double-wrap
  if (url.includes('earnkaro.com') || url.includes('ekaro.in') || url.includes('linkredirect.in') || url.includes('bitli.in')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    // MakeMyTrip Hotels direct deep link engine (Retailer 1729)
    if (matchesDomain(host, 'makemytrip.com') && earnkaroId) {
      return `https://trackingv3.linkredirect.in/visitretailer/${EARNKARO_MMT_RETAILER_ID}?id=${encodeURIComponent(earnkaroId)}&dl=${encodeURIComponent(url)}`;
    }

    // Agoda Hotels direct deep link engine (Retailer 2927)
    if (matchesDomain(host, 'agoda.com') && earnkaroId) {
      parsedUrl.searchParams.delete('cid');
      return `https://trackingv3.linkredirect.in/visitretailer/${EARNKARO_AGODA_RETAILER_ID}?id=${encodeURIComponent(earnkaroId)}&dl=${encodeURIComponent(parsedUrl.toString())}`;
    }

    // Other supported EarnKaro merchants
    const isEarnkaroEligible = 
      host.includes('goibibo.com') ||
      host.includes('cleartrip.com') ||
      host.includes('amazon.in') ||
      host.includes('nykaa.com') ||
      host.includes('forestessentialsindia.com') ||
      host.includes('kamaayurveda.in');

    if (isEarnkaroEligible && earnkaroId) {
      return `https://ekaro.in/enkr?url=${encodeURIComponent(url)}&r=${encodeURIComponent(earnkaroId)}`;
    }
  } catch (e) {
    console.error('Invalid URL in getEarnkaroAffiliateLink:', url);
  }

  return url;
}

export type TripDates = {
  checkin?: string; // YYYY-MM-DD
  checkout?: string; // YYYY-MM-DD
  adults?: number;
};

/**
 * Dynamically appends check-in, check-out, and guest counts to OTA booking URLs
 * for zero-friction price lookup on partner checkout pages.
 */
export function appendTripDates(url: string, dates?: TripDates): string {
  if (!url || !dates || !dates.checkin || !dates.checkout) return url;

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (matchesDomain(host, 'booking.com')) {
      parsedUrl.searchParams.set('checkin', dates.checkin);
      parsedUrl.searchParams.set('checkout', dates.checkout);
      parsedUrl.searchParams.set('group_adults', String(dates.adults || 2));
      parsedUrl.searchParams.set('no_rooms', '1');
      return parsedUrl.toString();
    }

    if (matchesDomain(host, 'agoda.com')) {
      // If it is a generic partnersearch without a specific property ID (hid=),
      // DO NOT append checkin/checkout dates, because Agoda strips the hotel name
      // and converts it into a blank city-wide date search!
      if (parsedUrl.pathname.includes('partnersearch.aspx') && !parsedUrl.searchParams.has('hid') && !parsedUrl.searchParams.has('selectedproperty')) {
        return url;
      }
      parsedUrl.searchParams.set('checkin', dates.checkin);
      parsedUrl.searchParams.set('checkout', dates.checkout);
      parsedUrl.searchParams.set('adults', String(dates.adults || 2));
      parsedUrl.searchParams.set('rooms', '1');
      return parsedUrl.toString();
    }

    if (matchesDomain(host, 'makemytrip.com')) {
      const cinParts = dates.checkin.split('-');
      const coutParts = dates.checkout.split('-');
      if (cinParts.length === 3 && coutParts.length === 3) {
        parsedUrl.searchParams.set('checkin', `${cinParts[1]}${cinParts[2]}${cinParts[0]}`);
        parsedUrl.searchParams.set('checkout', `${coutParts[1]}${coutParts[2]}${coutParts[0]}`);
        parsedUrl.searchParams.set('roomStayQualifier', `${dates.adults || 2}e0e`);
      }
      return parsedUrl.toString();
    }

    if (matchesDomain(host, 'trip.com')) {
      parsedUrl.searchParams.set('checkin', dates.checkin);
      parsedUrl.searchParams.set('checkout', dates.checkout);
      parsedUrl.searchParams.set('adult', String(dates.adults || 2));
      return parsedUrl.toString();
    }

    if (matchesDomain(host, 'expedia.com') || matchesDomain(host, 'hotels.com')) {
      parsedUrl.searchParams.set('startDate', dates.checkin);
      parsedUrl.searchParams.set('endDate', dates.checkout);
      parsedUrl.searchParams.set('adults', String(dates.adults || 2));
      return parsedUrl.toString();
    }

    if (matchesDomain(host, 'airbnb.com')) {
      parsedUrl.searchParams.set('check_in', dates.checkin);
      parsedUrl.searchParams.set('check_out', dates.checkout);
      parsedUrl.searchParams.set('adults', String(dates.adults || 2));
      return parsedUrl.toString();
    }
  } catch {
    // Return original url on failure
  }
  return url;
}

/**
 * Universal Outbound Link Wrapper.
 * Affiliates ON: Booking.com and Trip.com are wrapped in their approved CJ links
 * (sid = "{country placeholder}-{page type}"); every other partner gets the clean,
 * unwrapped URL, because no other programme is approved yet (founder, 24 Nov 2026).
 * Affiliates OFF: every link is the clean, unwrapped URL.
 */
export function wrapOutboundAffiliateLink(
  url: string,
  options?: { pageType?: string },
  dates?: TripDates
): string {
  if (!url) return url;

  const clean = cleanOutboundUrl(url, dates);
  if (!AFFILIATES_ENABLED) return clean;

  try {
    const host = new URL(clean).hostname.toLowerCase();
    const sid = buildCjSid(options?.pageType);

    if (matchesDomain(host, 'booking.com')) {
      return getBookingCjLink(clean, sid);
    }

    if (matchesDomain(host, 'trip.com')) {
      return getTripCjLink(clean, sid);
    }
  } catch {
    // Return the clean URL on parse failure
  }

  return clean;
}

/**
 * Returns a numeric tier for how direct a booking URL is:
 * 0 = True Standalone Property Detail Page (/hotel/*.html, hotel-details, /rooms/*)
 * 1 = Pinned Property ID on City Search (hid=, selectedproperty=)
 * 2 = Scoped City / Keyword Search Fallback (city=, booking searchresults, mmt search)
 * 99 = Broken Search / Generic Homepage Redirect (partnersearch.aspx with only text/txt)
 */
export function getUrlDirectnessTier(url?: string): number {
  if (!url) return 99;
  const lower = url.toLowerCase();

  if (lower.includes('agoda.com')) {
    if (lower.includes('/hotel/') && lower.includes('.html')) return 0;
    if (lower.includes('hid=') || lower.includes('selectedproperty=')) return 1;
    // Any partnersearch.aspx that only has text/txt search (even with city) is a generic search fallback, not a direct hotel
    if (lower.includes('partnersearch.aspx')) {
      if (lower.includes('hid=') || lower.includes('selectedproperty=')) return 1;
      return 99;
    }
    if (lower.includes('city=')) return 2;
    return 99;
  }
  if (lower.includes('makemytrip.com')) {
    if ((lower.includes('hotel-details') || lower.includes('hotelid=')) && !lower.includes('hotel-listing')) return 0;
    return 99; // Generic hotel search / listings are not direct hotel pages
  }
  if (lower.includes('booking.com')) {
    if (lower.includes('/hotel/') && !lower.includes('searchresults')) return 0;
    // Any bare searchresults.html (or ss= search fallback) loses property context and redirects to blank search
    return 99;
  }
  if (lower.includes('expedia.com') || lower.includes('hotels.com')) {
    if (lower.includes('/hotel/') || lower.includes('.h') || lower.includes('/ho') || lower.includes('/hotel-information/')) return 0;
    return 2;
  }
  if (lower.includes('vrbo.com')) {
    if (lower.includes('/p') || lower.includes('/unit/')) return 0;
    return 2;
  }
  if (lower.includes('airbnb.')) {
    if (lower.includes('/rooms/')) return 0;
    return 99; // Filter out search pages (/s/{city}/homes?query=...) so they never surface as booking buttons
  }
  if (lower.includes('trip.com')) {
    if (lower.includes('/hotels/detail') || (lower.includes('/hotels/') && !lower.includes('/list?'))) return 0;
    return 2;
  }
  return 2;
}

/**
 * Returns true if the URL points directly to the specific property
 * (either standalone detail page or pinned property ID).
 */
export function isDirectPropertyUrl(url?: string): boolean {
  return getUrlDirectnessTier(url) <= 1;
}

/**
 * Checks all available booking URLs for a hotel and returns the first specific
 * standalone property page URL, if available.
 */
export function getSpecificHotelLink(hotel: {
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
  expediaUrl?: string;
  hotelsComUrl?: string;
  vrboUrl?: string;
  airbnbUrl?: string;
  tripUrl?: string;
  mmtUrl?: string;
}): string | null {
  const candidates = [
    hotel.bookingUrl,
    hotel.expediaUrl,
    hotel.hotelsComUrl,
    hotel.agodaUrl,
    hotel.mmtUrl,
    hotel.url,
    hotel.airbnbUrl,
    hotel.vrboUrl,
    hotel.tripUrl,
  ];
  for (const candidate of candidates) {
    if (isDirectPropertyUrl(candidate)) {
      return candidate!;
    }
  }
  return null;
}


