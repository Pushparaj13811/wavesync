# WaveSync - Technical Architecture

> Detailed technical architecture covering folder structure, audio engine, state management, data flow, and performance strategies.

---

## 1. Project Structure

```
wavesync/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (font loading, providers, persistent player)
│   ├── page.tsx                      # Home page (featured tracks, recently played)
│   ├── loading.tsx                   # Root loading skeleton
│   ├── error.tsx                     # Root error boundary
│   ├── globals.css                   # Tailwind directives + CSS custom properties
│   │
│   ├── (main)/                       # Route group for main content (with sidebar)
│   │   ├── layout.tsx                # Layout with sidebar navigation
│   │   ├── page.tsx                  # Home / Discover
│   │   ├── playlist/
│   │   │   ├── page.tsx              # All playlists
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Single playlist view
│   │   │       └── loading.tsx       # Playlist loading skeleton
│   │   ├── queue/
│   │   │   └── page.tsx              # Queue management view
│   │   └── search/
│   │       └── page.tsx              # Search results
│   │
│   ├── api/                          # API routes (mock data endpoints)
│   │   ├── tracks/
│   │   │   ├── route.ts              # GET /api/tracks — list tracks
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET /api/tracks/:id — single track
│   │   ├── playlists/
│   │   │   ├── route.ts              # GET /api/playlists
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET /api/playlists/:id
│   │   └── waveform/
│   │       └── [id]/
│   │           └── route.ts          # GET /api/waveform/:id — waveform data
│   │
│   └── providers.tsx                 # Client-side providers (QueryClient, ThemeProvider)
│
├── components/                       # Shared UI components
│   ├── player/                       # Player components
│   │   ├── PlayerBar.tsx             # Bottom player bar (persistent)
│   │   ├── PlayerControls.tsx        # Play/pause/prev/next buttons
│   │   ├── ProgressBar.tsx           # Seekable progress bar
│   │   ├── VolumeControl.tsx         # Volume slider + mute
│   │   ├── TrackInfo.tsx             # Current track display (art + text)
│   │   ├── MiniPlayer.tsx            # Mobile mini player
│   │   ├── FullPlayer.tsx            # Mobile full-screen player
│   │   └── WaveformScrubber.tsx      # SoundCloud-style waveform bar
│   │
│   ├── visualizer/                   # Visualization components
│   │   ├── Visualizer.tsx            # Main visualizer container
│   │   ├── FrequencyBars.tsx         # Bar visualization (canvas)
│   │   ├── Waveform.tsx              # Waveform/oscilloscope (canvas)
│   │   ├── CircularSpectrum.tsx      # Circular bar visualization
│   │   ├── FrequencyAnalyzer.tsx     # 6-band frequency meter
│   │   └── VisualizerSelector.tsx    # Mode selector UI
│   │
│   ├── playlist/                     # Playlist components
│   │   ├── TrackList.tsx             # Scrollable track list
│   │   ├── TrackItem.tsx             # Single track row
│   │   ├── PlaylistHeader.tsx        # Playlist cover + metadata
│   │   ├── QueueList.tsx             # Draggable queue list
│   │   └── QueueItem.tsx             # Single queue item (swipeable)
│   │
│   ├── layout/                       # Layout components
│   │   ├── Sidebar.tsx               # Desktop sidebar navigation
│   │   ├── BottomNav.tsx             # Mobile bottom navigation
│   │   ├── Header.tsx                # Page header with search
│   │   └── PageTransition.tsx        # Framer Motion page wrapper
│   │
│   └── ui/                           # Base UI primitives
│       ├── Button.tsx                # Button variants
│       ├── Slider.tsx                # Range slider (volume, progress)
│       ├── Skeleton.tsx              # Loading skeleton
│       ├── Toast.tsx                 # Toast notification
│       ├── Tooltip.tsx               # Hover tooltip
│       ├── Modal.tsx                 # Modal dialog
│       └── IconButton.tsx            # Icon-only button
│
├── lib/                              # Core business logic
│   ├── audio/
│   │   ├── AudioEngine.ts            # Core audio engine (Web Audio API)
│   │   ├── AudioAnalyzer.ts          # Frequency analysis utilities
│   │   ├── WaveformGenerator.ts      # Waveform data extraction
│   │   └── MediaSessionManager.ts    # MediaSession API integration
│   │
│   ├── utils/
│   │   ├── formatTime.ts             # Time formatting (0:00 / 0:00)
│   │   ├── shuffleArray.ts           # Fisher-Yates shuffle
│   │   ├── cn.ts                     # Tailwind class merger (clsx + twMerge)
│   │   ├── colors.ts                 # Dominant color extraction from art
│   │   └── debounce.ts              # Debounce utility
│   │
│   └── api/
│       ├── tracks.ts                 # Track fetching functions
│       ├── playlists.ts              # Playlist fetching functions
│       └── queryKeys.ts              # React Query key factories
│
├── stores/                           # Zustand stores
│   ├── usePlayerStore.ts             # Main player state store
│   ├── useQueueStore.ts              # Queue management store
│   ├── useSettingsStore.ts           # Persisted settings store
│   └── useUIStore.ts                 # UI state (sidebar, modals, etc.)
│
├── hooks/                            # Custom React hooks
│   ├── useAudioEngine.ts             # Audio engine lifecycle management
│   ├── useAudioVisualizer.ts         # Canvas visualization loop
│   ├── useKeyboardShortcuts.ts       # Global keyboard event handling
│   ├── useMediaSession.ts            # MediaSession API hook
│   ├── useProgressAnimation.ts       # 60fps progress bar update
│   └── useResponsive.ts              # Responsive breakpoint detection
│
├── data/                             # Static/mock data
│   ├── tracks.json                   # Sample track metadata
│   ├── playlists.json                # Sample playlists
│   └── genres.json                   # Genre categories
│
├── types/                            # TypeScript type definitions
│   ├── track.ts                      # Track, Album, Artist types
│   ├── playlist.ts                   # Playlist types
│   ├── player.ts                     # Player state types
│   ├── visualizer.ts                 # Visualizer config types
│   └── audio.ts                      # Audio engine types
│
├── public/                           # Static assets
│   ├── audio/                        # Sample audio files (for demo)
│   ├── images/
│   │   ├── covers/                   # Album cover art
│   │   └── placeholders/             # Placeholder images
│   └── fonts/                        # Self-hosted fonts
│
├── tailwind.config.ts                # Tailwind configuration
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
└── DESIGN.md                         # Main design document
```

