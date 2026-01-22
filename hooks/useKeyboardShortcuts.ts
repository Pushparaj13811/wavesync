"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { useUIStore } from "@/stores/useUIStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { AudioEngine } from "@/lib/audio/AudioEngine";

export function useKeyboardShortcuts() {
  const enabled = useSettingsStore((s) => s.enableKeyboardShortcuts);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const engine = AudioEngine.getInstance();
      const player = usePlayerStore.getState();
      const queue = useQueueStore.getState();

      switch (e.key) {
        case " ": {
          e.preventDefault();
          player.togglePlay();
          if (!player.isPlaying) engine.play();
          else engine.pause();
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const skip = e.shiftKey ? 10 : 5;
          const newTime = Math.min(
            engine.getCurrentTime() + skip,
            engine.getDuration(),
          );
          engine.seek(newTime);
          player.setProgress(newTime);
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const skip = e.shiftKey ? 10 : 5;
          const newTime = Math.max(engine.getCurrentTime() - skip, 0);
          engine.seek(newTime);
          player.setProgress(newTime);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          player.setVolume(Math.min(player.volume + 0.05, 1));
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          player.setVolume(Math.max(player.volume - 0.05, 0));
          break;
        }
        case "m":
        case "M": {
          player.toggleMute();
          break;
        }
        case "n":
        case "N": {
          const track = queue.nextTrack();
          if (track) player.play(track);
          break;
        }
        case "p":
        case "P": {
          // If > 3 seconds in, restart; otherwise go to previous
          if (engine.getCurrentTime() > 3) {
            engine.seek(0);
            player.setProgress(0);
          } else {
            const track = queue.prevTrack();
            if (track) player.play(track);
          }
          break;
        }
        case "s":
        case "S": {
          player.toggleShuffle();
          break;
        }
        case "r":
        case "R": {
          player.cycleRepeatMode();
          break;
        }
        case "?": {
          useUIStore.getState().toggleKeyboardHelp();
          break;
        }
        case "Escape": {
          const ui = useUIStore.getState();
          if (ui.isKeyboardHelpOpen) ui.toggleKeyboardHelp();
          if (ui.isFullPlayerOpen) ui.setFullPlayerOpen(false);
          if (ui.isQueueOpen) ui.setQueueOpen(false);
          break;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled]);
}
