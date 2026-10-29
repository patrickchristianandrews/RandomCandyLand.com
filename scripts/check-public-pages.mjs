import fs from 'node:fs';
import vm from 'node:vm';

const required = [
  ['dist/index.html', ['id="root"', 'Random Candy Land']],
  ['dist/trump/index.html', ['id="root"']],
  ['dist/after-dark/index.html', ['id="ageGate"', 'id="enter"', 'letVisitorIn']],
  ['dist/music-visualizer/index.html', ['id="canvas"']],
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
if (!homeBundle.includes('Welcome to our rainbow-powered candy universe.') ||
    !homeBundle.includes('PURE CANDY CHAOS!') ||
    !homeBundle.includes('sugar-hero-brand')) {
  console.error('The latest candy-mascot homepage is missing from the published bundle.');
  failures++;
}
console.log('Checked: no celebrity crown-battle content in the production homepage.');

// Keep the requested music tools and standalone games available on the homepage.
if (!homeBundle.includes('Candy Pulse') || !homeBundle.includes('FM-1 Synth Lab')) {
  console.error('A current music attraction is missing from the published homepage.');
  failures++;
}
if (/Sugar Chaos 3D|PLAY TRUMPAGOTCHI/.test(homeBundle)) {
  console.error('An unwanted outdated homepage attraction was restored.');
  failures++;
}
if (!fs.existsSync('dist/trumpagotchi-fm1/index.html')) {
  console.error('The new independent FM-1 Trumpagotchi page is missing from the release.');
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
if (!homeBundle.includes('Start Bedminster Golf mini-game in one tap') ||
    !homeBundle.includes('Open Bedminster Golf in one tap')) {
  console.error('One-tap golf controls are missing from Trumpagotchi.');
  failures++;
}

if (failures) process.exit(1);
console.log('All standalone pages exist, and After Dark scripts parse.');
