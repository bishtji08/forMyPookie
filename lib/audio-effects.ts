// Browser Web Audio API synthesizer for romantic micro-interactions
// Requires zero external sound files, ultra-lightweight, works offline, and respects browser audio policies.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Soft playful pop sound (for stamping confessions or tapping hearts)
 */
export function playPop() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Gracefully handle browser autoplay restrictions
  }
}

/**
 * Gentle sparkling romantic chime (for revealing love reasons)
 */
export function playChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + i * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  } catch {
    // Gracefully handle browser autoplay restrictions
  }
}

/**
 * Ascending harp arpeggio (for Love Meter level increase)
 */
export function playHarp(pitchMultiplier = 1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const baseFreqs = [440, 554.37, 659.25]; // A4, C#5, E5
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * Math.min(pitchMultiplier, 2.5), now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  } catch {
    // Gracefully handle browser autoplay restrictions
  }
}

/**
 * Joyful fanfare celebration sound (for YES click and all reasons unlocked)
 */
export function playCelebration() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    });
  } catch {
    // Gracefully handle browser autoplay restrictions
  }
}
