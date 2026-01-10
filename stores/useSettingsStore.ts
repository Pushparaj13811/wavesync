import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { VisualizerMode, FFTSize } from "@/types";

interface SettingsState {
  visualizerMode: VisualizerMode;
  fftSize: FFTSize;
  showFrequencyAnalyzer: boolean;
  enableKeyboardShortcuts: boolean;
}

interface SettingsActions {
  setVisualizerMode: (mode: VisualizerMode) => void;
  setFftSize: (size: FFTSize) => void;
  toggleFrequencyAnalyzer: () => void;
  toggleKeyboardShortcuts: () => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: SettingsState = {
  visualizerMode: "bars",
  fftSize: 2048,
  showFrequencyAnalyzer: true,
  enableKeyboardShortcuts: true,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,

        setVisualizerMode: (mode) => set({ visualizerMode: mode }),
        setFftSize: (size) => set({ fftSize: size }),
        toggleFrequencyAnalyzer: () =>
          set((s) => ({ showFrequencyAnalyzer: !s.showFrequencyAnalyzer })),
        toggleKeyboardShortcuts: () =>
          set((s) => ({
            enableKeyboardShortcuts: !s.enableKeyboardShortcuts,
          })),
        resetSettings: () => set(defaultSettings),
      }),
      {
        name: "wavesync-settings",
        storage: createJSONStorage(() => localStorage),
      },
    ),
    { name: "WaveSync Settings" },
  ),
);
