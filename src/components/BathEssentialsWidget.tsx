'use client';

import OutboundLink from '@/components/OutboundLink';

const ESSENTIALS = [
  {
    name: 'Bamboo Luxury Bathtub Caddy Tray',
    tag: 'Bestseller',
    description: 'Extendable waterproof bamboo tray with wine glass holder, phone slot & candle stand for couple bath nights.',
    price: '₹1,499',
    rating: '4.8 ★',
    url: 'https://www.amazon.in/dp/B08X4N9XYZ?tag=hotelswithbathtubs-21',
    source: 'EarnKaro'
  },
  {
    name: 'Luxury Aromatherapy Bath Salts & Crystals',
    tag: 'Spa Grade',
    description: 'Infused with lavender, Epsom salt, and pure rose essential oils for deep muscular relaxation.',
    price: '₹799',
    rating: '4.9 ★',
    url: 'https://www.nykaa.com/forest-essentials-bath-salts?tag=hotelswithbathtubs-21',
    source: 'EarnKaro'
  },
  {
    name: 'Organic Lush Bath Bombs Gift Box (Set of 6)',
    tag: 'Romantic Fav',
    description: 'Handmade fizzy bubble bath bombs with moisturizing shea butter, jasmine & vanilla aroma.',
    price: '₹649',
    rating: '4.7 ★',
    url: 'https://www.amazon.in/dp/B07Y8M7KLN?tag=hotelswithbathtubs-21',
    source: 'EarnKaro'
  },
  {
    name: 'Flameless Waterproof Floating LED Candles',
    tag: 'Atmosphere',
    description: 'Warm ambient glow tea lights that float safely in warm tub water for romantic date night ambiance.',
    price: '₹499',
    rating: '4.6 ★',
    url: 'https://www.amazon.in/dp/B08P5Q9M7K?tag=hotelswithbathtubs-21',
    source: 'EarnKaro'
  }
];

export default function BathEssentialsWidget() {
  return (
    <div className="my-12 p-6 sm:p-8 bg-gradient-to-br from-amber-50/40 via-white to-rose-50/30 border border-amber-200/80 rounded-3xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-100">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
            Curated Couple Amenities
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mt-2">
            Elevate Your Jacuzzi &amp; Bath Suite Experience
          </h3>
        </div>
        <div className="text-xs text-text-muted">
          Handpicked for Romantic Anniversaries &amp; Honeymoons
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ESSENTIALS.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-2xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  {item.tag}
                </span>
                <span className="text-xs font-semibold text-emerald-700">{item.rating}</span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1 leading-snug">{item.name}</h4>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>
            
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-gray-900">{item.price}</span>
              <OutboundLink
                href={item.url}
                hotelName={item.name}
                source={item.source}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                View Deal →
              </OutboundLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
