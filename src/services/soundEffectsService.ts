/**
 * Study Stranger - Web Audio Synthesizer Sound Engine
 * Zero-latency, browser-native sound effects for app opening, 3D interactions, and feedback.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.4;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("pref_sound_muted");
      this.muted = savedMute === "true";
      
      // Auto-unlock audio context on first user interaction
      const unlockAudio = () => {
        this.initContext();
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };
      window.addEventListener("click", unlockAudio, { passive: true });
      window.addEventListener("touchstart", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (this.ctx && this.ctx.state !== "closed") {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    localStorage.setItem("pref_sound_muted", muted.toString());
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  /**
   * Premium App Opening / Startup Chime:
   * Multi-stage harmonic crescendo with warm low foundation, sparkling crystalline chord, and gentle decay.
   */
  public playStartupChime() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master output gain
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.01, now);
      master.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.15);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      master.connect(ctx.destination);

      // Deep gentle sub-pulse (80Hz -> 65Hz)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(80, now);
      sub.frequency.exponentialRampToValueAtTime(65, now + 1.2);
      subGain.gain.setValueAtTime(0.4, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start(now);
      sub.stop(now + 1.6);

      // Major 9th shimmering chord frequencies: C4 (261.6), G4 (392), D5 (587.3), E5 (659.3), B5 (987.8)
      const chord = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        
        // Gentle arpeggio stagger (30ms per note)
        const noteStart = now + (idx * 0.04);
        osc.frequency.setValueAtTime(freq * 0.98, noteStart);
        osc.frequency.exponentialRampToValueAtTime(freq, noteStart + 0.08);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25 / (idx * 0.3 + 1), noteStart + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.8 + idx * 0.1);

        osc.connect(gain);
        gain.connect(master);
        osc.start(noteStart);
        osc.stop(noteStart + 2.2);
      });
    } catch (e) {
      console.warn("Error playing startup chime:", e);
    }
  }

  /**
   * Tactile Button Click: Crisp micro-pop
   */
  public playClick() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * 3D Card Hover / Focus: Soft subtle ethereal blip
   */
  public playCardHover() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Success / Correct Answer: Bright uplifting chime
   */
  public playSuccess() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.01, noteStart);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch (e) {}
  }

  /**
   * Tab switch / View change: Smooth atmospheric whoosh
   */
  public playTabSwitch() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  /**
   * Notification / Alert ping
   */
  public playNotification() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(this.volume * 0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.35);
      });
    } catch (e) {}
  }
  public playCorrectSound() {
    this.playSuccess();
  }

  public playWrongSound() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  public play(name: "click" | "correct" | "wrong" | "success" | "notification" | string) {
    switch (name) {
      case "click":
        this.playClick();
        break;
      case "correct":
      case "success":
        this.playSuccess();
        break;
      case "wrong":
        this.playWrongSound();
        break;
      case "notification":
        this.playNotification();
        break;
      default:
        this.playClick();
        break;
    }
  }
}

export const soundEffects = new SoundEffectsService();
