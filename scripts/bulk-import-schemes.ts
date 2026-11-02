/**
 * CLI script to bulk-import hundreds of schemes from a JSON dataset file.
 *
 * Usage:
 *   npx tsx scripts/bulk-import-schemes.ts path/to/schemes.json
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import * as fs from 'node:fs';
import * as path from 'node:path';
import { saveCustomSchemes } from '@/lib/data/custom-schemes';
import { ingestSchemes } from '@/lib/ingestion/ingest';
import type { Scheme } from '@/lib/types';

interface RawSchemeItem {
  id?: string;
  name?: string;
  slug?: string;
  category?: Scheme['category'];
  department?: string;
  jurisdiction?: string;
  targetGroup?: string;
  summary?: string;
  description?: string;
  benefits?: string[] | string;
  requiredDocuments?: string[] | string;
  applicationSteps?: string[] | string;
  eligibilityCriteria?: Scheme['eligibilityCriteria'];
  sources?: Scheme['sources'];
  sourceTitle?: string;
  officialUrl?: string;
  effectiveDate?: string;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('❌ Error: Please provide the path to your schemes JSON file.');
    console.error('Example: npx tsx scripts/bulk-import-schemes.ts data/schemes-dataset.json\n');
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Error: File not found at ${resolved}`);
    process.exit(1);
  }

  console.log(`📂 Reading dataset from ${resolved}...`);
  const raw = fs.readFileSync(resolved, 'utf-8');
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('❌ Invalid JSON syntax in file:', err);
    process.exit(1);
  }

  const list: Record<string, unknown>[] = Array.isArray(data)
    ? (data as Record<string, unknown>[])
    : Array.isArray((data as { schemes?: unknown[] })?.schemes)
    ? ((data as { schemes: Record<string, unknown>[] }).schemes)
    : [];
  if (list.length === 0) {
    console.error('❌ No schemes array found in JSON file.');
    process.exit(1);
  }

  console.log(`🔍 Validating ${list.length} schemes...`);
  const validSchemes: Scheme[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i] as unknown as RawSchemeItem;
    if (!item.name || !item.category || !item.department || !item.summary) {
      console.warn(`  ⚠️ Skipping item #${i + 1}: missing name, category, department, or summary.`);
      continue;
    }

    const slug =
      item.slug?.trim() ||
      item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const id = item.id || `scheme-${slug}-${Date.now().toString(36)}`;

    const scheme: Scheme = {
      id,
      name: item.name.trim(),
      slug,
      summary: item.summary.trim(),
      description: item.description?.trim() || item.summary.trim(),
      category: item.category,
      department: item.department.trim(),
      jurisdiction: item.jurisdiction?.trim() || 'Central',
      targetGroup: item.targetGroup?.trim() || 'Citizens of India',
      status: 'active',
      isSampleData: false,
      benefits: Array.isArray(item.benefits)
        ? item.benefits
        : (item.benefits || '').split('\n').filter(Boolean),
      requiredDocuments: Array.isArray(item.requiredDocuments)
        ? item.requiredDocuments
        : (item.requiredDocuments || '').split('\n').filter(Boolean),
      applicationSteps: Array.isArray(item.applicationSteps)
        ? item.applicationSteps
        : (item.applicationSteps || '').split('\n').filter(Boolean),
      eligibilityCriteria: Array.isArray(item.eligibilityCriteria) ? item.eligibilityCriteria : [],
      sources:
        Array.isArray(item.sources) && item.sources.length > 0
          ? item.sources
          : [
              {
                documentId: `doc-${slug}`,
                title: item.sourceTitle || `${item.name} Official Guidelines`,
                sourceUrl: item.officialUrl || '',
                department: item.department,
                publicationDate: new Date().toISOString().split('T')[0],
              },
            ],
      officialUrl: item.officialUrl?.trim() || undefined,
      effectiveDate: item.effectiveDate || new Date().toISOString().split('T')[0],
      lastVerifiedDate: new Date().toISOString().split('T')[0],
    };

    validSchemes.push(scheme);
  }

  console.log(`\n💾 Saving ${validSchemes.length} validated schemes to data/custom-schemes.json...`);
  saveCustomSchemes(validSchemes);

  console.log(`🧠 Ingesting and vector-embedding ${validSchemes.length} schemes...`);
  const startTime = Date.now();
  const result = await ingestSchemes(validSchemes, {
    batchSize: 20,
    onProgress: (done, total) => {
      const pct = Math.round((done / total) * 100);
      process.stdout.write(`  ⏳ Progress: ${done}/${total} chunks (${pct}%)\r`);
    },
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n✅ Bulk import completed successfully in ${elapsed}s!`);
  console.log(`  • Schemes imported: ${validSchemes.length}`);
  console.log(`  • Chunks embedded: ${result.chunksIngested}`);
  if (result.errors.length > 0) {
    console.log(`  • Warnings/Errors: ${result.errors.length}`);
  }
}

main().catch((err) => {
  console.error('\n❌ Bulk import failed:', err);
  process.exit(1);
});
