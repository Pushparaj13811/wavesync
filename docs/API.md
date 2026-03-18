# WaveSync - API & Data Models Documentation

> TypeScript interfaces, Zustand store shapes, hook signatures, audio engine API, and REST endpoint specifications.

---

## 1. Core Data Models

### 1.1 Track

```ts
// types/track.ts

interface Track {
  id: string                    // Unique identifier (e.g., "track-001")
  title: string                 // Track name
  artist: Artist                // Artist info
  album: Album                  // Album info
  duration: number              // Duration in seconds
  src: string                   // Audio source URL
  coverArt: string              // Album cover image URL (300x300)
  coverArtLarge: string         // High-res cover (600x600)
  genre: Genre                  // Track genre
  bpm?: number                  // Beats per minute (optional)
  year?: number                 // Release year
  waveformData?: number[]       // Pre-computed waveform (0-1 normalized, ~200 points)
}

interface Artist {
  id: string
  name: string
  imageUrl?: string
}

interface Album {
  id: string
  name: string
  coverArt: string
  year: number
}

type Genre =
  | 'electronic'
  | 'ambient'
  | 'hip-hop'
  | 'rock'
  | 'pop'
  | 'jazz'
  | 'classical'
  | 'lo-fi'
  | 'drum-and-bass'
  | 'house'
```

### 1.2 Playlist

```ts
// types/playlist.ts

interface Playlist {
  id: string
  name: string
  description?: string
  coverArt: string              // Composite cover or custom image
  tracks: Track[]
  trackCount: number
  totalDuration: number         // Sum of all track durations in seconds
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}

interface PlaylistSummary {
  id: string
  name: string
  coverArt: string
  trackCount: number
  totalDuration: number
}
```

### 1.3 Player State Types

```ts
// types/player.ts

type RepeatMode = 'off' | 'all' | 'one'

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface PlayerState {
  currentTrack: Track | null
  status: PlaybackStatus
  isPlaying: boolean
  volume: number                // 0.0 to 1.0
  isMuted: boolean
  previousVolume: number        // Volume before mute (for unmute restore)
  progress: number              // Current time in seconds
  duration: number              // Total duration in seconds
  buffered: number              // Buffered time in seconds
  isBuffering: boolean
  repeatMode: RepeatMode
  isShuffled: boolean
  error: string | null
}

interface PlayerActions {
  // Playback
  play: (track?: Track) => void
  pause: () => void
  togglePlay: () => void
  stop: () => void
  seek: (time: number) => void

  // Volume
  setVolume: (value: number) => void
  toggleMute: () => void

  // Navigation
  nextTrack: () => void
  prevTrack: () => void

  // Modes
  setRepeatMode: (mode: RepeatMode) => void
  cycleRepeatMode: () => void
  toggleShuffle: () => void

  // State updates (called by audio engine)
  setProgress: (time: number) => void
  setDuration: (duration: number) => void
  setBuffered: (time: number) => void
  setBuffering: (isBuffering: boolean) => void
  setError: (error: string | null) => void
  setStatus: (status: PlaybackStatus) => void
}
```

### 1.4 Queue Types

```ts
// types/player.ts (continued)

interface QueueState {
  tracks: Track[]               // Current queue order
  originalOrder: Track[]        // Original order (before shuffle)
  currentIndex: number          // Index of currently playing track
  history: Track[]              // Previously played tracks (for back navigation)
}

interface QueueActions {
  setQueue: (tracks: Track[], startIndex?: number) => void
  addToQueue: (track: Track) => void
  addNext: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  goToIndex: (index: number) => void
  shuffleQueue: () => void
  unshuffleQueue: () => void
}
```

### 1.5 Visualizer Types

