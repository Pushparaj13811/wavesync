# WaveSync - Feature Specification

> Detailed breakdown of every feature with priority, acceptance criteria, and implementation notes.

---

## Feature Priority Legend

| Priority | Label | Meaning |
|----------|-------|---------|
| P0 | Must Have | Non-negotiable baseline. Ship-blocking. |
| P1 | Strong Differentiator | These win the job. Do them well. |
| P2 | High Impact | Do 1-2 of these to stand out hard. |
| P3 | Polish | Nice-to-have refinements. |

---

## P0 - Must Have Features

### F-001: Play / Pause / Stop

**Description:** Core playback controls for audio tracks.

**Acceptance Criteria:**
- [ ] Single click toggles between play and pause
- [ ] Play button shows pause icon when playing, play icon when paused
- [ ] Audio starts from the beginning when a new track is selected
- [ ] Audio resumes from current position when unpausing
- [ ] AudioContext is created/resumed on first user interaction (browser autoplay policy)
- [ ] Playback state is reflected in Zustand store immediately (< 16ms)
- [ ] Button has visible focus ring for keyboard navigation
- [ ] Button announces state change to screen readers

**Implementation Notes:**
- Use `HTMLAudioElement` for actual playback, `Web Audio API` for visualization pipeline
- Connect audio element to `AudioContext` via `createMediaElementSource()`
- Handle `AudioContext.state === 'suspended'` on first interaction
- Sync `audio.paused` with Zustand `isPlaying` state

---

### F-002: Seek / Scrub

**Description:** User can click or drag on the progress bar to jump to any position in the track.

**Acceptance Criteria:**
- [ ] Clicking anywhere on the progress bar seeks to that position
- [ ] Dragging the scrubber thumb provides real-time seek preview
- [ ] During drag, audio position updates only on release (debounced seek)
- [ ] Time tooltip shows on hover (e.g., "2:34")
- [ ] Progress bar updates smoothly at 60fps via `requestAnimationFrame`
- [ ] Seek works on touch devices (touch drag)
- [ ] No audio stutter during seek operations

**Implementation Notes:**
- Use `requestAnimationFrame` loop to update progress, NOT `setInterval`
- Calculate seek position: `(clickX / barWidth) * audio.duration`
- Set `audio.currentTime` on mouse/touch up
- During drag, show visual position but don't update `audio.currentTime` until release
- Use `audio.seeking` and `audio.seeked` events for loading states

---

### F-003: Volume Control

**Description:** Adjustable volume with mute toggle.

**Acceptance Criteria:**
- [ ] Vertical or horizontal slider controls volume from 0% to 100%
- [ ] Mute button toggles between muted and previous volume level
- [ ] Volume icon changes based on level (muted, low, medium, high)
- [ ] Volume state persists across tracks (stored in Zustand with persist)
- [ ] Volume changes are smooth (no pops or clicks)
- [ ] Mouse wheel adjusts volume when hovering over volume area
- [ ] Mobile: volume slider appears on tap of volume icon

**Implementation Notes:**
- Use `GainNode` for volume control (smoother than `audio.volume`)
- `gainNode.gain.setValueAtTime(value, context.currentTime)` for click-free changes
- Mute: set gain to 0, store previous value for unmute
- Persist volume in Zustand `persist` middleware (localStorage)

---

### F-004: Progress Bar

**Description:** Visual indicator of playback progress with smooth real-time updates.

**Acceptance Criteria:**
- [ ] Shows current position and total duration
- [ ] Progress fills smoothly from left to right at 60fps
- [ ] Buffered/loaded portion shown in lighter shade
- [ ] Time display format: `M:SS` for tracks < 1 hour, `H:MM:SS` for longer
- [ ] Progress bar is clickable for seeking (integrated with F-002)
- [ ] No jank or stuttering during normal playback
- [ ] Works correctly when window is resized

**Implementation Notes:**
- `requestAnimationFrame` loop reads `audio.currentTime / audio.duration`
- Use CSS `transform: scaleX()` for the fill (GPU accelerated, no layout thrashing)
- Show buffered ranges via `audio.buffered` TimeRanges API
- Format time with `Math.floor(seconds / 60)` and zero-padded seconds

