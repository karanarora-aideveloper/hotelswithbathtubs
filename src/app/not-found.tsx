import type { Metadata } from 'next';
import Link from 'next/link';
import NotFoundTracker from '@/components/NotFoundTracker';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found.',
  alternates: {
    canonical: undefined,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8 py-20">
      <NotFoundTracker />
      <span className="text-6xl mb-6">🛁</span>
      <h1 className="font-heading text-4xl font-extrabold text-accent-secondary mb-4">Page Not Found</h1>
      <p className="text-text-muted text-lg mb-8 max-w-md">
        Sorry, we couldn't find that page. It may have moved, or the URL may be out of date.
      </p>
      <Link
        href="/"
        className="bg-gradient-to-br from-accent to-accent-hover text-white px-8 py-3 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
