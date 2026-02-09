"use client";

import { X } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { TrackItem } from "./TrackItem";
import { cn } from "@/lib/utils/cn";

export function QueuePanel() {
  const isOpen = useUIStore((s) => s.isQueueOpen);
  const setQueueOpen = useUIStore((s) => s.setQueueOpen);
  const tracks = useQueueStore((s) => s.tracks);
  const currentIndex = useQueueStore((s) => s.currentIndex);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const goToIndex = useQueueStore((s) => s.goToIndex);

  if (!isOpen) return null;

  const upNext = tracks.slice(currentIndex + 1);

  return (
    <div
      className={cn(
        "fixed right-0 top-0 w-80 z-[var(--z-overlay)]",
        "bg-surface-secondary border-l border-border-subtle",
        "flex flex-col animate-[fade-in_0.2s_ease-out]",
        "bottom-[8.5rem] lg:bottom-20",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-content-primary">Queue</h2>
        <button
          onClick={() => setQueueOpen(false)}
          className="text-content-tertiary hover:text-content-primary transition-colors"
          aria-label="Close queue"
        >
          <X size={18} />
        </button>
      </div>

      {/* Now Playing */}
      {currentTrack && currentIndex >= 0 && (
        <div className="px-2 py-2">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
            Now Playing
          </span>
          <TrackItem
            track={tracks[currentIndex]}
            index={currentIndex}
            isCurrentTrack
            isPlaying={isPlaying}
            onSelect={() => {}}
          />
        </div>
      )}

      {/* Up Next */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {upNext.length > 0 ? (
          <>
            <span className="px-3 text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
              Up Next &middot; {upNext.length}
            </span>
            {upNext.map((track, i) => {
              const realIndex = currentIndex + 1 + i;
              return (
                <TrackItem
                  key={`${track.id}-${realIndex}`}
                  track={track}
                  index={realIndex}
                  isCurrentTrack={false}
                  isPlaying={false}
                  onSelect={() => {
                    goToIndex(realIndex);
                    play(track);
                  }}
                />
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-content-tertiary">
            <p className="text-sm">Queue is empty</p>
            <p className="text-xs mt-1">Add tracks to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}
