import Link from 'next/link';
import Logo from './Logo';
import { getDestinationsDirectory } from '@/lib/destinationsDirectory';

// Slim footer (decision D7): about 30 links instead of 226. The full city and country lists
// live on the /destinations hub page.
const GUIDES = [
  { href: '/blog', label: 'Travel guides' },
  { href: '/couple-friendly', label: 'Couple-friendly stays' },
  { href: '/hotels-with-hot-tub-in-room', label: 'Hot tub suites' },
  { href: '/soaking-tub-hotels', label: 'Soaking tub hotels' },
  { href: '/matchmaker', label: 'Bathtub matchmaker' },
  { href: '/hostels', label: 'Hostels with bathtubs' },
];
const COMPANY = [
  { href: '/about', label: 'About us' },
  { href: '/editorial-policy', label: 'How we verify' },
  { href: '/affiliate-policy', label: 'Affiliate policy' },
  { href: '/contact', label: 'Contact' },
];

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-heading font-bold text-accent-secondary text-sm mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} prefetch={false} className="text-sm text-text-muted hover:text-accent transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const { cities } = await getDestinationsDirectory();
  const top = (country: string, n: number) =>
    cities.filter((c) => c.countrySlug === country).slice(0, n).map((c) => ({ href: `/${c.countrySlug}/${c.citySlug}`, label: c.city }));

  return (
    <footer id="global-site-footer" className="mt-16 bg-gray-50 text-text-main border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <Column title="Top US destinations" links={[...top('usa', 7), { href: '/usa', label: 'All US destinations' }]} />
          <Column title="Top India destinations" links={[...top('india', 7), { href: '/india', label: 'All India destinations' }]} />
          <Column title="Guides" links={GUIDES} />
          <Column title="Company" links={COMPANY} />
        </div>
        <p className="mb-10">
          <Link href="/destinations" prefetch={false} className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline">
            Browse all destinations <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>

        {/* Footer Bottom Links, Social Media & Brand */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex items-start gap-4">
              <Logo className="w-12 h-10 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-heading text-lg font-bold text-accent-secondary mb-1">Hotels with Bathtubs</p>
                <p className="text-xs text-text-muted max-w-sm leading-relaxed">
                  Hotel rooms with a private bathtub or in-room jacuzzi, for romantic and luxury stays. We link to Booking.com, Agoda and other partners to book.
                </p>
              </div>
            </div>

            {/* Social Media Presence Links */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text-muted mr-1 hidden sm:inline">Follow Us:</span>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/hotelswithbathtubs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Hotels with Bathtubs on Facebook"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-gray-200 hover:border-[#1877F2] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/hotelswithbathtubs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Hotels with Bathtubs on Instagram"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#E4405F] text-[#E4405F] hover:text-white border border-gray-200 hover:border-[#E4405F] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a
                href="https://x.com/hotelsbathtubs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Hotels with Bathtubs on X"
                className="w-9 h-9 rounded-full bg-white hover:bg-black text-black hover:text-white border border-gray-200 hover:border-black flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/hotelswithbathtubs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Hotels with Bathtubs on LinkedIn"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-gray-200 hover:border-[#0A66C2] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@hotelswithbathtubs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to Hotels with Bathtubs on YouTube"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-gray-200 hover:border-[#FF0000] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-muted pt-4 border-t border-border">
            <p className="font-medium">&copy; 2026 HotelsWithBathtubs.com. All rights reserved.</p>
            <div className="flex gap-4 flex-wrap justify-center sm:justify-end">
              <Link href="/privacy" prefetch={false} className="text-text-muted hover:text-accent font-medium transition-colors">Privacy</Link>
              <Link href="/terms" prefetch={false} className="text-text-muted hover:text-accent font-medium transition-colors">Terms</Link>
              <Link href="/cookies" prefetch={false} className="text-text-muted hover:text-accent font-medium transition-colors">Cookies</Link>
            </div>
          </div>
          <p className="text-center text-xs text-text-muted/70 pt-3">
            Hotels with Bathtubs is an independent travel guide connecting you to luxury hotels with verified in-room bathtubs &amp; jacuzzis worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
