'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageContainer, PageHeading, EmptyState, DisclaimerNotice } from '@/components/ui';
import { SchemeCard, SchemeFilters } from '@/components/schemes';
import { SAMPLE_SCHEMES, INDIAN_STATES, SCHEME_CATEGORIES } from '@/lib/data/sample-schemes';
import { useLanguage } from '@/lib/context/LanguageContext';
import type { Scheme } from '@/lib/types';

interface SchemesPageClientProps {
  initialSchemes?: Scheme[];
}

export function SchemesPageClient({ initialSchemes }: SchemesPageClientProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const allSchemes = initialSchemes && initialSchemes.length > 0 ? initialSchemes : SAMPLE_SCHEMES;

  // Read filters directly from URL search parameters as single source of truth
  const selectedCategory = searchParams.get('category') || '';
  const selectedState = searchParams.get('state') || '';
  const urlQuery = searchParams.get('query') || searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [displayLimit, setDisplayLimit] = useState(24);

  const categories = useMemo(() => {
    return Object.entries(SCHEME_CATEGORIES).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  const filteredSchemes = useMemo(() => {
    return allSchemes.filter((scheme) => {
      // Search query filtering across name, summary, and department
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = scheme.name.toLowerCase().includes(query);
        const matchesSummary = scheme.summary.toLowerCase().includes(query);
        const matchesDepartment = scheme.department.toLowerCase().includes(query);

        if (!matchesName && !matchesSummary && !matchesDepartment) {
          return false;
        }
      }

      // Category filtering
      if (selectedCategory && scheme.category !== selectedCategory) {
        return false;
      }

      // State / Jurisdiction filtering
      // National/Central schemes are open to all states; state-specific schemes match selected state
      if (selectedState) {
        const schemeJurisdiction = scheme.jurisdiction.toLowerCase();
        const filterState = selectedState.toLowerCase();
        const isCentralOrNational =
          schemeJurisdiction === 'national' || schemeJurisdiction === 'central';
        const matchesState =
          schemeJurisdiction === filterState || schemeJurisdiction.includes(filterState);

        if (!isCentralOrNational && !matchesState) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedState, allSchemes]);

  // Update URL helper when filters change
  const updateUrlParams = useCallback(
    (newCategory: string, newState: string, newQuery: string) => {
      const params = new URLSearchParams();
      if (newCategory) params.set('category', newCategory);
      if (newState) params.set('state', newState);
      if (newQuery.trim()) params.set('query', newQuery.trim());

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router]
  );

  const handleCategoryChange = (cat: string) => {
    updateUrlParams(cat, selectedState, searchQuery);
  };

  const handleStateChange = (st: string) => {
    updateUrlParams(selectedCategory, st, searchQuery);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    updateUrlParams(selectedCategory, selectedState, q);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    router.replace(pathname, { scroll: false });
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <DisclaimerNotice
          variant="info"
          message={
            language === 'HI'
              ? 'यह निर्देशिका आधिकारिक सरकारी दस्तावेज़ों, पात्रता नियमों और आवेदन लिंक के साथ कल्याणकारी योजनाओं को सूचीबद्ध करती है।'
              : 'This directory indexes verified central and state welfare initiatives with official gazette citations, eligibility criteria, and application links.'
          }
        />

        <PageHeading
          title={language === 'HI' ? 'योजनाएं खोजें' : 'Explore Schemes'}
          description={
            language === 'HI'
              ? 'श्रेणी, राज्य और कीवर्ड के अनुसार सरकारी कल्याणकारी योजनाओं को फ़िल्टर करें।'
              : 'Browse and filter government welfare schemes by category, jurisdiction, and keywords with verified source citations.'
          }
        />

        <SchemeFilters
          categories={categories}
          states={INDIAN_STATES}
          selectedCategory={selectedCategory}
          selectedState={selectedState}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onStateChange={handleStateChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          resultCount={filteredSchemes.length}
        />

        {filteredSchemes.length > 0 ? (
          <section aria-label="Schemes catalog" className="pt-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.slice(0, displayLimit).map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>

            {filteredSchemes.length > displayLimit && (
              <div className="pt-4 pb-6 flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-[var(--color-muted)] font-medium">
                  {language === 'HI'
                    ? `${filteredSchemes.length} में से ${Math.min(displayLimit, filteredSchemes.length)} योजनाएं प्रदर्शित`
                    : `Showing ${Math.min(displayLimit, filteredSchemes.length)} of ${filteredSchemes.length} schemes`}
                </p>
                <button
                  type="button"
                  onClick={() => setDisplayLimit((prev) => prev + 24)}
                  className="px-6 py-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-accent-soft)] text-[var(--color-text)] text-sm font-semibold transition-all shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  {language === 'HI' ? 'और योजनाएं देखें' : 'Load More Schemes'}
                </button>
              </div>
            )}
          </section>
        ) : (
          <div className="pt-4">
            <EmptyState
              title={language === 'HI' ? 'कोई योजना नहीं मिली' : 'No schemes found'}
              description={
                language === 'HI'
                  ? 'आपके चयनित फ़िल्टर से कोई योजना मेल नहीं खाती। कृपया फ़िल्टर बदलें या सभी फ़िल्टर साफ़ करें।'
                  : "We couldn't find any schemes matching your criteria. Try adjusting your search query or clearing some filters."
              }
              action={{
                label: language === 'HI' ? 'सभी फ़िल्टर साफ़ करें' : 'Clear all filters',
                onClick: handleClearFilters,
              }}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
