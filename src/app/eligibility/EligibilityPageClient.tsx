'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type {
  SchemeEligibilityResult,
  EligibilityOutcome,
  EligibilityCriterionStatus,
  EligibilityAnswers,
} from '@/lib/types';
import {
  PageContainer,
  PageHeading,
  Button,
  DisclaimerNotice,
  LoadingSkeleton,
  ErrorState,
} from '@/components/ui';
import { SAMPLE_SCHEMES, INDIAN_STATES, SCHEME_CATEGORIES } from '@/lib/data/sample-schemes';
import { evaluateSchemeEligibility } from '@/lib/eligibility/engine';

const STEPS = [
  { id: 0, title: 'Introduction' },
  { id: 1, title: 'Region & Category' },
  { id: 2, title: 'Select Schemes' },
  { id: 3, title: 'Questionnaire' },
  { id: 4, title: 'Evaluation Results' },
] as const;

export function EligibilityPageClient() {
  const searchParams = useSearchParams();
  const schemeParam = searchParams.get('scheme');

  const matchedInitialScheme = useMemo(() => {
    return schemeParam ? SAMPLE_SCHEMES.find((s) => s.slug === schemeParam) : null;
  }, [schemeParam]);

  const [step, setStep] = useState<number>(() => (matchedInitialScheme ? 2 : 0));
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    matchedInitialScheme ? matchedInitialScheme.category : ''
  );
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>(() =>
    matchedInitialScheme ? [matchedInitialScheme.id] : []
  );

  // Form answer fields
  const [age, setAge] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [preferNotToSayIncome, setPreferNotToSayIncome] = useState<boolean>(false);
  const [occupation, setOccupation] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<string>('');
  const [minimumMarks, setMinimumMarks] = useState<string>('');
  const [landholding, setLandholding] = useState<string>('');
  const [ownsPuccaHouse, setOwnsPuccaHouse] = useState<string>(''); // 'yes' | 'no' | 'prefer_not_to_say'
  const [hasCorporateInsurance, setHasCorporateInsurance] = useState<string>(''); // 'yes' | 'no' | 'prefer_not_to_say'
  const [hasOtherPension, setHasOtherPension] = useState<string>(''); // 'yes' | 'no' | 'prefer_not_to_say'

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResults, setEvaluationResults] = useState<SchemeEligibilityResult[]>([]);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Schemes filtered by step 1 inputs
  const matchingSchemes = useMemo(() => {
    return SAMPLE_SCHEMES.filter((scheme) => {
      if (selectedCategory && scheme.category !== selectedCategory) {
        return false;
      }
      if (selectedState) {
        const j = scheme.jurisdiction.toLowerCase();
        const s = selectedState.toLowerCase();
        const isCentral = j === 'national' || j === 'central';
        if (!isCentral && j !== s && !j.includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedState]);

  // Selected Scheme objects
  const selectedSchemes = useMemo(() => {
    return SAMPLE_SCHEMES.filter((s) => selectedSchemeIds.includes(s.id));
  }, [selectedSchemeIds]);

  // Calculate distinct required criteria fields among selected schemes
  const requiredFields = useMemo(() => {
    const fields = new Set<string>();
    for (const scheme of selectedSchemes) {
      for (const crit of scheme.eligibilityCriteria) {
        fields.add(crit.field);
      }
    }
    return fields;
  }, [selectedSchemes]);

  // Toggle scheme selection in Step 2
  const toggleSchemeSelection = (id: string) => {
    setSelectedSchemeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSchemes = () => {
    setSelectedSchemeIds(matchingSchemes.map((s) => s.id));
  };

  const handleDeselectAllSchemes = () => {
    setSelectedSchemeIds([]);
  };

  // Compile answers into typed request
  const buildAnswersPayload = useCallback((): EligibilityAnswers => {
    const payload: EligibilityAnswers = {
      state: selectedState || undefined,
    };

    if (age.trim() !== '') {
      payload.age = Number(age);
    }

    if (!preferNotToSayIncome && income.trim() !== '') {
      payload.annualIncome = Number(income);
    }

    if (occupation.trim() !== '') {
      payload.occupation = occupation;
    }

    const custom: Record<string, string | number | boolean> = {};

    if (employmentStatus.trim() !== '') {
      custom.employment_status = employmentStatus;
    }

    if (minimumMarks.trim() !== '') {
      custom.minimum_marks = Number(minimumMarks);
    }

    if (landholding.trim() !== '') {
      custom.landholding_hectares = Number(landholding);
    }

    if (ownsPuccaHouse === 'yes') {
      custom.owns_pucca_house = true;
    } else if (ownsPuccaHouse === 'no') {
      custom.owns_pucca_house = false;
    }

    if (hasCorporateInsurance === 'yes') {
      custom.has_corporate_or_esi_insurance = true;
    } else if (hasCorporateInsurance === 'no') {
      custom.has_corporate_or_esi_insurance = false;
    }

    if (hasOtherPension === 'yes') {
      custom.has_other_pension = true;
    } else if (hasOtherPension === 'no') {
      custom.has_other_pension = false;
    }

    if (Object.keys(custom).length > 0) {
      payload.customFields = custom;
    }

    return payload;
  }, [
    selectedState,
    age,
    income,
    preferNotToSayIncome,
    occupation,
    employmentStatus,
    minimumMarks,
    landholding,
    ownsPuccaHouse,
    hasCorporateInsurance,
    hasOtherPension,
  ]);

  // Execute eligibility evaluation (calls POST /api/eligibility/evaluate with local deterministic fallback)
  const handleEvaluate = async () => {
    if (selectedSchemes.length === 0) return;

    setIsEvaluating(true);
    setEvalError(null);
    setStep(4);

    const answersPayload = buildAnswersPayload();

    try {
      const response = await fetch('/api/eligibility/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemeIds: selectedSchemeIds,
          answers: answersPayload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.results)) {
          setEvaluationResults(data.results);
          return;
        }
      }

      // If API route is not present (e.g. 404) or fails, fall back gracefully to local deterministic evaluator
      const fallbackResults: SchemeEligibilityResult[] = selectedSchemes.map((scheme) =>
        evaluateSchemeEligibility(scheme, answersPayload)
      );
      setEvaluationResults(fallbackResults);
    } catch {
      // Offline or network error: evaluate locally
      const fallbackResults: SchemeEligibilityResult[] = selectedSchemes.map((scheme) =>
        evaluateSchemeEligibility(scheme, answersPayload)
      );
      setEvaluationResults(fallbackResults);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Group results by outcome
  const groupedResults = useMemo(() => {
    const groups: Record<EligibilityOutcome, SchemeEligibilityResult[]> = {
      likely_eligible: [],
      possibly_eligible: [],
      likely_not_eligible: [],
      insufficient_information: [],
    };

    for (const res of evaluationResults) {
      if (groups[res.outcome]) {
        groups[res.outcome].push(res);
      }
    }

    return groups;
  }, [evaluationResults]);

  const outcomeBadge = (outcome: EligibilityOutcome) => {
    switch (outcome) {
      case 'likely_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Likely Eligible
          </span>
        );
      case 'possibly_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Possibly Eligible
          </span>
        );
      case 'likely_not_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Likely Not Eligible
          </span>
        );
      case 'insufficient_information':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Insufficient Information
          </span>
        );
    }
  };

  const statusBadge = (status: EligibilityCriterionStatus) => {
    switch (status) {
      case 'met':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Met
          </span>
        );
      case 'not_met':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-danger)]">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Not Met
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-muted)]">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Unknown
          </span>
        );
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeading
          title="Check Potential Eligibility"
          description="Evaluate your profile against published criteria in official government scheme guidelines."
        />

        {/* Progress Bar */}
        <nav aria-label="Eligibility Evaluation Steps">
          <ol className="grid grid-cols-5 gap-2 border-b border-[var(--color-border)] pb-4 text-xs font-medium">
            {STEPS.map((s) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <li
                  key={s.id}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'text-[var(--color-primary)] font-bold'
                      : isPast
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-muted)] opacity-60'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] shrink-0 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : isPast
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-primary)]'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isPast ? '✓' : s.id + 1}
                  </span>
                  <span className="hidden sm:inline truncate">{s.title}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ================= STEP 0: INTRO ================= */}
        {step === 0 && (
          <section
            aria-labelledby="step-0-heading"
            className="p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-6"
          >
            <div>
              <h2 id="step-0-heading" className="text-xl font-bold text-[var(--color-text)]">
                About the Potential Eligibility Checker
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                This rule-based tool evaluates self-reported details against codified requirements
                published in government documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-[var(--radius-control)] bg-[var(--color-accent-soft)] border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <svg
                    className="w-4 h-4 text-emerald-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  What This Tool Does
                </div>
                <ul className="text-xs text-[var(--color-text)] space-y-1.5 list-disc pl-4">
                  <li>Transparently tests your answers against official scheme requirements.</li>
                  <li>Highlights exact criteria that are satisfied, unmet, or missing.</li>
                  <li>Points to official citations and page numbers for verification.</li>
                  <li>Minimizes personal questions to only what the chosen schemes require.</li>
                </ul>
              </div>

              <div className="p-4 rounded-[var(--radius-control)] bg-[var(--color-warning-soft)] border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-warning)] font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  What This Tool Does NOT Do
                </div>
                <ul className="text-xs text-[var(--color-text)] space-y-1.5 list-disc pl-4">
                  <li>Does NOT submit an official application on your behalf.</li>
                  <li>Does NOT guarantee or grant official approval or benefit sanction.</li>
                  <li>Never requests Aadhaar, PAN card, or bank account credentials.</li>
                  <li>Does NOT store or distribute your personal questionnaire responses.</li>
                </ul>
              </div>
            </div>

            <DisclaimerNotice
              variant="info"
              message="Strict Privacy: Your answers are evaluated in-session. No personal records, Aadhaar numbers, or demographic data are retained or transmitted to third parties."
            />

            <div className="pt-4 flex justify-end">
              <Button type="button" size="lg" onClick={() => setStep(1)}>
                <span>Start Eligibility Check</span>
                <svg
                  className="w-4 h-4 ml-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </div>
          </section>
        )}

        {/* ================= STEP 1: REGION & CATEGORY ================= */}
        {step === 1 && (
          <section
            aria-labelledby="step-1-heading"
            className="p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-6"
          >
            <div>
              <h2 id="step-1-heading" className="text-xl font-bold text-[var(--color-text)]">
                Step 1: Jurisdiction & Interest Area
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Optionally filter schemes by your state or desired category to narrow down the
                questionnaire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* State Selection */}
              <div>
                <label
                  htmlFor="eligibility-state"
                  className="block text-sm font-semibold text-[var(--color-text)] mb-2"
                >
                  State / Union Territory (Optional)
                </label>
                <select
                  id="eligibility-state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
                >
                  <option value="">All States & Union Territories (Central/National)</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Central and national welfare schemes apply to all citizens regardless of state.
                </p>
              </div>

              {/* Category Selection */}
              <div>
                <label
                  htmlFor="eligibility-category"
                  className="block text-sm font-semibold text-[var(--color-text)] mb-2"
                >
                  Scheme Category (Optional)
                </label>
                <select
                  id="eligibility-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
                >
                  <option value="">All Categories</option>
                  {Object.entries(SCHEME_CATEGORIES).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Select a category (e.g., Education, Health, Housing) or leave open to explore all.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                <span>Continue to Schemes</span>
                <span className="text-xs opacity-75">
                  ({matchingSchemes.length} available)
                </span>
              </Button>
            </div>
          </section>
        )}

        {/* ================= STEP 2: SELECT SCHEMES ================= */}
        {step === 2 && (
          <section
            aria-labelledby="step-2-heading"
            className="p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 id="step-2-heading" className="text-xl font-bold text-[var(--color-text)]">
                  Step 2: Select Schemes to Check
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Choose one or more welfare programs. You will only be asked questions relevant to
                  your chosen schemes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllSchemes}
                  className="text-xs"
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAllSchemes}
                  className="text-xs"
                >
                  Deselect all
                </Button>
              </div>
            </div>

            {matchingSchemes.length === 0 ? (
              <div className="p-8 text-center bg-[var(--color-bg)] rounded-[var(--radius-control)]">
                <p className="text-sm text-[var(--color-muted)]">
                  No schemes match your selected region and category filters.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedState('');
                  }}
                  className="mt-4"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {matchingSchemes.map((scheme) => {
                  const isChecked = selectedSchemeIds.includes(scheme.id);
                  return (
                    <div
                      key={scheme.id}
                      onClick={() => toggleSchemeSelection(scheme.id)}
                      className={`p-4 rounded-[var(--radius-control)] border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'border-[var(--color-primary)] bg-[var(--color-accent-soft)] shadow-sm'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`scheme-chk-${scheme.id}`}
                        checked={isChecked}
                        onChange={() => {}} // Controlled by wrapper click
                        className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                        aria-labelledby={`scheme-label-${scheme.id}`}
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            id={`scheme-label-${scheme.id}`}
                            className="font-semibold text-sm text-[var(--color-text)] cursor-pointer"
                          >
                            {scheme.name}
                          </label>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-muted)] border border-[var(--color-border)]">
                            {SCHEME_CATEGORIES[scheme.category] ?? scheme.category}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">
                          {scheme.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={selectedSchemeIds.length === 0}
                onClick={() => setStep(3)}
              >
                Continue to Questions ({selectedSchemeIds.length} selected)
              </Button>
            </div>
          </section>
        )}

        {/* ================= STEP 3: DYNAMIC QUESTIONNAIRE ================= */}
        {step === 3 && (
          <section
            aria-labelledby="step-3-heading"
            className="p-6 sm:p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-6"
          >
            <div>
              <h2 id="step-3-heading" className="text-xl font-bold text-[var(--color-text)]">
                Step 3: Eligibility Questionnaire
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                We only ask for fields explicitly evaluated by your {selectedSchemes.length} chosen
                schemes. Sensitive questions offer a &ldquo;Prefer not to say&rdquo; option.
              </p>
            </div>

            <div className="space-y-6 divide-y divide-[var(--color-border)]">
              {/* Question: Age */}
              {requiredFields.has('age') && (
                <div className="pt-4 first:pt-0 space-y-2">
                  <label
                    htmlFor="question-age"
                    className="block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Applicant Age (in completed years)
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Verified against target age bands (e.g.,
                    scholarship eligibility between 17–25 years or senior citizen pension at 60+).
                  </p>
                  <input
                    id="question-age"
                    type="number"
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 21"
                    className="w-full sm:w-64 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Question: Annual Family Income */}
              {requiredFields.has('annual_family_income') && (
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="question-income"
                      className="block text-sm font-semibold text-[var(--color-text)]"
                    >
                      Total Annual Household Income (₹)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[var(--color-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferNotToSayIncome}
                        onChange={(e) => {
                          setPreferNotToSayIncome(e.target.checked);
                          if (e.target.checked) setIncome('');
                        }}
                        className="rounded border-[var(--color-border)] text-[var(--color-primary)]"
                      />
                      <span>Prefer not to say</span>
                    </label>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Government welfare ceilings restrict benefits to
                    families below specified income limits (e.g. ₹3,00,000 for higher education aid).
                  </p>
                  <input
                    id="question-income"
                    type="number"
                    min="0"
                    disabled={preferNotToSayIncome}
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g. 180000"
                    className="w-full sm:w-64 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                  />
                </div>
              )}

              {/* Question: Minimum Marks / Percentage */}
              {requiredFields.has('minimum_marks') && (
                <div className="pt-4 space-y-2">
                  <label
                    htmlFor="question-marks"
                    className="block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Class 12 / Qualifying Examination Marks (%)
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Merit scholarships require achieving an aggregate
                    percentage threshold (e.g. 60% minimum).
                  </p>
                  <input
                    id="question-marks"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={minimumMarks}
                    onChange={(e) => setMinimumMarks(e.target.value)}
                    placeholder="e.g. 75.5"
                    className="w-full sm:w-64 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Question: Occupation */}
              {requiredFields.has('occupation') && (
                <div className="pt-4 space-y-2">
                  <label
                    htmlFor="question-occupation"
                    className="block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Current Primary Occupation
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Evaluates target beneficiary categories like
                    farmers, daily-wage laborers, or students.
                  </p>
                  <select
                    id="question-occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full sm:w-72 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">Select occupation…</option>
                    <option value="farmer">Farmer / Cultivator</option>
                    <option value="student">Student / Scholar</option>
                    <option value="unemployed">Unemployed / Job Seeker</option>
                    <option value="informal_worker">Daily Wage / Informal Worker</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="self_employed">Self Employed / Small Business</option>
                    <option value="retired">Retired / Senior Citizen</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Question: Employment Status */}
              {requiredFields.has('employment_status') && (
                <div className="pt-4 space-y-2">
                  <label
                    htmlFor="question-emp-status"
                    className="block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Current Employment Status
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Apprenticeship schemes require participants to not
                    hold full-time formal employment at enrollment.
                  </p>
                  <select
                    id="question-emp-status"
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full sm:w-72 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">Select employment status…</option>
                    <option value="unemployed">Unemployed / Seeking Apprenticeship</option>
                    <option value="student">Enrolled Student</option>
                    <option value="employed">Full-Time Employed</option>
                    <option value="part_time">Part-Time / Gig Worker</option>
                  </select>
                </div>
              )}

              {/* Question: Cultivable Landholding */}
              {requiredFields.has('landholding_hectares') && (
                <div className="pt-4 space-y-2">
                  <label
                    htmlFor="question-land"
                    className="block text-sm font-semibold text-[var(--color-text)]"
                  >
                    Cultivable Landholding (Hectares)
                  </label>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Kisan input grants apply specifically to small and
                    marginal farmers holding up to 2.0 hectares.
                  </p>
                  <input
                    id="question-land"
                    type="number"
                    min="0"
                    step="0.01"
                    value={landholding}
                    onChange={(e) => setLandholding(e.target.value)}
                    placeholder="e.g. 1.2"
                    className="w-full sm:w-64 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-control)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Question: Permanent (Pucca) House Ownership */}
              {requiredFields.has('owns_pucca_house') && (
                <fieldset className="pt-4 space-y-2">
                  <legend className="block text-sm font-semibold text-[var(--color-text)]">
                    Does your household own a permanent (pucca) house in India?
                  </legend>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Housing subsidy grants prioritize homeless
                    families or those residing in kutcha/dilapidated shelters.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="pucca-house"
                        value="yes"
                        checked={ownsPuccaHouse === 'yes'}
                        onChange={(e) => setOwnsPuccaHouse(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="pucca-house"
                        value="no"
                        checked={ownsPuccaHouse === 'no'}
                        onChange={(e) => setOwnsPuccaHouse(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
                      <input
                        type="radio"
                        name="pucca-house"
                        value="prefer_not_to_say"
                        checked={ownsPuccaHouse === 'prefer_not_to_say'}
                        onChange={(e) => setOwnsPuccaHouse(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Prefer not to say</span>
                    </label>
                  </div>
                </fieldset>
              )}

              {/* Question: Corporate / ESI Health Coverage */}
              {requiredFields.has('has_corporate_or_esi_insurance') && (
                <fieldset className="pt-4 space-y-2">
                  <legend className="block text-sm font-semibold text-[var(--color-text)]">
                    Are you or family members covered by corporate health insurance or ESI?
                  </legend>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Universal health assurance targets households
                    without existing formal medical coverage.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="corp-ins"
                        value="yes"
                        checked={hasCorporateInsurance === 'yes'}
                        onChange={(e) => setHasCorporateInsurance(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="corp-ins"
                        value="no"
                        checked={hasCorporateInsurance === 'no'}
                        onChange={(e) => setHasCorporateInsurance(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
                      <input
                        type="radio"
                        name="corp-ins"
                        value="prefer_not_to_say"
                        checked={hasCorporateInsurance === 'prefer_not_to_say'}
                        onChange={(e) => setHasCorporateInsurance(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Prefer not to say</span>
                    </label>
                  </div>
                </fieldset>
              )}

              {/* Question: Other Statutory Pension */}
              {requiredFields.has('has_other_pension') && (
                <fieldset className="pt-4 space-y-2">
                  <legend className="block text-sm font-semibold text-[var(--color-text)]">
                    Do you currently receive another statutory or government pension?
                  </legend>
                  <p className="text-xs text-[var(--color-muted)]">
                    <strong>Why we ask:</strong> Non-contributory social security pension schemes
                    prevent duplicate pension disbursements.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="other-pension"
                        value="yes"
                        checked={hasOtherPension === 'yes'}
                        onChange={(e) => setHasOtherPension(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                      <input
                        type="radio"
                        name="other-pension"
                        value="no"
                        checked={hasOtherPension === 'no'}
                        onChange={(e) => setHasOtherPension(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
                      <input
                        type="radio"
                        name="other-pension"
                        value="prefer_not_to_say"
                        checked={hasOtherPension === 'prefer_not_to_say'}
                        onChange={(e) => setHasOtherPension(e.target.value)}
                        className="text-[var(--color-primary)]"
                      />
                      <span>Prefer not to say</span>
                    </label>
                  </div>
                </fieldset>
              )}
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Back to schemes
              </Button>
              <Button type="button" onClick={handleEvaluate}>
                <span>Evaluate Eligibility</span>
                <svg
                  className="w-4 h-4 ml-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </Button>
            </div>
          </section>
        )}

        {/* ================= STEP 4: RESULTS ================= */}
        {step === 4 && (
          <section aria-labelledby="step-4-heading" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 id="step-4-heading" className="text-xl font-bold text-[var(--color-text)]">
                  Evaluation Results
                </h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Based on your answers and official requirements from scheme guidelines.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(3)}
                >
                  Edit answers
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1);
                    setSelectedSchemeIds([]);
                  }}
                >
                  Check other schemes
                </Button>
              </div>
            </div>

            <DisclaimerNotice
              variant="info"
              message="Informational Assessment Only: This tool provides rule-based guidance. Official approval is subject to document scrutiny and biometric verification by the respective department or portal."
            />

            {evalError ? (
              <ErrorState
                title="Evaluation Error"
                message={evalError}
                onRetry={handleEvaluate}
              />
            ) : isEvaluating ? (
              <div className="p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] space-y-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Evaluating eligibility against published criteria…
                </p>
                <LoadingSkeleton lines={5} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Likely Eligible Group */}
                {groupedResults.likely_eligible.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Likely Eligible ({groupedResults.likely_eligible.length})
                    </h3>
                    {groupedResults.likely_eligible.map((res) => renderSchemeResultCard(res))}
                  </div>
                )}

                {/* Possibly Eligible Group */}
                {groupedResults.possibly_eligible.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-warning)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Possibly Eligible ({groupedResults.possibly_eligible.length})
                    </h3>
                    {groupedResults.possibly_eligible.map((res) => renderSchemeResultCard(res))}
                  </div>
                )}

                {/* Insufficient Information Group */}
                {groupedResults.insufficient_information.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                      Insufficient Information ({groupedResults.insufficient_information.length})
                    </h3>
                    {groupedResults.insufficient_information.map((res) =>
                      renderSchemeResultCard(res)
                    )}
                  </div>
                )}

                {/* Likely Not Eligible Group */}
                {groupedResults.likely_not_eligible.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-danger)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Likely Not Eligible ({groupedResults.likely_not_eligible.length})
                    </h3>
                    {groupedResults.likely_not_eligible.map((res) => renderSchemeResultCard(res))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </PageContainer>
  );

  function renderSchemeResultCard(result: SchemeEligibilityResult) {
    const scheme = SAMPLE_SCHEMES.find((s) => s.id === result.schemeId);
    const slug = scheme?.slug ?? '';

    return (
      <article
        key={result.schemeId}
        className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
          <div>
            <h4 className="text-lg font-bold text-[var(--color-text)]">
              {result.schemeName}
            </h4>
            {scheme && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                {scheme.department} • {scheme.jurisdiction}
              </p>
            )}
          </div>
          <div>{outcomeBadge(result.outcome)}</div>
        </div>

        {/* Criteria breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Criteria Verification
          </p>
          <div className="space-y-2">
            {result.criteria.map((crit) => (
              <div
                key={crit.criterionId}
                className="p-3 rounded-[var(--radius-control)] bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-start justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {crit.criterion}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">{crit.explanation}</p>
                  {crit.citations && crit.citations.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-[var(--color-primary)]">
                      <span>Source: {crit.citations[0].title}</span>
                      {crit.citations[0].pageNumber && (
                        <span>(Page {crit.citations[0].pageNumber})</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="shrink-0">{statusBadge(crit.status)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing information if any */}
        {result.missingInformation && result.missingInformation.length > 0 && (
          <div className="p-3 rounded-[var(--radius-control)] bg-[var(--color-warning-soft)] border border-amber-200 text-xs text-[var(--color-warning)] space-y-1">
            <strong className="font-semibold">Unanswered fields for this scheme:</strong>
            <ul className="list-disc pl-4 space-y-0.5">
              {result.missingInformation.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Card action links */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {slug && (
            <Link
              href={`/schemes/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              <span>View full scheme details</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          )}

          {scheme?.officialUrl && (
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              <span>Official portal</span>
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </article>
    );
  }
}
