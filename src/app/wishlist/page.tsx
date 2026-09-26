import type { Metadata } from 'next';
import Link from 'next/link';
import WishlistPage from './WishlistPage';

export const metadata: Metadata = {
  title: 'My Saved Hotels — Wishlist | Hotels With Bathtubs',
  description: 'Your saved hotels with private bathtubs, jacuzzi suites, and soaking tubs. Compare and book your favorite verified stays.',
  robots: { index: false, follow: false },
};

export default function Wishlist() {
  return <WishlistPage />;
}