---

### F-005: Playlist Support

**Description:** Display and manage a list of tracks that can be played sequentially.

**Acceptance Criteria:**
- [ ] Playlist displays track name, artist, duration, and album art thumbnail
- [ ] Clicking a track in the playlist starts playback immediately
- [ ] Currently playing track is visually highlighted
- [ ] Tracks auto-advance to next when current track ends
- [ ] Playlist shows at least 20 tracks without performance issues
- [ ] Playlist is scrollable with smooth scrolling
- [ ] Empty state shown when no tracks are loaded

**Implementation Notes:**
- Store playlist as `Track[]` in Zustand
- Track interface: `{ id, title, artist, album, duration, src, coverArt }`
- On track end (`audio.onended`), advance to next track in queue
- Use `React.memo` for track items to prevent unnecessary re-renders
- Virtualize list if > 100 tracks (react-virtual)

---

### F-006: Mobile Responsive UI

**Description:** Full-featured player that works seamlessly on mobile devices.

**Acceptance Criteria:**
- [ ] Layout adapts to screens from 320px to 2560px wide
- [ ] Touch targets are at least 44x44px (Apple HIG)
- [ ] Swipe gestures: swipe up for queue, swipe left/right for prev/next track
- [ ] No horizontal scrolling on any screen size
- [ ] Album art scales appropriately
- [ ] Visualization reduces complexity on mobile for performance
- [ ] Player controls remain accessible in all orientations

**Breakpoints:**
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile S | 320px | Single column, stacked controls |
| Mobile L | 425px | Single column, slightly larger art |
| Tablet | 768px | Two column, sidebar playlist |
| Desktop | 1024px | Full layout, expanded visualization |
| Desktop L | 1440px | Max-width container, spacious |

**Implementation Notes:**
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Bottom player bar fixed on mobile (like Spotify mobile)
- Full-screen player view on mobile when expanded
- Use `matchMedia` to detect mobile for visualization quality

---

### F-007: Fast Load & Smooth Playback

**Description:** Application loads quickly and audio plays without interruption.

**Acceptance Criteria:**
- [ ] First Contentful Paint < 1.2s
- [ ] Time to Interactive < 3.0s
- [ ] Audio starts playing within 200ms of clicking play
- [ ] No visible layout shift during load (CLS < 0.1)
- [ ] Skeleton screens shown while data loads
- [ ] Audio never stutters during normal playback
- [ ] Page transitions don't interrupt playback

**Implementation Notes:**
- Use Next.js `loading.tsx` for route-level loading states
- Preload critical CSS and fonts
- Lazy load visualization canvas
- Use `audio.preload = 'auto'` for current track
- Preload next track in queue (see F-010)

---

## P1 - Strong Differentiator Features

### F-008: Web Audio API - Audio Visualization

**Description:** Real-time audio visualization using frequency analysis and canvas rendering.

**Acceptance Criteria:**
- [ ] Frequency bar visualization reacts to music in real-time
- [ ] Waveform (oscilloscope) visualization available as alternative mode
- [ ] Visualization is smooth at 60fps on desktop
- [ ] Visualization gracefully degrades on low-power devices
- [ ] User can switch between visualization modes
- [ ] Visualization responds to volume changes
- [ ] Colors are aesthetically pleasing and match the dark theme
- [ ] Visualization pauses when audio is paused (no frozen bars)

**Visualization Modes:**
1. **Frequency Bars** — Vertical bars representing frequency bands, height = amplitude
2. **Waveform** — Oscilloscope-style time-domain waveform
3. **Circular** — Bars arranged in a circle, radiating outward
4. **Particles** — Particles that react to bass frequencies (P3)

