"use client";

import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/rag/settings-store";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force light mode — the persisted store may have 'dark' or 'system' saved from earlier testing
    const currentTheme = useSettingsStore.getState().theme;
    if (currentTheme !== "light") {
      useSettingsStore.getState().updateSetting("theme", "light");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // High Contrast
    if (settings.highContrastMode) {
      root.style.setProperty("--border", "0 0 0");
      root.style.setProperty("--foreground", "0 0 0");
      root.style.setProperty("--background", "255 255 255");
      root.classList.add("high-contrast");
    } else {
      root.style.removeProperty("--border");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--background");
      root.classList.remove("high-contrast");
    }

    // Large Text
    if (settings.largeText) {
      root.classList.add("text-lg");
    } else {
      root.classList.remove("text-lg");
    }

    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Theme
    if (settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

  }, [settings.highContrastMode, settings.largeText, settings.reducedMotion, settings.theme, mounted]);

  // To prevent hydration mismatches, we could render children normally, 
  // but the CSS will snap in. That's standard for client-side stores in Next.js.
  return <>{children}</>;
}
