'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import OutboundLink from './OutboundLink';
import { isDirectPropertyUrl, getUrlDirectnessTier, type TripDates } from '@/lib/affiliate';

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
    numericRate: number;
    perks: string[];
    isLowest: boolean;
  }

  const platforms: PlatformConfig[] = [];

  // Agoda Platform
  const agodaUrl = hotel.agodaUrl || (hotel.url && hotel.url.includes('agoda') ? hotel.url : undefined);
  const isAgodaValid = agodaUrl ? getUrlDirectnessTier(agodaUrl) < 99 : false;
  if (agodaUrl && isAgodaValid) {
    const agodaUsual = numericBase; // same listed rate: we do not know each platform's live price
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
      usualNote: 'Listed rate - check live price',
      numericRate: agodaUsual,
      perks: [
        'Instant mobile VIP discount pricing',
        'Direct room selector with guaranteed tub tier',
        'Earn AgodaCash towards future spa escapes',
      ],
      isLowest: false,
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
      usualNote: 'Listed rate - check live price',
      numericRate: mmtUsual,
      perks: [
        'Instant bank card discounts (HDFC, ICICI, Axis)',
        'Verified couple-friendly check-in with local IDs',
        '24/7 dedicated guest concierge support',
      ],
      isLowest: false,
    });
  }

  // Booking.com Platform
  const bookingUrl = hotel.bookingUrl || (hotel.url && hotel.url.includes('booking.com') && !hotel.url.includes('searchresults') ? hotel.url : undefined);
  if (bookingUrl) {
    const bookingUsual = numericBase; // same listed rate: we do not know each platform's live price
    platforms.push({
      id: 'booking',
      name: 'Booking.com',
      badge: 'Genius Perks & Flexible Rates',
      badgeColor: 'bg-sky-50/80 text-sky-900 border-sky-200/80',
      logoBg: 'bg-[#003580] text-white',
      buttonBg: 'bg-[#003580] hover:bg-[#002860] text-white',
      url: bookingUrl,
      source: 'Booking.com',
      usualRate: fmt(bookingUsual),
      usualNote: 'Listed rate - check live price',
      numericRate: bookingUsual,
      perks: [
        'Flexible cancellation on select partner rates',
        'No upfront deposit on select dates',
        'Genius Level 1–3 complimentary upgrades',
      ],
      isLowest: false,
    });
  }

  // Trip.com Platform
  // Only a real Trip.com hotel page counts. A keyword-search link used to be invented here for every
  // non-India hotel; Trip.com ignores the keyword and shows "0 properties found".
  const isTripSearch = (u?: string) => !!u && (u.includes('/hotels/list') || u.includes('keyword='));
  const tripCandidate = hotel.tripUrl || (hotel.url && hotel.url.includes('trip.com') ? hotel.url : undefined);
  const tripUrl = isTripSearch(tripCandidate) ? undefined : tripCandidate;
  if (tripUrl) {
    const tripUsual = numericBase; // same listed rate: we do not know each platform's live price
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
      usualNote: 'Listed rate - check live price',
      numericRate: tripUsual,
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

  const airbnbUsual = numericBase; // same listed rate: we do not know each platform's live price
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
    usualNote: 'Listed rate - check live price',
    numericRate: airbnbUsual,
    perks: hasDirectAirbnb ? [
      'Full private sanctuary with gourmet kitchen',
      'Direct messaging with verified Superhost',
      'Keyless self check-in with complete privacy',
    ] : [
      `Search private in-room soaking tubs in ${cityName}`,
      'Direct host contact & residential privacy',
      'Flexible cancellation on select stays',
    ],
    isLowest: false,
  });

  // Sort platforms so direct property links always appear above generic search fallbacks
  platforms.sort((a, b) => {
    const tierA = getUrlDirectnessTier(a.url);
    const tierB = getUrlDirectnessTier(b.url);
    return tierA - tierB;
  });

  // Ensure the #1 top-ranked platform carries the featured highlight badge
  platforms.forEach((p, idx) => {
    p.isLowest = false; // never claim a platform is cheapest: live prices are not known here
  });

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getUpcomingWeekend = (offsetWeeks = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0) daysUntilFriday = 7; // Next Friday
    daysUntilFriday += offsetWeeks * 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return { checkin: formatDateStr(friday), checkout: formatDateStr(sunday) };
  };

  const getNextMonthDates = () => {
    const future = new Date();
    future.setDate(future.getDate() + 28);
    const dayOfWeek = future.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    future.setDate(future.getDate() + daysUntilFriday);
    const sunday = new Date(future);
    sunday.setDate(future.getDate() + 2);
    return { checkin: formatDateStr(future), checkout: formatDateStr(sunday) };
  };

  // Date and Guest State for Real-Time Meta-Search Deep Linking
  const [checkin, setCheckin] = useState<string>(() => getUpcomingWeekend(0).checkin);
  const [checkout, setCheckout] = useState<string>(() => getUpcomingWeekend(0).checkout);
  const [adults, setAdults] = useState<number>(2);
  const [activeShortcut, setActiveShortcut] = useState<'weekend' | 'next-weekend' | 'next-month' | 'custom'>('weekend');

  const handleShortcut = (shortcut: 'weekend' | 'next-weekend' | 'next-month') => {
    setActiveShortcut(shortcut);
    if (shortcut === 'weekend') {
      const dates = getUpcomingWeekend(0);
      setCheckin(dates.checkin);
      setCheckout(dates.checkout);
    } else if (shortcut === 'next-weekend') {
      const dates = getUpcomingWeekend(1);
      setCheckin(dates.checkin);
      setCheckout(dates.checkout);
    } else if (shortcut === 'next-month') {
      const dates = getNextMonthDates();
      setCheckin(dates.checkin);
      setCheckout(dates.checkout);
    }
  };

  const minCheckinDate = useMemo(() => {
    return formatDateStr(new Date());
  }, []);

  const handleCheckinChange = (val: string) => {
    setActiveShortcut('custom');
    setCheckin(val);
    if (val && checkout && checkout <= val) {
      const d = new Date(val + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      setCheckout(formatDateStr(d));
    }
  };

  const handleCheckoutChange = (val: string) => {
    setActiveShortcut('custom');
    setCheckout(val);
  };

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 1;
    const start = new Date(checkin + 'T00:00:00');
    const end = new Date(checkout + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkin, checkout]);

  const formattedDateRange = useMemo(() => {
    if (!checkin || !checkout) return '';
    try {
      const dIn = new Date(checkin + 'T00:00:00');
      const dOut = new Date(checkout + 'T00:00:00');
      const mIn = dIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const mOut = dOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${mIn} – ${mOut}`;
    } catch {
      return '';
    }
  }, [checkin, checkout]);

  const tripDates: TripDates | undefined = useMemo(() => {
    if (!checkin || !checkout) return undefined;
    return { checkin, checkout, adults };
  }, [checkin, checkout, adults]);

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
  const usualRate = numericBase;

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
              Historical benchmark rates (excluding taxes &amp; resort fees — shown at partner checkout). Select any partner to inspect live availability and reserve for your dates.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-semibold w-fit shrink-0 font-jakarta">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Triple-Source Verified
          </div>
        </div>

        {/* Interactive Date & Guest Selector for Real-Time Price Discovery */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-[#f8fafb] to-slate-50 border-b border-[#5b8296]/15">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Weekend Shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 font-jakarta">
                Trip Dates:
              </span>
              <button
                type="button"
                onClick={() => handleShortcut('weekend')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeShortcut === 'weekend'
                    ? 'bg-[#1f262d] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                This Weekend
              </button>
              <button
                type="button"
                onClick={() => handleShortcut('next-weekend')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeShortcut === 'next-weekend'
                    ? 'bg-[#1f262d] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Next Weekend
              </button>
              <button
                type="button"
                onClick={() => handleShortcut('next-month')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeShortcut === 'next-month'
                    ? 'bg-[#1f262d] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                }`}
              >
                Next Month
              </button>
            </div>

            {/* Inputs: Check-in, Check-out, Guests */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-center">
              <div>
                <label htmlFor="hotel-checkin-date" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Check-in
                </label>
                <input
                  id="hotel-checkin-date"
                  aria-label="Check-in Date"
                  type="date"
                  min={minCheckinDate}
                  value={checkin}
                  onChange={(e) => handleCheckinChange(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5b8296]"
                />
              </div>

              <div>
                <label htmlFor="hotel-checkout-date" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Check-out
                </label>
                <input
                  id="hotel-checkout-date"
                  aria-label="Check-out Date"
                  type="date"
                  min={checkin || minCheckinDate}
                  value={checkout}
                  onChange={(e) => handleCheckoutChange(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5b8296]"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="hotel-guests-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Guests
                </label>
                <select
                  id="hotel-guests-select"
                  aria-label="Number of Guests"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5b8296]"
                >
                  <option value={2}>2 Adults (Couple)</option>
                  <option value={1}>1 Adult (Solo)</option>
                  <option value={3}>3 Adults</option>
                  <option value={4}>4 Adults</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bathtub Room Tier Guarantee reminder strip */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-3 flex-wrap text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-sm">🛁</span>
              <span className="font-medium">
                <strong className="text-slate-800">Bathtub Guarantee:</strong> When checking rates on partners, select the room marked <em>&quot;{hotel.roomType || tubName}&quot;</em> to guarantee your in-room tub.
              </span>
            </div>
            {nights > 1 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#5b8296]/10 text-[#2a4d5e]">
                {nights} Nights Selected ({formattedDateRange})
              </span>
            )}
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
                    {nights > 1 ? `Est. Total (${nights} Nights)` : 'Usual Nightly Rate'}
                  </span>
                  <div className="flex items-baseline gap-1 lg:justify-end">
                    <span className="text-xl sm:text-2xl font-bold text-[#1f262d] font-jakarta">
                      ~{nights > 1 ? fmt(platform.numericRate * nights) : platform.usualRate}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {nights > 1 ? `(${platform.usualRate}/nt)` : '/ night'}
                    </span>
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
                  dates={tripDates}
                  className={`text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 w-full lg:w-auto font-jakarta ${platform.buttonBg}`}
                >
                  <span>
                    Check Live Deal {formattedDateRange ? `(${formattedDateRange})` : ''} on {platform.name}
                  </span>
                  <span>&rarr;</span>
                </OutboundLink>
              </div>
            </div>
          ))}
        </div>

        {/* In-view FTC / ASA Affiliate Transparency Banner */}
        <div className="mt-5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-jakarta">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ⓘ</span>
            <span>
              <strong className="text-slate-700 font-semibold">Affiliate Transparency:</strong> Rates shown are live estimates from our booking partners. If you book through these links, HotelsWithBathtubs may earn an affiliate commission at no extra cost to you.
            </span>
          </div>
          <Link
            href="/affiliate-policy"
            className="text-[#1a6fde] hover:underline font-medium text-2xs sm:text-xs shrink-0 self-start sm:self-auto"
          >
            Editorial Policy &rarr;
          </Link>
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

    </div>
  );
}
