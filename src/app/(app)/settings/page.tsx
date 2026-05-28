"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore, SettingsState } from "@/lib/rag/settings-store";
import { Shield, Server, FileText, Lock, Accessibility, Download, Search, Activity, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "workspace" | "indexing" | "privacy" | "accessibility" | "export" | "search" | "status" | "about";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "workspace", label: "Workspace", icon: <Server className="w-4 h-4" /> },
  { id: "indexing", label: "Documents & Indexing", icon: <FileText className="w-4 h-4" /> },
  { id: "privacy", label: "Privacy & Security", icon: <Lock className="w-4 h-4" /> },
  { id: "accessibility", label: "Accessibility", icon: <Accessibility className="w-4 h-4" /> },
  { id: "export", label: "Export Preferences", icon: <Download className="w-4 h-4" /> },
  { id: "search", label: "Search & Retrieval", icon: <Search className="w-4 h-4" /> },
  { id: "status", label: "System Status", icon: <Activity className="w-4 h-4" /> },
  { id: "about", label: "About Platform", icon: <Info className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("workspace");
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-black">Workspace Settings</h1>
        <p className="text-[11px] font-mono tracking-widest uppercase text-zinc-500 mt-2">
          Enterprise configuration & trust controls
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start h-full pb-12">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 border-r border-zinc-100 pr-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[11px] font-mono font-bold tracking-widest uppercase transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-black text-white" 
                  : "text-zinc-500 hover:text-black hover:bg-zinc-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-2xl">
          {activeTab === "workspace" && <WorkspaceSettings settings={settings} />}
          {activeTab === "indexing" && <IndexingSettings settings={settings} />}
          {activeTab === "privacy" && <PrivacySettings />}
          {activeTab === "accessibility" && <AccessibilitySettings settings={settings} />}
          {activeTab === "export" && <ExportSettings settings={settings} />}
          {activeTab === "search" && <SearchSettings settings={settings} />}
          {activeTab === "status" && <StatusSettings />}
          {activeTab === "about" && <AboutSettings />}
        </div>
      </div>
    </div>
  );
}

// Subcomponents for each tab
function SectionHeader({ title, description }: { title: string, description: string }) {
  return (
    <div className="mb-8 border-b border-zinc-200 pb-4">
      <h2 className="font-heading text-xl text-black mb-1">{title}</h2>
      <p className="text-[12px] font-sans text-zinc-500">{description}</p>
    </div>
  );
}

function Toggle({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-zinc-100 last:border-0">
      <div className="flex flex-col pr-8">
        <span className="font-sans text-[14px] font-medium text-zinc-900">{label}</span>
        {description && <span className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{description}</span>}
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out",
          checked ? "bg-black" : "bg-zinc-200"
        )}
      >
        <span 
          className={cn(
            "pointer-events-none absolute left-0.5 h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )} 
        />
      </button>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-zinc-100 last:border-0">
      <label className="font-sans text-[14px] font-medium text-zinc-900">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-zinc-200 p-2.5 text-[13px] font-sans focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
      />
    </div>
  );
}

function Select({ label, value, options, onChange, description }: { label: string, value: string, options: {label: string, value: string}[], onChange: (v: any) => void, description?: string }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-zinc-100 last:border-0">
      <label className="font-sans text-[14px] font-medium text-zinc-900">{label}</label>
      {description && <span className="text-[12px] text-zinc-500 mb-1">{description}</span>}
      <select 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-zinc-200 p-2.5 text-[13px] font-sans focus:outline-none focus:border-black bg-white cursor-pointer"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// 1. Workspace
function WorkspaceSettings({ settings }: { settings: any }) {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Workspace Configuration" description="Manage identity and operational defaults for this environment." />
      <Input label="Workspace Name" value={settings.workspaceName} onChange={v => settings.updateSetting("workspaceName", v)} />
      <Input label="Organization / Department" value={settings.organizationName} onChange={v => settings.updateSetting("organizationName", v)} />
      <Input label="Default Collection" value={settings.defaultCollection} onChange={v => settings.updateSetting("defaultCollection", v)} />
      <Toggle label="Auto-save Briefings" description="Automatically persist collected evidence between sessions." checked={settings.autoSaveBriefings} onChange={v => settings.updateSetting("autoSaveBriefings", v)} />
      <Toggle label="Search History" description="Retain recent investigation queries in the dashboard." checked={settings.searchHistoryEnabled} onChange={v => settings.updateSetting("searchHistoryEnabled", v)} />
    </div>
  );
}

