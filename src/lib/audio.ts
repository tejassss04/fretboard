/**
 * Web Audio Guitar Synthesizer
 * Uses physical-modeling-inspired synthesis (transient impulse + harmonics + damping filter)
 * with zero external dependencies and zero-latency playback.
 */

import { noteToFrequency } from './music';

export type GuitarTone = 'acoustic' | 'electric' | 'nylon';

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentTone: GuitarTone = 'acoustic';

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master volume & limiter
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    // Dynamics compressor to prevent clipping on quick multi-string chords
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
    compressor.knee.setValueAtTime(20, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

    this.masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);
  }

  public setTone(tone: GuitarTone) {
    this.currentTone = tone;
  }

  public setVolume(volume: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Synthesizes and plays a guitar note at the specified frequency or note name.
   */
  public playNote(
    frequencyOrNote: number | string,
    velocityOrOctave: number = 0.8,
    delaySec: number = 0
  ) {
    if (delaySec > 0) {
      setTimeout(() => this.playNote(frequencyOrNote, velocityOrOctave, 0), delaySec * 1000);
      return;
    }

    let frequency: number;
    let velocity: number = 0.8;

    if (typeof frequencyOrNote === 'string') {
      const octave = typeof velocityOrOctave === 'number' ? velocityOrOctave : 4;
      frequency = noteToFrequency(frequencyOrNote, octave);
      velocity = 0.8;
    } else {
      frequency = frequencyOrNote;
      velocity = typeof velocityOrOctave === 'number' ? velocityOrOctave : 0.8;
    }

    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const tone = this.currentTone;

    // Decay duration based on pitch (lower strings ring out longer)
    const baseDecay = tone === 'electric' ? 3.5 : tone === 'acoustic' ? 2.8 : 1.9;
    const pitchFactor = Math.max(0.6, Math.min(1.4, 200 / frequency));
    const duration = baseDecay * pitchFactor;

    // 1. Pick Attack / Plectrum noise transient
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      // Pinkish noise
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.3));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(frequency * 2.2, now);
    noiseFilter.Q.setValueAtTime(1.5, now);

    const noiseGain = this.ctx.createGain();
    const noiseAmp = velocity * (tone === 'acoustic' ? 0.25 : tone === 'electric' ? 0.15 : 0.08);
    noiseGain.gain.setValueAtTime(noiseAmp, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + 0.04);

    // 2. Fundamental & String Harmonics
    // Main string body: Triangle / Saw hybrid
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();

    if (tone === 'electric') {
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc3.type = 'sine';
    } else if (tone === 'acoustic') {
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc3.type = 'sine';
    } else {
      // Nylon
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc3.type = 'triangle';
    }

    // String tension pluck envelope (slight sharp pitch bend down on initial hit)
    const pitchTensionBend = 1.015;
    osc1.frequency.setValueAtTime(frequency * pitchTensionBend, now);
    osc1.frequency.exponentialRampToValueAtTime(frequency, now + 0.035);

    // Subtle detune for natural chorus/resonance
    osc2.frequency.setValueAtTime(frequency * 1.002, now);
    osc3.frequency.setValueAtTime(frequency * 2, now); // Second harmonic octave

    // Filter simulation (acoustic soundboard / guitar body resonance)
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    const initialCutoff = Math.min(8000, frequency * (tone === 'electric' ? 6 : 4.5));
    bodyFilter.frequency.setValueAtTime(initialCutoff, now);
    // Damping: high frequencies fade out faster than the fundamental
    bodyFilter.frequency.exponentialRampToValueAtTime(Math.max(120, frequency * 1.2), now + duration * 0.8);
    bodyFilter.Q.setValueAtTime(tone === 'electric' ? 2.5 : 1.2, now);

    // Note amplitude envelope
    const noteGain = this.ctx.createGain();
    const amp = velocity * 0.6;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(amp, now + 0.004); // Fast 4ms attack
    noteGain.gain.exponentialRampToValueAtTime(amp * 0.45, now + 0.25);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Relative mix of harmonics
    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.7;
    const gain2 = this.ctx.createGain();
    gain2.gain.value = tone === 'electric' ? 0.5 : 0.25;
    const gain3 = this.ctx.createGain();
    gain3.gain.value = tone === 'acoustic' ? 0.35 : 0.15;

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(bodyFilter);
    gain2.connect(bodyFilter);
    gain3.connect(bodyFilter);

    bodyFilter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  }

  /**
   * Arpeggiated chord strumming
   */
  public strum(frequencies: number[], speedMs: number = 35) {
    frequencies.forEach((freq, idx) => {
      if (freq > 0) {
        setTimeout(() => {
          this.playNote(freq, 0.78);
        }, idx * speedMs);
      }
    });
  }

  /**
   * Short percussive metronome click
   */
  public playClick(isAccent: boolean = false) {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(isAccent ? 0.6 : 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

// Singleton audio instance for client-side use
let audioEngineInstance: GuitarAudioEngine | null = null;

export function getAudioEngine(): GuitarAudioEngine {
  if (typeof window === 'undefined') {
    return new GuitarAudioEngine();
  }
  if (!audioEngineInstance) {
    audioEngineInstance = new GuitarAudioEngine();
  }
  return audioEngineInstance;
}

export const guitarAudio = typeof window !== 'undefined' ? getAudioEngine() : (new GuitarAudioEngine() as GuitarAudioEngine);

