import React from "react";
import { useBriefingStore } from "@/lib/rag/store";
import { generateTextExport, generateMarkdownExport, downloadFile } from "@/lib/rag/export";
import { X, Trash2, Download, FileText, Bookmark, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BriefingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BriefingPanel({ isOpen, onClose }: BriefingPanelProps) {
  const { items, removeItem, updateNote, clearBriefing } = useBriefingStore();

  const handleExportText = () => {
    const text = generateTextExport(items, "Analyst Investigation");
    downloadFile("briefing_export.txt", text, "text/plain");
  };

  const handleExportMd = () => {
    const text = generateMarkdownExport(items, "Analyst Investigation");
    downloadFile("briefing_export.md", text, "text/markdown");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black flex items-center justify-center text-white shrink-0">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-heading text-lg leading-tight text-black">Briefing Workspace</h2>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{items.length} EVIDENCE ITEMS</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-colors text-zinc-500"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 bg-zinc-50/50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
                  <Bookmark className="w-8 h-8 opacity-20" />
                  <span className="text-[11px] font-mono tracking-widest uppercase">No evidence collected</span>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="flex flex-col border border-border bg-white shadow-sm">
                    {/* Item Header */}
                    <div className="flex items-center justify-between p-3 border-b border-zinc-100 bg-zinc-50/50">
                      <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest uppercase text-zinc-500">
                        <span className="text-black">ITEM {index + 1}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{item.evidence.documentName}</span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-600 transition-colors"
                        title="Remove evidence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content Snippet */}
                    <div className="p-4">
                      <p className="font-serif text-[13px] leading-relaxed text-zinc-700 line-clamp-4">
                        {item.evidence.text}
                      </p>
                    </div>

                    {/* Note Editor */}
                    <div className="p-3 border-t border-zinc-100 bg-yellow-50/30 flex items-start gap-2">
                      <PenLine className="w-3.5 h-3.5 text-zinc-400 mt-1.5 shrink-0" />
                      <textarea 
                        value={item.note || ""}
                        onChange={(e) => updateNote(item.id, e.target.value)}
                        placeholder="Add analyst note..."
                        className="w-full bg-transparent border-none text-[12px] font-sans text-zinc-800 placeholder:text-zinc-400 focus:ring-0 p-0 min-h-[40px] resize-none outline-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Export */}
            <div className="p-4 md:p-6 border-t border-border bg-white flex flex-col gap-3">
              <Link 
                href="/report" 
                className={cn(
                  "flex items-center justify-center w-full bg-black text-white py-3 font-mono text-[11px] font-bold tracking-widest uppercase hover:bg-zinc-800 transition-colors gap-2",
                  items.length === 0 && "opacity-50 pointer-events-none"
                )}
              >
                <FileText className="w-4 h-4" />
                Generate PDF Report
              </Link>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleExportText}
                  disabled={items.length === 0}
                  className="flex-1 flex items-center justify-center border border-border py-2 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-50 transition-colors gap-2 disabled:opacity-50"
                >
                  <Download className="w-3 h-3" />
                  TXT
                </button>
                <button 
                  onClick={handleExportMd}
                  disabled={items.length === 0}
                  className="flex-1 flex items-center justify-center border border-border py-2 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-50 transition-colors gap-2 disabled:opacity-50"
                >
                  <Download className="w-3 h-3" />
                  MD
                </button>
                <button 
                  onClick={clearBriefing}
                  disabled={items.length === 0}
                  className="w-10 flex items-center justify-center border border-border py-2 text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Clear All"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
