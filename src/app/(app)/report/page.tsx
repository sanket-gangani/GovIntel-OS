"use client";

import React, { useEffect, useState } from "react";
import { useBriefingStore, BriefingItem } from "@/lib/rag/store";
import { ArrowLeft, Printer, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const [mounted, setMounted] = useState(false);
  const items = useBriefingStore(state => state.items);
  const recentQueries = useBriefingStore(state => state.recentQueries);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  const mainQuery = recentQueries[0] || "Custom Intelligence Collection";

  // Group items by document
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.evidence.documentName]) acc[item.evidence.documentName] = [];
    acc[item.evidence.documentName].push(item);
    return acc;
  }, {} as Record<string, BriefingItem[]>);

  return (
    <div className="min-h-screen bg-zinc-50 print:bg-white flex flex-col font-sans">
      
      {/* Non-print controls */}
      <div className="print:hidden sticky top-0 bg-white border-b border-border shadow-sm z-50 p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest uppercase hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-[11px] font-mono font-bold tracking-widest uppercase hover:bg-zinc-800 transition-colors shadow-md"
        >
          <Printer className="w-4 h-4" />
          Save as PDF
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="max-w-[210mm] w-full mx-auto bg-white print:shadow-none shadow-lg my-8 print:my-0 p-[20mm] print:p-0 min-h-[297mm]">
        
        {/* Cover / Header */}
        <div className="border-b-2 border-black pb-8 mb-12 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight">GOVINTEL OS</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">Institutional Intelligence Report</span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-zinc-100 px-2 py-1">UNCLASSIFIED</span>
            </div>
          </div>
          
          <div className="flex flex-col mt-8">
            <h1 className="font-serif text-4xl leading-tight text-black mb-4">
              Intelligence Briefing: {mainQuery}
            </h1>
            <div className="flex items-center gap-6 text-[11px] font-mono tracking-widest uppercase text-zinc-600">
              <div className="flex flex-col">
                <span className="text-zinc-400">GENERATED</span>
                <span className="font-bold text-black">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex flex-col border-l border-zinc-200 pl-6">
                <span className="text-zinc-400">EVIDENCE ITEMS</span>
                <span className="font-bold text-black">{items.length}</span>
              </div>
              <div className="flex flex-col border-l border-zinc-200 pl-6">
                <span className="text-zinc-400">SYSTEM ARCHITECTURE</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Local Inference Only
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {items.length === 0 ? (
          <div className="text-center py-20 font-mono text-zinc-400 text-sm">
            NO EVIDENCE COLLECTED FOR THIS REPORT
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(groupedItems).map(([docName, docItems]) => (
              <div key={docName} className="flex flex-col gap-6">
                
                {/* Section Header */}
                <h2 className="font-heading text-xl border-b border-zinc-200 pb-2 text-black flex items-center justify-between">
                  {docName}
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">
                    {docItems.length} EXTRACTS
                  </span>
                </h2>

                {/* Evidence Items */}
                <div className="flex flex-col gap-8">
                  {docItems.map((item, index) => (
                    <div key={item.id} className="flex flex-col gap-4 relative pl-6 border-l-2 border-black">
                      
                      {/* Citation Label */}
                      <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black rounded-full" />
                      
                      <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span className="font-bold text-black">PG {item.evidence.metadata?.page || 1}</span>
                        <span className="text-zinc-400">CONFIDENCE: {Math.round(item.evidence.score * 100)}%</span>
                      </div>
                      
                      {/* Raw Text */}
                      <p className="font-serif text-[15px] leading-relaxed text-zinc-800 whitespace-pre-wrap">
                        {item.evidence.text}
                      </p>

                      {/* Analyst Note */}
                      {item.note && (
                        <div className="bg-zinc-50 p-4 border border-zinc-200 mt-2">
                          <span className="block text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500 mb-2">
                            Analyst Assessment
                          </span>
                          <p className="font-sans text-[13px] text-zinc-700 italic">
                            {item.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Print Footer */}
        <div className="mt-20 pt-8 border-t border-zinc-200 text-center font-mono text-[9px] tracking-widest uppercase text-zinc-400 flex flex-col gap-1">
          <span>END OF BRIEFING</span>
          <span>Generated securely on-device. No cloud processing utilized.</span>
        </div>

      </div>
    </div>
  );
}
