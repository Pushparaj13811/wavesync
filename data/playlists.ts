import type { Playlist } from "@/types";
import { tracks } from "./tracks";

function makePlaylist(
  id: string,
  name: string,
  description: string,
  coverArt: string,
  trackIds: string[],
): Playlist {
  const playlistTracks = trackIds
    .map((tid) => tracks.find((t) => t.id === tid))
    .filter(Boolean) as typeof tracks;

  return {
    id,
    name,
    description,
    coverArt,
    tracks: playlistTracks,
    trackCount: playlistTracks.length,
    totalDuration: playlistTracks.reduce((sum, t) => sum + t.duration, 0),
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  };
}

export const playlists: Playlist[] = [
  makePlaylist(
    "playlist-001",
    "Late Night Coding",
    "Electronic and synthwave beats for deep work sessions",
    "/covers/album-2.svg",
    ["track-003", "track-004", "track-005", "track-001", "track-002"],
  ),
  makePlaylist(
    "playlist-002",
    "World Journey",
    "Travel the globe through sound — Eastern, tropical, and world beats",
    "/covers/album-8.svg",
    ["track-013", "track-014", "track-015", "track-009", "track-010", "track-016"],
  ),
  makePlaylist(
    "playlist-003",
    "Fiesta Latina",
    "Latin grooves and tropical rhythms to get you moving",
    "/covers/album-4.svg",
    ["track-007", "track-008", "track-009", "track-010", "track-011"],
  ),
  makePlaylist(
    "playlist-004",
    "Energy Boost",
    "High-energy tracks across rock, hip-hop, funk, and EDM",
    "/covers/album-10.svg",
    ["track-018", "track-017", "track-011", "track-003", "track-006"],
  ),
  makePlaylist(
    "playlist-005",
    "Chill & Smooth",
    "Relaxing jazz, classical, and ambient world music",
    "/covers/album-1.svg",
    ["track-001", "track-002", "track-012", "track-016", "track-015"],
  ),
  makePlaylist(
    "playlist-006",
    "All Tracks",
    "The complete WaveSync collection — 18 tracks across 10 genres",
    "/covers/album-6.svg",
    tracks.map((t) => t.id),
  ),
];
