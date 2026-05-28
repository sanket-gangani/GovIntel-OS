import { DocumentChunk, ChunkEmbedding } from "./types";
import { randomUUID } from "crypto";

// Common stop words to ignore to improve similarity relevance
const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant", "cannot", "could",
  "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during", "each", "few", "for", "from",
  "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having", "he", "hed", "hell", "hes", "her", "here",
  "heres", "hers", "herself", "him", "himself", "his", "how", "hows", "i", "id", "ill", "im", "ive", "if", "in",
  "into", "is", "isnt", "it", "its", "itself", "lets", "me", "more", "most", "mustnt", "my", "myself", "no", "nor",
  "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shant", "she", "shed", "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that",
  "thats", "the", "their", "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd",
  "theyll", "theyre", "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
  "wasnt", "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres",
  "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you", "youd",
  "youll", "youre", "youve", "your", "yours", "yourself", "yourselves"
]);

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Generates a fast 384-dimensional term-frequency vector in pure JS.
 * This runs in <1ms and does not require native ONNX binaries or downloading models from Hugging Face.
 */
export function generateSimpleVector(text: string, dimensions: number = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) {
    // Fallback if no words left
    vector[0] = 1.0;
    return vector;
  }

  // Count term frequencies
  const counts: { [key: number]: number } = {};
  for (const word of words) {
    const index = simpleHash(word) % dimensions;
    counts[index] = (counts[index] || 0) + 1;
  }

  // Compute sublinear scaling log(1 + count) and sum of squares
  let sumOfSquares = 0;
  for (const indexStr in counts) {
    const index = parseInt(indexStr);
    const val = Math.log1p(counts[index]);
    vector[index] = val;
    sumOfSquares += val * val;
  }

  // Normalize vector to unit length (so dot product equals cosine similarity)
  const magnitude = Math.sqrt(sumOfSquares);
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= magnitude;
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Generates embeddings for an array of document chunks.
 */
export async function generateEmbeddings(chunks: DocumentChunk[]): Promise<ChunkEmbedding[]> {
  if (!chunks || chunks.length === 0) return [];

  console.log(`[Embedder] Generating fast JS vectors for ${chunks.length} chunks...`);
  const embeddings: ChunkEmbedding[] = [];

  for (const chunk of chunks) {
    const vector = generateSimpleVector(chunk.text);

    embeddings.push({
      id: randomUUID(),
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      text: chunk.text,
      vector,
      metadata: chunk.metadata,
      createdAt: new Date().toISOString(),
      userId: chunk.userId
    });
  }

  console.log(`[Embedder] Finished generating ${embeddings.length} vectors.`);
  return embeddings;
}
