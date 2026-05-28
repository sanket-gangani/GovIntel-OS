import { SearchResult } from "./types";

export interface SynthesizedPoint {
  text: string;
  citation: string;
  documentName: string;
}

/**
 * Extracts the most dense, factual sentences from the top retrieved chunks
 * to form a cohesive, bulleted Executive Briefing without requiring an LLM.
 */
export function synthesizeResults(query: string, results: SearchResult[], concise: boolean = false): SynthesizedPoint[] {
  if (!results || results.length === 0) return [];

  // Limit to top 3 highest scoring results for the summary to keep it focused
  const topResults = results.slice(0, 3);
  
  // Normalize query words for extraction scoring
  const queryWords = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 3);
  
  const synthesis: SynthesizedPoint[] = [];

  topResults.forEach(result => {
    // Split chunk into sentences (very basic heuristic)
    const sentences = result.text.match(/[^.!?]+[.!?]+/g) || [result.text];
    
    // Score sentences based on keyword overlap and length
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      const lower = sentence.toLowerCase();
      
      queryWords.forEach(word => {
        if (lower.includes(word)) score += 2;
      });
      
      // Penalize very short sentences or extremely long ones
      if (sentence.length < 30) score -= 2;
      if (sentence.length > 200) score -= 1;
      
      return { text: sentence.trim(), score };
    });

    // Sort by highest score
    scoredSentences.sort((a, b) => b.score - a.score);

    if (scoredSentences.length > 0 && scoredSentences[0].score > 0) {
      // Clean up the sentence (remove weird leading characters if any)
      let cleanText = scoredSentences[0].text.replace(/^[^a-zA-Z0-9]+/, "");
      
      synthesis.push({
        text: cleanText,
        citation: `Pg ${result.metadata?.page || 1}`,
        documentName: result.documentName
      });
    }
  });

  // If concise mode, take fewer points, otherwise take up to 3
  return concise ? synthesis.slice(0, 2) : synthesis.slice(0, 3);
}
