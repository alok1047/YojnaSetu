import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemes, getCustomSchemes } from '@/lib/data/custom-schemes';
import { getVectorStore } from '@/lib/vectorstore';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'admin123';
  const headerKey = request.headers.get('x-admin-key');
  return headerKey === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const all = getAllSchemes();
    const custom = getCustomSchemes();
    const store = getVectorStore();
    const chunksCount = await store.count();

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);

    return NextResponse.json({
      schemesCount: all.length,
      customSchemesCount: custom.length,
      chunksCount,
      aiProvider: hasOpenAI ? 'openai' : hasGemini ? 'gemini' : 'none',
      model: process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || 'none',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || process.env.GEMINI_EMBEDDING_MODEL || 'none',
      baseUrl: process.env.OPENAI_BASE_URL || 'default',
    });
  } catch (error) {
    console.error('Admin status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin status' },
      { status: 500 }
    );
  }
}
