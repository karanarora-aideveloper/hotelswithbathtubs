import { createSnapshotModel, isSnapshotMode } from '@/lib/snapshotModel';
import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  published: boolean;
  author: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    published: { type: Boolean, default: true },
    author: { type: String, default: 'Travel Editor' },
    image: { type: String },
  },
  { timestamps: true }
);

const BlogModel = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

// The cloud build has no database access: with DATA_SNAPSHOT=1 the model reads the JSON snapshot instead.
export default (isSnapshotMode() ? createSnapshotModel('all-blogs.json') : BlogModel) as unknown as typeof BlogModel;
