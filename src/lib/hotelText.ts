/**
 * Generates honest, record-derived hotel descriptions and tips.
 * Used for hotels without importBatch to replace old marketing/copied descriptions.
 */

export function getTubWords(tubType?: string | null): 'bathtub' | 'jetted tub' | 'hot tub' {
  if (!tubType) return 'bathtub';
  if (/hot[- ]tub/i.test(tubType)) return 'hot tub';
  if (/jetted|jacuzzi|whirlpool/i.test(tubType)) return 'jetted tub';
  return 'bathtub';
}

export function buildHotelDescription(hotel: {
  name?: string;
  city?: string;
  state?: string;
  roomType?: string;
  tubType?: string;
  bathtubConfirmed?: boolean;
}): string {
  if (!hotel || !hotel.name) return '';
  const name = hotel.name.trim();
  const city = hotel.city?.trim() || '';
  const loc = hotel.state ? `${city}, ${hotel.state.trim()}` : city;
  const isConfirmed = hotel.bathtubConfirmed === true;
  const tubWords = getTubWords(hotel.tubType);
  const room = hotel.roomType ? hotel.roomType.trim().replace(/^the\s+/i, '').replace(/\s+/g, ' ') : '';

  if (isConfirmed) {
    if (room) {
      return `${name} is in ${loc}. A ${tubWords} is listed for the ${room}. Check the room details before you book.`;
    }
    return `${name} is in ${loc}. A ${tubWords} is listed. Check the room details before you book.`;
  }

  // Reported status
  if (room) {
    return `${name} is in ${loc}. A ${tubWords} has been reported in the ${room}; it isn't confirmed yet, so check the room details before you book.`;
  }
  return `${name} is in ${loc}. A ${tubWords} has been reported; it isn't confirmed yet, so check the room details before you book.`;
}
