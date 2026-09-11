// Web Audio API Synthesized Sound Engine
// Zero external file dependencies, zero latency, runs offline and on all mobile/desktop browsers

export type SoundTone = "cash_register" | "modern_chime" | "crystal_ping";

export interface SoundSettings {
  enabled: boolean;
  tone: SoundTone;
  volume: number; // 0.0 to 1.0
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  tone: "cash_register",
  volume: 0.85,
};

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getSettings(): SoundSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem("rf_sound_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_SETTINGS.enabled,
          tone: ["cash_register", "modern_chime", "crystal_ping"].includes(parsed.tone)
            ? parsed.tone
            : DEFAULT_SETTINGS.tone,
          volume: typeof parsed.volume === "number" ? Math.max(0, Math.min(1, parsed.volume)) : DEFAULT_SETTINGS.volume,
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: Partial<SoundSettings>) {
    if (typeof window === "undefined") return;
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem("rf_sound_settings", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Play the classic luxury brass cash register 'ka-ching'
   */
  private playCashRegister(ctx: AudioContext, gainNode: GainNode) {
    const now = ctx.currentTime;

    // 1. Initial mechanical impact (clink)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // 2. High metallic bell strike ('Chiiing!')
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2093.0, now + 0.06); // C7
    gain2.gain.setValueAtTime(0.9, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(gainNode);
    osc2.start(now + 0.06);
    osc2.stop(now + 1.25);

    // 3. Shimmer overtone (gives that authentic gold bell resonance)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(3135.96, now + 0.07); // G7
    gain3.gain.setValueAtTime(0.5, now + 0.07);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc3.connect(gain3);
    gain3.connect(gainNode);
    osc3.start(now + 0.07);
    osc3.stop(now + 1.45);
  }

  /**
   * Play modern acoustic chime (Three-tone uplifting chord)
   */
  private playModernChime(ctx: AudioContext, gainNode: GainNode) {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.8 }, // C5
      { freq: 659.25, time: 0.1, dur: 0.9 }, // E5
      { freq: 783.99, time: 0.2, dur: 1.2 }, // G5
      { freq: 1046.5, time: 0.3, dur: 1.5 }, // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);
      noteGain.gain.setValueAtTime(0.6, now + time);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(noteGain);
      noteGain.connect(gainNode);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  /**
   * Play crystal high-frequency alert ping
   */
  private playCrystalPing(ctx: AudioContext, gainNode: GainNode) {
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1760.0, now); // A6
    osc.frequency.exponentialRampToValueAtTime(2637.0, now + 0.05); // E7
    noteGain.gain.setValueAtTime(0.8, now);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(noteGain);
    noteGain.connect(gainNode);
    osc.start(now);
    osc.stop(now + 0.95);
  }

  /**
   * Trigger the appointment alert tone
   */
  public play(toneOverride?: SoundTone, volumeOverride?: number) {
    const settings = this.getSettings();
    if (!settings.enabled && !toneOverride) return;

    const tone = toneOverride || settings.tone;
    const volume = typeof volumeOverride === "number" ? volumeOverride : settings.volume;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (tone === "cash_register") {
        this.playCashRegister(ctx, masterGain);
      } else if (tone === "modern_chime") {
        this.playModernChime(ctx, masterGain);
      } else if (tone === "crystal_ping") {
        this.playCrystalPing(ctx, masterGain);
      }

      // Also trigger device vibration on mobile if supported
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch (err) {
      console.warn("SoundEngine play error:", err);
    }
  }
}

export const soundEngine = new SoundEngine();
