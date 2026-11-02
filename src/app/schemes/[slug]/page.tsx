import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer, Badge, DisclaimerNotice } from '@/components/ui';
import { SAMPLE_SCHEMES, SCHEME_CATEGORIES } from '@/lib/data/sample-schemes';

interface SchemeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return SAMPLE_SCHEMES.map((scheme) => ({
    slug: scheme.slug,
  }));
}

export async function generateMetadata({ params }: SchemeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const scheme = SAMPLE_SCHEMES.find((s) => s.slug === slug);

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
  const scheme = SAMPLE_SCHEMES.find((s) => s.slug === slug);

  if (!scheme) {
    notFound();
  }

  const categoryLabel = SCHEME_CATEGORIES[scheme.category] ?? scheme.category;

  return (
    <PageContainer>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-muted)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--color-border)]">
              /
            </li>
            <li>
              <Link
                href="/schemes"
                className="hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Explore Schemes
              </Link>
            </li>
            <li aria-hidden="true" className="text-[var(--color-border)]">
              /
            </li>
            <li
              aria-current="page"
              className="text-[var(--color-text)] font-medium truncate max-w-xs sm:max-w-md"
            >
              {scheme.name}
            </li>
          </ol>
        </nav>

        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{categoryLabel}</Badge>
            <Badge variant="default">{scheme.department}</Badge>
            <Badge variant="default">{scheme.jurisdiction}</Badge>
            {scheme.isSampleData && <Badge variant="warning">Sample Data</Badge>}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
            {scheme.name}
          </h1>

          {scheme.isSampleData && (
            <DisclaimerNotice
              variant="warning"
              message="This scheme entry uses demonstration data for prototyping. In production, schemes are sourced from official government notifications and gazettes."
            />
          )}

          <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed">
            {scheme.summary}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              href={`/eligibility?scheme=${scheme.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-control)] hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <span>Check potential eligibility</span>
            </Link>

            {scheme.officialUrl && (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium border border-[var(--color-border)] rounded-[var(--radius-control)] hover:bg-[var(--color-accent-soft)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <span>Open official source</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </header>

        {/* Detailed Description */}
        <section
          aria-labelledby="about-scheme-heading"
          className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-3"
        >
          <h2
            id="about-scheme-heading"
            className="text-lg font-semibold text-[var(--color-text)]"
          >
            About This Scheme
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed">
            {scheme.description}
          </p>
          {scheme.targetGroup && (
            <p className="text-xs text-[var(--color-muted)] pt-1">
              <strong className="font-semibold text-[var(--color-text)]">Target Group:</strong>{' '}
              {scheme.targetGroup}
            </p>
          )}
        </section>

        {/* Benefits Section */}
        <section
          aria-labelledby="benefits-heading"
          className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h2 id="benefits-heading" className="text-xl font-semibold text-[var(--color-text)]">
              Benefits & Assistance Provided
            </h2>
          </div>
          <ul className="space-y-3 pt-1">
            {scheme.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 rounded-full p-1 bg-[var(--color-accent-soft)] text-[var(--color-primary)]"
                  aria-hidden="true"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-sm sm:text-base text-[var(--color-text)] leading-normal">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Eligibility Requirements Section */}
        <section aria-labelledby="eligibility-criteria-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h2
              id="eligibility-criteria-heading"
              className="text-xl font-semibold text-[var(--color-text)]"
            >
              Eligibility Requirements
            </h2>
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Applicant credentials are evaluated against the following criteria codified in official
            regulations:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheme.eligibilityCriteria.map((criterion) => (
              <article
                key={criterion.id}
                className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-[var(--color-text)]">
                      {criterion.label}
                    </h3>
                    <Badge variant={criterion.required ? 'primary' : 'default'}>
                      {criterion.required ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {criterion.description}
                  </p>
                </div>

                {criterion.sourceExcerpt && (
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                      Official Excerpt
                    </p>
                    <blockquote className="p-2.5 bg-[var(--color-accent-soft)] border-l-2 border-[var(--color-primary)] rounded-r-[var(--radius-control)] text-xs text-[var(--color-text)] italic leading-relaxed">
                      &ldquo;{criterion.sourceExcerpt}&rdquo;
                    </blockquote>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Required Documents Section */}
        <section
          aria-labelledby="required-docs-heading"
          className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h2 id="required-docs-heading" className="text-xl font-semibold text-[var(--color-text)]">
              Required Documents
            </h2>
          </div>
          <ol className="space-y-3 list-none pt-1">
            {scheme.requiredDocuments.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span
                  className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-primary)]"
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                <span className="text-sm sm:text-base text-[var(--color-text)] pt-0.5">
                  {doc}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* How to Apply Section */}
        <section
          aria-labelledby="how-to-apply-heading"
          className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2 id="how-to-apply-heading" className="text-xl font-semibold text-[var(--color-text)]">
              How to Apply
            </h2>
          </div>
          <ol className="space-y-4 list-none pt-1">
            {scheme.applicationSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-4 p-4 rounded-[var(--radius-control)] bg-[var(--color-bg)] border border-[var(--color-border)]"
              >
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold">
                  {idx + 1}
                </span>
                <div className="text-sm sm:text-base text-[var(--color-text)] leading-relaxed pt-0.5">
                  {step}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Sources Section */}
        <section
          aria-labelledby="sources-heading"
          className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--color-primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <h2 id="sources-heading" className="text-xl font-semibold text-[var(--color-text)]">
              Official Sources & References
            </h2>
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            This entry was compiled from official government publications:
          </p>

          <div className="space-y-3 pt-1">
            {scheme.sources.map((source) => (
              <article
                key={source.documentId}
                className="p-4 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {source.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
                    {source.department && <span>Dept: {source.department}</span>}
                    {source.pageNumbers && source.pageNumbers.length > 0 && (
                      <span>Pages: {source.pageNumbers.join(', ')}</span>
                    )}
                    {source.publicationDate && (
                      <span>Published: {source.publicationDate}</span>
                    )}
                  </div>
                </div>

                {source.sourceUrl && (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] shrink-0 transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    <span>View document</span>
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Verification and Disclaimer Footer */}
        <footer className="pt-6 pb-4 border-t border-[var(--color-border)] space-y-3 text-xs text-[var(--color-muted)]">
          {scheme.lastVerifiedDate && (
            <p>
              <strong className="font-semibold text-[var(--color-text)]">
                Last Verified Against Official Sources:
              </strong>{' '}
              {scheme.lastVerifiedDate}
            </p>
          )}
          <p className="leading-relaxed">
            <strong>Important Disclaimer:</strong> This portal is an informational assistant designed
            to help citizens understand government welfare schemes based on indexed official documents.
            It does not guarantee sanction, approval, or disbursement of benefits. Scheme guidelines,
            eligibility parameters, quotas, and application deadlines may be modified by the
            responsible department. Always verify current requirements on the official department
            portal or consult authorized service centers before submitting applications.
          </p>
        </footer>
      </div>
    </PageContainer>
  );
}
