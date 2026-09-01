import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialPost extends Document {
  platform: 'instagram' | 'twitter' | 'pinterest';
  content: string;
  mediaUrl?: string;
  status: 'idea' | 'draft' | 'scheduled' | 'published';
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema: Schema = new Schema(
  {
    platform: { type: String, enum: ['instagram', 'twitter', 'pinterest'], required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    status: { type: String, enum: ['idea', 'draft', 'scheduled', 'published'], default: 'idea' },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.SocialPost || mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);
