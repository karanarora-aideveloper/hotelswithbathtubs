// scripts/data/lib/tub-words.mjs
// Shared bathtub evidence classification module across all checkers.
// Built according to owner-approved rules of 1 Nov 2026 (CEO Sheet T48 / WORKING_RULES.md section 10.x).

/**
 * Disqualifying patterns that must NEVER count as bathtub proof on their own.
 * Owner approved 1 Nov 2026:
 * - "plunge pool" or "private pool" alone (a pool is not a tub)
 * - Agoda labels: "Separate shower/bathtub", "Bathtub grab bar", "Bathtub seat"
 * - "Bath or shower" / "Shower or bath"
 * - "private bath", "shared bath", "external bath", "bathroom", "private bathroom", "shared bathroom"
 * - plain "onsen" or "public bath"
 */
const DISQUALIFIED_FACILITY_EXACT = new Set([
  'bath or shower',
  'shower or bath',
  'separate shower/bathtub',
  'bathtub grab bar',
  'bathtub seat',
  'grab bar',
  'plunge pool',
  'private pool',
  'pool',
  'private bath',
  'shared bath',
  'external bath',
  'bathroom',
  'private bathroom',
  'shared bathroom',
  'onsen',
  'public onsen',
  'onsen access',
  'public bath',
  'open-air bath' // Plain open-air bath in facilities without private/in-room/tub
]);

/**
 * Normalizes text for matching by collapsing whitespace and trimming.
 */
function cleanText(str) {
  return (str || '').trim().replace(/\s+/g, ' ');
}

/**
 * Classifies whether a room name and/or its facilities contain verified bathtub proof.
 * 
 * @param {Object} params
 * @param {string} [params.roomName] - Hotel room name string (e.g. "Double Room with Bath")
 * @param {string[]} [params.facilities] - Array of facility title strings (e.g. ["Bathtub", "Balcony"])
 * @returns {{ isProof: boolean, words: string[], mayBeOutdoor: boolean, reason: string }}
 */