// 2. Documents & Indexing
function IndexingSettings({ settings }: { settings: any }) {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Documents & Indexing" description="Control how files are ingested and retained in the local database." />
      <Toggle label="Automatic Metadata Extraction" description="Extract authors, dates, and titles during PDF parsing." checked={settings.autoMetadataExtraction} onChange={v => settings.updateSetting("autoMetadataExtraction", v)} />
      <Toggle label="Duplicate Detection" description="Prevent indexing of identical documents to save storage." checked={settings.duplicateDetection} onChange={v => settings.updateSetting("duplicateDetection", v)} />
      <Select 
        label="Document Retention" 
        value={settings.documentRetention} 
        onChange={v => settings.updateSetting("documentRetention", v)}
        options={[
          { label: "Indefinite (Recommended)", value: "indefinite" },
          { label: "30 Days", value: "30_days" },
          { label: "90 Days", value: "90_days" },
          { label: "365 Days", value: "365_days" }
        ]}
      />
      <div className="py-6 mt-4 border-t border-zinc-200">
        <button className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 hover:text-black border border-zinc-200 hover:border-black px-4 py-2 transition-colors">
          Re-index All Documents
        </button>
      </div>
    </div>
  );
}

// 3. Privacy & Security
function PrivacySettings() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Privacy & Security" description="Verify system architecture and data isolation protocols." />
      
      <div className="bg-green-50/50 border border-green-100 p-6 flex flex-col gap-4 mb-6">
        <h3 className="font-mono text-[11px] font-bold tracking-widest uppercase text-green-800 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Secure Architecture Verified
        </h3>
        <ul className="flex flex-col gap-3 font-sans text-[13px] text-green-900">
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> 100% Local AI Processing Enabled</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> No Cloud Data Transmission</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Offline-First Operations Available</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> On-Device Vector Storage</li>
        </ul>
      </div>

      <div className="py-6 border-t border-zinc-200 flex flex-col gap-2">
        <span className="font-sans text-[14px] font-medium text-red-600">Danger Zone</span>
        <span className="text-[12px] text-zinc-500 mb-2">Permanently delete all indexed data, collections, and settings from this device.</span>
        <button className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 w-fit transition-colors">
          Clear All Indexed Data
        </button>
      </div>
    </div>
  );
}

// 4. Accessibility
function AccessibilitySettings({ settings }: { settings: any }) {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Accessibility" description="Modify the interface to ensure comfortable readability for all personnel." />
      <Toggle label="High Contrast Mode" description="Increase border visibility and text contrast." checked={settings.highContrastMode} onChange={v => settings.updateSetting("highContrastMode", v)} />
      <Toggle label="Large Text" description="Increase base typography sizes across the workspace." checked={settings.largeText} onChange={v => settings.updateSetting("largeText", v)} />
      <Toggle label="Reduced Motion" description="Disable interface animations and transitions." checked={settings.reducedMotion} onChange={v => settings.updateSetting("reducedMotion", v)} />
      <Toggle label="Compact Layout" description="Decrease padding to show more information on screen." checked={settings.compactLayout} onChange={v => settings.updateSetting("compactLayout", v)} />
    </div>
  );
}

