import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllSchemes } from '@/lib/data/custom-schemes';
import { SchemesPageClient } from './SchemesPageClient';

export const metadata: Metadata = {
  title: 'Explore Schemes',
  description:
    'Browse and search government welfare schemes with verified source citations, eligibility criteria, and application steps.',
};

export default function SchemesPage() {
  const schemes = getAllSchemes();
  return (
    <Suspense fallback={null}>
      <SchemesPageClient initialSchemes={schemes} />
    </Suspense>
  );
}
