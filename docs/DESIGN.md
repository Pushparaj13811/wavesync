# WaveSync - Design Document

> A high-performance, visually stunning music player built with Next.js, Web Audio API, and Zustand.

---

## 1. Project Overview

**WaveSync** is a web-based music player application that combines low-latency audio playback with real-time audio visualization. It goes beyond a simple play/pause interface — it demonstrates deep understanding of browser audio capabilities, state management at scale, and polished UI/UX craft.

### 1.1 Vision

Build a music player that feels native — instant response, buttery animations, and audio visualizations that make the experience immersive. The app should feel like it belongs alongside Spotify, SoundCloud, and Apple Music in terms of UI polish, while showcasing technical depth through Web Audio API integration, streaming simulation, and waveform rendering.

### 1.2 Target Users

- Music enthusiasts who want a clean, distraction-free listening experience
- Developers evaluating the codebase for technical depth
- Recruiters/hiring managers assessing frontend engineering capability

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | Server components, file-based routing, optimized builds |
| **Language** | TypeScript | Type safety across audio engine, stores, and components |
| **State Management** | Zustand | Lightweight, no boilerplate, perfect for audio state |
| **Data Fetching** | TanStack React Query v5 | Caching, background refetch, optimistic updates for track data |
| **Audio** | Web Audio API | Low-level audio control, visualization, frequency analysis |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode, responsive design |
| **Animations** | Framer Motion | Spring-based animations, layout transitions, gesture support |
| **Canvas** | HTML5 Canvas / WebGL | Audio visualization rendering |
| **Icons** | Lucide React | Consistent, lightweight icon set |

### 2.1 Why These Choices

**Next.js App Router** — Not because we need SSR for a music player, but because:
- File-based routing for clean URL structure (`/`, `/playlist/[id]`, `/queue`)
- Layout system for persistent player bar across routes
- Image optimization for album art
- API routes for mock track endpoints

**Zustand over Redux/Context** — Audio state changes rapidly (progress bar updates 60fps). Zustand's selector-based re-renders prevent unnecessary UI updates. No provider wrapping. Middleware support for persist and devtools.

**Web Audio API over `<audio>` tag alone** — The `<audio>` element handles playback, but Web Audio API gives us:
- `AnalyserNode` for real-time frequency data (visualization)
- `GainNode` for precise volume control
- Audio graph for future effects (equalizer, crossfade)
- `AudioContext` timing for low-latency operations

**TanStack React Query** — Track metadata, playlists, and search results are server-state. React Query handles caching, deduplication, and background refetching without manual state management.

---

## 3. Design Philosophy

### 3.1 Core Principles

1. **Performance is a Feature** — 60fps animations, <100ms interaction latency, preloaded next track, zero audio stutter
2. **Dark-First Design** — Dark mode is the primary theme. Every color, shadow, and gradient is designed for dark backgrounds first
3. **Minimal but Complete** — No unnecessary UI elements, but every needed control is easily accessible
4. **Audio-First Architecture** — The audio engine is decoupled from React. It runs independently and exposes state via Zustand
5. **Progressive Enhancement** — Core playback works everywhere. Visualizations enhance when Canvas/WebGL is available

### 3.2 Design Language

- **Spotify-inspired** layout and navigation patterns
- **SoundCloud-inspired** waveform scrubbing
- **Apple Music-inspired** album art presentation and transitions
- **Original** audio visualization with reactive frequency bars

### 3.3 Quality Bar

- No layout shift on load
- No flash of unstyled content
- Smooth 60fps progress bar (requestAnimationFrame, not setInterval)
- Keyboard accessible — every action has a shortcut
- WCAG 2.1 AA compliant contrast ratios

---

## 4. Goals & Non-Goals

### 4.1 Goals

| Priority | Goal |
|----------|------|
| P0 | Flawless audio playback with play/pause/seek/volume |
| P0 | Real-time audio visualization using Web Audio API |
| P0 | Zustand-powered state management for all player state |
| P0 | Mobile-responsive, dark-mode UI |
| P1 | Smart playlist with shuffle, repeat, and queue management |
| P1 | Low-latency playback with preloading and buffer management |
| P1 | Keyboard shortcuts for all major actions |
| P2 | SoundCloud-style waveform scrubbing |
| P2 | Streaming simulation from remote URLs |
| P2 | Background playback when tab is inactive |

### 4.2 Non-Goals (v1)

- User authentication / accounts
- Server-side music storage
- Social features (sharing, comments)
- Music upload functionality
- Lyrics display
- Offline support / PWA (future consideration)
- Desktop app (Electron)

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Audio start latency | < 200ms from click |
| Progress bar frame rate | 60fps |
| Visualization frame rate | 60fps |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |

---

## 6. Milestones

### Phase 1: Foundation (Must Have)
- Project setup (Next.js, TypeScript, Tailwind, Zustand)
- Audio engine with Web Audio API integration
- Basic player UI (play/pause, seek, volume, progress bar)
- Playlist support with track list
- Mobile responsive layout
- Dark mode theme

### Phase 2: Differentiation (Strong Differentiators)
- Audio visualization (frequency bars + waveform)
- Frequency analyzer display
- Low-latency playback optimization (preloading, buffering)
- Smart playlist (shuffle, repeat modes, queue)
- Zustand store with persist middleware
- Smooth Framer Motion animations

### Phase 3: Impact (High Impact Features)
- SoundCloud-style waveform scrubbing
- Streaming simulation from remote URLs
- Background playback support
- Full keyboard shortcut system
- Canvas/WebGL visualization modes

### Phase 4: Polish
- Performance optimization pass
- Accessibility audit
- Cross-browser testing
- Animation refinement
- Documentation

---

## 7. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Web Audio API browser inconsistencies | Medium | High | Feature detection, fallback to basic `<audio>` |
| Canvas performance on mobile | Medium | Medium | Reduce visualization complexity on mobile, use `devicePixelRatio` |
| AudioContext autoplay policy | High | High | Resume context on user gesture, show "click to enable audio" |
| Large audio file loading times | Medium | Medium | Streaming, chunked loading, progress indicators |
| Zustand store growing too complex | Low | Medium | Split into slices, use selectors aggressively |

---

## 8. Related Documents

- [Feature Specification](./docs/FEATURES.md) — Detailed feature breakdown with acceptance criteria
- [UI/UX Design System](./docs/UI_UX.md) — Colors, typography, components, layouts
- [Technical Architecture](./docs/ARCHITECTURE.md) — Folder structure, data flow, audio engine design
- [API Documentation](./docs/API.md) — TypeScript interfaces, store shape, hook signatures
- [Component Specification](./docs/COMPONENTS.md) — Every component with props, states, and behavior
