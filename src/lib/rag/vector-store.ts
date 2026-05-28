/**
 * Vector Store Abstraction
 * 
 * Manages the storage and retrieval of vector embeddings.
 * MVP: In-memory store or simple SQLite.
 * Future: ChromaDB, Pinecone.
 */

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

class MockVectorStore {
  private documents: VectorDocument[] = [];

  async addDocuments(docs: VectorDocument[]) {
    this.documents.push(...docs);
    console.log(`Added ${docs.length} documents to vector store.`);
  }

  async similaritySearch(queryEmbedding: number[], topK: number = 3) {
    // TODO: Implement actual cosine similarity
    console.log(`Mock semantic search for top ${topK} results.`);
    
    // For MVP, just return dummy results without actual math
    return [
      {
        id: "mock-1",
        content: "Mock result content...",
        metadata: { source: "Mock.pdf", page: 1 },
        score: 0.95
      }
    ];
  }
}

export const vectorStore = new MockVectorStore();
