"use client";

import { useRef, useCallback } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useProgressAnimation } from "@/hooks/useProgressAnimation";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { formatTime } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  showTimeLabels?: boolean;
  height?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  showTimeLabels = true,
  height = "md",
  className,
}: ProgressBarProps) {
  const duration = usePlayerStore((s) => s.duration);
  const engine = AudioEngine.getInstance();
  const { fillRef, bufferRef, timeRef } = useProgressAnimation(engine);
  const barRef = useRef<HTMLDivElement>(null);

  const handleSeek = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!barRef.current || !duration) return;

      const rect = barRef.current.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : e.clientX;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const time = pct * duration;

      engine.seek(time);
      usePlayerStore.getState().setProgress(time);
    },
    [duration, engine],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleSeek(e);

      const handleMove = (ev: MouseEvent) => {
        if (!barRef.current || !duration) return;
        const rect = barRef.current.getBoundingClientRect();
        const pct = Math.max(
          0,
          Math.min(1, (ev.clientX - rect.left) / rect.width),
        );
        const time = pct * duration;
        engine.seek(time);
        usePlayerStore.getState().setProgress(time);
      };

      const handleUp = () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [handleSeek, duration, engine],
  );

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {showTimeLabels && (
        <span
          ref={timeRef}
          className="text-[11px] font-mono tabular-nums text-content-tertiary min-w-[36px] text-right"
        >
          0:00
        </span>
      )}

      <div
        ref={barRef}
        className={cn(
          "group relative flex-1 cursor-pointer",
          height === "sm" ? "py-2" : "py-3",
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={duration}
        tabIndex={0}
      >
        {/* Track */}
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-surface-tertiary transition-all duration-200",
            height === "sm" ? "h-[3px]" : "h-1 group-hover:h-1.5",
          )}
        >
          {/* Buffer */}
          <div
            ref={bufferRef}
            className="absolute inset-0 origin-left bg-surface-elevated"
            style={{ transform: "scaleX(0)" }}
          />
          {/* Fill */}
          <div
            ref={fillRef}
            className="absolute inset-0 origin-left bg-gradient-to-r from-accent to-accent-cyan"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Thumb (visible on hover) */}
        {height === "md" && (
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: "0%" }}
          >
            <div className="h-3 w-3 rounded-full bg-content-primary shadow-md" />
          </div>
        )}
      </div>

      {showTimeLabels && (
        <span className="text-[11px] font-mono tabular-nums text-content-tertiary min-w-[36px]">
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
