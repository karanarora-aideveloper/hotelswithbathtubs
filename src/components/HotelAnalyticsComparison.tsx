'use client';

import React from 'react';
import OutboundLink from './OutboundLink';
import { getUrlDirectnessTier } from '@/lib/affiliate';
import { normalizePrice } from '@/lib/utils';

interface HotelAnalyticsProps {
  hotel: {
    name: string;
    price?: string | null;
    rating?: string | number;
    reviewsCount?: number;
    tubType?: string;
    roomType?: string;
    description?: string;
    bookingTip?: string;
    url?: string;
    agodaUrl?: string;
    bookingUrl?: string;
    airbnbUrl?: string;
    tripUrl?: string;
    mmtUrl?: string;
    expediaUrl?: string;
    hotelsComUrl?: string;
    vrboUrl?: string;
    neighborhood?: string;
    landmarkDistance?: string;
    updatedAt?: string | Date;
    amenities?: string[];
  };
  cityName: string;
  countryName: string;
  countrySlug: string;
}

interface PartnerButtonConfig {
  name: string;
  url: string;
  source: string;
  bgClass: string;
  badge: string;
}

export default function HotelAnalyticsComparison({
  hotel,
  cityName,
  countryName,
  countrySlug,
}: HotelAnalyticsProps) {
  const isIndia = countrySlug === 'india';
  const cleanPrice = normalizePrice(hotel.price) || hotel.price;
  const displayPrice = cleanPrice ? cleanPrice.replace(/^~\s*/, '') : '';

  const partners: PartnerButtonConfig[] = [];

  // 1. Booking.com
  const cleanBooking = (hotel.bookingUrl && !hotel.bookingUrl.includes('searchresults')) || 
    (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults'));
  if (cleanBooking) {
    const bookingUrl = hotel.bookingUrl || hotel.url!;
    partners.push({
      name: 'Booking.com',
      url: bookingUrl,
      source: 'Booking.com',
      bgClass: 'bg-[#003580] hover:bg-[#002860] text-white',
      badge: 'Official Partner',
    });
  }

  // 2. Agoda
  const cleanAgoda = (hotel.agodaUrl && getUrlDirectnessTier(hotel.agodaUrl) < 99) || 
    (hotel.url && hotel.url.includes('agoda') && getUrlDirectnessTier(hotel.url) < 99);
  if (cleanAgoda) {
    const agodaUrl = hotel.agodaUrl || hotel.url!;
    partners.push({
      name: 'Agoda',
      url: agodaUrl,
      source: 'Agoda',
      bgClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      badge: 'Official Partner',
    });
  }

  // 3. MakeMyTrip (India only)
  if (isIndia) {
    const cleanMmt = (hotel.mmtUrl && !hotel.mmtUrl.includes('hotel-listing') && !hotel.mmtUrl.includes('searchText=')) || 
      (hotel.url && hotel.url.includes('makemytrip') && !hotel.url.includes('hotel-listing') && !hotel.url.includes('searchText='));
    if (cleanMmt) {
      const mmtUrl = hotel.mmtUrl || hotel.url!;
      partners.push({
        name: 'MakeMyTrip',
        url: mmtUrl,
        source: 'MakeMyTrip',
        bgClass: 'bg-[#1f262d] hover:bg-[#2c3640] text-white',
        badge: 'Official Partner',
      });
    }
  }

  // 4. Airbnb
  const cleanAirbnb = (hotel.airbnbUrl && hotel.airbnbUrl.includes('/rooms/')) || 
    (hotel.url && hotel.url.includes('airbnb') && hotel.url.includes('/rooms/'));
  if (cleanAirbnb) {
    const airbnbUrl = hotel.airbnbUrl || hotel.url!;
    partners.push({
      name: 'Airbnb',
      url: airbnbUrl,
      source: 'Airbnb',
      bgClass: 'bg-[#e0565b] hover:bg-[#c9454a] text-white',
      badge: 'Direct Host Listing',
    });
  }

  // 5. Trip.com
  const cleanTrip = (hotel.tripUrl && !hotel.tripUrl.includes('/hotels/list') && !hotel.tripUrl.includes('keyword=')) || 
    (hotel.url && hotel.url.includes('trip.com') && !hotel.url.includes('/hotels/list') && !hotel.url.includes('keyword='));
  if (cleanTrip) {
    const tripUrl = hotel.tripUrl || hotel.url!;
    partners.push({
      name: 'Trip.com',
      url: tripUrl,
      source: 'Trip.com',
      bgClass: 'bg-[#2681ff] hover:bg-[#156fe0] text-white',
      badge: 'Official Partner',
    });
  }

  // 6. Expedia / Hotels.com / Vrbo
  if (hotel.expediaUrl && getUrlDirectnessTier(hotel.expediaUrl) < 99) {
    partners.push({
      name: 'Expedia',
      url: hotel.expediaUrl,
      source: 'Expedia',
      bgClass: 'bg-[#00253c] hover:bg-[#001726] text-white',
      badge: 'Official Partner',
    });
  }
  if (hotel.hotelsComUrl && getUrlDirectnessTier(hotel.hotelsComUrl) < 99) {
    partners.push({
      name: 'Hotels.com',
      url: hotel.hotelsComUrl,
      source: 'Hotels.com',
      bgClass: 'bg-[#d32f2f] hover:bg-[#b71c1c] text-white',
      badge: 'Official Partner',
    });
  }
  if (hotel.vrboUrl && getUrlDirectnessTier(hotel.vrboUrl) < 99) {
    partners.push({
      name: 'Vrbo',
      url: hotel.vrboUrl,
      source: 'Vrbo',
      bgClass: 'bg-[#1b3b6f] hover:bg-[#12284c] text-white',
      badge: 'Official Partner',
    });
  }

  if (partners.length === 0 && hotel.url && getUrlDirectnessTier(hotel.url) < 99) {
    partners.push({
      name: 'Booking Partner',
      url: hotel.url,
      source: 'Partner',
      bgClass: 'bg-[#1a6fde] hover:bg-[#1559b8] text-white',
      badge: 'Partner',
    });
  }

  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const uniquePartners = partners.filter((p) => {
    if (seenUrls.has(p.url)) return false;
    seenUrls.add(p.url);
    return true;
  });

  return (
    <div className="my-8 space-y-6">
      {/* P3 Honest Price Box */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs p-6 sm:p-8">
        <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] tracking-tight mb-4">
          {displayPrice ? (
            <>
              Guide price: about <span className="font-bold text-[#1a6fde]">{displayPrice}</span> a night. Prices change, so check today&apos;s price:
            </>
          ) : (
            <>Prices change, so check today&apos;s price:</>
          )}
        </h2>

        {uniquePartners.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            {uniquePartners.map((partner) => (
              <OutboundLink
                key={partner.name}
                href={partner.url}
                source={partner.source}
                cityName={cityName}
                hotelName={hotel.name}
                className={`inline-flex items-center justify-between gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-xs hover:shadow-md ${partner.bgClass}`}
              >
                <span>Check price on {partner.name}</span>
                <span className="text-xs opacity-80">&rarr;</span>
              </OutboundLink>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 font-jakarta">
            No direct booking partner available for this stay yet.
          </p>
        )}

        {/* Room Tier Alert under Q2 price box */}
        <div className="mt-5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-snug font-jakarta">
          <strong className="font-bold block mb-1">Remember:</strong>
          Select the <strong className="text-amber-950 underline">{hotel.roomType || 'Bathtub Suite'}</strong> tier on partner checkout for the private tub.
        </div>

        {/* FTC / ASA Reader Disclosure */}
        <div className="mt-4 pt-3.5 border-t border-[#5b8296]/15 text-[11px] text-slate-500 leading-relaxed font-jakarta">
          <span className="font-semibold text-slate-700">Reader Disclosure:</span> When you book through our partner links, we may earn an affiliate commission at no extra cost to you. This supports our research and maintenance of this guide.
        </div>
      </section>
    </div>
  );
}
