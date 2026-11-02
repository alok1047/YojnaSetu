'use client';

import { useState, useMemo } from 'react';
import { PageContainer, PageHeading, EmptyState, DisclaimerNotice } from '@/components/ui';
import { SchemeCard, SchemeFilters } from '@/components/schemes';
import { SAMPLE_SCHEMES, INDIAN_STATES, SCHEME_CATEGORIES } from '@/lib/data/sample-schemes';

export function SchemesPageClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const categories = useMemo(() => {
    return Object.entries(SCHEME_CATEGORIES).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  const filteredSchemes = useMemo(() => {
    return SAMPLE_SCHEMES.filter((scheme) => {
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
  }, [searchQuery, selectedCategory, selectedState]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedState('');
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <DisclaimerNotice
          variant="info"
          message="This directory uses sample data for demonstration. In production, schemes are sourced from official documents."
        />

        <PageHeading
          title="Explore Schemes"
          description="Browse and filter government welfare schemes by category, jurisdiction, and keywords with verified source citations."
        />

        <SchemeFilters
          categories={categories}
          states={INDIAN_STATES}
          selectedCategory={selectedCategory}
          selectedState={selectedState}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onStateChange={setSelectedState}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
          resultCount={filteredSchemes.length}
        />

        {filteredSchemes.length > 0 ? (
          <section aria-label="Schemes catalog" className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          </section>
        ) : (
          <div className="pt-4">
            <EmptyState
              title="No schemes found"
              description="We couldn't find any schemes matching your criteria. Try adjusting your search query or clearing some filters."
              action={{
                label: 'Clear all filters',
                onClick: handleClearFilters,
              }}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
