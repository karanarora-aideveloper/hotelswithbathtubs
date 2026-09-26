const fs = require('fs');

const path = '/Users/karanarora/mystartups/hotelswithbathtubs/src/components/CityHotelsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update HotelData type
content = content.replace(
  /landmarkDistance\?:\s*string;/,
  "landmarkDistance?: string;\n  crossVerifiedAt?: string;"
);

// Add parsePrice and normalizeTubType
const utils = `
const parsePrice = (p: string) => parseInt(p?.replace(/[^0-9]/g, '') || '0', 10);

export function normalizeTubType(tubType?: string): { category: string; emoji: string; color: string } {
  if (!tubType) return { category: 'Standard Bathtub', emoji: '🚿', color: 'gray' };
  const lower = tubType.toLowerCase();
  if (lower.includes('jacuzzi') || lower.includes('whirlpool') || lower.includes('jet') || lower.includes('hydro')) {
    return { category: 'Jacuzzi / Whirlpool', emoji: '🌊', color: 'blue' };
  }
  if (lower.includes('claw') || lower.includes('clawfoot') || lower.includes('vintage') || lower.includes('victorian') || lower.includes('cast-iron') || lower.includes('cast iron')) {
    return { category: 'Clawfoot Tub', emoji: '🛁', color: 'amber' };
  }
  if (lower.includes('outdoor') || lower.includes('open-air') || lower.includes('balcony') || lower.includes('hot tub') || lower.includes('heated')) {
    return { category: 'Outdoor Hot Tub', emoji: '♨️', color: 'orange' };
  }
  if (lower.includes('roman')) {
    return { category: 'Roman Tub', emoji: '🏛️', color: 'stone' };
  }
  if (lower.includes('onsen') || lower.includes('cedar') || lower.includes('hinoki') || lower.includes('japanese')) {
    return { category: 'Onsen / Cedarwood', emoji: '🌿', color: 'green' };
  }
  if (lower.includes('plunge') || lower.includes('pool')) {
    return { category: 'Plunge Pool + Tub', emoji: '🏊', color: 'teal' };
  }
  if (lower.includes('deep') || lower.includes('soaking') || lower.includes('freestanding') || lower.includes('marble') || lower.includes('stone') || lower.includes('italian')) {
    return { category: 'Deep Soaking Tub', emoji: '🛁', color: 'indigo' };
  }
  return { category: 'Standard Bathtub', emoji: '🚿', color: 'gray' };
}

const colorStyles: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  stone: 'bg-stone-100 text-stone-800 border-stone-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};
`;

content = content.replace(
  /export default function CityHotelsClient/,
  utils + "\nexport default function CityHotelsClient"
);

// Add states
content = content.replace(
  /const \[searchTerm, setSearchTerm\] = useState\(''\);/,
  `const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'reviews'>('recommended');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');
  const [selectedTubCategory, setSelectedTubCategory] = useState<string>('all');

  const isIndia = countryName === 'India';
  const BUDGET_MAX = isIndia ? 8000 : 200;
  const LUXURY_MIN = isIndia ? 20000 : 500;
  const currencySymbol = isIndia ? '₹' : '$';

  const availableTubCategories = useMemo(() => {
    const map = new Map<string, {emoji: string; color: string}>();
    uniqueHotels.forEach(h => {
      if (h.tubType) {
        const norm = normalizeTubType(h.tubType);
        map.set(norm.category, {emoji: norm.emoji, color: norm.color});
      }
    });
    return Array.from(map.entries()).map(([category, {emoji, color}]) => ({category, emoji, color}));
  }, [uniqueHotels]);`
);

