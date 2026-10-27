/**
 * Procedural Web Audio API sound generator for Standup Stage effects.
 * 100% self-contained, no external MP3/WAV dependencies, zero latency.
 */

class StandupSoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = true; // Sound of actions disabled by default

  constructor() {
    // Read preference - default to muted (no action sounds)
    try {
      const saved = localStorage.getItem('standuplab_sound_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      } else {
        this.muted = true;
        localStorage.setItem('standuplab_sound_muted', 'true');
      }
    } catch {
      this.muted = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem('standuplab_sound_muted', String(muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Classic comedic "Ba-dum... Tss!" rimshot
   */
  public playRimshot() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Helper: Snare hit
    const playSnare = (time: number, freq: number, decay: number) => {
      // Tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + decay);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + decay);

      // Noise punch
      const bufferSize = ctx.sampleRate * decay;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(time);
    };

    // Helper: Cymbal splash (Tsss!)
    const playCymbal = (time: number, duration: number) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 7500;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(time);
    };

    // Ba- (snare 1)
    playSnare(now, 180, 0.09);
    // dum- (snare 2, slightly lower pitch)
    playSnare(now + 0.12, 140, 0.12);
    // Tsss! (cymbal hit on punchline)
    playCymbal(now + 0.28, 0.45);
  }

  /**
   * Comedian microphone tap (Silenced as action sounds are removed)
   */
  public playMicTap() {
    // Action sound removed
    return;
  }

  /**
   * Audience warm applause shimmer
   */
  public playApplause() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.65;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Clapping bursts simulation
      const t = i / ctx.sampleRate;
      const envelope = Math.sin((t / duration) * Math.PI);
      const clapPuffs = Math.sin(t * 40) > 0.4 ? 1.5 : 0.4;
      data[i] = (Math.random() * 2 - 1) * envelope * clapPuffs;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Crisp comedic punch click / subtle stage snap (Silenced as action sounds are removed)
   */
  public playStageClick() {
    // Action click sound removed as requested
    return;
  }
}

export const soundEffects = new StandupSoundManager();