```ts
// types/visualizer.ts

type VisualizerMode = 'bars' | 'waveform' | 'circular' | 'mountain' | 'particles'

type FFTSize = 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192

interface VisualizerConfig {
  mode: VisualizerMode
  fftSize: FFTSize
  smoothingTimeConstant: number     // 0.0 to 1.0
  minDecibels: number               // e.g., -90
  maxDecibels: number               // e.g., -10
  barWidth: number                  // Width multiplier for bars
  barGap: number                    // Gap between bars in px
  colorStart: string                // Gradient start color
  colorEnd: string                  // Gradient end color
  showReflection: boolean           // Mirror reflection below bars
  showGlow: boolean                 // Glow effect on bars
  sensitivity: number               // 0.5 to 2.0, amplitude multiplier
}

interface FrequencyBand {
  name: string                      // e.g., "Bass", "Mid", "Treble"
  rangeHz: [number, number]         // [60, 250]
  level: number                     // 0.0 to 1.0
  peak: number                      // Peak hold value
  color: string                     // Display color
}
```

### 1.6 Settings Types

```ts
// types/settings.ts

interface AppSettings {
  theme: 'dark' | 'light'
  visualizerMode: VisualizerMode
  fftSize: FFTSize
  showFrequencyAnalyzer: boolean
  showWaveformScrubber: boolean
  enableKeyboardShortcuts: boolean
  crossfadeDuration: number         // Seconds (0 = disabled)
  enableGaplessPlayback: boolean
}
```

---

## 2. Zustand Store Definitions

### 2.1 Player Store

```ts
// stores/usePlayerStore.ts

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

type PlayerStore = PlayerState & PlayerActions

const initialState: PlayerState = {
  currentTrack: null,
  status: 'idle',
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  previousVolume: 0.8,
  progress: 0,
  duration: 0,
  buffered: 0,
  isBuffering: false,
  repeatMode: 'off',
  isShuffled: false,
  error: null,
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      play: (track) => {
        if (track) {
          set({ currentTrack: track, isPlaying: true, status: 'loading', progress: 0, error: null })
        } else {
          set({ isPlaying: true, status: 'playing' })
        }
      },

      pause: () => set({ isPlaying: false, status: 'paused' }),

      togglePlay: () => {
        const { isPlaying } = get()
        set({ isPlaying: !isPlaying, status: !isPlaying ? 'playing' : 'paused' })
      },

      stop: () => set({ ...initialState }),

      seek: (time) => set({ progress: time }),

      setVolume: (value) => set({ volume: Math.max(0, Math.min(1, value)), isMuted: false }),

      toggleMute: () => {
        const { isMuted, volume, previousVolume } = get()
        if (isMuted) {
          set({ isMuted: false, volume: previousVolume })
        } else {
          set({ isMuted: true, previousVolume: volume })
        }
      },

      nextTrack: () => { /* Delegates to queue store */ },
      prevTrack: () => { /* Delegates to queue store */ },

      setRepeatMode: (mode) => set({ repeatMode: mode }),

      cycleRepeatMode: () => {
        const modes: RepeatMode[] = ['off', 'all', 'one']
        const current = modes.indexOf(get().repeatMode)
        set({ repeatMode: modes[(current + 1) % modes.length] })
      },

      toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

      setProgress: (time) => set({ progress: time }),
      setDuration: (duration) => set({ duration }),
      setBuffered: (time) => set({ buffered: time }),
      setBuffering: (isBuffering) => set({ isBuffering }),
      setError: (error) => set({ error, status: error ? 'error' : get().status }),
      setStatus: (status) => set({ status }),
    })),
    { name: 'WaveSync Player' }
  )
)
```

### 2.2 Queue Store

