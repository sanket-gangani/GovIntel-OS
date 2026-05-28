import { ExtractedDocument, DocumentMetadata } from "./types";
import { randomUUID } from "crypto";

/**
 * Polyfill browser-only globals that pdfjs-dist expects.
 * Must be called BEFORE pdf-parse / pdfjs-dist is imported.
 */
function ensurePolyfills() {
  const g = globalThis as any;
  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = class DOMMatrix {
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      is2D = true;
      isIdentity = true;
    };
  }
  if (typeof g.ImageData === "undefined") {
    g.ImageData = class ImageData {
      width: number;
      height: number;
      data: Uint8ClampedArray;
      constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      }
    };
  }
  if (typeof g.Path2D === "undefined") {
    g.Path2D = class Path2D {
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
    };
  }
}

/**
 * Extracts raw text and metadata from a PDF buffer.
 * Uses dynamic import to avoid module-level crashes from pdfjs-dist canvas deps.
 */
export async function extractTextFromPDF(
  buffer: Buffer,
  filename: string,
  size: number
): Promise<ExtractedDocument> {
  try {
    // Set up polyfills BEFORE dynamically importing pdf-parse
    ensurePolyfills();

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    await parser.destroy();

    const metadata: DocumentMetadata = {
      filename,
      size,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
    };

    return {
      id: randomUUID(),
      metadata,
      rawText: textResult.text,
      pageCount: textResult.total || 0,
    };
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}
