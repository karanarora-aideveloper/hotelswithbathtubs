import MarkdownIt from 'markdown-it';
import * as cheerio from 'cheerio';
import { wrapOutboundAffiliateLink, cleanOutboundUrl } from './affiliate';

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
 * This avoids the ERR_REQUIRE_ESM crash caused by jsdom's ESM-only deps at build time.
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
const BOOKING_SITE_RE = /(^|\.)(booking\.com|agoda\.com|agoda\.net|trip\.com|expedia\.[a-z.]+|hotels\.com|vrbo\.com|makemytrip\.com|cleartrip\.com|easemytrip\.com|goibibo\.com|airbnb\.[a-z.]+|tripadvisor\.[a-z.]+|linkredirect\.in|earnkaro\.com|ekaro\.in)$/;

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
  
  // Booking-site links in blog text follow the same rules as booking buttons (GROWTH-FIX1):
  // Booking.com and Trip.com go through CJ via /out, others are clean direct links, and all are
  // marked rel="sponsored nofollow". No other affiliate rewrites (the affiliate policy names CJ only).
  $('a').each((_, el) => {
    let href = $(el).attr('href');
    if (!href || !/^https?:\/\//i.test(href)) return;
    let host = '';
    try { host = new URL(href).hostname.toLowerCase(); } catch { return; }
    if (!BOOKING_SITE_RE.test(host)) return;
    // Unwrap stored EarnKaro redirects to the partner page they point at.
    if (/(^|\.)(linkredirect\.in|earnkaro\.com|ekaro\.in)$/.test(host)) {
      const inner = new URL(href).searchParams.get('dl');
      if (!inner || !/^https?:\/\//i.test(inner)) return;
      href = inner;
    }
    const wrapped = wrapOutboundAffiliateLink(href, { pageType: 'blog' });
    const isCj = wrapped !== href && /jdoqocy\.com|anrdoezrs\.net/.test(wrapped);
    $(el).attr('href', isCj ? `/out?${new URLSearchParams({ url: wrapped, pl: 'blog' }).toString()}` : cleanOutboundUrl(href));
    $(el).attr('rel', 'sponsored nofollow noopener noreferrer');
    $(el).attr('target', '_blank');
  });

  // Rewrite /assets/ image URLs to Cloudflare R2 in production
  const R2_BASE = 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/';
  $('img').each((_, el) => {
    // Prevent layout shift and LCP blocking for blog images
    $(el).attr('loading', 'lazy');
    $(el).attr('decoding', 'async');
    
    const src = $(el).attr('src');
    if (src && src.startsWith('/assets/')) {
      const filename = src.replace('/assets/', '');
      $(el).attr('src', `${R2_BASE}${filename}`);
    }
  });
  
  return $.html();
}
