import { describe, it, expect } from 'vitest';
import SchemesPage, { metadata as schemesMetadata } from './schemes/page';
import SchemeDetailPage, {
  generateStaticParams,
  generateMetadata as generateSchemeDetailMetadata,
} from './schemes/[slug]/page';
import AskPage, { metadata as askMetadata } from './ask/page';
import EligibilityPage, { metadata as eligibilityMetadata } from './eligibility/page';
import AboutPage, { metadata as aboutMetadata } from './about/page';
import AdminPage, { metadata as adminMetadata } from './admin/page';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';

describe('App Router Pages', () => {
  describe('Explore Schemes (/schemes)', () => {
    it('exports proper metadata', () => {
      expect(schemesMetadata.title).toBe('Explore Schemes');
      expect(schemesMetadata.description).toBeTruthy();
    });

    it('renders server component without errors', () => {
      const page = SchemesPage();
      expect(page).toBeDefined();
    });
  });

  describe('Scheme Detail (/schemes/[slug])', () => {
    it('generates static params for all sample schemes', async () => {
      const params = await generateStaticParams();
      expect(params.length).toBeGreaterThanOrEqual(SAMPLE_SCHEMES.length);
      const paramSlugs = params.map((p) => p.slug);
      SAMPLE_SCHEMES.forEach((s) => {
        expect(paramSlugs).toContain(s.slug);
      });
    });

    it('generates metadata for a valid scheme', async () => {
      const validSlug = SAMPLE_SCHEMES[0].slug;
      const metadata = await generateSchemeDetailMetadata({
        params: Promise.resolve({ slug: validSlug }),
      });
      expect(metadata.title).toBe(SAMPLE_SCHEMES[0].name);
      expect(metadata.description).toBe(SAMPLE_SCHEMES[0].summary);
    });

    it('generates fallback metadata for unknown scheme', async () => {
      const metadata = await generateSchemeDetailMetadata({
        params: Promise.resolve({ slug: 'non-existent-scheme' }),
      });
      expect(metadata.title).toBe('Scheme Not Found');
    });

    it('renders detail page for an existing scheme', async () => {
      const validSlug = SAMPLE_SCHEMES[0].slug;
      const page = await SchemeDetailPage({
        params: Promise.resolve({ slug: validSlug }),
      });
      expect(page).toBeDefined();
    });
  });

  describe('Ask Assistant (/ask)', () => {
    it('exports metadata', () => {
      expect(askMetadata.title).toBe('Ask Assistant');
      expect(askMetadata.description).toBeTruthy();
    });

    it('renders server component without errors', () => {
      const page = AskPage();
      expect(page).toBeDefined();
    });
  });

  describe('Eligibility Checker (/eligibility)', () => {
    it('exports metadata', () => {
      expect(eligibilityMetadata.title).toBe('Check Eligibility');
      expect(eligibilityMetadata.description).toBeTruthy();
    });

    it('renders server component with Suspense boundary', () => {
      const page = EligibilityPage();
      expect(page).toBeDefined();
    });
  });

  describe('About Service (/about)', () => {
    it('exports metadata', () => {
      expect(aboutMetadata.title).toBe('About This Service');
      expect(aboutMetadata.description).toBeTruthy();
    });

    it('renders server component', () => {
      const page = AboutPage();
      expect(page).toBeDefined();
    });
  });

  describe('Admin Console (/admin)', () => {
    it('exports proper admin metadata', () => {
      expect(adminMetadata.title).toBe('Admin Document Ingestion & Scheme Manager | YojnaSetu');
      expect(adminMetadata.description).toBeTruthy();
    });

    it('renders admin server component without crashing', () => {
      const page = AdminPage();
      expect(page).toBeDefined();
    });
  });
});
