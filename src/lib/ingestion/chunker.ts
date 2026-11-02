import type { Scheme } from '@/lib/types';

export interface TextChunk {
  id: string;
  text: string;
  schemeId: string;
  schemeName: string;
  chunkType: 'description' | 'eligibility' | 'benefits' | 'application' | 'documents';
  documentId: string;
  documentTitle: string;
  sourceUrl: string;
  pageNumber: number;
  jurisdiction: string;
  effectiveDate?: string;
}

/**
 * Build a text chunk with common metadata pre-filled from the scheme.
 */
function makeChunk(
  scheme: Scheme,
  chunkType: TextChunk['chunkType'],
  text: string,
  pageNumber: number
): TextChunk {
  const source = scheme.sources[0];
  return {
    id: `${scheme.id}-${chunkType}`,
    text,
    schemeId: scheme.id,
    schemeName: scheme.name,
    chunkType,
    documentId: source?.documentId ?? scheme.id,
    documentTitle: source?.title ?? scheme.name,
    sourceUrl: source?.sourceUrl ?? scheme.officialUrl ?? '',
    pageNumber,
    jurisdiction: scheme.jurisdiction,
    effectiveDate: scheme.effectiveDate,
  };
}

/**
 * Split a Scheme object into text chunks suitable for embedding.
 *
 * Produces up to 5 chunks per scheme:
 *   1. **description** — name + summary + full description
 *   2. **eligibility** — all eligibility criteria
 *   3. **benefits** — listed benefits
 *   4. **application** — application steps
 *   5. **documents** — required documents
 *
 * Each chunk is prefixed with the scheme name for context.
 */
export function chunkScheme(scheme: Scheme): TextChunk[] {
  const chunks: TextChunk[] = [];

  // 1. Description chunk
  const descriptionParts = [
    `Scheme: ${scheme.name}`,
    `Summary: ${scheme.summary}`,
    `Description: ${scheme.description}`,
    `Department: ${scheme.department}`,
    `Jurisdiction: ${scheme.jurisdiction}`,
    `Category: ${scheme.category}`,
  ];
  if (scheme.targetGroup) {
    descriptionParts.push(`Target Group: ${scheme.targetGroup}`);
  }
  chunks.push(makeChunk(scheme, 'description', descriptionParts.join('\n'), 1));

  // 2. Eligibility chunk
  if (scheme.eligibilityCriteria.length > 0) {
    const eligibilityLines = [
      `Scheme: ${scheme.name} — Eligibility Criteria`,
      ...scheme.eligibilityCriteria.map(
        (c) => `• ${c.label}: ${c.description}${c.required ? ' (required)' : ' (optional)'}`
      ),
    ];
    chunks.push(makeChunk(scheme, 'eligibility', eligibilityLines.join('\n'), 2));
  }

  // 3. Benefits chunk
  if (scheme.benefits.length > 0) {
    const benefitsLines = [
      `Scheme: ${scheme.name} — Benefits`,
      ...scheme.benefits.map((b, i) => `${i + 1}. ${b}`),
    ];
    chunks.push(makeChunk(scheme, 'benefits', benefitsLines.join('\n'), 1));
  }

  // 4. Application steps chunk
  if (scheme.applicationSteps.length > 0) {
    const applicationLines = [
      `Scheme: ${scheme.name} — How to Apply`,
      ...scheme.applicationSteps.map((s, i) => `Step ${i + 1}: ${s}`),
    ];
    chunks.push(makeChunk(scheme, 'application', applicationLines.join('\n'), 3));
  }

  // 5. Required documents chunk
  if (scheme.requiredDocuments.length > 0) {
    const docsLines = [
      `Scheme: ${scheme.name} — Required Documents`,
      ...scheme.requiredDocuments.map((d) => `• ${d}`),
    ];
    chunks.push(makeChunk(scheme, 'documents', docsLines.join('\n'), 4));
  }

  return chunks;
}
