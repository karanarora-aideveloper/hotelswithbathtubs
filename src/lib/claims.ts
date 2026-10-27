export const CLAIM_PHRASES: string[] = [
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
  'hand-picked',
  'handpicked',
  'audited',
  'verification team',
  '100% private',
  '100% verified',
  '0 shared',
];

export function hasClaimPhrase(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CLAIM_PHRASES.some((phrase) => lower.includes(phrase));
}

export function dropClaimSentences(text: string): string {
  if (!text) return '';
  // Split on sentence boundaries (. ! ?) while preserving punctuation
  const sentenceRegex = /([^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$)/g;
  const matches = text.match(sentenceRegex);
  if (!matches) return '';

  const kept = matches.filter((s) => !hasClaimPhrase(s.trim()));
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
    const sentences = inner.match(/([^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$)/g) || [];
    const kept = sentences.filter((s: string) => !hasClaimPhrase(s.replace(/<[^>]+>/g, ' ').trim()));
    const resultInner = kept.join(' ').trim();
    if (!resultInner || resultInner === '<br>' || resultInner === '<br/>') {
      return '';
    }
    return `<p>${resultInner}</p>`;
  });
}