```ts
// stores/useQueueStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { shuffleArray } from '@/lib/utils/shuffleArray'

type QueueStore = QueueState & QueueActions

export const useQueueStore = create<QueueStore>()(
  devtools(
    (set, get) => ({
      tracks: [],
      originalOrder: [],
      currentIndex: -1,
      history: [],

      setQueue: (tracks, startIndex = 0) => {
        set({
          tracks,
          originalOrder: [...tracks],
          currentIndex: startIndex,
          history: [],
        })
      },

      addToQueue: (track) => {
        set((state) => ({
          tracks: [...state.tracks, track],
          originalOrder: [...state.originalOrder, track],
        }))
      },

      addNext: (track) => {
        set((state) => {
          const newTracks = [...state.tracks]
          newTracks.splice(state.currentIndex + 1, 0, track)
          return { tracks: newTracks }
        })
      },

      removeFromQueue: (index) => {
        set((state) => {
          const newTracks = state.tracks.filter((_, i) => i !== index)
          const newIndex = index < state.currentIndex
            ? state.currentIndex - 1
            : state.currentIndex
          return { tracks: newTracks, currentIndex: newIndex }
        })
      },

      clearQueue: () => set({ tracks: [], originalOrder: [], currentIndex: -1, history: [] }),

      reorderQueue: (from, to) => {
        set((state) => {
          const newTracks = [...state.tracks]
          const [moved] = newTracks.splice(from, 1)
          newTracks.splice(to, 0, moved)

          let newIndex = state.currentIndex
          if (from === state.currentIndex) newIndex = to
          else if (from < state.currentIndex && to >= state.currentIndex) newIndex--
          else if (from > state.currentIndex && to <= state.currentIndex) newIndex++

          return { tracks: newTracks, currentIndex: newIndex }
        })
      },

      goToIndex: (index) => {
        const { tracks, currentIndex } = get()
        if (index >= 0 && index < tracks.length) {
          set({
            currentIndex: index,
            history: [...get().history, tracks[currentIndex]],
          })
        }
      },

      shuffleQueue: () => {
        set((state) => {
          const current = state.tracks[state.currentIndex]
          const others = state.tracks.filter((_, i) => i !== state.currentIndex)
          const shuffled = [current, ...shuffleArray(others)]
          return { tracks: shuffled, currentIndex: 0 }
        })
      },

      unshuffleQueue: () => {
        set((state) => {
          const current = state.tracks[state.currentIndex]
          const originalIndex = state.originalOrder.findIndex((t) => t.id === current?.id)
          return {
            tracks: [...state.originalOrder],
            currentIndex: originalIndex >= 0 ? originalIndex : 0,
          }
        })
      },
    }),
    { name: 'WaveSync Queue' }
  )
)
```

### 2.3 Settings Store (Persisted)

```ts
// stores/useSettingsStore.ts

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore extends AppSettings {
  setTheme: (theme: AppSettings['theme']) => void
  setVisualizerMode: (mode: VisualizerMode) => void
  setFftSize: (size: FFTSize) => void
  toggleFrequencyAnalyzer: () => void
  toggleWaveformScrubber: () => void
  toggleKeyboardShortcuts: () => void
  setCrossfadeDuration: (duration: number) => void
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  visualizerMode: 'bars',
  fftSize: 2048,
  showFrequencyAnalyzer: true,
  showWaveformScrubber: true,
  enableKeyboardShortcuts: true,
  crossfadeDuration: 0,
  enableGaplessPlayback: true,
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,

        setTheme: (theme) => set({ theme }),
        setVisualizerMode: (mode) => set({ visualizerMode: mode }),
        setFftSize: (size) => set({ fftSize: size }),
        toggleFrequencyAnalyzer: () => set((s) => ({
          showFrequencyAnalyzer: !s.showFrequencyAnalyzer,
        })),
        toggleWaveformScrubber: () => set((s) => ({
          showWaveformScrubber: !s.showWaveformScrubber,
        })),
        toggleKeyboardShortcuts: () => set((s) => ({
          enableKeyboardShortcuts: !s.enableKeyboardShortcuts,
        })),
        setCrossfadeDuration: (duration) => set({ crossfadeDuration: duration }),
        resetSettings: () => set(defaultSettings),
      }),
      {
        name: 'wavesync-settings',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: 'WaveSync Settings' }
  )
)
```

### 2.4 UI Store

