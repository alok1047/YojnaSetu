import type {
  Scheme,
  EligibilityCriterion,
  EligibilityAnswers,
  SchemeEligibilityResult,
  SchemeCriterionResult,
  EligibilityCriterionStatus,
  EligibilityOutcome,
  SourceCitation,
} from '@/lib/types';

const DISCLAIMER =
  'This is a preliminary assessment based on the information you provided and the rules documented in the cited sources. It is NOT an official eligibility decision. Please confirm with the responsible government department or official portal.';

function mapCriterionToAnswerField(criterion: EligibilityCriterion): string | undefined {
  // Map criterion fields to EligibilityAnswers fields
  const fieldMap: Record<string, string> = {
    age: 'age',
    annual_family_income: 'annualIncome',
    annualIncome: 'annualIncome',
    occupation: 'occupation',
    gender: 'gender',
    category: 'category',
    is_student: 'isStudent',
    isStudent: 'isStudent',
    is_disabled: 'isDisabled',
    isDisabled: 'isDisabled',
    is_bpl: 'isBPL',
    isBPL: 'isBPL',
    state: 'state',
  };
  return fieldMap[criterion.field] || undefined;
}

function getAnswerValue(answers: EligibilityAnswers, field: string): string | number | boolean | undefined {
  const mapped = mapCriterionToAnswerField({ field } as EligibilityCriterion);
  if (!mapped) {
    // Check customFields
    return answers.customFields?.[field];
  }
  return (answers as Record<string, unknown>)[mapped] as string | number | boolean | undefined;
}

function evaluateCriterion(
  criterion: EligibilityCriterion,
  answers: EligibilityAnswers
): { status: EligibilityCriterionStatus; explanation: string } {
  const answerValue = getAnswerValue(answers, criterion.field);

  if (answerValue === undefined || answerValue === null) {
    return {
      status: 'unknown',
      explanation: `This criterion requires information about ${criterion.label.toLowerCase()} which was not provided.`,
    };
  }

  const { operator, value } = criterion;

  switch (operator) {
    case 'eq':
      if (answerValue === value) {
        return { status: 'met', explanation: `${criterion.label}: Your answer matches the requirement.` };
      }
      return {
        status: 'not_met',
        explanation: `${criterion.label}: The requirement is ${JSON.stringify(value)}, but your answer is ${JSON.stringify(answerValue)}.`,
      };

    case 'neq':
      if (answerValue !== value) {
        return { status: 'met', explanation: `${criterion.label}: Your answer meets this criterion.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: Your answer does not meet this criterion.` };

    case 'gt':
      if (typeof answerValue === 'number' && typeof value === 'number' && answerValue > value) {
        return { status: 'met', explanation: `${criterion.label}: ${answerValue} is above the minimum of ${value}.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: ${answerValue} does not exceed ${value}.` };

    case 'gte':
      if (typeof answerValue === 'number' && typeof value === 'number' && answerValue >= value) {
        return {
          status: 'met',
          explanation: `${criterion.label}: ${answerValue} meets or exceeds the requirement of ${value}.`,
        };
      }
      return { status: 'not_met', explanation: `${criterion.label}: ${answerValue} is below the required ${value}.` };

    case 'lt':
      if (typeof answerValue === 'number' && typeof value === 'number' && answerValue < value) {
        return { status: 'met', explanation: `${criterion.label}: ${answerValue} is below the maximum of ${value}.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: ${answerValue} exceeds the limit of ${value}.` };

    case 'lte':
      if (typeof answerValue === 'number' && typeof value === 'number' && answerValue <= value) {
        return { status: 'met', explanation: `${criterion.label}: ${answerValue} is within the limit of ${value}.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: ${answerValue} exceeds the maximum of ${value}.` };

    case 'in':
      if (Array.isArray(value) && (value as unknown[]).includes(answerValue)) {
        return { status: 'met', explanation: `${criterion.label}: Your answer is in the accepted list.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: Your answer is not in the accepted list.` };

    case 'not_in':
      if (Array.isArray(value) && !(value as unknown[]).includes(answerValue)) {
        return { status: 'met', explanation: `${criterion.label}: Your answer meets this criterion.` };
      }
      return { status: 'not_met', explanation: `${criterion.label}: Your answer falls in the excluded list.` };

    case 'between':
      if (Array.isArray(value) && value.length === 2 && typeof answerValue === 'number') {
        const [min, max] = value as [number, number];
        if (answerValue >= min && answerValue <= max) {
          return {
            status: 'met',
            explanation: `${criterion.label}: ${answerValue} is within the range of ${min} to ${max}.`,
          };
        }
        return {
          status: 'not_met',
          explanation: `${criterion.label}: ${answerValue} is outside the required range of ${min} to ${max}.`,
        };
      }
      return { status: 'unknown', explanation: `${criterion.label}: Could not evaluate this range criterion.` };

    case 'exists':
      return { status: 'met', explanation: `${criterion.label}: Information was provided.` };

    default:
      return { status: 'unknown', explanation: `${criterion.label}: Unknown evaluation operator.` };
  }
}

function buildCitationFromCriterion(criterion: EligibilityCriterion): SourceCitation[] {
  if (!criterion.citation) return [];
  return [
    {
      documentId: criterion.citation.documentId,
      title: criterion.citation.title,
      sourceUrl: criterion.citation.sourceUrl,
      pageNumber: criterion.citation.pageNumbers?.[0],
      chunkId: `criterion-${criterion.id}`,
      excerpt: criterion.sourceExcerpt,
    },
  ];
}

function determineOutcome(results: SchemeCriterionResult[], missingInfo: string[]): EligibilityOutcome {
  const hasNotMet = results.some((r) => r.status === 'not_met');
  const hasUnknown = results.some((r) => r.status === 'unknown');
  const allMet = results.every((r) => r.status === 'met');

  if (hasNotMet) return 'likely_not_eligible';
  if (allMet && missingInfo.length === 0) return 'likely_eligible';
  if (hasUnknown || missingInfo.length > 0) {
    const metCount = results.filter((r) => r.status === 'met').length;
    if (metCount > 0) return 'possibly_eligible';
    return 'insufficient_information';
  }
  return 'possibly_eligible';
}

export function evaluateSchemeEligibility(
  scheme: Scheme,
  answers: EligibilityAnswers
): SchemeEligibilityResult {
  const criteriaResults: SchemeCriterionResult[] = [];
  const missingInformation: string[] = [];

  for (const criterion of scheme.eligibilityCriteria) {
    const { status, explanation } = evaluateCriterion(criterion, answers);
    const citations = buildCitationFromCriterion(criterion);

    criteriaResults.push({
      criterionId: criterion.id,
      criterion: criterion.description,
      status,
      explanation,
      citations,
    });

    if (status === 'unknown' && criterion.required) {
      missingInformation.push(criterion.label);
    }
  }

  const outcome = determineOutcome(criteriaResults, missingInformation);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    outcome,
    criteria: criteriaResults,
    missingInformation,
    disclaimer: DISCLAIMER,
  };
}

export function evaluateMultipleSchemes(
  schemes: Scheme[],
  answers: EligibilityAnswers
): SchemeEligibilityResult[] {
  return schemes.map((scheme) => evaluateSchemeEligibility(scheme, answers));
}
