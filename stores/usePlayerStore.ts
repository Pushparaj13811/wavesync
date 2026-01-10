import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { Track, RepeatMode, PlaybackStatus } from "@/types";

interface PlayerState {
  currentTrack: Track | null;
  status: PlaybackStatus;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  previousVolume: number;
  progress: number;
  duration: number;
  buffered: number;
  isBuffering: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  error: string | null;
}

interface PlayerActions {
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setProgress: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (time: number) => void;
  setBuffering: (isBuffering: boolean) => void;
  setError: (error: string | null) => void;
  setStatus: (status: PlaybackStatus) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

const initialState: PlayerState = {
  currentTrack: null,
  status: "idle",
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  previousVolume: 0.8,
  progress: 0,
  duration: 0,
  buffered: 0,
  isBuffering: false,
  repeatMode: "off",
  isShuffled: false,
  error: null,
};

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      play: (track) => {
        if (track) {
          set({
            currentTrack: track,
            isPlaying: true,
            status: "loading",
            progress: 0,
            duration: 0,
            error: null,
          });
        } else {
          set({ isPlaying: true, status: "playing" });
        }
      },

      pause: () => set({ isPlaying: false, status: "paused" }),

      togglePlay: () => {
        const { isPlaying, currentTrack } = get();
        if (!currentTrack) return;
        if (isPlaying) {
          set({ isPlaying: false, status: "paused" });
        } else {
          set({ isPlaying: true, status: "playing" });
        }
      },

      stop: () => set({ ...initialState }),

      seek: (time) => set({ progress: time }),

      setVolume: (value) =>
        set({ volume: Math.max(0, Math.min(1, value)), isMuted: false }),

      toggleMute: () => {
        const { isMuted, volume, previousVolume } = get();
        if (isMuted) {
          set({ isMuted: false, volume: previousVolume });
        } else {
          set({ isMuted: true, previousVolume: volume });
        }
      },

      setRepeatMode: (mode) => set({ repeatMode: mode }),

      cycleRepeatMode: () => {
        const modes: RepeatMode[] = ["off", "all", "one"];
        const idx = modes.indexOf(get().repeatMode);
        set({ repeatMode: modes[(idx + 1) % modes.length] });
      },

      toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),

      setProgress: (time) => set({ progress: time }),
      setDuration: (duration) => set({ duration }),
      setBuffered: (time) => set({ buffered: time }),
      setBuffering: (isBuffering) => set({ isBuffering }),
      setError: (error) =>
        set({ error, status: error ? "error" : get().status }),
      setStatus: (status) => set({ status }),
    })),
    { name: "WaveSync Player" },
  ),
);