export function classifyTub({ roomName, facilities } = {}) {
  const wordsSet = new Set();
  let mayBeOutdoor = false;
  const reasons = [];

  // =========================================================================
  // 1. FACILITIES EVALUATION
  // =========================================================================
  if (Array.isArray(facilities)) {
    for (const rawFac of facilities) {
      if (!rawFac || typeof rawFac !== 'string') continue;
      const cleanFac = cleanText(rawFac);
      const fLower = cleanFac.toLowerCase();

      // Check explicit disqualifiers (Owner rule 1 Nov 2026)
      if (DISQUALIFIED_FACILITY_EXACT.has(fLower)) {
        continue;
      }
      if (
        fLower === 'separate shower/bathtub' ||
        fLower.includes('grab bar') ||
        fLower.includes('bathtub seat') ||
        fLower === 'bath or shower' ||
        fLower === 'shower or bath' ||
        fLower === 'private bathroom' ||
        fLower === 'shared bathroom'
      ) {
        continue;
      }

      // Check standard and owner-approved proof facilities (Owner approved 1 Nov 2026):
      // - Bath, Bathtub, Whirlpool bathtub
      // - Hot tub (sets mayBeOutdoor)
      // - Jacuzzi, Whirlpool, Spa tub, Spa bath, Jetted tub
      // - Soaking tub / Soaker tub / Soaking bath
      // - Freestanding / Clawfoot / Roll-top tub or bath
      // - Hydromassage tub / Hydromassage bath
      // - Two-person / Double / Corner tub / jacuzzi / whirlpool
      // - Private onsen / In-room onsen / Ofuro / Private open-air tub / Private open-air bath

      if (fLower === 'bathtub' || fLower === 'bathtubs' || fLower === 'bath' || fLower === 'baths') {
        wordsSet.add(cleanFac);
        reasons.push(`Facility "${cleanFac}" is verified tub evidence`);
      } else if (fLower === 'whirlpool bathtub' || fLower === 'whirlpool bathtubs' || fLower === 'whirlpool' || fLower === 'whirlpools' || fLower === 'jacuzzi' || fLower === 'jacuzzis') {
        wordsSet.add(cleanFac);
        reasons.push(`Facility "${cleanFac}" is verified jetted tub evidence`);
      } else if (fLower === 'hot tub' || fLower === 'hot tubs' || fLower === 'private hot tub' || fLower === 'private hot tubs' || /\bhot\s+tubs?\b/i.test(fLower)) {
        wordsSet.add('Hot tub');
        mayBeOutdoor = true; // Owner rule 1 Nov 2026: Hot tub flag mayBeOutdoor
        reasons.push(`Facility "${cleanFac}" is verified hot tub evidence (may be outdoor)`);
      } else if (fLower === 'spa tub' || fLower === 'spa tubs' || fLower === 'spa bath' || fLower === 'spa baths') {
        wordsSet.add('Spa bath');
        reasons.push(`Facility "${cleanFac}" is verified spa tub evidence`);
      } else if (/\b(?:soak(?:ing|er)?)\s+(?:tubs?|baths?|bathtubs?)\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: soaker tub / soaking tub / soaking bath
        wordsSet.add('Soaking tub');
        reasons.push(`Facility "${cleanFac}" matches soaking tub/bath (Owner approved 1 Nov 2026)`);
      } else if (/\b(?:free-?standing|clawfoot|roll-?top)\s+(?:tubs?|baths?|bathtubs?)\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: freestanding, clawfoot or roll-top + tub/bath
        wordsSet.add(cleanFac);
        reasons.push(`Facility "${cleanFac}" matches freestanding/clawfoot/roll-top tub (Owner approved 1 Nov 2026)`);
      } else if (/\b(?:hydro-?massage|idromassaggio|hidromasaje)\s+(?:tubs?|baths?|bathtubs?)\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: hydromassage tub / hydromassage bath
        wordsSet.add('Hydromassage tub');
        reasons.push(`Facility "${cleanFac}" matches hydromassage tub (Owner approved 1 Nov 2026)`);
      } else if (/\b(?:two-?person|2-?person|double|corner)\s+(?:tubs?|baths?|bathtubs?|jacuzzis?|whirlpools?)\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: two-person, double or corner + tub/bath/jacuzzi/whirlpool
        wordsSet.add(cleanFac);
        reasons.push(`Facility "${cleanFac}" matches two-person/double/corner tub (Owner approved 1 Nov 2026)`);
      } else if (/\b(?:private|in-?room)\s+onsen\b/i.test(fLower) || /\bofuro\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: private onsen / ofuro
        wordsSet.add(cleanFac);
        reasons.push(`Facility "${cleanFac}" matches private onsen/ofuro (Owner approved 1 Nov 2026)`);
      } else if (/\b(?:private|in-?room)\s+open-?air\s+(?:tubs?|baths?)\b/i.test(fLower) || /\bopen-?air\s+tubs?\b/i.test(fLower)) {
        // Owner approved 1 Nov 2026: open-air tub or private open-air bath
        wordsSet.add(cleanFac);
        mayBeOutdoor = true;
        reasons.push(`Facility "${cleanFac}" matches private open-air bath/tub (Owner approved 1 Nov 2026)`);
      } else if (fLower.includes('bathtub') && !fLower.includes('shower/bathtub')) {
        wordsSet.add('Bathtub');
        reasons.push(`Facility "${cleanFac}" contains bathtub`);
      }
    }
  }

  // =========================================================================
  // 2. ROOM NAME EVALUATION
  // =========================================================================
  if (roomName && typeof roomName === 'string') {
    const rawName = cleanText(roomName);
    const rLower = rawName.toLowerCase();

    // Check 1: Owner approved 1 Nov 2026: "with Bath" in a room name
    // e.g. "Double Room with Bath", "Twin Room with Bath", "Superior King Room with Bath"
    // Disqualifiers: "private bath", "shared bath", "external bath", "bathroom", "bath or shower", "shower or bath"
    if (/\bwith\s+bath\b/i.test(rLower)) {
      const isDisqualified =
        /\b(?:private|shared|external)\s+bath\b/i.test(rLower) ||
        /\bwith\s+private\s+bath\b/i.test(rLower) ||
        /\bwith\s+shared\s+bath\b/i.test(rLower) ||
        /\bwith\s+external\s+bath\b/i.test(rLower) ||
        /\bbathroom\b/i.test(rLower) ||
        /\bwith\s+bath\s+or\s+shower\b/i.test(rLower) ||
        /\bwith\s+shower\s+or\s+bath\b/i.test(rLower);

      if (!isDisqualified) {
        wordsSet.add('Room with Bath');
        reasons.push('"with Bath" in room name (Owner approved 1 Nov 2026)');
      }
    }

    // Check 2: Owner approved 1 Nov 2026: freestanding, clawfoot or roll-top + tub/bath
    // e.g. "Freestanding Tub", "Clawfoot Bath", "Roll-top Bath", "Roll-top Tub"
    if (/\b(?:free-?standing|clawfoot|roll-?top)(?:\s+\w+)?\s+(?:tubs?|baths?|bathtubs?)\b/i.test(rLower)) {
      if (/free-?standing/i.test(rLower)) wordsSet.add('Freestanding tub');
      if (/clawfoot/i.test(rLower)) {
        if (/baths?\b/i.test(rLower) && !/tubs?\b/i.test(rLower)) wordsSet.add('Clawfoot bath');
        else wordsSet.add('Clawfoot tub');
      }
      if (/roll-?top/i.test(rLower)) {
        if (/baths?\b/i.test(rLower) && !/tubs?\b/i.test(rLower)) wordsSet.add('Roll-top bath');
        else wordsSet.add('Roll-top tub');
      }
      reasons.push('Freestanding/clawfoot/roll-top tub/bath in room name (Owner approved 1 Nov 2026)');
    }

    // Check 3: Owner approved 1 Nov 2026: hydromassage tub or hydromassage bath
    if (/\b(?:hydro-?massage|idromassaggio|hidromasaje)\s+(?:tubs?|baths?|bathtubs?)\b/i.test(rLower)) {
      if (/baths?\b/i.test(rLower) && !/tubs?\b/i.test(rLower)) wordsSet.add('Hydromassage bath');
      else wordsSet.add('Hydromassage tub');
      reasons.push('Hydromassage tub/bath in room name (Owner approved 1 Nov 2026)');
    }

    // Check 4: Owner approved 1 Nov 2026: soaker tub, soaking tub, soaking bath
    if (/\b(?:soak(?:er|ing)?)\s+(?:tubs?|baths?|bathtubs?)\b/i.test(rLower) || /\bsoak-?tubs?\b/i.test(rLower)) {
      if (/soak(?:er|ing)?\s+baths?\b/i.test(rLower)) wordsSet.add('Soaking bath');
      else if (/soaker\s+tubs?\b/i.test(rLower)) wordsSet.add('Soaker tub');
      else wordsSet.add('Soaking tub');
      reasons.push('Soaking/soaker tub/bath in room name (Owner approved 1 Nov 2026)');
    }

    // Check 5: Owner approved 1 Nov 2026: two-person, double or corner + tub, bath, jacuzzi or whirlpool
    if (/\b(?:two-?person|2-?person|double|corner)\s+(?:tubs?|baths?|bathtubs?|jacuzzis?|whirlpools?)\b/i.test(rLower)) {
      if (/two-?person\s+jacuzzis?|2-?person\s+jacuzzis?/i.test(rLower)) wordsSet.add('Two-person jacuzzi');
      else if (/corner\s+jacuzzis?/i.test(rLower)) wordsSet.add('Corner jacuzzi');
      else if (/two-?person\s+whirlpools?|2-?person\s+whirlpools?/i.test(rLower)) wordsSet.add('Two-person whirlpool');
      else if (/corner\s+whirlpools?/i.test(rLower)) wordsSet.add('Corner whirlpool');
      else if (/double\s+tubs?/i.test(rLower)) wordsSet.add('Double tub');
      else if (/corner\s+baths?/i.test(rLower)) wordsSet.add('Corner bath');
      else if (/corner\s+tubs?/i.test(rLower)) wordsSet.add('Corner tub');
      else if (/two-?person\s+tubs?|2-?person\s+tubs?/i.test(rLower)) wordsSet.add('Two-person tub');
      else wordsSet.add('Two-person/corner tub');
      reasons.push('Two-person/double/corner tub or whirlpool in room name (Owner approved 1 Nov 2026)');
    }

    // Check 6: Owner approved 1 Nov 2026: private onsen, in-room onsen, ofuro, or open-air bath / open-air tub
    // A plain "onsen" or "public bath" doesn't count.
    if (/\bofuros?\b/i.test(rLower)) {
      wordsSet.add('Ofuro');
      reasons.push('Ofuro in room name (Owner approved 1 Nov 2026)');
    }
    if (/\b(?:private|in-?room)\s+onsens?\b/i.test(rLower) || /\bonsens?\s+in\s+room\b/i.test(rLower)) {
      wordsSet.add('Private onsen');
      reasons.push('Private/in-room onsen in room name (Owner approved 1 Nov 2026)');
    }
    if (/\b(?:private|in-?room)\s+open-?air\s+(?:tubs?|baths?)\b/i.test(rLower) || /\bopen-?air\s+tubs?\b/i.test(rLower)) {
      if (/tubs?\b/i.test(rLower)) wordsSet.add('Open-air tub');
      else wordsSet.add('Private open-air bath');
      mayBeOutdoor = true;
      reasons.push('Private open-air bath/tub in room name (Owner approved 1 Nov 2026)');
    }

    // Check 7: Standard room name tub words
    if (/\bjacuzzis?\b/i.test(rLower)) {
      wordsSet.add('Jacuzzi');
      reasons.push('Jacuzzi in room name');
    }
    if (/\bwhirlpools?\b/i.test(rLower)) {
      wordsSet.add('Whirlpool');
      reasons.push('Whirlpool in room name');
    }
    if (/\b(?:private\s+)?hot\s+tubs?\b/i.test(rLower)) {
      wordsSet.add('Hot tub');
      mayBeOutdoor = true; // Owner rule 1 Nov 2026: Hot tub flag mayBeOutdoor
      reasons.push('Hot tub in room name (may be outdoor)');
    }
    if (/\b(?:spa\s+tubs?|spa\s+baths?)\b/i.test(rLower)) {
      wordsSet.add('Spa bath');
      reasons.push('Spa tub/bath in room name');
    }
    if (/\bbathtubs?\b/i.test(rLower)) {
      // Disqualify if it is "separate shower/bathtub", "bathtub grab bar", "bathtub seat"
      if (!/separate\s+shower\/bathtubs?|bathtubs?\s+grab\s+bar|bathtubs?\s+seat/i.test(rLower)) {
        wordsSet.add('Bathtub');
        reasons.push('Bathtub in room name');
      }
    }
    if (/\bjetted\s+(?:tubs?|baths?)?\b/i.test(rLower)) {
      wordsSet.add('Jetted tub');
      reasons.push('Jetted tub in room name');
    }
  }

  const words = Array.from(wordsSet);
  const isProof = words.length > 0;
  const reason = isProof ? reasons.join('; ') : 'No verified bathtub proof found';

  return {
    isProof,
    words,
    mayBeOutdoor,
    reason
  };
}

