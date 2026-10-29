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
