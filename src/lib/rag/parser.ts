import { ExtractedDocument, DocumentMetadata } from "./types";
import { randomUUID } from "crypto";
import pdf from "pdf-parse";

/**
 * Extracts raw text and metadata from a PDF buffer.
 */
export async function extractTextFromPDF(
  buffer: Buffer,
  filename: string,
  size: number
): Promise<ExtractedDocument> {
  try {
    const data = await pdf(buffer);

    const metadata: DocumentMetadata = {
      filename,
      size,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
    };

    return {
      id: randomUUID(),
      metadata,
      rawText: data.text || "",
      pageCount: data.numpages || 0,
    };
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
