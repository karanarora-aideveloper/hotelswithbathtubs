import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How We Check Bathtubs',
  description:
    'This page explains how we check rooms and list bathtubs on our website. We want you to know exactly where our hotel information comes from.',
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
            How we check bathtubs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            This page explains how we check rooms and list bathtubs on our website. We want you to know exactly where our hotel information comes from.
          </p>
        </header>

        <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              What &#x27;confirmed&#x27; means
            </h2>
            <p>
              A room isn&apos;t confirmed unless Booking.com details list a tub for that room. The room must be named, with Bath, Spa tub, Hot tub, or Whirlpool. We record the exact tub label and the date we saw it. A room isn&apos;t confirmed if the partner listing only says Bath or shower. Our Agoda check counts Bathtub or Whirlpool bathtub in room details. A room name with a tub word also counts on Agoda. Separate shower or bathtub does not count on its own. Hotels found on Agoda are not live on our site yet.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              What &#x27;reported&#x27; means
            </h2>
            <p>
              All other hotels on our site are marked as reported, not yet confirmed. These include tub facts taken from other public travel websites. They also include older records that have no stored partner source. We state this clearly on each hotel page.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              What we don&apos;t do
            </h2>
            <p>
              We do not visit hotels in person. We do not call hotels by phone. We cannot promise that any room stays unchanged. Hotels remodel rooms and change their layouts over time.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              How to check a room yourself on Booking.com
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Open the hotel page on Booking.com.</li>
              <li>Choose your travel dates to see available rooms.</li>
              <li>Click on the room name to view its room details.</li>
              <li>Read the list of bathroom features for that room.</li>
              <li>Look for Bath, rather than Bath or shower.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              How to check on Agoda
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Open the hotel listing on Agoda.</li>
              <li>Select your travel dates to load available rooms.</li>
              <li>Click on the room name to read its room details.</li>
              <li>Look for Bathtub or Whirlpool bathtub in the bathroom features.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              What the tub words mean
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Bathtub: a normal tub to soak in.</li>
              <li>Jetted tub: a bathtub with water jets (often called a jacuzzi or spa bath).</li>
              <li>Hot tub: a tub with jets, kept warm (often on a balcony or patio).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              Prices
            </h2>
            <p>
              Prices shown on our site are stored guide prices. They are not live rates. Room rates change often based on dates and demand. Always check the booking partner for the current price.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg sm:text-xl font-normal text-[#1f262d] mb-2">
              Booking links
            </h2>
            <p>
              Links go straight to the booking site. We don&apos;t earn a commission from them today.
            </p>
          </section>

          <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mt-6">
            <h2 className="font-playfair text-base sm:text-lg font-normal text-[#1f262d] mb-1.5">
              Report a mistake
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Hotels sometimes replace bathtubs with showers or rename their rooms. If you see an error on our site, please let us know. You can reach us through our <Link href="/contact" className="text-[#1a6fde] hover:underline font-medium">contact page</Link>.
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
