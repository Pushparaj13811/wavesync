"use client";

import { useRef, useCallback } from "react";
import { Volume2, Volume1, VolumeX, Volume } from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils/cn";

export function VolumeControl({ className }: { className?: string }) {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const barRef = useRef<HTMLDivElement>(null);

  const VolumeIcon =
    isMuted || volume === 0
      ? VolumeX
      : volume < 0.33
        ? Volume
        : volume < 0.66
          ? Volume1
          : Volume2;

  const effectiveVolume = isMuted ? 0 : volume;

  const handleSeek = useCallback(
    (clientX: number) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setVolume(pct);
    },
    [setVolume],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleSeek(e.clientX);

      const handleMove = (ev: MouseEvent) => handleSeek(ev.clientX);
      const handleUp = () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [handleSeek],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      setVolume(Math.max(0, Math.min(1, volume + delta)));
    },
    [volume, setVolume],
  );

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      onWheel={handleWheel}
    >
      <IconButton label={isMuted ? "Unmute" : "Mute"} onClick={toggleMute}>
        <VolumeIcon size={18} />
      </IconButton>

      <div
        ref={barRef}
        className="group relative w-20 cursor-pointer py-2 hidden sm:block"
        onMouseDown={handleMouseDown}
      >
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-tertiary group-hover:h-1.5 transition-all">
          <div
            className="absolute inset-0 origin-left bg-content-primary rounded-full"
            style={{ transform: `scaleX(${effectiveVolume})` }}
          />
        </div>
      </div>
    </div>
  );
}
