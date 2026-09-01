import mongoose from 'mongoose';

export interface IHotel extends mongoose.Document {
  name: string;
  slug: string;
  city: string;
  country: string;
  url: string;
  agodaUrl?: string;
  bookingUrl?: string;
  image: string;
  verified: boolean;
  flagged?: boolean;
  amenities: string[];
  description?: string;
  crossVerified?: boolean;
  crossVerifiedAt?: Date;
  crossVerifiedSources?: string[];
  rating?: number;
  reviewsCount?: number;
  bathtubConfirmed?: boolean | null;
  roomType?: string;
  tubType?: string;
  bookingTip?: string;
}

const HotelSchema = new mongoose.Schema<IHotel>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  agodaUrl: {
    type: String,
  },
  bookingUrl: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  amenities: {
    type: [String],
    default: ['Bathtub'],
  },
  description: {
    type: String,
    default: '',
  },
  crossVerified: {
    type: Boolean,
    default: false,
  },
  crossVerifiedAt: {
    type: Date,
  },
  crossVerifiedSources: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
  },
  reviewsCount: {
    type: Number,
  },
  bathtubConfirmed: {
    type: Boolean,
    default: null,
  },
  roomType: {
    type: String,
    default: 'Deluxe Suite with Bathtub',
  },
  tubType: {
    type: String,
    default: 'Private Soaking Bathtub',
  },
  bookingTip: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);
