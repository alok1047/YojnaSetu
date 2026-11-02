export type SchemeCategory = 
  | 'education'
  | 'health'
  | 'housing'
  | 'agriculture'
  | 'employment'
  | 'social_security'
  | 'women_children'
  | 'disability'
  | 'pension'
  | 'other';

export type SchemeStatus = 'active' | 'discontinued' | 'unknown';

export interface SchemeSource {
  documentId: string;
  title: string;
  sourceUrl: string;
  pageNumbers?: number[];
  department?: string;
  publicationDate?: string;
  lastVerifiedDate?: string;
}

export interface EligibilityCriterion {
  id: string;
  field: string;
  label: string;
  description: string;
  type: 'age_range' | 'income_range' | 'category' | 'boolean' | 'state' | 'occupation' | 'custom';
  required: boolean;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'between' | 'exists';
  value: string | number | boolean | string[] | [number, number];
  sourceExcerpt?: string;
  citation?: SchemeSource;
}

export interface Scheme {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  benefits: string[];
  category: SchemeCategory;
  department: string;
  jurisdiction: string;
  targetGroup?: string;
  eligibilityCriteria: EligibilityCriterion[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl?: string;
  status: SchemeStatus;
  effectiveDate?: string;
  lastVerifiedDate?: string;
  sources: SchemeSource[];
  isSampleData: boolean;
}
