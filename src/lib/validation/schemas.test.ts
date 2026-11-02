import { describe, it, expect } from 'vitest';
import {
  chatRequestSchema,
  eligibilityEvaluateSchema,
  schemeSearchSchema,
} from './schemas';

describe('chatRequestSchema', () => {
  it('validates a correct question', () => {
    const valid = chatRequestSchema.safeParse({
      question: 'What schemes are available for farmers?',
      filters: { state: 'Punjab', category: 'agriculture' },
    });
    expect(valid.success).toBe(true);
  });

  it('rejects questions shorter than 3 characters', () => {
    const invalid = chatRequestSchema.safeParse({ question: 'hi' });
    expect(invalid.success).toBe(false);
  });

  it('rejects questions longer than 2000 characters', () => {
    const invalid = chatRequestSchema.safeParse({ question: 'a'.repeat(2001) });
    expect(invalid.success).toBe(false);
  });
});

describe('eligibilityEvaluateSchema', () => {
  it('validates valid schemeIds and answers', () => {
    const result = eligibilityEvaluateSchema.safeParse({
      schemeIds: ['scheme-1'],
      answers: {
        age: 25,
        annualIncome: 150000,
        state: 'Delhi',
        isStudent: true,
        customFields: { enrolledInCollege: true },
      },
    });
    expect(result.success).toBe(true);
  });

  it('fails when schemeIds is empty', () => {
    const result = eligibilityEvaluateSchema.safeParse({
      schemeIds: [],
      answers: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('schemeSearchSchema', () => {
  it('defaults page and limit properly', () => {
    const result = schemeSearchSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(12);
    }
  });

  it('coerces string page and limit parameters', () => {
    const result = schemeSearchSchema.safeParse({
      page: '3',
      limit: '20',
      category: 'education',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(20);
    }
  });
});
