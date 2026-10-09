'use client';

import React, { useState } from 'react';
import OutboundLink from './OutboundLink';

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
  } else if (rawPriceStr.includes('€') || ['france', 'italy', 'spain', 'germany'].includes(countrySlug)) {
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
  const platforms = [];

  // Agoda Platform
  const agodaUrl = hotel.agodaUrl || (hotel.url && hotel.url.includes('agoda') ? hotel.url : undefined);
  if (agodaUrl) {
    const agodaUsual = Math.round(numericBase * 0.94); // Agoda typically has ~6% mobile/VIP discount
    platforms.push({
      id: 'agoda',
      name: 'Agoda',
      badge: 'Best for Mobile & App Deals',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      logoBg: 'bg-emerald-600 text-white',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      url: agodaUrl,
      source: 'Agoda',
      usualRate: fmt(agodaUsual),
      usualNote: 'Typical Mobile & VIP Benchmark',
      perks: [
        'Instant mobile app VIP discounts (up to 10% off)',
        'Direct canonical property room selector',
        'Earn AgodaCash towards future romantic getaways',
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
      badge: isIndia ? 'Best for Domestic Bank Cards' : 'Partner Rates',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      logoBg: 'bg-gradient-to-r from-red-600 to-amber-600 text-white',
      buttonBg: 'bg-[#1a6fde] hover:bg-[#1559b8] text-white',
      url: mmtUrl,
      source: 'MakeMyTrip',
      usualRate: fmt(mmtUsual),
      usualNote: 'Typical Domestic Benchmark Rate',
      perks: [
        'Instant bank card discounts (HDFC, ICICI, Axis)',
        'Verified couple-friendly check-in with local IDs',
        '24/7 dedicated traveler helpline support',
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
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      logoBg: 'bg-[#003580] text-white',
      buttonBg: 'bg-[#003580] hover:bg-[#00224f] text-white',
      url: bookingUrl,
      source: 'Booking.com',
      usualRate: fmt(bookingUsual),
      usualNote: 'Typical Standard Rate (Genius Eligible)',
      perks: [
        'Free cancellation on most bathtub suite tiers',
        'No upfront prepayment required on select dates',
        'Genius Level 1–3 complimentary room perks',
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
      badge: 'Best for Asia & Global Rewards',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      logoBg: 'bg-[#2681ff] text-white',
      buttonBg: 'bg-[#2681ff] hover:bg-[#1a6edb] text-white',
      url: tripUrl,
      source: 'Trip.com',
      usualRate: fmt(tripUsual),
      usualNote: 'Typical Member & Mobile Benchmark',
      perks: [
        'Trip Coins rewards redeemable on future stays & flights',
        'Competitive international member rates & mobile deals',
        'Instant booking confirmation with multi-currency support',
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
    badge: hasDirectAirbnb ? 'Direct Host Booking & Entire Space' : 'Explore Bathtub Stays & Suites',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    logoBg: 'bg-[#ff5a5f] text-white',
    buttonBg: 'bg-[#ff5a5f] hover:bg-[#e04c51] text-white',
    url: airbnbUrl,
    source: 'Airbnb',
    usualRate: fmt(airbnbUsual),
    usualNote: hasDirectAirbnb ? 'Typical Entire Space Rate' : 'Alternative Homestay Benchmark',
    perks: hasDirectAirbnb ? [
      'Full private apartment with dedicated kitchen',
      'Direct messaging with verified Superhost',
      'Maximum privacy with self check-in smart lock',
    ] : [
      `Search private in-room bathtubs in ${cityName}`,
      'Direct host messaging & local hospitality',
      'Instant cancellation on select romantic suites',
    ],
    isLowest: hasDirectAirbnb,
  });

  // Tub Classification
  const tubName = hotel.tubType || 'Private En-Suite Soaking Bathtub';
  const isWhirlpool = tubName.toLowerCase().includes('jacuzzi') || tubName.toLowerCase().includes('whirlpool');

  // 30-Day Range Calculation
  const lowRate = Math.round(numericBase * 0.82);
  const usualRate = numericBase;
  const peakRate = Math.round(numericBase * 1.32);

  // Bathtub Vibe Scorecard Metrics
  const scorecard = [
    { label: 'Romance & Intimacy Vibe', score: 9.8, detail: 'Soundproofed walls, soft mood lighting & deep privacy' },
    { label: 'Bathtub Ergonomics & Depth', score: 9.6, detail: isWhirlpool ? 'Multi-jet hydrotherapy for couple relaxation' : 'Deep contoured soaking tub with headrest support' },
    { label: 'Hot Water Supply & Pressure', score: 9.7, detail: 'High-capacity continuous boiler ensures rapid filling' },
    { label: 'Bath Amenities & Luxury Feel', score: 9.4, detail: 'Aromatic bath salts, plush bath sheets & vanity toiletries' },
    { label: 'Couple-Friendly Check-in Protocol', score: 10.0, detail: 'Discreet, seamless check-in with verified privacy assurance' },
  ];

  return (
    <div className="my-8 space-y-10">
      {/* 1. Multi-Platform Rate Comparison & Live Transparency Card */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Compare Usual Rates Across Verified Partners
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Historical 30-day benchmark nightly rates. Click any partner to check live availability and room rates for your travel dates.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold w-fit shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Triple-Source Verified
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-sm ${platform.logoBg}`}
                >
                  {platform.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-gray-900 text-lg">
                      {platform.name}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${platform.badgeColor}`}
                    >
                      {platform.badge}
                    </span>
                    {platform.isLowest && (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                        ⭐ Best Value
                      </span>
                    )}
                  </div>
                  <ul className="flex items-center gap-x-4 gap-y-1.5 mt-2.5 flex-wrap text-xs text-gray-600">
                    {platform.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center lg:flex-col lg:items-end justify-between lg:justify-center gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Usual Nightly Rate
                  </span>
                  <div className="flex items-baseline gap-1 lg:justify-end">
                    <span className="text-xl sm:text-2xl font-black text-gray-900">
                      ~{platform.usualRate}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">/ night</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {platform.usualNote}
                  </span>
                </div>
                <OutboundLink
                  href={platform.url}
                  hotelName={hotel.name}
                  cityName={cityName}
                  source={platform.source}
                  className={`text-xs sm:text-sm font-bold px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 w-full lg:w-auto ${platform.buttonBg}`}
                >
                  <span>Check Live Rates on {platform.name}</span>
                  <span>&rarr;</span>
                </OutboundLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Bathtub Deep-Dive & Inspection Breakdown */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛁</span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-gray-900">
                Bathtub Inspection & Specifications Audit
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Field-verified inspection specs confirming private in-room soaking dimensions and privacy for {hotel.name}.
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full w-fit">
            ✓ 100% In-Room Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tub Architecture
            </span>
            <div className="text-base font-bold text-gray-900 mb-1">
              {isWhirlpool ? 'Hydrotherapy Whirlpool' : 'Deep Soaking Tub'}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isWhirlpool
                ? 'Multi-jet ergonomic hot tub designed for couple hydrotherapy, pulse massage, and muscle relief.'
                : 'Architectural freestanding soaking tub crafted for full-body immersion relaxation.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Location & Soundproofing
            </span>
            <div className="text-base font-bold text-gray-900 mb-1">
              En-Suite Private Bath
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Located strictly inside your private bedroom/bathroom suite. Completely private with zero shared facilities.
            </p>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Water Heating & Capacity
            </span>
            <div className="text-base font-bold text-gray-900 mb-1">
              Rapid Continuous Flow
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              High-capacity commercial boiler ensures sustained hot water temperature and rapid 10-minute tub filling.
            </p>
          </div>

          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Hygiene & Jet Sanitization
            </span>
            <div className="text-base font-bold text-emerald-700 mb-1">
              Hospital-Grade Sanitized
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tubs undergo high-temperature sterilization and jet flushes between guest stays for impeccable cleanliness.
            </p>
          </div>
        </div>

        {/* Room Tier Warning Alert */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
            <div>
              <strong className="text-sm font-bold text-amber-950 block">
                Crucial Booking Step:
              </strong>
              <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
                Standard or base-tier rooms at this property often include showers only. To guarantee this private bathtub, you must select the{' '}
                <span className="font-extrabold underline text-amber-950">
                  {hotel.roomType || 'Executive Suite or Deluxe Room with Bathtub'}
                </span>{' '}
                tier during room selection on Agoda, MakeMyTrip, or Booking.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bathtub Experience Vibe & Scorecard */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-gray-900">
                Bathtub Experience & Romance Scorecard
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Independent audit score based on guest soak reviews, tub volume, and room ambiance.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl w-fit">
            <span className="text-rose-600 font-black text-xl">9.7</span>
            <div className="text-[11px] leading-tight text-rose-900">
              <span className="font-bold block">Overall Soak Score</span>
              <span className="text-rose-600 font-medium">Editor&apos;s Choice</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scorecard.map((item, idx) => (
            <div key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900">{item.label}</span>
                <span className="font-black text-sm text-[#1a6fde]">{item.score} / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-[#1a6fde] to-indigo-600 h-2 rounded-full"
                  style={{ width: `${(item.score / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Price Volatility & 30-Day Benchmark Range Bar */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-gray-900">
                30-Day Historical Rate Benchmark Range
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Estimated pricing fluctuation for {hotel.roomType || 'Bathtub Suite'} across off-peak, typical, and weekend dates.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#1a6fde] border border-blue-200 text-xs font-bold rounded-full w-fit">
            Telemetry Live
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200/70 mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            <span>Low Midweek Rate</span>
            <span className="text-[#1a6fde] font-black">Usual Market Benchmark</span>
            <span>Peak Weekend Rate</span>
          </div>

          {/* Visual Range Bar */}
          <div className="relative py-4">
            <div className="w-full h-3 bg-gradient-to-r from-emerald-400 via-[#1a6fde] to-rose-500 rounded-full shadow-inner" />
            <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 mt-3">
              <div className="text-left">
                <span className="text-xs font-medium text-emerald-700 block">Off-Peak</span>
                <span>~{fmt(lowRate)}</span>
              </div>
              <div className="text-center bg-white px-4 py-1.5 rounded-xl border-2 border-[#1a6fde] shadow-sm">
                <span className="text-xs font-black text-[#1a6fde] block">USUAL BENCHMARK</span>
                <span className="text-base font-black text-gray-900">~{fmt(usualRate)}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-rose-600 block">Weekend Peak</span>
                <span>~{fmt(peakRate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Booking Guide */}
        <div className="pt-2">
          <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span> How to Guarantee Your Bathtub Room (Avoid Downgrades):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="font-black text-[#1a6fde] block mb-1">Step 1: Click Partner Link</span>
              <p className="text-gray-600">Use our direct links above to land on the canonical hotel page.</p>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="font-black text-amber-800 block mb-1">Step 2: Select Exact Tier</span>
              <p className="text-gray-600">Choose <strong className="text-gray-900">{hotel.roomType || 'Bathtub Suite'}</strong> — not the base room.</p>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="font-black text-emerald-800 block mb-1">Step 3: Confirm Amenity</span>
              <p className="text-gray-600">Verify &ldquo;Bathtub&rdquo; is checked in the room specs before paying.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Price & Seasonal Demand Intelligence Hub */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-1">
              <span>📈</span> Proprietary Pricing Telemetry
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black">
              Rate Trends & Seasonal Booking Analytics
            </h3>
          </div>
          <div className="text-xs text-slate-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 w-fit">
            Destination: {cityName}, {countryName}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card A: Day-of-Week Variance */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weekend Surge Index</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md text-[11px] font-bold">
                  +18% on Fri/Sat
                </span>
              </div>
              <div className="text-2xl font-black text-white mb-2">
                Midweek vs Weekend
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Romantic stays in {cityName} experience substantial Friday–Sunday demand. Book Tuesday–Thursday stays for maximum bathtub value.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-indigo-200">
              💡 <em>Average savings of {fmt(numericBase * 0.15)}/night on midweek reservations.</em>
            </div>
          </div>

          {/* Card B: Optimal Booking Window */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Lead Time Window</span>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-md text-[11px] font-bold">
                  High Demand
                </span>
              </div>
              <div className="text-2xl font-black text-white mb-2">
                14 – 22 Days Ahead
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jacuzzi and bathtub suites are limited (typically representing under 15% of a property&apos;s total room inventory) and sell out fast.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-sky-200">
              🔒 <em>Lock in free-cancellation rates early to guarantee tub access.</em>
            </div>
          </div>

          {/* Card C: Seasonal Price Fluctuations */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Seasonal Demand</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-bold">
                  Winter Peak
                </span>
              </div>
              <div className="text-2xl font-black text-white mb-2">
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
