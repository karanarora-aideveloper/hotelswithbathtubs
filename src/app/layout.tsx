import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Lora, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
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
  description: "Discover 1,070+ verified hotels with private in-room bathtubs and jacuzzis across 135+ destinations in 41 countries. Triple-verified across Booking.com & Agoda for romantic getaways.",
  alternates: {
    canonical: 'https://www.hotelswithbathtubs.com',
  },
  openGraph: {
    title: "Hotels with Bathtubs & Jacuzzi Suites | Verified Stays",
    description: "Discover 950+ verified hotels with private in-room bathtubs and jacuzzis across 125+ destinations in 34 countries. Triple-verified on Booking.com & Agoda.",
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
    description: "Discover 950+ verified hotels with private in-room bathtubs and jacuzzis across 125+ destinations in 34 countries. Triple-verified on Booking.com & Agoda.",
    images: ['https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/bathtub-hotel-the-oberoi-bengaluru-bangalore.webp'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToDatabase();
  const settings = await Settings.findOne();
  
  return (
    <html lang="en">
      <body className={`\$\{inter.variable\} \$\{outfit.variable\} \$\{lora.variable\} \$\{playfair.variable\} \$\{plusJakarta.variable\} font-sans bg-bg-main text-text-main min-h-screen flex flex-col`}>
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        
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
            <Link 
              href="/usa" 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100 text-accent-secondary border border-amber-200/80 rounded-lg font-bold transition-all shadow-2xs"
            >
              <span>🇺🇸</span>
              <span>USA Stays</span>
            </Link>
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
              Browse 125+ Destinations
            </Link>
          </div>
        </nav>

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
        <MixpanelProvider />
        
      </body>
    </html>
  );
}
