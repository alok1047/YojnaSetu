import type { ChatResponse, RetrievedChunk, SourceCitation } from '@/lib/types';
import { createAIProvider } from '@/lib/ai/provider';
import { RAG_SYSTEM_PROMPT, RAG_CONTEXT_TEMPLATE } from './prompts';
import { retrieveChunks } from './retriever';
import { v4 as uuidv4 } from 'uuid';

function chunksToCitations(chunks: RetrievedChunk[]): SourceCitation[] {
  // Deduplicate by documentId + pageNumber
  const seen = new Set<string>();
  const citations: SourceCitation[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.documentId}-${chunk.pageNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    citations.push({
      documentId: chunk.documentId,
      title: chunk.documentTitle,
      sourceUrl: chunk.sourceUrl,
      pageNumber: chunk.pageNumber,
      chunkId: chunk.id,
      excerpt: chunk.text.length > 200 ? chunk.text.slice(0, 200) + '…' : chunk.text,
    });
  }

  return citations;
}

function generateFollowUpSuggestions(_query: string, chunks: RetrievedChunk[]): string[] {
  const suggestions: string[] = [];
  const hasEligibility = chunks.some((c) => c.text.toLowerCase().includes('eligib'));
  const hasDocuments = chunks.some((c) => c.text.toLowerCase().includes('document'));
  const hasApplication = chunks.some(
    (c) => c.text.toLowerCase().includes('apply') || c.text.toLowerCase().includes('application')
  );

  if (!hasEligibility) suggestions.push('What are the eligibility requirements?');
  if (!hasDocuments) suggestions.push('What documents are needed to apply?');
  if (!hasApplication) suggestions.push('How do I apply for this scheme?');
  if (suggestions.length < 3) suggestions.push('Are there similar schemes available?');

  return suggestions.slice(0, 3);
}

export async function generateRAGAnswer(
  question: string,
  filters?: { state?: string; category?: string }
): Promise<ChatResponse> {
  // Step 1: Retrieve relevant chunks
  const retrievedChunks = await retrieveChunks(question, {
    state: filters?.state,
    category: filters?.category,
    maxResults: 5,
  });

  // Step 2: Build citations from retrieved chunks (server-mapped, not LLM-generated)
  const citations = chunksToCitations(retrievedChunks);

  // Step 3: Check if we have enough context
  if (retrievedChunks.length === 0) {
    return {
      answer:
        'The available source documents do not contain sufficient information to answer this question. You could try:\n\n• Rephrasing your question with different terms\n• Browsing the scheme directory to find relevant schemes\n• Checking with the responsible government department directly\n\nNote: This assistant can only answer based on officially indexed documents.',
      citations: [],
      followUpSuggestions: [
        'Show me all available schemes',
        'What categories of schemes are available?',
        'How do I browse schemes?',
      ],
      conversationId: uuidv4(),
      retrievedChunks: [],
    };
  }

  // Step 4: Try to generate answer with AI provider
  try {
    const provider = createAIProvider();
    const context = RAG_CONTEXT_TEMPLATE(
      retrievedChunks.map((c) => ({
        text: c.text,
        title: c.documentTitle,
        pageNumber: c.pageNumber,
      }))
    );

    const response = await provider.complete({
      systemPrompt: RAG_SYSTEM_PROMPT,
      userMessage: `Context from official documents:\n\n${context}\n\nQuestion: ${question}`,
      maxTokens: 1024,
      temperature: 0.3,
    });

    return {
      answer: response.content,
      citations,
      followUpSuggestions: generateFollowUpSuggestions(question, retrievedChunks),
      conversationId: uuidv4(),
      retrievedChunks,
    };
  } catch (error) {
    // If AI provider is not configured, return a structured answer from retrieved chunks
    const schemeNames = [...new Set(retrievedChunks.map((c) => c.documentTitle))];
    const answer = `Based on the indexed documents, I found relevant information from the following sources:\n\n${schemeNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nPlease review the source citations below for details. For a complete AI-generated answer, configure an AI provider (Gemini or OpenAI) in your .env.local file.\n\n⚠️ AI provider not configured: ${error instanceof Error ? error.message : 'Unknown error'}`;

    return {
      answer,
      citations,
      followUpSuggestions: generateFollowUpSuggestions(question, retrievedChunks),
      conversationId: uuidv4(),
      retrievedChunks,
    };
  }
}
