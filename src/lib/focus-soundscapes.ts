// Web Audio API Offline Focus Soundscapes Synthesizer
// Zero external dependencies, pure Web Audio nodes with per-channel gain, presets, and localStorage persistence.

export type SoundscapeChannel = "binaural" | "brownNoise" | "rain" | "drone";
export type SoundscapeChannelKey = SoundscapeChannel | "brown";

export const SOUNDSCAPE_CHANNELS: {
  key: SoundscapeChannel;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  { key: "binaural", label: "Binaural 40Hz", emoji: "🧠", hint: "200Hz / 240Hz gamma beat — headphones required" },
  { key: "brownNoise", label: "Brown Noise", emoji: "🌊", hint: "Deep masking noise for open environments" },
  { key: "rain", label: "Rain On Glass", emoji: "🌧️", hint: "Band-passed noise, soft and continuous" },
  { key: "drone", label: "Deep Space", emoji: "🌌", hint: "Sub-bass drone with slow LFO swell" },
];

export interface SoundscapePrefs {
  channels: Record<SoundscapeChannel, boolean>;
  volumes: Record<SoundscapeChannel, number>;
  muted: boolean;
}

const DEFAULT_PREFS: SoundscapePrefs = {
  channels: {
    binaural: false,
    brownNoise: false,
    rain: false,
    drone: false,
  },
  volumes: {
    binaural: 0.5,
    brownNoise: 0.4,
    rain: 0.35,
    drone: 0.3,
  },
  muted: false,
};

const STORAGE_KEY = "mission_soundscape_prefs";

export class FocusSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGains: Map<SoundscapeChannel, GainNode> = new Map();
  private activeNodes: Map<SoundscapeChannel, { source: AudioNode; extras?: AudioNode[] }> = new Map();
  private prefs: SoundscapePrefs;

  constructor() {
    this.prefs = this.loadPrefs();
  }

  private loadPrefs(): SoundscapePrefs {
    if (typeof window === "undefined") return DEFAULT_PREFS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PREFS;
      const parsed = JSON.parse(raw);
      return {
        channels: { ...DEFAULT_PREFS.channels, ...(parsed.channels || {}) },
        volumes: { ...DEFAULT_PREFS.volumes, ...(parsed.volumes || {}) },
        muted: Boolean(parsed.muted),
      };
    } catch {
      return DEFAULT_PREFS;
    }
  }

  private savePrefs(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
    } catch {}
  }

  public getPrefs(): SoundscapePrefs {
    return { ...this.prefs };
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.prefs.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getChannelGain(channel: SoundscapeChannel): GainNode | null {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return null;

    if (!this.channelGains.has(channel)) {
      const gain = ctx.createGain();
      gain.gain.value = this.prefs.volumes[channel] ?? 0.5;
      gain.connect(this.masterGain);
      this.channelGains.set(channel, gain);
    }
    return this.channelGains.get(channel)!;
  }

  public startChannel(channel: SoundscapeChannel): void {
    this.stopChannel(channel);
    const ctx = this.getAudioContext();
    const targetGain = this.getChannelGain(channel);
    if (!ctx || !targetGain) return;

    if (channel === "binaural") {
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = "sine";
      oscR.type = "sine";
      oscL.frequency.value = 200;
      oscR.frequency.value = 240;

      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      if (pannerL && pannerR) {
        pannerL.pan.value = -1;
        pannerR.pan.value = 1;
        oscL.connect(pannerL);
        oscR.connect(pannerR);
        pannerL.connect(targetGain);
        pannerR.connect(targetGain);
      } else {
        oscL.connect(targetGain);
        oscR.connect(targetGain);
      }

      oscL.start();
      oscR.start();
      this.activeNodes.set(channel, { source: oscL, extras: [oscR] });
    } else if (channel === "brownNoise") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const out = (lastOut + 0.02 * white) / 1.02;
        lastOut = out;
        data[i] = out * 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.connect(targetGain);
      noise.start();
      this.activeNodes.set(channel, { source: noise });
    } else if (channel === "rain") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      filter.Q.value = 0.8;

      noise.connect(filter);
      filter.connect(targetGain);
      noise.start();
      this.activeNodes.set(channel, { source: noise, extras: [filter] });
    } else if (channel === "drone") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 65;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.15;
      lfoGain.gain.value = 0.15;

      lfo.connect(lfoGain.gain);
      osc.connect(targetGain);

      osc.start();
      lfo.start();
      this.activeNodes.set(channel, { source: osc, extras: [lfo, lfoGain] });
    }

    this.prefs.channels[channel] = true;
    this.savePrefs();
  }

  public stopChannel(channel: SoundscapeChannel): void {
    const active = this.activeNodes.get(channel);
    if (active) {
      try {
        if ("stop" in active.source && typeof (active.source as any).stop === "function") {
          (active.source as any).stop();
        }
        active.source.disconnect();
        if (active.extras) {
          active.extras.forEach((n) => {
            if ("stop" in n && typeof (n as any).stop === "function") {
              (n as any).stop();
            }
            n.disconnect();
          });
        }
      } catch {}
      this.activeNodes.delete(channel);
    }
    this.prefs.channels[channel] = false;
    this.savePrefs();
  }

  public toggleChannel(channel: SoundscapeChannel): boolean {
    if (this.activeNodes.has(channel)) {
      this.stopChannel(channel);
      return false;
    } else {
      this.startChannel(channel);
      return true;
    }
  }

  public setChannelVolume(channel: SoundscapeChannel, volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.prefs.volumes[channel] = clamped;
    this.savePrefs();

    const gain = this.getChannelGain(channel);
    if (gain && this.ctx) {
      gain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public setMasterMute(muted: boolean): void {
    this.prefs.muted = muted;
    this.savePrefs();

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMasterMute(): boolean {
    const next = !this.prefs.muted;
    this.setMasterMute(next);
    return next;
  }

  public isChannelActive(channel: SoundscapeChannel): boolean {
    return this.activeNodes.has(channel);
  }

  public isMuted(): boolean {
    return this.prefs.muted;
  }

  public stopAll(): void {
    const channels: SoundscapeChannel[] = ["binaural", "brownNoise", "rain", "drone"];
    channels.forEach((c) => this.stopChannel(c));
  }
}

export const soundscapeEngine = new FocusSoundscapeEngine();
export const getSoundscapeEngine = () => soundscapeEngine;
