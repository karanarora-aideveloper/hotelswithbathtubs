import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Lora } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/models/Settings";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import MixpanelProvider from "@/components/MixpanelProvider";
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAnalyticsProvider from '@/components/GoogleAnalyticsProvider';
import { PostHogProviderWrapper } from '@/components/PostHogProvider';
import InternalTrafficBadge from '@/components/InternalTrafficBadge';


const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap" });


export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hotelswithbathtubs.com'),
  title: {
    template: "%s | Hotels With Bathtubs",
    default: "Hotels with Bathtub in Room & Jacuzzi Suites (2026)",
  },
  description: "Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.",
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com',
  },
  openGraph: {
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.",
    url: 'https://www.hotelswithbathtubs.com',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
        width: 1200,
        height: 630,
        alt: 'Hotels with Bathtubs - Verified Luxury Suites',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Find 2,500+ verified hotels with private bathtubs in room & jacuzzi suites across 111 countries. Triple-checked luxury stays.",
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
  other: {
    'p:domain_verify': '4ed9df0b1a0e78a628fd7d03f7592100',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToDatabase();
  const settings = await Settings.findOne();
  const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_GA_ID ||
    settings?.googleAnalyticsId ||
    '';
  
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev" />
        <link rel="preconnect" href="https://us.i.posthog.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var q = new URLSearchParams(window.location.search);
                  if (q.get('exclude') === 'true' || q.get('admin_mode') === 'true' || q.get('ignore_analytics') === 'true' || q.get('ignore_ga') === 'true' || q.get('dev') === 'true') {
                    localStorage.setItem('ignore_ga', 'true');
                    localStorage.setItem('ignore_analytics', 'true');
                    document.cookie = "ignore_analytics=true; path=/; max-age=31536000; SameSite=Lax";
                  }
                  if (q.get('include_analytics') === 'true' || q.get('unexclude') === 'true') {
                    localStorage.removeItem('ignore_ga');
                    localStorage.removeItem('ignore_analytics');
                    document.cookie = "ignore_analytics=; path=/; max-age=0; SameSite=Lax";
                  }
                  var isExcluded = localStorage.getItem('ignore_ga') === 'true' || 
                                   localStorage.getItem('ignore_analytics') === 'true' || 
                                   document.cookie.indexOf('ignore_analytics=true') !== -1;
                  if (isExcluded) {
                    window['ga-disable-G-TETR30WPYM'] = true;
                    window['ga-disable-G-2VDZWWBGD3'] = true;
                    ${gaId ? `window['ga-disable-${gaId}'] = true;` : ''}
                    window['__HWB_ANALYTICS_EXCLUDED__'] = true;
                    console.log('%c[HotelsWithBathtubs] Admin/Developer Traffic Excluded (GA4, PostHog, Mixpanel Disabled)', 'background: #0f172a; color: #38bdf8; font-size: 11px; padding: 4px 8px; border-radius: 4px;');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${lora.variable} font-sans bg-bg-main text-text-main min-h-screen flex flex-col overflow-x-clip w-full min-w-0`}>
        <PostHogProviderWrapper>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          
          <Navbar />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />
          <MixpanelProvider />
          {gaId && <GoogleAnalytics gaId={gaId} />}
          <GoogleAnalyticsProvider gaId={gaId} />
          <InternalTrafficBadge />
        </PostHogProviderWrapper>
      </body>
    </html>
  );
}
