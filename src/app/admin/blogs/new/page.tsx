'use client';

import { useState } from 'react';
import WysiwygEditor from '@/components/admin/WysiwygEditor';

export default function NewBlogPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      setMessage('Please enter a topic for the AI to generate.');
      return;
    }

    setGenerating(true);
    setMessage('Generating SEO-optimized blog with DeepSeek AI... (this may take up to a minute)');

    try {
      const res = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setContent(data.content);
      setMessage('Blog successfully generated! You can now edit it below.');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    // Scaffold save logic (would normally POST to an API)
    setSaving(true);
    setMessage('Saving blog...');
    setTimeout(() => {
      setMessage('Blog saved successfully!');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
          <p className="text-gray-500 mt-2">Write a post manually or generate one instantly using DeepSeek AI.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-secondary hover:bg-accent-secondary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Publish Blog'}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* AI Generator Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          ✨ Generate with DeepSeek AI
        </h3>
        <p className="text-sm text-blue-800 mb-4">Enter a topic, location, or specific hotel to instantly generate a 600+ word SEO-optimized draft.</p>
        <div className="flex gap-4">
          <input 
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g. Best Romantic Hotels with Jacuzzis in Goa"
            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            disabled={generating}
          />
          <button 
            onClick={generateWithAI}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? 'Generating...' : 'Generate Draft'}
          </button>
        </div>
      </div>

      {/* Manual Inputs */}
      <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Blog Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
              placeholder="Enter main title..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug</label>
            <input 
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none bg-gray-50"
              placeholder="e.g. best-hotels-in-goa"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt / Meta Description</label>
          <textarea 
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
            placeholder="A short description for search engines and the blog index..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Content (WYSIWYG Editor)</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <WysiwygEditor value={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