```ts
// stores/useUIStore.ts

import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface UIState {
  isSidebarOpen: boolean
  isQueueOpen: boolean
  isFullPlayerOpen: boolean
  isKeyboardHelpOpen: boolean
  activeModal: string | null
  toasts: Toast[]
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleQueue: () => void
  setQueueOpen: (open: boolean) => void
  toggleFullPlayer: () => void
  setFullPlayerOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  toggleKeyboardHelp: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()((set) => ({
  isSidebarOpen: true,
  isQueueOpen: false,
  isFullPlayerOpen: false,
  isKeyboardHelpOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
  setQueueOpen: (open) => set({ isQueueOpen: open }),
  toggleFullPlayer: () => set((s) => ({ isFullPlayerOpen: !s.isFullPlayerOpen })),
  setFullPlayerOpen: (open) => set({ isFullPlayerOpen: open }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  toggleKeyboardHelp: () => set((s) => ({
    isKeyboardHelpOpen: !s.isKeyboardHelpOpen,
  })),
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),
}))
```

---

## 3. Custom Hook API

### 3.1 useAudioEngine

```ts
// hooks/useAudioEngine.ts

/**
 * Initializes and manages the AudioEngine singleton lifecycle.
 * Call once in the root player component.
 *
 * @returns {Object}
 *   audioEngine - AudioEngine singleton instance
 *   isReady     - Whether AudioContext has been created
 *   initAudio   - Call on first user interaction to create AudioContext
 */
function useAudioEngine(): {
  audioEngine: AudioEngine
  isReady: boolean
  initAudio: () => Promise<void>
}
```

### 3.2 useAudioVisualizer

```ts
// hooks/useAudioVisualizer.ts

/**
 * Manages the canvas visualization loop.
 * Reads frequency/waveform data from AudioEngine and renders to canvas.
 *
 * @param canvasRef - Ref to the <canvas> element
 * @param audioEngine - AudioEngine instance
 * @param mode - Visualization mode ('bars' | 'waveform' | 'circular')
 *
 * @returns {Object}
 *   isActive - Whether the animation loop is running
 */
function useAudioVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  audioEngine: AudioEngine,
  mode: VisualizerMode
): {
  isActive: boolean
}
```

### 3.3 useProgressAnimation

```ts
// hooks/useProgressAnimation.ts

/**
 * 60fps progress bar update using requestAnimationFrame.
 * Updates DOM directly via refs to avoid React re-renders.
 *
 * @param audioEngine - AudioEngine instance
 *
 * @returns {Object}
 *   fillRef     - Ref for the progress bar fill element (updates transform)
 *   timeRef     - Ref for the current time text element (updates textContent)
 *   bufferRef   - Ref for the buffer indicator element
 *   progressPct - Current progress as 0-100 (for ARIA attributes, updates infrequently)
 */
function useProgressAnimation(audioEngine: AudioEngine): {
  fillRef: React.RefObject<HTMLDivElement>
  timeRef: React.RefObject<HTMLSpanElement>
  bufferRef: React.RefObject<HTMLDivElement>
  progressPct: number
}
```

### 3.4 useKeyboardShortcuts

```ts
// hooks/useKeyboardShortcuts.ts

/**
 * Registers global keyboard event listeners for player control.
 * Automatically disabled when user is typing in an input/textarea.
 *
 * @param enabled - Whether shortcuts are active (from settings)
 *
 * Shortcut map:
 *   Space       → togglePlay
 *   ArrowRight  → seek +5s
 *   ArrowLeft   → seek -5s
 *   ArrowUp     → volume +5%
 *   ArrowDown   → volume -5%
 *   M           → toggleMute
 *   N           → nextTrack
 *   P           → prevTrack
 *   S           → toggleShuffle
 *   R           → cycleRepeatMode
 *   F           → toggleFullscreen
 *   ?           → toggleKeyboardHelp
 *   Escape      → closeModals
 */
function useKeyboardShortcuts(enabled?: boolean): void
```

### 3.5 useMediaSession

```ts
// hooks/useMediaSession.ts

/**
 * Integrates with the MediaSession API for OS-level media controls.
 * Updates metadata, artwork, and action handlers.
 *
 * Automatically syncs with:
 *   - usePlayerStore.currentTrack → metadata
 *   - usePlayerStore.isPlaying → playbackState
 *   - usePlayerStore actions → action handlers
 */
function useMediaSession(): void
```

### 3.6 useResponsive

