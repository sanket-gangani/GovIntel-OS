import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  // Workspace
  workspaceName: string;
  organizationName: string;
  defaultCollection: string;
  autoSaveBriefings: boolean;
  searchHistoryEnabled: boolean;

  // Documents & Indexing
  autoMetadataExtraction: boolean;
  duplicateDetection: boolean;
  documentRetention: "indefinite" | "30_days" | "90_days" | "365_days";

  // Accessibility
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  compactLayout: boolean;

  // Export
  defaultExportFormat: "pdf" | "md" | "txt";
  includeCitations: boolean;
  includeTimestamps: boolean;
  printOptimizedMode: boolean;

  // Search & Retrieval
  searchPrecision: "strict" | "balanced" | "broad";
  prioritizeOfficial: boolean;
  semanticSuggestions: boolean;

  // Appearance
  theme: "light" | "dark" | "system";

  // Actions
  updateSetting: <K extends keyof Omit<SettingsState, "updateSetting" | "resetSettings">>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

const defaultState = {
  workspaceName: "GovIntel Core",
  organizationName: "Department of Strategic Research",
  defaultCollection: "All Documents",
  autoSaveBriefings: true,
  searchHistoryEnabled: true,

  autoMetadataExtraction: true,
  duplicateDetection: true,
  documentRetention: "indefinite" as const,

  highContrastMode: false,
  reducedMotion: false,
  largeText: false,
  compactLayout: false,

  defaultExportFormat: "pdf" as const,
  includeCitations: true,
  includeTimestamps: true,
  printOptimizedMode: true,

  searchPrecision: "balanced" as const,
  prioritizeOfficial: true,
  semanticSuggestions: true,

  theme: "light" as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultState,
      
      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
      resetSettings: () => set(defaultState),
    }),
    {
      name: "govintel-settings-storage"
    }
  )
);
