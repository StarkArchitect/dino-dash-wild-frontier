import { EventBus } from '../core/EventBus';
import { Storage } from '../utils/Storage';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized: boolean = false;
  private isMuted: boolean = false;

  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  private ambientNode: AudioNode | null = null;

  constructor() {
    const settings = Storage.getSettings();
    this.isMuted = settings.isMuted;

    this.setupEventListeners();
  }

  private initContext(): void {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      const settings = Storage.getSettings();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = settings.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Ambient Bus
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = settings.ambientVolume;
      this.ambientGain.connect(this.masterGain);

      this.startAmbientDesertWind();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  private resumeIfNeeded(): void {
    if (!this.isInitialized) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupEventListeners(): void {
    // Resume audio on any user interaction
    const userGestures = ['click', 'keydown', 'touchstart'];
    const unlock = () => {
      this.resumeIfNeeded();
      userGestures.forEach(evt => window.removeEventListener(evt, unlock));
    };
    userGestures.forEach(evt => window.addEventListener(evt, unlock, { once: false }));

    EventBus.on('dinoStep', () => this.playFootstep());
    EventBus.on('dinoJump', () => this.playJump());
    EventBus.on('dinoLand', () => this.playLanding());
    EventBus.on('inputCrouchStart', () => this.playCrouch());
    EventBus.on('dinoHit', () => this.playCollision());
    EventBus.on('gameOver', () => this.playGameOver());
    EventBus.on('scoreMilestone', () => this.playMilestone());
    EventBus.on('uiClick', () => this.playClick());
    EventBus.on('inputToggleMute', () => this.toggleMute());
    EventBus.on('coinCollected', (data: { streak?: number }) => this.playCoinSound(data?.streak || 1));
    EventBus.on('shopPurchase', () => this.playPurchaseSound());
    EventBus.on('shieldDeflect', () => this.playShieldDeflectSound());
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    Storage.saveSettings({ isMuted: muted });
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    EventBus.emit('muteToggled', this.isMuted);
    return this.isMuted;
  }

  public setVolumes(sfx: number, ambient: number): void {
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
      if (this.ambientGain) this.ambientGain.gain.setValueAtTime(ambient, this.ctx.currentTime);
    }
    Storage.saveSettings({ sfxVolume: sfx, ambientVolume: ambient });
  }

  // --- SYNTHESIZED SOUND EFFECTS ---

  /**
   * Footstep: snappy bandpassed noise burst resembling clawed foot on gravel/sand.
   */
  public playFootstep(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const dur = 0.055;

    // Buffer noise
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320 + Math.random() * 100, t);
    filter.Q.setValueAtTime(2.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  /**
   * Jump: Frequency sweep upward (160 Hz -> 580 Hz)
   */
  public playJump(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.18);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Landing: Sub-bass thud + ground impact crunch
   */
  public playLanding(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;

    // Sub-bass thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.16);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);

    // Dust gravel crunch
    const dur = 0.12;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(450, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filt);
    filt.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(t);
  }

  /**
   * Crouch: Low-pitch sliding swoosh
   */
  public playCrouch(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Collision: Dramatic explosion-like crunch
   */
  public playCollision(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const dur = 0.55;

    // Distortion crunch noise
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  /**
   * Game Over: Sad descending minor arpeggio
   */
  public playGameOver(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const notes = [330, 311, 293, 261];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.14;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /**
   * Milestone: High reward chime every 100 points
   */
  public playMilestone(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880.0, t + 0.08); // A5

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * UI Click tone
   */
  public playClick(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Coin Collection: Bright ascending arpeggio / pentatonic bell chime.
   * Scales pitch higher with consecutive streaks!
   */
  public playCoinSound(streak: number = 1): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5, E5, G5, C6, E6, G6
    const noteIdx = Math.min(baseFreqs.length - 1, (streak - 1) % baseFreqs.length);
    const primaryFreq = baseFreqs[noteIdx];

    // Bell chime oscillator 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(primaryFreq, t);

    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.16);

    // Harmonic sparkle overtone
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(primaryFreq * 1.5, t + 0.02);

    gain2.gain.setValueAtTime(0.18, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.02);
    osc2.stop(t + 0.22);
  }

  /**
   * Purchase / Unlock fanfare: Rich celebratory major chord flourish.
   */
  public playPurchaseSound(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C major chord
    chord.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.05;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  /**
   * Defensive Shield Deflect: Resonant metallic energy shockwave.
   */
  public playShieldDeflectSound(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resumeIfNeeded();

    const t = this.ctx.currentTime;

    // Resonant metallic sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.35);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);

    // Energy sizzle noise
    const dur = 0.25;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(4.0, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.3, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);
    noise.start(t);
  }

  /**
   * Continuous procedural ambient desert wind
   */
  private startAmbientDesertWind(): void {
    if (!this.ctx || !this.ambientGain) return;

    // 2-second looped pink noise buffer
    const bufSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Resonant bandpass for hollow canyon wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);

    noise.start();
    this.ambientNode = noise;
  }
}
