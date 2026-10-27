import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { normalizeName, getSignificantWordOverlap, haversineKm } from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');

function cleanCleartripName(raw, slugPart = '') {
  let name = (raw || '')
    .replace(/^TOP\s*PICKS\s*/i, '')
    .replace(/\s*·.*$/, '')
    .replace(/\d+(?:\.\d+)?\s*\d+-star\s*Hotel.*$/i, '')
    .replace(/\d+\.\d+.*$/i, '')
    .replace(/\s*\d+k\+.*$/i, '')
    .replace(/₹.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!name || name.length > 80) {
    name = (slugPart || '').replace(/-/g, ' ');
  }
  return name.trim();
}

export function extractCleartripHotelsFromHtml(html, evidenceFile) {
  const $ = cheerio.load(html);
  const hotels = [];
  const seenIds = new Set();

  $('a[href*="/hotels/details/"]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    const cleanHref = href.split('?')[0];
    const m = cleanHref.match(/\/hotels\/details\/(?:([a-z0-9\-]+)-)?(\d+)$/i);
    if (!m) return;
    const slugPart = m[1] || '';
    const cleartripHotelId = m[2];
    if (seenIds.has(cleartripHotelId)) return;
    seenIds.add(cleartripHotelId);

    const cleartripUrl = `https://www.cleartrip.com${cleanHref}`;

    let rawName = $(el).find('h2, h3, h4, p, span').first().text().trim() ||
                  $(el).attr('title') ||
                  $(el).text().trim();

    const name = cleanCleartripName(rawName, slugPart);

    hotels.push({
      name,
      cleartripUrl,
      cleartripHotelId,
      evidenceFile
    });
  });

  return hotels;
}

export function matchCleartripHotels(ourHotels, cleartripHotels, s1FactsMap = {}) {
  const proposals = [];
  const partnerMatched = new Set();
  const ourMatched = new Set();

  // First pass: exact normalized name match (High confidence)
  for (const our of ourHotels) {
    const ourNorm = normalizeName(our.name);
    const candidates = cleartripHotels.filter(ct => !partnerMatched.has(ct.cleartripHotelId) && normalizeName(ct.name) === ourNorm);
    if (candidates.length === 1) {
      const ct = candidates[0];
      ourMatched.add(our._id);
      partnerMatched.add(ct.cleartripHotelId);
      proposals.push({
        hotelId: our._id,
        slug: our.slug,
        ourName: our.name,
        theirName: ct.name,
        tripUrl: ct.cleartripUrl,
        tripHotelId: ct.cleartripHotelId,
        confidence: 'high',
        evidenceFile: ct.evidenceFile
      });
    }
  }

  // Second pass: word overlap >= 0.8 (High confidence if >= 0.85; review otherwise)
  for (const our of ourHotels) {
    if (ourMatched.has(our._id)) continue;
    const s1 = s1FactsMap[our._id] || {};
    const ourLat = s1.lat || our.latitude;
    const ourLng = s1.lng || our.longitude;

    const candidates = [];
    for (const ct of cleartripHotels) {
      if (partnerMatched.has(ct.cleartripHotelId)) continue;
      const overlap = getSignificantWordOverlap(our.name, ct.name);
      if (overlap >= 0.8) {
        candidates.push({ ct, overlap, confidence: 'high' });
      } else if (overlap >= 0.5) {
        candidates.push({ ct, overlap, confidence: 'review' });
      }
    }

    if (candidates.length === 1 && candidates[0].confidence === 'high') {
      const { ct } = candidates[0];
      ourMatched.add(our._id);
      partnerMatched.add(ct.cleartripHotelId);
      proposals.push({
        hotelId: our._id,
        slug: our.slug,
        ourName: our.name,
        theirName: ct.name,
        tripUrl: ct.cleartripUrl,
        tripHotelId: ct.cleartripHotelId,
        confidence: 'high',
        evidenceFile: ct.evidenceFile
      });
    } else if (candidates.length > 0) {
      for (const { ct, confidence } of candidates) {
        proposals.push({
          hotelId: our._id,
          slug: our.slug,
          ourName: our.name,
          theirName: ct.name,
          tripUrl: ct.cleartripUrl,
          tripHotelId: ct.cleartripHotelId,
          confidence: 'review',
          evidenceFile: ct.evidenceFile
        });
      }
    }
  }

  return proposals;
}
