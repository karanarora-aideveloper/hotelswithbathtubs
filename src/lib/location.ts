/**
 * Location validation helpers to filter out synthetic / placeholder location strings.
 */

/**
 * Checks whether a neighborhood string is a placeholder or synthetic label
 * (e.g. "Prime New York Enclave", "Prime London Enclave").
 */
export function isPlaceholderNeighborhood(n?: string | null): boolean {
  if (!n || typeof n !== 'string') return true;
  const trimmed = n.trim();
  if (!trimmed) return true;
  if (/^Prime\s+.*\s+Enclave$/i.test(trimmed)) return true;
  if (/\bEnclave\b/i.test(trimmed) && /^Prime/i.test(trimmed)) return true;
  if (/^(unknown|n\/a|null|undefined)$/i.test(trimmed)) return true;
  return false;
}

/**
 * Returns true if the neighborhood is a genuine, verified neighborhood name.
 */
export function isValidNeighborhood(n?: string | null): boolean {
  return !isPlaceholderNeighborhood(n);
}

/**
 * Returns trimmed neighborhood if valid, otherwise undefined.
 */
export function cleanNeighborhood(n?: string | null): string | undefined {
  if (isPlaceholderNeighborhood(n)) return undefined;
  return n!.trim();
}

/**
 * Validates street addresses, filtering synthetic placeholders without building numbers.
 */
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