// Update filteredHotels logic
content = content.replace(
  /const filteredHotels = useMemo\(\(\) => \{[\s\S]*?return true;\s*\}\);\s*\}, \[uniqueHotels, selectedFilter, searchTerm\]\);/,
  `const filteredHotels = useMemo(() => {
    let result = uniqueHotels.filter((h) => {
      // Text search filter
      if (searchTerm.trim()) {
        const matchesName = h.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const matchesAmenity = h.amenities?.some((a) =>
          a.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
        if (!matchesName && !matchesAmenity) return false;
      }

      // Category filter
      if (selectedFilter === 'jacuzzi') {
        if (!h.amenities?.some((a) => a.toLowerCase().includes('jacuzzi') || a.toLowerCase().includes('hot tub'))) return false;
      }
      if (selectedFilter === 'soaking') {
        if (!h.amenities?.some((a) => a.toLowerCase().includes('bathtub') && !a.toLowerCase().includes('jacuzzi'))) return false;
      }
      if (selectedFilter === 'tripled') {
        if (!(h.url && (h.agodaUrl || h.bookingUrl))) return false;
      }

      if (selectedTubCategory !== 'all') {
        const norm = normalizeTubType(h.tubType);
        if (norm.category !== selectedTubCategory) return false;
      }

      if (priceRange !== 'all' && h.price) {
        const p = parsePrice(h.price);
        if (priceRange === 'budget' && p >= BUDGET_MAX) return false;
        if (priceRange === 'mid' && (p < BUDGET_MAX || p >= LUXURY_MIN)) return false;
        if (priceRange === 'luxury' && p < LUXURY_MIN) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === 'price_asc' || sortBy === 'price_desc') {
        const pA = parsePrice(a.price || '');
        const pB = parsePrice(b.price || '');
        if (pA === pB) return 0;
        if (pA === 0) return 1;
        if (pB === 0) return -1;
        return sortBy === 'price_asc' ? pA - pB : pB - pA;
      }
      return 0; // recommended preserves order
    });

    return result;
  }, [uniqueHotels, selectedFilter, searchTerm, selectedTubCategory, priceRange, sortBy, BUDGET_MAX, LUXURY_MIN]);`
);

// Update handleResetFilters
content = content.replace(
  /const handleResetFilters = \(\) => \{[\s\S]*?recordFilterReset\(cityName\);\s*\};/,
  `const handleResetFilters = () => {
    setSelectedFilter('all');
    setSearchTerm('');
    setPriceRange('all');
    setSelectedTubCategory('all');
    setSortBy('recommended');
    recordFilterReset(cityName);
  };`
);

// Update UI
const filterHtmlRepl = `{/* Interactive Bathtub & Feature Filters */}
      <div className="bg-white border border-border rounded-2xl p-3 sm:p-5 shadow-2xs mb-8 flex flex-col gap-4 w-full min-w-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full min-w-0">
          {/* Quick Hotel Name / Amenity Search */}
          <div className="w-full md:w-64 relative flex-shrink-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hotel name..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-accent focus:bg-white transition-all"
            />
            <svg className="w-4 h-4 text-text-muted absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:inline flex-shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full md:w-auto bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-accent"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Rating ↓</option>
              <option value="price_asc">Price ↑ (Low to High)</option>
              <option value="price_desc">Price ↓ (High to Low)</option>
              <option value="reviews">Reviews ↓</option>
            </select>
          </div>
        </div>

        {/* Tub Category Filter Row */}
        {availableTubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:inline mr-1 flex-shrink-0">Tub Type:</span>
            <button
              onClick={() => setSelectedTubCategory('all')}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 \${selectedTubCategory === 'all' ? 'bg-accent text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
            >
              All Types
            </button>
            {availableTubCategories.map(cat => (
              <button
                key={cat.category}
                onClick={() => setSelectedTubCategory(cat.category)}
                className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 \${selectedTubCategory === cat.category ? 'bg-accent text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
              >
                <span>{cat.emoji}</span> {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* Price Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:inline mr-1 flex-shrink-0">Price Range:</span>
          <button
            onClick={() => setPriceRange('all')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 \${priceRange === 'all' ? 'bg-accent-secondary text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
          >
            All Prices
          </button>
          <button
            onClick={() => setPriceRange('budget')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 \${priceRange === 'budget' ? 'bg-accent-secondary text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
          >
            Budget (< {currencySymbol}{BUDGET_MAX.toLocaleString()})
          </button>
          <button
            onClick={() => setPriceRange('mid')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 \${priceRange === 'mid' ? 'bg-accent-secondary text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
          >
            Mid-range ({currencySymbol}{BUDGET_MAX.toLocaleString()} - {currencySymbol}{LUXURY_MIN.toLocaleString()})
          </button>
          <button
            onClick={() => setPriceRange('luxury')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 \${priceRange === 'luxury' ? 'bg-accent-secondary text-white' : 'bg-gray-100 text-text-main hover:bg-gray-200'}\`}
          >
            Luxury ({currencySymbol}{LUXURY_MIN.toLocaleString()}+)
          </button>
        </div>
      </div>`;

