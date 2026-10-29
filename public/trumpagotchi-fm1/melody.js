/* SPDX-License-Identifier: GPL-3.0-only
 * Original pentatonic music for the Trumpagotchi browser pet.
 * Runs entirely in the browser; no audio downloads or autoplay.
 */
(() => {
  'use strict';

  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  const keys = Object.freeze([261.63, 293.66, 329.63, 392, 440]); // C4 D4 E4 G4 A4
  const tune = [0, 2, 3, 4, 3, 2, 1, 0, 3, 0];
  const beat = 0.24;
  let audioContext = null;
  let playing = false;
  let finishTimer = null;
  let generation = 0;
  const active = new Set();

  async function ready() {
    if (!AudioContextType) return null;
    try {
      // Construct/resume inside the user-initiated click. This is essential on
      // Android Chrome, mobile Safari and installed home-screen web apps.
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContextType();
      }
      if (audioContext.state !== 'running') await audioContext.resume();
      return audioContext.state === 'running' ? audioContext : null;
    } catch (_) {
      return null;
    }
  }

  function voice(ctx, frequency, start, duration, volume = 0.14, drum = false) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = drum ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, start);
    if (drum) osc.frequency.exponentialRampToValueAtTime(frequency * 0.62, start + 0.14);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    const entry = {osc, gain};
    active.add(entry);
    osc.onended = () => {
      active.delete(entry);
      try { osc.disconnect(); gain.disconnect(); } catch (_) {}
    };
    osc.start(start);
    osc.stop(start + duration + 0.025);
  }

  function stop() {
    generation++;
    if (finishTimer !== null) clearTimeout(finishTimer);
    finishTimer = null;
    for (const {osc, gain} of active) {
      try { osc.stop(); } catch (_) {}
      try { osc.disconnect(); gain.disconnect(); } catch (_) {}
    }
    active.clear();
    playing = false;
  }

  // The five visible piano keys play immediately on touch or click.
  async function note(index) {
    if (!Number.isInteger(index) || index < 0 || index >= keys.length) return false;
    if (playing) stop(); // A tapped key takes precedence over the demo tune.
    const run = generation;
    const ctx = await ready();
    if (!ctx || run !== generation) return false;
    try {
      const start = ctx.currentTime + 0.012;
      voice(ctx, keys[index], start, 0.32, 0.17);
      voice(ctx, index % 2 === 0 ? 165 : 118, start, 0.16, 0.085, true);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Autoplay is never used: the full melody is only started by a real click.
  async function play(withBongos = false) {
    stop();
    const run = generation;
    const ctx = await ready();
    if (!ctx || run !== generation) return false;
    try {
      const start = ctx.currentTime + 0.045;
      tune.forEach((key, i) => {
        const t = start + i * beat;
        voice(ctx, keys[key], t, i === tune.length - 1 ? 0.37 : 0.21, 0.14);
        if (withBongos && i % 2 === 0) {
          voice(ctx, i % 4 === 0 ? 185 : 124, t, 0.17, 0.075, true);
        }
      });
      playing = true;
      finishTimer = setTimeout(() => {
        if (run !== generation) return;
        finishTimer = null;
        playing = false;
      }, Math.ceil((tune.length - 1) * beat * 1000 + 440));
      return true;
    } catch (_) {
      stop();
      return false;
    }
  }

  window.TrumpagotchiMelody = Object.freeze({
    play, note, stop, isPlaying: () => playing
  });
})();
