'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import OutboundLink from '@/components/OutboundLink';

interface LuxuryFeaturedSuitesProps {
  initialIsIndia?: boolean;
}

const INDIA_SUITES = [
  {
    name: 'The Oberoi Amarvilas',
    city: 'Agra',
    country: 'India',
    suite: 'Premier Balcony Suite',
    tubType: 'Sunken White Marble Bathtub Directly Facing Taj Mahal',
    material: 'Hand-Carved Makrana Marble',
    rating: 5.0,
    reviewsCount: 280,
    price: '₹68,000',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    cityUrl: '/india/agra',
    bookingUrl: 'https://www.booking.com/hotel/in/the-oberoi-amarvilas-agra.html',
    tag: 'Taj Mahal Monument View',
  },
  {
    name: 'The Taj Mahal Palace',
    city: 'Mumbai',
    country: 'India',
    suite: 'Heritage Grande Suite (Colaba)',
    tubType: 'Victorian Clawfoot Marble Soaking Bathtub',
    material: 'Italian Marble & Cast Iron',
    rating: 4.9,
    reviewsCount: 420,
    price: '₹42,000',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/taj-santacruz-mumbai-1.webp',
    cityUrl: '/india/mumbai',
    bookingUrl: 'https://www.booking.com/hotel/in/the-taj-mahal-palace-tower.html',
    tag: 'Arabian Sea & Gateway View',
  },
  {
    name: 'Taj Rishikesh Resort & Spa',
    city: 'Rishikesh',
    country: 'India',
    suite: 'Deluxe Pool Villa Suite',
    tubType: 'Freestanding Stone Soaking Tub with River Views',
    material: 'Carved River Granite',
    rating: 4.9,
    reviewsCount: 180,
    price: '₹38,000',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/hotel-room-raga-on-the-ganges-rishikesh-1.webp',
    cityUrl: '/india/rishikesh',
    bookingUrl: 'https://www.booking.com/hotel/in/taj-rishikesh-resort-spa-uttarakhand.html',
    tag: 'Himalayas & Ganges View',
  },
  {
    name: 'The Leela Palace Bengaluru',
    city: 'Bangalore',
    country: 'India',
    suite: 'Royal Premier Palace Suite',
    tubType: 'Sunken Italian Marble Soaking Bathtub',
    material: 'Imported Botticino Marble',
    rating: 4.9,
    reviewsCount: 310,
    price: '₹19,000',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-oberoi-gurugram-1.webp',
    cityUrl: '/india/bangalore',
    bookingUrl: 'https://www.booking.com/hotel/in/the-leela-palace-bangalore.html',
    tag: 'Private Garden Palace View',
  },
];

const GLOBAL_SUITES = [
  {
    name: 'Aman Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    suite: 'Panoramic Aman Suite (Otemachi)',
    tubType: 'Deep Square Granite Soaking Tub with Skyline Views',
    material: 'Japanese Basalt & Granite',
    rating: 9.7,
    reviewsCount: 240,
    price: '$1,250',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    cityUrl: '/japan/tokyo',
    bookingUrl: 'https://www.booking.com/hotel/jp/aman-tokyo.html',
    tag: 'Imperial Palace & Skyline View',
  },
  {
    name: 'Hôtel Ritz Paris',
    city: 'Paris',
    country: 'France',
    suite: 'Suite Impériale (Place Vendôme)',
    tubType: 'Freestanding Clawfoot Soaking Tub with Swan Fixtures',
    material: 'Porcelain & 24k Gold Accents',
    rating: 9.8,
    reviewsCount: 380,
    price: '$1,400',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-taj-west-end-bengaluru.webp',
    cityUrl: '/france/paris',
    bookingUrl: 'https://www.booking.com/hotel/fr/ritz-paris-paris.html',
    tag: 'Place Vendôme Panorama',
  },
  {
    name: 'The Peninsula Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    suite: 'Hibiya Park Corner Suite',
    tubType: 'Deep Marble Spa Bath Overlooking Hibiya Park',
    material: 'Natural Carrara Marble',
    rating: 9.6,
    reviewsCount: 310,
    price: '$890',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/sayaji-kolhapur-1.webp',
    cityUrl: '/japan/tokyo',
    bookingUrl: 'https://www.booking.com/hotel/jp/the-peninsula-tokyo.html',
    tag: 'Hibiya Gardens Panorama',
  },
  {
    name: 'Four Seasons Hotel George V',
    city: 'Paris',
    country: 'France',
    suite: 'Penthouse Terrace Suite',
    tubType: 'Sculptural Marble Bath with Eiffel Tower View',
    material: 'Honed Statuario Marble',
    rating: 9.6,
    reviewsCount: 290,
    price: '$1,150',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/the-oberoi-gurugram-1.webp',
    cityUrl: '/france/paris',
    bookingUrl: 'https://www.booking.com/hotel/fr/four-seasons-george-v.html',
    tag: 'Eiffel Tower View',
  },
];

