'use client';

import dynamic from 'next/dynamic';

const RomanticGetawayEmailCapture = dynamic(
  () => import('./RomanticGetawayEmailCapture'),
  { ssr: false }
);

interface LazyEmailCaptureProps {
  destinationName?: string;
  className?: string;
}

export default function LazyEmailCapture(props: LazyEmailCaptureProps) {
  return <RomanticGetawayEmailCapture {...props} />;
}
