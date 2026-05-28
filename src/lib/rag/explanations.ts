/**
 * Simple stop words list to ignore during concept extraction.
 */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", 
  "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", 
  "their", "then", "there", "these", "they", "this", "to", "was", "will", "with",
  "what", "why", "how", "when", "where", "about", "these", "those"
]);

/**
 * Extracts human-readable semantic concepts that match between the query
 * and the chunk text, to explain WHY a document was retrieved.
 * 
 * Since this is local without an LLM, we use keyword stemming and overlap
 * heuristics to simulate explainable AI.
 */
export function explainRetrieval(query: string, chunkText: string): string[] {
  // Normalize texts
  const normalizedQuery = query.toLowerCase().replace(/[^\w\s]/g, "");
  const normalizedChunk = chunkText.toLowerCase();

  // Extract meaningful words from query
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const matchedConcepts = new Set<string>();

  queryWords.forEach(word => {
    // Check if the exact word or a strong stem exists in the chunk
    // Use a simple regex to match whole words or words starting with the query word (stemming approximation)
    const regex = new RegExp(`\\b${word}\\w*\\b`, "i");
    if (regex.test(normalizedChunk)) {
      matchedConcepts.add(word);
    }
  });

  // If no direct keyword overlap (pure semantic hit via embeddings), 
  // provide a generic semantic fallback.
  if (matchedConcepts.size === 0) {
    return ["Underlying semantic relationship", "Implicit contextual match"];
  }

  // Capitalize and format concepts
  const formattedConcepts = Array.from(matchedConcepts).map(
    concept => concept.charAt(0).toUpperCase() + concept.slice(1)
  );

  return formattedConcepts;
}
