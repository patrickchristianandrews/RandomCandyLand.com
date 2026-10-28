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
if (!homeBundle.includes('Step into a vivid, offbeat playground')) {
  console.error('Expected site-wide RandomCandyLand introduction is missing in the published bundle.');
  failures++;
}
console.log('Checked: no celebrity crown-battle content in the production homepage.');

if (fs.existsSync('dist/fm1-emu/index.html')) {
  console.error('Removed FM-1 Synth Lab is still being published.');
  failures++;
}
if (/FM-1 Synth Lab|Sugar Chaos 3D|PLAY TRUMPAGOTCHI/.test(fs.readFileSync('dist/index.html', 'utf8'))) {
  console.error('An unwanted or outdated homepage attraction was restored.');
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
if (failures) process.exit(1);
console.log('All standalone pages exist, and After Dark scripts parse.');
