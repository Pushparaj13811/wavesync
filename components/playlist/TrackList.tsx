"use client";

import type { Track } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import { TrackItem } from "./TrackItem";

interface TrackListProps {
  tracks: Track[];
  playlistTracks?: Track[];
  className?: string;
}

export function TrackList({
  tracks,
  playlistTracks,
  className,
}: TrackListProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const setQueue = useQueueStore((s) => s.setQueue);

  const handleSelect = (track: Track, index: number) => {
    const queueTracks = playlistTracks ?? tracks;
    setQueue(queueTracks, index);
    play(track);
  };

  return (
    <div className={className} role="listbox" aria-label="Track list">
      {tracks.map((track, i) => (
        <TrackItem
          key={track.id}
          track={track}
          index={i}
          isCurrentTrack={currentTrack?.id === track.id}
          isPlaying={isPlaying && currentTrack?.id === track.id}
          onSelect={() => handleSelect(track, i)}
        />
      ))}
    </div>
  );
}
