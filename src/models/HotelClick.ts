import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHotelClick extends Document {
  clickId: string;
  hotelName: string;
  cityName?: string;
  countryName?: string;
  provider: string; // 'booking.com' | 'agoda' | 'makemytrip' | 'trip.com' | 'airbnb' | 'other'
  destinationUrl: string;
  pagePath?: string;
  referrer?: string;
  deviceCategory?: string; // 'mobile' | 'desktop' | 'tablet'
  userType?: string; // 'new' | 'returning'
  posthogDistinctId?: string;
  posthogSessionId?: string;
  ipCountry?: string;
  ipCity?: string;
  userAgent?: string;
  clickedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HotelClickSchema = new Schema<IHotelClick>({
  clickId: { type: String, required: true, unique: true, index: true },
  hotelName: { type: String, required: true, index: true },
  cityName: { type: String, index: true },
  countryName: { type: String, index: true },
  provider: { type: String, required: true, index: true },
  destinationUrl: { type: String, required: true },
  pagePath: { type: String, default: '' },
  referrer: { type: String, default: '' },
  deviceCategory: { type: String, default: 'desktop' },
  userType: { type: String, default: 'new' },
  posthogDistinctId: { type: String, default: '', index: true },
  posthogSessionId: { type: String, default: '' },
  ipCountry: { type: String, default: '' },
  ipCity: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  clickedAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'hotelclicks'
});

HotelClickSchema.index({ clickedAt: -1 });
HotelClickSchema.index({ provider: 1, clickedAt: -1 });
HotelClickSchema.index({ hotelName: 1, clickedAt: -1 });
HotelClickSchema.index({ cityName: 1, clickedAt: -1 });

const HotelClick: Model<IHotelClick> = mongoose.models.HotelClick || mongoose.model<IHotelClick>('HotelClick', HotelClickSchema);

export default HotelClick;
