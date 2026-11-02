
export type EligibilityCriterionStatus = 'met' | 'not_met' | 'unknown';

export type EligibilityOutcome =
  | 'likely_eligible'
  | 'possibly_eligible'
  | 'likely_not_eligible'
  | 'insufficient_information';

export interface SchemeCriterionResult {
  criterionId: string;
  criterion: string;
  status: EligibilityCriterionStatus;
  explanation: string;
  citations: SourceCitation[];
}

export interface SchemeEligibilityResult {
  schemeId: string;
  schemeName: string;
  outcome: EligibilityOutcome;
  criteria: SchemeCriterionResult[];
  missingInformation: string[];
  disclaimer: string;
}

export interface EligibilityAnswers {
  state?: string;
  age?: number;
  annualIncome?: number;
  occupation?: string;
  gender?: string;
  category?: string;
  isStudent?: boolean;
  isDisabled?: boolean;
  isBPL?: boolean;
  customFields?: Record<string, string | number | boolean>;
}

export interface SourceCitation {
  documentId: string;
  title: string;
  sourceUrl: string;
  pageNumber?: number;
  chunkId: string;
  excerpt?: string;
}