**Implementation Notes:**
- `AnalyserNode.getByteFrequencyData()` for bars (0-255 values per frequency bin)
- `AnalyserNode.getByteTimeDomainData()` for waveform
- `fftSize = 2048` (1024 frequency bins) for desktop, `512` for mobile
- `smoothingTimeConstant = 0.85` for smooth animation
- Use `<canvas>` with `2d` context for bars/waveform
- Consider WebGL for particle mode (future)
- Use `devicePixelRatio` for sharp rendering on Retina displays

---

### F-009: Frequency Analyzer Display

**Description:** Numerical/visual frequency analyzer showing bass, mid, and treble levels.

**Acceptance Criteria:**
- [ ] Shows real-time frequency breakdown: Sub-bass, Bass, Low-mid, Mid, High-mid, Treble
- [ ] Each band shows a level meter (0-100%)
- [ ] Peak indicators hold briefly before dropping
- [ ] Labels clearly identify each frequency band
- [ ] Can be toggled on/off

**Frequency Bands:**
| Band | Frequency Range | Description |
|------|----------------|-------------|
| Sub-bass | 20-60 Hz | Deep rumble |
| Bass | 60-250 Hz | Kick drums, bass guitar |
| Low-mid | 250-500 Hz | Warmth, body |
| Mid | 500-2000 Hz | Vocals, instruments |
| High-mid | 2000-4000 Hz | Presence, clarity |
| Treble | 4000-20000 Hz | Brilliance, air |

**Implementation Notes:**
- Map `frequencyBinCount` bins to 6 bands based on frequency ranges
- Each bin represents `(sampleRate / 2) / frequencyBinCount` Hz
- Average amplitudes within each band
- Peak hold: store max value, decay slowly over ~500ms

---

### F-010: Low-Latency Playback Optimization

**Description:** Optimized audio loading and buffering to prevent stutter and minimize start delay.

