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

export default function MasterDataAuditPage() {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(true);
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
    fetch('/audits/hotels_master_audit_latest.json')
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
      // Stratified: 7 India Hotels, 7 Global Hotels, 6 Airbnb / Flagged
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
      if (flagFilter === 'FIXED_TODAY' && r.whatWasFixedToday === 'Already Clean') return false;
      if (flagFilter === 'DIRECT_OTA' && !r.primaryDirectOta.includes('Direct')) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.name} ${r.city} ${r.country} ${r.whatWasFixedToday} ${r.remainingFlags} ${r.tubType} ${r.roomType}`.toLowerCase();
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
        Audit data file not found. Run scripts/run-iteration1-audit-and-fix.mjs.
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
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Master Hotel Data Audit &amp; Random Spot-Check Sheet
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Iterative sampling &amp; full-dataset verification across all {data.totalHotels.toLocaleString()} stays. Every defect found in random sampling is codified into a global rule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/audits/hotels_master_audit_${data.generatedDate}_iter1.csv`}
            download
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

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total Clean Inventory</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{data.totalHotels.toLocaleString()}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">39 duplicates removed today</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Fixed in {data.iteration}</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{data.summary.fixedToday.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">Auto-remediated ({data.generatedDate})</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Gold 100/100 Score</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{data.summary.verifiedGold100.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">Zero flags remaining</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Verified Pass (85+)</span>
          <div className="text-2xl font-black text-teal-600 mt-1">{data.summary.verifiedPass.toLocaleString()}</div>
          <span className="text-[11px] text-gray-500">Direct OTA &amp; R2 verified</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Avg Quality Score</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{data.summary.avgQualityScore} / 100</div>
          <span className="text-[11px] text-amber-700 font-semibold">{data.summary.flaggedForEnrichment} queued for Iter 2</span>
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
            placeholder="Search hotel, city, fix note, or flag..."
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
          >
            <option value="ALL">All Audit Statuses</option>
            <option value={`FIXED_AND_VERIFIED (${data.generatedDate})`}>Fixed &amp; Verified Today ({data.generatedDate})</option>
            <option value="VERIFIED_GOLD_100">Verified Gold (100 Score)</option>
            <option value="VERIFIED_PASS">Verified Pass (85+ Score)</option>
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
            <option value="ALL">All Records</option>
            <option value="FIXED_TODAY">Modified / Fixed Today</option>
            <option value="DIRECT_OTA">Has Direct Property ID Link</option>
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
                <th className="py-3 px-3">Today&apos;s Date</th>
                <th className="py-3 px-3">Audit Status</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Hotel &amp; Destination</th>
                <th className="py-3 px-3">Price / Rating</th>
                <th className="py-3 px-3">Tub &amp; Room Tier</th>
                <th className="py-3 px-3">Primary Direct OTA</th>
                <th className="py-3 px-3">What Was Fixed Today ({data.generatedDate})</th>
                <th className="py-3 px-3">Remaining Flags</th>
                <th className="py-3 px-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRecords.map((r) => (
                <tr key={r.rowId} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-400">{r.rowId}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800 whitespace-nowrap">
                    {r.todaysDate}
                    <span className="block text-[10px] text-gray-400 font-normal">{r.auditIteration}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.auditStatus.startsWith('FIXED_AND_VERIFIED')
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : r.auditStatus === 'VERIFIED_GOLD_100'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : r.auditStatus === 'VERIFIED_PASS'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {r.auditStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span className={r.qualityScore >= 90 ? 'text-emerald-700' : r.qualityScore >= 80 ? 'text-blue-700' : 'text-amber-700'}>
                      {r.qualityScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-[220px]">
                    <div className="font-bold text-gray-900 truncate" title={r.name}>{r.name}</div>
                    <div className="text-[11px] text-gray-500">{r.city}, {r.country} • <span className="text-gray-400">{r.propertyType}</span></div>
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.primaryDirectOta.includes('Direct')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {r.primaryDirectOta}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      IMG: {r.imageSource}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 max-w-[230px]">
                    <span className={r.whatWasFixedToday === 'Already Clean' ? 'text-gray-400' : 'text-blue-700 font-semibold'}>
                      {r.whatWasFixedToday}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-[180px]">
                    <span className={r.remainingFlags === 'NONE' ? 'text-emerald-600 font-bold' : 'text-amber-800 font-medium'}>
                      {r.remainingFlags}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap space-x-1.5">
                    <a
                      href={r.liveUrl}
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
              ))}
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