// Backwards-compatibility helpers for Booking.com & Agoda legacy callers
export const ALLOWED_BATH_FACILITIES = [
  { match: /^bath$/i, canonical: 'Bath' },
  { match: /^bathtub$/i, canonical: 'Bathtub' },
  { match: /^(?:spa\s+tub|spa\s+bath)$/i, canonical: 'Spa bath' },
  { match: /^(?:hot\s+tub|private\s+hot\s+tub)$/i, canonical: 'Hot tub' },
  { match: /^whirlpool$/i, canonical: 'Whirlpool' },
  { match: /^jacuzzi$/i, canonical: 'Jacuzzi' }
];

export function matchBathFacility(facilityTitle) {
  if (!facilityTitle) return null;
  const res = classifyTub({ facilities: [facilityTitle] });
  if (res.isProof && res.words.length > 0) {
    const w = res.words[0];
    if (w === 'Bathtub' || w === 'Bath') return w;
    if (w === 'Hot tub') return 'Hot tub';
    if (w === 'Jacuzzi') return 'Jacuzzi';
    if (w === 'Whirlpool' || w === 'Whirlpool bathtub') return 'Whirlpool';
    if (w.includes('Spa')) return 'Spa bath';
    return w;
  }
  return null;
}

export function extractBathWords(text) {
  if (!text) return [];
  const res = classifyTub({ roomName: text });
  return res.words;
}
