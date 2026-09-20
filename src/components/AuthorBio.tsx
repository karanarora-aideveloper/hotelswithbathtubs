import Link from 'next/link';

export default function AuthorBio() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-amber-50/40 border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mt-10 sm:mt-12 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-accent-secondary to-accent text-white flex items-center justify-center font-heading text-xl sm:text-3xl font-extrabold shadow-md flex-shrink-0">
          KA
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-accent-secondary">
              Written &amp; Curated by Karan Arora
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-2xs font-bold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Verified Travel Curator
            </span>
          </div>
          <p className="text-2xs sm:text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            Founder &amp; Luxury Hospitality Scout · HotelsWithBathtubs.com
          </p>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-serif mb-3">
            Frustrated by misleading hotel photos where advertised &ldquo;bathtubs&rdquo; turned out to be shared hotel spa pools or standing showers, Karan pioneered the platform&rsquo;s <strong>Triple-Verification Methodology</strong>. Every hotel and jacuzzi suite featured on this site is independently audited across room inventories on MakeMyTrip, Agoda, and Booking.com to guarantee authentic, in-room soaking experiences for couples and honeymooners.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-accent-secondary">
            <Link href="/about" className="hover:text-accent underline transition-colors">
              Our Verification Process
            </Link>
            <span className="hidden sm:inline">&bull;</span>
            <Link href="/affiliate-policy" className="hover:text-accent underline transition-colors">
              Editorial Policy
            </Link>
            <span className="hidden sm:inline">&bull;</span>
            <a href="mailto:editorial@hotelswithbathtubs.com" className="hover:text-accent underline transition-colors break-all">
              editorial@hotelswithbathtubs.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
