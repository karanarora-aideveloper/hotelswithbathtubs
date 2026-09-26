'use client';

import { useState } from 'react';

type ReportWrongDataProps = {
  hotelName: string;
  hotelId?: string;
  cityName: string;
};

const ISSUES = [
  'Tub not available in this room',
  'Tub type is wrong (e.g. says Jacuzzi but is just a bathtub)',
  'Hotel no longer offers bathtub rooms',
  'Photos are outdated / misleading',
  'Price is very different from actual',
  'Hotel is permanently closed',
  'Other',
];

export default function ReportWrongData({ hotelName, hotelId, cityName }: ReportWrongDataProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = (issue: string) => {
    setSelected((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await fetch('/api/report-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelName,
          hotelId,
          cityName,
          issues: selected,
          reportedAt: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Silently continue — non-critical
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <button
        disabled
        className="text-2xs text-emerald-600 font-semibold flex items-center gap-1"
      >
        ✅ Thanks for the report!
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-2xs text-text-muted hover:text-red-500 flex items-center gap-1 transition-colors"
        title="Report incorrect bathtub information"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Report wrong data
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div className="absolute bottom-7 left-0 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-72">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-gray-900">Report an Issue</p>
                <p className="text-2xs text-text-muted">{hotelName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-gray-900 text-sm"
              >✕</button>
            </div>
            <p className="text-2xs text-text-muted mb-2">What's wrong? (select all that apply)</p>
            <div className="space-y-1.5 mb-4">
              {ISSUES.map((issue) => (
                <label key={issue} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selected.includes(issue)}
                    onChange={() => handleToggle(issue)}
                    className="rounded text-accent accent-accent w-3.5 h-3.5"
                  />
                  <span className="text-2xs text-gray-700 group-hover:text-gray-900">
                    {issue}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={selected.length === 0 || submitting}
              className="w-full py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {submitting ? 'Sending…' : 'Send Report'}
            </button>
            <p className="text-2xs text-text-muted mt-2 text-center">
              Helps us maintain verified data 🛁
            </p>
          </div>
        </>
      )}
    </div>
  );
}