---

## 2. Audio Engine Architecture

### 2.1 Audio Pipeline

```
                    ┌──────────────────────────────────────────┐
                    │           AudioEngine (Singleton)          │
                    │                                            │
   <audio> ───────► │  MediaElementSource                        │
   element          │       │                                    │
                    │       ▼                                    │
                    │  AnalyserNode ────► getByteFrequencyData() │ ──► Canvas
                    │       │            getByteTimeDomainData() │     Renderer
                    │       │                                    │
                    │       ▼                                    │
                    │  GainNode ──────── gain.value (0.0 - 1.0)  │
                    │       │                                    │
                    │       ▼                                    │
                    │  AudioContext.destination ──────► Speakers  │
                    │                                            │
                    └──────────────────────────────────────────┘
                               │
                               │ Emits state changes via callbacks
                               ▼
                    ┌──────────────────────┐
                    │  Zustand Store        │
                    │  (usePlayerStore)     │
                    │                       │
                    │  isPlaying            │
                    │  currentTime          │
                    │  duration             │
                    │  volume               │
                    │  isBuffering          │
                    └──────────────────────┘
                               │
                               │ Selector-based subscriptions
                               ▼
                    ┌──────────────────────┐
                    │  React Components    │
                    │                       │
                    │  PlayerControls      │
                    │  ProgressBar         │
                    │  VolumeControl       │
                    │  Visualizer          │
                    └──────────────────────┘
```

