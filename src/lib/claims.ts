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
];

export function hasClaimPhrase(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (/(?<!not yet )\bconfirmed\b/i.test(lower)) return true;
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

export function dropClaimSentencesFromMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const keptLines: string[] = [];
  for (let line of lines) {
    if (/★\s*\d|guest reviews|\b\d[\d,]*\s+reviews\b/i.test(line)) continue;
    if (hasClaimPhrase(line)) {
      const sentences = line.match(/([^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$)/g) || [];
      const kept = sentences.filter((s) => !hasClaimPhrase(s.trim()));
      line = kept.join(' ').trim();
      if (!line) continue;
    }
    keptLines.push(line);
  }
  return keptLines.join('\n');
}
