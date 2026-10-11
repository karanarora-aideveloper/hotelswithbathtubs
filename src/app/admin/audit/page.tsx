'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface AuditRow {
  rowId: number;
  id: string;
  todaysDate: string;
  auditIteration: string;
  auditStatus: string;
  qualityScore: number;
  whatWasFixedToday: string;
  remainingFlags: string;
  name: string;
  city: string;
  country: string;
  neighborhood?: string;
  propertyType: string;
  price: string;
  rating: number;
  reviewsCount: number;
  tubType: string;
  roomType: string;
  primaryDirectOta: string;
  agodaStatus: string;
  mmtStatus: string;
  bookingStatus: string;
  airbnbStatus: string;
  tripStatus: string;
  imageSource: string;
  hasNeighborhood: boolean;
  liveUrl: string;
  primaryBookingUrl: string;
  imageUrl: string;
}

interface AuditPayload {
  generatedDate: string;
  iteration: string;
  totalHotels: number;
  summary: {
    verifiedGold100: number;
    fixedToday: number;
    verifiedPass: number;
    flaggedForEnrichment: number;
    avgQualityScore: number;
  };
  records: AuditRow[];
}

// Comprehensive plain-English explanations for every flag, status, and code
const FLAG_GLOSSARY: Record<string, { title: string; meaning: string; impact: string }> = {
  NONE: {
    title: 'Zero Remaining Issues (100% Clean)',
    meaning: 'This hotel has a standalone direct OTA property page, a 100% unique Cloudflare R2 image, verified neighborhood, room tier, and tub type.',
    impact: '0 penalty (100/100 Gold Score)',
  },
  AGODA_PINNED_CITY_SEARCH_ONLY: {
    title: 'Agoda Pinned City Search (hid=)',
    meaning: 'Clicking the Agoda link opens Agoda’s city search page with this specific hotel pinned at the top (via hid=), rather than a standalone /hotel/*.html detail page.',
    impact: '-10 points (Queued to resolve standalone /hotel/*.html slug)',
  },
  CITY_SEARCH_LINK_ONLY: {
    title: 'City Search Fallback Link Only',
    meaning: 'None of the booking links for this hotel point to a standalone property page yet; they open a city + hotel name search list.',
    impact: '-15 points (High priority to resolve direct property URL)',
  },
  NO_DIRECT_PROPERTY_ID_LINK: {
    title: 'No Direct Property Page Link',
    meaning: 'This listing currently uses a city search query instead of a direct standalone hotel page.',
    impact: '-15 points',
  },
  SHARED_R2_IMAGE_2X: {
    title: 'Shared R2 Bathtub Photo (Used on 2 Hotels in Different Cities)',
    meaning: 'While no other hotel in the SAME city uses this photo, 1 other hotel in a different city currently shares this Cloudflare R2 bathtub photo.',
    impact: '-10 points (Queued to upload a dedicated 1-of-1 photo to R2)',
  },
  SHARED_R2_IMAGE_3X: {
    title: 'Shared R2 Bathtub Photo (Used on 3 Hotels in Different Cities)',
    meaning: 'This Cloudflare R2 image is currently shared across 3 hotels in different cities.',
    impact: '-10 points (Queued to upload a dedicated 1-of-1 photo to R2)',
  },
  EXTERNAL_IMAGE_AIRBNB_CDN: {
    title: 'Hosted on Airbnb CDN (a0.muscache.com)',
    meaning: 'This image is loaded directly from Airbnb’s CDN rather than your Cloudflare R2 bucket.',
    impact: '-10 points (Queued to mirror into Cloudflare R2)',
  },
  EXTERNAL_IMAGE_EXTERNAL_CDN: {
    title: 'Hosted on External OTA CDN (cf.bstatic.com)',
    meaning: 'This image is loaded from Booking.com’s CDN rather than your Cloudflare R2 bucket.',
    impact: '-10 points (Queued to mirror into Cloudflare R2)',
  },
  MISSING_NEIGHBORHOOD: {
    title: 'Missing Sub-Neighborhood Field',
    meaning: 'The database record only had the city name (e.g. "Bhopal") without a specific sub-locality or neighborhood (e.g. "Kerwa Dam Road").',
    impact: '-5 points (Now auto-populated in Iteration 2)',
  },
};

