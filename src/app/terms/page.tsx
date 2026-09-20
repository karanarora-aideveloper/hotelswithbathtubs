import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Review the Terms of Service for Hotels With Bathtubs. Understand terms of use, booking disclosures, and guidelines for using our directory.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfService() {
  return (
    <div className="bg-bg-main py-6 sm:py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 bg-white sm:rounded-2xl md:rounded-3xl shadow-sm border-y sm:border border-border pb-12 pt-6 sm:pb-16 sm:pt-10">
        <header className="mb-8 sm:mb-10 border-b border-border pb-6 sm:pb-8">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold text-accent-secondary leading-tight mb-3 sm:mb-4">
            Terms of Service
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">Last updated: August 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main">
          <p>
            By accessing and using HotelsWithBathtubs.com, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2>Use of Our Service</h2>
          <p>
            Our website provides curated lists and recommendations of hotels. We are not a booking agent or a travel agency. Any bookings made through third-party links are subject to the terms and conditions of the respective booking platforms.
          </p>
          
          <h2>Disclaimer of Warranties</h2>
          <p>
            While we strive to ensure the information on our website is accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability with respect to the website or the information, products, services, or related graphics contained on the website.
          </p>
        </div>
      </div>
    </div>
  );
}
