/* SPDX-License-Identifier: GPL-3.0-only
 * A small original pentatonic melody for the browser adaptation of the
 * Trumpagotchi v1.0.0 FM-1 pet. No sequencer, external audio assets,
 * autoplay, or pre-existing copyrighted tune.
 */
(() => {
  'use strict';
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  const notes = [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 261.63, 392, 523.25];
  const beat = 0.24;
  let audioContext = null;
  let playing = false;
  let activeNodes = [];
  let finishTimer = null;

  function stop() {
    if (finishTimer !== null) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
    for (const oscillator of activeNodes) {
      try { oscillator.stop(); } catch (_) {}
      try { oscillator.disconnect(); } catch (_) {}
    }
    activeNodes = [];
    playing = false;
  }
  function tone(ctx, frequency, start, duration) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    // Dry, soft electronic key sound, shaped to avoid clicks and sharp peaks.
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, start);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.072, start + 0.018);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.025);
    activeNodes.push(osc);
  }
  function bongo(ctx, start, high) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(high ? 185 : 124, start);
    osc.frequency.exponentialRampToValueAtTime(high ? 118 : 72, start + 0.14);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.055, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, start + 0.17);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
    activeNodes.push(osc);
  }
  function play(withBongos) {
    stop();
    if (!AudioContextType) return false;
    try {
      audioContext ||= new AudioContextType();
      if (audioContext.state === 'suspended') {
        // Invoked directly from the button's click handler, allowing mobile
        // browsers to unlock audio with the user's interaction.
        const resume = audioContext.resume();
        if (resume?.catch) resume.catch(() => {});
      }
      const start = audioContext.currentTime + 0.045;
      notes.forEach((frequency, i) => {
        tone(audioContext, frequency, start + i * beat, i === notes.length - 1 ? 0.36 : 0.2);
        if (withBongos && i % 2 === 0) bongo(audioContext, start + i * beat, i % 4 === 0);
      });
      playing = true;
      finishTimer = setTimeout(() => {
        finishTimer = null;
        playing = false;
        activeNodes = [];
      }, Math.round((notes.length - 1) * beat * 1000 + 410));
      return true;
    } catch (_) {
      stop();
      return false;
    }
  }
  window.TrumpagotchiMelody = Object.freeze({
    play,
    stop,
    isPlaying: () => playing
  });
})();
