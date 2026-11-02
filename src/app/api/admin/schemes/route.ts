import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes, getCustomSchemes, saveCustomScheme, deleteCustomScheme } from '@/lib/data/custom-schemes';
import { ingestSchemes } from '@/lib/ingestion/ingest';
import type { Scheme } from '@/lib/types';

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

  return NextResponse.json({ schemes: schemesWithCustomFlag });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || !body.category || !body.department || !body.summary) {
      return NextResponse.json(
        { error: 'Missing required scheme fields (name, category, department, summary).' },
        { status: 400 }
      );
    }

    const slug =
      body.slug?.trim() ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const id = body.id || `scheme-${slug}-${Date.now().toString(36)}`;

    const newScheme: Scheme = {
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
      benefits: Array.isArray(body.benefits) ? body.benefits : (body.benefits || '').split('\n').filter(Boolean),
      requiredDocuments: Array.isArray(body.requiredDocuments) ? body.requiredDocuments : (body.requiredDocuments || '').split('\n').filter(Boolean),
      applicationSteps: Array.isArray(body.applicationSteps) ? body.applicationSteps : (body.applicationSteps || '').split('\n').filter(Boolean),
      eligibilityCriteria: Array.isArray(body.eligibilityCriteria) ? body.eligibilityCriteria : [],
      sources: Array.isArray(body.sources) && body.sources.length > 0 ? body.sources : [
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

    // 1. Save scheme in persistent store
    saveCustomScheme(newScheme);

    // 2. Ingest and vector-embed immediately
    const ingestResult = await ingestSchemes([newScheme]);

    return NextResponse.json({
      success: true,
      scheme: newScheme,
      chunksIngested: ingestResult.chunksIngested,
      errors: ingestResult.errors,
    });
  } catch (error) {
    console.error('Failed to create scheme:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create scheme' },
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

  return NextResponse.json({ success: true, deletedId: id });
}
