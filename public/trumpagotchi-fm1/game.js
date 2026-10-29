/* SPDX-License-Identifier: GPL-3.0-only
 * Trumpagotchi: The Tiny Pet — web adaptation of game mechanics from
 * adamcharleswilsonmusic-code/Trumpagotchi v1.0.0 firmware/src/app/pet.c (GPL-3.0-only).
 * This readable script is complete corresponding source for the browser adaptation.
 * This is not the original firmware binary or the FM-1 synthesizer/emulator.
 */
(() => {
  'use strict';
  const KEY = 'random-candy-land-trumpagotchi-original-fm1-adaptation-v1';
  const els = {};
  const get = (id) => els[id] || (els[id] = document.getElementById(id));
  const clamp = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
  const now = () => Date.now();
  const audio = new Audio();
  audio.preload = 'none';
  const originalClips = Object.freeze({
    feed:'i_actually_enjoy_that.mp3', praise:'so_amazing.mp3',
    clean:'phenomenal.mp3', rest:'thats_fine.mp3', wake:'better_than_ever_before.mp3',
    news:'we_have_losers.mp3', cheer:'im_enjoying_it.mp3', refuse:'wrong.mp3',
    hungry:'can_you_believe_this.mp3', accident:'nothing_but_problem.mp3'
  });
  const create = () => ({
    food:75,mood:70,energy:75,cleanliness:80,dayMinute:540,day:1,
    sleeping:false,paused:false,gameOver:false,muted:false,
    neglect:0,snackStock:3,plumpness:0,pooCount:0,careCount:0,
    clockRemainder:0,foodMs:0,pooMs:0,autoSnackMs:0,saveMs:0,
    lastCare:{feed:-30000,praise:-15000,clean:-120000},
    lastNews:-18000,lastCheer:-15000,lastMelody:-60000,activeMs:0,
    message:'A TREMENDOUS DAY',messageUntil:0
  });
  const allowedKeys = Object.keys(create());
  let state = create();
  let lastFrame = performance.now();
  let animationTimer = null;
  let saveTimer = null;
  let soundEnabled = true;

  function speak(key) {
    if (!soundEnabled || state.muted || document.hidden) return;
    const clip = originalClips[key];
    if (!clip) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '/audio/trump/' + clip;
      audio.load();
      const played = audio.play();
      if (played && typeof played.catch === 'function') played.catch(() => {});
    } catch (_) {}
  }

  function say(message, voiceKey, duration = 3600) {
    state.message = String(message);
    state.messageUntil = state.activeMs + duration;
    if (voiceKey) speak(voiceKey);
    render();
  }
  function isNight() {return state.dayMinute >= 1260 || state.dayMinute < 360;}
  function phase() {
    if (isNight()) return 'NIGHT';
    if (state.dayMinute < 720) return 'MORNING';
    if (state.dayMinute < 1080) return 'DAY';
    return 'EVENING';
  }
  function mood() {
    if (state.sleeping || state.energy <= 20 || isNight()) return 'tired';
    if (state.food <= 25) return 'hungry';
    if (state.neglect >= 12 || state.mood <= 10) return 'sulking';
    if (state.mood <= 40 || state.cleanliness <= 25) return 'bored';
    return 'happy';
  }
  function feedback() {
    if (state.sleeping) return isNight() ? 'SLEEPING UNTIL SUNRISE' : 'EXECUTIVE NAP';
    if (state.food <= 25) return 'I WANT FOOD';
    if (state.energy <= 20 || isNight()) return 'I WANT SLEEP';
    if (state.cleanliness <= 25) return 'THIS PLACE NEEDS A CLEAN';
    if (mood() === 'sulking') return 'I EXPECT BETTER SERVICE';
    if (mood() === 'bored') return 'A LITTLE ATTENTION?';
    return 'A TREMENDOUS DAY';
  }
  function formatTime() {
    const total = ((Math.floor(state.dayMinute) % 1440) + 1440) % 1440;
    const h = Math.floor(total / 60);
    const hour = h % 12 || 12;
    const m = total % 60;
    return String(hour).padStart(2,'0') + ':' + String(m).padStart(2,'0') + (h < 12 ? ' AM' : ' PM');
  }
  function animate(action, duration = 1200) {
    const node = get('scene');
    node.dataset.animation = action;
    window.FM1PixelScreen?.animate(action, duration);
    if (animationTimer) clearTimeout(animationTimer);
    animationTimer = window.setTimeout(() => {
      node.dataset.animation = '';
    }, duration);
  }
  function updateClock(ms) {
    // A 5-minute awake day; sleeping through night speeds to dawn at 16×.
    let remaining = ms;
    for (let i = 0; i < 4 && remaining > .001; i++) {
      const fastNight = state.sleeping && isNight();
      const speed = fastNight ? 16 : 1;
      let part = remaining;
      if (fastNight) {
        const leftToDawn = state.dayMinute >= 1260
          ? 1440 - state.dayMinute + 360 : 360 - state.dayMinute;
        part = Math.min(remaining, leftToDawn / (0.0048 * speed));
      }
      state.dayMinute += part * 0.0048 * speed;
      if (state.dayMinute >= 1440) {
        const full = Math.floor(state.dayMinute / 1440);
        state.day += full;
        state.dayMinute %= 1440;
      }
      if (fastNight) {
        state.energy = clamp(state.energy + part / 1000 * 5);
        state.mood = clamp(state.mood + part / 1000 * 2);
        if (Math.abs(state.dayMinute - 360) <= 0.001) {
          state.dayMinute = 360;
          state.energy = 100;
          state.mood = clamp(state.mood + 25);
          state.sleeping = false;
          state.message = 'A TREMENDOUS MORNING';
          state.messageUntil = state.activeMs + 3800;
        }
      }
      remaining -= part;
      if (part < .001) break;
    }
    if (!state.sleeping) {
      // The original five-minute day caps nighttime waking energy.
      let ceiling = 100;
      if (isNight()) ceiling = 20;
      else if (state.dayMinute >= 1080) {
        ceiling = 100 - (state.dayMinute - 1080) * 80 / 180;
      }
      state.energy = Math.min(ceiling, state.energy);
    }
  }
  function tick(ms) {
    if (state.paused || state.gameOver || document.hidden) return;
    const delta = Math.max(0, Math.min(ms, 1200));
    state.activeMs += delta;
    updateClock(delta);
    // Energy is -4 points per five seconds awake, +10 while napping.
    state.energy = clamp(state.energy + (state.sleeping ? 10 : -4) * delta / 5000);
    if (state.sleeping && !isNight() && state.energy >= 90) {
      state.sleeping = false;
      state.message = 'READY FOR MY CLOSE-UP';
      state.messageUntil = state.activeMs + 3500;
    }
    state.foodMs += delta;
    while (state.foodMs >= 60000) {
      state.foodMs -= 60000;
      state.food = clamp(state.food - (state.sleeping ? 1 : 14));
      state.cleanliness = clamp(state.cleanliness - 1);
      if (!state.sleeping) state.mood = clamp(state.mood - 5);
      if (state.food <= 20 || state.cleanliness <= 20 || (!state.sleeping && state.energy <= 20)) {
        state.neglect = Math.min(60, state.neglect + 1);
        state.mood = clamp(state.mood - 1);
      } else if (state.food > 35 && state.cleanliness > 35 && state.energy > 35) {
        state.neglect = Math.max(0, state.neglect - 1);
      }
      if (state.food < 70 && state.plumpness) state.plumpness--;
    }
    if (!state.sleeping) {
      state.pooMs += delta;
      if (state.pooMs >= 90000 && state.pooCount < 3) {
        state.pooMs -= 90000;
        state.pooCount++;
        state.cleanliness = clamp(state.cleanliness - 12);
        state.message = 'A LITTLE ACCIDENT';
        state.messageUntil = state.activeMs + 2600;
      }
      state.autoSnackMs += delta;
      if (state.autoSnackMs >= 45000 && state.snackStock > 0 && state.food < 75 && !isNight()) {
        state.autoSnackMs = 0;
        state.snackStock--;
        state.food = clamp(state.food + 8);
        state.energy = clamp(state.energy + 3);
        state.cleanliness = clamp(state.cleanliness - 8);
        state.message = 'A LITTLE SIDE SNACK';
        state.messageUntil = state.activeMs + 2500;
      }
    }
    state.saveMs += delta;
    if (state.saveMs >= 15000) {
      state.saveMs = 0;
      save(false);
    }
    // Original firmware's game over happens when all three needs have failed.
    if (state.food <= 0 && state.mood <= 0 && state.energy <= 0) {
      window.TrumpagotchiMelody?.stop();
      state.gameOver = true;
      state.sleeping = false;
      state.message = 'GAME OVER';
      try {audio.pause()} catch (_) {}
      save(false);
    }
  }

  function care(which) {
    if (state.gameOver) return;
    if (state.paused) { say('PRESS PLAY TO CARE FOR HIM'); return; }
    const t = state.activeMs;
    if (which === 'rest') {
      if (state.sleeping) {
        state.sleeping = false;
        say('BACK TO BUSINESS', 'wake');
        animate('praise');
      } else if (state.energy >= 85 && !isNight()) {
        say('TOO MUCH ENERGY TO NAP', 'refuse');
        return;
      } else {
        state.sleeping = true;
        say(isNight() ? 'PRESIDENTIAL BEDTIME' : 'EXECUTIVE NAP', 'rest');
      }
      state.careCount++;
      save(false);
      return;
    }
    if (state.sleeping) {say('LET ME FINISH MY NAP', 'refuse');return;}
    const cooldown = which === 'feed' ? 30000 : which === 'praise' ? 15000 : 120000;
    const bypassClean = which === 'clean' && state.pooCount > 0;
    const last = state.lastCare[which];
    if (typeof last === 'number' && t - last < cooldown && !bypassClean) {
      say('GIVE ME A MINUTE', 'refuse');
      return;
    }
    if (which === 'feed') {
      if (state.food >= 95) state.plumpness = Math.min(3, state.plumpness + 1);
      state.food = clamp(state.food + 25);
      state.energy = clamp(state.energy + 10);
      state.mood = clamp(state.mood + 2);
      state.cleanliness = clamp(state.cleanliness - 3);
      state.snackStock = 3;
      say('A VERY FINE SNACK', 'feed');
    } else if (which === 'praise') {
      if (state.food <= 25) {say('SNACKS BEFORE SPEECHES', 'refuse');return;}
      if (state.energy <= 20 || isNight()) {say('PRAISE AFTER MY NAP', 'refuse');return;}
      if (state.cleanliness <= 25) {say('A LITTLE CLEANUP FIRST', 'refuse');return;}
      if (state.mood >= 100) {say('YES, I KNOW. THANK YOU.', 'praise');return;}
      state.mood = clamp(state.mood + 15);
      state.neglect = Math.max(0,state.neglect - 1);
      say('FINALLY, SOME RESPECT', 'praise');
    } else if (which === 'clean') {
      if (state.cleanliness > 80 && !state.pooCount) {say('ALREADY LOOKING SHARP', 'refuse');return;}
      state.cleanliness = clamp(state.cleanliness + 30);
      state.pooCount = 0;
      state.pooMs = 0;
      state.mood = clamp(state.mood + 2);
      say('SPOTLESS. AS EXPECTED.', 'clean');
    }
    state.lastCare[which] = t;
    state.careCount++;
    animate(which);
    save(false);
  }

  function save(manual) {
    try {
      const stored = {};
      for (const key of allowedKeys) stored[key] = state[key];
      stored.savedAt = now();
      localStorage.setItem(KEY, JSON.stringify(stored));
      if (manual) say('PET SAVED — ON THIS DEVICE');
      get('saveFlash').classList.add('on');
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => get('saveFlash').classList.remove('on'), 850);
    } catch (error) {
      if (manual) say('STORAGE UNAVAILABLE — CHECK BROWSER SETTINGS');
    }
  }
  function load() {
    try {
      const txt = localStorage.getItem(KEY);
      if (!txt) return;
      const prior = JSON.parse(txt);
      if (!prior || typeof prior !== 'object') return;
      const fresh = create();
      for (const key of Object.keys(fresh)) {
        if (typeof prior[key] === typeof fresh[key] && key !== 'lastCare') {
          state[key] = prior[key];
        }
      }
      for (const key of ['food','mood','energy','cleanliness']) state[key] = clamp(state[key]);
      for (const key of ['dayMinute','activeMs','pooMs','foodMs','autoSnackMs','saveMs']) {
        if (!Number.isFinite(state[key]) || state[key] < 0) state[key] = fresh[key];
      }
      if (!Number.isInteger(state.day) || state.day < 1) state.day=1;
      if (prior.lastCare && typeof prior.lastCare === 'object') {
        for (const kind of ['feed','praise','clean']) {
          if (Number.isFinite(prior.lastCare[kind])) state.lastCare[kind] = prior.lastCare[kind];
        }
      }
      state.dayMinute %= 1440;
      state.pooCount = Math.max(0, Math.min(3, state.pooCount|0));
      state.snackStock = Math.max(0, Math.min(3, state.snackStock|0));
      state.message = 'WELCOME BACK — PET LOADED';
      state.messageUntil = state.activeMs + 3100;
    } catch (_) {state = create()}
  }

  function refreshData() {
    const needs=['food','mood','energy','cleanliness'];
    for (const key of needs) {
      const value = Math.round(clamp(state[key]));
      get(key+'Meter').value = value;
      get(key+'Value').textContent = value + '%';
    }
    const m = mood();
    get('lcd').dataset.mood = state.sleeping ? 'sleeping' : m;
    get('mood').textContent = state.sleeping ? 'SLEEPING' : m.toUpperCase();
    get('dayBadge').textContent = 'DAY '+state.day;
    get('dayCount').textContent = String(state.day);
    get('phase').textContent = phase();
    get('clock').textContent = formatTime();
    get('sun').textContent = isNight() ? '☾' : (state.dayMinute > 1080 ? '☀' : '☀');
    get('burgers').textContent = '🍔'.repeat(state.snackStock) || '· · ·';
    get('snackCount').textContent = String(state.snackStock);
    get('messCount').textContent = String(state.pooCount);
    get('mess').textContent = ['','🧻','🧻 💩','💩 🧻 💩'][state.pooCount] || '';
    get('mess').setAttribute('aria-label', state.pooCount ? state.pooCount+' cartoon messes' : 'No mess');
    get('careCount').textContent = String(state.careCount);
    get('emote').textContent = state.sleeping ? '💤' : ({happy:'❤️',bored:'💭',hungry:'🍔',tired:'😴',sulking:'💢'})[m];
    get('sleepLabel').hidden = !state.sleeping;
    get('gameover').hidden = !state.gameOver;
    get('playpause').textContent = state.paused ? '▶️ RESUME' : '⏸️ PAUSE';
    get('playpause').setAttribute('aria-pressed',String(state.paused));
    get('sound').textContent = state.muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
    get('sound').setAttribute('aria-pressed',String(!state.muted));
    const playingMelody = !!window.TrumpagotchiMelody?.isPlaying();
    get('melody').querySelector('b').textContent = playingMelody ? '🎵 PLAYING MELODY' : 'PLAY HIM A MELODY';
    get('melody').setAttribute('aria-busy', String(playingMelody));
    get('hint').textContent = state.gameOver
      ? 'Your pet needs a fresh start. Tap START A NEW PET.'
      : state.paused
      ? 'Paused. Your pet and the clock are frozen until you resume.'
      : state.sleeping
      ? 'Sleeping restores energy. At night he speeds through to dawn.'
      : 'Keep Food, Mood and Energy up. Progress saves automatically in this browser.';
    get('feedback').textContent = state.activeMs < state.messageUntil ? state.message : feedback();
    for (const id of ['feed','praise','clean','rest','news','cheer','melody']) get(id).disabled = state.gameOver;
    for (const key of document.querySelectorAll('.melody-key[data-note]')) key.disabled = state.gameOver;
  }
  function render() {refreshData(); window.FM1PixelScreen?.render(state);}

  function reset() {
    if (!window.confirm('Start a brand-new pet? Your current progress will be replaced.')) return;
    window.TrumpagotchiMelody?.stop();
    audio.pause();
    state = create();
    save(false);
    say('A FRESH START — NEW PET');
    animate('cheer');
  }
  function startNew() {
    window.TrumpagotchiMelody?.stop();
    audio.pause();
    state = create();
    save(false);
    say('A FRESH START — NEW PET');
    animate('cheer');
  }

  // The five-key piano and complete tune are both playable with touch or mouse.
  // Music is independent of the pet's clock; only the mood reward is gated.
  const noteNames = ['C', 'D', 'E', 'G', 'A'];
  function melodyMessage(message) {
    get('melodyStatus').textContent = message;
  }
  async function playKey(event) {
    if (state.gameOver) return;
    const button = event.currentTarget;
    const index = Number(button.dataset.note);
    if (!Number.isInteger(index) || index < 0 || index >= noteNames.length) return;
    // Every key is an action: the tiny Trumpagotchi responds immediately,
    // including while sleeping, paused or muted.
    animate('bongo', 820);
    say('BONGO BEAT: ' + noteNames[index], undefined, 1000);
    button.classList.add('is-playing');
    window.setTimeout(() => button.classList.remove('is-playing'), 180);
    if (state.muted) {
      melodyMessage('🥁 Donald is banging the bongos! Turn SOUND ON to hear the notes.');
      return;
    }
    audio.pause();
    const played = await window.TrumpagotchiMelody?.note(index);
    if (!played || state.muted || state.gameOver) {
      melodyMessage('🥁 Donald is playing the bongos, but audio is unavailable. Check the device volume.');
      return;
    }
    melodyMessage('🥁 ' + noteNames[index] + ' — Donald is banging the bongos! Play more notes.');
  }
  async function playMelody() {
    if (state.gameOver) return;
    // The bongo performance is not conditional on mood, hunger or time.
    // Use real time so it works with a sleeping or paused pet as well.
    animate('bongo', 2900);
    say('DONALD IS PLAYING THE BONGOS', undefined, 2950);
    if (state.muted) {
      melodyMessage('🥁 Donald is playing the bongos! Turn SOUND ON to hear the melody.');
      return;
    }
    const healthy = !state.paused && !state.sleeping && !isNight()
      && state.food > 25 && state.energy > 20 && state.cleanliness > 25
      && state.neglect < 12 && state.mood > 10;
    audio.pause();
    const played = await window.TrumpagotchiMelody?.play(true);
    if (!played || state.muted || state.gameOver) {
      melodyMessage('🥁 Donald is drumming, but melody audio is unavailable. Check your browser volume.');
      return;
    }
    melodyMessage('🎶 Full tune and bongos playing! Tap the piano keys to perform with Donald.');
    if (healthy && state.activeMs - state.lastMelody >= 60000) {
      state.lastMelody = state.activeMs;
      state.mood = clamp(state.mood + 2);
      state.energy = clamp(state.energy - 1);
    }
    save(false);
    render();
  }
  function headlines() {
    if (state.paused || state.sleeping || state.gameOver) return;
    if (state.activeMs - state.lastNews < 18000) {say('THE NEWS NEEDS A BREAK');return;}
    state.lastNews = state.activeMs;
    state.mood = clamp(state.mood - 8);
    say('NEWS IS UNFAIR', 'news');
    // Travel to the chair, sit down and watch the tiny TV like the FM-1 pet.
    animate('news');
    save(false);
  }
  function cheer() {
    if (state.paused || state.sleeping || state.gameOver) return;
    if (state.activeMs - state.lastCheer < 15000) {say('GIVE THE CROWD A MINUTE');return;}
    state.lastCheer=state.activeMs;
    if (state.food <= 25 || state.energy <= 20 || isNight()) {say('SNACKS AND SLEEP FIRST', 'refuse');return;}
    state.mood = clamp(state.mood + 3);
    state.energy = clamp(state.energy - 1);
    say('THE CROWD LOVES IT', 'cheer');
    animate('cheer');
    save(false);
  }

  for (const kind of ['feed','praise','clean','rest']) {
    get(kind).addEventListener('click', () => care(kind));
  }
  get('news').addEventListener('click', headlines);
  get('cheer').addEventListener('click', cheer);
  get('melody').addEventListener('click', playMelody);
  for (const key of document.querySelectorAll('.melody-key[data-note]')) {
    key.addEventListener('click', playKey);
  }
  get('save').addEventListener('click', () => save(true));
  get('restart').addEventListener('click', reset);
  get('revive').addEventListener('click', startNew);
  get('sound').addEventListener('click', () => {
    state.muted = !state.muted;
    if (state.muted) {
      audio.pause();
      window.TrumpagotchiMelody?.stop();
      melodyMessage('🔇 Sound is off. Tap SOUND ON to play the keyboard.');
    } else {
      melodyMessage('🎹 Sound is on. Tap C, D, E, G or A — or play the full tune.');
    }
    save(false);
    render();
  });
  get('playpause').addEventListener('click', () => {
    if (state.gameOver) return;
    state.paused = !state.paused;
    if (state.paused) window.TrumpagotchiMelody?.stop();
    lastFrame = performance.now();
    say(state.paused ? 'PET PAUSED' : 'BACK TO BUSINESS');
    save(false);
  });
  document.addEventListener('visibilitychange', () => {
    // No offline/background decay, just as with the actual firmware when powered off.
    lastFrame = performance.now();
    if (document.hidden) {save(false);audio.pause();window.TrumpagotchiMelody?.stop()}
  });
  window.addEventListener('pagehide', () => {window.TrumpagotchiMelody?.stop();save(false)});
  load();
  render();
  document.body.dataset.trumpagotchiReady = 'true';
  window.setInterval(() => {
    const time = performance.now();
    const delta = time - lastFrame;
    lastFrame = time;
    tick(delta);
    render();
  }, 200);
})();
