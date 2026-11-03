import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes } from '@/lib/data/custom-schemes';
import { getVectorStore } from '@/lib/vectorstore';
import { ingestSchemes } from '@/lib/ingestion/ingest';
import { createAIProvider } from '@/lib/ai/provider';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'admin123';
  const headerKey = request.headers.get('x-admin-key');
  return headerKey === secret;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pre-flight check: ensure AI provider is properly configured before wiping vector store
  try {
    createAIProvider();
  } catch (providerError) {
    return NextResponse.json(
      {
        error:
          'Cannot re-index vectors: AI provider is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your .env.local file before triggering re-indexing.',
      },
      { status: 400 }
    );
  }

  try {
    const store = getVectorStore();
    await store.clear();

    const allSchemes = getAllSchemes();
    const result = await ingestSchemes(allSchemes);

    const totalCount = await store.count();

    return NextResponse.json({
      success: true,
      schemesProcessed: allSchemes.length,
      chunksIngested: result.chunksIngested,
      totalEntriesInStore: totalCount,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Re-index error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Re-indexing failed' },
      { status: 500 }
    );
  }
}
