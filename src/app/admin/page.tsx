import type { Metadata } from 'next';
import { AdminPageClient } from './AdminPageClient';

export const metadata: Metadata = {
  title: 'Admin Document Ingestion & Scheme Manager | YojnaSetu',
  description: 'Upload new official scheme gazettes, manage welfare schemes, and trigger vector embedding indexing.',
};

export default function AdminPage() {
  return <AdminPageClient />;
}
