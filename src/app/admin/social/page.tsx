'use client';

import { useState, useEffect } from 'react';

export default function AdminSocialPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/social');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await fetch('/api/admin/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform }),
      });
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/social/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Planner</h1>
        <p className="text-gray-500 mt-2">Track your content ideas and schedule for Instagram, Twitter, and Pinterest.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4">New Content Idea</h3>
          <form onSubmit={addPost} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Platform</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none bg-white"
              >
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Caption / Content</label>
              <textarea 
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent outline-none"
                placeholder="e.g. Check out this amazing Jacuzzi suite in Goa! Link in bio."
                required
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Save Idea
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">No content ideas yet.</div>
          ) : posts.map((post: any) => (
            <div key={post._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <span className={`text-xs font-bold uppercase tracking-wider mb-2 inline-block ${
                  post.platform === 'instagram' ? 'text-pink-600' : 
                  post.platform === 'twitter' ? 'text-blue-500' : 'text-red-600'
                }`}>{post.platform}</span>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex flex-col justify-between items-end gap-2 md:w-32">
                <select 
                  value={post.status}
                  onChange={(e) => updateStatus(post._id, e.target.value)}
                  className="text-xs font-medium border border-gray-300 rounded-lg px-2 py-1 outline-none w-full"
                >
                  <option value="idea">💡 Idea</option>
                  <option value="draft">📝 Draft</option>
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="published">✅ Published</option>
                </select>
                <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
