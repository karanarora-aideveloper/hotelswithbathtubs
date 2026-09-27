'use client';

import { useState } from 'react';

export default function AdminScrapersPage() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [ota, setOta] = useState('mmt_uc.py');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  const runScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    // Check if running on Vercel
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      alert("WARNING: The scraper engine requires a headless Chrome browser and cannot run on Vercel. Please run 'npm run dev' locally to execute this script.");
      return;
    }

    setLoading(true);
    setError('');
    setLogs([`> Starting ${ota} for ${city}...`]);

    try {
      const res = await fetch('/api/admin/scrapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, country, scriptName: ota }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!res.ok) {
        throw new Error('Failed to start scraper');
      }

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const textChunk = decoder.decode(value);
          setLogs(prev => [...prev, textChunk]);
        }
      }
      setLogs(prev => [...prev, `> Task Completed.`]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while running the scraper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Web Scrapers Engine</h1>
        <p className="text-gray-500 mt-2">Trigger Python-based automation scripts to find and validate new hotels.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 text-sm px-4 py-2 rounded-lg border border-yellow-200">
          <span className="font-bold">Notice:</span> Scrapers can only be executed when this admin panel is running on your local machine.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">Run Scraper</h3>
          <form onSubmit={runScraper} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target City</label>
              <input 
                type="text" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
                placeholder="e.g. New Delhi"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Country</label>
              <input 
                type="text" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
                placeholder="e.g. India"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select OTA</label>
              <select 
                value={ota}
                onChange={(e) => setOta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all bg-white"
                disabled={loading}
              >
                <option value="mmt_uc.py">MakeMyTrip (undetected-chromedriver)</option>
                <option value="agoda_uc.py">Agoda (undetected-chromedriver)</option>
                <option value="booking_uc.py">Booking.com (undetected-chromedriver)</option>
              </select>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex justify-center items-center"
              >
                {loading ? 'Running...' : 'Execute Script'}
              </button>
            </div>
            {error && <p className="text-red-600 text-sm font-medium mt-2">{error}</p>}
          </form>
        </div>

        {/* Live Terminal Output */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 flex flex-col h-[500px]">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
            <span className="text-gray-300 font-mono text-sm">Terminal Output</span>
            {loading && <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>}
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-green-400 whitespace-pre-wrap">
            {logs.length === 0 ? (
              <span className="text-gray-500">Awaiting execution...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
