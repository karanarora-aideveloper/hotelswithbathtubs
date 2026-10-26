/**
 * Location validation helpers to filter out synthetic / placeholder location strings.
 */

export function isValidNeighborhood(s?: string | null): boolean {
  if (!s || typeof s !== 'string') return false;
  const trimmed = s.trim();
  if (!trimmed) return false;
  if (/^Prime\s+.*\s+Enclave$/i.test(trimmed)) return false;
  if (/^(unknown|n\/a|null|undefined)$/i.test(trimmed)) return false;
  return true;
}

export function isValidStreetAddress(s?: string | null): boolean {
  if (!s || typeof s !== 'string') return false;
  const trimmed = s.trim();
  if (!trimmed) return false;
  // A valid street address must contain at least one digit (building number / street number)
  if (!/\d/.test(trimmed)) return false;
  // Reject synthetic placeholder enclave addresses
  if (/Prime\s+.*\s+Enclave/i.test(trimmed)) return false;
  if (/^(unknown|n\/a|null|undefined)$/i.test(trimmed)) return false;
  return true;
}
