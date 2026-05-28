import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SearchResult } from "./types";

export interface BriefingItem {
  id: string;
  evidence: SearchResult;
  note: string;
  savedAt: number;
}

export interface BriefingState {
  items: BriefingItem[];
  recentQueries: string[];
  
  // Actions
  addItem: (evidence: SearchResult, note?: string) => void;
  removeItem: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  clearBriefing: () => void;
  
  addRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
}

export const useBriefingStore = create<BriefingState>()(
  persist(
    (set) => ({
      items: [],
      recentQueries: [],
      
      addItem: (evidence, note = "") => set((state) => {
        // Prevent duplicate saves of the same chunk
        if (state.items.some(i => i.evidence.id === evidence.id)) {
          return state;
        }
        return {
          items: [
            ...state.items, 
            { id: evidence.id, evidence, note, savedAt: Date.now() }
          ]
        };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      
      updateNote: (id, note) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, note } : i)
      })),
      
      clearBriefing: () => set({ items: [] }),
      
      addRecentQuery: (query) => set((state) => {
        const filtered = state.recentQueries.filter(q => q.toLowerCase() !== query.toLowerCase());
        return {
          recentQueries: [query, ...filtered].slice(0, 5) // Keep top 5
        };
      }),
      
      clearRecentQueries: () => set({ recentQueries: [] })
    }),
    {
      name: "govintel-briefing-storage"
    }
  )
);
