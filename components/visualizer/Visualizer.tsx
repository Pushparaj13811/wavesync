"use client";

import { useRef } from "react";
import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { cn } from "@/lib/utils/cn";
import type { VisualizerMode } from "@/types";

interface VisualizerProps {
  className?: string;
  height?: string;
}

export function Visualizer({ className, height = "h-48" }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = AudioEngine.getInstance();
  const mode = useSettingsStore((s) => s.visualizerMode);
  const setMode = useSettingsStore((s) => s.setVisualizerMode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  useAudioVisualizer(canvasRef, engine);

  if (!currentTrack) return null;

  const modes: { value: VisualizerMode; label: string }[] = [
    { value: "bars", label: "Bars" },
    { value: "waveform", label: "Wave" },
    { value: "circular", label: "Circular" },
  ];

  return (
    <div className={cn("relative w-full", height, className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />

      {/* Idle state overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-surface-elevated rounded-full"
                style={{ height: `${20 + Math.random() * 30}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 bg-surface-primary/80 backdrop-blur-sm rounded-lg p-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
              mode === m.value
                ? "bg-surface-tertiary text-content-primary"
                : "text-content-tertiary hover:text-content-secondary",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