const OTA_STATUS_TOOLTIPS: Record<string, string> = {
  'Agoda (Direct Hotel Page)': 'Lands directly on the standalone Agoda hotel detail page (/hotel/*.html) with your cid=1972736 affiliate tag.',
  'MakeMyTrip (Direct Hotel Page)': 'Lands directly on the standalone MakeMyTrip hotel-details page with exact hotelId.',
  'Airbnb (Direct Room Page)': 'Lands directly on the standalone Airbnb room listing (/rooms/ID).',
  'Booking.com (Direct Hotel Page)': 'Lands directly on the standalone Booking.com hotel page (/hotel/*.html).',
  'Agoda (Pinned City Search)': 'Uses Agoda partnersearch.aspx?hid=ID — opens the city search page with this hotel pinned at the top, not a standalone /hotel/*.html page.',
  'Agoda (Direct HID)': 'Uses Agoda partnersearch.aspx?hid=ID — opens the city search page with this hotel pinned.',
  'City Search Fallback': 'Opens a city + hotel keyword search results page because no standalone direct property URL is stored yet.',
};

const IMAGE_SOURCE_TOOLTIPS: Record<string, string> = {
  R2_UNIQUE: '100% Exclusive Cloudflare R2 Image — only this single hotel uses this photo across the entire 3,813-hotel database.',
  R2_SHARED_2X: 'Hosted on Cloudflare R2, but shared with 1 other hotel in a different city (0 same-city collisions).',
  R2_SHARED_3X: 'Hosted on Cloudflare R2, but shared with 2 other hotels in different cities (0 same-city collisions).',
  AIRBNB_CDN: 'Loaded from Airbnb CDN (a0.muscache.com) instead of Cloudflare R2.',
  EXTERNAL_CDN: 'Loaded from external Booking.com CDN (cf.bstatic.com) instead of Cloudflare R2.',
};

// Reusable Hover Tooltip Wrapper
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group/tip inline-flex items-center cursor-help">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 text-left">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

