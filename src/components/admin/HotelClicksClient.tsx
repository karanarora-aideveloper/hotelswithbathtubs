'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface HotelClickItem {
  _id?: string;
  clickId: string;
  hotelName: string;
  cityName?: string;
  countryName?: string;
  provider: string;
  destinationUrl: string;
  pagePath?: string;
  referrer?: string;
  deviceCategory?: string;
  userType?: string;
  posthogDistinctId?: string;
  posthogSessionId?: string;
  ipCountry?: string;
  ipCity?: string;
  clickedAt: string;
}

interface SummaryData {
  totalAllTime: number;
  totalFiltered: number;
  todayCount: number;
  weekCount: number;
  providerBreakdown: Array<{ provider: string; count: number; percentage: number }>;
  topHotels: Array<{ hotelName: string; cityName: string; provider: string; count: number }>;
  topCities: Array<{ cityName: string; count: number }>;
}

export default function HotelClicksClient({ initialData }: { initialData?: any }) {
  const [clicks, setClicks] = useState<HotelClickItem[]>(initialData?.clicks || []);
  const [summary, setSummary] = useState<SummaryData>(
    initialData?.summary || {
      totalAllTime: 0,
      totalFiltered: 0,
      todayCount: 0,
      weekCount: 0,
      providerBreakdown: [],
      topHotels: [],
      topCities: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Filters
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.pagination?.pages || 1);

  // Affiliate Reconciliation State
  const [reconProvider, setReconProvider] = useState<'booking.com' | 'agoda' | 'makemytrip' | 'trip.com'>('booking.com');
  const [reportedClicks, setReportedClicks] = useState<string>('');
  const [reportedEarnings, setReportedEarnings] = useState<string>('');

  // Fetch clicks data
  const fetchData = async (overrideRange?: string, overrideProvider?: string, overridePage?: number) => {
    setLoading(true);
    try {
      const activeRange = overrideRange || range;
      const activeProvider = overrideProvider || selectedProvider;
      const activePage = overridePage || page;

      const params = new URLSearchParams({
        range: activeRange,
        provider: activeProvider,
        page: String(activePage),
        limit: '50',
      });
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/track-click?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClicks(data.clicks || []);
        if (data.summary) setSummary(data.summary);
        if (data.pagination) setTotalPages(data.pagination.pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch clicks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, selectedProvider, page]);

  // Auto-sync from Cloudflare Edge D1 if last sync was > 30 minutes ago
  useEffect(() => {
    try {
      const lastSync = localStorage.getItem('hwb_last_d1_sync');
      const now = Date.now();
      if (!lastSync || now - parseInt(lastSync, 10) > 30 * 60 * 1000) {
        fetch('/api/track-click/sync', { method: 'POST' })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              if (d.syncedCount > 0) {
                setSyncStatus(`Auto-synced ${d.syncedCount} new clicks from Cloudflare Edge.`);
                fetchData();
              }
              localStorage.setItem('hwb_last_d1_sync', Date.now().toString());
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, []);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData(range, selectedProvider, 1);
  };

  // Sync from Cloudflare D1
  const handleSyncFromEdge = async () => {
    setSyncing(true);
    setSyncStatus('Connecting to Cloudflare D1 edge database...');
    try {
      const res = await fetch('/api/track-click/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`✓ ${data.message}`);
        fetchData();
      } else {
        setSyncStatus(`❌ Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      setSyncStatus(`❌ Network error: ${e.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (clicks.length === 0) {
      alert('No clicks to export.');
      return;
    }

    const headers = [
      'Click ID',
      'Date & Time (UTC)',
      'Hotel Name',
      'City',
      'Country',
      'Affiliate Platform',
      'Destination URL',
      'Page Path',
      'Device',
      'User Type',
      'PostHog Distinct ID',
    ];

    const rows = clicks.map((c) => [
      c.clickId,
      new Date(c.clickedAt).toISOString(),
      `"${(c.hotelName || '').replace(/"/g, '""')}"`,
      `"${(c.cityName || '').replace(/"/g, '""')}"`,
      `"${(c.countryName || '').replace(/"/g, '""')}"`,
      c.provider,
      `"${(c.destinationUrl || '').replace(/"/g, '""')}"`,
      `"${(c.pagePath || '').replace(/"/g, '""')}"`,
      c.deviceCategory || 'desktop',
      c.userType || 'new',
      c.posthogDistinctId || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hotel-clicks-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reconciliation calculations
  const platformClickCount = useMemo(() => {
    const item = summary.providerBreakdown?.find((p) => p.provider === reconProvider);
    return item ? item.count : 0;
  }, [summary.providerBreakdown, reconProvider]);

  const reconReportedNum = parseInt(reportedClicks, 10) || 0;
  const varianceDelta = platformClickCount - reconReportedNum;
  const variancePercent =
    platformClickCount > 0
      ? Math.round((Math.abs(varianceDelta) / platformClickCount) * 100)
      : 0;

  // Provider pill styles
  const getProviderBadge = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('booking')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Booking.com</span>;
    }
    if (p.includes('agoda')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Agoda</span>;
    }
    if (p.includes('makemytrip') || p.includes('earnkaro')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">MakeMyTrip</span>;
    }
    if (p.includes('trip.com')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">Trip.com</span>;
    }
    if (p.includes('airbnb')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Airbnb</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{provider}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎯</span>
            <h1 className="text-2xl font-black text-gray-900">Hotel Link Clicks Portal</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Affiliate Tracking
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time audit log of outbound hotel clicks to compare against Booking.com, Agoda, and MakeMyTrip dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleSyncFromEdge}
            disabled={syncing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            title="Sync clicks captured on Cloudflare Edge into MongoDB"
          >
            <span>{syncing ? '⏳' : '⚡'}</span>
            <span>{syncing ? 'Syncing...' : 'Sync Edge Clicks'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all"
            title="Download CSV for affiliate reconciliation"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 transition-all text-xs"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fade-in flex items-center justify-between">
          <span>{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-emerald-600 hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Clicks (All-Time)</div>
          <div className="text-3xl font-black text-gray-900">{summary.totalAllTime.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500 mt-1">Direct outbound buyer clicks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Clicks Today</div>
          <div className="text-3xl font-black text-emerald-600">{summary.todayCount.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Live active user demand</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Clicks This Week</div>
          <div className="text-3xl font-black text-[#1a6fde]">{summary.weekCount.toLocaleString()}</div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">Last 7 calendar days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Top Platform</div>
          <div className="text-2xl font-black text-gray-900 truncate">
            {summary.providerBreakdown[0]?.provider ? (
              summary.providerBreakdown[0].provider.toUpperCase()
            ) : (
              'None'
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {summary.providerBreakdown[0]?.percentage || 0}% of all outbound exits
          </div>
        </div>
      </div>

      {/* Platform Breakdown & Affiliate Reconciliation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share by Platform */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Clicks by Affiliate Platform</h3>
            <p className="text-xs text-gray-500 mb-4">Distribution across integrated booking engines ({range}).</p>

            <div className="space-y-3.5">
              {summary.providerBreakdown.map((item) => (
                <div key={item.provider}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-gray-800 capitalize">{item.provider}</span>
                    <span className="font-semibold text-gray-600">
                      {item.count} clicks ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        item.provider.includes('booking')
                          ? 'bg-blue-600'
                          : item.provider.includes('agoda')
                          ? 'bg-emerald-500'
                          : item.provider.includes('makemytrip')
                          ? 'bg-amber-500'
                          : item.provider.includes('trip')
                          ? 'bg-sky-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {summary.providerBreakdown.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6">No platform clicks recorded in this period.</div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Filtered Total:</span>
            <span className="font-bold text-gray-900">{summary.totalFiltered} clicks</span>
          </div>
        </div>

        {/* Affiliate Reconciliation Comparator */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-md border border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h3 className="font-heading font-bold text-base text-white">Affiliate Reconciliation Comparator</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                AUDIT TOOL
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              Compare your on-site tracked clicks against what your affiliate partner dashboard (Booking.com Partner Hub, Agoda Partners, or EarnKaro) reports.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  1. Select Partner
                </label>
                <select
                  value={reconProvider}
                  onChange={(e) => setReconProvider(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-accent"
                >
                  <option value="booking.com">Booking.com</option>
                  <option value="agoda">Agoda</option>
                  <option value="makemytrip">MakeMyTrip (EarnKaro)</option>
                  <option value="trip.com">Trip.com</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  2. Partner Reported Clicks
                </label>
                <input
                  type="number"
                  placeholder="e.g. 85"
                  value={reportedClicks}
                  onChange={(e) => setReportedClicks(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-accent placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  3. Reported Earnings ($ / ₹)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $120 or ₹4,500"
                  value={reportedEarnings}
                  onChange={(e) => setReportedEarnings(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-accent placeholder-gray-500"
                />
              </div>
            </div>

            {/* Reconciliation Output Box */}
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Tracked On-Site</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{platformClickCount}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">({range})</div>
              </div>

              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Reported by Partner</div>
                <div className="text-xl font-black text-blue-400 mt-0.5">{reconReportedNum || '—'}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">from dashboard</div>
              </div>

              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Attribution Match</div>
                <div className="text-xl font-black text-purple-400 mt-0.5">
                  {reconReportedNum > 0 && platformClickCount > 0
                    ? `${Math.min(Math.round((reconReportedNum / platformClickCount) * 100), 100)}%`
                    : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">match rate</div>
              </div>

              <div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Variance Delta</div>
                <div className={`text-xl font-black mt-0.5 ${varianceDelta > 0 ? 'text-amber-400' : 'text-gray-300'}`}>
                  {reportedClicks ? `${varianceDelta > 0 ? '+' : ''}${varianceDelta}` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {reportedClicks ? `${variancePercent}% delta` : 'discrepancy'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
            <span>💡 Tip: ~3–7% delta is standard due to user ad-blockers and privacy browsers.</span>
            {reportedEarnings && (
              <span className="text-emerald-300 font-bold">Earnings: {reportedEarnings}</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Date Ranges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline">Range:</span>
          {(['today', '7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                range === r
                  ? 'bg-[#1a6fde] text-white border-[#1a6fde] shadow-2xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Provider Dropdown & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => {
              setSelectedProvider(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1a6fde]"
          >
            <option value="all">All Platforms</option>
            <option value="booking.com">Booking.com</option>
            <option value="agoda">Agoda</option>
            <option value="makemytrip">MakeMyTrip</option>
            <option value="trip.com">Trip.com</option>
            <option value="airbnb">Airbnb</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search hotel, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a6fde] focus:bg-white"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">🔍</span>
          </form>
        </div>
      </div>

      {/* Clicks Audit Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-gray-900">Recorded Outbound Hotel Clicks</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {summary.totalFiltered} entries
            </span>
          </div>

          {loading && <span className="text-xs text-gray-400 font-medium animate-pulse">Loading updates...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Hotel Name</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Outbound URL</th>
                <th className="py-3 px-4">Source Route</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4 text-center">PostHog</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {clicks.map((c) => {
                const dateObj = new Date(c.clickedAt);
                const timeFormatted = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <tr key={c.clickId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap" suppressHydrationWarning>
                      <div className="font-semibold text-gray-900" suppressHydrationWarning>{dateFormatted}</div>
                      <div className="text-[10px] text-gray-400" suppressHydrationWarning>{timeFormatted}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{c.hotelName}</div>
                      <div className="text-[10px] text-gray-400">
                        {c.cityName}
                        {c.countryName ? `, ${c.countryName}` : ''}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      <span className="font-medium">{c.cityName || '—'}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getProviderBadge(c.provider)}
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={c.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1a6fde] hover:underline truncate text-[11px] font-mono"
                          title={c.destinationUrl}
                        >
                          {c.destinationUrl.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}...
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.destinationUrl);
                            alert('Copied URL to clipboard!');
                          }}
                          className="text-gray-400 hover:text-gray-700 text-xs"
                          title="Copy full URL"
                        >
                          📋
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                      {c.pagePath || '—'}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-medium capitalize">
                        {c.deviceCategory === 'mobile' ? '📱 Mobile' : c.deviceCategory === 'tablet' ? '📟 Tablet' : '💻 Desktop'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {c.posthogDistinctId ? (
                        <a
                          href={`https://us.i.posthog.com/project/events?distinct_id=${encodeURIComponent(c.posthogDistinctId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                          title={`View PostHog session for distinct_id: ${c.posthogDistinctId}`}
                        >
                          <span>🦔</span>
                          <span>Session</span>
                        </a>
                      ) : (
                        <span className="text-gray-300 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {clicks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-semibold text-gray-600">No hotel clicks found</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Clicks will appear here in real-time as users click outbound hotel booking links. You can also sync existing edge clicks using &ldquo;Sync Edge Clicks&rdquo;.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Page <span className="font-bold text-gray-900">{page}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Leaderboards: Top Hotels & Top Cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Top Converting Hotels</h3>
          <p className="text-xs text-gray-500 mb-4">Properties driving the highest outbound affiliate clicks.</p>

          <div className="space-y-2.5">
            {summary.topHotels.map((h, i) => (
              <div key={`${h.hotelName}-${i}`} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate">{h.hotelName}</div>
                    <div className="text-[10px] text-gray-400 truncate">{h.cityName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getProviderBadge(h.provider)}
                  <span className="font-black text-gray-900">{h.count} clicks</span>
                </div>
              </div>
            ))}

            {summary.topHotels.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-6">No top hotels data yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Top Destinations</h3>
          <p className="text-xs text-gray-500 mb-4">Cities with highest outbound traveler interest.</p>

          <div className="space-y-2.5">
            {summary.topCities.map((c, i) => (
              <div key={`${c.cityName}-${i}`} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-bold text-gray-900">{c.cityName || 'Unknown'}</span>
                </div>
                <span className="font-black text-gray-900">{c.count} clicks</span>
              </div>
            ))}

            {summary.topCities.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-6">No top cities data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
