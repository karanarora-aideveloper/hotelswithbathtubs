import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Privacy Policy for Hotels With Bathtubs. Understand how we handle data, protect your privacy, and ensure transparency across our travel guide.',
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
          <p className="text-text-muted text-xs sm:text-sm">Last updated: August 2026</p>
        </header>

        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-accent-secondary prose-p:text-text-main">
          <p>
            At HotelsWithBathtubs.com, we take your privacy seriously. This Privacy Policy outlines the types of personal information that is received and collected by our website and how it is used.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect standard analytics data (such as IP addresses, browser types, and pages visited) to improve our website experience. If you contact us or subscribe to a newsletter, we will collect the personal information you voluntarily provide.
          </p>
          
          <h2>How We Use Your Information</h2>
          <p>
            The information we collect is used solely to analyze website traffic, improve our content, and provide you with a better user experience. We do not sell your personal data to third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
