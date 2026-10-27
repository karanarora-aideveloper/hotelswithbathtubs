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
  if (/^(gym|spa|pool|fitness|lake|beach)$/i.test(trimmed)) return true;
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
 * Returns sanitized landmark distance if valid, otherwise undefined.
 * Suppresses synthetic placeholders like "Central New York Location".
 */
export function cleanLandmarkDistance(l?: string | null): string | undefined {
  if (isPlaceholderLandmark(l)) return undefined;
  const sanitized = sanitizePlaceholderText(l!.trim());
  return isPlaceholderLandmark(sanitized) ? undefined : sanitized;
}

/**
 * Returns true if the neighborhood is a genuine, verified neighborhood name.
 */
export function isValidNeighborhood(n?: string | null): boolean {
  return !isPlaceholderNeighborhood(n);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

/**
 * Normalizes and extracts the primary neighborhood name for a hotel:
 * - Keeps only the part before " / ", " & ", or ", "
 * - Drops a trailing/embedded city or region name (e.g. ", New Orleans", ", North Goa")
 * - Applies existing placeholder checks
 */
export function primaryNeighborhood(n?: string | null, cityName?: string | null): string | undefined {
  if (!n || typeof n !== 'string') return undefined;
  let cleaned = n.trim();
  if (!cleaned) return undefined;

  // Drop trailing city name only when after a comma (", Nashville", ", New Orleans", ", North Goa")
  if (cityName && typeof cityName === 'string' && cityName.trim()) {
    const trailingCityRe = new RegExp(`,\\s*(?:(?:North|South|East|West)\\s+)?${escapeRegex(cityName.trim())}\\s*$`, 'i');
    cleaned = cleaned.replace(trailingCityRe, '').trim();
  }

  // 1. Keep only part before " / ", " & ", or ", "
  const delimiterMatch = cleaned.split(/\s+[\/&]\s+|,\s*/);
  cleaned = delimiterMatch[0].trim();

  // Clean trailing punctuation or spaces
  cleaned = cleaned.replace(/^[-,\/&\s]+|[-,\/&\s]+$/g, '').replace(/\s{2,}/g, ' ').trim();

  // If the neighborhood is identical to the city name, it is not a neighborhood
  if (cityName && cleaned.toLowerCase() === cityName.trim().toLowerCase()) return undefined;

  // 3. Existing placeholder checks
  if (isPlaceholderNeighborhood(cleaned)) return undefined;
  if (!cleaned || cleaned.length < 2) return undefined;
  if (/^(north|south|east|west|central)$/i.test(cleaned)) return undefined;

  return cleaned;
}

/**
 * Returns trimmed neighborhood if valid, otherwise undefined.
 * Delegates to primaryNeighborhood.
 */
export function cleanNeighborhood(n?: string | null, cityName?: string | null): string | undefined {
  return primaryNeighborhood(n, cityName);
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
