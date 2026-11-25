import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hotels With Bathtubs handles data: analytics cookies, the booking-click log, affiliate links, your rights in the UK, EU and US, and Global Privacy Control.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-bg-main py-6 sm:py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border border-border pb-12 pt-6 sm:pb-16 sm:pt-10">
        <header className="mb-8 sm:mb-10 border-b border-border pb-6 sm:pb-8">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">Last updated: 25 November 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main font-jakarta text-slate-700 leading-relaxed space-y-6">
          <p>
            At HotelsWithBathtubs.com, we respect your privacy and believe in being completely transparent about what information is collected, how it is used, and how we protect it. This Privacy Policy explains our data practices across our website and outbound booking redirects.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">1. Information We Do Not Collect</h2>
          <p>
            You can browse our site, search destinations, and view hotel bathtub details without registering, creating an account, or giving us your name, email address, physical address, phone number, or payment information. We do not sell, rent, or trade personal data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">2. Booking-Click Log</h2>
          <p>
            When you tap a booking button (for example Booking.com, Trip.com, Agoda or Expedia), the request passes through our redirect (<code>/out</code>) on Cloudflare. We keep a log of these clicks so we can find broken partner links and see which destinations people want to book.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>Our redirect records:</strong> the time, the booking site, the page and hotel you clicked from, where the button was on the page, and your country (from Cloudflare&apos;s <code>cf-ipcountry</code> header). It does not record your IP address, browser details or the page you came from.</li>
            <li><strong>The page also sends a click record</strong> with the same hotel and page details plus your approximate city, browser and device type (from the user-agent string) and the referring page.</li>
          </ul>
          <p>
            We never record names, email addresses, payment details or booking confirmations, and we cannot see what you book on the partner site.
          </p>

<h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">3. Outbound Booking Links</h2>
          <p>
            Our Booking.com and Trip.com buttons are affiliate links through the CJ (Commission Junction) network: if you book, we may earn a commission at no extra cost to you. When you click one, CJ and the booking site may set their own cookies to credit the booking; their privacy policies apply on their sites. The link carries only your country and the type of page you clicked from, never personal details. Links to other booking sites go straight to the hotel page without affiliate tracking. Rankings and proof labels never depend on commercial relationships. Details are in our <Link href="/affiliate-policy" className="text-accent hover:underline font-semibold">affiliate policy</Link>.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">4. Analytics and Cookies</h2>
          <p>
            We use Google Analytics 4 to understand website traffic, popular search destinations, and navigational pain points (such as zero-result searches or unresponsive filters).
          </p>
          <p>
            For visitors in the UK, European Economic Area (EEA), and Switzerland, Google Analytics runs with Google Consent Mode v2 and is set to denied by default. Analytics storage is only enabled if you explicitly choose &ldquo;Accept&rdquo; on our cookie banner. In the United States, analytics runs unless you choose &ldquo;Opt out&rdquo; on our notice or your browser sends Global Privacy Control.
          </p>
          <p>
            For full details on each cookie, local storage key, and how to manage your preferences, please see our{' '}
            <Link href="/cookies" className="text-accent underline font-medium hover:text-accent-hover">
              Cookie Policy
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">5. Data Security</h2>
          <p>
            All traffic to HotelsWithBathtubs.com is encrypted in transit using industry-standard TLS/SSL encryption provided by Cloudflare. Our edge redirects enforce strict domain allowlists to protect users from malicious or unauthorized URL redirects.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">6. Who Is Responsible, and Our Legal Basis</h2>
          <p>
            Hotels With Bathtubs (hotelswithbathtubs.com) decides how the data described here is used. You can reach us through our{' '}
            <Link href="/contact" className="text-accent underline font-medium hover:text-accent-hover">Contact Page</Link>.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>Analytics cookies (Google Analytics):</strong> in the UK, EEA and Switzerland, only with your consent, which you can withdraw at any time through &ldquo;Cookie settings&rdquo; in the footer. Elsewhere, our legitimate interest in understanding how the site is used, with an opt-out.</li>
            <li><strong>Booking-click log:</strong> our legitimate interest in keeping partner links working and measuring which destinations people want, using the minimum data needed.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">7. Service Providers and Transfers</h2>
          <p>
            We use <strong>Cloudflare</strong> to host the site, run the redirect and store the click log, and <strong>Google</strong> for Google Analytics. Both may process data in the United States and other countries. Transfers from the UK, EEA and Switzerland rely on the EU&ndash;US Data Privacy Framework (and its UK and Swiss extensions) or the European Commission&apos;s standard contractual clauses. We do not use advertising cookies, and Google Analytics is not linked to advertising on this site.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">8. How Long We Keep Data</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>Google Analytics:</strong> event-level data is kept for the period set in our Google Analytics account (currently 2 months; at most 14 months). Analytics cookies last up to 2 years in your browser unless you delete them.</li>
            <li><strong>Booking-click log:</strong> kept only while it helps us check partner links and demand, and deleted when it no longer does.</li>
          </ul>

          <h2 id="your-rights" className="text-2xl font-bold text-slate-900 mt-8 mb-3 scroll-mt-24">9. Your Rights and Choices</h2>
          <p>
            <strong>UK, EEA and Switzerland:</strong> you can ask to access, correct or delete your data, object to or restrict its use, and withdraw consent at any time. You also have the right to complain to your data protection authority (in the UK, the Information Commissioner&apos;s Office). Because we do not collect names or contact details, we may only be able to act on data we can link to your request.
          </p>
          <p>
            <strong>United States (including California, Colorado, Connecticut, Virginia, Texas and other states with privacy laws):</strong> you can ask to know, correct or delete personal information we hold about you. We do <strong>not sell</strong> your personal information, do <strong>not share</strong> it for cross-context behavioural advertising, and do not use it for targeted advertising. US visitors see a short notice with an &ldquo;Opt out&rdquo; button that turns analytics cookies off, and you can change your choice any time through &ldquo;Cookie settings&rdquo; in the footer. We honour the <strong>Global Privacy Control</strong> signal: if your browser sends it, analytics cookies stay off.
          </p>
          <p>
            <strong>Everywhere:</strong> you can use &ldquo;Cookie settings&rdquo; in the footer, block or delete cookies in your browser, or install the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent underline font-medium hover:text-accent-hover">Google Analytics opt-out add-on</a>. To make a request, use our{' '}
            <Link href="/contact" className="text-accent underline font-medium hover:text-accent-hover">Contact Page</Link>; we reply within 30 days and will not treat you differently for using your rights.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">10. Children</h2>
          <p>
            This site is for adults planning travel. We do not knowingly collect data from children under 16.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">11. Changes</h2>
          <p>
            If we change how we handle data, we will update this page and the date at the top.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">12. Questions and Contact</h2>
          <p>
            If you have questions about this Privacy Policy or our data handling practices, please contact us via our{' '}
            <Link href="/contact" className="text-accent underline font-medium hover:text-accent-hover">
              Contact Page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
