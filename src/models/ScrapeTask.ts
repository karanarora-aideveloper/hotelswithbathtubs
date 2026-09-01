import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapeTask extends Document {
  country: string;
  city: string;
  status: 'planned' | 'in-progress' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScrapeTaskSchema: Schema = new Schema(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    status: { type: String, enum: ['planned', 'in-progress', 'completed'], default: 'planned' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ScrapeTask || mongoose.model<IScrapeTask>('ScrapeTask', ScrapeTaskSchema);
