import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Booking Links & Affiliate Policy',
  description: 'Our policy on outbound booking links and affiliate disclosure for Hotels With Bathtubs.',
  alternates: {
    canonical: '/affiliate-policy',
  },
};

export default function AffiliatePolicy() {
  return (
    <div className="bg-bg-main py-6 sm:py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border border-border pb-12 pt-6 sm:pb-16 sm:pt-10">
        <header className="mb-8 sm:mb-10 border-b border-border pb-6 sm:pb-8">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-3 sm:mb-4">
            Booking Links &amp; Affiliate Policy
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">Last updated: November 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main prose-a:text-accent hover:prose-a:text-accent-hover">
          <p>
            At <strong>HotelsWithBathtubs.com</strong>, our goal is to help you find hotel rooms and suites featuring private in-room bathtubs, soaking tubs, and jacuzzis.
          </p>

          <p className="font-medium text-slate-800">
            Some booking links are affiliate links. If you book through them, we may earn a commission at no extra cost to you.
          </p>

          <h2>Which Links Are Affiliate Links</h2>
          <p>
            Since November 2026, our <strong>Booking.com</strong> and <strong>Trip.com</strong> buttons are affiliate links through the CJ (Commission Junction) network. When you click one, you pass briefly through a CJ tracking address and then land on the same hotel page on Booking.com or Trip.com. The price you see is the price the booking site offers; it is not raised because you came from us.
          </p>
          <p>
            Links to other booking sites (such as Agoda, MakeMyTrip, Cleartrip or Expedia) go straight to the hotel page on that site, with no affiliate tracking. If we add another affiliate program, we will list it here.
          </p>
          <p>
            To measure which pages lead to bookings, an affiliate link carries a short code with your country and the type of page you clicked from (for example &ldquo;in-hotel&rdquo;). It contains no names, emails or other personal details.
          </p>

          <h2>Editorial Integrity &amp; Proof Standards</h2>
          <p>
            Rankings and proof labels never depend on commissions. Hotels cannot pay to appear on our site, and we do not alter or favor listings based on commercial relationships. Every bathtub room in our directory is listed strictly because documented proof from booking platforms indicates an in-room tub.
          </p>

          <h2>Questions &amp; Contact</h2>
          <p>
            If you have questions about our booking links or research, please reach our team at{' '}
            <a href="mailto:editorial@hotelswithbathtubs.com" className="text-accent hover:underline font-semibold">
              editorial@hotelswithbathtubs.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
