import { DocumentChunk, ChunkEmbedding } from "./types";
import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { pipeline, env } from "@xenova/transformers";

// Disable local model caching to ensure we fetch correctly on the first run,
// or configure it to store locally if preferred. Next.js server environments
// sometimes struggle with cache paths.
env.allowLocalModels = false;
env.useBrowserCache = false;

const EMBEDDINGS_FILE = path.join(process.cwd(), "data", "embeddings.json");

// Singleton pipeline to ensure we only load the model once
class EmbedderPipeline {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model, { progress_callback });
    }
    return this.instance;
  }
}

/**
 * Generates embeddings for an array of document chunks.
 */
export async function generateEmbeddings(chunks: DocumentChunk[]): Promise<ChunkEmbedding[]> {
  if (!chunks || chunks.length === 0) return [];

  // Log loading since this takes time on the first run
  console.log(`[Embedder] Initializing model ${EmbedderPipeline.model}...`);
  const embedder = await EmbedderPipeline.getInstance();

  const embeddings: ChunkEmbedding[] = [];

  console.log(`[Embedder] Generating vectors for ${chunks.length} chunks...`);
  for (const chunk of chunks) {
    // Generate embedding vector
    const output = await embedder(chunk.text, { pooling: "mean", normalize: true });
    
    // Extract the float array
    const vector = Array.from(output.data) as number[];

    embeddings.push({
      id: randomUUID(),
      chunkId: chunk.id,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      text: chunk.text,
      vector,
      metadata: chunk.metadata,
      createdAt: new Date().toISOString()
    });
  }

  console.log(`[Embedder] Finished generating ${embeddings.length} vectors.`);
  return embeddings;
}

/**
 * Appends new embeddings to the local data/embeddings.json file.
 */
export async function saveEmbeddingsLocally(newEmbeddings: ChunkEmbedding[]): Promise<void> {
  let existingEmbeddings: ChunkEmbedding[] = [];
  
  if (fs.existsSync(EMBEDDINGS_FILE)) {
    try {
      const fileData = await readFile(EMBEDDINGS_FILE, "utf-8");
      existingEmbeddings = JSON.parse(fileData);
    } catch (e) {
      console.warn("Failed to parse existing embeddings.json. Overwriting.");
    }
  }

  existingEmbeddings.push(...newEmbeddings);

  await writeFile(EMBEDDINGS_FILE, JSON.stringify(existingEmbeddings, null, 2), "utf-8");
}
