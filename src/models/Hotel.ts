import { createSnapshotModel, useSnapshot } from '@/lib/snapshotModel';
import mongoose from 'mongoose';

export interface IHotel extends mongoose.Document {
  name: string;
  slug: string;
  city: string;
  country: string;
  url: string;
  agodaUrl?: string;
  partnerImages?: string[]; // partner CDN photo URLs (decision D8); R2 copies are the fallback
  bookingUrl?: string;
  expediaUrl?: string;
  hotelsComUrl?: string;
  airbnbUrl?: string;
  vrboUrl?: string;
  tripUrl?: string;
  mmtUrl?: string;
  image: string;
  images?: string[];
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
  price?: string;
  neighborhood?: string;
  landmarkDistance?: string;
  latitude?: number;
  longitude?: number;
  streetAddress?: string;
  postalCode?: string;
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
  // Legacy catch-all link field. Optional: the link repair empties it when no verified link exists,
  // and a required legacy field would make every later save() of such a hotel fail validation.
  url: {
    type: String,
  },
  agodaUrl: {
    type: String,
  },
  partnerImages: {
    type: [String],
    default: undefined,
  },
  airbnbUrl: {
    type: String,
  },
  bookingUrl: {
    type: String,
  },
  expediaUrl: {
    type: String,
  },
  hotelsComUrl: {
    type: String,
  },
  vrboUrl: {
    type: String,
  },
  tripUrl: {
    type: String,
  },
  mmtUrl: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
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
  price: {
    type: String,
  },
  neighborhood: {
    type: String,
  },
  landmarkDistance: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  streetAddress: {
    type: String,
  },
  postalCode: {
    type: String,
  },
}, {
  timestamps: true,
});

const HotelModel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);

// The cloud build has no database access: with DATA_SNAPSHOT=1 the model reads the JSON snapshot instead.
export default (useSnapshot() ? createSnapshotModel('all-hotels.json') : HotelModel) as unknown as typeof HotelModel;
