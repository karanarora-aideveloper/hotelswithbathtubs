'use server';

import connectToDatabase from '@/lib/mongodb';
import AffiliateTracker from '@/models/AffiliateTracker';
import { revalidatePath } from 'next/cache';

export async function addTracker(formData: FormData) {
  await connectToDatabase();
  
  const platformName = formData.get('platformName') as string;
  const url = formData.get('url') as string;
  const status = formData.get('status') as 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected';
  const commissionRate = formData.get('commissionRate') as string;
  const supportedBrands = formData.get('supportedBrands') as string;
  const notes = formData.get('notes') as string;
  
  const appliedDateStr = formData.get('appliedDate') as string;
  const appliedDate = appliedDateStr ? new Date(appliedDateStr) : undefined;

  await AffiliateTracker.create({
    platformName,
    url,
    status,
    notes,
    appliedDate,
    supportedBrands,
    commissionRate,
    targetedCountries: formData.get('targetedCountries') as string
  });

  revalidatePath('/admin/tracker');
}

export async function updateTrackerStatus(id: string, status: 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected') {
  await connectToDatabase();
  await AffiliateTracker.findByIdAndUpdate(id, { status });
  revalidatePath('/admin/tracker');
}

export async function deleteTracker(id: string) {
  await connectToDatabase();
  await AffiliateTracker.findByIdAndDelete(id);
  revalidatePath('/admin/tracker');
}

export async function addSubCampaign(trackerId: string, formData: FormData) {
  await connectToDatabase();
  const name = formData.get('name') as string;
  const status = formData.get('status') as 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected';
  const appliedDateStr = formData.get('appliedDate') as string;
  const appliedDate = appliedDateStr ? new Date(appliedDateStr) : undefined;

  await AffiliateTracker.findByIdAndUpdate(trackerId, {
    $push: {
      subCampaigns: { name, status, appliedDate }
    }
  });
  revalidatePath('/admin/tracker');
}

export async function updateSubCampaignStatus(trackerId: string, subCampaignId: string, status: 'Researching' | 'Applied' | 'In Review' | 'Approved' | 'Rejected') {
  await connectToDatabase();
  await AffiliateTracker.findOneAndUpdate(
    { _id: trackerId, 'subCampaigns._id': subCampaignId },
    { $set: { 'subCampaigns.$.status': status } }
  );
  revalidatePath('/admin/tracker');
}

export async function updateTrackerTargetedCountries(id: string, targetedCountries: string) {
  await connectToDatabase();
  await AffiliateTracker.findByIdAndUpdate(id, { targetedCountries });
  revalidatePath('/admin/tracker');
}

export async function updateSubCampaignTargetedCountries(trackerId: string, subCampaignId: string, targetedCountries: string) {
  await connectToDatabase();
  await AffiliateTracker.findOneAndUpdate(
    { _id: trackerId, 'subCampaigns._id': subCampaignId },
    { $set: { 'subCampaigns.$.targetedCountries': targetedCountries } }
  );
  revalidatePath('/admin/tracker');
}

export async function deleteSubCampaign(trackerId: string, subCampaignId: string) {
  await connectToDatabase();
  await AffiliateTracker.findByIdAndUpdate(
    trackerId,
    { $pull: { subCampaigns: { _id: subCampaignId } } }
  );
  revalidatePath('/admin/tracker');
}
