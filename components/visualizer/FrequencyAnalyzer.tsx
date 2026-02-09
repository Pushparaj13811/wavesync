"use client";

import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { cn } from "@/lib/utils/cn";

const BANDS = [
  { name: "Sub", rangeHz: [20, 60] as [number, number], color: "#6366F1" },
  { name: "Bass", rangeHz: [60, 250] as [number, number], color: "#818CF8" },
  { name: "Low", rangeHz: [250, 500] as [number, number], color: "#22D3EE" },
  { name: "Mid", rangeHz: [500, 2000] as [number, number], color: "#34D399" },
  { name: "High", rangeHz: [2000, 4000] as [number, number], color: "#FBBF24" },
  { name: "Air", rangeHz: [4000, 20000] as [number, number], color: "#FB7185" },
];

export function FrequencyAnalyzer({ className }: { className?: string }) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [levels, setLevels] = useState<number[]>(BANDS.map(() => 0));
  const peaksRef = useRef<number[]>(BANDS.map(() => 0));
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      // Decay to zero
      setLevels(BANDS.map(() => 0));
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const engine = AudioEngine.getInstance();
    const sampleRate = 44100; // typical

    const analyze = () => {
      const data = engine.getFrequencyData();
      if (data.length === 0) {
        rafRef.current = requestAnimationFrame(analyze);
        return;
      }

      const binCount = data.length;
      const nyquist = sampleRate / 2;
      const hzPerBin = nyquist / binCount;

      const newLevels = BANDS.map((band, idx) => {
        const startBin = Math.floor(band.rangeHz[0] / hzPerBin);
        const endBin = Math.min(
          Math.floor(band.rangeHz[1] / hzPerBin),
          binCount - 1,
        );

        let sum = 0;
        let count = 0;
        for (let i = startBin; i <= endBin; i++) {
          sum += data[i];
          count++;
        }

        const avg = count > 0 ? sum / count / 255 : 0;

        // Peak hold
        if (avg > peaksRef.current[idx]) {
          peaksRef.current[idx] = avg;
        } else {
          peaksRef.current[idx] *= 0.995; // slow decay
        }

        return avg;
      });

      setLevels(newLevels);
      rafRef.current = requestAnimationFrame(analyze);
    };

    rafRef.current = requestAnimationFrame(analyze);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {BANDS.map((band, i) => (
        <div key={band.name} className="flex flex-col items-center gap-1.5 flex-1">
          {/* Bar */}
          <div className="relative w-full h-16 flex items-end justify-center">
            <div
              className="w-full max-w-[24px] rounded-t-sm transition-all duration-75"
              style={{
                height: `${Math.max(4, levels[i] * 100)}%`,
                backgroundColor: band.color,
                opacity: 0.8 + levels[i] * 0.2,
              }}
            />
            {/* Peak indicator */}
            <div
              className="absolute w-full max-w-[24px] h-0.5 rounded-full left-1/2 -translate-x-1/2 transition-all duration-300"
              style={{
                bottom: `${peaksRef.current[i] * 100}%`,
                backgroundColor: band.color,
              }}
            />
          </div>
          {/* Label */}
          <span className="text-[9px] font-medium text-content-tertiary uppercase tracking-wider">
            {band.name}
          </span>
        </div>
      ))}
    </div>
  );
}
