import MarkdownIt from 'markdown-it';
import * as cheerio from 'cheerio';
import { getAgodaAffiliateLink } from './affiliate';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

/**
 * Lightweight server-safe HTML sanitizer.
 * Strips dangerous tags (script, iframe, object, embed) and inline event handlers.
 * Blog content is admin-controlled so a full jsdom-based DOMPurify is not needed.
 * This avoids the ERR_REQUIRE_ESM crash caused by jsdom's ESM-only deps on Vercel.
 */
function sanitizeHtml(html: string): string {
  return html
    // Remove dangerous block-level tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Remove inline event handlers (onclick, onload, onerror, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: hrefs
    .replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"');
}

/**
 * Convert markdown to HTML, sanitize, and inject affiliate parameters
 */
export function markdownToHtml(markdown: string): string {
  // Strip leading whitespace from each line. 
  // This prevents MarkdownIt from interpreting indented HTML (from the WYSIWYG editor) as <pre><code> blocks.
  let cleanedMarkdown = markdown.replace(/^[ \t]+/gm, '');

  // Strip duplicate top-level H1 markdown headers (# Title) from body content
  // because the page template already renders a single optimized H1 header.
  cleanedMarkdown = cleanedMarkdown.replace(/^#\s+[^\r\n]+[\r\n]*/m, '');

  const html = md.render(cleanedMarkdown);
  const sanitizedHtml = sanitizeHtml(html);
  
  // Inject affiliate parameters into links and rewrite images
  const $ = cheerio.load(sanitizedHtml, null, false); // false to not wrap in html/head/body tags
  
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      $(el).attr('href', getAgodaAffiliateLink(href));
    }
  });

  // Rewrite /assets/ image URLs to Cloudflare R2 in production
  const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('/assets/')) {
      const filename = src.replace('/assets/', '');
      $(el).attr('src', `${R2_BASE}${filename}`);
    }
  });
  
  return $.html();
}