```ts
// hooks/useResponsive.ts

/**
 * Provides current breakpoint information for responsive behavior.
 *
 * @returns {Object}
 *   isMobile  - width < 768px
 *   isTablet  - 768px <= width < 1024px
 *   isDesktop - width >= 1024px
 *   width     - Current window width
 */
function useResponsive(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}
```

---

## 4. Audio Engine API

### 4.1 AudioEngine Class

```ts
// lib/audio/AudioEngine.ts

class AudioEngine {
  /**
   * Get the singleton instance.
   * Creates a new instance on first call.
   */
  static getInstance(): AudioEngine

  /**
   * Initialize the Web Audio API pipeline.
   * MUST be called from a user gesture handler (click/tap).
   * Creates AudioContext, AnalyserNode, GainNode, and connects the graph.
   *
   * @throws {Error} If AudioContext is not supported
   */
  init(): void

  /**
   * Load an audio source.
   *
   * @param src - URL of the audio file (must be CORS-compatible)
   * @returns Promise that resolves when audio is ready to play
   * @throws {Error} If audio cannot be loaded (network, decode, CORS)
   */
  load(src: string): Promise<void>

  /**
   * Start or resume playback.
   * Resumes AudioContext if suspended (autoplay policy).
   *
   * @returns Promise that resolves when playback starts
   */
  play(): Promise<void>

  /**
   * Pause playback.
   */
  pause(): void

  /**
   * Seek to a specific time.
   *
   * @param time - Position in seconds
   */
  seek(time: number): void

  /**
   * Set playback volume.
   * Uses GainNode for smooth, click-free transitions.
   *
   * @param value - Volume level (0.0 to 1.0)
   */
  setVolume(value: number): void

  /**
   * Get current frequency data for visualization.
   * Returns a Uint8Array of amplitude values (0-255) per frequency bin.
   * Array length = fftSize / 2.
   *
   * @returns Uint8Array - Frequency amplitude data
   */
  getFrequencyData(): Uint8Array

  /**
   * Get current waveform (time-domain) data for visualization.
   * Returns a Uint8Array of amplitude values (0-255).
   * 128 = silence, 0/255 = max amplitude.
   *
   * @returns Uint8Array - Time-domain waveform data
   */
  getTimeDomainData(): Uint8Array

  /**
   * Preload the next track for gapless playback.
   * Creates a hidden audio element that begins downloading.
   *
   * @param src - URL of the next track
   */
  preloadNext(src: string): void

  /**
   * Switch playback to the preloaded track.
   * Provides near-gapless transition (< 50ms gap).
   */
  advanceToPreloaded(): void

  /**
   * Get the current audio element (for reading currentTime, duration, etc).
   */
  getAudioElement(): HTMLAudioElement

  /**
   * Get AudioContext state.
   */
  getContextState(): AudioContextState | null

  /**
   * Configure the AnalyserNode.
   *
   * @param config - Partial VisualizerConfig
   */
  configureAnalyser(config: Partial<VisualizerConfig>): void

  /**
   * Decode an entire audio file and return waveform data.
   * Used for pre-rendered waveform display (SoundCloud-style).
   *
   * @param src - URL of the audio file
   * @param bars - Number of data points to return (default: 200)
   * @returns Promise<number[]> - Normalized amplitudes (0.0 to 1.0)
   */
  generateWaveform(src: string, bars?: number): Promise<number[]>

  /**
   * Clean up all resources.
   * Disconnects nodes, closes AudioContext, removes audio elements.
   */
  destroy(): void

  // Event callbacks
  onTimeUpdate: ((time: number) => void) | null
  onDurationChange: ((duration: number) => void) | null
  onEnded: (() => void) | null
  onPlay: (() => void) | null
  onPause: (() => void) | null
  onError: ((error: MediaError | Error) => void) | null
  onBuffering: ((isBuffering: boolean) => void) | null
  onCanPlay: (() => void) | null
}
```

### 4.2 WaveformGenerator

