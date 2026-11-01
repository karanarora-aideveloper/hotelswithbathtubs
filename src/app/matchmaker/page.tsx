import { Metadata } from 'next';
import DreamSoakMatchmaker from '@/components/DreamSoakMatchmaker';
import StructuredData from '@/components/StructuredData';
import Link from 'next/link';

export const revalidate = false;

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: {
    absolute: `Bathtub Hotel Matchmaker: Find Your Perfect Soak (${currentYear})`,
  },
  description:
    'Find your ideal hotel room with a private bathtub or jacuzzi suite in 30 seconds. Matchmaker for romantic getaways, honeymoons, and cozy escapes.',
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com/matchmaker',
  },
  openGraph: {
    title: `Bathtub Hotel Matchmaker: Find Your Perfect Soak (${currentYear})`,
    description:
      'Take our 30-second Dream Soak Matchmaker quiz to discover hotels with private in-room bathtubs, outdoor jacuzzis, and onsen tubs worldwide.',
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
    title: `Bathtub Hotel Matchmaker: Find Your Perfect Soak (${currentYear})`,
    description:
      'Take our 30-second Dream Soak Matchmaker quiz to discover hotels with private in-room bathtubs, outdoor jacuzzis, and onsen tubs worldwide.',
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
      'Interactive hotel finder matching travelers to hotel rooms with private bathtubs and jacuzzi suites based on trip style, tub type, and destination.',
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
        <main className="min-h-screen bg-[#fafbfc] py-6 sm:py-10">
          {/* Breadcrumb Navigation */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5b6478] font-manrope">
              <Link href="/" prefetch={false} className="hover:text-[#14213d] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#14213d] font-semibold">Dream Soak Matchmaker</span>
            </nav>
          </div>

          {/* Interactive Matchmaker Client */}
          <DreamSoakMatchmaker embedded={false} />

          {/* Why Use the Matchmaker Section */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 mt-8 border-t border-[#e3e7ef]">
            <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-[#14213d] text-center mb-6">
              Why Travelers Use the Bathtub Matchmaker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-white p-5 rounded-[14px] border border-[#e3e7ef] shadow-xs">
                <span className="text-2xl mb-2.5 block">🎯</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1.5">Direct Room Matching</h3>
                <p className="text-xs text-[#5b6478] font-manrope leading-relaxed">
                  We focus exclusively on private tubs. Every match corresponds to a hotel room with an in-room or private terrace bathtub.
                </p>
              </div>

              <div className="bg-white p-5 rounded-[14px] border border-[#e3e7ef] shadow-xs">
                <span className="text-2xl mb-2.5 block">💌</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1.5">Share with Travel Partner</h3>
                <p className="text-xs text-[#5b6478] font-manrope leading-relaxed">
                  Found matching stays? Tap &quot;Share matches&quot; to copy a shareable link with your exact matched choices.
                </p>
              </div>

              <div className="bg-white p-5 rounded-[14px] border border-[#e3e7ef] shadow-xs">
                <span className="text-2xl mb-2.5 block">🛡️</span>
                <h3 className="font-playfair font-semibold text-[#14213d] text-base mb-1.5">Partner Room Details</h3>
                <p className="text-xs text-[#5b6478] font-manrope leading-relaxed">
                  Matched against room details on booking partner listings so you can review tub descriptions before you book.
                </p>
              </div>
            </div>
          </section>

          {/* Long-tail SEO FAQs */}
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 mb-10">
            <h3 className="font-playfair text-lg sm:text-xl font-semibold text-[#14213d] mb-5 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-[#e3e7ef]">
                <h4 className="font-semibold text-[#14213d] text-sm mb-1 font-manrope">
                  How does the Dream Soak Matchmaker score hotels?
                </h4>
                <p className="text-xs text-[#5b6478] leading-relaxed font-manrope">
                  Our algorithm analyzes room-level bathtub metadata (hydro whirlpools, clawfoot tubs, deep soaking baths, cedar onsens), room tiers, and destination to return matching properties for your specific trip.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-[#e3e7ef]">
                <h4 className="font-semibold text-[#14213d] text-sm mb-1 font-manrope">
                  Can I book directly through the matchmaker?
                </h4>
                <p className="text-xs text-[#5b6478] leading-relaxed font-manrope">
                  Each matched card includes direct links to official booking partners (Booking.com, Agoda, MakeMyTrip) pre-filtered to the hotel listing, or you can explore the hotel details and room tier guide right here.
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-[12px] border border-[#e3e7ef]">
                <h4 className="font-semibold text-[#14213d] text-sm mb-1 font-manrope">
                  Are the bathtubs private to the room?
                </h4>
                <p className="text-xs text-[#5b6478] leading-relaxed font-manrope">
                  We focus on private bathtubs. We exclude shared spas, communal swimming pools, and public hotel wellness centers. Only hotels with private in-room bathtubs or private balcony tubs are included in our directory.
                </p>
              </div>
            </div>
          </section>
        </main>
      </StructuredData>
    </StructuredData>
  );
}
