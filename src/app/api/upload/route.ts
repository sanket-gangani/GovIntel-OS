import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/rag/parser";
import { cleanText } from "@/lib/rag/cleaner";
import { isSemanticallyValid } from "@/lib/rag/chunk-filter";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbeddings } from "@/lib/rag/embeddings";
import { UploadResponse } from "@/lib/rag/types";
import { getUser, prisma } from "@/lib/auth";

// Allow up to 60 seconds for this route (model download + embedding generation is slow)
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    console.log("[Upload] Starting upload handler...");

    const user = await getUser();
    if (!user) {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }
    console.log("[Upload] Authenticated user:", user.id);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    console.log("[Upload] File received:", file.name, "size:", file.size);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 1: Extract text directly from buffer (memory), skipping local disk write for Vercel
    console.log("[Upload] Step 1: Extracting text from PDF...");
    const extractedDocument = await extractTextFromPDF(buffer, file.name, file.size);
    extractedDocument.userId = user.id;
    console.log("[Upload] Step 1 done. Extracted", extractedDocument.rawText.length, "chars from", extractedDocument.pageCount, "pages");

    // Step 2: Clean the raw text before chunking
    console.log("[Upload] Step 2: Cleaning text...");
    extractedDocument.rawText = cleanText(extractedDocument.rawText);
    console.log("[Upload] Step 2 done. Cleaned text length:", extractedDocument.rawText.length);

    // Step 3: Chunk the cleaned text
    console.log("[Upload] Step 3: Chunking text...");
    const chunks = chunkText(extractedDocument);
    console.log("[Upload] Step 3 done. Created", chunks.length, "chunks");
    
    // Step 4: Filter out semantically noisy/junk chunks
    console.log("[Upload] Step 4: Filtering chunks...");
    const validChunks = chunks.filter(chunk => isSemanticallyValid(chunk.text));
    console.log("[Upload] Step 4 done.", validChunks.length, "valid chunks out of", chunks.length);
    
    if (validChunks.length === 0) {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "No semantically valid text could be extracted." },
        { status: 400 }
      );
    }

    // Step 5: Generate semantic embeddings for valid chunks
    console.log("[Upload] Step 5: Generating embeddings (this may take a while on cold start)...");
    const embeddings = await generateEmbeddings(validChunks);
    console.log("[Upload] Step 5 done. Generated", embeddings.length, "embeddings");
    
    // Step 6: Save all chunks and embeddings to PostgreSQL via Prisma
    console.log("[Upload] Step 6: Saving to database...");
    await prisma.documentChunk.createMany({
      data: embeddings.map(emb => ({
        id: emb.id,
        documentId: emb.documentId,
        documentName: emb.documentName,
        text: emb.text,
        index: validChunks.find(c => c.id === emb.chunkId)?.index || 0,
        userId: user.id,
        vector: emb.vector // Prisma automatically handles storing number[] as Json
      }))
    });
    console.log("[Upload] Step 6 done. Saved to database successfully.");

    return NextResponse.json<UploadResponse>(
      { 
        success: true, 
        message: "File uploaded and processed successfully.",
        document: extractedDocument 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Upload] FATAL ERROR:", error);
    console.error("[Upload] Error stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json<UploadResponse>(
      { success: false, message: "Failed to process the upload.", error: String(error) },
      { status: 500 }
    );
  }
}