```ts
// lib/audio/WaveformGenerator.ts

class WaveformGenerator {
  /**
   * Generate waveform data from an audio URL.
   *
   * @param url - Audio file URL
   * @param bars - Number of amplitude bars (default: 200)
   * @returns Normalized amplitude array (0.0 to 1.0)
   *
   * Algorithm:
   * 1. Fetch audio as ArrayBuffer
   * 2. Decode to AudioBuffer using OfflineAudioContext
   * 3. Extract channel data (Float32Array)
   * 4. Split into N buckets
   * 5. Compute RMS amplitude per bucket
   * 6. Normalize to 0-1 range
   */
  static async generate(url: string, bars?: number): Promise<number[]>

  /**
   * Generate waveform from an existing AudioBuffer.
   */
  static fromBuffer(buffer: AudioBuffer, bars?: number): number[]
}
```

### 4.3 MediaSessionManager

```ts
// lib/audio/MediaSessionManager.ts

class MediaSessionManager {
  /**
   * Update MediaSession metadata for the current track.
   *
   * @param track - Current track data
   */
  static updateMetadata(track: Track): void

  /**
   * Set MediaSession playback state.
   *
   * @param state - 'playing' | 'paused' | 'none'
   */
  static setPlaybackState(state: MediaSessionPlaybackState): void

  /**
   * Register action handlers for OS media controls.
   *
   * @param handlers - Map of action to handler function
   */
  static setActionHandlers(handlers: {
    play: () => void
    pause: () => void
    previoustrack: () => void
    nexttrack: () => void
    seekto?: (details: { seekTime: number }) => void
  }): void

  /**
   * Update position state for seek bar in OS controls.
   */
  static updatePositionState(state: {
    duration: number
    playbackRate: number
    position: number
  }): void
}
```

---

## 5. REST API Endpoints

### 5.1 GET /api/tracks

