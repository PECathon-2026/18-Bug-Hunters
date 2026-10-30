/**
 * =========================================================================
 * FRONTEND AUDIO UTILITY: Calming Zen Background Soundscape (BGM)
 * =========================================================================
 * Generates an infinite, serene, meditative Japanese observatory soundscape
 * using the Web Audio API:
 *   - Soft harmonic drone in Japanese In-Sen / Hirajoshi scale
 *   - Gentle resonant wind chimes / singing bowls (鈴 Rin)
 *   - Faint mountain breeze texture (pink noise bandpass)
 * Completely offline, zero bandwidth, smooth 800ms fade-in/fade-out.
 */

// Japanese Hirajoshi meditative scale frequencies (D minor celestial mode)
const CELESTIAL_NOTES = [
  146.83, // D3 (Root drone)
  164.81, // E3
  196.00, // G3
  220.00, // A3 (Fifth)
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5 (High chime)
  587.33, // D5 (High bell)
];

class ZenSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private chimeTimer: ReturnType<typeof setInterval> | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Web Audio unsupported
    }
  }

  public async start(): Promise<boolean> {
    this.init();
    if (!this.ctx || !this.masterGain) return false;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isRunning) return true;
    this.isRunning = true;

    const now = this.ctx.currentTime;

    // 1. Warm Meditative Celestial Drone (73.4 Hz + 146.8 Hz D-root)
    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(220, now);
    droneFilter.connect(this.masterGain);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.045, now);
    droneGain.connect(droneFilter);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.setValueAtTime(73.4, now); // D2
    this.droneOsc1.connect(droneGain);
    this.droneOsc1.start();

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "triangle";
    this.droneOsc2.frequency.setValueAtTime(147.1, now); // D3 slightly detuned for binaural warmth
    this.droneOsc2.connect(droneGain);
    this.droneOsc2.start();

    // 2. Soft Mountain Observatory Breeze (Filtered noise)
    this.startBreeze(now);

    // 3. Gentle Random Resonant Chimes (every 4-7 seconds)
    this.playChime();
    this.chimeTimer = setInterval(() => {
      if (this.isRunning && Math.random() < 0.85) {
        this.playChime();
      }
    }, 4800);

    // Smooth 1.2s fade-in to calming ambient volume (0.12)
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(0.12, now + 1.2);

    return true;
  }

  private startBreeze(now: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.05;
        b2 = 0.85 * b2 + white * 0.05;
        output[i] = (b0 + b1 + b2) * 0.2;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(320, now);
      noiseFilter.Q.setValueAtTime(1.2, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.015, now);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      this.noiseNode.start();
    } catch {
      // ignore
    }
  }

  private playChime() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;
    const now = this.ctx.currentTime;

    const freq = CELESTIAL_NOTES[Math.floor(Math.random() * CELESTIAL_NOTES.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Exponential bell decay (starts soft, rings out for 4-5 seconds)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 4.6);
  }

  public stop() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;
    const now = this.ctx.currentTime;

    // Smooth 0.8s fade-out
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);

    setTimeout(() => {
      this.isRunning = false;
      if (this.chimeTimer) {
        clearInterval(this.chimeTimer);
        this.chimeTimer = null;
      }
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.noiseNode?.stop();
      } catch {
        // ignore
      }
    }, 850);
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

// Singleton audio engine instance
export const zenBgmEngine = new ZenSoundscapeEngine();

