"use client";

import { usePlayerStore } from "@/stores/usePlayerStore";
import { useUIStore } from "@/stores/useUIStore";
import { TrackInfo } from "./TrackInfo";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { IconButton } from "@/components/ui/IconButton";
import { ListMusic, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const toggleQueue = useUIStore((s) => s.toggleQueue);
  const isQueueOpen = useUIStore((s) => s.isQueueOpen);
  const toggleFullPlayer = useUIStore((s) => s.toggleFullPlayer);

  if (!currentTrack) return null;

  return (
    <>
      {/* Desktop/Tablet Player Bar */}
      <div
        className={cn(
          "hidden sm:flex fixed left-0 right-0 z-[var(--z-sticky)] h-20",
          "bottom-14 lg:bottom-0",
          "border-t border-border-subtle bg-surface-secondary/95 backdrop-blur-xl",
          "shadow-[var(--shadow-player)]",
        )}
      >
        <div className="flex items-center w-full px-4 gap-4">
          {/* Left: Track info */}
          <div className="w-[30%] min-w-0">
            <TrackInfo size="md" />
          </div>

          {/* Center: Controls + Progress */}
          <div className="flex flex-col items-center gap-1.5 w-[40%]">
            <PlayerControls size="md" />
            <ProgressBar showTimeLabels height="md" className="max-w-lg" />
          </div>

          {/* Right: Volume + Queue */}
          <div className="w-[30%] flex items-center justify-end gap-1">
            <VolumeControl />
            <IconButton
              label="Queue"
              isActive={isQueueOpen}
              onClick={toggleQueue}
            >
              <ListMusic size={18} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Mobile Mini Player */}
      <div
        className="sm:hidden fixed bottom-14 left-0 right-0 z-[var(--z-sticky)] cursor-pointer"
        onClick={toggleFullPlayer}
      >
        <div className="mx-2 rounded-xl bg-surface-secondary/95 backdrop-blur-xl border border-border-subtle shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 px-3 py-2">
            <TrackInfo size="sm" className="flex-1 min-w-0" />
            <PlayerControls size="sm" showShuffleRepeat={false} />
          </div>
          <ProgressBar showTimeLabels={false} height="sm" className="px-0" />
        </div>
      </div>

      {/* Mobile expand button hint */}
      <div className="sm:hidden fixed bottom-[7.5rem] right-4 z-[var(--z-sticky)]">
        <button
          onClick={toggleFullPlayer}
          className="h-7 w-7 rounded-full bg-surface-elevated flex items-center justify-center text-content-tertiary"
          aria-label="Expand player"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    </>
  );
}
