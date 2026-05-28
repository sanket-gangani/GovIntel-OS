import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, FileText, Check, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { SearchResult } from "@/lib/rag/types";
import { synthesizeResults, SynthesizedPoint } from "@/lib/rag/synthesis";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  query: string;
  results: SearchResult[];
}

export function ExecutiveSummary({ query, results }: ExecutiveSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [concise, setConcise] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(true);

  // We memoize the points but use a timeout to simulate "AI synthesis" 
  // so the user feels the system is working hard for them.
  const synthesizedPoints = useMemo(() => synthesizeResults(query, results, concise), [query, results, concise]);

  useEffect(() => {
    setIsSynthesizing(true);
    const timer = setTimeout(() => {
      setIsSynthesizing(false);
    }, 800); // 800ms fake latency for synthesis
    return () => clearTimeout(timer);
  }, [query, concise]);

  const handleCopy = () => {
    const textToCopy = `EXECUTIVE SUMMARY: ${query}\n\n` + synthesizedPoints.map(p => `- ${p.text} [${p.documentName}, ${p.citation}]`).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black text-white p-6 md:p-8 flex flex-col gap-6 w-full shadow-md"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5 text-white font-heading text-lg">
          <Sparkles className="w-5 h-5 text-zinc-400" strokeWidth={2} />
          Executive Summary
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setConcise(!concise)}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white px-2 py-1 transition-colors border border-transparent hover:border-zinc-700"
            title={concise ? "Switch to Detailed" : "Switch to Concise"}
          >
            {concise ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{concise ? "DETAILED" : "CONCISE"}</span>
          </button>
          
          <button 
            onClick={() => setIsSynthesizing(true)}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white px-2 py-1 transition-colors border border-transparent hover:border-zinc-700"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSynthesizing && "animate-spin")} />
            <span className="hidden sm:inline">REGENERATE</span>
          </button>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white px-2 py-1 transition-colors border border-transparent hover:border-zinc-700 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "COPIED" : "COPY"}</span>
          </button>
        </div>
      </div>

      <div className="min-h-[100px] relative">
        <AnimatePresence mode="wait">
          {isSynthesizing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col gap-3"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-4 bg-zinc-800 animate-pulse rounded-sm" style={{ width: `${100 - (i * 10)}%` }} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {synthesizedPoints.length > 0 ? (
                <ul className="flex flex-col gap-4">
                  {synthesizedPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 shrink-0 group-hover:bg-white transition-colors" />
                      <div className="flex flex-col gap-1.5">
                        <span className="font-serif text-[16px] leading-relaxed text-zinc-200">
                          {point.text}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                          <FileText className="w-3 h-3" />
                          <span>{point.documentName}</span>
                          <span className="text-zinc-700">•</span>
                          <span>{point.citation}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-zinc-500 font-mono text-[11px] tracking-widest uppercase py-4">
                  Insufficient data density for high-confidence synthesis. Please refer to raw snippets below.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
