import Link from 'next/link';
import ProgressiveImage from '@/components/ProgressiveImage';

export default function HomeMatchmakerSection() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white border border-[#e3e7ef] rounded-[16px] overflow-hidden shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-40 h-28 relative rounded-[10px] overflow-hidden shrink-0 bg-gray-100">
            <ProgressiveImage
              src="https://pub-c12991664bbf475e918cb03e3ac5b910.r2.dev/hotelswithbathtubs/images/fragrant-nature-a-five-star-classified-hotel-agra-1.webp"
              alt="Hotel room with private bathtub"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#b08d57] mb-1 font-manrope">
              Interactive Quiz
            </div>
            <h2 className="font-playfair text-[20px] sm:text-[22px] font-semibold text-[#14213d] mb-1">
              Find your tub in 4 taps
            </h2>
            <p className="text-[13px] text-[#5b6478] font-manrope max-w-md">
              Take our 30-second matchmaker quiz to discover hotel rooms with private tubs tailored to your trip.
            </p>
          </div>
        </div>
        <Link
          href="/matchmaker"
          prefetch={false}
          className="bg-[#b08d57] hover:bg-[#9c7b48] text-white rounded-[10px] px-5 py-2.5 font-bold text-[13px] transition-colors whitespace-nowrap self-start sm:self-auto inline-flex items-center gap-1.5 shadow-xs font-manrope shrink-0"
        >
          <span>Start</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
