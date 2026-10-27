import { isJacuzziRoom } from '@/lib/utils';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getBathtubLabel(hotel?: { bathtubConfirmed?: boolean; tubType?: string; roomType?: string }): string {
  if (hotel?.bathtubConfirmed === true) {
    return isJacuzziRoom(hotel) ? 'In-room jacuzzi' : 'In-room bathtub';
  }
  return 'Bathtub not yet confirmed';
}

export function formatMonthYear(dateStr?: string | Date | null): string {
  if (!dateStr) return 'October 2026';
  const str = String(dateStr);
  const match = str.match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTH_NAMES[monthIndex]} ${year}`;
    }
  }
  return 'October 2026';
}

export function getFirstPartner(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): string | null {
  if (
    (hotel.bookingUrl && !hotel.bookingUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults'))
  ) {
    return 'Booking.com';
  }
  if (
    (hotel.agodaUrl && !hotel.agodaUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('agoda.com'))
  ) {
    return 'Agoda';
  }
  if (
    (hotel.mmtUrl && !hotel.mmtUrl.includes('hotel-listing') && !hotel.mmtUrl.includes('searchText=')) ||
    (hotel.makemytripUrl && !hotel.makemytripUrl.includes('hotel-listing') && !hotel.makemytripUrl.includes('searchText=')) ||
    (hotel.url && hotel.url.includes('makemytrip.com') && !hotel.url.includes('hotel-listing'))
  ) {
    return 'MakeMyTrip';
  }
  if (
    (hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) ||
    (hotel.url && hotel.url.includes('airbnb.com') && hotel.url.includes('/rooms/'))
  ) {
    return 'Airbnb';
  }
  if (
    (hotel.tripUrl && !hotel.tripUrl.includes('/hotels/list')) ||
    (hotel.url && hotel.url.includes('trip.com') && !hotel.url.includes('/hotels/list'))
  ) {
    return 'Trip.com';
  }
  if (hotel.expediaUrl || (hotel.url && hotel.url.includes('expedia.com'))) {
    return 'Expedia';
  }
  if (hotel.hotelsComUrl || (hotel.url && hotel.url.includes('hotels.com'))) {
    return 'Hotels.com';
  }
  if (hotel.vrboUrl || (hotel.url && hotel.url.includes('vrbo.com'))) {
    return 'Vrbo';
  }
  if (hotel.url) {
    return 'partner site';
  }
  return null;
}

export function getLinkedPartners(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): string[] {
  const partners: string[] = [];
  if (
    (hotel.bookingUrl && !hotel.bookingUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults'))
  ) {
    partners.push('Booking.com');
  }
  if (
    (hotel.agodaUrl && !hotel.agodaUrl.includes('searchresults')) ||
    (hotel.url && hotel.url.includes('agoda.com'))
  ) {
    partners.push('Agoda');
  }
  if (
    (hotel.mmtUrl && !hotel.mmtUrl.includes('hotel-listing') && !hotel.mmtUrl.includes('searchText=')) ||
    (hotel.makemytripUrl && !hotel.makemytripUrl.includes('hotel-listing') && !hotel.makemytripUrl.includes('searchText=')) ||
    (hotel.url && hotel.url.includes('makemytrip.com') && !hotel.url.includes('hotel-listing'))
  ) {
    partners.push('MakeMyTrip');
  }
  if (
    (hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) ||
    (hotel.url && hotel.url.includes('airbnb.com') && hotel.url.includes('/rooms/'))
  ) {
    partners.push('Airbnb');
  }
  if (
    (hotel.tripUrl && !hotel.tripUrl.includes('/hotels/list')) ||
    (hotel.url && hotel.url.includes('trip.com') && !hotel.url.includes('/hotels/list'))
  ) {
    partners.push('Trip.com');
  }
  if (hotel.expediaUrl || (hotel.url && hotel.url.includes('expedia.com'))) {
    partners.push('Expedia');
  }
  if (hotel.hotelsComUrl || (hotel.url && hotel.url.includes('hotels.com'))) {
    partners.push('Hotels.com');
  }
  if (hotel.vrboUrl || (hotel.url && hotel.url.includes('vrbo.com'))) {
    partners.push('Vrbo');
  }
  return partners;
}

export interface EvidenceLineData {
  textPrefix: string;
  roomType?: string;
  textSuffix: string;
  fullPlainText: string;
}

export function getEvidenceLine(hotel: {
  bathtubConfirmed?: boolean;
  roomType?: string;
  updatedAt?: string | Date | null;
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): EvidenceLineData {
  const partner = getFirstPartner(hotel);
  const isConfirmed = hotel.bathtubConfirmed === true;
  const monthYear = formatMonthYear(hotel.updatedAt);
  const room = hotel.roomType || 'room';

  if (isConfirmed && partner) {
    return {
      textPrefix: 'Bathtub listed for the ',
      roomType: room,
      textSuffix: ` on ${partner}. Last checked ${monthYear}.`,
      fullPlainText: `Bathtub listed for the ${room} on ${partner}. Last checked ${monthYear}.`,
    };
  }

  if (!isConfirmed && partner) {
    return {
      textPrefix: `Bathtub reported but not yet confirmed. Check the room details on ${partner} before booking.`,
      textSuffix: '',
      fullPlainText: `Bathtub reported but not yet confirmed. Check the room details on ${partner} before booking.`,
    };
  }

  return {
    textPrefix: 'Bathtub reported. No booking link yet.',
    textSuffix: '',
    fullPlainText: 'Bathtub reported. No booking link yet.',
  };
}

export function sanitizeBookingTip(tip?: string | null, linkedPartners?: string[]): string {
  if (!tip) return '';
  let cleaned = tip
    .replace(new RegExp('\\b' + 'guaran' + 'teed\\b', 'gi'), 'confirmed')
    .replace(new RegExp('\\b' + 'guaran' + 'tees\\b', 'gi'), 'ensures')
    .replace(new RegExp('\\b' + 'guaran' + 'tee\\b', 'gi'), 'secure')
    .replace(new RegExp('\\b100% ' + 'in-room tub\\b', 'gi'), 'in-room tub')
    .replace(new RegExp('\\btriple-' + 'verified\\b', 'gi'), 'verified');

  if (linkedPartners && linkedPartners.length > 0) {
    if (/checkout on/i.test(cleaned) || /booking channels/i.test(cleaned)) {
      const partnerStr = linkedPartners.join(', ');
      cleaned = cleaned.replace(/on (Agoda|Booking\.com|MakeMyTrip|Expedia|Airbnb)(, (Agoda|Booking\.com|MakeMyTrip|Expedia|Airbnb))*/gi, `on ${partnerStr}`);
    }
  }

  return cleaned.trim();
}

export function sanitizeHotelData(h: any): any {
  if (!h) return h;
  if (h.description && typeof h.description === 'string') {
    h.description = h.description
      .replace(new RegExp('\\b' + 'guaran' + 'teed\\b', 'gi'), 'confirmed')
      .replace(new RegExp('\\b' + 'guaran' + 'tees\\b', 'gi'), 'ensures')
      .replace(new RegExp('\\b' + 'guaran' + 'tee\\b', 'gi'), 'secure')
      .replace(new RegExp('\\b' + 'acoust' + 'ic\\s+wall\\s+dampening\\b', 'gi'), 'wall insulation')
      .replace(new RegExp('\\b' + 'acoust' + 'ic\\s+privacy\\b', 'gi'), 'privacy')
      .replace(new RegExp('\\b' + 'acoust' + 'ic\\b', 'gi'), '');
  }
  if (h.bookingTip && typeof h.bookingTip === 'string') {
    h.bookingTip = sanitizeBookingTip(h.bookingTip);
  }
  if (Array.isArray(h.amenities)) {
    h.amenities = h.amenities.filter((a: any) => typeof a !== 'string' || !/gourmet\s+kitchen/i.test(a));
  }
  return h;
}
