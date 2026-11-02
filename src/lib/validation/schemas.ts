import { z } from 'zod';

export const chatRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(2000, 'Question is too long'),
  filters: z.object({
    state: z.string().optional(),
    category: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
  conversationId: z.string().optional(),
});

export const eligibilityEvaluateSchema = z.object({
  schemeIds: z.array(z.string()).min(1, 'Select at least one scheme'),
  answers: z.object({
    state: z.string().optional(),
    age: z.number().int().min(0).max(150).optional(),
    annualIncome: z.number().min(0).optional(),
    occupation: z.string().optional(),
    gender: z.string().optional(),
    category: z.string().optional(),
    isStudent: z.boolean().optional(),
    isDisabled: z.boolean().optional(),
    isBPL: z.boolean().optional(),
    customFields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),
});

export const schemeSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type EligibilityEvaluateInput = z.infer<typeof eligibilityEvaluateSchema>;
export type SchemeSearchInput = z.infer<typeof schemeSearchSchema>;
