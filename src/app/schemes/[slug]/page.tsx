import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllSchemes } from '@/lib/data/custom-schemes';
import { SchemeDetailClient } from './SchemeDetailClient';

interface SchemeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const schemes = getAllSchemes();
  return schemes.map((scheme) => ({
    slug: scheme.slug,
  }));
}

export async function generateMetadata({ params }: SchemeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const schemes = getAllSchemes();
  const scheme = schemes.find((s) => s.slug === slug);

  if (!scheme) {
    return {
      title: 'Scheme Not Found',
    };
  }

  return {
    title: scheme.name,
    description: scheme.summary,
  };
}

export default async function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const { slug } = await params;
  const schemes = getAllSchemes();
  const scheme = schemes.find((s) => s.slug === slug);

  if (!scheme) {
    notFound();
  }

  return <SchemeDetailClient scheme={scheme} />;
}
