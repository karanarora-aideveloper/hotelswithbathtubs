export const DEFAULT_AGODA_CID = '1972736';
export const DEFAULT_BOOKING_AID = '';
export const DEFAULT_EARNKARO_ID = '1471944';
export const EARNKARO_MMT_RETAILER_ID = '1729';
export const DEFAULT_TRIP_ALLIANCEID = process.env.NEXT_PUBLIC_TRIP_ALLIANCEID || '';
export const DEFAULT_TRIP_SID = process.env.NEXT_PUBLIC_TRIP_SID || '';

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
    if (parsedUrl.hostname.includes('trip.com')) {
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
 * Transforms an Agoda hotel URL to include the affiliate tracking CID.
 * Ensures proper affiliate tracking CID is attached without breaking direct property or search parameters.
 */
export function getAgodaAffiliateLink(url: string, cid: string = DEFAULT_AGODA_CID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('agoda.com')) {
      const existingCid = parsedUrl.searchParams.get('cid');
      const targetCid = cid || existingCid || DEFAULT_AGODA_CID;
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
 * Transforms a Booking.com hotel URL to include the affiliate AID
 */
export function getBookingAffiliateLink(url: string, aid: string = DEFAULT_BOOKING_AID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('booking.com') && aid) {
      parsedUrl.searchParams.set('aid', aid);
      return parsedUrl.toString();
    }
  } catch (e) {
    console.error('Invalid URL in getBookingAffiliateLink:', url);
  }
  return url;
}

/**
 * Converts a MakeMyTrip (or supported Indian merchant) URL to an EarnKaro Profit Link
 */
export function getEarnkaroAffiliateLink(url: string, earnkaroId: string = DEFAULT_EARNKARO_ID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  // If already an EarnKaro link, don't double-wrap
  if (url.includes('earnkaro.com') || url.includes('ekaro.in') || url.includes('linkredirect.in')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    // MakeMyTrip Hotels direct deep link engine
    if (host.includes('makemytrip.com') && earnkaroId) {
      return `https://linkredirect.in/visitretailer/${EARNKARO_MMT_RETAILER_ID}?id=${encodeURIComponent(earnkaroId)}&dl=${encodeURIComponent(url)}`;
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

/**
 * Universal Outbound Link Wrapper
 * Automatically detects the provider (MakeMyTrip, Agoda, Booking.com, Retail)
 * and appends appropriate affiliate tags or EarnKaro routing.
 */
export function wrapOutboundAffiliateLink(
  url: string, 
  customAffiliateIds?: {
    agoda?: string;
    booking?: string;
    makemytrip?: string;
    earnkaro?: string;
    tripAllianceId?: string;
    tripSid?: string;
  }
): string {
  if (!url) return url;

  const agodaCid = customAffiliateIds?.agoda || DEFAULT_AGODA_CID;
  const bookingAid = customAffiliateIds?.booking || DEFAULT_BOOKING_AID;
  const earnkaroId = customAffiliateIds?.earnkaro || DEFAULT_EARNKARO_ID;
  const tripAllianceId = customAffiliateIds?.tripAllianceId || DEFAULT_TRIP_ALLIANCEID;
  const tripSid = customAffiliateIds?.tripSid || DEFAULT_TRIP_SID;

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (host.includes('agoda.com')) {
      return getAgodaAffiliateLink(url, agodaCid);
    }

    if (host.includes('booking.com')) {
      return getBookingAffiliateLink(url, bookingAid);
    }

    if (host.includes('trip.com')) {
      return getTripAffiliateLink(url, tripAllianceId, tripSid);
    }

    if (host.includes('makemytrip.com')) {
      // If direct MMT affiliate tracking exists
      if (customAffiliateIds?.makemytrip) {
        parsedUrl.searchParams.set('affiliateId', customAffiliateIds.makemytrip);
        return parsedUrl.toString();
      }
      return url;
    }

    // General EarnKaro retail routing (Amazon, Nykaa, etc.)
    if (earnkaroId && (host.includes('amazon.in') || host.includes('nykaa.com'))) {
      return getEarnkaroAffiliateLink(url, earnkaroId);
    }
  } catch {
    // Return unmodified on parse failure
  }

  return url;
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
    if (lower.includes('city=')) return 2;
    // Agoda partnersearch with only text= or txt= (without hid or city) 302-redirects to homepage!
    return 99;
  }
  if (lower.includes('makemytrip.com')) {
    if ((lower.includes('hotel-details') || lower.includes('hotelid=')) && !lower.includes('hotel-listing')) return 0;
    return 2;
  }
  if (lower.includes('booking.com')) {
    if (lower.includes('/hotel/') && !lower.includes('searchresults')) return 0;
    return 2;
  }
  if (lower.includes('airbnb.')) {
    if (lower.includes('/rooms/')) return 0;
    return 2;
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
  airbnbUrl?: string;
  tripUrl?: string;
}): string | null {
  const candidates = [
    hotel.agodaUrl,
    hotel.url,
    hotel.bookingUrl,
    hotel.airbnbUrl,
    hotel.tripUrl,
  ];
  for (const candidate of candidates) {
    if (isDirectPropertyUrl(candidate)) {
      return candidate!;
    }
  }
  return null;
}


