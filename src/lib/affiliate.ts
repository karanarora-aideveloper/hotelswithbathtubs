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
 * Automatically rewrites legacy /search?text= URLs (which 301-redirect to /)
 * into Agoda's official partnersearch.aspx deep link format.
 */
export function getAgodaAffiliateLink(url: string, cid: string = DEFAULT_AGODA_CID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('agoda.com')) {
      const textQuery = parsedUrl.searchParams.get('text');
      const hasDirectProperty =
        parsedUrl.searchParams.has('hid') ||
        parsedUrl.searchParams.has('selectedproperty') ||
        parsedUrl.searchParams.has('city');

      if (parsedUrl.pathname.endsWith('/search') && textQuery && !hasDirectProperty) {
        return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${encodeURIComponent(cid || DEFAULT_AGODA_CID)}&txt=${encodeURIComponent(textQuery)}`;
      }

      if (cid) {
        parsedUrl.searchParams.set('cid', cid);
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
 * Returns true if the URL points directly to a specific hotel or property page
 * (or has a pinned property ID like hid= / selectedproperty= / hotelId= / /rooms/),
 * rather than a generic text search results page.
 */
export function isDirectPropertyUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();

  if (lower.includes('agoda.com')) {
    return (
      lower.includes('/hotel/') ||
      lower.includes('hid=') ||
      lower.includes('selectedproperty=')
    );
  }
  if (lower.includes('makemytrip.com')) {
    return (
      (lower.includes('hotel-details') || lower.includes('hotelid=')) &&
      !lower.includes('hotel-listing')
    );
  }
  if (lower.includes('booking.com')) {
    return lower.includes('/hotel/') && !lower.includes('searchresults');
  }
  if (lower.includes('airbnb.')) {
    return lower.includes('/rooms/');
  }
  if (lower.includes('trip.com')) {
    return (
      lower.includes('/hotels/detail') ||
      (lower.includes('/hotels/') && !lower.includes('/list?'))
    );
  }
  return false;
}

/**
 * Checks all available booking URLs for a hotel and returns the first specific
 * (non-generic aggregator search) page URL, if available.
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

