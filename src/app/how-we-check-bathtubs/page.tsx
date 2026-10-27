import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How We Check Bathtubs',
  description: 'How Hotels With Bathtubs checks room categories and private bathtub listings across booking partners.',
  alternates: {
    canonical: '/how-we-check-bathtubs',
  },
};

export default function HowWeCheckBathtubsPage() {
  return (
    <div className="bg-[#f8fafb] py-8 sm:py-14 md:py-20 min-h-[75vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 bg-white sm:rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-10 md:p-12 font-jakarta">
        <header className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-xs font-bold text-[#1a6fde] uppercase tracking-wider mb-2">
            Editorial Standards
          </p>
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-normal text-[#1f262d] leading-tight mb-3">
            How We Check Bathtubs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A simple, transparent explanation of how rooms are researched and listed on HotelsWithBathtubs.com.
          </p>
        </header>

        <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              1. What We List
            </h2>
            <p>
              We list a room when its details on a booking partner or rental site mention a private bathtub, soaking tub, hot tub or jacuzzi. We don&apos;t list rooms with only a shower, or where the tub is in a shared spa.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              2. Confirmed or Not
            </h2>
            <p>
              When we&apos;ve matched the bathtub to a specific room, the page names that room. When we haven&apos;t yet, the page says &ldquo;Bathtub reported but not yet confirmed&rdquo;.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              3. Always Check Before Booking
            </h2>
            <p>
              Hotels periodically renovate rooms, reconfigure layouts, or update their inventory. Prices and availability fluctuate continuously. Always check the room description and amenities on the booking partner site before completing your reservation to ensure bathtub access for your booked dates.
            </p>
          </section>

          <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mt-6">
            <h2 className="font-playfair text-base sm:text-lg font-normal text-[#1f262d] mb-1.5">
              4. Report a Mistake
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              If a hotel has replaced a bathtub with a shower, changed room names, or if any detail in our guide is incorrect, please let us know so we can update it immediately.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a6fde] hover:bg-[#1559b8] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-2xs"
            >
              <span>Report a Mistake</span>
              <span>&rarr;</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