### 2.2 AudioEngine Class Design

```ts
// lib/audio/AudioEngine.ts

class AudioEngine {
  // Singleton instance
  private static instance: AudioEngine | null = null

  // Web Audio API nodes
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private gainNode: GainNode | null = null
  private source: MediaElementAudioSourceNode | null = null

  // Audio element
  private audio: HTMLAudioElement
  private nextAudio: HTMLAudioElement | null = null  // Preloaded next track

  // Analysis data (reusable buffers)
  private frequencyData: Uint8Array
  private timeDomainData: Uint8Array

  // State
  private isInitialized: boolean = false

  // Public API
  static getInstance(): AudioEngine
  init(): void                          // Create AudioContext (call on user gesture)
  load(src: string): Promise<void>      // Load track
  play(): Promise<void>                 // Start/resume playback
  pause(): void                         // Pause playback
  seek(time: number): void              // Seek to position in seconds
  setVolume(value: number): void        // Set volume (0.0 - 1.0)
  getFrequencyData(): Uint8Array        // Get current frequency data
  getTimeDomainData(): Uint8Array       // Get current waveform data
  preloadNext(src: string): void        // Preload next track
  advanceToPreloaded(): void            // Switch to preloaded track
  destroy(): void                       // Cleanup all resources

  // Event callbacks (set by hook/store)
  onTimeUpdate: ((time: number) => void) | null
  onDurationChange: ((duration: number) => void) | null
  onEnded: (() => void) | null
  onPlay: (() => void) | null
  onPause: (() => void) | null
  onError: ((error: Error) => void) | null
  onBuffering: ((isBuffering: boolean) => void) | null
}
```

### 2.3 Audio Engine Lifecycle

```
1. App Mounts
   └── AudioEngine created (but AudioContext NOT created yet)
       └── <audio> element created programmatically

2. User Clicks Play (first interaction)
   └── AudioEngine.init() called
       ├── new AudioContext() created
       ├── AnalyserNode created and configured
       ├── GainNode created
       ├── MediaElementSource created from <audio>
       ├── Nodes connected: source → analyser → gain → destination
       └── isInitialized = true

3. Track Loaded
   └── AudioEngine.load(src)
       ├── audio.src = src
       ├── audio.crossOrigin = 'anonymous'
       └── Wait for 'canplay' event

4. Playing
   └── AudioEngine.play()
       ├── AudioContext.resume() if suspended
       ├── audio.play()
       ├── requestAnimationFrame loop starts (progress updates)
       └── Visualization reads frequency/waveform data per frame

5. Track Approaching End (75%)
   └── AudioEngine.preloadNext(nextSrc)
       └── Creates hidden <audio> element with preload="auto"

6. Track Ends
   └── onEnded callback fires
       ├── Store.nextTrack() called
       └── AudioEngine.advanceToPreloaded() swaps audio elements

7. Cleanup
   └── AudioEngine.destroy()
       ├── Disconnects all nodes
       ├── Closes AudioContext
       └── Removes audio elements
```

---

## 3. State Management Architecture

### 3.1 Store Topology

