// ── Track & Music Types ──────────────────────────────────────────

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Album {
  id: string;
  name: string;
  coverArt: string;
  year: number;
}

export type Genre =
  | "electronic"
  | "ambient"
  | "hip-hop"
  | "rock"
  | "pop"
  | "jazz"
  | "classical"
  | "lo-fi"
  | "drum-and-bass"
  | "house"
  | "latin"
  | "world"
  | "funk"
  | "blues";

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  album: Album;
  duration: number;
  src: string;
  coverArt: string;
  coverArtLarge: string;
  genre: Genre;
  bpm?: number;
  year?: number;
  waveformData?: number[];
}

// ── Playlist Types ───────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt: string;
  tracks: Track[];
  trackCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSummary {
  id: string;
  name: string;
  coverArt: string;
  trackCount: number;
  totalDuration: number;
}

// ── Player Types ─────────────────────────────────────────────────

export type RepeatMode = "off" | "all" | "one";

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type VisualizerMode = "bars" | "waveform" | "circular";

export type FFTSize = 256 | 512 | 1024 | 2048 | 4096;

// ── Toast Types ──────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

// ── Frequency Band ───────────────────────────────────────────────

export interface FrequencyBand {
  name: string;
  rangeHz: [number, number];
  level: number;
  peak: number;
  color: string;
}
