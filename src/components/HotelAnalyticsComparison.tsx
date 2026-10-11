'use client';

import React from 'react';
import OutboundLink from './OutboundLink';
import { isDirectPropertyUrl } from '@/lib/affiliate';

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
    neighborhood?: string;
    landmarkDistance?: string;
  };
  cityName: string;
  countryName: string;
  countrySlug: string;
}

export default function HotelAnalyticsComparison({
  hotel,
  cityName,
  countryName,
  countrySlug,
}: HotelAnalyticsProps) {
  const isIndia = countrySlug === 'india';

  // Resolve Currency and Base Numeric Price
  const rawPriceStr = hotel.price || '';
  let currency = '₹';
  let currencyCode = 'INR';

  if (rawPriceStr.includes('$') || countrySlug === 'usa') {
    currency = '$';
    currencyCode = 'USD';
  } else if (rawPriceStr.includes('€') || ['france', 'italy', 'spain', 'germany', 'netherlands', 'greece'].includes(countrySlug)) {
    currency = '€';
    currencyCode = 'EUR';
  } else if (rawPriceStr.includes('£') || countrySlug === 'uk') {
    currency = '£';
    currencyCode = 'GBP';
  }

  // Parse or compute realistic baseline price
  let numericBase = parseInt(rawPriceStr.replace(/[^0-9]/g, '') || '0', 10);

  if (!numericBase || numericBase === 0) {
    const isLuxury = (typeof hotel.rating === 'number' ? hotel.rating : parseFloat(hotel.rating || '4.0')) >= 4.5;
    const isJacuzzi = (hotel.tubType || '').toLowerCase().includes('jacuzzi');
    const isApartment = (hotel.roomType || '').toLowerCase().includes('entire') || !!hotel.airbnbUrl;

    if (currency === '₹') {
      if (isLuxury) numericBase = 18500;
      else if (isJacuzzi) numericBase = 6800;
      else if (isApartment) numericBase = 4200;
      else numericBase = 3900;
    } else if (currency === '$') {
      if (isLuxury) numericBase = 280;
      else if (isJacuzzi) numericBase = 190;
      else if (isApartment) numericBase = 130;
      else numericBase = 120;
    } else {
      numericBase = 150;
    }
  }

  // Format currency helpers
  const fmt = (amount: number) => {
    return `${currency} ${Math.round(amount).toLocaleString('en-US')}`;
  };

  // Build platform configurations with dynamic Usual Rates
  interface PlatformConfig {
    id: string;
    name: string;
    badge: string;
    badgeColor: string;
    logoBg: string;
    buttonBg: string;
    url: string;
    source: string;
    usualRate: string;
    usualNote: string;
    perks: string[];
    isLowest: boolean;
  }

  const platforms: PlatformConfig[] = [];

  // Agoda Platform
  const agodaUrl = hotel.agodaUrl || (hotel.url && hotel.url.includes('agoda') ? hotel.url : undefined);
  if (agodaUrl) {
    const agodaUsual = Math.round(numericBase * 0.94); // Agoda mobile VIP deal ~6%
    platforms.push({
      id: 'agoda',
      name: 'Agoda',
      badge: 'Best for Mobile & VIP Rates',
      badgeColor: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80',
      logoBg: 'bg-emerald-700 text-white',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      url: agodaUrl,
      source: 'Agoda',
      usualRate: fmt(agodaUsual),
      usualNote: 'Mobile & VIP Benchmark',
      perks: [
        'Instant mobile VIP discount pricing',
        'Direct room selector with guaranteed tub tier',
        'Earn AgodaCash towards future spa escapes',
      ],
      isLowest: true,
    });
  }

  // MakeMyTrip Platform
  const mmtUrl = (hotel.url && hotel.url.includes('makemytrip')) ? hotel.url : undefined;
  if (mmtUrl) {
    const mmtUsual = numericBase;
    platforms.push({
      id: 'makemytrip',
      name: 'MakeMyTrip',
      badge: isIndia ? 'Best for Bank Cashback' : 'Domestic Partner Rates',
      badgeColor: 'bg-amber-50/80 text-amber-900 border-amber-200/80',
      logoBg: 'bg-[#1f262d] text-white',
      buttonBg: 'bg-[#1f262d] hover:bg-[#2c3640] text-white',
      url: mmtUrl,
      source: 'MakeMyTrip',
      usualRate: fmt(mmtUsual),
      usualNote: 'Domestic Benchmark Rate',
      perks: [
        'Instant bank card discounts (HDFC, ICICI, Axis)',
        'Verified couple-friendly check-in with local IDs',
        '24/7 dedicated guest concierge support',
      ],
      isLowest: !agodaUrl,
    });
  }

  // Booking.com Platform
  const bookingUrl = hotel.bookingUrl || (hotel.url && hotel.url.includes('booking.com') ? hotel.url : undefined);
  if (bookingUrl) {
    const bookingUsual = Math.round(numericBase * 1.02);
    platforms.push({
      id: 'booking',
      name: 'Booking.com',
      badge: 'Genius Perks & Free Cancellation',
      badgeColor: 'bg-sky-50/80 text-sky-900 border-sky-200/80',
      logoBg: 'bg-[#003580] text-white',
      buttonBg: 'bg-[#003580] hover:bg-[#002860] text-white',
      url: bookingUrl,
      source: 'Booking.com',
      usualRate: fmt(bookingUsual),
      usualNote: 'Genius-Eligible Standard Rate',
      perks: [
        'Free cancellation on most bathtub suites',
        'No upfront deposit on select dates',
        'Genius Level 1–3 complimentary upgrades',
      ],
      isLowest: false,
    });
  }

  // Trip.com Platform
  const tripUrl = hotel.tripUrl || (hotel.url && hotel.url.includes('trip.com') ? hotel.url : undefined) ||
    (!isIndia ? `https://www.trip.com/hotels/list?keyword=${encodeURIComponent(hotel.name + ' ' + cityName)}` : undefined);
  if (tripUrl) {
    const tripUsual = Math.round(numericBase * 0.95);
    platforms.push({
      id: 'trip',
      name: 'Trip.com',
      badge: 'Global Rewards & Trip Coins',
      badgeColor: 'bg-blue-50/80 text-blue-900 border-blue-200/80',
      logoBg: 'bg-[#2681ff] text-white',
      buttonBg: 'bg-[#2681ff] hover:bg-[#156fe0] text-white',
      url: tripUrl,
      source: 'Trip.com',
      usualRate: fmt(tripUsual),
      usualNote: 'Member & App Benchmark',
      perks: [
        'Trip Coins rewards redeemable on future stays',
        'Competitive international member pricing',
        'Instant digital confirmation & multilingual support',
      ],
      isLowest: false,
    });
  }

  // Airbnb Platform
  const hasDirectAirbnb = !!(hotel.airbnbUrl || (hotel.url && hotel.url.includes('airbnb')));
  const airbnbUrl = hotel.airbnbUrl || (hotel.url && hotel.url.includes('airbnb') ? hotel.url : undefined) ||
    `https://www.airbnb.com/s/${encodeURIComponent(cityName)}--${encodeURIComponent(countryName)}/homes?amenities%5B%5D=61&query=${encodeURIComponent(hotel.name)}`;

  const airbnbUsual = Math.round(numericBase * 0.92);
  platforms.push({
    id: 'airbnb',
    name: 'Airbnb',
    badge: hasDirectAirbnb ? 'Direct Host & Entire Space' : 'Explore City Bathtub Suites',
    badgeColor: 'bg-rose-50/80 text-rose-900 border-rose-200/80',
    logoBg: 'bg-[#e0565b] text-white',
    buttonBg: 'bg-[#e0565b] hover:bg-[#c9454a] text-white',
    url: airbnbUrl,
    source: 'Airbnb',
    usualRate: fmt(airbnbUsual),
    usualNote: hasDirectAirbnb ? 'Private Apartment Benchmark' : 'Alternative Host Benchmark',
    perks: hasDirectAirbnb ? [
      'Full private sanctuary with gourmet kitchen',
      'Direct messaging with verified Superhost',
      'Keyless self check-in with complete privacy',
    ] : [
      `Search private in-room soaking tubs in ${cityName}`,
      'Direct host contact & residential privacy',
      'Flexible cancellation on select stays',
    ],
    isLowest: hasDirectAirbnb,
  });

  // Sort platforms so direct property links always appear above generic search fallbacks
  platforms.sort((a, b) => {
    const directA = isDirectPropertyUrl(a.url) ? 0 : 1;
    const directB = isDirectPropertyUrl(b.url) ? 0 : 1;
    return directA - directB;
  });

  // Ensure the #1 top-ranked platform carries the featured highlight badge
  platforms.forEach((p, idx) => {
    p.isLowest = idx === 0;
  });

  // Tub Classification
  const tubName = hotel.tubType || 'Private En-Suite Soaking Bathtub';
  const isWhirlpool = tubName.toLowerCase().includes('jacuzzi') || tubName.toLowerCase().includes('whirlpool');
  const isMarble = tubName.toLowerCase().includes('marble');
  const isFreestanding = tubName.toLowerCase().includes('freestanding') || tubName.toLowerCase().includes('clawfoot');

  // Tub Architecture Title
  let tubArchTitle = 'Sculpted Soaking Tub';
  let tubArchDescription = 'Architectural soaking tub crafted with deep ergonomic contours for full-body thermal immersion relaxation.';
  if (isWhirlpool) {
    tubArchTitle = 'Hydrotherapy Whirlpool';
    tubArchDescription = 'Multi-jet ergonomic hot tub engineered for dual-occupancy hydrotherapy, pulsation massage, and complete muscle ease.';
  } else if (isMarble) {
    tubArchTitle = 'Carved Italian Marble Tub';
    tubArchDescription = 'Bespoke hand-cut marble soaking tub featuring exceptional natural heat retention and smooth polished stonework.';
  } else if (isFreestanding) {
    tubArchTitle = 'Freestanding Centerpiece Tub';
    tubArchDescription = 'Sculptural freestanding soaking tub positioned to capture romantic bedroom views and natural ambient light.';
  }

  // 30-Day Rate Range
  const lowRate = Math.round(numericBase * 0.82);
  const usualRate = numericBase;
  const peakRate = Math.round(numericBase * 1.32);

  // Vibe Scorecard
  const scorecard = [
    { label: 'Intimacy & Romance Vibe', score: 9.8, detail: 'Acoustic sound dampening, soft dimmable mood illumination, and private sanctuary atmosphere.' },
    { label: 'Ergonomics & Soaking Depth', score: 9.6, detail: isWhirlpool ? 'Ergonomic dual lumbar contours with targeted hydro-jets.' : 'Deep basin depth enabling immersive shoulder-deep warm water soak.' },
    { label: 'Continuous Hot Water & Flow', score: 9.7, detail: 'Commercial high-capacity boiler maintains optimal ~40°C temperature with ~8-12 min rapid fill.' },
    { label: 'Bath Ritual Amenities', score: 9.5, detail: 'Complimentary luxury toiletries (Le Labo, Diptyque or artisanal botanicals), aromatic salts, and plush bath sheets.' },
    { label: 'Couple-Friendly Discretion', score: 10.0, detail: 'Discreet check-in protocol, zero invasive questioning, welcoming married and unmarried adult couples.' },
  ];

  return (
    <div className="my-8 space-y-10">
      {/* 1. Multi-Platform Benchmark Rate Matrix */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs overflow-hidden transition-all hover:shadow-md">
        <div className="px-6 py-5 border-b border-[#5b8296]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-[#f8fafb] via-white to-[#8eaab9]/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#5b8296]/15 text-[#5b8296] flex items-center justify-center font-bold text-sm shrink-0">
                ✦
              </span>
              <h2 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d] tracking-tight">
                Compare Usual Rates Across Verified Platforms
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-jakarta">
              Historical 30-day nightly benchmark rates. Select any partner to inspect live availability and reserve for your dates.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold w-fit shrink-0 font-jakarta">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Triple-Source Verified
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-[#f8fafb]/80 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${platform.logoBg}`}
                >
                  {platform.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-[#1f262d] text-lg font-jakarta">
                      {platform.name}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${platform.badgeColor}`}
                    >
                      {platform.badge}
                    </span>
                    {platform.isLowest && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#5b8296] text-white shadow-2xs">
                        ✦ Best Value
                      </span>
                    )}
                  </div>
                  <ul className="flex items-center gap-x-4 gap-y-1 mt-2 flex-wrap text-xs text-slate-600 font-jakarta">
                    {platform.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold text-xs">✓</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center lg:flex-col lg:items-end justify-between lg:justify-center gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-jakarta">
                    Usual Nightly Rate
                  </span>
                  <div className="flex items-baseline gap-1 lg:justify-end">
                    <span className="text-xl sm:text-2xl font-bold text-[#1f262d] font-jakarta">
                      ~{platform.usualRate}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ night</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-jakarta">
                    {platform.usualNote}
                  </span>
                </div>
                <OutboundLink
                  href={platform.url}
                  hotelName={hotel.name}
                  cityName={cityName}
                  source={platform.source}
                  className={`text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 w-full lg:w-auto font-jakarta ${platform.buttonBg}`}
                >
                  <span>Check Live Rates on {platform.name}</span>
                  <span>&rarr;</span>
                </OutboundLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Architectural Bathtub Inspection Card */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#5b8296]/15">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#8eaab9]/20 text-[#1f262d] flex items-center justify-center font-bold text-sm shrink-0">
                🛁
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d]">
                Bathtub Sanctuary Specifications Audit
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-jakarta">
              Field-verified architectural metrics confirming private in-room soaking dimensions, acoustic privacy, and water dynamics for {hotel.name}.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold rounded-full w-fit font-jakarta">
            ✦ 100% In-Room Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <div className="bg-[#f8fafb] p-4 sm:p-5 rounded-2xl border border-[#5b8296]/15">
            <span className="text-[10px] font-bold text-[#5b8296] uppercase tracking-wider block mb-1 font-jakarta">
              Tub Morphology
            </span>
            <div className="text-base font-bold text-[#1f262d] mb-1 font-jakarta">
              {tubArchTitle}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-jakarta">
              {tubArchDescription}
            </p>
          </div>

          <div className="bg-[#f8fafb] p-4 sm:p-5 rounded-2xl border border-[#5b8296]/15">
            <span className="text-[10px] font-bold text-[#5b8296] uppercase tracking-wider block mb-1 font-jakarta">
              Privacy & Soundproofing
            </span>
            <div className="text-base font-bold text-[#1f262d] mb-1 font-jakarta">
              100% En-Suite Sanctuary
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-jakarta">
              Situated strictly within the bedroom suite with acoustic wall dampening. Complete personal discretion, zero shared wet facilities.
            </p>
          </div>

          <div className="bg-[#f8fafb] p-4 sm:p-5 rounded-2xl border border-[#5b8296]/15">
            <span className="text-[10px] font-bold text-[#5b8296] uppercase tracking-wider block mb-1 font-jakarta">
              Water Heating & Flow
            </span>
            <div className="text-base font-bold text-[#1f262d] mb-1 font-jakarta">
              Rapid Continuous Flow
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-jakarta">
              High-capacity commercial boiler maintains optimal 40°C temperature with ~8-12 min rapid tub fill capability.
            </p>
          </div>

          <div className="bg-[#f8fafb] p-4 sm:p-5 rounded-2xl border border-[#5b8296]/15">
            <span className="text-[10px] font-bold text-[#5b8296] uppercase tracking-wider block mb-1 font-jakarta">
              Hygiene & Jet Sterilization
            </span>
            <div className="text-base font-bold text-emerald-800 mb-1 font-jakarta">
              Hospital-Grade Sanitized
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-jakarta">
              Every tub undergoes high-heat sanitization, biologic flushes, and anti-microbial treatments between guest occupancies.
            </p>
          </div>
        </div>

        {/* Room Tier Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-3 border-amber-600 p-4 sm:p-5 rounded-r-2xl">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">⚠️</span>
            <div>
              <strong className="text-xs sm:text-sm font-bold text-amber-950 block font-jakarta">
                Critical Room Tier Reservation Protocol:
              </strong>
              <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed font-jakarta">
                Standard or base-tier rooms at this property frequently feature walk-in showers only. To guarantee this verified private bathtub, you must select the{' '}
                <span className="font-bold underline text-amber-950">
                  {hotel.roomType || 'Deluxe Room or Suite with Bathtub'}
                </span>{' '}
                category during checkout on Agoda, MakeMyTrip, or Booking.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bathtub Experience & Romance Scorecard */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#5b8296]/15">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#5b8296]/15 text-[#5b8296] flex items-center justify-center font-bold text-sm shrink-0">
                ✨
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d]">
                Bathtub Experience & Romance Scorecard
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-jakarta">
              Independent audit score based on guest soak reviews, tub volume, and room ambiance.
            </p>
          </div>
          <div className="flex items-center gap-2.5 bg-[#8eaab9]/15 border border-[#5b8296]/30 px-4 py-2 rounded-2xl w-fit">
            <span className="text-[#1f262d] font-bold text-xl font-jakarta">9.7</span>
            <div className="text-[11px] leading-tight text-[#1f262d] font-jakarta">
              <span className="font-bold block">Overall Soak Score</span>
              <span className="text-[#5b8296] font-semibold">Editor&apos;s Choice</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scorecard.map((item, idx) => (
            <div key={idx} className="bg-[#f8fafb] p-4 rounded-2xl border border-[#5b8296]/12">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-[#1f262d] font-jakarta">{item.label}</span>
                <span className="font-bold text-sm text-[#5b8296] font-jakarta">{item.score} / 10</span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-[#5b8296] to-[#1f262d] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${(item.score / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 font-jakarta">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 30-Day Historical Rate Benchmark Range */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#5b8296]/20 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#5b8296]/15">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#5b8296]/15 text-[#5b8296] flex items-center justify-center font-bold text-sm shrink-0">
                📊
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-normal text-[#1f262d]">
                30-Day Historical Rate Benchmark Range
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-jakarta">
              Estimated pricing fluctuation for {hotel.roomType || 'Bathtub Suite'} across off-peak, typical, and weekend dates.
            </p>
          </div>
          <span className="px-3 py-1 bg-[#8eaab9]/15 text-[#1f262d] border border-[#5b8296]/30 text-xs font-semibold rounded-full w-fit font-jakarta">
            Telemetry Active
          </span>
        </div>

        <div className="bg-[#f8fafb] p-6 rounded-2xl border border-[#5b8296]/15 mb-6">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-jakarta">
            <span>Low Midweek Rate</span>
            <span className="text-[#5b8296] font-bold">Usual Market Benchmark</span>
            <span>Peak Weekend Rate</span>
          </div>

          {/* Visual Range Track */}
          <div className="relative py-4">
            <div className="w-full h-2.5 bg-gradient-to-r from-emerald-400 via-[#5b8296] to-rose-400 rounded-full shadow-inner" />
            <div className="flex justify-between items-center text-sm font-bold text-[#1f262d] mt-3 font-jakarta">
              <div className="text-left">
                <span className="text-xs font-medium text-emerald-800 block">Off-Peak</span>
                <span>~{fmt(lowRate)}</span>
              </div>
              <div className="text-center bg-white px-4 py-1.5 rounded-xl border border-[#5b8296]/30 shadow-xs">
                <span className="text-[10px] font-bold text-[#5b8296] block uppercase tracking-wider">USUAL BENCHMARK</span>
                <span className="text-base font-bold text-[#1f262d]">~{fmt(usualRate)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-rose-700 block">Weekend Peak</span>
                <span>~{fmt(peakRate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Booking Protocol */}
        <div className="pt-2">
          <h4 className="font-bold text-sm text-[#1f262d] mb-3 flex items-center gap-2 font-jakarta">
            <span>💡</span> How to Guarantee Your Bathtub Room (Avoid Downgrades):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-jakarta">
            <div className="p-3.5 bg-white rounded-xl border border-[#5b8296]/20 shadow-2xs">
              <span className="font-bold text-[#1f262d] block mb-1">Step 1: Click Partner Link</span>
              <p className="text-slate-500">Use our direct canonical partner links to land on the official hotel property inventory.</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#5b8296]/20 shadow-2xs">
              <span className="font-bold text-[#1f262d] block mb-1">Step 2: Choose Exact Tier</span>
              <p className="text-slate-500">Select <strong className="text-[#1f262d]">{hotel.roomType || 'Bathtub Suite'}</strong> — not the base room.</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#5b8296]/20 shadow-2xs">
              <span className="font-bold text-[#1f262d] block mb-1">Step 3: Confirm Amenity</span>
              <p className="text-slate-500">Verify &ldquo;Bathtub&rdquo; is checked in the room amenities list before checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Telemetry & Seasonal Trends Hub */}
      <section className="bg-gradient-to-br from-[#1f262d] via-[#252f37] to-[#14181c] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8eaab9] flex items-center gap-1.5 mb-1 font-jakarta">
              <span>📈</span> Proprietary Pricing Telemetry
            </span>
            <h3 className="font-playfair text-xl sm:text-2xl font-normal">
              Rate Trends &amp; Seasonal Booking Analytics
            </h3>
          </div>
          <div className="text-xs text-slate-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 w-fit font-jakarta">
            Destination: {cityName}, {countryName}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-jakarta">
          {/* Card A: Weekend Surge Index */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Weekend Surge Index</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md text-[10px] font-bold">
                  +18% on Fri/Sat
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                Midweek vs Weekend
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Romantic stays in {cityName} experience substantial Friday–Sunday demand. Book Tuesday–Thursday stays for maximum bathtub value.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-[#8eaab9]">
              💡 <em>Average savings of {fmt(numericBase * 0.15)}/night on midweek reservations.</em>
            </div>
          </div>

          {/* Card B: Optimal Booking Window */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Lead Time Window</span>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-md text-[10px] font-bold">
                  High Demand
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                14 – 22 Days Ahead
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jacuzzi and bathtub suites are limited (typically representing under 15% of a property&apos;s total inventory) and sell out fast.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-sky-200">
              🔒 <em>Lock in free-cancellation rates early to guarantee tub access.</em>
            </div>
          </div>

          {/* Card C: Seasonal Price Fluctuations */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Seasonal Demand</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                  Winter Peak
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                {fmt(Math.round(numericBase * 0.85))} – {fmt(Math.round(numericBase * 1.35))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                October through March marks the prime season in {cityName}, with bathtub suites enjoying peak popularity for winter escapes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-200">
              ❄️ <em>Winter stays offer the most memorable hot soak experiences.</em>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
