import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes, getCustomSchemes, saveCustomSchemes, deleteCustomScheme } from '@/lib/data/custom-schemes';
import { ingestSchemes } from '@/lib/ingestion/ingest';
import { getVectorStore } from '@/lib/vectorstore';
import type { Scheme, SchemeCategory } from '@/lib/types';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'admin123';
  const headerKey = request.headers.get('x-admin-key');
  return headerKey === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const all = getAllSchemes();
  const customIds = new Set(getCustomSchemes().map((c) => c.id));

  const schemesWithCustomFlag = all.map((s) => ({
    ...s,
    isCustom: customIds.has(s.id),
  }));

  return NextResponse.json({
    schemes: schemesWithCustomFlag,
    totalCount: all.length,
    customCount: customIds.size,
  });
}

interface SchemeInput {
  id?: string;
  name: string;
  slug?: string;
  category: SchemeCategory;
  department: string;
  jurisdiction?: string;
  targetGroup?: string;
  summary: string;
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

function normalizeSchemeInput(body: SchemeInput): Scheme {
  let slug =
    body.slug?.trim() ||
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Handle non-Latin or Devanagari Hindi names where regex produces empty string
  if (!slug || slug.length < 2) {
    slug = `scheme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const id = body.id || `scheme-${slug}-${Date.now().toString(36)}`;

  return {
    id,
    name: body.name.trim(),
    slug,
    summary: body.summary.trim(),
    description: body.description?.trim() || body.summary.trim(),
    category: body.category,
    department: body.department.trim(),
    jurisdiction: body.jurisdiction?.trim() || 'Central',
    targetGroup: body.targetGroup?.trim() || 'Citizens of India',
    status: 'active',
    isSampleData: false,
    benefits: Array.isArray(body.benefits)
      ? body.benefits
      : (body.benefits || '').split('\n').map((s) => s.trim()).filter(Boolean),
    requiredDocuments: Array.isArray(body.requiredDocuments)
      ? body.requiredDocuments
      : (body.requiredDocuments || '').split('\n').map((s) => s.trim()).filter(Boolean),
    applicationSteps: Array.isArray(body.applicationSteps)
      ? body.applicationSteps
      : (body.applicationSteps || '').split('\n').map((s) => s.trim()).filter(Boolean),
    eligibilityCriteria: Array.isArray(body.eligibilityCriteria) ? body.eligibilityCriteria : [],
    sources:
      Array.isArray(body.sources) && body.sources.length > 0
        ? body.sources
        : [
            {
              documentId: `doc-${slug}`,
              title: body.sourceTitle || `${body.name} Official Guidelines`,
              sourceUrl: body.officialUrl || '',
              department: body.department,
              publicationDate: new Date().toISOString().split('T')[0],
            },
          ],
    officialUrl: body.officialUrl?.trim() || undefined,
    effectiveDate: body.effectiveDate || new Date().toISOString().split('T')[0],
    lastVerifiedDate: new Date().toISOString().split('T')[0],
  };
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();

    // Check if bulk array or single object
    const rawList: unknown[] = Array.isArray(rawBody)
      ? rawBody
      : Array.isArray((rawBody as { schemes?: unknown[] }).schemes)
      ? ((rawBody as { schemes: unknown[] }).schemes)
      : [rawBody];

    if (rawList.length === 0) {
      return NextResponse.json({ error: 'No scheme data provided.' }, { status: 400 });
    }

    const validSchemes: Scheme[] = [];
    for (const item of rawList) {
      const typed = item as Partial<SchemeInput>;
      if (!typed?.name || !typed?.category || !typed?.department || !typed?.summary) {
        if (rawList.length === 1) {
          return NextResponse.json(
            { error: 'Missing required scheme fields (name, category, department, summary).' },
            { status: 400 }
          );
        }
        continue;
      }
      validSchemes.push(normalizeSchemeInput(typed as SchemeInput));
    }

    if (validSchemes.length === 0) {
      return NextResponse.json(
        { error: 'None of the provided schemes passed validation (name, category, department, summary required).' },
        { status: 400 }
      );
    }

    // 1. Save schemes to persistent store
    saveCustomSchemes(validSchemes);

    // 2. Ingest and vector-embed safely
    let chunksIngested = 0;
    let errors: string[] = [];
    try {
      const ingestResult = await ingestSchemes(validSchemes);
      chunksIngested = ingestResult.chunksIngested;
      errors = ingestResult.errors;
    } catch (ingestErr) {
      const msg = ingestErr instanceof Error ? ingestErr.message : String(ingestErr);
      errors.push(`Vector embedding could not complete: ${msg}`);
    }

    if (rawList.length === 1 && !Array.isArray(rawBody) && !Array.isArray(rawBody.schemes)) {
      return NextResponse.json({
        success: true,
        scheme: validSchemes[0],
        chunksIngested,
        errors,
      });
    }

    return NextResponse.json({
      success: true,
      count: validSchemes.length,
      schemes: validSchemes,
      chunksIngested,
      errors,
    });
  } catch (error) {
    console.error('Failed to save scheme:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save scheme' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing scheme id' }, { status: 400 });
  }

  const deleted = deleteCustomScheme(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Scheme not found or cannot delete baseline scheme' }, { status: 404 });
  }

  // Remove corresponding vector embeddings from vector store
  let vectorsRemoved = 0;
  try {
    const store = getVectorStore();
    vectorsRemoved = await store.removeBySchemeId(id);
  } catch (vecErr) {
    console.warn(`[Admin DELETE] Could not clean up vectors for ${id}:`, vecErr);
  }

  return NextResponse.json({ success: true, deletedId: id, vectorsRemoved });
}
