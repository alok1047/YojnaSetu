import { describe, it, expect } from 'vitest';
import { generateRAGAnswer } from './answer';

describe('RAG Answer Generator', () => {
  it('returns disclaimer and fallback structured response when no AI provider key is set', async () => {
    // When no API key is provided, it falls back gracefully with retrieved citations
    const result = await generateRAGAnswer('What scholarships are available for students?');
    expect(result.answer).toBeTruthy();
    expect(result.conversationId).toBeTruthy();
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.followUpSuggestions.length).toBeGreaterThan(0);
  });

  it('returns empty context message when no matching chunks are found', async () => {
    const result = await generateRAGAnswer('xyzqwe random gibberish query not in database');
    expect(result.answer).toContain('The available source documents do not contain sufficient information');
    expect(result.citations).toHaveLength(0);
  });
});
