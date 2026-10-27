import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { normalizeName, getSignificantWordOverlap, haversineKm } from './match-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worktreeDir = path.resolve(__dirname, '../..');
const mainDir = path.resolve(worktreeDir, '..', 'hotelswithbathtubs');

export function extractTripHotelsFromHtml(html, evidenceFile) {
  const $ = cheerio.load(html);
  const hotels = [];
  const seenUrls = new Set();

  $('a[href*="-hotel-detail-"]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    const m = href.match(/\/hotels\/([a-z0-9\-]+-hotel-detail-(\d+)\/[^\/?#\"]*)/i);
    if (!m) return;
    const cleanPath = `/hotels/${m[1]}`;
    const tripUrl = `https://www.trip.com${cleanPath.endsWith('/') ? cleanPath : cleanPath + '/'}`;
    const tripHotelId = m[2];
    if (seenUrls.has(tripUrl)) return;
    seenUrls.add(tripUrl);

    let name = $(el).attr('title') ||
               $(el).find('h2, h3, span[class*="name"], div[class*="name"]').first().text().trim() ||
               $(el).text().trim();

    if (!name || name.length > 100) {
      const slugPart = m[1].split('/')[1] || m[1].split('/')[0];
      name = slugPart.replace(/-hotel-detail-\d+/, '').replace(/-/g, ' ');
    }
    name = name.replace(/[★☆\d\.]+\s*stars?/gi, '').replace(/[★☆]/g, '').trim();

    // Check if card has coordinates or lat/lng attributes
    let cardLat = null, cardLng = null;
    const parentCard = $(el).closest('[data-lat], [data-latitude], [data-lng], [data-longitude]');
    if (parentCard.length) {
      cardLat = parseFloat(parentCard.attr('data-lat') || parentCard.attr('data-latitude'));
      cardLng = parseFloat(parentCard.attr('data-lng') || parentCard.attr('data-longitude'));
    }

    hotels.push({
      name,
      tripUrl,
      tripHotelId,
      lat: isNaN(cardLat) ? null : cardLat,
      lng: isNaN(cardLng) ? null : cardLng,
      evidenceFile
    });
  });

  return hotels;
}

export function matchTripHotels(ourHotels, tripHotels, s1FactsMap = {}) {
  const proposals = [];
  const partnerMatched = new Set();
  const ourMatched = new Set();

  // First pass: exact normalized name match (High confidence)
  for (const our of ourHotels) {
    const ourNorm = normalizeName(our.name);
    const candidates = tripHotels.filter(th => !partnerMatched.has(th.tripHotelId) && normalizeName(th.name) === ourNorm);
    if (candidates.length === 1) {
      const th = candidates[0];
      ourMatched.add(our._id);
      partnerMatched.add(th.tripHotelId);
      proposals.push({
        hotelId: our._id,
        slug: our.slug,
        ourName: our.name,
        theirName: th.name,
        tripUrl: th.tripUrl,
        tripHotelId: th.tripHotelId,
        confidence: 'high',
        evidenceFile: th.evidenceFile
      });
    }
  }

  // Second pass: word overlap >= 0.8 with coordinates within 1km (High confidence)
  for (const our of ourHotels) {
    if (ourMatched.has(our._id)) continue;
    const s1 = s1FactsMap[our._id] || {};
    const ourLat = s1.lat || our.latitude;
    const ourLng = s1.lng || our.longitude;

    const candidates = [];
    for (const th of tripHotels) {
      if (partnerMatched.has(th.tripHotelId)) continue;
      const overlap = getSignificantWordOverlap(our.name, th.name);
      if (overlap >= 0.8) {
        let dist = null;
        if (ourLat != null && ourLng != null && th.lat != null && th.lng != null) {
          dist = haversineKm(ourLat, ourLng, th.lat, th.lng);
        }
        // If coordinates exist, require <= 1km for high; if no partner coordinates, overlap >= 0.85
        if (dist !== null && dist <= 1.0) {
          candidates.push({ th, overlap, dist, confidence: 'high' });
        } else if (dist === null && overlap >= 0.85) {
          candidates.push({ th, overlap, dist, confidence: 'high' });
        } else if (overlap >= 0.6) {
          candidates.push({ th, overlap, dist, confidence: 'review' });
        }
      } else if (overlap >= 0.6) {
        candidates.push({ th, overlap, dist: null, confidence: 'review' });
      }
    }

    if (candidates.length === 1 && candidates[0].confidence === 'high') {
      const { th } = candidates[0];
      ourMatched.add(our._id);
      partnerMatched.add(th.tripHotelId);
      proposals.push({
        hotelId: our._id,
        slug: our.slug,
        ourName: our.name,
        theirName: th.name,
        tripUrl: th.tripUrl,
        tripHotelId: th.tripHotelId,
        confidence: 'high',
        evidenceFile: th.evidenceFile
      });
    } else if (candidates.length > 0) {
      // Review confidence: list candidates without picking if ambiguous
      for (const { th, confidence } of candidates) {
        proposals.push({
          hotelId: our._id,
          slug: our.slug,
          ourName: our.name,
          theirName: th.name,
          tripUrl: th.tripUrl,
          tripHotelId: th.tripHotelId,
          confidence: 'review',
          evidenceFile: th.evidenceFile
        });
      }
    }
  }

  return proposals;
}
