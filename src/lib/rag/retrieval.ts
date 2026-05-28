import { ChunkEmbedding, SearchResult } from "./types";
import { prisma } from "@/lib/auth";
import { generateSimpleVector } from "./embeddings";

/**
 * Computes cosine similarity between two vectors.
 * Returns a score between -1 and 1 (1 being identical).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Derives a few relevant semantic tags based on document text for UI purposes.
 */
function deriveTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  
  if (lower.includes("policy") || lower.includes("regulation") || lower.includes("law")) tags.push("PUBLIC POLICY");
  if (lower.includes("budget") || lower.includes("funding") || lower.includes("grant")) tags.push("FINANCIAL");
  if (lower.includes("infrastructure") || lower.includes("city") || lower.includes("transport")) tags.push("URBAN DEV");
  if (lower.includes("health") || lower.includes("medical") || lower.includes("clinic")) tags.push("HEALTHCARE");
  
  if (tags.length === 0) tags.push("RESEARCH");
  
  // Return up to 2 tags
  return tags.slice(0, 2);
}


/**
 * Searches the local embeddings file for chunks that are semantically similar to the query.
 * @param query The natural language query
 * @param topK Number of results to return
 * @param threshold Minimum cosine similarity score (0-1)
 */
export async function searchEmbeddings(
  query: string,
  topK: number = 5,
  threshold: number = 0.05,
  userId?: string
): Promise<SearchResult[]> {
  if (!query || query.trim() === "") return [];
  if (!userId) return []; // Require userId for isolated search

  // Load existing embeddings from PostgreSQL
  let chunkEmbeddings: ChunkEmbedding[] = [];
  try {
    const rawChunks = await prisma.documentChunk.findMany({
      where: { userId: userId },
      select: {
        id: true,
        documentId: true,
        documentName: true,
        text: true,
        vector: true,
        createdAt: true
      }
    });

    chunkEmbeddings = rawChunks.map(c => ({
      id: c.id,
      chunkId: c.id,
      documentId: c.documentId,
      documentName: c.documentName,
      text: c.text,
      vector: c.vector as unknown as number[], // Cast Prisma Json → unknown → number[]
      createdAt: c.createdAt.toISOString(),
      userId: userId
    }));

  } catch (error) {
    console.error("Failed to read embeddings from Prisma:", error);
    return [];
  }

  if (chunkEmbeddings.length === 0) return [];

  // Generate embedding for the query
  console.log(`[Search] Generating fast JS vector for query: "${query}"`);
  const queryVector = generateSimpleVector(query);

  // Calculate similarity for all chunks
  const scoredChunks = chunkEmbeddings.map((chunk) => {
    const score = cosineSimilarity(queryVector, chunk.vector);
    return { chunk, score };
  });

  // Sort by highest score first, filter by threshold
  const sortedChunks = scoredChunks
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score);

  // Deduplicate: if the same text appears from multiple uploads, keep only the best-scoring one
  const seenTexts = new Set<string>();
  const deduped = sortedChunks.filter(item => {
    // Normalize whitespace for comparison
    const key = item.chunk.text.trim().replace(/\s+/g, ' ').slice(0, 200);
    if (seenTexts.has(key)) return false;
    seenTexts.add(key);
    return true;
  }).slice(0, topK);

  if (scoredChunks.length > 0) {
    console.log(`[Search] Max score found: ${Math.max(...scoredChunks.map(c => c.score))}`);
  }

  // Map to SearchResult for the frontend
  return deduped.map((item) => {
    // Find the original document name, or fallback if metadata is missing
    const docName = item.chunk.metadata?.filename || item.chunk.documentName || "Unknown Document";
    
    return {
      id: item.chunk.id,
      documentName: docName,
      text: item.chunk.text,
      score: item.score,
      metadata: item.chunk.metadata,
      createdAt: item.chunk.createdAt,
      tags: deriveTags(item.chunk.text)
    };
  });
}
