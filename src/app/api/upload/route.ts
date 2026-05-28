import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { extractTextFromPDF } from "@/lib/rag/parser";
import { cleanText } from "@/lib/rag/cleaner";
import { isSemanticallyValid } from "@/lib/rag/chunk-filter";
import { chunkText, saveChunksLocally } from "@/lib/rag/chunker";
import { generateEmbeddings, saveEmbeddingsLocally } from "@/lib/rag/embeddings";
import { UploadResponse } from "@/lib/rag/types";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to uploads/ directory
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Extract text from the PDF
    const extractedDocument = await extractTextFromPDF(buffer, file.name, file.size);
    extractedDocument.userId = user.id;

    // 1. Clean the raw text before chunking
    extractedDocument.rawText = cleanText(extractedDocument.rawText);

    // 2. Chunk the cleaned text
    const chunks = chunkText(extractedDocument);
    
    // 3. Filter out semantically noisy/junk chunks
    const validChunks = chunks.filter(chunk => isSemanticallyValid(chunk.text));
    
    if (validChunks.length === 0) {
      return NextResponse.json<UploadResponse>(
        { success: false, message: "No semantically valid text could be extracted." },
        { status: 400 }
      );
    }
    
    await saveChunksLocally(validChunks);

    // 4. Generate local semantic embeddings for valid chunks
    const embeddings = await generateEmbeddings(validChunks);
    await saveEmbeddingsLocally(embeddings);

    return NextResponse.json<UploadResponse>(
      { 
        success: true, 
        message: "File uploaded and processed successfully.",
        document: extractedDocument 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json<UploadResponse>(
      { success: false, message: "Failed to process the upload.", error: String(error) },
      { status: 500 }
    );
  }
}
