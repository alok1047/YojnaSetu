import { describe, it, expect } from 'vitest';
import {
  SAMPLE_SCHEMES,
  INDIAN_STATES,
  SCHEME_CATEGORIES,
} from './sample-schemes';
import type { SchemeCategory } from '@/lib/types';

describe('SAMPLE_SCHEMES dataset', () => {
  it('contains at least 18 real government schemes', () => {
    expect(SAMPLE_SCHEMES.length).toBeGreaterThanOrEqual(18);
  });

  it('marks every scheme as real (non-sample) data', () => {
    SAMPLE_SCHEMES.forEach((scheme) => {
      expect(scheme.isSampleData).toBe(false);
      expect(scheme.status).toBe('active');
    });
  });

  it('covers all required categories', () => {
    const requiredCategories: SchemeCategory[] = [
      'education',
      'health',
      'housing',
      'agriculture',
      'employment',
      'social_security',
      'women_children',
      'disability',
      'pension',
    ];

    const presentCategories = new Set(SAMPLE_SCHEMES.map((s) => s.category));
    requiredCategories.forEach((cat) => {
      expect(presentCategories.has(cat)).toBe(true);
    });
  });

  it('provides at least 2 eligibility criteria per scheme', () => {
    SAMPLE_SCHEMES.forEach((scheme) => {
      expect(scheme.eligibilityCriteria.length).toBeGreaterThanOrEqual(2);
      scheme.eligibilityCriteria.forEach((criterion) => {
        expect(criterion.id).toBeTruthy();
        expect(criterion.field).toBeTruthy();
        expect(criterion.label).toBeTruthy();
        expect(criterion.description).toBeTruthy();
        expect(criterion.type).toBeTruthy();
        expect(criterion.operator).toBeTruthy();
        expect(criterion.value).toBeDefined();
      });
    });
  });

  it('includes required fields on all schemes', () => {
    SAMPLE_SCHEMES.forEach((scheme) => {
      expect(scheme.id).toBeTruthy();
      expect(scheme.name).toBeTruthy();
      expect(scheme.slug).toBeTruthy();
      expect(scheme.summary).toBeTruthy();
      expect(scheme.description).toBeTruthy();
      expect(scheme.department).toBeTruthy();
      expect(scheme.jurisdiction).toBeTruthy();
      expect(scheme.benefits.length).toBeGreaterThan(0);
      expect(scheme.requiredDocuments.length).toBeGreaterThan(0);
      expect(scheme.applicationSteps.length).toBeGreaterThan(0);
      expect(scheme.sources.length).toBeGreaterThan(0);
      expect(scheme.officialUrl).toBeTruthy();
    });
  });

  it('has unique IDs and slugs across all schemes', () => {
    const ids = SAMPLE_SCHEMES.map((s) => s.id);
    const slugs = SAMPLE_SCHEMES.map((s) => s.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('INDIAN_STATES', () => {
  it('contains 36 entries (28 States + 8 Union Territories)', () => {
    expect(INDIAN_STATES).toHaveLength(36);
  });

  it('includes major states and UTs', () => {
    expect(INDIAN_STATES).toContain('Uttar Pradesh');
    expect(INDIAN_STATES).toContain('Maharashtra');
    expect(INDIAN_STATES).toContain('Delhi');
    expect(INDIAN_STATES).toContain('Jammu and Kashmir');
    expect(INDIAN_STATES).toContain('Ladakh');
  });
});

describe('SCHEME_CATEGORIES', () => {
  it('maps all SchemeCategory values to display labels', () => {
    expect(SCHEME_CATEGORIES.education).toBe('Education');
    expect(SCHEME_CATEGORIES.health).toBe('Health');
    expect(SCHEME_CATEGORIES.housing).toBe('Housing');
    expect(SCHEME_CATEGORIES.agriculture).toBe('Agriculture');
    expect(SCHEME_CATEGORIES.employment).toBe('Employment');
    expect(SCHEME_CATEGORIES.social_security).toBe('Social Security');
  });
});
