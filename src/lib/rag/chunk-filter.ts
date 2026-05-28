/**
 * Analyzes a text chunk to determine if it contains enough semantically 
 * meaningful language to justify generating a vector embedding for it.
 */
export function isSemanticallyValid(chunkText: string): boolean {
  if (!chunkText) return false;
  
  const text = chunkText.trim();

  // 1. Minimum Length Check
  // Chunks that are too short rarely contain enough context for semantic search
  if (text.length < 40) return false;

  // 2. Numeric Density Check
  // If the chunk is mostly numbers (e.g. an OCR dump of a financial table),
  // it usually breaks vector retrieval. We require some natural language.
  const numbersOnly = text.replace(/[^0-9]/g, "");
  if (numbersOnly.length > text.length * 0.4) {
    return false; // More than 40% of the characters are digits
  }

  // 3. Symbol / Formatting Density Check
  // Filter out chunks that are just punctuation or table formatting artifacts
  const lettersOnly = text.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length < text.length * 0.3) {
    return false; // Less than 30% of the chunk is actual alphabet letters
  }

  // 4. Repeated Patterns Check
  // Sometimes OCR fails and generates repetitive garbage like "x x x x x"
  if (/([a-zA-Z])\s*\1\s*\1\s*\1/i.test(text)) {
    return false;
  }

  return true;
}