```
┌─────────────────────────────────────────────────────┐
│                    Zustand Stores                     │
│                                                       │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  usePlayerStore   │  │  useQueueStore            │  │
│  │                   │  │                            │  │
│  │  currentTrack     │◄─┤  tracks[]                  │  │
│  │  isPlaying        │  │  currentIndex              │  │
│  │  volume           │  │  originalOrder[]           │  │
│  │  isMuted          │  │  shuffledOrder[]           │  │
│  │  progress         │  │  isShuffled                │  │
│  │  duration         │  │  repeatMode                │  │
│  │  isBuffering      │  │                            │  │
│  │                   │  │  addToQueue()              │  │
│  │  play()           │  │  removeFromQueue()         │  │
│  │  pause()          │  │  nextTrack()               │  │
│  │  seek()           │  │  prevTrack()               │  │
│  │  setVolume()      │  │  shuffle()                 │  │
│  └──────────────────┘  └──────────────────────────┘  │
│                                                       │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ useSettingsStore  │  │  useUIStore               │  │
│  │  [persist]        │  │                            │  │
│  │                   │  │  isSidebarOpen             │  │
│  │  theme            │  │  isQueueOpen               │  │
│  │  visualizerMode   │  │  isFullPlayerOpen          │  │
│  │  fftSize          │  │  activeModal               │  │
│  │  showFreqAnalyzer │  │  toasts[]                  │  │
│  │                   │  │                            │  │
│  │  setTheme()       │  │  toggleSidebar()           │  │
│  │  setVizMode()     │  │  toggleQueue()             │  │
│  └──────────────────┘  │  addToast()                │  │
│                         └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 3.2 Data Flow for Play Action

```
User clicks Play on Track
       │
       ▼
TrackItem.onClick()
       │
       ├── useQueueStore.setQueue(playlist, trackIndex)
       │   └── Updates tracks[], currentIndex
       │
       ├── usePlayerStore.play(track)
       │   └── Sets currentTrack, isPlaying = true
       │
       └── AudioEngine.load(track.src) → AudioEngine.play()
           │
           ├── onTimeUpdate → usePlayerStore.setProgress()
           │                  └── ProgressBar re-renders (selector)
           │
           ├── onDurationChange → usePlayerStore.setDuration()
           │
           └── Audio plays through speakers
               │
               └── Visualizer reads frequency data each frame
                   └── Canvas renders bars/waveform
```

### 3.3 Store → AudioEngine Synchronization

The AudioEngine runs outside React. Zustand's `subscribe` connects them:

```ts
// In useAudioEngine hook (runs once on mount)

// Volume sync: store → engine
usePlayerStore.subscribe(
  (state) => state.volume,
  (volume) => audioEngine.setVolume(volume)
)

// Mute sync: store → engine
usePlayerStore.subscribe(
  (state) => state.isMuted,
  (isMuted) => audioEngine.setVolume(isMuted ? 0 : usePlayerStore.getState().volume)
)

// Play/pause sync: store → engine
usePlayerStore.subscribe(
  (state) => state.isPlaying,
  (isPlaying) => isPlaying ? audioEngine.play() : audioEngine.pause()
)