**Acceptance Criteria:**
- [ ] Next track in queue is preloaded while current track plays
- [ ] Preloading starts when current track reaches 75% completion
- [ ] Buffered progress is visible on the progress bar
- [ ] No gap between tracks during auto-advance (gapless playback)
- [ ] Audio starts within 200ms on fast connections
- [ ] Graceful degradation on slow connections (show loading state)
- [ ] Memory usage stays reasonable (don't preload entire playlist)

**Implementation Notes:**
- Create a hidden `<audio>` element for the next track with `preload="auto"`
- On track end, swap the preloaded audio element to active
- Monitor `audio.buffered` to show buffer progress
- Use `audio.readyState` to determine when enough data is buffered
- For gapless: start next track at `audio.currentTime = 0` with slight overlap crossfade
- Limit preload to next 1 track only to conserve bandwidth

---

### F-011: Zustand State Management

**Description:** All application state managed through well-structured Zustand stores.

**Acceptance Criteria:**
- [ ] Player state (current track, isPlaying, volume, progress) in dedicated store
- [ ] Queue state (tracks, current index, shuffle order) in dedicated slice
- [ ] Settings state (theme, visualizer mode, fftSize) persisted to localStorage
- [ ] No unnecessary re-renders (verified with React DevTools)
- [ ] Store shape is fully typed with TypeScript
- [ ] DevTools integration for debugging
- [ ] State changes are synchronous and predictable

**Store Structure:**
```
usePlayerStore
  ├── currentTrack: Track | null
  ├── isPlaying: boolean
  ├── volume: number
  ├── isMuted: boolean
  ├── progress: number
  ├── duration: number
  ├── isLoading: boolean
  ├── repeatMode: 'off' | 'all' | 'one'
  ├── isShuffled: boolean
  ├── actions
  │   ├── play(track?)
  │   ├── pause()
  │   ├── togglePlay()
  │   ├── seek(position)
  │   ├── setVolume(value)
  │   ├── toggleMute()
  │   ├── nextTrack()
  │   ├── prevTrack()
  │   ├── setRepeatMode(mode)
  │   └── toggleShuffle()
  └── queue
      ├── tracks: Track[]
      ├── originalOrder: Track[]
      ├── currentIndex: number
      ├── addToQueue(track)
      ├── removeFromQueue(index)
      ├── clearQueue()
      ├── reorderQueue(from, to)
      └── shuffleQueue()
```

**Implementation Notes:**
- Use Zustand slices pattern for separation of concerns
- Apply `persist` middleware to settings only (not playback state)
- Use `devtools` middleware in development
- Use `subscribeWithSelector` for audio engine integration
- Selectors: always access individual properties, never destructure entire store

---

### F-012: Smart Playlist Handling

**Description:** Advanced playlist features including shuffle, repeat modes, and queue management.

**Acceptance Criteria:**
- [ ] **Shuffle:** Randomizes play order without repeating until all played
  - Uses Fisher-Yates shuffle algorithm
  - Maintains shuffle order so prev/next work correctly
  - Toggling shuffle off returns to original order at current track
- [ ] **Repeat Modes:** Three modes cycle on button click
  - Off: Stop after last track
  - All: Loop entire playlist
  - One: Loop current track
- [ ] **Queue System:**
  - "Play Next" adds track after current
  - "Add to Queue" appends to end
  - Queue is visually distinct from playlist
  - Drag-to-reorder in queue
  - Remove individual tracks from queue
- [ ] Visual indicators for active repeat/shuffle state
- [ ] Previous track: if > 3 seconds in, restart current track; otherwise go to previous

**Implementation Notes:**
- Fisher-Yates shuffle: `for (i = arr.length - 1; i > 0; i--) swap(i, random(0, i))`
- Store `originalOrder` alongside `shuffledOrder` in Zustand
- Queue is a separate array that gets inserted after current track
- Repeat one: set `audio.loop = true`
- Repeat all: on last track end, go to first track

---

### F-013: Clean UI with Dark Mode

**Description:** Minimalist, Spotify-inspired dark-mode UI with smooth animations.

**Acceptance Criteria:**
- [ ] Dark mode is the default and primary theme
- [ ] All text passes WCAG 2.1 AA contrast ratios (4.5:1 for body, 3:1 for large text)
- [ ] Smooth transitions between states (hover, active, focus)
- [ ] Consistent spacing scale (4px base unit)
- [ ] Album art displayed prominently with subtle shadow/glow
- [ ] Animations are purposeful, not distracting
- [ ] `prefers-reduced-motion` respected — disable animations when set
- [ ] Loading skeletons match final layout dimensions exactly

**Implementation Notes:**
- Tailwind `dark:` prefix with `class` strategy
- CSS custom properties for theme tokens
- Framer Motion `layout` prop for smooth list reordering
- `transition-all duration-200 ease-out` as default transition
- Skeleton: use Tailwind `animate-pulse` on gray blocks
- See [UI/UX Design System](./UI_UX.md) for full color palette and tokens

---

## P2 - High Impact Features

### F-014: Advanced Audio Visualization (Canvas/WebGL)

**Description:** Visually stunning audio visualizations that go beyond basic bars.

**Acceptance Criteria:**
- [ ] Multiple visualization modes selectable by user
- [ ] Smooth transitions between visualization modes
- [ ] Responsive to actual audio frequencies (not random animation)
- [ ] Handles edge cases: silence shows minimal activity, loud shows maximum
- [ ] Performance: maintains 60fps on mid-range hardware
- [ ] Optional full-screen visualization mode

**Visualization Modes (expanded):**
1. **Classic Bars** — Symmetric bars with gradient colors and reflection
2. **Waveform** — Smooth oscilloscope with glow effect
3. **Circular Spectrum** — Bars arranged radially around album art
4. **Mountain Range** — Filled area chart style with layered frequencies
5. **Particles** (WebGL) — Particles attracted to bass, scattered by treble

**Implementation Notes:**
- Use `<canvas>` for 2D visualizations
- Consider Three.js/WebGL for particle mode only
- Render loop: `requestAnimationFrame` → get frequency data → clear canvas → draw
- Mobile: reduce `fftSize` to `512`, limit to bars/waveform modes
- Full-screen: use Fullscreen API (`element.requestFullscreen()`)

---

### F-015: Streaming Simulation

**Description:** Load and play audio from remote URLs, simulating a streaming music service.

**Acceptance Criteria:**
- [ ] Audio loads from remote HTTP/HTTPS URLs
- [ ] Loading progress indicator while buffering
- [ ] Playback begins as soon as sufficient data is buffered
- [ ] Handles network errors gracefully (retry with backoff, error message)
- [ ] Works with common formats: MP3, AAC, OGG, WAV
- [ ] CORS-compatible audio sources
- [ ] Metadata extraction from remote files (title, artist if available)

**Mock Data Sources:**
- Use free, royalty-free music APIs or static hosted files
- Suggested: host sample tracks on Vercel Blob Storage or public S3
- Provide 5-10 sample tracks of varying lengths and genres

**Implementation Notes:**
- `audio.src = remoteUrl` with `audio.crossOrigin = 'anonymous'` (required for Web Audio API)
- Monitor `audio.readyState` and `audio.networkState`
- Handle CORS: server must send `Access-Control-Allow-Origin: *`
- React Query for fetching track metadata (not audio data)
- Audio data streams natively via browser's media pipeline

---

### F-016: Background Playback

**Description:** Audio continues playing when user switches browser tabs or minimizes window.

**Acceptance Criteria:**
- [ ] Audio playback continues uninterrupted when tab loses focus
- [ ] MediaSession API integration for OS-level controls
- [ ] Lock screen / notification controls show track info and art (mobile)
- [ ] Play/pause/next/prev work from OS media controls
- [ ] Tab title shows current track name and play state icon

**Implementation Notes:**
- Background playback works by default in most browsers (no special code needed)
- MediaSession API for OS integration:
  ```ts
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: [{ src: track.coverArt, sizes: '512x512', type: 'image/png' }]
  })
  navigator.mediaSession.setActionHandler('play', () => store.play())
  navigator.mediaSession.setActionHandler('pause', () => store.pause())
  navigator.mediaSession.setActionHandler('previoustrack', () => store.prevTrack())
  navigator.mediaSession.setActionHandler('nexttrack', () => store.nextTrack())
  ```
- Update `document.title` with track info
- Visualization should pause when tab is hidden (`document.hidden`) to save CPU

---

### F-017: Keyboard Shortcuts

**Description:** Complete keyboard control for all major player actions.

**Acceptance Criteria:**
- [ ] All shortcuts work globally (not just when player is focused)
- [ ] Shortcuts don't conflict with browser defaults
- [ ] Visual shortcut hint/tooltip on hover over controls
- [ ] Keyboard shortcut help modal (press `?`)
- [ ] Shortcuts are discoverable but not intrusive

**Shortcut Map:**

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` (Right Arrow) | Seek forward 5 seconds |
| `←` (Left Arrow) | Seek backward 5 seconds |
| `Shift + →` | Seek forward 10 seconds |
| `Shift + ←` | Seek backward 10 seconds |
| `↑` (Up Arrow) | Volume up 5% |
| `↓` (Down Arrow) | Volume down 5% |
| `M` | Toggle mute |
| `N` | Next track |
| `P` | Previous track |
| `S` | Toggle shuffle |
| `R` | Cycle repeat mode |
| `F` | Toggle fullscreen visualization |
| `1-5` | Switch visualization mode |
| `?` | Show keyboard shortcut help |
| `Escape` | Close modals / exit fullscreen |

**Implementation Notes:**
- Use `useEffect` with `document.addEventListener('keydown', handler)`
- Prevent default for Space (stops page scroll)
- Check `event.target` — don't trigger shortcuts when typing in input fields
- Store shortcut map in a config object for easy modification
- Show shortcuts in a modal with `?` key

---

### F-018: Waveform Scrubbing

**Description:** SoundCloud-style pre-rendered waveform that doubles as a seek bar.

**Acceptance Criteria:**
- [ ] Full track waveform displayed as the progress bar
- [ ] Played portion has distinct color from unplayed portion
- [ ] Hovering shows time at cursor position
- [ ] Clicking/dragging on waveform seeks to that position
- [ ] Waveform is generated from actual audio data
- [ ] Waveform renders quickly (< 500ms after audio loads)
- [ ] Waveform is responsive (redraws on resize)

**Implementation Notes:**
- Decode audio to `AudioBuffer` using `AudioContext.decodeAudioData()`
- Extract amplitude data from `AudioBuffer.getChannelData(0)`
- Downsample to ~200-500 bars for display
- Render as mirrored vertical bars on `<canvas>`
- Use two colors: accent for played, dim for unplayed
- Cache waveform data per track to avoid re-computation
- Render waveform in a Web Worker to avoid blocking main thread

**Waveform Generation Algorithm:**
```
1. Fetch audio as ArrayBuffer
2. Decode to AudioBuffer
3. Get Float32Array from channel 0
4. Split into N buckets (N = desired bar count)
5. For each bucket, compute RMS amplitude
6. Normalize to 0-1 range
7. Render as bars with height = amplitude * maxHeight
```

---

## P3 - Polish Features

### F-019: Animated Track Transitions

**Description:** Smooth visual transitions when switching between tracks.

**Acceptance Criteria:**
- [ ] Album art crossfades when track changes
- [ ] Track info (title, artist) slides in from below
- [ ] Progress bar resets with animation
- [ ] No flash of empty state between tracks

### F-020: Responsive Album Art

**Description:** Album art displayed prominently with visual enhancements.

**Acceptance Criteria:**
- [ ] Album art fills available space with proper aspect ratio
- [ ] Subtle glow/shadow effect using dominant color from art
- [ ] Blurred album art as background gradient (like Spotify)
- [ ] Placeholder art for tracks without cover images
- [ ] Smooth loading with blur-up technique

### F-021: Mini Player Mode

**Description:** Collapsible player that shows minimal controls when not focused.

**Acceptance Criteria:**
- [ ] Bottom bar shows track info + play/pause + progress
- [ ] Click/tap expands to full player view
- [ ] Transition is smooth and animated
- [ ] Mini player persists across all routes

### F-022: Toast Notifications

**Description:** Non-intrusive notifications for user actions.

**Acceptance Criteria:**
- [ ] "Added to queue" confirmation
- [ ] "Shuffle on/off" notification
- [ ] "Repeat mode changed" notification
- [ ] Auto-dismiss after 3 seconds
- [ ] Stacking support for multiple notifications

---

## Feature Dependency Graph

```
F-001 (Play/Pause) ──────────┐
F-002 (Seek) ────────────────┤
F-003 (Volume) ──────────────┤
F-004 (Progress Bar) ────────┼──→ F-010 (Low-latency) ──→ F-015 (Streaming)
F-005 (Playlist) ────────────┤
F-006 (Mobile Responsive) ───┤
F-007 (Fast Load) ───────────┘
        │
        ▼
F-008 (Visualization) ──→ F-009 (Freq Analyzer) ──→ F-014 (Advanced Viz)
F-011 (Zustand) ─────────→ F-012 (Smart Playlist) ──→ F-018 (Waveform Scrub)
F-013 (Dark UI) ─────────→ F-016 (Background Play)
                          → F-017 (Keyboard Shortcuts)
                          → F-019-F-022 (Polish)
```

---

## Implementation Order (Recommended)

### Sprint 1 (Foundation)
1. F-011: Zustand store setup
2. F-001: Play / Pause
3. F-003: Volume Control
4. F-004: Progress Bar
5. F-002: Seek / Scrub

### Sprint 2 (Playlist & UI)
6. F-005: Playlist Support
7. F-013: Dark Mode UI
8. F-006: Mobile Responsive

### Sprint 3 (Audio Engine)
9. F-008: Audio Visualization
10. F-009: Frequency Analyzer
11. F-010: Low-latency Playback

### Sprint 4 (Smart Features)
12. F-012: Smart Playlist (shuffle, repeat, queue)
13. F-017: Keyboard Shortcuts
14. F-016: Background Playback

### Sprint 5 (Impact & Polish)
15. F-018: Waveform Scrubbing
16. F-015: Streaming Simulation
17. F-014: Advanced Visualization
18. F-019 to F-022: Polish features
