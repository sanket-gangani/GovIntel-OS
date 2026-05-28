"use client";

import { useState } from "react";
import { HeroSearch } from "@/components/search/hero-search";
import { Dropzone } from "@/components/upload/dropzone";
import { ResultCard } from "@/components/search/result-card";
import { ExecutiveSummary } from "@/components/search/executive-summary";
import { EvidenceViewer } from "@/components/search/evidence-viewer";
import { BriefingPanel } from "@/components/workspace/briefing-panel";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Database, Network, Bookmark, History } from "lucide-react";

import { SearchResult, SystemStats } from "@/lib/rag/types";
import { useBriefingStore } from "@/lib/rag/store";
import { useEffect } from "react";

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<SearchResult | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Documents");
  const [activeDocumentFilter, setActiveDocumentFilter] = useState<string | null>(null);

  const addRecentQuery = useBriefingStore(state => state.addRecentQuery);
  const recentQueries = useBriefingStore(state => state.recentQueries);
  const briefingItems = useBriefingStore(state => state.items);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    // Read URL params if exist
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const doc = params.get("doc");
    
    if (doc) {
      setActiveDocumentFilter(doc);
      if (!hasSearched) {
        handleSearch("document", activeFilter, doc);
      }
      window.history.replaceState({}, '', '/');
    } else if (q && !hasSearched) {
      handleSearch(q);
      window.history.replaceState({}, '', '/');
    }

    const handleCustomSearch = (e: any) => {
      const query = e.detail;
      if (query) handleSearch(query);
    };

    const handleDocumentSearch = (e: any) => {
      const docName = e.detail;
      if (docName) {
        setActiveDocumentFilter(docName);
        handleSearch(lastQuery || "document", activeFilter, docName);
      }
    };
    
    window.addEventListener('triggerSearch', handleCustomSearch);
    window.addEventListener('triggerDocumentSearch', handleDocumentSearch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('triggerSearch', handleCustomSearch);
      window.removeEventListener('triggerDocumentSearch', handleDocumentSearch);
    };
  }, [hasSearched, lastQuery, activeFilter]);

  // Map filter names to the tag strings used by deriveTags in retrieval.ts
  const FILTER_TAG_MAP: Record<string, string | null> = {
    "All Documents": null,
    "Policies": "PUBLIC POLICY",
    "Grants": "FINANCIAL",
    "Internal Memos": "RESEARCH",
  };

  const handleSearch = async (query: string, filter?: string, docFilter?: string | null) => {
    if (!query.trim()) return;
    setHasSearched(true);
    setIsLoading(true);
    setLastQuery(query);
    addRecentQuery(query);

    // Determine the tag filter to send to the API
    const currentFilter = filter || activeFilter;
    const tagFilter = FILTER_TAG_MAP[currentFilter] || null;
    const currentDocFilter = docFilter !== undefined ? docFilter : activeDocumentFilter;
    
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          topK: 10,
          ...(tagFilter ? { tagFilter } : {}),
          ...(currentDocFilter ? { documentFilter: currentDocFilter } : {})
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        console.error("Search failed:", data.error);
        setResults([]);
      }
    } catch (err) {
      console.error("Network error during search:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setActiveDocumentFilter(null); // Clear document filter when changing global filters
  };

  return (
    <div className="w-full h-full pb-12">
      
      {/* 2-Column Dashboard Layout */}
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Search Column */}
        <div className="lg:col-span-8 flex flex-col relative">
          
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-sm font-mono font-bold tracking-widest uppercase text-black">
              Intelligence Search
            </h1>
            <button 
              onClick={() => setIsBriefingOpen(true)}
              className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Briefing Workspace 
              {mounted && briefingItems.length > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 ml-1">{briefingItems.length}</span>
              )}
            </button>
          </div>

          <HeroSearch 
            onSearch={handleSearch} 
            onFilterChange={handleFilterChange}
            isSearching={hasSearched} 
            activeFilter={activeFilter}
          />

          <AnimatePresence>
            {hasSearched && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-6"
              >
                <div className="flex flex-col gap-4 border-b border-border pb-3 mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading text-black flex items-center gap-2">
                      Retrieval Output
                      {isLoading && (
                        <span className="flex gap-1 ml-2">
                          <span className="w-1.5 h-1.5 bg-black animate-pulse" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-black animate-pulse" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-black animate-pulse" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black">
                      {results.length} MATCHES
                    </span>
                  </div>
                  
                  {activeDocumentFilter && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                        SEARCHING WITHIN:
                      </span>
                      <div className="flex items-center gap-2 bg-black text-white px-2 py-1 text-[11px] font-mono tracking-widest">
                        <span>{activeDocumentFilter}</span>
                        <button 
                          onClick={() => {
                            setActiveDocumentFilter(null);
                            handleSearch(lastQuery || "document", activeFilter, null);
                          }}
                          className="hover:text-red-400 transition-colors cursor-pointer text-white ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-full h-32 border border-zinc-200 bg-zinc-50 animate-pulse" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="flex flex-col gap-8">
                    <ExecutiveSummary query={lastQuery} results={results} />
                    
                    <div className="flex flex-col gap-6">
                      {Object.entries(
                        results.reduce((acc, result) => {
                          if (!acc[result.documentName]) acc[result.documentName] = [];
                          acc[result.documentName].push(result);
                          return acc;
                        }, {} as Record<string, SearchResult[]>)
                      ).map(([docName, docResults]) => (
                        <div key={docName} className="flex flex-col gap-3">
                          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2">
                            {docName} ({docResults.length} MATCHES)
                          </h3>
                          <div className="flex flex-col gap-4">
                            {docResults.map((result, index) => (
                              <ResultCard 
                                key={result.id} 
                                result={result} 
                                index={index} 
                                onClick={(res) => setSelectedEvidence(res)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-500 font-mono tracking-widest text-[11px] uppercase">
                    {activeFilter !== "All Documents" 
                      ? `NO ${activeFilter.toUpperCase()} RECORDS FOUND — TRY "ALL DOCUMENTS"`
                      : "NO MATCHING RECORDS FOUND"
                    }
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!hasSearched && (
            <div className="mt-8 flex flex-col gap-6">
              {mounted && recentQueries.length > 0 ? (
                <div className="flex flex-col gap-3 border border-zinc-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 border-b border-zinc-100 pb-3">
                    <History className="w-3.5 h-3.5" />
                    Recent Investigations
                  </h3>
                  <div className="flex flex-col gap-1">
                    {recentQueries.map((q, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSearch(q)}
                        className="text-left font-serif text-[15px] text-zinc-700 hover:text-blue-600 hover:bg-zinc-50 py-2 px-2 transition-colors -mx-2 rounded-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 font-mono tracking-widest text-[11px] uppercase">
                  AWAITING QUERY INPUT
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Context & System Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Upload Section */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-border pb-2 mb-4 text-zinc-500">
              DATA INGESTION
            </h3>
            <Dropzone />
          </div>

          {/* System Statistics */}
          <div className="mt-2">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-border pb-2 mb-4 text-zinc-500">
              SYSTEM STATUS
            </h3>
            <div className="flex flex-col gap-4 font-mono">
              <div className="flex justify-between items-end border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">System Health</div>
                </div>
                <div className="text-[11px] font-bold text-black">OPTIMAL</div>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Indexed Docs</div>
                </div>
                <div className="text-[11px] font-bold text-black">{stats?.documentCount || 0}</div>
              </div>
              <div className="flex justify-between items-end pb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-zinc-400" />
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Semantic Chunks</div>
                </div>
                <div className="text-[11px] font-bold text-black">{stats?.chunkCount || 0}</div>
              </div>
            </div>
          </div>

          {/* Operational Context */}
          <div className="mt-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-border pb-2 mb-4 text-zinc-500">
              OPERATIONAL CONTEXT
            </h3>
            <div className="flex flex-col gap-2 font-mono">
              <div className="flex justify-between items-end pb-2">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Active Session</div>
                <div className="text-[10px] font-bold text-black">{new Date().toISOString().split('T')[0]}</div>
              </div>
              <div className="flex justify-between items-end pb-2">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Last Retrieval</div>
                <div className="text-[10px] font-bold text-black">{hasSearched ? "JUST NOW" : "STANDBY"}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <EvidenceViewer 
        result={selectedEvidence}
        query={lastQuery}
        onClose={() => setSelectedEvidence(null)}
      />

      <BriefingPanel 
        isOpen={isBriefingOpen} 
        onClose={() => setIsBriefingOpen(false)} 
      />
    </div>
  );
}
