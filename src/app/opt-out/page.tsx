import type { Metadata } from 'next';
import OptOutClient from './OptOutClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Internal Traffic Exclusion',
  description: 'Manage internal testing and developer analytics exclusion.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OptOutPage() {
  return <OptOutClient />;
}
