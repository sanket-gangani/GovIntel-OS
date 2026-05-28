/**
 * Aggressively cleans raw text extracted from PDFs to remove noise, 
 * page numbers, repetitive headers/footers, and OCR formatting artifacts.
 */
export function cleanText(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText;

  // 1. Remove obvious page pagination patterns like "-- 104 of 142 --" or "Page 1 of 12"
  cleaned = cleaned.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "");
  cleaned = cleaned.replace(/page\s*\d+\s+of\s+\d+/gi, "");
  cleaned = cleaned.replace(/page\s*\d+/gi, "");
  
  // 2. Remove repetitive dashed lines or underline strings (e.g. "------" or "____")
  cleaned = cleaned.replace(/[-_]{3,}/g, "");
  
  // 3. Remove standalone numbers that are likely page numbers at the start or end of lines
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, "");

  // 4. Normalize Whitespace & Punctuation
  // Replace multiple newlines with exactly two newlines to preserve paragraph boundaries
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  
  // Replace multiple spaces or tabs with a single space
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");

  // 5. Clean up broken sentence wrapping (where a sentence is cut in half by a newline)
  // If a line ends without punctuation and the next line starts with a lowercase letter, merge them
  cleaned = cleaned.replace(/([^.!?\n])\n([a-z])/g, "$1 $2");

  return cleaned.trim();
}
