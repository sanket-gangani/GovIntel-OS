import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/lib/rag/settings-store";
import { User, Settings, Shield, Keyboard, LogOut, Moon, Sun, Monitor, HelpCircle, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [user, setUser] = useState<{name: string, department: string | null} | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, updateSetting, workspaceName } = useSettingsStore();

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
      
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Compute initials
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "SG";

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-8 h-8 border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors uppercase tracking-widest outline-none",
          isOpen 
            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" 
            : "bg-white text-zinc-600 border-border hover:bg-black hover:text-white hover:border-black dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
        )}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-border shadow-lg z-50 flex flex-col font-sans"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-border flex flex-col gap-1">
              <span className="font-heading text-lg font-bold text-black dark:text-white leading-tight">
                {user?.name || "GovIntel User"}
              </span>
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                {user?.department || "Analyst"}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono tracking-widest uppercase text-zinc-400">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{workspaceName}</span>
              </div>
            </div>

            {/* Workspace Actions */}
            <div className="p-2 border-b border-border flex flex-col">
              <MenuItem icon={<User className="w-4 h-4" />} label="Profile Settings" onClick={() => handleNavigation("/settings")} />
              <MenuItem icon={<Settings className="w-4 h-4" />} label="Workspace Preferences" onClick={() => handleNavigation("/settings")} />
              <MenuItem icon={<Shield className="w-4 h-4" />} label="Security & Privacy" onClick={() => handleNavigation("/settings")} />
            </div>

            {/* Appearance Settings */}
            <div className="p-4 border-b border-border flex flex-col gap-3">
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 font-bold mb-1">Appearance</span>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1">
                <ThemeToggle 
                  icon={<Sun className="w-3.5 h-3.5" />} 
                  label="Light" 
                  active={theme === "light"} 
                  onClick={() => updateSetting("theme", "light")} 
                />
                <ThemeToggle 
                  icon={<Moon className="w-3.5 h-3.5" />} 
                  label="Dark" 
                  active={theme === "dark"} 
                  onClick={() => updateSetting("theme", "dark")} 
                />
                <ThemeToggle 
                  icon={<Monitor className="w-3.5 h-3.5" />} 
                  label="System" 
                  active={theme === "system"} 
                  onClick={() => updateSetting("theme", "system")} 
                />
              </div>
            </div>

            {/* System Actions */}
            <div className="p-2 flex flex-col">
              <MenuItem 
                icon={<Keyboard className="w-4 h-4" />} 
                label="Keyboard Shortcuts" 
                onClick={() => { setShowShortcuts(true); setIsOpen(false); }} 
              />
              <MenuItem 
                icon={<HelpCircle className="w-4 h-4" />} 
                label="Help & Documentation" 
                onClick={() => { setShowDocs(true); setIsOpen(false); }} 
              />
              <MenuItem 
                icon={<LogOut className="w-4 h-4" />} 
                label="Sign Out" 
                onClick={handleLogout} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showShortcuts && (
          <ModalOverlay title="Keyboard Shortcuts" onClose={() => setShowShortcuts(false)}>
            <div className="flex flex-col gap-2 font-sans text-[13px]">
              <ShortcutRow action="Focus Search" keys={["⌘", "K"]} />
              <ShortcutRow action="Toggle Briefing Panel" keys={["⌘", "B"]} />
              <ShortcutRow action="Close Modal / Drawer" keys={["ESC"]} />
              <ShortcutRow action="Navigate Results" keys={["↑", "↓"]} />
              <ShortcutRow action="Save to Briefing" keys={["⌘", "S"]} />
              <div className="mt-4 pt-4 border-t border-border text-zinc-500 text-[11px] font-mono uppercase tracking-widest text-center">
                Vim Bindings: Coming Soon
              </div>
            </div>
          </ModalOverlay>
        )}

        {showDocs && (
          <ModalOverlay title="Platform Documentation" onClose={() => setShowDocs(false)}>
            <div className="flex flex-col gap-4 font-sans text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-black dark:text-white">GovIntel Knowledge Base</strong>
              </p>
              <p>
                <strong>1. Ingestion:</strong> Drag and drop your PDFs into the dropzone. The system automatically extracts text, parses metadata, and generates embeddings entirely locally on your device.
              </p>
              <p>
                <strong>2. Semantic Search:</strong> Use natural language to query the knowledge base. The system matches conceptual meaning rather than exact keywords.
              </p>
              <p>
                <strong>3. Briefing Workspace:</strong> Click "Save to Briefing" on any result to compile an evidence folder. You can export these as markdown, text, or a print-optimized PDF report.
              </p>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalOverlay({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-border shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-heading text-lg font-bold text-black dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function ShortcutRow({ action, keys }: { action: string, keys: string[] }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-zinc-700 dark:text-zinc-300">{action}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-border rounded-none text-[11px] font-mono text-black dark:text-white shadow-sm">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors w-full text-left"
    >
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function ThemeToggle({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium transition-all",
        active 
          ? "bg-white dark:bg-zinc-600 text-black dark:text-white shadow-sm" 
          : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
