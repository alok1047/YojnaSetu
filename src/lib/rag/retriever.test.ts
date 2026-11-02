import { describe, it, expect } from 'vitest';
import { retrieveChunks } from './retriever';

describe('RAG Retriever', () => {
  it('retrieves relevant chunks for scholarship queries', async () => {
    const chunks = await retrieveChunks('scholarship education student merit');
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('retrieves relevant chunks for health queries', async () => {
    const chunks = await retrieveChunks('health insurance hospital treatment');
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('filters results by category', async () => {
    const chunks = await retrieveChunks('support farmer crop', { category: 'agriculture' });
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('returns empty array when query has only short words', async () => {
    const chunks = await retrieveChunks('a to of');
    expect(chunks).toEqual([]);
  });
});
