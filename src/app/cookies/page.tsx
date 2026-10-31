import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Hotels With Bathtubs uses cookies and browser storage, how long they last, how to refuse them, and what our partner-click log records.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiePolicy() {
  return (
    <div className="bg-bg-main py-8 sm:py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white md:rounded-3xl shadow-sm border border-border pb-16 pt-10">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-text-muted text-sm">Last updated: October 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main font-jakarta text-slate-700 leading-relaxed space-y-6">
          <p>
            HotelsWithBathtubs.com is an independent guide connecting travellers to hotel rooms and suites with private in-room bathtubs and jacuzzis. We believe in transparency and honest privacy practices. This policy explains what cookies and browser storage keys we use, why we use them, how long they last, how you can control or refuse them, and how our partner link redirects operate.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">1. What Are Cookies and Local Storage?</h2>
          <p>
            Cookies are small text files placed on your browser or device by websites you visit. Browser storage (such as <code>localStorage</code>) is a similar web standard that lets websites save key-value pairs directly in your browser without sending them across every network request.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">2. Cookies and Storage Keys We Use</h2>
          <p>
            Below is the complete list of cookies and storage keys used on HotelsWithBathtubs.com:
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-left text-sm border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                  <th className="p-3 border border-slate-200">Name / Key</th>
                  <th className="p-3 border border-slate-200">Type</th>
                  <th className="p-3 border border-slate-200">Provider</th>
                  <th className="p-3 border border-slate-200">Purpose</th>
                  <th className="p-3 border border-slate-200">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">_ga</td>
                  <td className="p-3 border border-slate-200">Cookie</td>
                  <td className="p-3 border border-slate-200">Google Analytics</td>
                  <td className="p-3 border border-slate-200">Distinguishes unique users to measure pageviews and site traffic.</td>
                  <td className="p-3 border border-slate-200">2 years</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">_ga_*</td>
                  <td className="p-3 border border-slate-200">Cookie</td>
                  <td className="p-3 border border-slate-200">Google Analytics</td>
                  <td className="p-3 border border-slate-200">Maintains session state and navigation across pages.</td>
                  <td className="p-3 border border-slate-200">2 years</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">hwb_consent</td>
                  <td className="p-3 border border-slate-200">localStorage</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Saves your cookie consent choice (&ldquo;granted&rdquo; or &ldquo;denied&rdquo;) so the banner is not shown on every page.</td>
                  <td className="p-3 border border-slate-200">Persistent until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">hwb_region_tab</td>
                  <td className="p-3 border border-slate-200">localStorage</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Remembers the last region tab you browsed on the homepage (e.g. USA or India).</td>
                  <td className="p-3 border border-slate-200">Persistent until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">hwb_favorites</td>
                  <td className="p-3 border border-slate-200">localStorage</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Stores hotel listings you bookmark locally using the favorite heart button.</td>
                  <td className="p-3 border border-slate-200">Persistent until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">hwb_returning</td>
                  <td className="p-3 border border-slate-200">localStorage</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Remembers returning visitors when generating outbound links.</td>
                  <td className="p-3 border border-slate-200">Persistent until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">hwb_user_id, hwb_session_count, hwb_first_seen, hwb_last_seen, hwb_lifetime_time, hwb_lifetime_hotels, hwb_has_converted, hwb_last_churn_type, hwb_last_exit_link</td>
                  <td className="p-3 border border-slate-200">localStorage</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Anonymous navigation metrics stored locally on your device to analyze usability bottlenecks and zero-result searches. They contain no names, emails, or personal identifiers.</td>
                  <td className="p-3 border border-slate-200">Persistent until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs border border-slate-200">ignore_ga, ignore_analytics</td>
                  <td className="p-3 border border-slate-200">localStorage &amp; Cookie</td>
                  <td className="p-3 border border-slate-200">Hotels With Bathtubs</td>
                  <td className="p-3 border border-slate-200">Allows team members and visitors who opt out to completely disable Google Analytics measurement.</td>
                  <td className="p-3 border border-slate-200">Persistent / 1 year</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">3. Outbound Partner-Click Log</h2>
          <p>
            When you click an outbound link to check rates or book a room on a partner site (such as Booking.com, Agoda, or Expedia), your request passes through our redirect edge handler (<code>/out</code>).
          </p>
          <p>
            Our edge handler logs the following technical attributes:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>Country and City:</strong> Determined from Cloudflare edge headers (e.g. <code>cf-ipcountry</code> and <code>cf-ipcity</code>).</li>
            <li><strong>Browser &amp; Device Type:</strong> From the standard HTTP User-Agent header (to know if you are on mobile, tablet, or desktop).</li>
            <li><strong>Destination URL &amp; Timestamp:</strong> Which hotel link was clicked and when.</li>
          </ul>
          <p>
            <strong>What we never record:</strong> We do NOT collect or store your name, email address, payment details, physical address, or phone number in our click log.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">4. How to Refuse or Manage Cookies</h2>
          <p>
            You have multiple ways to manage, refuse, or remove cookies and local storage:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700">
            <li>
              <strong>Consent Banner (UK, EU, and Switzerland):</strong> If you visit from the UK, European Economic Area, or Switzerland, analytics cookies are denied by default under Google Consent Mode v2 until you explicitly choose &ldquo;Accept&rdquo;. If you choose &ldquo;Reject&rdquo;, analytics cookies remain blocked.
            </li>
            <li>
              <strong>Reopen Cookie Settings:</strong> You can review or change your choice at any time by clicking the &ldquo;Cookie settings&rdquo; button in our website footer.
            </li>
            <li>
              <strong>Browser Controls:</strong> All major browsers let you view, block, or delete cookies and site storage through their privacy settings. Refer to your browser&apos;s help documentation for instructions.
            </li>
            <li>
              <strong>Google Analytics Opt-out:</strong> You can install the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                Google Analytics Opt-out Browser Add-on
              </a>{' '}
              to prevent data collection by Google Analytics across all websites.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-3">5. Contact Us</h2>
          <p>
            If you have any questions about this Cookie Policy or how we handle data, please contact us via our{' '}
            <Link href="/contact" className="text-accent hover:underline font-medium">
              Contact Page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
