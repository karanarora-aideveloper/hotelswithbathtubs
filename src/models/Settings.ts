import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  globalTitle: string;
  globalDescription: string;
  affiliateIds: {
    agoda: string;
    booking: string;
    makemytrip: string;
    earnkaro: string;
  };
  deepseekApiKey?: string;
  googleAnalyticsId?: string;
}

const SettingsSchema: Schema = new Schema(
  {
    siteName: { type: String, default: 'Hotels With Bathtubs' },
    globalTitle: { type: String, default: 'Hotels With Bathtubs | Romantic Jacuzzi Suites' },
    globalDescription: { type: String, default: 'Find luxury hotels offering private bathtubs and Jacuzzis.' },
    deepseekApiKey: { type: String, default: '' },
    googleAnalyticsId: { type: String },
    affiliateIds: {
      agoda: { type: String, default: '' },
      booking: { type: String, default: '' },
      makemytrip: { type: String, default: '' },
      earnkaro: { type: String, default: '' },
    }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
