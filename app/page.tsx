"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useTracks, usePlaylists } from "@/lib/api/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { FrequencyAnalyzer } from "@/components/visualizer/FrequencyAnalyzer";
import { TrackList } from "@/components/playlist/TrackList";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/utils/formatTime";
import Link from "next/link";
import type { Track } from "@/types";

export default function HomePage() {
  const { data: tracksData, isLoading: tracksLoading } = useTracks();
  const { data: playlistsData, isLoading: playlistsLoading } = usePlaylists();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play = usePlayerStore((s) => s.play);
  const setQueue = useQueueStore((s) => s.setQueue);

  const handlePlayAll = () => {
    if (!tracksData?.tracks.length) return;
    setQueue(tracksData.tracks, 0);
    play(tracksData.tracks[0]);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero / Visualization Area */}
      <section>
        {currentTrack ? (
          <div className="relative rounded-2xl overflow-hidden bg-surface-secondary">
            <Visualizer height="h-40 sm:h-52 lg:h-64" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-primary/90 to-transparent p-4 sm:p-6 pointer-events-none">
              <FrequencyAnalyzer className="max-w-sm pointer-events-auto" />
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 via-surface-secondary to-accent-cyan/10 p-8 sm:p-12">
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-primary">
                WaveSync
              </h1>
              <p className="mt-2 text-content-secondary max-w-md">
                Immersive music experience with real-time audio visualization,
                frequency analysis, and low-latency playback.
              </p>
              <button
                onClick={handlePlayAll}
                className="mt-5 inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                <Play size={16} fill="currentColor" />
                Play All
              </button>
            </div>
            {/* Decorative bars */}
            <div className="absolute right-8 bottom-0 flex items-end gap-1.5 opacity-20">
              {[40, 65, 50, 80, 35, 70, 45, 90, 55, 75, 40, 60].map((h, i) => (
                <div
                  key={i}
                  className="w-2 sm:w-3 rounded-t bg-accent"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Playlists */}
      <section>
        <h2 className="text-lg font-semibold text-content-primary mb-4">
          Playlists
        </h2>
        {playlistsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlistsData?.playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                name={playlist.name}
                coverArt={playlist.coverArt}
                trackCount={playlist.trackCount}
                totalDuration={playlist.totalDuration}
              />
            ))}
          </div>
        )}
      </section>

      {/* All Tracks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-content-primary">
            All Tracks
          </h2>
          {tracksData && (
            <span className="text-xs text-content-tertiary">
              {tracksData.total} tracks
            </span>
          )}
        </div>

        {tracksLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <TrackList tracks={tracksData?.tracks ?? []} />
        )}
      </section>
    </div>
  );
}

function PlaylistCard({
  id,
  name,
  coverArt,
  trackCount,
  totalDuration,
}: {
  id: string;
  name: string;
  coverArt: string;
  trackCount: number;
  totalDuration: number;
}) {
  return (
    <Link
      href={`/playlist/${id}`}
      className="group block rounded-xl bg-surface-secondary p-3 transition-colors hover:bg-surface-tertiary"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface-tertiary mb-3">
        <Image
          src={coverArt}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg">
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-content-primary truncate">
        {name}
      </h3>
      <p className="text-xs text-content-tertiary mt-0.5">
        {trackCount} tracks &middot; {formatTime(totalDuration)}
      </p>
    </Link>
  );
}
