import { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Contact Us & Editorial Desk',
  description: 'Get in touch with the HotelsWithBathtubs editorial team. Submit hotel correction requests, partner inquiries, or report private in-room bathtub listings.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us & Editorial Desk | Hotels With Bathtubs',
    description: 'Get in touch with the HotelsWithBathtubs editorial team. Submit hotel correction requests, partner inquiries, or report private in-room bathtub listings.',
    url: 'https://www.hotelswithbathtubs.com/contact',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Hotels With Bathtubs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us & Editorial Desk | Hotels With Bathtubs',
    description: 'Get in touch with the HotelsWithBathtubs editorial team. Submit hotel correction requests, partner inquiries, or report private in-room bathtub listings.',
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Hotels With Bathtubs",
    "description": "Editorial contact desk for Hotels With Bathtubs.",
    "url": "https://www.hotelswithbathtubs.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "Hotels With Bathtubs",
      "url": "https://www.hotelswithbathtubs.com",
      "email": "editorial@hotelswithbathtubs.com",
      "founder": {
        "@type": "Person",
        "name": "Karan Arora",
        "jobTitle": "Founder & Travel Editor"
      }
    }
  };

  return (
    <>
      <StructuredData data={contactSchema} />

      <div className="bg-[#f8fafc] py-8 sm:py-16 md:py-20 min-h-[80vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-3xl shadow-sm border-y sm:border border-gray-200 pb-12 pt-8 sm:pb-16 sm:pt-12 font-jakarta">
          <header className="mb-10 sm:mb-12 border-b border-gray-100 pb-8 text-center">
            <span className="inline-block px-3 py-1 bg-sky-50 text-sky-800 text-xs font-bold rounded-full mb-3 border border-sky-100">
              Editorial &amp; Support Desk
            </span>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Get in Touch with Our Team
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Have a question about a bathtub suite, noticed a room renovation, or represent a hotel with private in-room soaking baths? We would love to hear from you.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 rounded-xl bg-[#1a6fde] text-white flex items-center justify-center font-bold text-lg mb-4">
                ✉
              </div>
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-1">
                Editorial Team
              </h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                For corrections, bathroom amenity changes, or reporting a hotel where the bathtub is no longer in-room.
              </p>
              <a
                href="mailto:editorial@hotelswithbathtubs.com"
                className="text-sm font-bold text-[#1a6fde] hover:underline break-all"
              >
                editorial@hotelswithbathtubs.com
              </a>
              <p className="text-[11px] text-gray-400 mt-2">
                Typical response time: 24–48 business hours
              </p>
            </div>

            <div className="bg-slate-50/80 p-6 rounded-2xl border border-gray-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                🏨
              </div>
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-1">
                Hoteliers &amp; Property Listings
              </h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                If you manage a hotel or resort with in-room bathtubs and want your property listed in our directory.
              </p>
              <a
                href="mailto:listings@hotelswithbathtubs.com"
                className="text-sm font-bold text-emerald-700 hover:underline break-all"
              >
                listings@hotelswithbathtubs.com
              </a>
              <p className="text-[11px] text-gray-400 mt-2">
                Listing submissions are free and editorially independent
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-8">
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-gray-900 mb-3">
                How to Request an Inventory Correction
              </h2>
              <p className="mb-2">
                Hotels occasionally renovate rooms, convert bathtubs into walk-in rain showers, or reclassify suites. If you discover that an advertised bathtub room tier has changed, please send us:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>The exact URL of the property on HotelsWithBathtubs.com</li>
                <li>The affected room tier name (e.g. &ldquo;Executive Jacuzzi Suite&rdquo;)</li>
                <li>Any supporting screenshots or booking confirmation details</li>
              </ul>
              <p className="mt-2">
                We will review the property details across our partner databases within 24 hours and update the listing accordingly.
              </p>
            </div>

            <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-amber-900">
              <h3 className="font-bold mb-1">Please Note (Guest Bookings &amp; Cancellations):</h3>
              <p>
                HotelsWithBathtubs.com is an independent editorial directory and does not process payments or reservations directly. If you have questions regarding dates, cancellations, or modifications to an existing reservation, please contact your booking provider directly (Booking.com, Agoda, MakeMyTrip, or partner channels) using the confirmation email they provided.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
              <span className="text-gray-400">
                HotelsWithBathtubs.com · Curated Luxury Travel Directory
              </span>
              <div className="flex items-center gap-4 text-[#1a6fde] font-semibold">
                <Link href="/about" className="hover:underline">About Us</Link>
                <span>&bull;</span>
                <Link href="/editorial-policy" className="hover:underline">Editorial Policy</Link>
                <span>&bull;</span>
                <Link href="/affiliate-policy" className="hover:underline">Affiliate Disclosure</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
