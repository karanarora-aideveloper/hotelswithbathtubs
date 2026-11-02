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
            Links go straight to the booking site. We don&apos;t earn a commission from them today.
          </p>

          <h2>Current Status: Direct Links</h2>
          <p>
            We do not use affiliate links at the moment. When you click a button to view rates or reserve a room, the link directs you straight to the corresponding hotel page on the partner booking platform (such as Booking.com, Agoda, MakeMyTrip, or Expedia) without commercial tracking codes.
          </p>

          <h2>Future Affiliate Programs</h2>
          <p>
            We may introduce affiliate programs in the future to help support our research and operations. If and when we activate affiliate links, this page will be updated immediately to explain how those programs work.
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
