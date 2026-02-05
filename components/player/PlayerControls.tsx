"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/utils/cn";

interface PlayerControlsProps {
  size?: "sm" | "md" | "lg";
  showShuffleRepeat?: boolean;
  className?: string;
}

export function PlayerControls({
  size = "md",
  showShuffleRepeat = true,
  className,
}: PlayerControlsProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffled = usePlayerStore((s) => s.isShuffled);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const play = usePlayerStore((s) => s.play);

  const nextTrack = useQueueStore((s) => s.nextTrack);
  const prevTrack = useQueueStore((s) => s.prevTrack);

  const handleTogglePlay = () => {
    const engine = AudioEngine.getInstance();
    engine.init();
    togglePlay();
    if (!isPlaying) {
      engine.play();
    } else {
      engine.pause();
    }
  };

  const handlePrev = () => {
    const engine = AudioEngine.getInstance();
    if (engine.getCurrentTime() > 3) {
      engine.seek(0);
      usePlayerStore.getState().setProgress(0);
    } else {
      const track = prevTrack();
      if (track) play(track);
    }
  };

  const handleNext = () => {
    const track = nextTrack();
    if (track) play(track);
  };

  const playBtnSize = size === "sm" ? "md" : size === "md" ? "md" : "lg";
  const iconSize = size === "sm" ? 16 : size === "md" ? 18 : 22;
  const playIconSize = size === "sm" ? 18 : size === "md" ? 20 : 24;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showShuffleRepeat && (
        <IconButton
          label={isShuffled ? "Shuffle on" : "Shuffle off"}
          isActive={isShuffled}
          showDot
          size="sm"
          onClick={toggleShuffle}
        >
          <Shuffle size={14} />
        </IconButton>
      )}

      <IconButton label="Previous track" size={playBtnSize} onClick={handlePrev}>
        <SkipBack size={iconSize} fill="currentColor" />
      </IconButton>

      <button
        onClick={handleTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={cn(
          "flex items-center justify-center rounded-full bg-content-primary text-surface-primary transition-all duration-150",
          "hover:scale-105 active:scale-95",
          size === "sm" && "h-8 w-8",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-14 w-14",
        )}
      >
        {isPlaying ? (
          <Pause size={playIconSize} fill="currentColor" />
        ) : (
          <Play size={playIconSize} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <IconButton label="Next track" size={playBtnSize} onClick={handleNext}>
        <SkipForward size={iconSize} fill="currentColor" />
      </IconButton>

      {showShuffleRepeat && (
        <IconButton
          label={`Repeat ${repeatMode}`}
          isActive={repeatMode !== "off"}
          showDot
          size="sm"
          onClick={cycleRepeatMode}
        >
          {repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
        </IconButton>
      )}
    </div>
  );
}
