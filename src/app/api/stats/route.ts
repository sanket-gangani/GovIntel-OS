import { NextResponse } from "next/server";
import { SystemStats } from "@/lib/rag/types";
import { getUser, prisma } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch chunks directly from PostgreSQL
    const chunks = await prisma.documentChunk.findMany({
      where: { userId: user.id },
      select: {
        documentId: true,
        documentName: true,
        text: true,
        createdAt: true
      }
    });

    if (chunks.length === 0) {
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
          createdAt: chunk.createdAt.toISOString()
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
