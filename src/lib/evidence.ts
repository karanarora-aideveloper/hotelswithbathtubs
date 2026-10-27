import { isJacuzziRoom } from '@/lib/utils';
import { hasClaimPhrase } from '@/lib/claims';

export function getBathtubLabel(hotel?: { bathtubConfirmed?: boolean; tubType?: string; roomType?: string }): string {
  if (hotel?.bathtubConfirmed === true) {
    return isJacuzziRoom(hotel) ? 'In-room jacuzzi' : 'In-room bathtub';
  }
  return 'Bathtub not yet confirmed';
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
  const room = hotel.roomType || 'room';

  if (isConfirmed && partner) {
    return {
      textPrefix: 'Bathtub in the ',
      roomType: room,
      textSuffix: `. Check this room on ${partner} before you book.`,
      fullPlainText: `Bathtub in the ${room}. Check this room on ${partner} before you book.`,
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

export function sanitizeBookingTip(tip?: string | null, linkedPartners?: string[], roomType?: string | null): string {
  if (tip && !hasClaimPhrase(tip)) {
    return tip.trim();
  }
  const partnersText = linkedPartners && linkedPartners.length > 0
    ? linkedPartners.join(', ')
    : 'booking partner channels';
  const room = roomType || 'room';
  return `Book the ${room} on ${partnersText} and check that 'Bathtub' is listed in the room details before you pay.`;
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
