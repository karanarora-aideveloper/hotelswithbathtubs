import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Privacy Policy for Hotels With Bathtubs. Understand how we handle data, our partner-click log, affiliate links, and our commitment to user privacy.',
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
          <p className="text-text-muted text-xs sm:text-sm">Last updated: October 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main font-jakarta text-slate-700 leading-relaxed space-y-6">
          <p>
            At HotelsWithBathtubs.com, we respect your privacy and believe in being completely transparent about what information is collected, how it is used, and how we protect it. This Privacy Policy explains our data practices across our website and outbound booking redirects.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">1. Information We Do Not Collect</h2>
          <p>
            You can browse our site, search destinations, and view hotel bathtub details without registering, creating an account, or giving us your name, email address, physical address, phone number, or payment information. We do not sell, rent, or trade personal data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">2. Outbound Partner-Click Log</h2>
          <p>
            HotelsWithBathtubs.com provides direct links to trusted booking platforms (such as Booking.com, Agoda, and Expedia) so you can view live rates and book rooms. When you click an outbound partner link, the request passes through our redirect edge worker (<code>/out</code>).
          </p>
          <p>
            Our edge worker records the following technical click data:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>Country and City:</strong> Approximate location based on Cloudflare edge request headers (e.g. <code>cf-ipcountry</code> and <code>cf-ipcity</code>).</li>
            <li><strong>Browser &amp; Device Category:</strong> Technical user-agent string to determine browser type and device form factor (mobile, desktop, tablet).</li>
            <li><strong>Target Hotel URL &amp; Timestamp:</strong> The partner property link requested and the exact time of the click.</li>
          </ul>
          <p>
            <strong>Why we record this:</strong> This log helps us identify broken or dead partner links, understand which destinations have active booking demand, and verify affiliate referral activity. We do not record names, emails, payment details, or booking confirmation data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">3. Affiliate Links Disclosure</h2>
          <p>
            HotelsWithBathtubs.com is a reader-supported travel resource. We partner with travel affiliate programs, including Booking.com, Agoda, Expedia, and affiliate networks (such as EarnKaro and Cuelinks).
          </p>
          <p>
            When you click through our partner links and complete a booking, we may earn an affiliate commission at no extra cost to you. We recommend rooms based on independently compiled bathtub facts, photos, and room descriptions.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">4. Analytics and Cookies</h2>
          <p>
            We use Google Analytics 4 to understand website traffic, popular search destinations, and navigational pain points (such as zero-result searches or unresponsive filters).
          </p>
          <p>
            For visitors in the UK, European Economic Area (EEA), and Switzerland, Google Analytics runs with Google Consent Mode v2 and is set to denied by default. Analytics storage is only enabled if you explicitly choose &ldquo;Accept&rdquo; on our cookie banner.
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

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">6. Questions and Contact</h2>
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
