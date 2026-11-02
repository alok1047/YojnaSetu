export type DocumentStatus = 'queued' | 'processing' | 'indexed' | 'failed' | 'ocr_required';

export interface DocumentMetadata {
  title: string;
  department: string;
  jurisdiction: string;
  language: string;
  officialUrl?: string;
  publicationDate?: string;
  effectiveDate?: string;
}

export interface IngestedDocument {
  id: string;
  filename: string;
  metadata: DocumentMetadata;
  status: DocumentStatus;
  fileHash: string;
  pageCount?: number;
  chunkCount?: number;
  fileSize: number;
  errorDetails?: string;
  createdAt: Date;
  updatedAt: Date;
  lastIngestedAt?: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  text: string;
  pageNumber?: number;
  chunkIndex: number;
  embedding?: number[];
  metadata: {
    documentTitle: string;
    sourceUrl: string;
    department: string;
    jurisdiction: string;
    language: string;
    effectiveDate?: string;
  };
}
