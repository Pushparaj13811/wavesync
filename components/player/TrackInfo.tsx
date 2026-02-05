"use client";

import Image from "next/image";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { cn } from "@/lib/utils/cn";

interface TrackInfoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrackInfo({ size = "md", className }: TrackInfoProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  if (!currentTrack) return null;

  const artSize = size === "sm" ? 36 : size === "md" ? 44 : 280;

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md bg-surface-tertiary",
          size === "lg" && "rounded-xl shadow-[var(--shadow-album)]",
        )}
        style={{ width: artSize, height: artSize }}
      >
        <Image
          src={currentTrack.coverArt}
          alt={currentTrack.album.name}
          fill
          className="object-cover"
          sizes={`${artSize}px`}
          unoptimized
        />
      </div>
      <div className="min-w-0 flex flex-col">
        <span
          className={cn(
            "truncate font-medium text-content-primary",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-xl",
          )}
        >
          {currentTrack.title}
        </span>
        <span
          className={cn(
            "truncate text-content-secondary",
            size === "sm" && "text-[11px]",
            size === "md" && "text-xs",
            size === "lg" && "text-sm",
          )}
        >
          {currentTrack.artist.name}
        </span>
        {size === "lg" && (
          <span className="text-xs text-content-tertiary mt-0.5">
            {currentTrack.album.name}
          </span>
        )}
      </div>
    </div>
  );
}
