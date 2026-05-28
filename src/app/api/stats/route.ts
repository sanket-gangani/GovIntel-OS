import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { DocumentChunk, SystemStats } from "@/lib/rag/types";

const CHUNKS_FILE = path.join(process.cwd(), "data", "chunks.json");

export async function GET() {
  try {
    if (!fs.existsSync(CHUNKS_FILE)) {
      return NextResponse.json<SystemStats>({
        documentCount: 0,
        chunkCount: 0,
        recentDocuments: [],
        tagCounts: {
          "PUBLIC POLICY": 0,
          "FINANCIAL": 0,
          "URBAN DEV": 0,
          "HEALTHCARE": 0,
          "RESEARCH": 0,
        }
      });
    }

    const fileData = await readFile(CHUNKS_FILE, "utf-8");
    const chunks: DocumentChunk[] = JSON.parse(fileData);

    const docMap = new Map<string, { id: string, name: string, createdAt: string }>();
    
    // Tag frequency counter
    const tagCounts = {
      "PUBLIC POLICY": 0,
      "FINANCIAL": 0,
      "URBAN DEV": 0,
      "HEALTHCARE": 0,
      "RESEARCH": 0,
    };

    chunks.forEach(chunk => {
      if (!docMap.has(chunk.documentId)) {
        docMap.set(chunk.documentId, {
          id: chunk.documentId,
          name: chunk.documentName,
          createdAt: chunk.createdAt
        });
      }

      // Very rough/fast tag frequency estimation based on keywords in chunks
      const lower = chunk.text.toLowerCase();
      let tagged = false;
      if (lower.includes("policy") || lower.includes("regulation") || lower.includes("law")) { tagCounts["PUBLIC POLICY"]++; tagged = true; }
      if (lower.includes("budget") || lower.includes("funding") || lower.includes("grant")) { tagCounts["FINANCIAL"]++; tagged = true; }
      if (lower.includes("infrastructure") || lower.includes("city") || lower.includes("transport")) { tagCounts["URBAN DEV"]++; tagged = true; }
      if (lower.includes("health") || lower.includes("medical") || lower.includes("clinic")) { tagCounts["HEALTHCARE"]++; tagged = true; }
      if (!tagged) tagCounts["RESEARCH"]++;
    });

    const uniqueDocs = Array.from(docMap.values());
    
    // Sort documents by newest first
    uniqueDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json<SystemStats>({
      documentCount: uniqueDocs.length,
      chunkCount: chunks.length,
      recentDocuments: uniqueDocs.slice(0, 5).map(d => ({ id: d.id, name: d.name })),
      tagCounts
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
