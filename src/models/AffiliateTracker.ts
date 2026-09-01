import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCampaign {
  _id?: string | mongoose.Types.ObjectId;
  name: string;
  status: 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected';
  appliedDate?: Date;
  targetedCountries?: string;
}

export interface IAffiliateTracker extends Document {
  platformName: string;
  url: string;
  status: 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected';
  appliedDate?: Date;
  commissionRate?: string;
  supportedBrands?: string;
  targetedCountries?: string;
  subCampaigns?: ISubCampaign[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubCampaignSchema = new Schema({
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Researching', 'Applied', 'In Review', 'Approved', 'Rejected'], 
    default: 'Researching' 
  },
  appliedDate: { type: Date },
  targetedCountries: { type: String, default: '' }
});

const AffiliateTrackerSchema: Schema = new Schema({
  platformName: { type: String, required: true },
  url: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Researching', 'Applied', 'In Review', 'Approved', 'Rejected'], 
    default: 'Researching' 
  },
  appliedDate: { type: Date },
  commissionRate: { type: String },
  supportedBrands: { type: String },
  targetedCountries: { type: String, default: '' },
  subCampaigns: [SubCampaignSchema],
  notes: { type: String }
}, {
  timestamps: true,
  collection: 'affiliateTrackers'
});

const AffiliateTracker: Model<IAffiliateTracker> = mongoose.models.AffiliateTracker || mongoose.model<IAffiliateTracker>('AffiliateTracker', AffiliateTrackerSchema);

export default AffiliateTracker;
