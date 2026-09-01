import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit, Lora } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from "next/script";
import "./globals.css";
import Link from "next/link";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import connectToDatabase from "@/lib/mongodb";
import Settings from "@/models/Settings";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import MixpanelProvider from "@/components/MixpanelProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hotelswithbathtubs.com'),
  title: {
    template: "%s | Hotels With Bathtubs",
    default: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
  },
  description: "Discover 748+ verified hotels with private in-room bathtubs and jacuzzis across 60+ destinations. Triple-verified across MakeMyTrip, Agoda & Booking.com for romantic getaways.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Discover 748+ verified hotels with private in-room bathtubs and jacuzzis across 60+ destinations. Triple-verified on MakeMyTrip, Agoda & Booking.com.",
    url: 'https://www.hotelswithbathtubs.com',
    siteName: 'Hotels with Bathtubs',
    images: [
      {
        url: 'https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp',
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
    description: "Discover 748+ verified hotels with private in-room bathtubs and jacuzzis across 60+ destinations. Triple-verified on MakeMyTrip, Agoda & Booking.com.",
    images: ['https://wsyhnifiqkc8fvyw.public.blob.vercel-storage.com/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
  keywords: 'hotels with bathtub, hotels with bathtubs, hotel with bathtub, rooms with bathtub, jacuzzi hotel, hotels with jacuzzi, whirlpool rooms, couple hotels, romantic hotel with bathtub, private jacuzzi suites',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToDatabase();
  const settings = await Settings.findOne();
  const gaId = settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <script
          // @ts-ignore
          nowprocket="1"
          data-noptimize="1"
          data-cfasync="false"
          data-wpfc-render="false"
          // @ts-ignore
          seraph-accel-crit="1"
          data-no-defer="1"
          data-cmp-ab="2"
          dangerouslySetInnerHTML={{
            __html: `(function () { var script = document.createElement("script"); script.async = 1; script.setAttribute("data-cmp-ab","2"); script.src = 'https://tpembars.com/NTY1Nzg5.js?t=565789'; document.head.appendChild(script); })();`
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${lora.variable} font-sans bg-bg-main text-text-main min-h-screen flex flex-col`}>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="m0I/LcukVcqseIUANjyjuw"
          strategy="afterInteractive"
        />
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border py-3 px-4 md:py-3.5 md:px-8 flex flex-row justify-between items-center shadow-xs">
          <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Logo className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0" />
            <div className="flex flex-col items-start text-left">
              <span className="font-heading text-base md:text-lg font-extrabold tracking-tight text-accent-secondary leading-tight">
                Hotels With Bathtubs
              </span>
              <p className="text-text-muted text-2xs font-medium hidden sm:block">
                Verified Premium Suites &amp; Jacuzzis
              </p>
            </div>
          </Link>

          {/* Quick Header Wayfinding Links */}
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold text-text-main">
            <Link href="/#destinations" className="hover:text-accent transition-colors py-1">
              Destinations
            </Link>
            <Link href="/blog" className="hover:text-accent transition-colors py-1">
              Travel Guides
            </Link>
            <Link href="/#verification" className="hidden md:inline hover:text-accent transition-colors py-1">
              Verification
            </Link>
            <Link href="/#faq" className="hidden lg:inline hover:text-accent transition-colors py-1">
              FAQs
            </Link>
            <Link
              href="/#destinations"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs ml-1"
            >
              Browse 60+ Cities
            </Link>
          </div>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
        <MixpanelProvider />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
