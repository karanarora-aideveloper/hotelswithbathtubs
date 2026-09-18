import React from "react";
import DarkHomeSearch from "@/components/DarkHomeSearch";
import connectToDatabase from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Link from 'next/link';
import { imageUrl } from '@/lib/imageUrl';
import { slugify } from '@/lib/utils';




async function getCities() {
  await connectToDatabase();
  const pipeline: any[] = [
    { $match: { flagged: { $ne: true } } },
    { $addFields: { hasImage: { $cond: [ { $and: [{ $ne: ["$image", null] }, { $ne: ["$image", ""] }] }, 1, 0 ] } } },
    { $sort: { hasImage: -1, rating: -1, reviewsCount: -1 } },
    { $group: { _id: { city: "$city", country: "$country" }, hotelCount: { $sum: 1 }, image: { $first: "$image" } } },
    { $sort: { hotelCount: -1 } },
    { $limit: 4 }
  ];
  return await Hotel.aggregate(pipeline);
}

async function getTopHotels() {
  await connectToDatabase();
  return await Hotel.find({ flagged: { $ne: true }, image: { $ne: null } })
    .sort({ rating: -1, reviewsCount: -1 })
    .limit(3)
    .lean();
}

export default async function RedesignPage() {
  const topCities = await getCities();
  const topHotels = await getTopHotels();

  return (
    <div className="bg-[#f8fafb] text-[#191c1d] min-h-screen flex flex-col font-sans">
      {/* 
        This is a generated design component.
        Note: The Tailwind classes here match the Stitch generated output.
        Ensure you have a Tailwind config that supports these classes if needed, 
        but we&#39;ve mapped some basics directly for preview.
      */}
      
{/* TopNavBar (Shared Component) */}
<header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/80 dark:bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 dark:border-outline-variant/30 shadow-2xl transition duration-300 ease-out">
<div className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 max-w-7xl mx-auto">
{/* Brand Logo */}
<a className="flex items-center gap-3 group" href="#">
<span className="material-symbols-outlined text-primary text-2xl transition-transform duration-300 group-hover:rotate-12" data-icon="bathtub">bathtub</span>
<span className="font-headline-sm text-headline-sm tracking-wide text-primary dark:text-primary">Hotels with Bathtubs</span>
</a>
{/* Desktop Navigation Links */}
<nav className="hidden md:flex items-center space-x-8">
<a className="text-primary dark:text-primary font-label-uppercase-sm text-label-uppercase-sm tracking-widest border-b border-primary pb-1 transition-colors duration-300" href="#curated">Curated Sanctuaries</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm tracking-widest hover:text-primary transition-colors duration-300" href="#nocturne">Nocturne Tubs</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm tracking-widest hover:text-primary transition-colors duration-300" href="#skyline">Skyline Vistas</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm tracking-widest hover:text-primary transition-colors duration-300" href="#editorial">Editorial Privé</a>
</nav>
{/* Trailing Action Cluster */}
<div className="flex items-center space-x-5">
<button aria-label="Bookmarked Sanctuaries" className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95">
<span className="material-symbols-outlined text-xl" data-icon="bookmark">bookmark</span>
</button>
<a className="hidden sm:inline-block font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant hover:text-primary tracking-widest transition-colors duration-300" href="#signin">
          Sign In
        </a>
<a className="inline-flex items-center bg-primary-container text-on-primary-container font-label-uppercase-sm text-label-uppercase-sm px-5 py-2.5 rounded hover:bg-primary transition-all duration-300 active:scale-95 shadow-lg shadow-primary-container/20" href="#inquire">
          Reserve Sanctuary Stay
        </a>
</div>
</div>
</header>
{/* Hero Section (Starring https://lh3.googleusercontent.com/aida-public/AB6AXuA671f0Au6qlAtcj26BPm6diJdhhy-tSZWm1Tm5orvZnwl8p5JJOn42EZI2ZjNZXy2ycs-PKEzz_hgfEJKDvk4_wF8JATOBdRc6smm4R3LpTPpgNjqvZHnCLeG_gAzuoizIDyixCORnlT3sBOzK7TuOL6-i79aJb0sS5woszumRgw6n0bE4urr7ZJMz3xAhNHX1zcwj9mbkUAn3_FRZmApX-uFxO9ZGYiSx_BYupKM7UfKcW4EarqKghvxi15rlgpqsswRcko0_CQA9) */}
<section className="relative min-h-screen w-full flex flex-col justify-end pt-28 pb-16 overflow-hidden">
{/* Cinematic Full-Bleed Imagery with Obsidian Vignette */}
<div className="absolute inset-0 z-0">
<img alt="Tokyo nocturnal skyline and dark marble bathtub suite at dusk" className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA671f0Au6qlAtcj26BPm6diJdhhy-tSZWm1Tm5orvZnwl8p5JJOn42EZI2ZjNZXy2ycs-PKEzz_hgfEJKDvk4_wF8JATOBdRc6smm4R3LpTPpgNjqvZHnCLeG_gAzuoizIDyixCORnlT3sBOzK7TuOL6-i79aJb0sS5woszumRgw6n0bE4urr7ZJMz3xAhNHX1zcwj9mbkUAn3_FRZmApX-uFxO9ZGYiSx_BYupKM7UfKcW4EarqKghvxi15rlgpqsswRcko0_CQA9"/>
{/* Dark Moody Gradient Overlays */}
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-surface-container-lowest/20"></div>
<div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-transparent to-surface-container-lowest/70"></div>
<div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-surface-container-lowest to-transparent"></div>
</div>
{/* Editorial Hero Content */}
<div className="relative z-10 w-full px-6 md:px-margin-desktop max-w-7xl mx-auto flex flex-col justify-end space-y-8">
{/* High-Fashion Editorial Metadata & Badge */}
<div className="flex flex-wrap items-center gap-3">
<span className="px-3.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md border border-primary/30 text-primary font-label-uppercase-sm text-label-uppercase-sm">
          NOCTURNE SANCTUARY N° 01 • TOKYO OVERLOOK
        </span>
<div className="hidden sm:flex items-center gap-2 text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm">
<span className="material-symbols-outlined text-primary text-sm" data-icon="water_drop">water_drop</span>
<span>48TH FLOOR BASALT SOAKER</span>
</div>
</div>
{/* Main Serendipitous Title */}
<div className="max-w-4xl space-y-4">
<h1 className="hidden md:block font-headline-xl text-headline-xl text-on-surface text-balance">
          The Art of the <span className="italic text-primary font-headline-xl">Nocturnal Soak</span>
</h1>
<h1 className="block md:hidden font-headline-xl-mobile text-headline-xl-mobile text-on-surface">
          The Art of the <span className="italic text-primary">Nocturnal Soak</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl font-light">
          An unhurried curation of the world’s most dramatic architectural bathtubs—framed by glowing skylines, heated volcanic stone, and candlelit marble solitude.
        </p>
</div>
{/* Floating VIP Booking Portal Bar */}
<DarkHomeSearch />
</div>
</section>
{/* Curated Global Nocturne Hubs (Asymmetrical & Editorial Masonry) */}
<section className="py-space-xl bg-surface-container-lowest relative" id="curated">
<div className="absolute inset-0 ambient-gold-glow pointer-events-none"></div>
<div className="w-full px-6 md:px-margin-desktop max-w-7xl mx-auto space-y-12 relative z-10">
{/* Section Header */}
<div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/20 pb-8 gap-4">
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest block mb-2">
            GLOBAL NOCTURNE HUBS • EDITION 2025
          </span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">
            Sublime Solitude in <span className="italic text-primary font-headline-lg">Honed Obsidian</span>
</h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Curated destinations where the bath is not an afterthought, but the architectonic heart of the nocturnal panorama.
        </p>
</div>
{/* Asymmetrical Editorial Masonry Grid */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
{/* Large Hero Vertical Feature: Tokyo Basalt (Cols 1-7) */}
<div className="md:col-span-7 group relative rounded-xl overflow-hidden bg-surface-container-low gold-bevel-edge flex flex-col justify-end min-h-[560px]">
<img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" data-alt="A dark and moody architectural bathroom suite in Tokyo at night with a sunken black volcanic basalt bathtub looking out through floor-to-ceiling windows onto the glittering Tokyo skyline with the orange Tokyo Tower glowing. Burning white pillar candles sit on polished dark marble floors, with brass fixture accents and subtle steam rising." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLFgFs61fcCoLcIb8BhTnkkEDDhSAPg08-mL8-9Z-he8-kXbkqdSNKagtUK8nwzGKBjVK8thW3bZdarWbOh6hpVwH82eiSdg1U1aROrxZVbQiP-mVBBLPpyXl_CCxyjBk10ozYuhtoSWfZaG09EdGwGvLT7h3d5yITm87ofq6nqBNtTp0H7WxruLvemlDE1ueOndVEBUrxGNVDbEaAJ6af-JVYwdbi0bimp6_KYRJ6gPLyE_NXW5z01FbDeGn6ERgxGUaeLtXyA-q_"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent"></div>
<div className="relative z-10 p-8 space-y-4">
<div className="flex items-center gap-2">
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-primary font-label-uppercase-sm text-label-uppercase-sm border border-primary/30">
                NOCTURNE COLLECTION N° 04
              </span>
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm border border-white/10">
                JAPANESE HINOKI &amp; BASALT
              </span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
              Tokyo: Basalt Furo overlooking Shinjuku &amp; Nocturnal Tower Glow
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
              Carved from single-block volcanic basalt, framing the endless digital constellations of the Kanto plain from 53 storeys above the metropolis.
            </p>
<div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface">PRIVATE ON-DEMAND BUTLER &amp; BATH SALTS</span>
<span className="text-primary font-headline-sm text-headline-sm">$3,200 <span className="font-body-sm text-body-sm text-on-surface-variant">/ night</span></span>
</div>
</div>
</div>
{/* Staggered Panoramic & Vertical Cards (Cols 8-12) */}
<div className="md:col-span-5 flex flex-col gap-8">
{/* Paris: Carrara & Gold */}
<div className="group relative rounded-xl overflow-hidden bg-surface-container-low gold-bevel-edge flex flex-col justify-end min-h-[265px] p-6">
<img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" data-alt="A Parisian penthouse bathroom suite late at night with a sculptural French clawfoot cast iron bathtub with polished gold leaf feet positioned directly by classic French balcony windows framing the illuminated Eiffel Tower in the dark night sky. Candlelight reflects off polished black and white Carrara marble tiles." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKkg2sspYiu8xQxcVNqEzS-kLPuaiA2S10v4rOncMpAhTfV6MoAEO6QY7TJ2eTXr2nBtYBEGNukmdVGMH78C1_lA26YsP99-GV2gZwke0k6icYVlcs4JJybw9EYaIoY_7_FaKMFDVa_1AGTDjcXOnmNk1NHI0uixvupTlx35LkM3lSGoNcbpU7k2Phrckc6zmro-AUxMNnnwRVDuejeD0tO8mdxl3iGeBq3knc686Mmf5eHgzgNkXmiXg0nxtcZuWr1Y7HMwbdlBqo"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent"></div>
<div className="relative z-10 space-y-2">
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-0.5 rounded text-primary font-label-uppercase-sm text-label-uppercase-sm border border-primary/20 inline-block">
                PARIS • 8TH ARRONDISSEMENT
              </span>
<h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                Carrara &amp; Gold Clawfoot framing midnight Eiffel Spire
              </h4>
<div className="flex justify-between items-center text-on-surface-variant pt-2 border-t border-outline-variant/20">
<span className="font-body-sm text-body-sm">Diptyque Figuier Bath Infusion</span>
<span className="text-primary font-body-md text-body-md font-medium">$2,750</span>
</div>
</div>
</div>
{/* New York & Zurich Split Card */}
<div className="group relative rounded-xl overflow-hidden bg-surface-container-low gold-bevel-edge flex flex-col justify-end min-h-[265px] p-6">
<img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" data-alt="A luxury penthouse in Manhattan Tribeca at night featuring a sunken matte black granite bathtub next to steel-framed industrial arched windows overlooking glittering city lights. Soft amber mood lighting and crystal glassware with chilled champagne rest on a black stone bath tray." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-938AB4lgGE5i-9mn3nPR29dntaz3pkrGVymnR3dkwXY4Fbwp2OolsB2dg-WH_TQYEIZ6-L26vLZmluGTghZ0tV9M3XJvZSYHBwT5_M3VOF0POc60rnXND3qanF-lbXEAeng-eTFSajKuzfQXOqmpt9XSHRIK34F5T-axVvbXsK01QbIu-h8wI2HA1bcRDGl7HmZQW8i8WU3tFS3AF7Te8GI7AbVghZajNDypKEB6cW6ee-lzYB9N72qXrsviyQdNfWWSQH-sT-Gm"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent"></div>
<div className="relative z-10 space-y-2">
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-0.5 rounded text-primary font-label-uppercase-sm text-label-uppercase-sm border border-primary/20 inline-block">
                NEW YORK • TRIBECA PENTHOUSE
              </span>
<h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                Sunken Matte Obsidian overlooking Central Park South
              </h4>
<div className="flex justify-between items-center text-on-surface-variant pt-2 border-t border-outline-variant/20">
<span className="font-body-sm text-body-sm">Hand-poured Dead Sea Brine</span>
<span className="text-primary font-body-md text-body-md font-medium">$3,400</span>
</div>
</div>
</div>
</div>
</div>
{/* Additional Horizontal Feature: Alpine Thermal Bath (St. Moritz) */}
<div className="group relative rounded-xl overflow-hidden bg-surface-container-low gold-bevel-edge p-8 flex flex-col md:flex-row items-center justify-between gap-6">
<img className="absolute inset-0 w-full h-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105" data-alt="An outdoor cedar and black volcanic granite heated onsen tub on a cantilevered balcony in the Swiss Alps at night. Steam billows gracefully into the crisp nocturnal air against dark jagged snow-dusted alpine mountain peaks lit by moonlight and discreet warm glowing brass lanterns." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpBDvqrk7NiTFDWgtU7AP__imHaPT07DuSlsYu4vPSMfqj-AqhImPwqAdbkqKpWZ34ZGcHm1M5-dM4colJXNPT7mUB_-69LEOfUBN4UeArpcQGYM6nC0ElR6X2O5c_r_ZqUcDi9u8JTufOeM8IpkuBqSxsc9vxxEASUg28W2NrkZaRSP6c1QNylU0SUP4dVWsp0qPqt92G7PiIh8kdZ8tZznvI2ATt3nGbb_RhiM7naVqZHD1FNRYVZO-BCWsLzOCwOAaOMw9a3Us0"/>
<div className="absolute inset-0 bg-surface-container-lowest/80"></div>
<div className="relative z-10 space-y-2 max-w-2xl">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-base" data-icon="ac_unit">ac_unit</span>
<span className="text-primary font-label-uppercase-sm text-label-uppercase-sm">ALPINE NOCTURNE ESCAPE</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface">
            St. Moritz: Heated Volcanic Stone Soaker over Snow-Capped Nocturnal Peaks
          </h3>
<p className="font-body-md text-body-md text-on-surface-variant">
            A thermal sanctuary kept at an exact 40°C amid sub-zero Engadin midnight air, with mountain pinewood mineral soaks.
          </p>
</div>
<div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
<div className="text-right hidden sm:block">
<div className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant">RITUAL STATUS</div>
<div className="text-primary font-body-md text-body-md font-medium">Bespoke Butler Ready</div>
</div>
<button className="w-full sm:w-auto px-6 py-3 rounded bg-surface-container-high hover:bg-surface-variant text-primary border border-primary/30 font-label-uppercase-sm text-label-uppercase-sm transition-all active:scale-95">
            Discover Sanctuary
          </button>
</div>
</div>
</div>
</section>
{/* Editorial Quote Banner (Vogue Privé / Architectural Digest Aesthetic) */}
<section className="py-16 bg-surface-container border-y border-outline-variant/20 relative overflow-hidden">
<div className="w-full px-6 md:px-margin-desktop max-w-5xl mx-auto text-center space-y-6">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="format_quote">format_quote</span>
<blockquote className="font-subheading-editorial text-subheading-editorial md:font-headline-md md:text-headline-md text-on-surface italic font-light leading-relaxed">
        “The bath is no longer an ablution; it is the ultimate architectural theater of nocturnal stillness—an intimate communion between warm mineral waters and cold city glass.”
      </blockquote>
<cite className="block font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest not-italic">
        — ARCHITECTURAL DIGEST PRIVÉ, THE NOCTURNE ESSAYS
      </cite>
</div>
</section>
{/* Featured Sanctuary Suites (Architectural & High-Fashion Layout) */}
<section className="py-space-xl bg-surface relative" id="nocturne">
<div className="w-full px-6 md:px-margin-desktop max-w-7xl mx-auto space-y-16">
<div className="flex flex-col md:flex-row items-baseline justify-between border-b border-outline-variant/20 pb-6 gap-4">
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest block mb-1">
            HAUTE HÔTELLERIE SELECTION
          </span>
<h2 className="font-headline-lg text-headline-lg text-on-surface">
            Featured Sanctuary <span className="italic text-primary font-headline-lg">Suites</span>
</h2>
</div>
<div className="flex items-center gap-4">
<button className="p-2.5 rounded-full border border-outline-variant/40 hover:border-primary text-on-surface hover:text-primary transition-colors active:scale-95">
<span className="material-symbols-outlined text-xl" data-icon="west">west</span>
</button>
<button className="p-2.5 rounded-full border border-primary text-primary bg-primary/10 hover:bg-primary hover:text-on-primary transition-colors active:scale-95">
<span className="material-symbols-outlined text-xl" data-icon="east">east</span>
</button>
</div>
</div>
{/* Suite Showcase 1: The Obsidian Suite — Tokyo */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
{/* Suite Imagery with Frosted Badges */}
<div className="lg:col-span-7 relative group rounded-xl overflow-hidden gold-bevel-edge">
<img className="w-full h-[480px] object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A grand luxury bedroom and bathroom suite with dark honed granite finishes. In the corner by panoramic floor-to-ceiling glass windows is a deep black circular bathtub filled with water, reflecting moody golden candlelight. Outside the window lies the dark skyline of Tokyo with warm amber building lights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh8WTuZJ67e0x0EQN8wzRIwueEVhTN6Tz3zUlIBe0jYTk9S1bsHg6T6b44HIBTSEGJWOUE-luGPc6IhY5j4IFwlOUq1EsZcZWoyBNZYJ7CRZQeHpvK_PNELX7LYSPHveVK4L059y9nJBq3jj5gYb0n-YaAYYGfJMCvu5mbKBarXnxpMPJDERcijM2Xivr7HyVAyKthLRfMOjlDylCGvosihoFlOJnuQWDqBi947pF3JGeAt-lFZm_8WYdBy2Z3bLz5uzFroCicYfGs"/>
<div className="absolute top-4 left-4 flex flex-wrap gap-2">
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-primary font-label-uppercase-sm text-label-uppercase-sm border border-primary/20">
              HONED GRANITE
            </span>
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm border border-white/10">
              5.8 FT SOAKING DEPTH
            </span>
</div>
<div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-lg border border-primary/30 text-right">
<div className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant">FROM</div>
<div className="text-primary font-headline-sm text-headline-sm">$2,850 <span className="font-body-sm text-body-sm text-on-surface-variant">/ night</span></div>
</div>
</div>
{/* Suite Narrative & Sensory Spec Sheet */}
<div className="lg:col-span-5 space-y-6">
<div className="space-y-2">
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest">
              AMAN TOKYO • OTEMACHI TOWER
            </span>
<h3 className="font-headline-md text-headline-md text-on-surface">
              The Obsidian Suite
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant">
              Sculpted from dark graphite stone directly adjacent to floor-to-ceiling glass that reveals Mount Fuji’s dusk silhouette giving way to Shinjuku’s nocturnal glow.
            </p>
</div>
{/* Specialized Component: Ritual & Sensory Spec Sheet */}
<div className="p-5 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-4">
<h4 className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest border-b border-outline-variant/20 pb-2">
              SENSORY SPECIFICATIONS &amp; RITUALS
            </h4>
<div className="grid grid-cols-2 gap-y-3 gap-x-6 text-on-surface">
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">TUB CAPACITY</span>
<span className="font-subheading-editorial text-subheading-editorial text-primary">520 Liters</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">FILL TIME</span>
<span className="font-subheading-editorial text-subheading-editorial text-primary">8.5 Minutes</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">STONE MATERIAL</span>
<span className="font-body-md text-body-md font-light">Charcoal Basalt</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">AMENITY PARTNER</span>
<span className="font-body-md text-body-md font-light">Diptyque Privé</span>
</div>
</div>
</div>
<div className="flex items-center gap-4 pt-2">
<button className="px-6 py-3 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-uppercase-sm text-label-uppercase-sm transition-all duration-300 active:scale-95 shadow-lg shadow-primary-container/20">
              Reserve Obsidian Suite
            </button>
<button className="px-6 py-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase-sm text-label-uppercase-sm border border-outline-variant/30 transition-all">
              View Floorplan
            </button>
</div>
</div>
</div>
{/* Suite Showcase 2: Le Balcon Doré — Paris (Reversed Asymmetry) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8">
{/* Suite Narrative & Sensory Spec Sheet */}
<div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
<div className="space-y-2">
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest">
              HÔTEL PLAZA ATHÉNÉE • AVENUE MONTAIGNE
            </span>
<h3 className="font-headline-md text-headline-md text-on-surface">
              Le Balcon Doré
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant">
              An architectural masterwork featuring hand-beaten gilded brass edging and solid Carrara marble soakers overlooking the Eiffel Tower’s hourly midnight shimmer.
            </p>
</div>
{/* Sensory Spec Sheet */}
<div className="p-5 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-4">
<h4 className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest border-b border-outline-variant/20 pb-2">
              SENSORY SPECIFICATIONS &amp; RITUALS
            </h4>
<div className="grid grid-cols-2 gap-y-3 gap-x-6 text-on-surface">
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">TUB CAPACITY</span>
<span className="font-subheading-editorial text-subheading-editorial text-primary">480 Liters</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">VISTA ORIENTATION</span>
<span className="font-subheading-editorial text-subheading-editorial text-primary">South-West Eiffel</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">MATERIAL</span>
<span className="font-body-md text-body-md font-light">White Carrara &amp; Brass</span>
</div>
<div>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant block">CHAMPAGNE PAIRING</span>
<span className="font-body-md text-body-md font-light">Dom Pérignon P2</span>
</div>
</div>
</div>
<div className="flex items-center gap-4 pt-2">
<button className="px-6 py-3 rounded bg-primary-container text-on-primary-container hover:bg-primary font-label-uppercase-sm text-label-uppercase-sm transition-all duration-300 active:scale-95 shadow-lg shadow-primary-container/20">
              Reserve Le Balcon
            </button>
<button className="px-6 py-3 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-uppercase-sm text-label-uppercase-sm border border-outline-variant/30 transition-all">
              Bath Sommelier Menu
            </button>
</div>
</div>
{/* Suite Imagery with Frosted Badges */}
<div className="lg:col-span-7 relative group rounded-xl overflow-hidden gold-bevel-edge order-1 lg:order-2">
<img className="w-full h-[480px] object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A grand classical Paris luxury bathroom suite at twilight with an ornate freestanding clawfoot bathtub lined in burnished gold accents. Outside the open French balcony windows sits the glowing iron architecture of Paris with warm lantern light reflecting on wet limestone streets." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAUYsl9O90LyjSlzVMb71dogE3-ucnTp-HFhksDDEWXWm3-kT_5vnOuh2f6WJEnXoD_1v0o355KArbDHR4LOy7ZfiXkgaWi7FVh4iftZcVvh49pcvZ7pC3x5IKGoj1zglOEvhrrrF4n13QjWGYlY-KjX-A17JMp466g5Sjq1dye2rGgo9d2V3_qbk065votpWfYK6VtOGoNqK2MRqPMdp4QEQBvlSjh4boYbcs5VybL9IK4GVvWO0UTQnxxx-lSvIGe3hzXUM6kBBg"/>
<div className="absolute top-4 left-4 flex flex-wrap gap-2">
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-primary font-label-uppercase-sm text-label-uppercase-sm border border-primary/20">
              CARRARA MARBLE
            </span>
<span className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded text-on-surface-variant font-label-uppercase-sm text-label-uppercase-sm border border-white/10">
              EIFFEL TOWER VISTA
            </span>
</div>
<div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-lg border border-primary/30 text-right">
<div className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant">FROM</div>
<div className="text-primary font-headline-sm text-headline-sm">$3,800 <span className="font-body-sm text-body-sm text-on-surface-variant">/ night</span></div>
</div>
</div>
</div>
</div>
</section>
{/* Exclusive Bath Concierge & Rituals Journal */}
<section className="py-space-xl bg-surface-container-lowest relative border-t border-outline-variant/20" id="editorial">
<div className="w-full px-6 md:px-margin-desktop max-w-7xl mx-auto space-y-16">
{/* Concierge Privé Black Card Box */}
<div className="rounded-xl bg-gradient-to-br from-surface-container-low via-surface to-surface-container-lowest p-8 md:p-12 gold-bevel-edge relative overflow-hidden">
<div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
<div className="lg:col-span-8 space-y-4">
<div className="inline-flex items-center gap-2 text-primary">
<span className="material-symbols-outlined text-lg fill-icon" data-icon="star">star</span>
<span className="font-label-uppercase-sm text-label-uppercase-sm tracking-widest">VIP BLACK-CARD CONCIERGE PRIVÉ</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface">
              On-Demand Scent Designers, Sommelier Pairings &amp; Mineral Brine Formulations
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl font-light">
              Every verified booking through Hotels with Bathtubs unlocks our bespoke Bath Butler protocol: temperature regulation upon suite arrival, custom artisanal botanical infusions, and temperature-matched grand cru vintages.
            </p>
</div>
<div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
<button className="w-full py-3.5 px-6 rounded bg-primary-container hover:bg-primary text-on-primary-container font-label-uppercase-sm text-label-uppercase-sm transition-all shadow-lg shadow-primary-container/20 active:scale-95">
              Request Concierge Invitation
            </button>
<button className="w-full py-3.5 px-6 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-uppercase-sm text-label-uppercase-sm border border-outline-variant/30 transition-all">
              Explore Apothecary &amp; Oils
            </button>
</div>
</div>
</div>
{/* Journal & Rituals Dispatch Newsletter Form */}
<div className="max-w-3xl mx-auto text-center space-y-6 pt-6">
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary tracking-widest block">
          THE NOCTURNE DISPATCH
        </span>
<h3 className="font-headline-md text-headline-md text-on-surface">
          Receive Secret Sanctuaries &amp; Limited Private Suite Openings
        </h3>
<p className="font-body-md text-body-md text-on-surface-variant font-light">
          Delivered fortnightly at dusk. Unlisted penthouse suites, architectural essays, and private bath mineral formulas.
        </p>
{/* Minimalist Gold Foil Form */}
<form className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-xl mx-auto" >
<input className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-4 py-3.5 text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Enter your private email address" type="email"/>
<button className="w-full sm:w-auto shrink-0 bg-primary-container text-on-primary-container hover:bg-primary px-6 py-3.5 rounded font-label-uppercase-sm text-label-uppercase-sm tracking-widest transition-all shadow-md active:scale-95" type="submit">
            Subscribe Privé
          </button>
</form>
<p className="text-outline font-body-sm text-body-sm">Strictly discreet. Never unsolicited.</p>
</div>
</div>
</section>
{/* Editorial Footer (Shared Component) */}
<footer className="w-full bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/20 dark:border-outline-variant/20 flat no shadows">
<div className="w-full px-6 md:px-margin-desktop py-space-xl max-w-7xl mx-auto flex flex-col justify-between space-y-12">
{/* Top Footer Cluster */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/20 pb-8">
<div>
<span className="font-headline-md text-headline-md text-primary dark:text-primary tracking-widest">
            Hotels with Bathtubs
          </span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Curated architectural sanctuaries for nocturnal soaking rituals.
          </p>
</div>
<div className="flex items-center space-x-6 text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-xl" data-icon="bathtub">bathtub</span>
<span className="material-symbols-outlined text-primary text-xl" data-icon="spa">spa</span>
<span className="material-symbols-outlined text-primary text-xl" data-icon="hotel">hotel</span>
</div>
</div>
{/* Links Grid */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#journal">
          Editorial Journal
        </a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#collections">
          Private Collections
        </a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#bespoke">
          Bespoke Baths
        </a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#apothecary">
          Apothecary &amp; Oils
        </a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#privacy">
          Privacy Charter
        </a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors duration-300" href="#concierge">
          Concierge Privé
        </a>
</div>
{/* Bottom Disclaimer & Copyright */}
<div className="flex flex-col sm:flex-row justify-between items-center text-outline font-body-sm text-body-sm pt-6 border-t border-outline-variant/10 gap-4">
<span>© 2025 Hotels with Bathtubs Inc. All Sanctuaries Reserved. Architecture &amp; Bath Rituals.</span>
<div className="flex items-center space-x-6">
<span className="font-label-uppercase-sm text-label-uppercase-sm text-primary">EDITION IV</span>
<span className="font-label-uppercase-sm text-label-uppercase-sm text-on-surface-variant">PARIS • TOKYO • NEW YORK • ST. MORITZ</span>
</div>
</div>
</div>
</footer>

    </div>
  );
}
