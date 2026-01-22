"use client";

import { useEffect, useRef, useCallback } from "react";
import { AudioEngine } from "@/lib/audio/AudioEngine";
import { MediaSessionManager } from "@/lib/audio/MediaSessionManager";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const preloadedSrcRef = useRef<string | null>(null);

  // Get the singleton
  if (!engineRef.current) {
    engineRef.current = AudioEngine.getInstance();
  }
  const engine = engineRef.current;

  const initAudio = useCallback(() => {
    engine.init();
  }, [engine]);

  useEffect(() => {
    // ── Engine → Store callbacks ──────────────────────────
    engine.onTimeUpdate = (time) => {
      usePlayerStore.getState().setProgress(time);
    };

    engine.onDurationChange = (duration) => {
      usePlayerStore.getState().setDuration(duration);
    };

    engine.onCanPlay = () => {
      const state = usePlayerStore.getState();
      if (state.status === "loading") {
        usePlayerStore.getState().setStatus("playing");
      }
    };

    engine.onBuffering = (isBuffering) => {
      usePlayerStore.getState().setBuffering(isBuffering);
    };

    engine.onError = (error) => {
      usePlayerStore.getState().setError(error.message);
    };

    engine.onEnded = () => {
      const { repeatMode } = usePlayerStore.getState();
      const queue = useQueueStore.getState();

      if (repeatMode === "one") {
        engine.seek(0);
        engine.play();
        return;
      }

      const isLastTrack =
        queue.currentIndex >= queue.tracks.length - 1;

      if (isLastTrack && repeatMode === "off") {
        usePlayerStore.getState().pause();
        return;
      }

      // Advance to next
      const nextTrack = queue.nextTrack();
      if (nextTrack) {
        usePlayerStore.getState().play(nextTrack);
        engine.load(nextTrack.src).then(() => engine.play());
      }
    };

    // ── Store → Engine subscriptions ─────────────────────
    const unsubTrack = usePlayerStore.subscribe(
      (s) => s.currentTrack,
      (track) => {
        if (!track) return;
        engine.load(track.src).then(() => {
          engine.play();
          MediaSessionManager.updateMetadata(track);
        });

        // Update document title
        document.title = `${track.title} - ${track.artist.name} | WaveSync`;
      },
    );

    const unsubVolume = usePlayerStore.subscribe(
      (s) => ({ volume: s.volume, isMuted: s.isMuted }),
      ({ volume, isMuted }) => {
        engine.setVolume(isMuted ? 0 : volume);
      },
    );

    const unsubRepeat = usePlayerStore.subscribe(
      (s) => s.repeatMode,
      (mode) => {
        engine.setLoop(mode === "one");
      },
    );

    const unsubShuffle = usePlayerStore.subscribe(
      (s) => s.isShuffled,
      (isShuffled) => {
        if (isShuffled) {
          useQueueStore.getState().shuffleQueue();
        } else {
          useQueueStore.getState().unshuffleQueue();
        }
      },
    );

    // ── Preload next track when approaching end ──────────
    const unsubProgress = usePlayerStore.subscribe(
      (s) => s.progress,
      (progress) => {
        const { duration, currentTrack } = usePlayerStore.getState();
        if (!currentTrack || duration <= 0) return;

        const pct = progress / duration;
        if (pct > 0.75) {
          const queue = useQueueStore.getState();
          const nextIndex = queue.currentIndex + 1;
          if (nextIndex < queue.tracks.length) {
            const nextSrc = queue.tracks[nextIndex].src;
            if (preloadedSrcRef.current !== nextSrc) {
              engine.preloadNext(nextSrc);
              preloadedSrcRef.current = nextSrc;
            }
          }
        }
      },
    );

    // ── MediaSession handlers ────────────────────────────
    MediaSessionManager.setActionHandlers({
      play: () => usePlayerStore.getState().togglePlay(),
      pause: () => usePlayerStore.getState().pause(),
      previoustrack: () => {
        const track = useQueueStore.getState().prevTrack();
        if (track) usePlayerStore.getState().play(track);
      },
      nexttrack: () => {
        const track = useQueueStore.getState().nextTrack();
        if (track) usePlayerStore.getState().play(track);
      },
    });

    // ── Playing state → MediaSession ─────────────────────
    const unsubPlaying = usePlayerStore.subscribe(
      (s) => s.isPlaying,
      (isPlaying) => {
        MediaSessionManager.setPlaybackState(isPlaying ? "playing" : "paused");
      },
    );

    return () => {
      unsubTrack();
      unsubVolume();
      unsubRepeat();
      unsubShuffle();
      unsubProgress();
      unsubPlaying();
    };
  }, [engine]);

  return { engine, initAudio };
}
