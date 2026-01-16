export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;

  private audio: HTMLAudioElement;
  private nextAudio: HTMLAudioElement | null = null;
  private isSourceConnected = false;

  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private timeDomainData: Uint8Array<ArrayBuffer> = new Uint8Array(0);

  // Event callbacks
  onTimeUpdate: ((time: number) => void) | null = null;
  onDurationChange: ((duration: number) => void) | null = null;
  onEnded: (() => void) | null = null;
  onPlay: (() => void) | null = null;
  onPause: (() => void) | null = null;
  onError: ((error: Error) => void) | null = null;
  onBuffering: ((isBuffering: boolean) => void) | null = null;
  onCanPlay: (() => void) | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = "auto";
      this.setupAudioEvents();
    } else {
      this.audio = {} as HTMLAudioElement;
    }
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private setupAudioEvents() {
    this.audio.addEventListener("timeupdate", () => {
      this.onTimeUpdate?.(this.audio.currentTime);
    });

    this.audio.addEventListener("durationchange", () => {
      if (Number.isFinite(this.audio.duration)) {
        this.onDurationChange?.(this.audio.duration);
      }
    });

    this.audio.addEventListener("ended", () => {
      this.onEnded?.();
    });

    this.audio.addEventListener("play", () => {
      this.onPlay?.();
    });

    this.audio.addEventListener("pause", () => {
      this.onPause?.();
    });

    this.audio.addEventListener("waiting", () => {
      this.onBuffering?.(true);
    });

    this.audio.addEventListener("canplay", () => {
      this.onBuffering?.(false);
      this.onCanPlay?.();
    });

    this.audio.addEventListener("error", () => {
      const mediaError = this.audio.error;
      this.onError?.(new Error(mediaError?.message ?? "Audio playback error"));
    });
  }

  init(): void {
    if (this.context) return;

    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.gainNode = this.context.createGain();

    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

    this.connectSource();
  }

  private connectSource() {
    if (!this.context || !this.analyser || !this.gainNode || this.isSourceConnected)
      return;

    try {
      this.source = this.context.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
      this.isSourceConnected = true;
    } catch {
      // Source may already be connected if audio element was reused
    }
  }

  async load(src: string): Promise<void> {
    this.audio.src = src;
    this.audio.load();

    return new Promise<void>((resolve, reject) => {
      const onCanPlay = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Failed to load audio"));
      };
      const cleanup = () => {
        this.audio.removeEventListener("canplay", onCanPlay);
        this.audio.removeEventListener("error", onError);
      };
      this.audio.addEventListener("canplay", onCanPlay, { once: true });
      this.audio.addEventListener("error", onError, { once: true });
    });
  }

  async play(): Promise<void> {
    if (!this.context) this.init();

    if (this.context?.state === "suspended") {
      await this.context.resume();
    }

    try {
      await this.audio.play();
    } catch (err) {
      // Autoplay may be blocked — user gesture required
      this.onError?.(err instanceof Error ? err : new Error("Playback failed"));
    }
  }

  pause(): void {
    this.audio.pause();
  }

  seek(time: number): void {
    if (Number.isFinite(time)) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration || 0));
    }
  }

  setVolume(value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    if (this.gainNode && this.context) {
      this.gainNode.gain.setValueAtTime(clamped, this.context.currentTime);
    }
    this.audio.volume = clamped;
  }

  getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.frequencyData.length > 0) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }

  getTimeDomainData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.timeDomainData.length > 0) {
      this.analyser.getByteTimeDomainData(this.timeDomainData);
    }
    return this.timeDomainData;
  }

  getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  getBuffered(): number {
    if (this.audio.buffered.length > 0) {
      return this.audio.buffered.end(this.audio.buffered.length - 1);
    }
    return 0;
  }

  isReady(): boolean {
    return this.context !== null;
  }

  preloadNext(src: string): void {
    if (this.nextAudio) {
      this.nextAudio.src = "";
      this.nextAudio = null;
    }
    this.nextAudio = new Audio();
    this.nextAudio.crossOrigin = "anonymous";
    this.nextAudio.preload = "auto";
    this.nextAudio.src = src;
  }

  setLoop(loop: boolean): void {
    this.audio.loop = loop;
  }

  configureFftSize(size: number): void {
    if (this.analyser) {
      this.analyser.fftSize = size;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  destroy(): void {
    this.audio.pause();
    this.audio.src = "";
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.gainNode?.disconnect();
    this.context?.close();
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.source = null;
    this.isSourceConnected = false;
    AudioEngine.instance = null;
  }
}