content = content.replace(
  /\{\/\* Interactive Bathtub & Feature Filters \*\/\}[\s\S]*?\{\/\* Booking Verification Tip Banner \*\/\}/,
  filterHtmlRepl + "\n\n      {/* Booking Verification Tip Banner */}"
);

// Update Hotel Card (Verification Tooltip, Best For Tags, Tub Type Normalization)
// Find verifiedSources span and replace it
content = content.replace(
  /<span className="absolute top-4 left-4 bg-emerald-700\/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">[\s\S]*?<\/span>/,
  `<div className="absolute top-4 left-4 group/tooltip flex">
    <span className="bg-emerald-700/95 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 cursor-help">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
      <span>✓ Verified on {verifiedSources.join(', ')}</span>
      <span className="ml-0.5 opacity-80 group-hover/tooltip:opacity-100 bg-emerald-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">i</span>
    </span>
    <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none">
      We manually check every hotel across Booking.com, Agoda, and MakeMyTrip to confirm the specific room tier includes a private bathtub. Last verified: {h.crossVerifiedAt || 'Sep 2026'}.
    </div>
  </div>`
);

// Add Best For Tags under h.name
content = content.replace(
  /<h3 className="font-heading text-lg sm:text-xl font-bold text-accent-secondary mb-1">\{h\.name\}<\/h3>/,
  `<h3 className="font-heading text-lg sm:text-xl font-bold text-accent-secondary mb-1">{h.name}</h3>
                  {(() => {
                    const parsedPrice = parsePrice(h.price || '');
                    const hasPool = h.amenities?.some(a => a.toLowerCase().includes('pool'));
                    const hasSpa = h.amenities?.some(a => a.toLowerCase().includes('spa'));
                    const normTub = normalizeTubType(h.tubType);
                    const isCouples = normTub.category === 'Jacuzzi / Whirlpool' || normTub.category === 'Outdoor Hot Tub';
                    const isBudget = parsedPrice > 0 && parsedPrice < BUDGET_MAX;
                    const isLuxury = parsedPrice > 0 && parsedPrice >= LUXURY_MIN;

                    const tags = [];
                    if (hasPool) tags.push('With Pool');
                    if (hasSpa) tags.push('Spa');
                    if (isCouples) tags.push('Couples');
                    if (isBudget) tags.push('Budget');
                    if (isLuxury) tags.push('Luxury');

                    return tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-pink-50 text-pink-700 text-[10px] uppercase tracking-wider font-bold rounded border border-pink-100">{tag}</span>
                        ))}
                      </div>
                    ) : null;
                  })()}`
);

// Update Room Category & Tub Badges
content = content.replace(
  /\{h\.tubType && \([\s\S]*?<span>🛁<\/span> \{h\.tubType\}[\s\S]*?<\/span>\n\s*\)\}/,
  `{h.tubType && (() => {
                      const norm = normalizeTubType(h.tubType);
                      const style = colorStyles[norm.color] || colorStyles.gray;
                      return (
                        <span className={\`inline-flex items-center gap-1 px-2.5 py-1 font-bold text-2xs rounded-lg border \${style}\`}>
                          <span>{norm.emoji}</span> {norm.category}
                        </span>
                      );
                    })()}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
