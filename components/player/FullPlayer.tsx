"use client";

import { useRef } from "react";
import { ChevronDown, ListMusic } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { TrackInfo } from "./TrackInfo";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { FrequencyAnalyzer } from "@/components/visualizer/FrequencyAnalyzer";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils/cn";

export function FullPlayer() {
  const isOpen = useUIStore((s) => s.isFullPlayerOpen);
  const setOpen = useUIStore((s) => s.setFullPlayerOpen);
  const toggleQueue = useUIStore((s) => s.toggleQueue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const touchStartY = useRef(0);

  if (!isOpen || !currentTrack) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 80) setOpen(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[var(--z-modal)] bg-surface-primary flex flex-col",
        "animate-[slide-up_0.3s_ease-out]",
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen(false)}
          className="text-content-tertiary hover:text-content-primary p-1"
          aria-label="Collapse player"
        >
          <ChevronDown size={24} />
        </button>
        <span className="text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Now Playing
        </span>
        <IconButton label="Queue" onClick={toggleQueue}>
          <ListMusic size={20} />
        </IconButton>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 min-h-0">
        <TrackInfo size="lg" className="flex-col text-center items-center" />

        {/* Visualization */}
        <Visualizer height="h-32" className="w-full max-w-sm rounded-xl overflow-hidden" />

        {/* Frequency Analyzer */}
        <FrequencyAnalyzer className="w-full max-w-xs" />
      </div>

      {/* Controls */}
      <div className="px-6 pb-8 pt-4 flex flex-col gap-4">
        <ProgressBar showTimeLabels height="md" />
        <PlayerControls size="lg" className="justify-center" />
        <div className="flex items-center justify-center">
          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
