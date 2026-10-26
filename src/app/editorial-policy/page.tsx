import { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Editorial Policy & Verification Standards',
  description: 'Learn about our hotel verification process, editorial independence, and how we check and list authentic in-room bathtubs & jacuzzi suites.',
  alternates: {
    canonical: '/editorial-policy',
  },
  openGraph: {
    title: 'Editorial Policy & Verification Standards | Hotels With Bathtubs',
    description: 'Learn about our hotel verification process, editorial independence, and how we check and list authentic in-room bathtubs & jacuzzi suites.',
    url: 'https://www.hotelswithbathtubs.com/editorial-policy',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Editorial Policy & Verification Standards - Hotels With Bathtubs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editorial Policy & Verification Standards | Hotels With Bathtubs',
    description: 'Learn about our hotel verification process, editorial independence, and how we check and list authentic in-room bathtubs & jacuzzi suites.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

export default function EditorialPolicyPage() {
  const editorialSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Editorial Policy & Verification Standards",
    "description": "Our editorial standards, verification methodology, and affiliate disclosure policies.",
    "url": "https://www.hotelswithbathtubs.com/editorial-policy",
    "publisher": {
      "@type": "Organization",
      "name": "Hotels With Bathtubs",
      "url": "https://www.hotelswithbathtubs.com"
    }
  };

  return (
    <>
      <StructuredData data={editorialSchema} />

      <div className="bg-[#f8fafc] py-8 sm:py-16 md:py-20 min-h-[80vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-3xl shadow-sm border-y sm:border border-gray-200 pb-12 pt-8 sm:pb-16 sm:pt-12 font-jakarta">
          <header className="mb-10 sm:mb-12 border-b border-gray-100 pb-8 text-center">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-3 border border-emerald-100">
              Trust &amp; Verification Standards
            </span>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Our Editorial &amp; Verification Policy
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              How we inspect, verify, and maintain the web&apos;s most accurate directory of hotels with private in-room bathtubs, deep soaking tubs, and jacuzzi suites.
            </p>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                1. The Problem We Solve
              </h2>
              <p>
                Online travel agencies and hotel search engines frequently suffer from misleading bathroom photography. Travelers routinely book hotel rooms advertised with &ldquo;spa bath&rdquo; or &ldquo;bathtub&rdquo; imagery, only to arrive and discover:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 mt-2">
                <li>The bathtub was located in a communal hotel spa or wellness floor, not in their private room.</li>
                <li>The bathtub was only available in an ultra-premium presidential penthouse, while their booked tier had a standard shower stall.</li>
                <li>The hotel underwent bathroom renovations and replaced traditional tubs with walk-in showers without updating OTA photos.</li>
              </ul>
              <p className="mt-3">
                HotelsWithBathtubs was founded to provide transparent room-tier information.
              </p>
            </section>

            <section className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-gray-200">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                2. How We Check Rooms
              </h2>
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a6fde] text-white flex items-center justify-center text-xs">1</span>
                    Room-Tier Inventory Cross-Referencing
                  </h3>
                  <p className="text-gray-600">
                    We check room specifications across Booking.com, Agoda, MakeMyTrip, and partner inventory networks. We identify the specific room tier (such as &ldquo;Executive Suite with Bathtub&rdquo;) where the in-room tub is listed, and guide users to select that tier.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a6fde] text-white flex items-center justify-center text-xs">2</span>
                    Photographic &amp; Listing Details
                  </h3>
                  <p className="text-gray-600">
                    Property listings are checked against partner photos and room details to confirm that the bathtub or jacuzzi is private to that guest room.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a6fde] text-white flex items-center justify-center text-xs">3</span>
                    Regular Link &amp; Inventory Updates
                  </h3>
                  <p className="text-gray-600">
                    Hotels continually update their room layouts. Our pipeline monitors link integrity, partner availability, and user feedback to update outdated listings and remove properties that replace bathtubs with showers.
                  </p>
                </div>
              </div>

              {/* Visual Methodology Walkthrough Card */}
              <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl text-white">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <span>ℹ️</span>
                  <span className="uppercase tracking-wider">Listing Details</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold mb-2">
                  Room Details &amp; Checkouts
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  We look at partner listings to confirm room tier names, bathtub types, and partner booking links before adding a property to our directory.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <strong className="block text-white mb-1">01. Room Category</strong>
                    <span className="text-gray-300">Matching property rate codes to tub categories.</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <strong className="block text-white mb-1">02. Private Room</strong>
                    <span className="text-gray-300">Confirming in-room tubs rather than shared spa pools.</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <strong className="block text-white mb-1">03. Regular Updates</strong>
                    <span className="text-gray-300">Monitoring link availability across partner sites.</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                3. Editorial Independence
              </h2>
              <p>
                <strong>Hotels cannot pay to be listed or favorably ranked on HotelsWithBathtubs.com.</strong>
              </p>
              <p className="mt-2">
                Our property recommendations and sort orders are determined solely by:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600 mt-2">
                <li>Bathtub quality, tub dimensions, and room aesthetics (clawfoot, whirlpool, freestanding, mountain/ocean view)</li>
                <li>Aggregated guest satisfaction scores across traveler review platforms</li>
                <li>Value for money, neighborhood convenience, and romance factor</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                4. Affiliate Transparency &amp; Compensation
              </h2>
              <p>
                HotelsWithBathtubs is free for readers. To support our extensive research and database infrastructure, we participate in affiliate marketing programs with verified online travel agencies, including Booking.com, Agoda, MakeMyTrip, and trusted global partner networks.
              </p>
              <p className="mt-2">
                When you click through our partner links and complete a booking, we may earn an affiliate commission at <strong>zero additional cost to you</strong>. Our editorial curation remains entirely impartial: we recommend the best stay regardless of partner commission rates.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                5. Correction Requests &amp; Feedback
              </h2>
              <p>
                We hold our data to the highest accuracy standards. If you discover an amenity change, renovated bathroom, or broken partner link, please email our editorial desk at{' '}
                <a href="mailto:editorial@hotelswithbathtubs.com" className="text-[#1a6fde] font-semibold hover:underline">
                  editorial@hotelswithbathtubs.com
                </a>
                . All submissions are investigated and updated within 48 business hours.
              </p>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-gray-100 text-xs">
              <span className="text-gray-400">
                Last Updated: October 2026 · HotelsWithBathtubs Editorial Standards
              </span>
              <div className="flex items-center gap-4 text-[#1a6fde] font-semibold">
                <Link href="/about" className="hover:underline">About Us</Link>
                <span>&bull;</span>
                <Link href="/contact" className="hover:underline">Contact Desk</Link>
                <span>&bull;</span>
                <Link href="/affiliate-policy" className="hover:underline">Affiliate Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
