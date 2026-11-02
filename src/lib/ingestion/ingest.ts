import type { Scheme } from '@/lib/types';
import type { VectorEntry } from '@/lib/vectorstore';
import { chunkScheme } from '@/lib/ingestion/chunker';
import { getVectorStore } from '@/lib/vectorstore';
import { createAIProvider } from '@/lib/ai/provider';

export interface IngestResult {
  chunksIngested: number;
  errors: string[];
}

/**
 * Ingest an array of Scheme objects into the vector store.
 *
 * 1. Chunks each scheme using `chunkScheme()`
 * 2. Batches the resulting text chunks for embedding (default batch size: 20)
 * 3. Calls the AI provider's `embed()` to obtain vectors
 * 4. Stores the vectors + metadata in the local vector store
 * 5. Returns a summary of results and any errors encountered
 */
export async function ingestSchemes(
  schemes: Scheme[],
  options?: {
    batchSize?: number;
    onProgress?: (done: number, total: number) => void;
  }
): Promise<IngestResult> {
  const batchSize = options?.batchSize ?? 20;
  const errors: string[] = [];
  let chunksIngested = 0;

  // Step 1: Chunk all schemes
  const allChunks = schemes.flatMap((scheme) => {
    try {
      return chunkScheme(scheme);
    } catch (err) {
      errors.push(
        `Failed to chunk scheme "${scheme.name}": ${err instanceof Error ? err.message : String(err)}`
      );
      return [];
    }
  });

  if (allChunks.length === 0) {
    return { chunksIngested: 0, errors };
  }

  // Step 2: Create AI provider for embeddings
  const provider = createAIProvider();
  const store = getVectorStore();

  // Step 3: Process in batches
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    try {
      const embeddings = await provider.embed(texts);

      const entries: VectorEntry[] = batch.map((chunk, idx) => ({
        id: chunk.id,
        text: chunk.text,
        embedding: embeddings[idx],
        metadata: {
          schemeId: chunk.schemeId,
          schemeName: chunk.schemeName,
          documentId: chunk.documentId,
          documentTitle: chunk.documentTitle,
          sourceUrl: chunk.sourceUrl,
          pageNumber: chunk.pageNumber,
          jurisdiction: chunk.jurisdiction,
          language: 'en',
          effectiveDate: chunk.effectiveDate,
          chunkType: chunk.chunkType,
        },
      }));

      await store.add(entries);
      chunksIngested += entries.length;
    } catch (err) {
      const batchIds = batch.map((c) => c.id).join(', ');
      errors.push(
        `Failed to embed/store batch [${batchIds}]: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    options?.onProgress?.(Math.min(i + batchSize, allChunks.length), allChunks.length);
  }

  return { chunksIngested, errors };
}
