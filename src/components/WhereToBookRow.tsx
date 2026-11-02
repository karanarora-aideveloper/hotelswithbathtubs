'use client';

import React from 'react';
import OutboundLink from '@/components/OutboundLink';

export interface WhereToBookRowProps {
  partnerName: string;
  url: string;
  hotelName: string;
  cityName: string;
  countryName?: string;
  isConfirmedBooking?: boolean;
  price?: string | null;
}

export default function WhereToBookRow({
  partnerName,
  url,
  hotelName,
  cityName,
  countryName,
  isConfirmedBooking = false,
  price,
}: WhereToBookRowProps) {
  const lineText = isConfirmedBooking
    ? 'Tub listed for this room'
    : `Opens this hotel on ${partnerName}`;

  const buttonText = isConfirmedBooking ? 'See room ›' : 'See hotel ›';

  return (
    <div className="flex items-center justify-between p-[12px_14px] border-b border-[#e3e7ef] last:border-b-0 text-sm">
      <div className="min-w-0 pr-3">
        <div className="font-semibold text-[#14213d] text-sm leading-tight flex items-center gap-2">
          <span>{partnerName}</span>
          {price && <span className="text-xs font-bold text-[#b08d57]">{price}</span>}
        </div>
        <small className="block text-[#5b6478] text-[11px] mt-0.5 leading-snug">
          {lineText}
        </small>
      </div>
      <OutboundLink
        href={url}
        source={partnerName}
        placement="hotel_page"
        hotelName={hotelName}
        cityName={cityName}
        countryName={countryName}
        className="inline-flex items-center justify-center border-[1.5px] border-[#b08d57] text-[#b08d57] hover:bg-[#b08d57] hover:text-white rounded-[9px] px-3 py-2 font-bold text-xs transition-colors shrink-0 whitespace-nowrap"
      >
        {buttonText}
      </OutboundLink>
    </div>
  );
}
