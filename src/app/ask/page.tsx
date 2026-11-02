import type { Metadata } from 'next';
import { AskPageClient } from './AskPageClient';

export const metadata: Metadata = {
  title: 'Ask Assistant',
  description:
    'Ask questions about welfare schemes, benefits, eligibility criteria, and application procedures with verified citations to official documents.',
};

export default function AskPage() {
  return <AskPageClient />;
}
