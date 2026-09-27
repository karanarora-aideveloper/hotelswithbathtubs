import Link from 'next/link';
import ExcludeTrafficButton from "@/components/admin/ExcludeTrafficButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-accent-secondary mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
          <Link href="/admin" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Dashboard
          </Link>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2 px-4">Content & SEO</div>
          <Link href="/admin/blogs" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Manage Blogs
          </Link>
          <Link href="/admin/seo" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Global SEO Settings
          </Link>
          <Link href="/admin/seo-audit" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors flex items-center justify-between">
            <span>SEO Page Audit</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">AI</span>
          </Link>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2 px-4">Growth & Data</div>
          <Link href="/admin/review" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors flex items-center justify-between">
            <span>Bathtub Review Queue</span>
            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">NEW</span>
          </Link>
          <Link href="/admin/url-fixer" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors flex items-center justify-between">
            <span>MMT URL Fixer</span>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">✓ Done</span>
          </Link>
          <Link href="/admin/hotels" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Hotel Verification
          </Link>
          <Link href="/admin/planner" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Expansion Planner
          </Link>
          <Link href="/admin/social" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Social Media Planner
          </Link>
          <Link href="/admin/pinterest" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors flex items-center justify-between">
            <span>Pinterest Studio</span>
            <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">📌 API</span>
          </Link>
          <Link href="/admin/tracker" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Affiliate Tracker & Strategy
          </Link>
          <Link href="/admin/affiliates" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Affiliate Links
          </Link>
          <Link href="/admin/scrapers" className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-accent-secondary font-medium transition-colors">
            Web Scrapers
          </Link>
        </nav>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <ExcludeTrafficButton />
          <p className="text-[10px] text-gray-400 text-center mt-2 leading-tight">Clicking this prevents Google Analytics from tracking your personal pageviews.</p>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-accent">&larr; Back to Live Site</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
