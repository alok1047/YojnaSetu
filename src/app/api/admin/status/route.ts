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

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

    let aiProvider = 'none';
    let model = 'Not Configured';
    let embeddingModel = 'None';
    let dimensions = 0;
    let baseUrl = 'Configure .env.local';

    if (hasGemini) {
      aiProvider = 'gemini';
      model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
      dimensions = 768;
      baseUrl = 'Google Generative AI';
    } else if (hasOpenAI) {
      aiProvider = 'openai';
      model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
      dimensions = 1536;
      baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    }

    return NextResponse.json({
      schemesCount: all.length,
      customSchemesCount: custom.length,
      chunksCount,
      aiProvider,
      model,
      embeddingModel,
      dimensions,
      baseUrl,
    });
  } catch (error) {
    console.error('Admin status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin status' },
      { status: 500 }
    );
  }
}
