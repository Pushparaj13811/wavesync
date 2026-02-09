"use client";

import { memo } from "react";
import Image from "next/image";
import { Play, MoreHorizontal } from "lucide-react";
import type { Track } from "@/types";
import { formatTime } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils/cn";

interface TrackItemProps {
  track: Track;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}

export const TrackItem = memo(function TrackItem({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  onSelect,
}: TrackItemProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150",
        isCurrentTrack
          ? "bg-surface-tertiary"
          : "hover:bg-surface-secondary",
      )}
      role="option"
      aria-selected={isCurrentTrack}
    >
      {/* Index / Play indicator */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {isCurrentTrack && isPlaying ? (
          <div className="flex items-end gap-0.5 h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[3px] bg-accent rounded-full"
                style={{
                  animation: `pulse-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  height: "100%",
                }}
              />
            ))}
          </div>
        ) : (
          <span
            className={cn(
              "text-sm tabular-nums group-hover:hidden",
              isCurrentTrack ? "text-accent" : "text-content-tertiary",
            )}
          >
            {index + 1}
          </span>
        )}
        {!isCurrentTrack && (
          <Play
            size={14}
            className="hidden group-hover:block text-content-primary"
            fill="currentColor"
          />
        )}
      </div>

      {/* Art */}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-tertiary">
        <Image
          src={track.coverArt}
          alt={track.album.name}
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm truncate",
            isCurrentTrack ? "text-accent" : "text-content-primary",
          )}
        >
          {track.title}
        </div>
        <div className="text-xs text-content-secondary truncate">
          {track.artist.name}
        </div>
      </div>

      {/* Duration */}
      <span className="text-xs font-mono tabular-nums text-content-tertiary shrink-0">
        {formatTime(track.duration)}
      </span>

      {/* More button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-content-tertiary hover:text-content-primary"
        aria-label="More options"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
});
