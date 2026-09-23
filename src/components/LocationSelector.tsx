'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function titleCase(str: string) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Static top-level routes that are NOT /{country}/{city} pages — the
// selector shouldn't try to read a location out of these.
const NON_LOCATION_ROUTES = new Set(['blog', 'admin', 'affiliate-policy', 'api']);

// If the current URL already IS a /{country}/{city} page, that's the
// current location — no need to guess it from IP geolocation.
function locationFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 2 && !NON_LOCATION_ROUTES.has(segments[0])) {
    return { country: titleCase(segments[0]), city: titleCase(segments[1]) };
  }
  return null;
}

export default function LocationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [locations, setLocations] = useState<Record<string, string[]>>({});
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available locations
    fetch('/locations.json')
      .then((res) => (res.ok ? res.json() : fetch('/api/locations').then((r) => r.json())))
      .then(data => {
        if (!data.error) {
          setLocations(data);
        }
      })
      .catch(console.error);

    const urlLocation = locationFromPathname(pathname);
    if (urlLocation) {
      // Already on a city page — show that, not an IP guess.
      setSelectedCountry(urlLocation.country);
      setSelectedCity(urlLocation.city);
      setLoading(false);
      return;
    }

    // Not on a city page (e.g. homepage) — fall back to IP-based geo guess.
    fetch('/api/geo')
      .then(res => res.json())
      .then(data => {
        if (data.country) setSelectedCountry(data.country);
        if (data.city) setSelectedCity(data.city);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleCitySelect = (country: string, city: string) => {
    setIsOpen(false);
    setSelectedCountry(country);
    setSelectedCity(city);
    
    // Navigate to the dynamic route
    const countrySlug = country.toLowerCase().replace(/\s+/g, '-');
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${countrySlug}/${citySlug}`);
  };

  // On the homepage there's no "current city" — you're browsing all of
  // them — so a location picker showing a default/guessed city is
  // confusing rather than useful. Hide it there entirely.
  if (pathname === '/') return null;

  if (loading) return <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg hidden md:block"></div>;

  const currentDisplay = selectedCity 
    ? `${selectedCity}, ${selectedCountry}` 
    : 'Select Destination';

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 bg-gray-50 border border-gray-200 hover:border-accent hover:bg-white text-text-main px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-all shadow-sm"
      >
        <span>📍</span>
        <span className="max-w-[100px] md:max-w-[150px] truncate">{currentDisplay}</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 w-[280px] md:w-64 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto">
            {Object.keys(locations).length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No locations available</div>
            ) : (
              Object.entries(locations).map(([country, cities]) => (
                <div key={country}>
                  <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider sticky top-0">
                    {country}
                  </div>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(country, city)}
                      className="w-full text-left px-4 py-3 hover:bg-accent/10 hover:text-accent text-text-main transition-colors text-sm font-semibold border-b border-gray-100 last:border-0"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Invisible backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
