"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Database, Settings, Loader2, ChevronLeft, ChevronRight, Activity, Grid, Layers, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemStats } from "@/lib/rag/types";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats for sidebar", err);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const collections = stats ? Object.entries(stats.tagCounts).map(([name, count], idx) => ({
    id: idx + 1, name, count
  })) : [];

  return (
    <div className="flex flex-col h-full bg-white relative transition-colors font-mono uppercase tracking-tight">
      
      {/* Brand Header */}
      <div className="flex items-center p-4 h-16 border-b border-border shrink-0 bg-white text-black">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap w-full pl-2">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-black" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-widest text-black">
              GOVINTEL OS
            </span>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={onToggle}
        className="hidden md:flex absolute -right-3.5 top-14 bg-white border border-border w-7 h-7 items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-colors z-20 text-zinc-500"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" strokeWidth={2} /> : <ChevronLeft className="w-4 h-4" strokeWidth={2} />}
      </button>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-8 px-4 flex flex-col gap-10 no-scrollbar">
        
        {/* Workspace Menu */}
        <div>
          {!collapsed && (
            <div className="mb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
              SYSTEM CONSOLE
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <NavItem icon={<Grid className="w-4 h-4" strokeWidth={2} />} label="INTELLIGENCE HUB" collapsed={collapsed} active />
          </div>
        </div>

        {/* Semantic Collections */}
        <div>
          {!collapsed && (
            <div className="mb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
              SEMANTIC COLLECTIONS
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('triggerSearch', { detail: col.name }));
                  if (window.location.pathname !== "/") {
                    router.push(`/?q=${encodeURIComponent(col.name)}`);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 text-[11px] font-medium transition-colors cursor-pointer hover:bg-black hover:text-white group text-zinc-700",
                  collapsed ? "justify-center" : "justify-between"
                )}
                title={col.name}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" strokeWidth={2} />
                  {!collapsed && <span className="truncate tracking-widest">{col.name}</span>}
                </div>
                {!collapsed && (
                  <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 group-hover:bg-white group-hover:text-black transition-colors">
                    {col.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Base */}
        <div>
          {!collapsed && (
            <div className="mb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">
              RECENT DOCUMENTS
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {stats?.recentDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('triggerDocumentSearch', { detail: doc.name }));
                  if (window.location.pathname !== "/") {
                    router.push(`/?doc=${encodeURIComponent(doc.name)}`);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 text-[11px] font-medium transition-colors cursor-pointer hover:bg-black hover:text-white group text-zinc-700",
                  collapsed ? "justify-center" : "justify-start"
                )}
                title={doc.name}
              >
                <div className="relative shrink-0 flex items-center justify-center w-4 h-4 opacity-70 group-hover:opacity-100">
                  <FileText className="w-4 h-4" strokeWidth={2} />
                </div>
                
                {!collapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className="truncate tracking-widest">
                      {doc.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {(!stats?.recentDocuments || stats.recentDocuments.length === 0) && !collapsed && (
              <div className="px-2 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                NO DOCUMENTS YET
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-border mt-auto bg-white flex flex-col gap-0.5">
        <NavItem icon={<Clock className="w-4 h-4" strokeWidth={2} />} label="HISTORY" collapsed={collapsed} onClick={() => router.push("/")} />
        <NavItem icon={<Settings className="w-4 h-4" strokeWidth={2} />} label="SETTINGS" collapsed={collapsed} onClick={() => router.push("/settings")} />
      </div>
    </div>
  );
}

function NavItem({ icon, label, collapsed, active, onClick }: { icon: React.ReactNode, label: string, collapsed: boolean, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
      "flex items-center gap-3 px-2 py-2 text-[11px] font-bold transition-colors cursor-pointer group",
      active ? "bg-black text-white" : "text-zinc-600 hover:bg-black hover:text-white",
      collapsed ? "justify-center" : "justify-start"
    )}>
      <div className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      {!collapsed && <span className="truncate tracking-widest">{label}</span>}
    </div>
  );
}
