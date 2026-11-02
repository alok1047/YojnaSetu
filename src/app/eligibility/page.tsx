import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, LoadingSkeleton } from '@/components/ui';
import { EligibilityPageClient } from './EligibilityPageClient';

export const metadata: Metadata = {
  title: 'Check Eligibility',
  description:
    'Evaluate your potential eligibility for government welfare schemes based on official published requirements with transparent criteria checks.',
};

function EligibilityLoadingFallback() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-[var(--color-border)] rounded animate-pulse" />
        <LoadingSkeleton lines={8} />
      </div>
    </PageContainer>
  );
}

export default function EligibilityPage() {
  return (
    <Suspense fallback={<EligibilityLoadingFallback />}>
      <EligibilityPageClient />
    </Suspense>
  );
}
