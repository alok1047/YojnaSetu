/**
 * CLI script to ingest sample scheme data into the local vector store.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts
 *   # or
 *   npm run ingest
 */

import 'dotenv/config';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';
import { ingestSchemes } from '@/lib/ingestion/ingest';
import { getVectorStore } from '@/lib/vectorstore';

async function main() {
  console.log('🚀 Starting scheme ingestion pipeline...\n');
  console.log(`📦 Found ${SAMPLE_SCHEMES.length} schemes to process.\n`);

  const startTime = Date.now();

  const result = await ingestSchemes(SAMPLE_SCHEMES, {
    batchSize: 20,
    onProgress: (done, total) => {
      const pct = Math.round((done / total) * 100);
      console.log(`  ⏳ Progress: ${done}/${total} chunks (${pct}%)`);
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n✅ Ingestion complete!\n');
  console.log(`  • Chunks ingested: ${result.chunksIngested}`);

  const store = getVectorStore();
  const totalCount = await store.count();
  console.log(`  • Total entries in store: ${totalCount}`);
  console.log(`  • Time elapsed: ${elapsed}s`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  ${result.errors.length} error(s):`);
    for (const err of result.errors) {
      console.log(`  ❌ ${err}`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\n❌ Ingestion failed:', err);
  process.exit(1);
});
