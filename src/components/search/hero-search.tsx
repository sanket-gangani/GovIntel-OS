"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface WorkspaceSearchProps {
  onSearch: (query: string, filter?: string) => void;
  isSearching: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

// Smart seed queries for each filter category — these pull the right kind of content
const FILTER_SEED_QUERIES: Record<string, string> = {
  "All Documents": "government document report",
  "Policies": "policy regulation law governance act",
  "Grants": "budget funding grant financial allocation",
  "Internal Memos": "report research analysis data findings",
};

export function HeroSearch({ onSearch, isSearching, activeFilter, onFilterChange }: WorkspaceSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Cmd+K to focus
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), activeFilter);
    }
  };

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter);
    // Use the typed query if available, otherwise use a smart seed query for the category
    const searchQuery = query.trim() || FILTER_SEED_QUERIES[filter] || "document";
    onSearch(searchQuery, filter);
  };

  const [user, setUser] = useState<{name: string} | null>(null);

  // Fetch current user for greeting
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const getFirstName = () => {
    if (!user?.name) return "Intelligence Console";
    return `Hey, ${user.name.split(" ")[0]}`;
  };

  const filters = ["All Documents", "Policies", "Grants", "Internal Memos"];

  return (
    <div className="w-full mb-8">
      {/* Search Header */}
      <AnimatePresence mode="wait">
        {!isSearching && (
          <motion.div 
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 px-1"
            key="header"
          >
            <h1 className="text-3xl sm:text-4xl font-heading text-black mb-1.5 tracking-tight">
              {getFirstName()}
            </h1>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
              Semantic Retrieval • 12,402 Documents Indexed
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <div className={cn(
          "relative flex items-center bg-white transition-all duration-300",
          isFocused ? "border-2 border-black shadow-md ring-4 ring-black/5" : "border-2 border-zinc-200 hover:border-zinc-800 shadow-sm"
        )}>
          <div className="pl-5 pr-3 py-4 shrink-0 flex items-center justify-center opacity-80">
            <Search className="w-5 h-5 text-black" strokeWidth={2} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search knowledge base..."
            className="flex-1 bg-transparent border-none outline-none text-[16px] text-black placeholder:text-zinc-500 py-4 w-full font-serif font-medium tracking-tight"
          />
          
          <div className="pr-3 pl-2 shrink-0 flex items-center gap-2">
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  type="submit"
                  className="w-10 h-10 bg-black hover:bg-zinc-800 flex items-center justify-center text-white transition-colors cursor-pointer mr-1"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              )}
            </AnimatePresence>
            
            {!query && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-200 text-zinc-500 font-mono text-[10px] font-bold tracking-widest mr-2">
                <Command className="w-3.5 h-3.5" strokeWidth={2} />
                <span>K</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono px-1">
        <span className="text-[9px] font-bold uppercase tracking-widest mr-2 text-zinc-400">Filters:</span>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => handleFilterClick(filter)}
            className={cn(
              "px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer",
              activeFilter === filter 
                ? "bg-black text-white border border-black" 
                : "bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-800"
            )}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
