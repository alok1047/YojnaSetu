import { describe, it, expect } from 'vitest';
import { evaluateSchemeEligibility, evaluateMultipleSchemes } from './engine';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';

describe('Eligibility Engine', () => {
  // Use NMMSS (education scholarship) — has age, income, minimum_marks criteria
  const nmmssScheme = SAMPLE_SCHEMES.find((s) => s.id === 'scheme-nmmss')!;

  it('finds the NMMSS scheme in dataset', () => {
    expect(nmmssScheme).toBeDefined();
    expect(nmmssScheme.eligibilityCriteria.length).toBeGreaterThanOrEqual(2);
  });

  it('evaluates as likely_eligible when all criteria are met', () => {
    const answers = {
      age: 15, // between [12, 18]
      annualIncome: 200000, // <= 350000
      customFields: {
        minimum_marks: 75, // >= 55
      },
    };

    const result = evaluateSchemeEligibility(nmmssScheme, answers);
    expect(result.outcome).toBe('likely_eligible');
    expect(result.missingInformation).toHaveLength(0);
    expect(result.criteria.every((c) => c.status === 'met')).toBe(true);
    expect(result.disclaimer).toBeTruthy();
  });

  it('evaluates as likely_not_eligible when any criterion is not met', () => {
    const answers = {
      age: 25, // out of range [12, 18]
      annualIncome: 200000,
      customFields: {
        minimum_marks: 75,
      },
    };

    const result = evaluateSchemeEligibility(nmmssScheme, answers);
    expect(result.outcome).toBe('likely_not_eligible');
    const ageCriterion = result.criteria.find((c) => c.criterionId === 'crit-nmmss-002');
    expect(ageCriterion?.status).toBe('not_met');
  });

  it('evaluates as insufficient_information when no answers are provided', () => {
    const result = evaluateSchemeEligibility(nmmssScheme, {});
    expect(result.outcome).toBe('insufficient_information');
    expect(result.missingInformation.length).toBeGreaterThan(0);
    expect(result.criteria.every((c) => c.status === 'unknown')).toBe(true);
  });

  it('evaluates as possibly_eligible when some criteria are met and required info is missing', () => {
    const answers = {
      age: 15, // meets age
      // missing annualIncome and minimum_marks
    };

    const result = evaluateSchemeEligibility(nmmssScheme, answers);
    expect(result.outcome).toBe('possibly_eligible');
    expect(result.missingInformation.length).toBeGreaterThan(0);
  });

  it('evaluates multiple schemes simultaneously', () => {
    const results = evaluateMultipleSchemes(SAMPLE_SCHEMES, {
      age: 22,
      annualIncome: 180000,
      state: 'Central',
    });

    expect(results).toHaveLength(SAMPLE_SCHEMES.length);
    expect(results[0].schemeId).toBe(SAMPLE_SCHEMES[0].id);
  });
});
