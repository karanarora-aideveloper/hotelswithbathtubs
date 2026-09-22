import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Lora, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
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

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });


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
  description: "Discover 2,250+ verified hotels with private in-room bathtubs and jacuzzis across 215+ destinations in 92 countries. Triple-verified across Booking.com & Agoda for romantic getaways.",
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com',
  },
  openGraph: {
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Discover 2,250+ verified hotels with private in-room bathtubs and jacuzzis across 215+ destinations in 92 countries. Triple-verified on Booking.com & Agoda.",
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
    description: "Discover 2,250+ verified hotels with private in-room bathtubs and jacuzzis across 215+ destinations in 92 countries. Triple-verified on Booking.com & Agoda.",
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
      <body className={`${inter.variable} ${outfit.variable} ${lora.variable} ${playfair.variable} ${plusJakarta.variable} font-sans bg-bg-main text-text-main min-h-screen flex flex-col overflow-x-clip w-full min-w-0`}>
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
        
      </body>
    </html>
  );
}
