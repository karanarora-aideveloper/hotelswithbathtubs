import { ReactNode } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
  children?: ReactNode;
}

// JSON inside a <script> tag must not contain a literal "<": a hotel description scraped from a
// third party with "</script>" in it would otherwise end the tag and inject HTML.
export const safeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

export default function StructuredData({ data, children }: StructuredDataProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(data),
        }}
      />
      {children}
    </>
  );
}
