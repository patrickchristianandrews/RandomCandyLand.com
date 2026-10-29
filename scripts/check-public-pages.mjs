import fs from 'node:fs';
import vm from 'node:vm';

const required = [
  ['dist/index.html', ['id="root"', 'Random Candy Land']],
  ['dist/trump/index.html', ['id="root"']],
  ['dist/after-dark/index.html', ['id="ageGate"', 'id="enter"', 'letVisitorIn']],
  ['dist/music-visualizer/index.html', ['id="canvas"']],
  ['dist/trumpagotchi-pet/index.html', ['data-action="feed"', 'data-action="praise"', 'data-action="clean"', 'data-action="rest"', 'id="originalCanvas"', '/trumpagotchi-pet/original-art.js', 'setInterval(tick,1000)']],
];

let failures = 0;
for (const [path, expected] of required) {
  if (!fs.existsSync(path)) {
    console.error('Missing published page:', path);
    failures++;
    continue;
  }
  const html = fs.readFileSync(path,'utf8');
  for (const token of expected) {
    if (!html.includes(token)) {
      console.error('Published page missing expected content:', path, token);
      failures++;
    }
  }
  if (path.includes('after-dark')) {
    for (const [i, match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
      try {
        new vm.Script(match[1],{filename:`${path} script ${i+1}`});
        console.log('Syntax verified:',path,'script',i+1);
      } catch (err) {
        console.error('After Dark has broken JavaScript:',err.message);
        failures++;
      }
    }
  }
  console.log('Checked:',path);
}
// Never re-publish the pop-star crown-battle experience the owner removed.
const homeBundle = fs.readFileSync('dist/index.html','utf8');
for (const forbidden of ['pop stars battle for the crown','face pop-culture guests','Taylor Swift','Sabrina Carpenter','Bad Bunny','Beyoncé','Lady Gaga','Billie Eilish','Bruno Mars','LeBron James','Character cameo']) {
  if (homeBundle.includes(forbidden)) {
    console.error('The published homepage still contains removed celebrity content:',forbidden);
    failures++;
  }
}
if (!homeBundle.includes('candyland-next') ||
    !homeBundle.includes('Stay sweet.') ||
    !homeBundle.includes('Get weird.') ||
    !homeBundle.includes('candyland-portals')) {
  console.error('The replacement Candy Land homepage is missing from the published bundle.');
  failures++;
}
if (homeBundle.includes('PURE CANDY CHAOS!') || homeBundle.includes('sugar-universe')) {
  console.error('The retired Candy Land homepage is still included in the production bundle.');
  failures++;
}
console.log('Checked: no celebrity crown-battle content in the production homepage.');

// Keep the requested music tools and standalone games available on the homepage.
if (!homeBundle.includes('Candy Pulse') || !homeBundle.includes('Trumpagotchi 2')) {
  console.error('A current attraction is missing from the published homepage.');
  failures++;
}
if (/Sugar Chaos 3D|PLAY TRUMPAGOTCHI/.test(homeBundle)) {
  console.error('An unwanted outdated homepage attraction was restored.');
  failures++;
}
const retiredFm1 = 'dist/trumpagotchi-fm1/index.html';
if (!fs.existsSync(retiredFm1) || !fs.readFileSync(retiredFm1, 'utf8').includes('url=/trumpagotchi-pet/')) {
  console.error('The retired FM-1 release page must redirect to the playable browser pet.');
  failures++;
}
const retiredSequencer = 'dist/fm1-emu/index.html';
if (!fs.existsSync(retiredSequencer) || !fs.readFileSync(retiredSequencer, 'utf8').includes('url=/trumpagotchi-pet/')) {
  console.error('The old synth path must no longer serve a broken sequencer.');
  failures++;
}

if (fs.existsSync('dist/arcade/index.html')) {
  console.error('Unwanted slot arcade is still present in published files.');
  failures++;
}
if (!homeBundle.includes('Use your own voice recordings in the game')) {
  console.error('Trumpagotchi personal audio importer is missing from the production bundle.');
  failures++;
}
// POLL must make Donald speak and its onscreen meter must be directly tappable.
if (!homeBundle.includes('POLL CHECK: ') ||
    !homeBundle.includes('Hear Donald react to his current poll rating') ||
    !homeBundle.includes('Tap POLL')) {
  console.error('Trumpagotchi is missing its spoken POLL reaction.');
  failures++;
}
const pollRecordings = [
  'better_than_ever_before.mp3', 'phenomenal.mp3', 'so_amazing.mp3',
  'lots_of_problems.mp3', 'nothing_but_problem.mp3', 'whats_going_on.mp3',
  'maybe_winning.mp3', 'we_have_to_keep_going.mp3', 'bigleague.mp3',
];
for (const clip of pollRecordings) {
  if (!fs.existsSync('dist/audio/trump/' + clip)) {
    console.error('POLL recording is missing from the published files:', clip);
    failures++;
  }
}
// This build must contain the real user-selected Candy Land illustration and icons.
for (const asset of [
  'dist/random-candy-land-art.webp',
  'dist/icon.svg',
  'dist/favicon.png',
  'dist/apple-touch-icon.png',
  'dist/icon-192.png',
  'dist/icon-512.png',
]) {
  if (!fs.existsSync(asset) || fs.statSync(asset).size < 3000) {
    console.error('Required Candy Land brand asset is missing or empty:', asset);
    failures++;
  }
}
if (!homeBundle.includes('/random-candy-land-art.webp')) {
  console.error('Original candy-castle artwork missing from the homepage.');
  failures++;
}
if (homeBundle.includes('Start Bedminster Golf mini-game in one tap') ||
    homeBundle.includes('Open Bedminster Golf in one tap')) {
  console.error('Removed one-tap golf controls are still included in Trumpagotchi.');
  failures++;
}
if (!homeBundle.includes('CHOOSE A MINI-GAME') ||
    !homeBundle.includes('Play Mega Rally') ||
    !homeBundle.includes('Play Art of the Deal')) {
  console.error('Trumpagotchi mini-game chooser is missing from the published bundle.');
  failures++;
}

// The new pet game must lead with piano keys directly below the screen, use the
// higher-resolution renderer, and not show obsolete hardware instructions.
const newPetHtml = fs.readFileSync('dist/trumpagotchi-pet/index.html','utf8');
if (!newPetHtml.includes('<h1>Trumpagotchi <span>2</span></h1>') ||
    !newPetHtml.includes('width="720" height="468"') ||
    !newPetHtml.includes('class="pocket-piano"') ||
    newPetHtml.indexOf('class="pocket-piano"') < newPetHtml.indexOf('id="originalCanvas"') ||
    newPetHtml.indexOf('class="pocket-piano"') > newPetHtml.indexOf('class="controls"')) {
  console.error('Trumpagotchi 2 game/piano order or smooth rendering was not published.');
  failures++;
}
if (/FM-1|synthesizer|sequencer|MIDI/.test(newPetHtml)) {
  console.error('Retired hardware wording remains on the Trumpagotchi 2 page.');
  failures++;
}
// Confirm the *original* FM-1 artist's character and room logic is shipped, not a substitute emoji.
const originalArt = 'dist/trumpagotchi-pet/original-art.js';
if (!fs.existsSync(originalArt)) {
  console.error('Real FM-1 Trumpagotchi pixel drawing code is absent.');
  failures++;
} else {
  const art = fs.readFileSync(originalArt, 'utf8');
  if (!art.includes('function pet_character') || !art.includes('function pet_room') ||
      !art.includes('window.drawOriginalTrumpagotchi')) {
    console.error('The original source-drawn character and room were not included.');
    failures++;
  }
}
// The nonsense generator has a full-cycle, non-repeating shuffle and actual goo SVG.
for (const token of ['nonsense-lab', 'GIVE ME MORE NONSENSE',
  'random-candy-land-nonsense-complete-cycle-v1', 'candyland-header-goo',
  'goo-fill-']) {
  if (!homeBundle.includes(token)) {
    console.error('Candy Land nonsense/goo experience is missing from the homepage:', token);
    failures++;
  }
}
if (failures) process.exit(1);
console.log('All standalone pages exist, and After Dark scripts parse.');