// Engine → store: event callbacks
audioEngine.onTimeUpdate = (time) => usePlayerStore.getState().setProgress(time)
audioEngine.onEnded = () => useQueueStore.getState().nextTrack()
audioEngine.onBuffering = (b) => usePlayerStore.getState().setBuffering(b)
```

---

## 4. Component Architecture

### 4.1 Component Tree

```
RootLayout
├── Providers (QueryClient, ThemeProvider)
│   ├── MainLayout
│   │   ├── Sidebar (desktop only)
│   │   │   ├── Logo
│   │   │   ├── NavItem (Home)
│   │   │   ├── NavItem (Search)
│   │   │   ├── NavItem (Library)
│   │   │   └── PlaylistLinks
│   │   │
│   │   ├── MainContent (route-dependent)
│   │   │   ├── PageTransition (Framer Motion)
│   │   │   │   └── [Page Component]
│   │   │   │       ├── PageHeader
│   │   │   │       ├── Visualizer
│   │   │   │       └── TrackList
│   │   │   │           └── TrackItem (x N)
│   │   │   │
│   │   │   └── QueuePanel (slide-in, conditional)
│   │   │       ├── QueueHeader
│   │   │       └── QueueList
│   │   │           └── QueueItem (x N)
│   │   │
│   │   └── BottomNav (mobile only)
│   │
│   ├── PlayerBar (fixed bottom, always visible)
│   │   ├── TrackInfo (album art + title + artist)
│   │   ├── PlayerControls
│   │   │   ├── ShuffleButton
│   │   │   ├── PrevButton
│   │   │   ├── PlayPauseButton
│   │   │   ├── NextButton
│   │   │   └── RepeatButton
│   │   ├── ProgressBar
│   │   │   ├── TimeDisplay (current)
│   │   │   ├── Slider (seekable bar)
│   │   │   └── TimeDisplay (duration)
│   │   └── VolumeControl
│   │       ├── VolumeIcon
│   │       └── VolumeSlider
│   │
│   ├── MiniPlayer (mobile, overlays bottom nav)
│   │   ├── TrackInfo (compact)
│   │   ├── PlayPauseButton
│   │   └── ProgressBar (thin, no labels)
│   │
│   ├── FullPlayer (mobile, full screen overlay)
│   │   ├── CollapseButton
│   │   ├── AlbumArt (large)
│   │   ├── Visualizer (compact)
│   │   ├── TrackInfo
│   │   ├── ProgressBar (with waveform)
│   │   ├── PlayerControls (large)
│   │   └── SecondaryControls (volume, queue)
│   │
│   ├── Toast container (fixed top-right)
│   │   └── Toast (x N, stacked)
│   │
│   └── KeyboardShortcutModal (conditional)
│
└── <audio> element (hidden, managed by AudioEngine)
```

### 4.2 Server vs Client Component Split

```
SERVER COMPONENTS (default — no "use client"):
├── app/layout.tsx           — Static shell, font loading
├── app/(main)/layout.tsx    — Sidebar + content layout structure
├── app/(main)/page.tsx      — Home page data fetching
├── app/(main)/playlist/[id]/page.tsx — Playlist data fetching
├── app/api/**               — All API routes

CLIENT COMPONENTS ("use client"):
├── app/providers.tsx        — QueryClientProvider, context providers
├── components/player/*      — ALL player components (audio interaction)
├── components/visualizer/*  — ALL visualizer components (canvas, animation)
├── components/playlist/TrackItem.tsx — Click handlers, drag
├── components/layout/Sidebar.tsx   — Toggle state
├── components/layout/BottomNav.tsx  — Active route state
├── components/ui/*          — Interactive primitives
├── hooks/*                  — ALL custom hooks
├── stores/*                 — ALL Zustand stores
```

---

## 5. Data Fetching Strategy

### 5.1 React Query Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Query                      │
│                                                   │
│  Query Key Hierarchy:                             │
│                                                   │
│  ['tracks']                                       │
│  ['tracks', 'list']                              │
│  ['tracks', 'list', { genre: 'electronic' }]    │
│  ['tracks', 'detail']                            │
│  ['tracks', 'detail', 'track-123']              │
│  ['tracks', 'detail', 'track-123', 'waveform']  │
│                                                   │
│  ['playlists']                                    │
│  ['playlists', 'list']                           │
│  ['playlists', 'detail', 'playlist-1']           │
│                                                   │
│  Default Config:                                  │
│  staleTime: 60_000 (1 min)                       │
│  gcTime: 300_000 (5 min)                         │
│  retry: 2                                         │
│  refetchOnWindowFocus: false                      │
│                                                   │
│  Specialized:                                     │
│  waveform: staleTime = Infinity (immutable)      │
│  search: staleTime = 30_000 (30s)                │
└─────────────────────────────────────────────────┘
```

### 5.2 Data Flow: Server → Client

```
Server Component (page.tsx)
       │
       ├── prefetchQuery() on server
       │   └── Data fetched and serialized
       │
       ├── dehydrate(queryClient)
       │   └── Serialized state passed to HydrationBoundary
       │
       └── HydrationBoundary
           └── Client Component
               └── useQuery() — data instantly available
                   └── No loading state on first render!
```

### 5.3 API Routes (Mock Backend)

```
GET  /api/tracks              → Track[]         (list all tracks)
GET  /api/tracks?genre=x      → Track[]         (filtered by genre)
GET  /api/tracks?search=x     → Track[]         (search by name/artist)
GET  /api/tracks/:id          → Track            (single track details)
GET  /api/waveform/:id        → number[]         (pre-computed waveform)
GET  /api/playlists           → Playlist[]       (list all playlists)
GET  /api/playlists/:id       → Playlist         (playlist with tracks)
```

---

## 6. Performance Architecture

### 6.1 Rendering Performance

```
Problem: Progress bar updates 60 times per second
         Naive approach: setState() → entire component tree re-renders

Solution: Isolated re-renders via Zustand selectors

┌─────────────────────────────────────────────┐
│                PlayerBar                      │
│                                               │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │ TrackInfo  │  │ Controls  │  │ Volume   │ │
│  │            │  │           │  │          │ │
│  │ Re-renders │  │ Re-renders│  │Re-renders│ │
│  │ only when  │  │ only when │  │only when │ │
│  │ track      │  │ isPlaying │  │volume    │ │
│  │ changes    │  │ changes   │  │changes   │ │
│  └───────────┘  └───────────┘  └──────────┘ │
│                                               │
│  ┌──────────────────────────────────────────┐ │
│  │            ProgressBar                     │ │
│  │                                            │ │
│  │  Uses requestAnimationFrame directly       │ │
│  │  Updates DOM via ref (NO state updates)    │ │
│  │  Only re-renders on track change           │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 6.2 Progress Bar: RAF-based Updates

```ts
// hooks/useProgressAnimation.ts

// Instead of:  setState(currentTime) at 60fps → React re-render
// We do:       Update DOM directly via ref at 60fps → Zero React overhead

function useProgressAnimation(audioEngine: AudioEngine) {
  const fillRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const audio = audioEngine.getAudioElement()
    if (!audio || audio.paused) return

    const progress = audio.currentTime / audio.duration
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${progress})`
    }
    if (timeRef.current) {
      timeRef.current.textContent = formatTime(audio.currentTime)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [audioEngine])

  // Start/stop loop based on play state
  useEffect(() => {
    if (isPlaying) rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, animate])

  return { fillRef, timeRef }
}
```

### 6.3 Visualization Performance

```
Frame Budget: 16.67ms (60fps)

Per Frame:
├── getByteFrequencyData()     ~0.1ms (Web Audio API, pre-allocated buffer)
├── clearRect()                ~0.1ms
├── Draw bars (128 bars)       ~0.5ms
├── Reflection (optional)      ~0.3ms
└── Total                      ~1.0ms ✅ Well within budget

Optimizations:
├── Pre-allocate Uint8Array (never create new arrays per frame)
├── Use Canvas2D (not DOM) for rendering
├── Reduce fftSize on mobile (2048 → 512)
├── Skip rendering when tab is hidden (document.hidden)
├── Use OffscreenCanvas in Web Worker (future optimization)
├── Set canvas size once, not per frame
└── Use devicePixelRatio for sharp rendering without overdraw
```

### 6.4 Bundle Optimization

```
Code Splitting Strategy:
├── Route-based splitting (automatic with Next.js App Router)
├── Lazy load: Visualizer component (dynamic import)
├── Lazy load: Framer Motion (tree-shake unused features)
├── Lazy load: WaveformGenerator (only when waveform scrub is used)
└── Preload: Player components (always needed)

Expected Bundle Sizes:
├── Framework (Next.js + React)    ~85KB gzipped
├── Zustand                        ~2KB gzipped
├── React Query                    ~12KB gzipped
├── Framer Motion                  ~30KB gzipped (tree-shaken)
├── Lucide Icons (used only)       ~5KB gzipped
├── App Code                       ~20KB gzipped
└── Total JS                       ~155KB gzipped
```

---

## 7. Audio Preloading Strategy

```
Timeline of a track playing:
├── 0% ──────── Track starts playing
│
├── 50% ─────── Monitor next track in queue
│
├── 75% ─────── Preload next track
│                └── Create hidden <audio> element
│                    ├── Set src to next track URL
│                    ├── Set preload="auto"
│                    └── Browser starts downloading
│
├── 95% ─────── Next track likely buffered enough
│
├── 100% ────── Current track ends
│                └── Advance to preloaded track
│                    ├── Swap audio elements
│                    ├── Connect new source to AudioContext
│                    ├── Start playback immediately
│                    └── Gap: < 50ms (near-gapless)
│
└── Next track plays
    └── Start preloading the track after next
```

---

## 8. Error Handling Strategy

### 8.1 Error Boundaries

```
RootLayout
├── Global Error Boundary (app/error.tsx)
│   └── Catches: route-level rendering errors
│       └── Shows: full-page error UI with retry
│
├── Route Error Boundaries (e.g., playlist/[id]/error.tsx)
│   └── Catches: data fetching errors for that route
│       └── Shows: inline error with retry, player still works
│
├── Component Error Boundaries (per-feature)
│   ├── Visualizer Error Boundary
│   │   └── Catches: Canvas/WebGL errors
│   │       └── Falls back: shows static album art, player works
│   │
│   └── Player Error Boundary
│       └── Catches: critical player errors
│           └── Shows: error toast, can retry
│
└── Audio Engine Errors (non-React)
    ├── Network error → retry with exponential backoff (3 attempts)
    ├── Decode error → skip track, show toast
    ├── AudioContext error → show "enable audio" prompt
    └── CORS error → show "track unavailable" message
```

### 8.2 React Query Error Handling

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.status === 404) return false  // Don't retry 404s
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
                    /\
                   /  \
                  / E2E \          5 tests
                 / (Playwright) \
                /________________\
               /                  \
              /   Integration      \    15 tests
             /   (Testing Library)  \
            /________________________\
           /                          \
          /      Unit Tests            \   40+ tests
         /    (Vitest + Testing Lib)    \
        /________________________________\
```

### 9.2 What to Test

```
Unit Tests:
├── AudioEngine methods (play, pause, seek, volume)
├── Zustand store actions and selectors
├── Utility functions (formatTime, shuffle, cn)
├── Waveform data processing
├── Query key factories
└── Time formatting edge cases

Integration Tests:
├── PlayerControls + store integration
├── ProgressBar + audio sync
├── Queue operations (add, remove, reorder)
├── Shuffle + repeat mode cycling
├── Keyboard shortcuts fire correct actions
└── Track auto-advance on end

E2E Tests (Playwright):
├── Play a track end-to-end
├── Navigate between playlists
├── Mobile responsive layout
├── Keyboard shortcut flow
└── Volume and seek interaction
```

---

## 10. Deployment Architecture

```
┌──────────────────────────────────────────┐
│              Vercel Edge Network          │
│                                           │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │ Static Edge  │  │ Serverless Funcs │  │
│  │              │  │                  │  │
│  │ HTML, CSS,   │  │ API Routes       │  │
│  │ JS bundles,  │  │ /api/tracks      │  │
│  │ Images,      │  │ /api/playlists   │  │
│  │ Audio files  │  │ /api/waveform    │  │
│  │              │  │                  │  │
│  │ CDN cached   │  │ Cold start <50ms │  │
│  └─────────────┘  └──────────────────┘  │
│                                           │
│  Audio files: Vercel Blob / static /public│
│  Images: Next.js Image Optimization       │
│  Fonts: Self-hosted, preloaded            │
└──────────────────────────────────────────┘
```

---

## 11. Security Considerations

```
├── CORS: audio.crossOrigin = 'anonymous' (required for Web Audio API)
├── CSP: allow audio/media from known domains
├── No user auth → no session management needed
├── No file uploads → no upload validation needed
├── API routes: rate limiting via Vercel (built-in)
├── Audio sources: validate URL format before loading
├── XSS: React's built-in escaping + no dangerouslySetInnerHTML
└── Dependencies: minimal, well-maintained packages only
```
