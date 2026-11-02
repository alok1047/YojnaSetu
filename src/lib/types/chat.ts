import type { SourceCitation } from './eligibility';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: SourceCitation[];
  followUpSuggestions?: string[];
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface ChatRequest {
  question: string;
  filters?: ChatFilters;
  conversationId?: string;
}

export interface ChatFilters {
  state?: string;
  category?: string;
  language?: string;
}

export interface ChatResponse {
  answer: string;
  citations: SourceCitation[];
  followUpSuggestions: string[];
  conversationId: string;
  retrievedChunks: RetrievedChunk[];
}

export interface RetrievedChunk {
  id: string;
  text: string;
  documentId: string;
  documentTitle: string;
  sourceUrl: string;
  pageNumber?: number;
  jurisdiction?: string;
  language?: string;
  effectiveDate?: string;
  score: number;
}
