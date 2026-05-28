import { NextRequest, NextResponse } from "next/server";
import { searchEmbeddings } from "@/lib/rag/retrieval";
import { SearchResponse } from "@/lib/rag/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topK = 5, tagFilter, documentFilter } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json<SearchResponse>(
        { success: false, query: "", results: [], error: "Missing or invalid query." },
        { status: 400 }
      );
    }

    // Fetch more if filtering
    let fetchCount = topK;
    if (tagFilter) fetchCount = topK * 4;
    if (documentFilter) fetchCount = topK * 10; // Fetch significantly more since we are narrowing down to one document

    let results = await searchEmbeddings(query, fetchCount, 0.02); // lower similarity threshold to get more candidates before filtering

    // Apply server-side tag filtering if requested
    if (tagFilter && typeof tagFilter === "string") {
      results = results.filter(r => r.tags?.includes(tagFilter));
    }
    
    // Apply server-side document filtering if requested
    if (documentFilter && typeof documentFilter === "string") {
      results = results.filter(r => r.documentName === documentFilter);
    }

    results = results.slice(0, topK);

    return NextResponse.json<SearchResponse>(
      { 
        success: true, 
        query,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json<SearchResponse>(
      { success: false, query: "", results: [], error: "Failed to process search query." },
      { status: 500 }
    );
  }
}
