"use client";

import { useEffect, useRef, useCallback } from "react";
import type { AudioEngine } from "@/lib/audio/AudioEngine";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { VisualizerMode } from "@/types";

export function useAudioVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  engine: AudioEngine,
) {
  const rafRef = useRef(0);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const mode = useSettingsStore((s) => s.visualizerMode);

  const drawBars = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const data = engine.getFrequencyData();
      if (data.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Use subset of bins for better visual
      const barCount = Math.min(data.length, 64);
      const barWidth = (width / barCount) * 0.8;
      const gap = (width / barCount) * 0.2;

      for (let i = 0; i < barCount; i++) {
        const amplitude = data[i] / 255;
        const barHeight = amplitude * height * 0.85;
        const x = i * (barWidth + gap);

        // Gradient from indigo → cyan → emerald
        const hue = 240 + (i / barCount) * 120;
        const lightness = 55 + amplitude * 15;
        ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;

        // Rounded top
        const radius = Math.min(barWidth / 2, 3);
        const y = height - barHeight;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Reflection
        ctx.globalAlpha = 0.15;
        ctx.fillRect(x, height, barWidth, barHeight * 0.2);
        ctx.globalAlpha = 1;
      }
    },
    [engine],
  );

  const drawWaveform = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const data = engine.getTimeDomainData();
      if (data.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Glow
      ctx.shadowColor = "#22D3EE";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22D3EE";
      ctx.beginPath();

      const sliceWidth = width / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    [engine],
  );

  const drawCircular = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const data = engine.getFrequencyData();
      if (data.length === 0) return;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const innerRadius = Math.min(width, height) * 0.2;
      const maxBarHeight = Math.min(width, height) * 0.25;
      const barCount = Math.min(data.length, 80);

      for (let i = 0; i < barCount; i++) {
        const amplitude = data[i] / 255;
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
        const barHeight = amplitude * maxBarHeight;

        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * (innerRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (innerRadius + barHeight);

        const hue = 240 + (i / barCount) * 120;
        ctx.strokeStyle = `hsl(${hue}, 80%, ${55 + amplitude * 15}%)`;
        ctx.lineWidth = Math.max(2, (Math.PI * 2 * innerRadius) / barCount - 1);
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    },
    [engine],
  );

  const draw = useCallback(
    (currentMode: VisualizerMode) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const width = rect.width;
      const height = rect.height;

      switch (currentMode) {
        case "bars":
          drawBars(ctx, width, height);
          break;
        case "waveform":
          drawWaveform(ctx, width, height);
          break;
        case "circular":
          drawCircular(ctx, width, height);
          break;
      }
    },
    [canvasRef, drawBars, drawWaveform, drawCircular],
  );

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      draw(mode);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, mode, draw]);

  return { isActive: isPlaying };
}
