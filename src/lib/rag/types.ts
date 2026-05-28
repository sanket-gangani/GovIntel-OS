export type IngestionState = "idle" | "uploading" | "extracting" | "chunking" | "embedding" | "complete" | "error";

export interface DocumentMetadata {
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface ExtractedDocument {
  id: string;
  metadata: DocumentMetadata;
  rawText: string;
  pageCount: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  document?: ExtractedDocument;
  error?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  index: number;
  metadata?: any;
  createdAt: string;
}

export interface ChunkEmbedding {
  id: string;
  chunkId: string;
  documentId: string;
  documentName: string;
  text: string;
  vector: number[];
  metadata?: any;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  documentName: string;
  text: string;
  score: number;
  metadata?: any;
  createdAt: string;
  tags?: string[];
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  error?: string;
}

export interface SystemStats {
  documentCount: number;
  chunkCount: number;
  recentDocuments: { id: string, name: string }[];
  tagCounts: Record<string, number>;
}
