import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Link from 'next/link';

export default async function AdminBlogsPage() {
  await connectToDatabase();
  const blogs = await Blog.find().sort({ createdAt: -1 });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Blogs</h1>
        <Link href="/admin/blogs/new" className="bg-accent-secondary hover:bg-accent-secondary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Post
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {blogs.map((blog: any) => (
              <tr key={blog._id.toString()} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{blog.title}</p>
                  <p className="text-xs text-gray-500">/{blog.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{blog.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${blog.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link href={`/blog/${blog.slug}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View
                  </Link>
                  <button className="text-accent hover:text-accent-hover font-medium text-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
