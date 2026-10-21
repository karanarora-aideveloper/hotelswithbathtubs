'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LuxuryBathtubTypologiesProps {
  initialIsIndia?: boolean;
}

const INDIA_TYPOLOGIES = [
  {
    id: 'sunken-marble',
    title: 'Sunken Royal Marble Tubs',
    material: 'Hand-Carved Makrana & Italian Marble',
    description: 'Deep sunken marble bathing pools overlooking Lake Pichola in Udaipur and the Taj Mahal in Agra.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    sampleHotel: 'The Oberoi Amarvilas & Udaivilas',
    href: '/india/udaipur',
    tag: 'Palace Heritage',
  },
  {
    id: 'terrace-jacuzzi',
    title: 'Private Terrace & Balcony Jacuzzis',
    material: 'Hydro-Massage Whirlpool Tubs',
    description: 'Open-air bubbling tubs set on private balconies with uninterrupted Aravali hill views or sea breezes.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-dubrovnik-luma-retreat-jacuzzi-peaceful-rides.webp',
    sampleHotel: 'Taj Exotica Resort Goa',
    href: '/india/goa',
    tag: 'Coastal & Hill View',
  },
  {
    id: 'victorian-clawfoot',
    title: 'Heritage Victorian Clawfoot Tubs',
    material: 'Enameled Cast-Iron & Polished Brass',
    description: 'Restored roll-top clawfoot soaking baths in British colonial-era estates across Shimla and Darjeeling.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-taj-west-end-bengaluru.webp',
    sampleHotel: 'The Taj West End & Oberoi Cecil',
    href: '/india/shimla',
    tag: 'Colonial Vintage',
  },
  {
    id: 'ayurvedic-stone',
    title: 'Ayurvedic Stone Soaking Baths',
    material: 'Monolithic Granite & Slate',
    description: 'Open-sky courtyard baths carved from natural river stone, surrounded by Kerala backwaters and rainforests.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-kumarakom-lake-resort.webp',
    sampleHotel: 'Kumarakom Lake Resort Kerala',
    href: '/india/munnar',
    tag: 'Rainforest & Waters',
  },
];

const GLOBAL_TYPOLOGIES = [
  {
    id: 'skyline-soaker',
    title: 'Skyline View Freestanding Baths',
    material: 'Volcanic Limestone & Carrara Marble',
    description: 'Sculptural soaking baths positioned directly beside floor-to-ceiling glass over Manhattan and Tokyo.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    sampleHotel: 'Aman Tokyo & Baccarat Hotel NYC',
    href: '/usa/new-york',
    tag: 'Metropolitan High-Floor',
  },
  {
    id: 'balcony-jacuzzi',
    title: 'Penthouse & Balcony Whirlpools',
    material: 'Multi-Jet Hydrotherapy Spa',
    description: 'Private open-air bubbling tubs set on private terraces with panoramic caldera and skyline views.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/luxury-bathtub-dubrovnik-luma-retreat-jacuzzi-peaceful-rides.webp',
    sampleHotel: 'Burj Al Arab & Santorini Suites',
    href: '/uae/dubai',
    tag: 'Open-Sky Terrace',
  },
  {
    id: 'hinoki-wood',
    title: 'Japanese Hinoki Wood Onsens',
    material: 'Natural Japanese Aromatic Cedar',
    description: 'Traditional handcrafted wooden soaking tubs infused with mineral-rich hot springs in Kyoto and Hakone.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-the-taj-west-end-bengaluru.webp',
    sampleHotel: 'The Ritz-Carlton Kyoto',
    href: '/japan/tokyo',
    tag: 'Mineral Spring',
  },
  {
    id: 'alpine-cedar',
    title: 'Alpine Chalet Heated Baths',
    material: 'Thermal Wood & Mountain Granite',
    description: 'Deep heated tubs overlooking snow-covered peaks, fireplaces, and pine forests in the Swiss Alps.',
    image: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-chamonix.webp',
    sampleHotel: 'Chalet Zermatt Peak',
    href: '/france/paris',
    tag: 'Mountain Panorama',
  },
];

export default function LuxuryBathtubTypologies({ initialIsIndia = true }: LuxuryBathtubTypologiesProps) {
  const [activeRegion, setActiveRegion] = useState<'india' | 'global'>(initialIsIndia ? 'india' : 'global');

  const typologies = activeRegion === 'india' ? INDIA_TYPOLOGIES : GLOBAL_TYPOLOGIES;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header & Geo Indicator Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 border-b border-[#E5E1D8] pb-8">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C5A880] mb-2">
            Architectural Typologies
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-[#121518] font-normal tracking-tight">
            The Bathtub Typologies
          </h2>
          <p className="text-sm text-[#6B6964] mt-2 max-w-xl">
            {activeRegion === 'india'
              ? 'Hand-crafted royal marble, private cliffside jacuzzis, and colonial clawfoot baths across India.'
              : 'Skyline view freestanding tubs, private balcony whirlpools, and cedar onsen baths worldwide.'}
          </p>
        </div>

        {/* Region Switcher */}
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
            🌐 Global &amp; USA
          </button>
        </div>
      </div>

      {/* 4 Typology Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {typologies.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex flex-col bg-[#F5F2EC] rounded-2xl overflow-hidden border border-[#E5E1D8] transition-all duration-300 hover:shadow-lg hover:border-[#C5A880]/60 hover:-translate-y-1"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE6DF]">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold tracking-wider uppercase text-[#121518] border border-white/40 shadow-2xs">
                {item.tag}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-6 flex flex-col flex-grow justify-between">
              <div>
                <p className="text-[10.5px] font-medium tracking-widest uppercase text-[#C5A880] mb-1.5">
                  {item.material}
                </p>
                <h3 className="font-playfair text-xl text-[#121518] font-normal group-hover:text-[#C5A880] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B6964] mt-2.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E1D8]/70 flex items-center justify-between text-xs font-medium text-[#121518]">
                <span className="text-[#6B6964] truncate pr-2">{item.sampleHotel}</span>
                <span className="text-[#C5A880] group-hover:translate-x-1 transition-transform flex-shrink-0 font-bold">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
