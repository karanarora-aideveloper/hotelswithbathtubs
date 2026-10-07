import { Metadata } from 'next';
import DreamSoakMatchmaker from '@/components/DreamSoakMatchmaker';
import StructuredData from '@/components/StructuredData';
import Link from 'next/link';

export const revalidate = false;

export const metadata: Metadata = {
  title: {
    absolute: 'Dream Soak Matchmaker — Find Hotels with Bathtub & Jacuzzi in Room (2026)',
  },
  description:
    'Find your perfect hotel with bathtub in room or private jacuzzi suite in 30 seconds. Interactive matchmaker for romantic anniversaries, honeymoons, and cozy escapes across 118 countries.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/matchmaker',
  },
  openGraph: {
    title: 'Dream Soak Matchmaker — Find Hotels with Bathtub & Jacuzzi in Room',
    description:
      'Take our 30-second Dream Soak Matchmaker quiz to discover verified hotels with private in-room bathtubs, outdoor jacuzzis, and onsen tubs worldwide.',
    url: 'https://www.hotelswithbathtubs.com/matchmaker',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Dream Soak Matchmaker - Interactive Bathtub Hotel Finder',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dream Soak Matchmaker — Find Hotels with Bathtub & Jacuzzi in Room',
    description:
      'Take our 30-second Dream Soak Matchmaker quiz to discover verified hotels with private in-room bathtubs, outdoor jacuzzis, and onsen tubs worldwide.',
    images: [
      'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
    ],
  },
};

export default function MatchmakerPage() {
  const applicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Dream Soak Matchmaker',
    url: 'https://www.hotelswithbathtubs.com/matchmaker',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'All',
    description:
      'Interactive hotel finder matching travelers to verified hotel rooms with private bathtubs and jacuzzi suites based on romantic vibe, tub style, destination, and budget.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.hotelswithbathtubs.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dream Soak Matchmaker',
        item: 'https://www.hotelswithbathtubs.com/matchmaker',
      },
    ],
  };

  return (
    <StructuredData data={applicationSchema}>
      <StructuredData data={breadcrumbSchema}>
        <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
          {/* Breadcrumb Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#1a6fde] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Dream Soak Matchmaker</span>
            </nav>
          </div>

          {/* Interactive Matchmaker Client */}
          <DreamSoakMatchmaker embedded={false} />

          {/* Why Use the Matchmaker Section */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-200">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 text-center mb-8">
              Why Couples Love the Dream Soak Matchmaker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-3xl mb-3 block">🎯</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">Zero Guesswork</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We don’t just show hotels that have a tub somewhere on the property. Every match guarantees the bathtub or jacuzzi is inside your private room.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-3xl mb-3 block">💌</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">Share Directly with Partner</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Found top contenders? Tap &quot;Share with Partner&quot; to send a pre-filled WhatsApp or iMessage link with your exact matched choices.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-3xl mb-3 block">🛡️</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">Triple-Platform Verified</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Cross-checked against Booking.com, Agoda, and MakeMyTrip room specifications. You always book the right room tier with 100% confidence.
                </p>
              </div>
            </div>
          </section>

          {/* Long-tail SEO FAQs */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  How does the Dream Soak Matchmaker score hotels?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Our algorithm analyzes room-level bathtub metadata (hydro whirlpools, clawfoot tubs, deep soaking baths, cedar onsens), verified room tiers, traveler review sentiment, and location ambiance to return the highest-scoring properties for your specific fantasy.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  Can I book directly through the matchmaker?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Yes. Each matched card includes direct links to official booking partners (Booking.com, Agoda, MakeMyTrip) pre-filtered to the verified hotel listing, or you can explore the hotel’s full photo gallery and room tier guide right here.
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  Are the bathtubs private to the room?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Yes, 100%. We exclude shared spas, communal swimming pools, and public hotel wellness centers. Only hotels with private in-room bathtubs or private balcony tubs are included in our directory.
                </p>
              </div>
            </div>
          </section>
        </main>
      </StructuredData>
    </StructuredData>
  );
}
