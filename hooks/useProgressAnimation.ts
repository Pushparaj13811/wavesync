"use client";

import { useEffect, useRef } from "react";
import type { AudioEngine } from "@/lib/audio/AudioEngine";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatTime } from "@/lib/utils/formatTime";

export function useProgressAnimation(engine: AudioEngine) {
  const fillRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = () => {
      const audio = engine.getAudioElement();
      if (!audio || !Number.isFinite(audio.duration) || audio.duration === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = audio.currentTime / audio.duration;

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${progress})`;
      }

      if (timeRef.current) {
        timeRef.current.textContent = formatTime(audio.currentTime);
      }

      if (bufferRef.current) {
        const buffered = engine.getBuffered();
        const bufferProgress = buffered / audio.duration;
        bufferRef.current.style.transform = `scaleX(${bufferProgress})`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, engine]);

  return { fillRef, bufferRef, timeRef };
}
