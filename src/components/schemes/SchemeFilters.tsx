'use client';

import { SearchInput, Button } from '@/components/ui';

export interface SchemeFiltersProps {
  categories: { value: string; label: string }[];
  states: string[];
  selectedCategory: string;
  selectedState: string;
  searchQuery: string;
  onCategoryChange: (cat: string) => void;
  onStateChange: (state: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export function SchemeFilters({
  categories,
  states,
  selectedCategory,
  selectedState,
  searchQuery,
  onCategoryChange,
  onStateChange,
  onSearchChange,
  onClearFilters,
  resultCount,
}: SchemeFiltersProps) {
  const hasActiveFilters = Boolean(
    (selectedCategory && selectedCategory.trim()) ||
    (selectedState && selectedState.trim()) ||
    (searchQuery && searchQuery.trim())
  );

  const activeCategoryLabel =
    categories.find((c) => c.value === selectedCategory)?.label ?? selectedCategory;

  return (
    <section
      aria-label="Scheme search and filters"
      className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] flex flex-col gap-5"
    >
      {/* Primary search and dropdown inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search input */}
        <div className="md:col-span-6">
          <label
            htmlFor="scheme-search-input"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5"
          >
            Search Schemes
          </label>
          <SearchInput
            id="scheme-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={(query) => onSearchChange(query)}
            placeholder="Search by scheme name, department, or keyword…"
            aria-label="Search schemes"
          />
        </div>

        {/* Category select */}
        <div className="md:col-span-3">
          <label
            htmlFor="scheme-category-select"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5"
          >
            Category
          </label>
          <select
            id="scheme-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* State select */}
        <div className="md:col-span-3">
          <label
            htmlFor="scheme-state-select"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5"
          >
            State / Jurisdiction
          </label>
          <select
            id="scheme-state-select"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-3 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow cursor-pointer"
          >
            <option value="">All States & UTs</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter status row: Active chips, results count, and clear button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
        {/* Results count & Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-muted)] mr-1">
            {resultCount === 0 ? (
              'No schemes found'
            ) : (
              <>
                Showing <strong className="font-semibold text-[var(--color-text)]">{resultCount}</strong>{' '}
                {resultCount === 1 ? 'scheme' : 'schemes'}
              </>
            )}
          </span>

          {/* Active chips */}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-primary)] text-xs font-medium rounded-full">
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-[var(--color-primary-hover)] p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                aria-label="Remove search query filter"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-primary)] text-xs font-medium rounded-full">
              <span>Category: {activeCategoryLabel}</span>
              <button
                type="button"
                onClick={() => onCategoryChange('')}
                className="hover:text-[var(--color-primary-hover)] p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                aria-label={`Remove ${activeCategoryLabel} category filter`}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}

          {selectedState && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-accent-soft)] text-[var(--color-primary)] text-xs font-medium rounded-full">
              <span>State: {selectedState}</span>
              <button
                type="button"
                onClick={() => onStateChange('')}
                className="hover:text-[var(--color-primary-hover)] p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                aria-label={`Remove ${selectedState} state filter`}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
