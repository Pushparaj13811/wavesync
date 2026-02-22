"use client";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { cn } from "@/lib/utils/cn";
import type { VisualizerMode, FFTSize } from "@/types";
import {
  Activity,
  BarChart3,
  Circle,
  Waves,
  Keyboard,
  RotateCcw,
  Volume2,
  Eye,
} from "lucide-react";

const vizModes: { value: VisualizerMode; label: string; icon: typeof Activity }[] = [
  { value: "bars", label: "Bars", icon: BarChart3 },
  { value: "waveform", label: "Waveform", icon: Waves },
  { value: "circular", label: "Circular", icon: Circle },
];

const fftSizes: { value: FFTSize; label: string }[] = [
  { value: 256, label: "256 — Fast" },
  { value: 512, label: "512 — Balanced" },
  { value: 1024, label: "1024 — Detailed" },
  { value: 2048, label: "2048 — High Res" },
  { value: 4096, label: "4096 — Ultra" },
];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border-subtle last:border-b-0">
      <div className="min-w-0 mr-4">
        <p className="text-sm font-medium text-content-primary">{label}</p>
        {description && (
          <p className="text-xs text-content-tertiary mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-accent" : "bg-surface-tertiary",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const visualizerMode = useSettingsStore((s) => s.visualizerMode);
  const setVisualizerMode = useSettingsStore((s) => s.setVisualizerMode);
  const fftSize = useSettingsStore((s) => s.fftSize);
  const setFftSize = useSettingsStore((s) => s.setFftSize);
  const showFrequencyAnalyzer = useSettingsStore((s) => s.showFrequencyAnalyzer);
  const toggleFrequencyAnalyzer = useSettingsStore((s) => s.toggleFrequencyAnalyzer);
  const enableKeyboardShortcuts = useSettingsStore((s) => s.enableKeyboardShortcuts);
  const toggleKeyboardShortcuts = useSettingsStore((s) => s.toggleKeyboardShortcuts);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-content-primary">
        Settings
      </h1>

      {/* Visualizer Settings */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-content-tertiary mb-2 flex items-center gap-2">
          <Activity size={14} />
          Visualizer
        </h2>
        <div className="rounded-xl bg-surface-secondary px-4">
          <SettingRow
            label="Visualization Mode"
            description="Choose how audio is rendered visually"
          >
            <div className="flex gap-1 bg-surface-primary rounded-lg p-1">
              {vizModes.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    onClick={() => setVisualizerMode(m.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      visualizerMode === m.value
                        ? "bg-surface-tertiary text-content-primary"
                        : "text-content-tertiary hover:text-content-secondary",
                    )}
                  >
                    <Icon size={13} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </SettingRow>

          <SettingRow
            label="FFT Size"
            description="Higher values give more frequency detail but use more CPU"
          >
            <select
              value={fftSize}
              onChange={(e) => setFftSize(Number(e.target.value) as FFTSize)}
              className="bg-surface-primary border border-border-default rounded-lg px-3 py-1.5 text-xs text-content-primary outline-none focus:border-accent"
            >
              {fftSizes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            label="Frequency Analyzer"
            description="Show 6-band frequency spectrum below visualization"
          >
            <Toggle
              checked={showFrequencyAnalyzer}
              onChange={toggleFrequencyAnalyzer}
            />
          </SettingRow>
        </div>
      </section>

      {/* Playback Settings */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-content-tertiary mb-2 flex items-center gap-2">
          <Volume2 size={14} />
          Playback
        </h2>
        <div className="rounded-xl bg-surface-secondary px-4">
          <SettingRow
            label="Default Volume"
            description={`${Math.round(volume * 100)}%`}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-28 accent-accent"
            />
          </SettingRow>
        </div>
      </section>

      {/* Interface Settings */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-content-tertiary mb-2 flex items-center gap-2">
          <Eye size={14} />
          Interface
        </h2>
        <div className="rounded-xl bg-surface-secondary px-4">
          <SettingRow
            label="Keyboard Shortcuts"
            description="Space to play/pause, arrow keys to seek, and more"
          >
            <Toggle
              checked={enableKeyboardShortcuts}
              onChange={toggleKeyboardShortcuts}
            />
          </SettingRow>
        </div>
      </section>

      {/* Reset */}
      <section>
        <button
          onClick={resetSettings}
          className="flex items-center gap-2 text-sm font-medium text-content-tertiary hover:text-content-secondary transition-colors"
        >
          <RotateCcw size={14} />
          Reset all settings to defaults
        </button>
      </section>

      {/* About */}
      <section className="pt-4 border-t border-border-subtle">
        <div className="space-y-1 text-xs text-content-tertiary">
          <p className="font-medium text-content-secondary">WaveSync v1.0.0</p>
          <p>
            Built with Next.js, Web Audio API, Zustand, and Tailwind CSS.
          </p>
          <p>
            Music by Kevin MacLeod (incompetech.com) — Licensed under Creative
            Commons: By Attribution 4.0
          </p>
        </div>
      </section>
    </div>
  );
}
