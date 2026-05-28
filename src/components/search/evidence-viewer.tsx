import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Database, ShieldCheck, Search as SearchIcon, FileText, CornerDownRight } from "lucide-react";
import { SearchResult } from "@/lib/rag/types";
import { getRelevanceLabel } from "@/lib/rag/relevance";
import { explainRetrieval } from "@/lib/rag/explanations";
import { cn } from "@/lib/utils";

interface EvidenceViewerProps {
  result: SearchResult | null;
  query: string;
  onClose: () => void;
}

export function EvidenceViewer({ result, query, onClose }: EvidenceViewerProps) {
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const relevance = getRelevanceLabel(result.score);
  const explanations = explainRetrieval(query, result.text);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border bg-zinc-50">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-widest uppercase text-zinc-500">
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Source Traceability</span>
                <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                <span className="text-black">PAGE {result.metadata?.page || 1}</span>
              </div>
              <h2 className="text-2xl font-heading text-black leading-tight">
                {result.documentName}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-black shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-10">
            
            {/* Retrieval Logic / Explainability */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-100 pb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Why this result?
              </h3>
              <div className="bg-zinc-50 p-4 border border-zinc-200 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn("px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest border shrink-0", relevance.colorClass)}>
                    {Math.round(result.score * 100)}% MATCH
                  </div>
                  <span className="text-[12px] font-mono text-zinc-500">
                    Calculated via semantic vector distance
                  </span>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-widest">Matched Semantic Concepts:</span>
                  <ul className="flex flex-col gap-1">
                    {explanations.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] text-zinc-700 font-serif">
                        <CornerDownRight className="w-3.5 h-3.5 text-zinc-400 mt-1 shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* The Evidence Chunk */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-100 pb-2">
                <Database className="w-3.5 h-3.5" />
                Extracted Evidence Paragraph
              </h3>
              <div className="p-5 border-l-2 border-black bg-white">
                <p className="font-serif text-[16px] leading-loose text-zinc-800 whitespace-pre-wrap">
                  {result.text}
                </p>
              </div>
            </div>

          </div>

          {/* Footer Metadata */}
          <div className="p-4 border-t border-border bg-zinc-50 flex items-center justify-between font-mono text-[9px] font-bold tracking-widest uppercase text-zinc-500">
            <span>INDEXED: {new Date(result.createdAt).toLocaleString()}</span>
            <span>CHUNK ID: {result.id.split("-")[0]}</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
