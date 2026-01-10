import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Track } from "@/types";
import { shuffleArray } from "@/lib/utils/shuffleArray";

interface QueueState {
  tracks: Track[];
  originalOrder: Track[];
  currentIndex: number;
}

interface QueueActions {
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  addNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (from: number, to: number) => void;
  goToIndex: (index: number) => void;
  nextTrack: () => Track | null;
  prevTrack: () => Track | null;
  getCurrentTrack: () => Track | null;
  shuffleQueue: () => void;
  unshuffleQueue: () => void;
}

export type QueueStore = QueueState & QueueActions;

export const useQueueStore = create<QueueStore>()(
  devtools(
    (set, get) => ({
      tracks: [],
      originalOrder: [],
      currentIndex: -1,

      setQueue: (tracks, startIndex = 0) => {
        set({
          tracks,
          originalOrder: [...tracks],
          currentIndex: startIndex,
        });
      },

      addToQueue: (track) => {
        set((s) => ({
          tracks: [...s.tracks, track],
          originalOrder: [...s.originalOrder, track],
        }));
      },

      addNext: (track) => {
        set((s) => {
          const newTracks = [...s.tracks];
          newTracks.splice(s.currentIndex + 1, 0, track);
          return { tracks: newTracks };
        });
      },

      removeFromQueue: (index) => {
        set((s) => {
          const newTracks = s.tracks.filter((_, i) => i !== index);
          const newIndex =
            index < s.currentIndex
              ? s.currentIndex - 1
              : index === s.currentIndex
                ? Math.min(s.currentIndex, newTracks.length - 1)
                : s.currentIndex;
          return { tracks: newTracks, currentIndex: newIndex };
        });
      },

      clearQueue: () =>
        set({ tracks: [], originalOrder: [], currentIndex: -1 }),

      reorderQueue: (from, to) => {
        set((s) => {
          const newTracks = [...s.tracks];
          const [moved] = newTracks.splice(from, 1);
          newTracks.splice(to, 0, moved);

          let newIndex = s.currentIndex;
          if (from === s.currentIndex) {
            newIndex = to;
          } else if (
            from < s.currentIndex &&
            to >= s.currentIndex
          ) {
            newIndex--;
          } else if (
            from > s.currentIndex &&
            to <= s.currentIndex
          ) {
            newIndex++;
          }

          return { tracks: newTracks, currentIndex: newIndex };
        });
      },

      goToIndex: (index) => {
        const { tracks } = get();
        if (index >= 0 && index < tracks.length) {
          set({ currentIndex: index });
          return tracks[index];
        }
        return null;
      },

      nextTrack: () => {
        const { tracks, currentIndex } = get();
        if (tracks.length === 0) return null;
        const nextIndex = (currentIndex + 1) % tracks.length;
        if (nextIndex === 0 && currentIndex === tracks.length - 1) {
          // Reached the end — still set index for repeat-all to use
          set({ currentIndex: nextIndex });
          return tracks[nextIndex];
        }
        set({ currentIndex: nextIndex });
        return tracks[nextIndex];
      },

      prevTrack: () => {
        const { tracks, currentIndex } = get();
        if (tracks.length === 0) return null;
        const prevIndex =
          currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
        set({ currentIndex: prevIndex });
        return tracks[prevIndex];
      },

      getCurrentTrack: () => {
        const { tracks, currentIndex } = get();
        return tracks[currentIndex] ?? null;
      },

      shuffleQueue: () => {
        set((s) => {
          const current = s.tracks[s.currentIndex];
          const others = s.tracks.filter((_, i) => i !== s.currentIndex);
          const shuffled = [current, ...shuffleArray(others)];
          return { tracks: shuffled, currentIndex: 0 };
        });
      },

      unshuffleQueue: () => {
        set((s) => {
          const current = s.tracks[s.currentIndex];
          const originalIndex = s.originalOrder.findIndex(
            (t) => t.id === current?.id,
          );
          return {
            tracks: [...s.originalOrder],
            currentIndex: originalIndex >= 0 ? originalIndex : 0,
          };
        });
      },
    }),
    { name: "WaveSync Queue" },
  ),
);
