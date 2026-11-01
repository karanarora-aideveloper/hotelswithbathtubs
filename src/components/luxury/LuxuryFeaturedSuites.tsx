'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    tubType: 'Sunken White Marble Bathtub Facing Taj Mahal',
    material: 'Hand-Carved Makrana Marble',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    cityUrl: '/india/agra',
    bookingUrl: 'https://www.booking.com/hotel/in/the-oberoi-amarvilas-agra.html',
    tag: 'Taj Mahal Monument View',
  },
  {
    name: 'The Taj Mahal Palace',
    city: 'Mumbai',
    country: 'India',
    suite: 'Heritage Grande Suite',
    tubType: 'Victorian Clawfoot Marble Soaking Bathtub',
    material: 'Italian Marble & Cast Iron',
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
    suite: 'Panoramic Aman Suite',
    tubType: 'Deep Square Granite Soaking Tub with Skyline Views',
    material: 'Japanese Basalt & Granite',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    cityUrl: '/japan/tokyo',
    bookingUrl: 'https://www.booking.com/hotel/jp/aman-tokyo.html',
    tag: 'Imperial Palace & Skyline View',
  },
  {
    name: 'Hôtel Ritz Paris',
    city: 'Paris',
    country: 'France',
    suite: 'Suite Impériale',
    tubType: 'Freestanding Clawfoot Soaking Tub with Swan Fixtures',
    material: 'Porcelain & Gold Accents',
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
    <section className="bg-white py-12 sm:py-16 border-t border-[#e3e7ef]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-[#e3e7ef] pb-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#b08d57] mb-1 font-manrope">
              Curated Stays
            </p>
            <h2 className="font-playfair text-2xl sm:text-3xl text-[#14213d] font-semibold tracking-tight">
              Iconic Bathtub Suites
            </h2>
            <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 max-w-xl font-manrope">
              Suites where the bathtub is a standout feature of the room.
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#e9eef7] rounded-full border border-[#e3e7ef] self-start sm:self-auto shrink-0 font-manrope">
            <button
              type="button"
              onClick={() => setActiveRegion('india')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeRegion === 'india'
                  ? 'bg-white text-[#14213d] shadow-xs'
                  : 'text-[#5b6478] hover:text-[#14213d]'
              }`}
            >
              🇮🇳 India Stays
            </button>
            <button
              type="button"
              onClick={() => setActiveRegion('global')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeRegion === 'global'
                  ? 'bg-white text-[#14213d] shadow-xs'
                  : 'text-[#5b6478] hover:text-[#14213d]'
              }`}
            >
              🌐 Global Stays
            </button>
          </div>
        </div>

        {/* Suites Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suites.map((hotel) => (
            <div
              key={hotel.name}
              className="group flex flex-col bg-[#f5f6f8] rounded-[14px] overflow-hidden border border-[#e3e7ef] transition-all duration-300 hover:shadow-md hover:border-[#b08d57]/50"
            >
              {/* Media Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e9eef7]">
                <Image
                  src={hotel.image}
                  alt={`${hotel.name} - ${hotel.tubType}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold tracking-wider uppercase text-[#14213d] border border-white/40 shadow-xs font-manrope z-10">
                  {hotel.tag}
                </span>
              </div>

              {/* Suite Specs & Description */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#b08d57] font-manrope">
                    {hotel.city}, {hotel.country}
                  </span>

                  <h3 className="font-playfair text-xl text-[#14213d] font-semibold leading-snug mt-0.5">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#5b6478] mt-1 font-medium font-manrope">
                    {hotel.suite}
                  </p>

                  <div className="mt-3 p-3 bg-[#f5f6f8] rounded-[10px] border border-[#e3e7ef] text-xs font-manrope">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#5b6478] mb-0.5">
                      Bathtub Details
                    </span>
                    <p className="text-[#14213d] font-medium leading-relaxed">
                      {hotel.tubType}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3.5 border-t border-[#e3e7ef] flex items-center justify-between gap-3 font-manrope">
                  <Link
                    href={hotel.cityUrl}
                    prefetch={false}
                    className="text-xs font-semibold text-[#14213d] hover:text-[#b08d57] transition-colors underline underline-offset-2"
                  >
                    All {hotel.city} stays &rarr;
                  </Link>

                  <OutboundLink
                    href={hotel.bookingUrl}
                    hotelName={hotel.name}
                    cityName={hotel.city}
                    source="luxury_featured_suites"
                    className="inline-flex items-center justify-center px-3.5 py-2 rounded-[9px] bg-[#b08d57] hover:bg-[#9c7b48] text-white text-xs font-bold tracking-wide transition-all shadow-xs hover:shadow-md"
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
