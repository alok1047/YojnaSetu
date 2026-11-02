import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, type VectorEntry } from '@/lib/vectorstore';
import { createAIProvider } from '@/lib/ai/provider';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'admin123';
  const headerKey = request.headers.get('x-admin-key');
  return headerKey === secret;
}

/**
 * Split long document text into ~300-500 character chunks respecting paragraph boundaries.
 */
function splitIntoParagraphChunks(text: string, title: string): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > 800) {
      if (current) chunks.push(`Document: ${title}\n\n${current}`);
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }

  if (current) {
    chunks.push(`Document: ${title}\n\n${current}`);
  }

  return chunks;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, sourceUrl, department, jurisdiction, content } = body;

    if (!title || !content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide a valid document title and at least 50 characters of document text.' },
        { status: 400 }
      );
    }

    const docId = `doc-custom-${Date.now().toString(36)}`;
    const textChunks = splitIntoParagraphChunks(content, title);

    if (textChunks.length === 0) {
      return NextResponse.json({ error: 'Could not extract valid text passages from content.' }, { status: 400 });
    }

    const provider = createAIProvider();
    const store = getVectorStore();

    // Embed in batches of 20
    let chunksIngested = 0;
    const batchSize = 20;

    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const embeddings = await provider.embed(batch);

      const entries: VectorEntry[] = batch.map((chunkText, idx) => ({
        id: `${docId}-chunk-${i + idx}`,
        text: chunkText,
        embedding: embeddings[idx],
        metadata: {
          schemeId: docId,
          schemeName: title,
          documentId: docId,
          documentTitle: title,
          department: department || 'Central Government',
          sourceUrl: sourceUrl || '',
          pageNumber: i + idx + 1,
          jurisdiction: jurisdiction || 'Central',
          language: 'en',
          chunkType: 'full',
          effectiveDate: new Date().toISOString().split('T')[0],
        },
      }));

      await store.add(entries);
      chunksIngested += entries.length;
    }

    const totalCount = await store.count();

    return NextResponse.json({
      success: true,
      documentId: docId,
      chunksIngested,
      totalEntriesInStore: totalCount,
    });
  } catch (error) {
    console.error('Ingest document error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to ingest document' },
      { status: 500 }
    );
  }
}
