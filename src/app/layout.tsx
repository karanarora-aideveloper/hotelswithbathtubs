import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Lora, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AnalyticsExclusionInit from "@/components/AnalyticsExclusionInit";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { GoogleAnalytics } from '@next/third-parties/google';
import GoogleAnalyticsProvider from '@/components/GoogleAnalyticsProvider';
import InternalTrafficBadge from '@/components/InternalTrafficBadge';
import ChunkErrorRecovery from '@/components/ChunkErrorRecovery';


const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans", display: "swap" });


export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hotelswithbathtubs.com'),
  title: {
    template: "%s | Hotels With Bathtubs",
    default: `Hotels with Bathtub in Room & Jacuzzi Suites (${currentYear})`,
  },
  description: "Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.",
  // No site-wide canonical here: every page sets its own, so a page that forgets cannot
  // accidentally canonicalize to the homepage.
  alternates: {
    types: {
      'application/rss+xml': 'https://www.hotelswithbathtubs.com/rss.xml',
    },
  },
  openGraph: {
    locale: 'en_US',
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.",
    url: 'https://www.hotelswithbathtubs.com',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/los-angeles-the-beverly-hills-hotel-1.webp',
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
    description: "Find 4,400+ hotels with private bathtubs in room & jacuzzi suites across 119 countries. Private tubs, checked per hotel.",
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/los-angeles-the-beverly-hills-hotel-1.webp'],
  },
  other: {
    'p:domain_verify': '4ed9df0b1a0e78a628fd7d03f7592100',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Env only: reading the database here tied every build to MongoDB being reachable.
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || '';
  
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${lora.variable} ${playfair.variable} ${plusJakarta.variable} font-sans bg-bg-main text-text-main min-h-screen flex flex-col overflow-x-clip w-full min-w-0`}>
        <ChunkErrorRecovery />
        <AnalyticsExclusionInit gaId={gaId} />
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          
          <Navbar />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />
          {gaId && <GoogleAnalytics gaId={gaId} />}
          <GoogleAnalyticsProvider gaId={gaId} />
          <InternalTrafficBadge />
      </body>
    </html>
  );
}