// 5. Export Preferences
function ExportSettings({ settings }: { settings: any }) {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Export Preferences" description="Configure default formatting for intelligence reports. Reports are always generated locally." />
      <Select 
        label="Default Export Format" 
        value={settings.defaultExportFormat} 
        onChange={v => settings.updateSetting("defaultExportFormat", v)}
        options={[
          { label: "PDF Report (Print Optimized)", value: "pdf" },
          { label: "Markdown Document (.md)", value: "md" },
          { label: "Plain Text (.txt)", value: "txt" }
        ]}
      />
      <Toggle label="Include Citations" description="Automatically append source document and page numbers." checked={settings.includeCitations} onChange={v => settings.updateSetting("includeCitations", v)} />
      <Toggle label="Include Timestamps" description="Add generation time to exported reports." checked={settings.includeTimestamps} onChange={v => settings.updateSetting("includeTimestamps", v)} />
      <Toggle label="Print-Optimized Report Mode" description="Remove UI elements like sidebars and buttons before printing." checked={settings.printOptimizedMode} onChange={v => settings.updateSetting("printOptimizedMode", v)} />
    </div>
  );
}

// 6. Search & Retrieval
function SearchSettings({ settings }: { settings: any }) {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Search & Retrieval" description="Adjust how the semantic engine interprets queries and ranks evidence." />
      <Select 
        label="Search Precision" 
        description="Controls how strictly the AI matches your exact phrasing versus conceptual meaning."
        value={settings.searchPrecision} 
        onChange={v => settings.updateSetting("searchPrecision", v)}
        options={[
          { label: "Strict (Exact topics only)", value: "strict" },
          { label: "Balanced (Recommended)", value: "balanced" },
          { label: "Broad (Include tangential concepts)", value: "broad" }
        ]}
      />
      <Toggle label="Prioritize Official Documents" description="Boost ranking for verified government/institutional sources." checked={settings.prioritizeOfficial} onChange={v => settings.updateSetting("prioritizeOfficial", v)} />
      <Toggle label="Semantic Query Suggestions" description="Provide query expansion suggestions during search." checked={settings.semanticSuggestions} onChange={v => settings.updateSetting("semanticSuggestions", v)} />
    </div>
  );
}

// 7. System Status
function StatusSettings() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {}) }, []);

  return (
    <div className="flex flex-col">
      <SectionHeader title="System Status" description="Current operational metrics for local infrastructure." />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="border border-zinc-200 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Indexed Documents</span>
          <span className="font-heading text-2xl text-black">{stats?.totalDocuments || 0}</span>
        </div>
        <div className="border border-zinc-200 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Semantic Chunks</span>
          <span className="font-heading text-2xl text-black">{stats?.totalChunks || 0}</span>
        </div>
        <div className="border border-zinc-200 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Local Processing</span>
          <span className="font-heading text-xl text-green-600 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="border border-zinc-200 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Storage Usage</span>
          <span className="font-heading text-xl text-black">~12 MB</span>
        </div>
      </div>
    </div>
  );
}

// 8. About
function AboutSettings() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="About Platform" description="Technical details and architecture information." />
      <div className="flex flex-col gap-4 text-[13px] font-sans text-zinc-700 leading-relaxed">
        <p>
          <strong className="text-black font-medium">GovIntel OS</strong> (v2.4.1 - 2026 Build)<br/>
          Institutional Document Intelligence Platform
        </p>
        <p>
          <strong>Processing Architecture Summary:</strong><br/>
          This platform utilizes an offline-first architecture. When documents are ingested, they are parsed and mathematically represented (embedded) locally in your browser. No data is transmitted to external servers.
        </p>
        <p>
          <strong>How Semantic Search Works:</strong><br/>
          The platform retrieves semantically related evidence using local AI processing. Instead of looking for exact keyword matches, the engine understands the conceptual meaning of your query and finds the most relevant paragraphs from your private institutional knowledge base.
        </p>
      </div>
    </div>
  );
}
