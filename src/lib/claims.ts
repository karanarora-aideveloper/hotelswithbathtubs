export const CLAIM_PHRASES: string[] = [
  'triple-verif',
  'triple-verify',
  'in high demand',
  'field-verified',
  'architectural metrics',
  'acoustic',
  'water dynamics',
  'sanctuary audit',
  'triple-source',
  'triple-verified',
  'triple-checked',
  '100% in-room',
  '100% en-suite',
  'guarantee',
  'guaranteed',
  'guarantees',
  'guaranteeing',
  'independently verified',
  'every room verified',
  'superhost',
  'gourmet kitchen',
  'keyless',
  'historical benchmark',
  'verified platforms',
  'inspected',
  'inspection',
  'hand-picked',
  'handpicked',
  'hand-checked',
  'hand checked',
  'audited',
  'audit',
  'verification team',
  '100% private',
  '100% verified',
  '100%',
  '0 shared',
  'checked one by one',
  'zero booking fees',
  'hidden markups',
  'direct canonical',
  'verified',
  'checked across',
  'checked against',
  'cross-checked',
  'welcome couples',
  'strictly private',
  'complete privacy',
  'full privacy',
  'across all listings',
  'on every listing',
  'listed on all platforms',
  'listed on all channels',
  'free cancellation',
  'exclusive offers',
  'secret rate',
  'live room rates',
  'top-rated',
  'accept local residents',
  'cross-check',
  'flexible cancellation',
  'transparent pricing',
  'special member rates',
  'private to your room only',
  'ensure private suite tub allocation',
  'suite tub allocation',
  'ensure private tub access',
  'ensure private',
  'optimal privacy',
  'explicitly itemize',
  'explicitly itemizes',
  'explicitly itemized',
  'explicitly mention',
  'explicitly mentions',
  'direct room category guidance',
  'room tier details',
  'verified stays',
  'built for remote workers & couples',
  'built for remote workers',
  'for the best experience in',
  'request a high-floor room',
  'front desk upon check-in',
  'double-checking the room amenities',
  'typical nightly rate',
  'walking distance',
  'whirlpool hydrotherapy',
  'private in-room tubs include',
];

export function hasClaimPhrase(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (/(?<!not yet |haven['’]t |isn['’]t )\bconfirmed\b/i.test(lower)) return true;
  return CLAIM_PHRASES.some((phrase) => lower.includes(phrase));
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Tokenize sentences: match characters up to a sentence terminator (. ! ?) followed by whitespace or end of string,
  // while preserving abbreviations (e.g., i.e., sq.m., approx., etc., vs., Dr., Mr., Mrs., Ms., Inc., Ltd.)
  // and domain names/numbers (Booking.com, 12.5) inside their sentence.
  const regex = /[\s\S]+?(?:(?<!\b(?:e\.g|i\.e|sq\.m|approx|etc|vs|dr|mr|mrs|ms|inc|ltd))\b[.!?]+(?=\s+|$)|$)/gi;
  const matches = text.match(regex);
  if (!matches) return [text.trim()].filter(Boolean);
  return matches.map((s) => s.trim()).filter(Boolean);
}

export function dropClaimSentences(text: string): string {
  if (!text) return '';
  const sentences = splitIntoSentences(text);
  const kept = sentences.filter((s) => !hasClaimPhrase(s));
  return kept.join(' ').replace(/\s+/g, ' ').trim();
}

export const INTRO_CLAIM_WORDS: string[] = [
  'luxury',
  'luxurious',
  'overlooking',
  'panoramic',
  'plunge pool',
  'private pool',
  'five-star',
  '5-star',
  'presidential',
  'butler',
  'iconic',
  'world-famous',
  'finest',
  'best',
  'ultimate',
  'premier',
  'exclusive',
  'award',
  'michelin',
  'ideal for couples',
  'perfect for couples',
  'romantic getaway',
  'private in-room bathtubs',
  'jacuzzi suites',
  'every room',
  'all rooms',
];

const INTRO_ACTION_STARTS = /^\s*["'“‘(]?\b(stay|experience|indulge|relax|discover|enjoy|unwind|escape|retreat|book)\b/i;
const INTRO_FEATURE_WORDS = /\b(featuring|boasting|equipped with|complete with)\b/i;

const INTRO_STEM_REGEXES = [
  /\bluxur(?:y|ious|ies)\b/i,
  /\boverlook(?:s|ing|ed)?\b/i,
  /\bpanoram(?:a|as|ic|ically)?\b/i,
  /\bplunge pools?\b/i,
  /\bprivate pools?\b/i,
  /\b(?:five|5)[- ]stars?\b/i,
  /\bpresidential\b/i,
  /\bbutlers?\b/i,
  /\biconic\b/i,
  /\bworld[- ]famous\b/i,
  /\bfinest\b/i,
  /\bbest\b/i,
  /\bultimate\b/i,
  /\bpremiere?s?\b/i,
  /\bexclusiv(?:e|es|ely)\b/i,
  /\b(?:awards?|award-winning|awarded)\b/i,
  /\bmichelin\b/i,
  /\bideal for couples?\b/i,
  /\bperfect for couples?\b/i,
  /\bromantic getaways?\b/i,
  /\bprivate in-room bathtubs?\b/i,
  /\bjacuzzi suites?\b/i,
  /\bevery room\b/i,
  /\ball rooms\b/i,
];

export function dropIntroClaimSentences(text: string): string {
  if (!text) return '';
  const sentences = splitIntoSentences(text);
  const kept = sentences.filter((s) => {
    if (INTRO_ACTION_STARTS.test(s)) return false;
    if (INTRO_FEATURE_WORDS.test(s)) return false;
    for (const re of INTRO_STEM_REGEXES) {
      if (re.test(s)) return false;
    }
    if (hasClaimPhrase(s)) return false;
    return true;
  });
  return kept.join(' ').replace(/\s+/g, ' ').trim();
}

export function dropClaimSentencesFromHtml(html: string): string {
  if (!html) return '';
  // Process paragraphs
  return html.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) => {
    const textOnly = inner.replace(/<[^>]+>/g, ' ');
    if (!hasClaimPhrase(textOnly)) {
      return match;
    }
    // Drop sentences containing claim phrases
    const sentences = splitIntoSentences(inner);
    const kept = sentences.filter((s: string) => !hasClaimPhrase(s.replace(/<[^>]+>/g, ' ').trim()));
    const resultInner = kept.join(' ').trim();
    if (!resultInner || resultInner === '<br>' || resultInner === '<br/>') {
      return '';
    }
    return `<p>${resultInner}</p>`;
  });
}

export function dropClaimSentencesFromMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const keptLines: string[] = [];
  for (let line of lines) {
    if (/★\s*\d|guest reviews|\b\d[\d,]*\s+reviews\b/i.test(line)) continue;
    if (hasClaimPhrase(line)) {
      const sentences = splitIntoSentences(line);
      const kept = sentences.filter((s) => !hasClaimPhrase(s.trim()));
      line = kept.join(' ').trim();
      if (!line) continue;
    }
    keptLines.push(line);
  }
  return keptLines.join('\n');
}
