'use client';

export default function ExcludeTrafficButton() {
  return (
    <button 
      onClick={(e) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ignore_ga', 'true');
          (e.target as HTMLButtonElement).innerText = 'Traffic Excluded ✅';
          (e.target as HTMLButtonElement).classList.add('bg-green-50', 'text-green-700', 'border-green-200');
        }
      }}
      className="w-full text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      Exclude My Traffic from GA4
    </button>
  );
}
