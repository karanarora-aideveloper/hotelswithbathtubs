export default function CityLoading() {
  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero Header Skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-pulse">
          <div className="h-6 w-48 bg-white/20 rounded-full mb-4" />
          <div className="h-10 sm:h-14 w-3/4 max-w-xl bg-white/20 rounded-2xl mb-4" />
          <div className="h-4 w-1/2 max-w-md bg-white/10 rounded-lg mb-8" />
          <div className="flex items-center gap-2 text-amber-300">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">Loading Verified Bathtub Stays...</span>
          </div>
        </div>
      </div>

      {/* Hotel Cards Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-pulse flex flex-col">
              <div className="aspect-[16/10] bg-gray-200 w-full" />
              <div className="p-6 flex flex-col flex-grow">
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded-xl w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
