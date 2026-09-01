'use client';

import { useState } from 'react';

export default function AdminSeoAuditPage() {
  const [url, setUrl] = useState('https://www.hotelswithbathtubs.com');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setReport('');

    try {
      const res = await fetch('/api/admin/seo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to run audit');
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SEO Technical Audit</h1>
        <p className="text-gray-500 mt-2">Enter any URL from your platform to generate an instant SEO gap analysis using DeepSeek AI.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <form onSubmit={runAudit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target URL</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
              placeholder="https://www.hotelswithbathtubs.com/india/goa"
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white px-8 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-[42px]"
            >
              {loading ? 'Analyzing...' : 'Run Audit'}
            </button>
          </div>
        </form>
        {error && <p className="text-red-600 text-sm font-medium mt-4 bg-red-50 p-3 rounded-lg">{error}</p>}
      </div>

      {report && (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex justify-between items-center">
            <span className="text-gray-300 font-mono text-sm font-bold">DeepSeek Auditor Report</span>
          </div>
          <div className="p-6 overflow-y-auto font-mono text-sm text-green-400 whitespace-pre-wrap leading-relaxed max-h-[600px]">
            {report}
          </div>
        </div>
      )}
    </div>
  );
}
