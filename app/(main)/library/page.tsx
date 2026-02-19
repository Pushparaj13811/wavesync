"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Clock, Music, ListMusic } from "lucide-react";
import { usePlaylists, useTracks } from "@/lib/api/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils/cn";

export default function LibraryPage() {
  const { data: playlistsData, isLoading: playlistsLoading } = usePlaylists();
  const { data: tracksData, isLoading: tracksLoading } = useTracks();
  const play = usePlayerStore((s) => s.play);
  const setQueue = useQueueStore((s) => s.setQueue);

  const handlePlayPlaylist = (playlistId: string) => {
    // We'd need the full playlist data; for now navigate
  };

  const totalTracks = tracksData?.total ?? 0;
  const totalDuration = tracksData?.tracks.reduce((s, t) => s + t.duration, 0) ?? 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          Your Library
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          All your playlists and tracks in one place
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-surface-secondary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-2 text-content-tertiary mb-2">
            <Music size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Tracks</span>
          </div>
          <p className="text-2xl font-bold text-content-primary">
            {tracksLoading ? <Skeleton className="h-8 w-12 inline-block" /> : totalTracks}
          </p>
        </div>
        <div className="bg-surface-secondary rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center gap-2 text-content-tertiary mb-2">
            <ListMusic size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Playlists</span>
          </div>
          <p className="text-2xl font-bold text-content-primary">
            {playlistsLoading ? (
              <Skeleton className="h-8 w-8 inline-block" />
            ) : (
              playlistsData?.playlists.length ?? 0
            )}
          </p>
        </div>
        <div className="bg-surface-secondary rounded-xl p-4 border border-border-subtle col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-content-tertiary mb-2">
            <Clock size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-content-primary">
            {tracksLoading ? (
              <Skeleton className="h-8 w-20 inline-block" />
            ) : (
              formatTime(totalDuration)
            )}
          </p>
        </div>
      </div>

      {/* Playlists Grid */}
      <section>
        <h2 className="text-lg font-semibold text-content-primary mb-4">
          Playlists
        </h2>

        {playlistsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlistsData?.playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-xl transition-colors",
                  "bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle",
                )}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary">
                  <Image
                    src={playlist.coverArt}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <Play
                      size={20}
                      fill="white"
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-content-primary truncate">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-content-tertiary mt-0.5">
                    {playlist.trackCount} tracks &middot;{" "}
                    {formatTime(playlist.totalDuration)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Play — all tracks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-content-primary">
            All Tracks
          </h2>
          <button
            onClick={() => {
              if (tracksData?.tracks.length) {
                setQueue(tracksData.tracks, 0);
                play(tracksData.tracks[0]);
              }
            }}
            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Play All
          </button>
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
          <div className="space-y-0.5">
            {tracksData?.tracks.map((track, i) => {
              const currentTrack = usePlayerStore.getState().currentTrack;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setQueue(tracksData.tracks, i);
                    play(track);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                    currentTrack?.id === track.id
                      ? "bg-surface-tertiary"
                      : "hover:bg-surface-secondary",
                  )}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-tertiary">
                    <Image
                      src={track.coverArt}
                      alt={track.album.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-content-primary truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-content-secondary truncate">
                      {track.artist.name} &middot; {track.album.name}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-content-tertiary">
                    {formatTime(track.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