**Description:** List all tracks, optionally filtered.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `genre` | string | - | Filter by genre |
| `search` | string | - | Search by title or artist name |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sort` | string | 'title' | Sort field: 'title', 'artist', 'duration', 'year' |
| `order` | string | 'asc' | Sort order: 'asc' or 'desc' |

**Response:**
```ts
interface TracksResponse {
  tracks: Track[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}
```

**Example:**
```
GET /api/tracks?genre=electronic&page=1&limit=10

{
  "tracks": [
    {
      "id": "track-001",
      "title": "Midnight Pulse",
      "artist": { "id": "artist-001", "name": "NeonWave" },
      "album": { "id": "album-001", "name": "Digital Dreams", "coverArt": "/images/covers/digital-dreams.jpg", "year": 2024 },
      "duration": 234,
      "src": "/audio/midnight-pulse.mp3",
      "coverArt": "/images/covers/digital-dreams-300.jpg",
      "coverArtLarge": "/images/covers/digital-dreams-600.jpg",
      "genre": "electronic",
      "bpm": 128,
      "year": 2024
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "hasNextPage": true
}
```

### 5.2 GET /api/tracks/:id

**Description:** Get a single track by ID.

**Response:** `Track`

**Errors:**
- `404` — Track not found

### 5.3 GET /api/waveform/:id

**Description:** Get pre-computed waveform data for a track.

**Response:**
```ts
interface WaveformResponse {
  trackId: string
  data: number[]        // 200 normalized amplitude values (0.0 - 1.0)
  sampleRate: number    // Original sample rate
  duration: number      // Track duration in seconds
}
```

### 5.4 GET /api/playlists

**Description:** List all playlists.

**Response:**
```ts
interface PlaylistsResponse {
  playlists: PlaylistSummary[]
}
```

### 5.5 GET /api/playlists/:id

**Description:** Get a playlist with all its tracks.

**Response:** `Playlist` (includes full `Track[]`)

**Errors:**
- `404` — Playlist not found

---

## 6. React Query Configuration

### 6.1 Query Key Factory

```ts
// lib/api/queryKeys.ts

export const trackKeys = {
  all:       ['tracks'] as const,
  lists:     () => [...trackKeys.all, 'list'] as const,
  list:      (filters: Record<string, string>) => [...trackKeys.lists(), filters] as const,
  details:   () => [...trackKeys.all, 'detail'] as const,
  detail:    (id: string) => [...trackKeys.details(), id] as const,
  waveform:  (id: string) => [...trackKeys.detail(id), 'waveform'] as const,
}

export const playlistKeys = {
  all:       ['playlists'] as const,
  lists:     () => [...playlistKeys.all, 'list'] as const,
  details:   () => [...playlistKeys.all, 'detail'] as const,
  detail:    (id: string) => [...playlistKeys.details(), id] as const,
}
```

### 6.2 Query Hooks

```ts
// lib/api/tracks.ts

/**
 * Fetch tracks with optional filters.
 */
export function useTracks(filters?: { genre?: string; search?: string }) {
  return useQuery({
    queryKey: trackKeys.list(filters ?? {}),
    queryFn: () => fetchTracks(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

/**
 * Fetch a single track by ID.
 */
export function useTrack(id: string) {
  return useQuery({
    queryKey: trackKeys.detail(id),
    queryFn: () => fetchTrack(id),
    enabled: !!id,
  })
}

/**
 * Fetch pre-computed waveform data for a track.
 * Waveform data is immutable, so staleTime is Infinity.
 */
export function useWaveform(trackId: string) {
  return useQuery({
    queryKey: trackKeys.waveform(trackId),
    queryFn: () => fetchWaveform(trackId),
    enabled: !!trackId,
    staleTime: Infinity,
  })
}

/**
 * Fetch all playlists.
 */
export function usePlaylists() {
  return useQuery({
    queryKey: playlistKeys.lists(),
    queryFn: fetchPlaylists,
    staleTime: 60_000,
  })
}

/**
 * Fetch a single playlist with tracks.
 */
export function usePlaylist(id: string) {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: () => fetchPlaylist(id),
    enabled: !!id,
  })
}
```

---

## 7. Utility Functions

### 7.1 formatTime

```ts
// lib/utils/formatTime.ts

/**
 * Format seconds into time string.
 *
 * @param seconds - Time in seconds
 * @returns Formatted string: "M:SS" for < 1 hour, "H:MM:SS" for >= 1 hour
 *
 * @example
 * formatTime(0)     // "0:00"
 * formatTime(65)    // "1:05"
 * formatTime(3661)  // "1:01:01"
 * formatTime(NaN)   // "0:00"
 */
export function formatTime(seconds: number): string
```

### 7.2 shuffleArray

```ts
// lib/utils/shuffleArray.ts

/**
 * Fisher-Yates shuffle algorithm.
 * Returns a new shuffled array (does not mutate original).
 *
 * @param array - Input array
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[]
```

### 7.3 cn (Class Name Merger)

```ts
// lib/utils/cn.ts

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS class names with conflict resolution.
 *
 * @param inputs - Class values (strings, arrays, objects)
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4')        // "py-1 px-4" (px-4 wins)
 * cn('bg-red-500', isActive && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

### 7.4 debounce

```ts
// lib/utils/debounce.ts

/**
 * Debounce a function call.
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function with .cancel() method
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void }
```

---

## 8. Sample Data Schema

### 8.1 tracks.json

```ts
// data/tracks.json - Array of 10-15 sample tracks

[
  {
    "id": "track-001",
    "title": "Midnight Pulse",
    "artist": { "id": "artist-001", "name": "NeonWave" },
    "album": {
      "id": "album-001",
      "name": "Digital Dreams",
      "coverArt": "/images/covers/digital-dreams.jpg",
      "year": 2024
    },
    "duration": 234,
    "src": "https://cdn.example.com/audio/midnight-pulse.mp3",
    "coverArt": "/images/covers/digital-dreams-300.jpg",
    "coverArtLarge": "/images/covers/digital-dreams-600.jpg",
    "genre": "electronic",
    "bpm": 128,
    "year": 2024
  }
  // ... more tracks
]
```

### 8.2 playlists.json

```ts
// data/playlists.json

[
  {
    "id": "playlist-001",
    "name": "Late Night Coding",
    "description": "Focus-inducing electronic beats for deep work sessions",
    "coverArt": "/images/playlists/late-night-coding.jpg",
    "trackIds": ["track-001", "track-003", "track-007", "track-002", "track-009"],
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-03-01T00:00:00Z"
  }
  // ... more playlists
]
```
