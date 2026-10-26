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
  if (/\bEnclave\b/i.test(trimmed)) return true;
  if (/^Central\s+.+\s+Location$/i.test(trimmed)) return true;
  if (/^(unknown|n\/a|null|undefined)$/i.test(trimmed)) return true;
  if (/\b(hotel|resort|collection|rooftop|ihg|design hotels)\b/i.test(trimmed)) return true;
  if (/\d+\s*(?:bed|bath|br|bhk|ac)/i.test(trimmed)) return true;
  if (trimmed.length > 5 && trimmed.toUpperCase() === trimmed) return true;
  return false;
}

/**
 * Checks whether a landmark distance string is empty or synthetic placeholder
 * (e.g. "Central New York Location", "Central London Location").
 */
export function isPlaceholderLandmark(l?: string | null): boolean {
  if (!l || typeof l !== 'string') return true;
  const trimmed = l.trim();
  if (!trimmed) return true;
  if (/^Central\s+.+\s+Location$/i.test(trimmed)) return true;
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

/**
 * Sanitizes placeholder enclave text from markdown, HTML content, descriptions, and landmarks.
 * Replaces "in Prime <X> Enclave" with "in <X>", and any other "Prime <X> Enclave" with "<X>".
 * Real place names like "Diplomatic Enclave" are preserved.
 */
export function sanitizePlaceholderText(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Preserve genuine localities, e.g. "Prime Diplomatic Enclave" -> "Diplomatic Enclave"
    .replace(/\bPrime\s+Diplomatic\s+Enclave\b/gi, 'Diplomatic Enclave')
    // Generic placeholder: "in Prime <X> Enclave" -> "in <X>"
    .replace(/\bin\s+Prime\s+([A-Za-z\s.'-]+?)\s+Enclave\b/gi, 'in $1')
    // Generic placeholder: "Prime <X> Enclave" -> "<X>"
    .replace(/\bPrime\s+([A-Za-z\s.'-]+?)\s+Enclave\b/gi, '$1');
}
