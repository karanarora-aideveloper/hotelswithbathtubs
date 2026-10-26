import React from 'react';
import Link from 'next/link';

export default function LuxuryTrustProof() {
  return (
    <section className="border-y border-[#E5E1D8] bg-[#FAF8F5] py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
        <div className="max-w-xl text-center md:text-left">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C5A880] mb-1.5">
            Verified In-Room Luxury
          </p>
          <p className="font-playfair text-lg sm:text-xl text-[#121518] leading-snug">
            Every hotel is checked across Booking.com, Agoda, and partner listings to confirm the bathtub is private inside your room.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-[#E5E1D8] pt-6 md:pt-0 md:pl-12 w-full md:w-auto text-center md:text-left">
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">60+</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">Global Cities</span>
          </div>
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">100%</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">In-Room Tubs</span>
          </div>
          <div>
            <span className="block font-playfair text-2xl sm:text-3xl text-[#121518] font-medium">0</span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-[#6B6964]">Shared Facilities</span>
          </div>
        </div>
      </div>

      {/* High-priority server-rendered HTML links to top US and global destination hubs */}
      <div className="max-w-6xl mx-auto mt-6 pt-5 border-t border-[#E5E1D8]/70 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-[#6B6964]">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-[#121518]">Popular Stays:</span>
        <Link href="/usa/new-york" prefetch={false} className="text-[#121518] hover:text-[#1a6fde] font-medium underline underline-offset-2">
          New York
        </Link>
        <span>&bull;</span>
        <Link href="/usa/las-vegas" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Las Vegas
        </Link>
        <span>&bull;</span>
        <Link href="/usa/chicago" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Chicago
        </Link>
        <span>&bull;</span>
        <Link href="/usa/miami" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Miami
        </Link>
        <span>&bull;</span>
        <Link href="/uk/london" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          London
        </Link>
        <span>&bull;</span>
        <Link href="/france/paris" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Paris
        </Link>
        <span>&bull;</span>
        <Link href="/india/delhi" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Delhi
        </Link>
        <span>&bull;</span>
        <Link href="/india/goa" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Goa
        </Link>
        <span>&bull;</span>
        <Link href="/india/mumbai" prefetch={false} className="hover:text-[#1a6fde] transition-colors">
          Mumbai
        </Link>
        <span>&bull;</span>
        <Link href="/destinations" prefetch={false} className="text-[#1a6fde] font-semibold hover:underline">
          All Destinations &rarr;
        </Link>
      </div>
    </section>
  );
}
