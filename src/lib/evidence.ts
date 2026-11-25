import { hasClaimPhrase } from '@/lib/claims';
import { buildHotelDescription, isHotelConfirmed } from '@/lib/hotelText';
import { cleanOutboundUrl } from '@/lib/affiliate';
import { tubWord } from '@/lib/tubWords';

export { isHotelConfirmed };

export function formatProofDate(importBatch?: string | null): string | null {
  if (!importBatch) return null;
  const match = importBatch.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (!match) return null;
  const [, year, month, day] = match;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  if (monthIdx < 0 || monthIdx > 11) return null;
  const dayNum = parseInt(day, 10);
  return `${dayNum} ${months[monthIdx]} ${year}`;
}

export function getTubWord(hotel?: {
  bookingTubLabels?: string[] | null;
  tubType?: string | null;
  roomType?: string | null;
}): string {
  if (hotel?.bookingTubLabels && hotel.bookingTubLabels.length > 0) {
    const first = hotel.bookingTubLabels[0].trim();
    if (/^bath$/i.test(first)) return 'bathtub';
    if (/^room name$/i.test(first)) {
      const text = `${hotel.roomType || ''} ${hotel.tubType || ''}`.toLowerCase();
      if (text.includes('hot tub')) return 'hot tub';
      if (text.includes('jacuzzi')) return 'jacuzzi';
      if (text.includes('whirlpool')) return 'whirlpool';
      if (text.includes('soaking')) return 'soaking tub';
      if (text.includes('jetted') || text.includes('hydro')) return 'jetted tub';
      return 'bathtub';
    }
    return first.toLowerCase();
  }
  const text = `${hotel?.tubType || ''} ${hotel?.roomType || ''}`.toLowerCase();
  if (text.includes('hot tub')) return 'hot tub';
  if (text.includes('jacuzzi')) return 'jacuzzi';
  if (text.includes('whirlpool')) return 'whirlpool';
  if (text.includes('soaking')) return 'soaking tub';
  if (text.includes('jetted') || text.includes('hydro')) return 'jetted tub';
  return 'bathtub';
}

export function getBathtubLabel(
  hotel?: {
    bathtubConfirmed?: boolean | null;
    tubType?: string;
    roomType?: string;
    importBatch?: string | null;
    bookingTubLabels?: string[] | null;
    country?: string | null;
  },
  country?: string | null
): string {
  if (isHotelConfirmed(hotel)) {
    const word = getTubWord(hotel);
    return `In-room ${word}`;
  }
  const targetCountry = country || hotel?.country;
  const word = tubWord(hotel?.tubType || '', targetCountry);
  return `${word} not yet confirmed`;
}

