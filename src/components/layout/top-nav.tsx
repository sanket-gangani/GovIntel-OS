"use client";

import React from "react";
import { Menu, Database } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";

interface TopNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function TopNav({ sidebarOpen, setSidebarOpen }: TopNavProps) {
  return (
    <header className="h-16 border-b border-border bg-white sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 font-mono">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 border border-transparent hover:border-black hover:bg-black hover:text-white text-zinc-700 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <Database className="w-5 h-5 text-black" strokeWidth={2} />
          <span className="font-bold text-sm tracking-widest text-black uppercase">
            GovIntel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
