export const DEFAULT_AGODA_CID = '1972736';
export const DEFAULT_BOOKING_AID = '';
export const DEFAULT_EARNKARO_ID = '1471944';
export const EARNKARO_MMT_RETAILER_ID = '1729';

/**
 * Transforms an Agoda hotel URL to include the affiliate tracking CID
 */
export function getAgodaAffiliateLink(url: string, cid: string = DEFAULT_AGODA_CID): string {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }
  
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('agoda.com') && cid) {
      parsedUrl.searchParams.set('cid', cid);
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
  }
): string {
  if (!url) return url;

  const agodaCid = customAffiliateIds?.agoda || DEFAULT_AGODA_CID;
  const bookingAid = customAffiliateIds?.booking || DEFAULT_BOOKING_AID;
  const earnkaroId = customAffiliateIds?.earnkaro || DEFAULT_EARNKARO_ID;

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();

    if (host.includes('agoda.com')) {
      return getAgodaAffiliateLink(url, agodaCid);
    }

    if (host.includes('booking.com')) {
      return getBookingAffiliateLink(url, bookingAid);
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
 * Checks all available booking URLs for a hotel and returns the first specific
 * (non-generic aggregator search) page URL, if available.
 */
export function getSpecificHotelLink(hotel: {
  url?: string;
  agodaUrl?: string;
  bookingUrl?: string;
}): string | null {
  const isMmtSpecific = (u?: string) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return (
      (lower.includes('hotel-details') || lower.includes('hotelid=')) &&
      !lower.includes('hotel-listing')
    );
  };

  const isAgodaSpecific = (u?: string) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return lower.includes('agoda.com') && (lower.includes('.html') || lower.includes('/hotel/'));
  };

  const isBookingSpecific = (u?: string) => {
    if (!u) return false;
    const lower = u.toLowerCase();
    return lower.includes('booking.com') && (lower.includes('.html') || lower.includes('/hotel/'));
  };

  if (isBookingSpecific(hotel.bookingUrl)) {
    return hotel.bookingUrl!;
  }
  if (isAgodaSpecific(hotel.agodaUrl)) {
    return hotel.agodaUrl!;
  }
  if (isMmtSpecific(hotel.url)) {
    return hotel.url!;
  }

  return null;
}
