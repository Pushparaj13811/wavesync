"use client";

import { use } from "react";
import Image from "next/image";
import { Play, Shuffle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePlaylist } from "@/lib/api/tracks";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { TrackList } from "@/components/playlist/TrackList";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/utils/formatTime";
import { shuffleArray } from "@/lib/utils/shuffleArray";

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: playlist, isLoading } = usePlaylist(id);
  const play = usePlayerStore((s) => s.play);
  const setQueue = useQueueStore((s) => s.setQueue);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const handlePlay = () => {
    if (!playlist?.tracks.length) return;
    setQueue(playlist.tracks, 0);
    play(playlist.tracks[0]);
  };

  const handleShuffle = () => {
    if (!playlist?.tracks.length) return;
    const shuffled = shuffleArray(playlist.tracks);
    setQueue(shuffled, 0);
    play(shuffled[0]);
    toggleShuffle();
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-48 w-48 rounded-xl shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-content-tertiary">Playlist not found</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button (mobile) */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary lg:hidden"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-surface-tertiary shadow-[var(--shadow-album)]">
          <Image
            src={playlist.coverArt}
            alt={playlist.name}
            fill
            className="object-cover"
            sizes="192px"
            unoptimized
          />
        </div>

        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-content-tertiary mb-1">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-content-primary">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="mt-1.5 text-sm text-content-secondary max-w-lg">
              {playlist.description}
            </p>
          )}
          <p className="mt-2 text-xs text-content-tertiary">
            {playlist.trackCount} tracks &middot;{" "}
            {formatTime(playlist.totalDuration)}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              <Play size={16} fill="currentColor" />
              Play
            </button>
            <button
              onClick={handleShuffle}
              className="inline-flex items-center gap-2 bg-surface-tertiary hover:bg-surface-elevated text-content-primary px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              <Shuffle size={16} />
              Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <TrackList
        tracks={playlist.tracks}
        playlistTracks={playlist.tracks}
      />
    </div>
  );
}
