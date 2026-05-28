import { DocumentChunk, ExtractedDocument } from "./types";
import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

const CHUNKS_FILE = path.join(process.cwd(), "data", "chunks.json");

/**
 * Splits text into semantic chunks of ~500-700 characters.
 * It strictly tries to split on double newlines (paragraphs) or single newlines
 * to preserve semantic boundaries, falling back to sentence splitting only if necessary.
 */
export function chunkText(document: ExtractedDocument, minChunkSize = 400, maxChunkSize = 800): DocumentChunk[] {
  const text = document.rawText;
  const chunks: DocumentChunk[] = [];
  
  if (!text || text.trim() === "") {
    return chunks;
  }

  // Split the text into logical blocks (paragraphs)
  // We assume the text has already been run through cleaner.ts which normalizes \n\n
  const blocks = text.split(/\n\n+/);
  
  let currentChunkText = "";
  let chunkIndex = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (block.length === 0) continue;

    // If a single paragraph is massive, we must fall back to splitting it by sentences
    if (block.length > maxChunkSize) {
      if (currentChunkText.length > 0) {
        chunks.push(createChunkObj(document, currentChunkText.trim(), chunkIndex++));
        currentChunkText = "";
      }
      
      const sentences = block.match(/[^.!?]+[.!?]+/g) || [block];
      for (const sentence of sentences) {
        const s = sentence.trim();
        if (s.length === 0) continue;
        
        if (currentChunkText.length + s.length > maxChunkSize) {
          if (currentChunkText.length > 0) {
             chunks.push(createChunkObj(document, currentChunkText.trim(), chunkIndex++));
             currentChunkText = s;
          } else {
             // If a single sentence is still larger than maxChunkSize, just push it
             chunks.push(createChunkObj(document, s, chunkIndex++));
             currentChunkText = "";
          }
        } else {
          currentChunkText += (currentChunkText.length > 0 ? " " : "") + s;
        }
      }
      continue;
    }

    // Normal Accumulation
    // If adding this paragraph exceeds our chunk limit, flush the current chunk
    if (currentChunkText.length + block.length + 2 > maxChunkSize) {
      chunks.push(createChunkObj(document, currentChunkText.trim(), chunkIndex++));
      currentChunkText = block;
    } else {
      // Append paragraph with a double newline to maintain structure
      currentChunkText += (currentChunkText.length > 0 ? "\n\n" : "") + block;
    }
  }

  // Flush remaining text
  if (currentChunkText.trim().length > 0) {
    chunks.push(createChunkObj(document, currentChunkText.trim(), chunkIndex++));
  }

  return chunks;
}

function createChunkObj(doc: ExtractedDocument, text: string, index: number): DocumentChunk {
  return {
    id: randomUUID(),
    documentId: doc.id,
    documentName: doc.metadata.filename,
    text,
    index,
    metadata: doc.metadata,
    createdAt: new Date().toISOString()
  };
}

/**
 * Appends new chunks to the local data/chunks.json file.
 */
export async function saveChunksLocally(newChunks: DocumentChunk[]): Promise<void> {
  let existingChunks: DocumentChunk[] = [];
  
  if (fs.existsSync(CHUNKS_FILE)) {
    try {
      const fileData = await readFile(CHUNKS_FILE, "utf-8");
      existingChunks = JSON.parse(fileData);
    } catch (e) {
      console.warn("Failed to parse existing chunks.json. Overwriting.");
    }
  }

  existingChunks.push(...newChunks);

  await writeFile(CHUNKS_FILE, JSON.stringify(existingChunks, null, 2), "utf-8");
}
