import { ReactNode } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
  children?: ReactNode;
}

export default function StructuredData({ data, children }: StructuredDataProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
      {children}
    </>
  );
}
