"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Database, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { SearchResult } from "@/lib/rag/types";
import { getRelevanceLabel } from "@/lib/rag/relevance";
import { useBriefingStore } from "@/lib/rag/store";

interface ResultCardProps {
  result: SearchResult;
  index: number;
  onClick: (result: SearchResult) => void;
}

export function ResultCard({ result, index, onClick }: ResultCardProps) {
  const relevance = getRelevanceLabel(result.score);
  const addItem = useBriefingStore((state) => state.addItem);
  const items = useBriefingStore((state) => state.items);
  
  const isSaved = items.some(item => item.id === result.id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the evidence viewer
    if (!isSaved) {
      addItem(result);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative cursor-pointer"
      onClick={() => onClick(result)}
    >
      <div className="bg-white border border-border p-6 transition-all duration-300 hover:border-black hover:bg-zinc-50 flex flex-col gap-4 shadow-sm hover:shadow-md">
        
        {/* Header: Document Info & Confidence */}
        <div className="flex items-start justify-between border-b border-border group-hover:border-black pb-4 transition-colors">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-xl leading-tight flex items-center gap-1.5 text-black transition-colors">
              {result.documentName}
              <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-zinc-400 group-hover:text-black" strokeWidth={2.5} />
            </h3>
            <div className="flex items-center gap-3 font-mono text-[9px] font-bold tracking-widest uppercase mt-0.5 text-zinc-500">
              <span className="text-black">PAGE {result.metadata?.page || 1}</span>
              {result.tags?.map((tag, i) => (
                <React.Fragment key={i}>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                  <span>{tag}</span>
                </React.Fragment>
              ))}
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="flex items-center gap-1"><Database className="w-3 h-3 opacity-60" /> {new Date(result.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn("px-2.5 py-1.5 border text-[10px] font-mono font-bold tracking-widest flex items-center gap-1.5 transition-colors shrink-0", 
              relevance.colorClass
            )}>
              {Math.round(result.score * 100)}% MATCH
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={cn(
                "p-1.5 border transition-colors flex items-center justify-center shrink-0 w-8 h-8",
                isSaved ? "bg-black text-white border-black cursor-default" : "bg-white text-zinc-400 border-zinc-200 hover:text-black hover:border-black"
              )}
              title={isSaved ? "Saved to Briefing" : "Save to Briefing"}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Snippet */}
        <div className="pt-2">
          <p className="font-serif text-[16px] leading-relaxed text-zinc-800">
            {/* Highlighted syntax simulation with subtle font-weight inversion */}
            {result.text.split(/(funding|grants|health|medical|policy)/i).map((part, i) => 
              /funding|grants|health|medical|policy/i.test(part) ? (
                <span key={i} className="font-bold text-black border-b-[1.5px] border-zinc-300 pb-[1px]">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
