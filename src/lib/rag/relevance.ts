export type RelevanceLevel = "High Relevance" | "Medium Relevance" | "Related Evidence";

export interface RelevanceLabel {
  level: RelevanceLevel;
  colorClass: string;
}

/**
 * Translates a raw cosine similarity score (0-1) into a human-readable,
 * enterprise-trusted relevance label.
 * 
 * We hide the exact percentage because it implies an absolute truth that
 * semantic vector math doesn't actually possess, which can degrade trust.
 */
export function getRelevanceLabel(score: number): RelevanceLabel {
  if (score >= 0.75) {
    return {
      level: "High Relevance",
      colorClass: "bg-zinc-100 text-black border-transparent"
    };
  }
  
  if (score >= 0.55) {
    return {
      level: "Medium Relevance",
      colorClass: "bg-white text-zinc-700 border-zinc-200"
    };
  }

  return {
    level: "Related Evidence",
    colorClass: "bg-white text-zinc-500 border-zinc-200 opacity-80"
  };
}
