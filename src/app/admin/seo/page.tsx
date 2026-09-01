import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { revalidatePath } from 'next/cache';

async function updateSeoSettings(formData: FormData) {
  'use server';
  
  await connectToDatabase();
  
  const globalTitle = formData.get('globalTitle') as string;
  const globalDescription = formData.get('globalDescription') as string;
  const deepseekApiKey = formData.get('deepseekApiKey') as string;
  const googleAnalyticsId = formData.get('googleAnalyticsId') as string;

  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings();
  }

  settings.globalTitle = globalTitle;
  settings.globalDescription = globalDescription;
  settings.deepseekApiKey = deepseekApiKey;
  settings.googleAnalyticsId = googleAnalyticsId;

  await settings.save();
  revalidatePath('/admin/seo');
}

export default async function AdminSEOPage() {
  await connectToDatabase();
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-gray-500 mt-2">Manage global meta tags and SEO configurations for Hotels With Bathtubs.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-2xl">
        <form action={updateSeoSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Global Site Title</label>
            <input 
              name="globalTitle"
              type="text" 
              defaultValue={settings.globalTitle}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">This is the default title tag used on pages without a specific title.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Global Meta Description</label>
            <textarea 
              name="globalDescription"
              rows={3}
              defaultValue={settings.globalDescription}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Keep it between 150-160 characters for optimal search engine display.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Google Analytics Measurement ID</label>
            <input 
              name="googleAnalyticsId"
              type="text" 
              defaultValue={settings.googleAnalyticsId || ''}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Used for tracking pageviews and conversions. Leave blank to disable GA4.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">DeepSeek API Key</label>
            <input 
              name="deepseekApiKey"
              type="password" 
              defaultValue={settings.deepseekApiKey || ''}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Used for the AI Blog Generator. Get your key from platform.deepseek.com.</p>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Save Settings
            </button>
            <button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-medium transition-colors">
              Re-generate Sitemap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
