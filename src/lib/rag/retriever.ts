import type { RetrievedChunk } from '@/lib/types';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';
import { getVectorStore } from '@/lib/vectorstore';
import { createAIProvider } from '@/lib/ai/provider';

/**
 * Hybrid retriever: tries vector search first, falls back to keyword search.
 *
 * Vector search is attempted when:
 *   1. The vector store contains data
 *   2. An AI provider is configured (needed for embedding the query)
 *
 * If either condition is not met or the vector search throws, the retriever
 * transparently falls back to the original keyword-matching approach.
 */

// ---------------------------------------------------------------------------
// Vector search
// ---------------------------------------------------------------------------

async function vectorSearch(
  query: string,
  options?: {
    state?: string;
    category?: string;
    maxResults?: number;
  }
): Promise<RetrievedChunk[] | null> {
  try {
    const store = getVectorStore();
    const entryCount = await store.count();

    if (entryCount === 0) return null;

    const provider = createAIProvider();
    const [queryVector] = await provider.embed([query]);

    if (!queryVector || queryVector.length === 0) return null;

    // Fetch more candidates than needed so we can filter by state/category
    const searchResults = await store.search(
      queryVector,
      (options?.maxResults ?? 5) * 3
    );

    let filtered = searchResults;

    if (options?.state) {
      filtered = filtered.filter(
        (r) =>
          r.entry.metadata.jurisdiction === options.state ||
          r.entry.metadata.jurisdiction === 'National' ||
          r.entry.metadata.jurisdiction === 'Central'
      );
    }

    // Category filter: match against the schemeId's parent scheme
    if (options?.category) {
      const schemesInCategory = new Set(
        SAMPLE_SCHEMES.filter((s) => s.category === options.category).map(
          (s) => s.id
        )
      );
      filtered = filtered.filter((r) =>
        schemesInCategory.has(r.entry.metadata.schemeId)
      );
    }

    const maxResults = options?.maxResults ?? 5;

    return filtered.slice(0, maxResults).map((r) => ({
      id: r.entry.id,
      text: r.entry.text,
      documentId: r.entry.metadata.documentId,
      documentTitle: r.entry.metadata.documentTitle,
      sourceUrl: r.entry.metadata.sourceUrl,
      pageNumber: r.entry.metadata.pageNumber,
      jurisdiction: r.entry.metadata.jurisdiction,
      language: r.entry.metadata.language,
      effectiveDate: r.entry.metadata.effectiveDate,
      score: r.score,
    }));
  } catch {
    // Vector search failed — fall back to keyword search
    return null;
  }
}

// ---------------------------------------------------------------------------
// Keyword search (original implementation)
// ---------------------------------------------------------------------------

function keywordSearch(
  query: string,
  options?: {
    state?: string;
    category?: string;
    maxResults?: number;
  }
): RetrievedChunk[] {
  const maxResults = options?.maxResults ?? 5;
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTerms.length === 0) return [];

  const chunks: RetrievedChunk[] = [];

  for (const scheme of SAMPLE_SCHEMES) {
    // Apply filters
    if (options?.category && scheme.category !== options.category) continue;
    if (
      options?.state &&
      scheme.jurisdiction !== options.state &&
      scheme.jurisdiction !== 'National' &&
      scheme.jurisdiction !== 'Central'
    )
      continue;

    // Build searchable text from scheme
    const searchableTexts = [
      { text: scheme.description, pageNumber: 1 },
      {
        text: scheme.eligibilityCriteria
          .map((c) => `${c.label}: ${c.description}`)
          .join('. '),
        pageNumber: 2,
      },
      { text: scheme.benefits.join('. '), pageNumber: 1 },
      { text: scheme.applicationSteps.join('. '), pageNumber: 3 },
      { text: scheme.requiredDocuments.join('. '), pageNumber: 4 },
    ];

    for (const { text, pageNumber } of searchableTexts) {
      const lowerText = text.toLowerCase();
      const matchCount = queryTerms.filter((term) =>
        lowerText.includes(term)
      ).length;
      const score = matchCount / queryTerms.length;

      if (score > 0.2) {
        chunks.push({
          id: `chunk-${scheme.id}-${pageNumber}`,
          text,
          documentId: scheme.sources[0]?.documentId ?? scheme.id,
          documentTitle: scheme.sources[0]?.title ?? scheme.name,
          sourceUrl: scheme.sources[0]?.sourceUrl ?? '',
          pageNumber,
          jurisdiction: scheme.jurisdiction,
          language: 'en',
          effectiveDate: scheme.effectiveDate,
          score,
        });
      }
    }
  }

  // Sort by score descending and limit
  chunks.sort((a, b) => b.score - a.score);
  return chunks.slice(0, maxResults);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve relevant chunks for a query using hybrid search.
 *
 * Attempts vector search first; falls back to keyword search on failure
 * or when the vector store is empty / AI provider is not configured.
 */
export async function retrieveChunks(
  query: string,
  options?: {
    state?: string;
    category?: string;
    maxResults?: number;
  }
): Promise<RetrievedChunk[]> {
  // Try vector search first
  const vectorResults = await vectorSearch(query, options);
  if (vectorResults && vectorResults.length > 0) {
    return vectorResults;
  }

  // Fall back to keyword search
  return keywordSearch(query, options);
}
