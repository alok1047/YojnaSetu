import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface VectorEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    schemeId: string;
    schemeName: string;
    documentId: string;
    documentTitle: string;
    sourceUrl: string;
    pageNumber: number;
    jurisdiction: string;
    language: string;
    effectiveDate?: string;
    chunkType: 'description' | 'eligibility' | 'benefits' | 'application' | 'documents' | 'full';
  };
}

export interface SearchResult {
  entry: VectorEntry;
  score: number;
}

interface VectorStoreData {
  version: number;
  entries: VectorEntry[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Local file-based vector store.
 *
 * Stores embeddings and metadata in a JSON file at `data/vector-store.json`
 * relative to the project root. Uses cosine similarity for search.
 * Implements atomic writes (write to temp file, then rename) for safety.
 */
class LocalVectorStore {
  private entries: VectorEntry[] = [];
  private loaded = false;
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath =
      filePath ?? path.resolve(process.cwd(), 'data', 'vector-store.json');
  }

  /**
   * Load entries from disk. No-op if already loaded.
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data: VectorStoreData = JSON.parse(raw);
        this.entries = data.entries ?? [];
      }
    } catch (error) {
      console.warn(
        `[VectorStore] Failed to load from ${this.filePath}:`,
        error instanceof Error ? error.message : error
      );
      this.entries = [];
    }

    this.loaded = true;
  }

  /**
   * Persist entries to disk using atomic write (temp file + rename).
   */
  async save(): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data: VectorStoreData = {
      version: 1,
      entries: this.entries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data);

    // Atomic write: write to a temp file in the same directory, then rename
    const tmpPath = path.join(
      os.tmpdir(),
      `vector-store-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );

    fs.writeFileSync(tmpPath, json, 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }

  /**
   * Add vector entries to the store.
   */
  async add(newEntries: VectorEntry[]): Promise<void> {
    await this.load();

    // Deduplicate by id — replace existing entries with the same id
    const existingIds = new Set(newEntries.map((e) => e.id));
    this.entries = this.entries.filter((e) => !existingIds.has(e.id));
    this.entries.push(...newEntries);

    await this.save();
  }

  /**
   * Search for the top-K most similar entries to the given query vector.
   */
  async search(queryVector: number[], topK = 5): Promise<SearchResult[]> {
    await this.load();

    if (this.entries.length === 0) return [];

    const scored: SearchResult[] = this.entries.map((entry) => ({
      entry,
      score: cosineSimilarity(queryVector, entry.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Remove all entries from the store and persist.
   */
  async clear(): Promise<void> {
    this.entries = [];
    this.loaded = true;
    await this.save();
  }

  /**
   * Return the number of entries currently in the store.
   */
  async count(): Promise<number> {
    await this.load();
    return this.entries.length;
  }
}

// ---------------------------------------------------------------------------
// Lazy singleton
// ---------------------------------------------------------------------------

let _instance: LocalVectorStore | null = null;

/**
 * Get the singleton vector store instance. Lazily created on first call.
 */
export function getVectorStore(): LocalVectorStore {
  if (!_instance) {
    _instance = new LocalVectorStore();
  }
  return _instance;
}

/**
 * Reset the singleton (useful for testing).
 */
export function resetVectorStore(): void {
  _instance = null;
}
