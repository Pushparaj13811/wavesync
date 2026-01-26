import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { trackKeys, playlistKeys } from "./queryKeys";
import type { Track, Playlist, PlaylistSummary } from "@/types";

// ── Fetchers ─────────────────────────────────────────────────────

async function fetchTracks(
  filters?: Record<string, string>,
): Promise<{ tracks: Track[]; total: number }> {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/tracks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}

async function fetchTrack(id: string): Promise<Track> {
  const res = await fetch(`/api/tracks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch track");
  return res.json();
}

async function fetchPlaylists(): Promise<{
  playlists: PlaylistSummary[];
}> {
  const res = await fetch("/api/playlists");
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
}

async function fetchPlaylist(id: string): Promise<Playlist> {
  const res = await fetch(`/api/playlists/${id}`);
  if (!res.ok) throw new Error("Failed to fetch playlist");
  return res.json();
}

// ── Query Hooks ──────────────────────────────────────────────────

export function useTracks(filters?: Record<string, string>) {
  return useQuery({
    queryKey: trackKeys.list(filters ?? {}),
    queryFn: () => fetchTracks(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: trackKeys.detail(id),
    queryFn: () => fetchTrack(id),
    enabled: !!id,
  });
}

export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.lists(),
    queryFn: fetchPlaylists,
    staleTime: 60_000,
  });
}

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: () => fetchPlaylist(id),
    enabled: !!id,
  });
}
