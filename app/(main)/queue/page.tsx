"use client";

import { ListMusic, Trash2 } from "lucide-react";
import { useQueueStore } from "@/stores/useQueueStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { TrackItem } from "@/components/playlist/TrackItem";

export default function QueuePage() {
  const tracks = useQueueStore((s) => s.tracks);
  const currentIndex = useQueueStore((s) => s.currentIndex);
  const goToIndex = useQueueStore((s) => s.goToIndex);
  const removeFromQueue = useQueueStore((s) => s.removeFromQueue);
  const clearQueue = useQueueStore((s) => s.clearQueue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);

  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;
  const upNext = tracks.slice(currentIndex + 1);
  const history = tracks.slice(0, currentIndex);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Queue
        </h1>
        {tracks.length > 0 && (
          <button
            onClick={clearQueue}
            className="flex items-center gap-1.5 text-xs font-medium text-content-tertiary hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-content-tertiary">
          <ListMusic size={48} className="mb-4 opacity-30" />
          <p className="text-base font-medium">Your queue is empty</p>
          <p className="text-sm mt-1">
            Play a track or playlist to start building your queue
          </p>
        </div>
      ) : (
        <>
          {/* Now Playing */}
          {currentTrack && (
            <section>
              <span className="px-1 text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
                Now Playing
              </span>
              <div className="mt-1">
                <TrackItem
                  track={currentTrack}
                  index={currentIndex}
                  isCurrentTrack
                  isPlaying={isPlaying}
                  onSelect={() => {}}
                />
              </div>
            </section>
          )}

          {/* Up Next */}
          {upNext.length > 0 && (
            <section>
              <span className="px-1 text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
                Up Next &middot; {upNext.length}
              </span>
              <div className="mt-1 space-y-0.5">
                {upNext.map((track, i) => {
                  const realIndex = currentIndex + 1 + i;
                  return (
                    <div key={`${track.id}-${realIndex}`} className="group relative">
                      <TrackItem
                        track={track}
                        index={realIndex}
                        isCurrentTrack={false}
                        isPlaying={false}
                        onSelect={() => {
                          goToIndex(realIndex);
                          play(track);
                        }}
                      />
                      <button
                        onClick={() => removeFromQueue(realIndex)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-content-tertiary hover:text-red-400 hover:bg-surface-tertiary transition-all"
                        aria-label={`Remove ${track.title} from queue`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* History */}
          {history.length > 0 && (
            <section>
              <span className="px-1 text-[11px] font-semibold uppercase tracking-widest text-content-tertiary">
                Recently Played &middot; {history.length}
              </span>
              <div className="mt-1 space-y-0.5 opacity-60">
                {history.map((track, i) => (
                  <TrackItem
                    key={`${track.id}-hist-${i}`}
                    track={track}
                    index={i}
                    isCurrentTrack={false}
                    isPlaying={false}
                    onSelect={() => {
                      goToIndex(i);
                      play(track);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
