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
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header & Geo Indicator Switch */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-[#e3e7ef] pb-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#b08d57] mb-1 font-manrope">
            Room Architecture
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl text-[#14213d] font-semibold tracking-tight">
            Bathtub Typologies
          </h2>
          <p className="text-xs sm:text-sm text-[#5b6478] mt-1.5 max-w-xl font-manrope">
            {activeRegion === 'india'
              ? 'Hand-crafted royal marble, private cliffside jacuzzis, and colonial clawfoot baths across India.'
              : 'Skyline view freestanding tubs, private balcony whirlpools, and cedar onsen baths worldwide.'}
          </p>
        </div>

        {/* Region Switcher */}
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
            🌐 Global &amp; USA
          </button>
        </div>
      </div>

      {/* 4 Typology Editorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {typologies.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            prefetch={false}
            className="group flex flex-col bg-white rounded-[14px] overflow-hidden border border-[#e3e7ef] transition-all duration-300 hover:shadow-md hover:border-[#b08d57]/60"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e9eef7]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold tracking-wider uppercase text-[#14213d] border border-white/40 shadow-xs font-manrope z-10">
                {item.tag}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col flex-grow justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#b08d57] mb-1 font-manrope">
                  {item.material}
                </p>
                <h3 className="font-playfair text-lg text-[#14213d] font-semibold group-hover:text-[#b08d57] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5b6478] mt-2 leading-relaxed font-manrope">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e3e7ef] flex items-center justify-between text-xs font-semibold text-[#14213d] font-manrope">
                <span className="text-[#5b6478] truncate pr-2">{item.sampleHotel}</span>
                <span className="text-[#b08d57] group-hover:translate-x-1 transition-transform shrink-0 font-bold">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