export default function MasterDataAuditPage() {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToolkit, setShowToolkit] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const [sampleMode, setSampleMode] = useState<'NONE' | 'RANDOM_20' | 'STRATIFIED_20'>('NONE');
  const [sampledIds, setSampledIds] = useState<Set<number>>(new Set());
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    fetch(`/audits/hotels_master_audit_latest.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((json: AuditPayload) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.records.map((r) => r.country))).sort();
  }, [data]);

  const triggerRandomSample = (mode: 'RANDOM_20' | 'STRATIFIED_20') => {
    if (!data) return;
    const picked = new Set<number>();
    if (mode === 'RANDOM_20') {
      const pool = [...data.records];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      pool.slice(0, 20).forEach((r) => picked.add(r.rowId));
    } else {
      const indiaPool = data.records.filter((r) => r.country === 'India' && r.propertyType.includes('Hotel'));
      const globalPool = data.records.filter((r) => r.country !== 'India' && r.propertyType.includes('Hotel'));
      const airbnbPool = data.records.filter((r) => r.propertyType.includes('Airbnb'));
      const shuffle = (arr: AuditRow[]) => [...arr].sort(() => Math.random() - 0.5);
      shuffle(indiaPool).slice(0, 7).forEach((r) => picked.add(r.rowId));
      shuffle(globalPool).slice(0, 7).forEach((r) => picked.add(r.rowId));
      shuffle(airbnbPool).slice(0, 6).forEach((r) => picked.add(r.rowId));
    }
    setSampledIds(picked);
    setSampleMode(mode);
    setPage(1);
  };

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    return data.records.filter((r) => {
      if (sampleMode !== 'NONE' && !sampledIds.has(r.rowId)) return false;
      if (statusFilter !== 'ALL' && r.auditStatus !== statusFilter) return false;
      if (countryFilter !== 'ALL' && r.country !== countryFilter) return false;
      if (flagFilter === 'HAS_FLAGS' && r.remainingFlags === 'NONE') return false;
      if (flagFilter === 'NO_FLAGS' && r.remainingFlags !== 'NONE') return false;
      if (flagFilter === 'DIRECT_PAGE_ONLY' && !r.primaryDirectOta.includes('Direct Hotel Page') && !r.primaryDirectOta.includes('Direct Room Page')) return false;
      if (flagFilter === 'PINNED_SEARCH' && !r.primaryDirectOta.includes('Pinned City Search')) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.rowId} ${r.name} ${r.city} ${r.country} ${r.neighborhood || ''} ${r.whatWasFixedToday} ${r.remainingFlags} ${r.tubType} ${r.roomType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, sampleMode, sampledIds, statusFilter, countryFilter, flagFilter, search]);

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page]);

  const copyImportDataFormula = () => {
    const formula = `=IMPORTDATA("https://www.hotelswithbathtubs.com/audits/hotels_master_audit_latest.csv")`;
    navigator.clipboard.writeText(formula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Loading Master Audit Sheet (3,813 records)...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        Audit data file not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Google Sheets Export Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {data.iteration}
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
              Today&apos;s Date: {data.generatedDate}
            </span>
            <button
              onClick={() => setShowToolkit((v) => !v)}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
            >
              {showToolkit ? '🛠️ Hide Audit Toolkit & Legend' : '🛠️ Show Audit Toolkit & Legend'}
            </button>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Master Hotel Data Audit &amp; Random Spot-Check Sheet
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hover over any badge, status, or flag code below to see a plain-English tooltip explaining what it means and why it appears.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/audits/hotels_master_audit_latest.csv"
            download={`hotels_master_audit_${data.generatedDate}.csv`}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Download Google Sheet CSV ({data.generatedDate})</span>
          </a>
          <button
            onClick={copyImportDataFormula}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {copiedFormula ? '✓ Copied =IMPORTDATA() Formula!' : '📋 Copy Live Google Sheets Formula'}
          </button>
        </div>
      </div>

      {/* 🛠️ Interactive Audit Toolkit & Glossary Panel */}
      {showToolkit && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black tracking-wide uppercase text-amber-400 flex items-center gap-2">
                <span>🛠️</span> Audit Toolkit: Plain-English Guide to Flags, Links &amp; Image Tiers
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Use this reference key while spot-checking rows. Every badge in the table also has a hover tooltip.
              </p>
            </div>
            <button
              onClick={() => setShowToolkit(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              Minimize ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Column 1: OTA Link Tiers */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70 space-y-2">
              <div className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
                1. OTA Booking Link Tiers
              </div>
              <div>
                <span className="font-bold text-white">Agoda / MMT / Airbnb (Direct Hotel/Room Page):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Opens the standalone hotel property page (<code className="text-emerald-300">/hotel/*.html</code>, <code className="text-emerald-300">hotel-details?hotelId=</code>, or <code className="text-emerald-300">/rooms/ID</code>). Zero search lists.
                </p>
              </div>
              <div>
                <span className="font-bold text-amber-300">Agoda (Pinned City Search):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Uses <code className="text-amber-200">partnersearch.aspx?hid=ID</code>. Opens Agoda&apos;s city page with that hotel pinned at the top, rather than a standalone <code className="text-amber-200">/hotel/*.html</code> page. Flagged as <code className="text-amber-200">AGODA_PINNED_CITY_SEARCH_ONLY</code> (-10 pts).
                </p>
              </div>
            </div>

            {/* Column 2: Image Tiers */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70 space-y-2">
              <div className="font-bold text-sky-400 uppercase text-[11px] tracking-wider">
                2. Image Hosting &amp; Uniqueness Tiers
              </div>
              <div>
                <span className="font-bold text-white">IMG: R2_UNIQUE (Best):</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Hosted on your Cloudflare R2 bucket and used exclusively by this <strong>1 single hotel</strong> across the entire database.
                </p>
              </div>
              <div>
                <span className="font-bold text-amber-300">IMG: R2_SHARED_2X / 3X:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Hosted on Cloudflare R2 (and 0 hotels in the same city share it), but 1–2 hotels in a <em>different city</em> still share this bathtub image.
                </p>
              </div>
              <div>
                <span className="font-bold text-rose-300">IMG: AIRBNB_CDN:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Served from <code className="text-rose-200">a0.muscache.com</code> instead of Cloudflare R2.
                </p>
              </div>
            </div>

            {/* Column 3: Remaining Flags Glossary */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70 space-y-2">
              <div className="font-bold text-purple-400 uppercase text-[11px] tracking-wider">
                3. Why Flags Show (And How We Fix Them)
              </div>
              <div>
                <span className="font-bold text-white">Why did MISSING_NEIGHBORHOOD show earlier?</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  3,260 hotels originally only had a city name (e.g. &ldquo;Bhopal&rdquo;) without a sub-area (e.g. &ldquo;Kerwa Dam &amp; Shamla Hills&rdquo;). <strong>Fixed across 100% of hotels in Iteration 2!</strong>
                </p>
              </div>
              <div>
                <span className="font-bold text-emerald-300">VERIFIED_GOLD_100 Status:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  100/100 score: Direct standalone hotel page + 100% unique R2 image + neighborhood + room tier + tub type + booking tip.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Clean Inventory</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{data.totalHotels.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">0 same-city duplicates</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Gold 100/100 Score</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{data.summary.verifiedGold100.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">Direct Page + Unique R2</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Verified Pass (90+)</span>
          <div className="text-2xl font-black text-teal-600 mt-1">{data.summary.verifiedPass.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">High-confidence stays</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Updated Today ({data.generatedDate})</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{data.summary.fixedToday.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">Direct URLs &amp; Neighborhoods</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Avg Quality Score</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{data.summary.avgQualityScore} / 100</div>
          <span className="text-[11px] text-amber-700 font-semibold">{data.summary.flaggedForEnrichment} queued for Iter 3</span>
        </div>
      </div>

      {/* Controls: Random Sampler & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerRandomSample('RANDOM_20')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sampleMode === 'RANDOM_20'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              🎲 Pick 20 Pure Random Rows
            </button>
            <button
              onClick={() => triggerRandomSample('STRATIFIED_20')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sampleMode === 'STRATIFIED_20'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              🎯 Pick 20 Stratified Rows (India + Global + Airbnb)
            </button>
            {sampleMode !== 'NONE' && (
              <button
                onClick={() => setSampleMode('NONE')}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                ✕ Clear Random Sample (Show All {data.totalHotels})
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Showing <strong className="text-gray-900">{filteredRecords.length.toLocaleString()}</strong> rows
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search row # (e.g. 310), hotel, city, flag..."
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
          >
            <option value="ALL">All Audit Statuses</option>
            <option value="VERIFIED_GOLD_100">Verified Gold (100/100 Score)</option>
            <option value="VERIFIED_PASS">Verified Pass (90+ Score)</option>
            <option value="FLAGGED_FOR_ENRICHMENT">Flagged for Next Iteration</option>
          </select>
          <select
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
          >
            <option value="ALL">All Countries ({countries.length})</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={flagFilter}
            onChange={(e) => { setFlagFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
          >
            <option value="ALL">All Link &amp; Flag Filters</option>
            <option value="DIRECT_PAGE_ONLY">Has Standalone Direct Hotel/Room Page</option>
            <option value="PINNED_SEARCH">Agoda Pinned City Search (hid=)</option>
            <option value="NO_FLAGS">Zero Remaining Flags (100% Clean)</option>
            <option value="HAS_FLAGS">Has Remaining Enrichment Flags</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">
                  <Tooltip text="The date this row was last audited and verified by the automated audit engine.">
                    <span>Today&apos;s Date ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">
                  <Tooltip text="VERIFIED_GOLD_100 = 100/100 score with standalone direct OTA page & unique R2 image. VERIFIED_PASS = 90+ score. FLAGGED_FOR_ENRICHMENT = queued for next iteration.">
                    <span>Audit Status ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">
                  <Tooltip text="Starts at 100. Deducts 10 pts if Agoda link is a pinned city search instead of a standalone /hotel/*.html page, 10 pts if R2 image is shared across cities, or 10 pts if image is on Airbnb CDN.">
                    <span>Score ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">Hotel, Neighborhood &amp; City</th>
                <th className="py-3 px-3">Price / Rating</th>
                <th className="py-3 px-3">Tub &amp; Room Tier</th>
                <th className="py-3 px-3">
                  <Tooltip text="Shows whether the #1 primary button opens a standalone hotel detail page (/hotel/*.html, hotel-details, /rooms/) vs a pinned city search page.">
                    <span>Primary Direct OTA &amp; Image ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">
                  <Tooltip text="Exact automated fixes applied to this hotel during today's audit iteration.">
                    <span>What Was Fixed Today ({data.generatedDate}) ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">
                  <Tooltip text="Hover over any flag code in this column to see why it is flagged and how it will be resolved.">
                    <span>Remaining Flags ⓘ</span>
                  </Tooltip>
                </th>
                <th className="py-3 px-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRecords.map((r) => {
                const flagList = r.remainingFlags.split('; ').filter(Boolean);
                return (
                  <tr key={r.rowId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-gray-400">{r.rowId}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-800 whitespace-nowrap">
                      {r.todaysDate}
                      <span className="block text-[10px] text-blue-600 font-semibold">{r.auditIteration}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Tooltip
                        text={
                          r.auditStatus === 'VERIFIED_GOLD_100'
                            ? '100/100 Gold Standard: Standalone direct hotel page + 100% unique R2 image + verified neighborhood & room tier.'
                            : r.auditStatus === 'VERIFIED_PASS'
                            ? '90+ Quality Score: Verified stay with minor non-blocking flag (see Remaining Flags column).'
                            : 'Queued for next iteration to upgrade pinned search link or shared/external image.'
                        }
                      >
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.auditStatus === 'VERIFIED_GOLD_100'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : r.auditStatus === 'VERIFIED_PASS'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {r.auditStatus}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={r.qualityScore === 100 ? 'text-emerald-700' : r.qualityScore >= 90 ? 'text-blue-700' : 'text-amber-700'}>
                        {r.qualityScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[230px]">
                      <div className="font-bold text-gray-900 truncate" title={r.name}>{r.name}</div>
                      <div className="text-[11px] text-gray-600 truncate">
                        📍 {r.neighborhood ? `${r.neighborhood}, ${r.city}` : r.city}, {r.country}
                      </div>
                      <div className="text-[10px] text-gray-400">{r.propertyType}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{r.price}</div>
                      <div className="text-[11px] text-amber-600 font-semibold">★ {r.rating} <span className="text-gray-400">({r.reviewsCount})</span></div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px]">
                      <div className="font-semibold text-gray-800 truncate" title={r.tubType}>🛁 {r.tubType}</div>
                      <div className="text-[11px] text-gray-500 truncate" title={r.roomType}>🏷️ {r.roomType}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div>
                        <Tooltip text={OTA_STATUS_TOOLTIPS[r.primaryDirectOta] || 'Primary outbound booking link.'}>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.primaryDirectOta.includes('Direct Hotel Page') || r.primaryDirectOta.includes('Direct Room Page')
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : r.primaryDirectOta.includes('Pinned')
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {r.primaryDirectOta} ⓘ
                          </span>
                        </Tooltip>
                      </div>
                      <div className="mt-1">
                        <Tooltip text={IMAGE_SOURCE_TOOLTIPS[r.imageSource] || 'Image hosting status.'}>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              r.imageSource === 'R2_UNIQUE'
                                ? 'text-emerald-700 bg-emerald-50/70'
                                : r.imageSource.startsWith('R2_SHARED')
                                ? 'text-amber-800 bg-amber-50'
                                : 'text-rose-700 bg-rose-50'
                            }`}
                          >
                            IMG: {r.imageSource} ⓘ
                          </span>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[230px]">
                      <span className={r.whatWasFixedToday === 'Verified Clean' ? 'text-gray-400' : 'text-blue-700 font-semibold text-[11px]'}>
                        {r.whatWasFixedToday}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[210px]">
                      <div className="flex flex-wrap gap-1">
                        {flagList.map((flag, idx) => {
                          const info = FLAG_GLOSSARY[flag] || {
                            title: flag,
                            meaning: 'Flagged for enrichment in upcoming audit iteration.',
                            impact: '-10 points',
                          };
                          return (
                            <Tooltip key={idx} text={`${info.title}: ${info.meaning} (${info.impact})`}>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  flag === 'NONE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {flag} ⓘ
                              </span>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap space-x-1.5">
                      <a
                        href={r.liveUrl.replace('https://www.hotelswithbathtubs.com', '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold text-[10px]"
                      >
                        Page ↗
                      </a>
                      {r.primaryBookingUrl && (
                        <a
                          href={r.primaryBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold text-[10px]"
                        >
                          OTA ↗
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredRecords.length > pageSize && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 text-xs">
            <span>
              Page <strong>{page}</strong> of <strong>{Math.ceil(filteredRecords.length / pageSize)}</strong>
            </span>
            <div className="space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              <button
                disabled={page * pageSize >= filteredRecords.length}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-bold disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
