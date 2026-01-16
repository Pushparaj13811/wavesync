import type { Track } from "@/types";

export class MediaSessionManager {
  static updateMetadata(track: Track): void {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist.name,
      album: track.album.name,
      artwork: [
        { src: track.coverArt, sizes: "300x300", type: "image/jpeg" },
        { src: track.coverArtLarge, sizes: "600x600", type: "image/jpeg" },
      ],
    });
  }

  static setPlaybackState(state: MediaSessionPlaybackState): void {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = state;
  }

  static setActionHandlers(handlers: {
    play: () => void;
    pause: () => void;
    previoustrack: () => void;
    nexttrack: () => void;
    seekto?: (details: MediaSessionActionDetails) => void;
  }): void {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", handlers.play);
    navigator.mediaSession.setActionHandler("pause", handlers.pause);
    navigator.mediaSession.setActionHandler(
      "previoustrack",
      handlers.previoustrack,
    );
    navigator.mediaSession.setActionHandler("nexttrack", handlers.nexttrack);
    if (handlers.seekto) {
      navigator.mediaSession.setActionHandler("seekto", handlers.seekto);
    }
  }

  static updatePositionState(state: {
    duration: number;
    playbackRate: number;
    position: number;
  }): void {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.setPositionState(state);
    } catch {
      // Position state may fail if values are invalid
    }
  }
}
