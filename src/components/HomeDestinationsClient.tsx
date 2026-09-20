'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CityCard from '@/components/CityCard';
import { useGeo } from '@/lib/useGeo';

type CityItem = {
  _id: { city: string; country: string };
  hotelCount: number;
  image: string;
};

interface HomeDestinationsClientProps {
  usaCities: CityItem[];
  internationalCities: CityItem[];
  indiaCities: CityItem[];
}

export default function HomeDestinationsClient({
  usaCities,
  internationalCities,
  indiaCities,
}: HomeDestinationsClientProps) {
  const { geo } = useGeo();
  const [selectedTab, setSelectedTab] = useState<'auto' | 'usa' | 'india' | 'global' | 'all'>('auto');

  // Load any manual user preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hwb_region_tab');
      if (saved && ['auto', 'usa', 'india', 'global', 'all'].includes(saved)) {
        setSelectedTab(saved as any);
      }
    } catch (_) {}
  }, []);

  const handleTabChange = (tab: 'auto' | 'usa' | 'india' | 'global' | 'all') => {
    setSelectedTab(tab);
    try {
      localStorage.setItem('hwb_region_tab', tab);
    } catch (_) {}
  };

  // Determine section ordering based on geo: India-first for India visitors; US-first for everyone else
  const isIndiaVisitor = geo.isIndia;

  const renderUSASection = () => (
    usaCities.length > 0 && (
      <div id="section-usa" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-200 pb-4 gap-3">
          <div>
            <Link href="/usa" className="group inline-flex items-center gap-2 hover:text-accent transition-colors">
              <span className="text-xl">🇺🇸</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary group-hover:text-accent transition-colors">
                United States Luxury Escapes
              </h2>
            </Link>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Premier American city stays and romantic getaways featuring verified in-room jacuzzis &amp; deep soaking tubs
            </p>
          </div>
          <Link
            href="/usa"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 hover:bg-accent hover:text-white text-accent font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap transition-all self-start sm:self-auto group shadow-2xs"
          >
            <span>Explore All {usaCities.length} US Destinations</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {usaCities.map((item, idx) => (
            <CityCard
              key={`${item._id.city}-${item._id.country}`}
              city={item._id.city}
              country={item._id.country}
              hotelCount={item.hotelCount}
              image={item.image}
              isInternational={true}
              priority={idx < 4}
            />
          ))}
        </div>
      </div>
    )
  );

  const renderInternationalSection = () => (
    internationalCities.length > 0 && (
      <div id="section-global" className="scroll-mt-32">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌍</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary">
                Global Romantic Escapes
              </h2>
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              World-class luxury destinations in Europe, Asia &amp; the Middle East with verified private tubs
            </p>
          </div>
          <span className="px-3 py-1 bg-accent-secondary/10 text-accent-secondary font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap">
            {internationalCities.length} Global Cities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {internationalCities.map((item, idx) => (
            <CityCard
              key={`${item._id.city}-${item._id.country}`}
              city={item._id.city}
              country={item._id.country}
              hotelCount={item.hotelCount}
              image={item.image}
              isInternational={true}
              priority={idx < 4}
            />
          ))}

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="font-heading text-base font-bold text-accent-secondary mb-1">More Cities Coming Soon</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-3">Continuously adding verified boutique stays across Europe &amp; Asia.</p>
            <span className="text-2xs font-semibold text-accent uppercase tracking-wider">Audited Weekly</span>
          </div>
        </div>
      </div>
    )
  );

  const renderIndiaSection = () => (
    indiaCities.length > 0 && (
      <div id="section-india" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-200 pb-4 gap-3">
          <div>
            <Link href="/india" className="group inline-flex items-center gap-2 hover:text-accent transition-colors">
              <span className="text-xl">🇮🇳</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-accent-secondary group-hover:text-accent transition-colors">
                India Getaways
              </h2>
            </Link>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Top romantic destinations across India featuring verified private jacuzzi suites &amp; in-room soaking tubs
            </p>
          </div>
          <Link
            href="/india"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 hover:bg-accent hover:text-white text-accent font-semibold text-xs sm:text-sm rounded-full whitespace-nowrap transition-all self-start sm:self-auto group shadow-2xs"
          >
            <span>Explore All {indiaCities.length} Indian Cities</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {indiaCities.map((item, idx) => (
            <CityCard
              key={`${item._id.city}-${item._id.country}`}
              city={item._id.city}
              country={item._id.country}
              hotelCount={item.hotelCount}
              image={item.image}
              priority={idx < 4}
            />
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-10">
      {/* Interactive Region Selection Bar */}
      <div className="bg-gray-50/90 border border-border rounded-2xl p-2.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs w-full min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full min-w-0 pb-1 md:pb-0">
          <button
            onClick={() => handleTabChange('auto')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedTab === 'auto'
                ? 'bg-accent-secondary text-white shadow-sm'
                : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>📍 For You</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedTab === 'auto' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {isIndiaVisitor ? '🇮🇳 India' : '🇺🇸 USA'}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('usa')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedTab === 'usa'
                ? 'bg-accent-secondary text-white shadow-sm'
                : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>🇺🇸 United States</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedTab === 'usa' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {usaCities.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('india')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedTab === 'india'
                ? 'bg-accent-secondary text-white shadow-sm'
                : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>🇮🇳 India</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedTab === 'india' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {indiaCities.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('global')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedTab === 'global'
                ? 'bg-accent-secondary text-white shadow-sm'
                : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>🌍 Global</span>
            <span className={`px-1.5 py-0.5 rounded-full text-2xs ${selectedTab === 'global' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {internationalCities.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedTab === 'all'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-white text-text-main border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <span>✨ View All</span>
          </button>
        </div>

        {/* Region detection prompt */}
        <div className="text-2xs text-text-muted font-medium flex items-center gap-1.5 self-start md:self-auto ml-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            Detected: <strong>{geo.country}</strong> {isIndiaVisitor ? '(🇮🇳 India layout active)' : '(🇺🇸 USA layout active)'}
          </span>
        </div>
      </div>

      {/* Render based on selected tab */}
      {selectedTab === 'usa' && renderUSASection()}
      {selectedTab === 'india' && renderIndiaSection()}
      {selectedTab === 'global' && renderInternationalSection()}

      {/* Auto or All: Render in geo-prioritized order */}
      {(selectedTab === 'auto' || selectedTab === 'all') && (
        <div className="space-y-16">
          {isIndiaVisitor ? (
            <>
              {renderIndiaSection()}
              {renderUSASection()}
              {renderInternationalSection()}
            </>
          ) : (
            <>
              {renderUSASection()}
              {renderInternationalSection()}
              {renderIndiaSection()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
