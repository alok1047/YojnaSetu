import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SchemesPageClient } from './SchemesPageClient';

export const metadata: Metadata = {
  title: 'Explore Schemes',
  description:
    'Browse and search government welfare schemes with verified source citations, eligibility criteria, and application steps.',
};

export default function SchemesPage() {
  return (
    <Suspense fallback={null}>
      <SchemesPageClient />
    </Suspense>
  );
}