export function getFirstPartner(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
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
    (hotel.cleartripUrl && !hotel.cleartripUrl.includes('search')) ||
    (hotel.url && hotel.url.includes('cleartrip.com') && !hotel.url.includes('search'))
  ) {
    return 'Cleartrip';
  }
  if (
    (hotel.easemytripUrl && !hotel.easemytripUrl.includes('hotel-listing') && !hotel.easemytripUrl.includes('search')) ||
    (hotel.url && hotel.url.includes('easemytrip.com') && !hotel.url.includes('hotel-listing') && !hotel.url.includes('search'))
  ) {
    return 'EaseMyTrip';
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

export function getProofBadgeText(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): string {
  const partner = getFirstPartner(hotel);
  return partner ? `✓ Tub proven · ${partner}` : '✓ Tub proven';
}

export function getProofBoxTitle(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): string {
  const partner = getFirstPartner(hotel);
  return partner ? `Tub proven on ${partner}` : 'Tub proven';
}

export function getProofBoxText(
  hotel: {
    bookingUrl?: string | null;
    agodaUrl?: string | null;
    mmtUrl?: string | null;
    makemytripUrl?: string | null;
    cleartripUrl?: string | null;
    easemytripUrl?: string | null;
    airbnbUrl?: string | null;
    tripUrl?: string | null;
    expediaUrl?: string | null;
    hotelsComUrl?: string | null;
    vrboUrl?: string | null;
    url?: string | null;
    roomType?: string | null;
  },
  tubWords: string
): string {
  const partner = getFirstPartner(hotel) || 'A booking site';
  const room = hotel.roomType || 'room';
  return `${partner} lists a ${tubWords} for the ${room}. Pick this exact room when you book.`;
}

export function getLinkedPartners(hotel: {
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
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
    (hotel.cleartripUrl && !hotel.cleartripUrl.includes('search')) ||
    (hotel.url && hotel.url.includes('cleartrip.com') && !hotel.url.includes('search'))
  ) {
    partners.push('Cleartrip');
  }
  if (
    (hotel.easemytripUrl && !hotel.easemytripUrl.includes('hotel-listing') && !hotel.easemytripUrl.includes('search')) ||
    (hotel.url && hotel.url.includes('easemytrip.com') && !hotel.url.includes('hotel-listing') && !hotel.url.includes('search'))
  ) {
    partners.push('EaseMyTrip');
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

export function getPartnerUrl(
  hotel: {
    bookingUrl?: string | null;
    agodaUrl?: string | null;
    mmtUrl?: string | null;
    makemytripUrl?: string | null;
    cleartripUrl?: string | null;
    easemytripUrl?: string | null;
    airbnbUrl?: string | null;
    tripUrl?: string | null;
    expediaUrl?: string | null;
    hotelsComUrl?: string | null;
    vrboUrl?: string | null;
    url?: string | null;
  },
  partnerName: string
): string {
  let target = '';
  switch (partnerName) {
    case 'Booking.com':
      target = hotel.bookingUrl || (hotel.url && hotel.url.includes('booking.com') ? hotel.url : '');
      break;
    case 'Agoda':
      target = hotel.agodaUrl || (hotel.url && hotel.url.includes('agoda.com') ? hotel.url : '');
      break;
    case 'MakeMyTrip':
      target = (
        hotel.mmtUrl ||
        hotel.makemytripUrl ||
        (hotel.url && hotel.url.includes('makemytrip.com') ? hotel.url : '')
      );
      break;
    case 'Cleartrip':
      target = (
        hotel.cleartripUrl ||
        (hotel.url && hotel.url.includes('cleartrip.com') ? hotel.url : '')
      );
      break;
    case 'EaseMyTrip':
      target = (
        hotel.easemytripUrl ||
        (hotel.url && hotel.url.includes('easemytrip.com') ? hotel.url : '')
      );
      break;
    case 'Airbnb':
      target = hotel.airbnbUrl || (hotel.url && hotel.url.includes('airbnb.com') ? hotel.url : '');
      break;
    case 'Trip.com':
      target = hotel.tripUrl || (hotel.url && hotel.url.includes('trip.com') ? hotel.url : '');
      break;
    case 'Expedia':
      target = hotel.expediaUrl || (hotel.url && hotel.url.includes('expedia.com') ? hotel.url : '');
      break;
    case 'Hotels.com':
      target = (
        hotel.hotelsComUrl ||
        (hotel.url && hotel.url.includes('hotels.com') ? hotel.url : '')
      );
      break;
    case 'Vrbo':
      target = hotel.vrboUrl || (hotel.url && hotel.url.includes('vrbo.com') ? hotel.url : '');
      break;
    default:
      target = hotel.url || '';
      break;
  }
  return target ? cleanOutboundUrl(target) : '';
}

export interface EvidenceLineData {
  textPrefix: string;
  roomType?: string;
  textSuffix: string;
  fullPlainText: string;
}

export function getEvidenceLine(hotel: {
  bathtubConfirmed?: boolean | null;
  importBatch?: string | null;
  bookingTubLabels?: string[] | null;
  roomType?: string;
  updatedAt?: string | Date | null;
  bookingUrl?: string | null;
  agodaUrl?: string | null;
  mmtUrl?: string | null;
  makemytripUrl?: string | null;
  cleartripUrl?: string | null;
  easemytripUrl?: string | null;
  airbnbUrl?: string | null;
  tripUrl?: string | null;
  expediaUrl?: string | null;
  hotelsComUrl?: string | null;
  vrboUrl?: string | null;
  url?: string | null;
}): EvidenceLineData {
  const partner = getFirstPartner(hotel);
  const isConfirmed = isHotelConfirmed(hotel);
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

export function sanitizeBookingTip(_tip?: string | null, _linkedPartners?: string[], _roomType?: string | null): string {
  void _tip;
  void _linkedPartners;
  void _roomType;
  return 'Check that the room you pick lists a bathtub before you book.';
}

export function buildDataDescription(h: {
  name?: string;
  city?: string;
  roomType?: string;
  tubType?: string;
  neighborhood?: string;
}): string {
  if (!h || !h.name) return '';
  const room = h.roomType || 'room';
  const tub = h.tubType || 'private in-room bathtub';
  const loc = h.neighborhood ? `in ${h.neighborhood}` : (h.city ? `in ${h.city}` : '');
  return `${h.name} features a ${tub} in the ${room}${loc ? ` ${loc}` : ''}.`;
}

export function sanitizeHotelData<T extends Record<string, unknown>>(h: T): T {
  if (!h) return h;
  const hotelObj = h as Record<string, unknown>;
  hotelObj.bathtubConfirmed = isHotelConfirmed(h as Parameters<typeof isHotelConfirmed>[0]);
  if (!h.importBatch) {
    hotelObj.description = buildHotelDescription(h as Parameters<typeof buildHotelDescription>[0]);
    hotelObj.bookingTip = 'Check that the room you pick lists a bathtub before you book.';
  }
  if (Array.isArray(h.amenities)) {
    hotelObj.amenities = h.amenities.filter((a: unknown) => typeof a !== 'string' || (!hasClaimPhrase(a) && !/couple[- ]?friendly/i.test(a)));
  }
  // Listing-style names ("3BHK Near Taj Mahal | Luxury Family Stay | Parking"): show the part
  // before the first "|". Every such hotel has its own slug, so URLs don't change.
  if (typeof hotelObj.name === 'string' && hotelObj.name.includes('|') && hotelObj.slug) {
    const first = hotelObj.name.split('|')[0].trim();
    if (first.length >= 4) {
      hotelObj.listingName = hotelObj.name;
      hotelObj.name = first;
    }
  }
  // GROWTH-FIX1 (25 Nov 2026): ratings, review counts and prices on hotel records have no
  // recorded source (legacy data), so they are never shown or put in structured data.
  delete hotelObj.rating;
  delete hotelObj.reviewsCount;
  delete hotelObj.price;
  // Placeholder coordinates (the centre of the USA, used as a default for ~3,100 hotels).
  if (isPlaceholderCoordinate(hotelObj.latitude, hotelObj.longitude)) {
    delete hotelObj.latitude;
    delete hotelObj.longitude;
  }
  // Only our own R2 images: partner-hosted photos (bstatic.com, agoda.net, muscache.com)
  // are not ours to republish and break the R2-only image rule.
  if (typeof hotelObj.image === 'string' && isExternalImage(hotelObj.image)) hotelObj.image = '';
  if (Array.isArray(hotelObj.images)) {
    hotelObj.images = (hotelObj.images as unknown[]).filter((u) => typeof u === 'string' && u.trim() !== '' && !isExternalImage(u));
  }
  if (!hotelObj.image && Array.isArray(hotelObj.images) && hotelObj.images.length > 0) {
    hotelObj.image = hotelObj.images[0];
  }
  return h;
}

/** True for an absolute image URL that is not on our R2 bucket. Bare file names resolve to R2. */
export function isExternalImage(u: string): boolean {
  const t = u.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  return !(t.includes('.r2.dev') || t.includes('r2.cloudflarestorage.com'));
}

/** The default "centre of the USA" point (37.09, -95.71) and the jitter around it. */
export function isPlaceholderCoordinate(lat: unknown, lng: unknown): boolean {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (a === 0 && b === 0) return true;
  return Math.abs(a - 37.09) < 0.25 && Math.abs(b + 95.71) < 0.25;
}

/** Key for an image regardless of how its URL is written (full R2 URL or bare file name). */
export function imageKey(u: string): string {
  return u.trim().split('?')[0].split('/').pop()!.toLowerCase();
}

/**
 * Photos used by more than one differently named hotel are another hotel's photo on at
 * least one of them, and we can't tell which, so they are dropped everywhere.
 */
export function dropSharedHotelImages(hotels: Record<string, unknown>[]): number {
  const owners = new Map<string, Set<string>>();
  const norm = (n: unknown) => String(n || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const h of hotels) {
    const urls = new Set<string>();
    if (typeof h.image === 'string' && h.image) urls.add(imageKey(h.image));
    if (Array.isArray(h.images)) for (const u of h.images) if (typeof u === 'string' && u) urls.add(imageKey(u));
    for (const k of urls) {
      if (!owners.has(k)) owners.set(k, new Set());
      owners.get(k)!.add(norm(h.name));
    }
  }
  const shared = new Set([...owners].filter(([, names]) => names.size > 1).map(([k]) => k));
  let touched = 0;
  for (const h of hotels) {
    let changed = false;
    if (typeof h.image === 'string' && h.image && shared.has(imageKey(h.image))) { h.image = ''; changed = true; }
    if (Array.isArray(h.images)) {
      const kept = (h.images as string[]).filter((u) => !(typeof u === 'string' && shared.has(imageKey(u))));
      if (kept.length !== h.images.length) { h.images = kept; changed = true; }
    }
    if (!h.image && Array.isArray(h.images) && h.images.length > 0) h.image = h.images[0];
    if (changed) touched++;
  }
  return touched;
}