export default function LuxuryFeaturedSuites({ initialIsIndia = true }: LuxuryFeaturedSuitesProps) {
  const [activeRegion, setActiveRegion] = useState<'india' | 'global'>(initialIsIndia ? 'india' : 'global');

  const suites = activeRegion === 'india' ? INDIA_SUITES : GLOBAL_SUITES;

  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-24 border-t border-[#E5E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 border-b border-[#E5E1D8] pb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C5A880] mb-2">
              Curated Masterpieces
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-[#121518] font-normal tracking-tight">
              Iconic Bathtub Suites
            </h2>
            <p className="text-sm text-[#6B6964] mt-2 max-w-xl">
              Suites where the bathtub is a standout feature of the room.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#F5F2EC] rounded-full border border-[#E5E1D8] self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveRegion('india')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeRegion === 'india'
                  ? 'bg-white text-[#121518] shadow-xs'
                  : 'text-[#6B6964] hover:text-[#121518]'
              }`}
            >
              🇮🇳 India Stays
            </button>
            <button
              type="button"
              onClick={() => setActiveRegion('global')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeRegion === 'global'
                  ? 'bg-white text-[#121518] shadow-xs'
                  : 'text-[#6B6964] hover:text-[#121518]'
              }`}
            >
              🌐 Global Stays
            </button>
          </div>
        </div>

        {/* Suites Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {suites.map((hotel) => (
            <div
              key={hotel.name}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E5E1D8] transition-all duration-300 hover:shadow-xl hover:border-[#C5A880]/50"
            >
              {/* Media Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE6DF]">
                <img
                  src={hotel.image}
                  alt={`${hotel.name} - ${hotel.tubType}`}
                  loading="lazy"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-semibold tracking-wider uppercase text-[#121518] border border-white/40 shadow-xs">
                  {hotel.tag}
                </span>
                <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between text-white">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Starting Rate</span>
                    <p className="font-playfair text-2xl font-normal">{hotel.price} <span className="text-xs text-white/80 font-sans">/ night</span></p>
                  </div>
                </div>
              </div>

              {/* Suite Specs & Description */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-[#F5F2EC]">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-[#C5A880]">
                      {hotel.city}, {hotel.country}
                    </span>
                    <span className="text-[11px] text-[#6B6964]">{hotel.reviewsCount} reviews</span>
                  </div>

                  <h3 className="font-playfair text-2xl text-[#121518] font-normal leading-snug">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#6B6964] mt-1 font-medium italic">
                    {hotel.suite}
                  </p>

                  <div className="mt-4 p-3.5 bg-white/70 rounded-xl border border-[#E5E1D8]/80 text-xs">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6964] mb-0.5">
                      Bathtub Details
                    </span>
                    <p className="text-[#121518] font-medium leading-relaxed">
                      {hotel.tubType}
                    </p>
                    <span className="inline-block mt-1.5 text-[10.5px] text-[#C5A880] font-medium">
                      Material: {hotel.material}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-5 border-t border-[#E5E1D8] flex items-center justify-between gap-4">
                  <Link
                    href={hotel.cityUrl}
                    prefetch={false}
                    className="text-xs font-semibold text-[#121518] hover:text-[#C5A880] transition-colors underline underline-offset-4"
                  >
                    View All {hotel.city} Stays &rarr;
                  </Link>

                  <OutboundLink
                    href={hotel.bookingUrl}
                    hotelName={hotel.name}
                    cityName={hotel.city}
                    source="luxury_featured_suites"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#121518] hover:bg-[#252A30] text-white text-xs font-semibold tracking-wider transition-all shadow-xs hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Check Suite &rarr;
                  </OutboundLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
