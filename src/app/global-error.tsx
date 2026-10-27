'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#FAF8F5] text-gray-900 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-[#1a6fde] rounded-2xl mx-auto flex items-center justify-center text-2xl mb-4">
            🛁
          </div>
          <h2 className="text-xl font-bold mb-2">Hotels With Bathtubs</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            We updated our inventory with fresh listings. Please refresh to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#1a6fde] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#1559b8] transition-all"
          >
            Refresh Now
          </button>
        </div>
      </body>
    </html>
  );
}
