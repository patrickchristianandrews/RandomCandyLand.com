// Browser-level regression checks for After Dark, requiring no npm test packages.
// Uses Chrome DevTools Protocol and the runner's installed Google Chrome.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const uri=decodeURIComponent((req.url||'/').split('?')[0]);
  const filename=path.resolve(root,'.'+uri,(uri.endsWith('/')||!path.extname(uri))?'index.html':'');
  if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(filename,(err,data)=>{if(err){res.writeHead(404).end('Not found '+uri);return;}
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const chrome=['google-chrome','chromium','chromium-browser'].find(c=>spawnSync('which',[c]).status===0);
if(!chrome)throw new Error('Browser smoke tests need Chrome or Chromium');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'rcd-chrome-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'--remote-allow-origins=*','about:blank'],{stdio:'ignore'});
const testErrors=[];
let browserPort=0;
try{
  for(let i=0;i<60;i++){
    const f=path.join(profile,'DevToolsActivePort');
    if(fs.existsSync(f)){browserPort=+fs.readFileSync(f,'utf8').split('\n')[0];break;}
    await delay(150);
  }
  if(!browserPort)throw Error('Chrome did not open DevTools port');
  let client;
  async function navigate(url){
    if(client)client.close();
    const target=await (await fetch(`http://127.0.0.1:${browserPort}/json/new?${encodeURIComponent(url)}`,{method:'PUT'})).json();
    client=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{client.addEventListener('open',resolve,{once:true});client.addEventListener('error',reject,{once:true})});
    let next=0;
    const pending=new Map();
    client.addEventListener('message',event=>{
      const msg=JSON.parse(String(event.data));
      if(msg.method==='Runtime.exceptionThrown')testErrors.push(msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'Runtime exception');
      if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error')testErrors.push(msg.params.entry.text);
      if(msg.id&&pending.has(msg.id)){const [resolve,reject]=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}
    });
    const command=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,[resolve,reject]);client.send(JSON.stringify({id,method,params}));});
    await command('Runtime.enable');
    await command('Page.enable');
    // Force navigation after Runtime.enable so initial script failures are visible.
    await command('Page.navigate',{url});
    // A newly created target may still be loading; polling guarantees init.
    const evaluate=async js=>{
      const r=await command('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw Error('Browser JavaScript error: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));
      return r.result?.value;
    };
    for(let i=0;i<90;i++){if(await evaluate('document.readyState==="complete"'))break;await delay(100);}
    await delay(200);
    return {evaluate,command};
  }
  const site=`http://127.0.0.1:${port}`;
  const {evaluate}=await navigate(site+'/after-dark/');
  const check=async(desc,js)=>{
    const value=await evaluate(js);
    if(!value)throw Error('After Dark regression: '+desc);
    console.log('✓',desc);
  };
  await check('Adult entry is present', "!!document.querySelector('#enter')");
  await evaluate("document.querySelector('#enter').click()");
  await check('Adult entry dismisses the overlay',"getComputedStyle(document.querySelector('#ageGate')).display==='none'");
  await check('After Dark opens on the introduction rather than the atlas',"document.querySelector('#home').classList.contains('visible') && !document.querySelector('#atlas').classList.contains('visible')");
  await check('After Dark introduces all experiences',"!!document.querySelector('.enter-after-dark') && document.querySelectorAll('.afterdark-landing-grid .card').length>=5");
  await evaluate("document.querySelector('.enter-after-dark').click()");
  await check('Enter After Dark opens the atlas',"document.querySelector('#atlas').classList.contains('visible')");
  await evaluate("document.querySelector('[data-tab=atlas]').click()");
  console.log('Atlas diagnostics:',await evaluate("JSON.stringify({count:document.querySelectorAll('#topicGrid .topic').length,all:document.querySelector('#allCount')?.textContent,script:typeof window.renderAtlas,errors:window.onerror?.toString().slice(0,100)||'none'})"),JSON.stringify(testErrors));
  await check('Atlas has 100+ working interest cards',"document.querySelectorAll('#topicGrid .topic').length>=100");
  await evaluate("var input=document.querySelector('#search');input.value='leather';input.dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Search filters visible interests',"document.querySelectorAll('#topicGrid .topic').length>=1&&document.querySelectorAll('#topicGrid .topic').length<40");
  await evaluate("var input=document.querySelector('#search');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))");
  await evaluate("document.querySelector('#topicGrid .topic button').click()");
  await check('Marking a topic updates the controls',"document.querySelectorAll('#topicGrid .topic button.chosen').length>0");
  await evaluate("document.querySelector('[data-tab=quiz]').click();document.querySelector('#startQuiz').click()");
  await check('Quiz begins and displays choices',"document.querySelectorAll('#quizCard .quizOpts button').length===4");
  for(let i=0;i<32;i++){await evaluate("document.querySelector('#quizCard .quizOpts button')?.click()");}
  await check('Quiz finishes and renders a personal reading shelf',"document.querySelector('#quizCard .compare')!==null&&document.querySelectorAll('#quizCard .result').length>=12");
  await evaluate("document.querySelector('[data-tab=psych]').click()");
  await check('Psychology section renders all lenses',"document.querySelectorAll('#lenses .card').length>=10");
  await evaluate("document.querySelector('[data-tab=ideas]').click();document.querySelector('#drawIdea').click()");
  await check('Idea Lab draws usable cards',"document.querySelector('#ideaResult h3')?.textContent!=='What could curiosity feel like?'");
  await evaluate("document.querySelector('[data-tab=chat]').click();document.querySelector('[data-ask]').click()");
  await check('Ask Atlas responds to suggestions',"document.querySelectorAll('#chatWindow .bubble').length>=3");
  await evaluate("document.querySelector('[data-tab=guide]').click()");
  await check('Resources FAQ is interactive',"document.querySelectorAll('#faq details').length>=25");
  const lab=await navigate(site+'/after-dark/psychology-lab/');
  await checkLab(lab.evaluate);
  // Regression: the actual POLL label in Trumpagotchi must be clickable,
  // update the LCD, and invoke audio playback without cycling A/B.
  const pet=await navigate(site+'/trump/');
  for(let attempt=0;attempt<30;attempt++){
    if(await pet.evaluate("!!document.querySelector('[aria-label=\"Hear Donald react to his current poll rating\"]')")) break;
    await delay(100);
  }
  const petButton=await pet.evaluate("!!document.querySelector('[aria-label=\"Hear Donald react to his current poll rating\"]')");
  if(!petButton){
    console.log('Trumpagotchi route diagnosis:', await pet.evaluate("JSON.stringify({href:location.href,rootText:document.querySelector('#root')?.textContent?.slice(0,450),html:document.querySelector('#root')?.innerHTML.slice(0,550),buttons:[...document.querySelectorAll('button')].slice(0,12).map(b=>b.getAttribute('aria-label')||b.textContent),pageReady:document.readyState})"));
    console.log('Javascript exceptions:',JSON.stringify(testErrors.slice(-6)));
    throw Error('Trumpagotchi poll button missing from LCD');
  }
  await pet.evaluate("window.__pollAudioAttempts=0; HTMLMediaElement.prototype.play=function(){window.__pollAudioAttempts++;return Promise.resolve()}");
  await pet.evaluate("document.querySelector('[aria-label=\"Hear Donald react to his current poll rating\"]').click()");
  await delay(130);
  const pollSpoken=await pet.evaluate("window.__pollAudioAttempts>0 && document.body.textContent.includes('POLL CHECK:')");
  if(!pollSpoken)throw Error('POLL did not trigger audio and update on-screen speech');
  console.log('✓ Trumpagotchi poll taps trigger voice playback and LCD reaction.');
  // The user removed the one-tap Golf shortcut; the chooser must offer all three games.
  const oldGolf=await pet.evaluate("!!document.querySelector('[aria-label=\"Open Bedminster Golf in one tap\"]')");
  if(oldGolf)throw Error('Removed one-tap golf shortcut is still visible');
  console.log('✓ Removed one-tap Golf shortcut remains absent.');

  // Old prototype page must be fully deleted, not kept as a stale redirect.
  const retired=await fetch(site+'/trumpagotchi-pet/');
  if(retired.status!==404)
    throw Error('Deleted prototype pet page is still published');
  console.log('✓ Old prototype pet page is no longer published.');
  const oldFm1=await (await fetch(site+'/fm1-emu/')).text();
  if(!oldFm1.includes('url=/trumpagotchi-fm1/')) {
    throw Error('Old FM-1 link did not route to the playable tiny Trumpagotchi');
  }
  console.log('✓ Old FM-1 address now points to the standalone tiny pet game.');

  // The actual FM-1-derived tiny pet must be playable; it may not redirect.
  const tiny=await navigate(site+'/trumpagotchi-fm1/');
  const tinyReady=await tiny.evaluate("document.body.dataset.trumpagotchiReady==='true' && !!document.querySelector('#feed') && !!document.querySelector('#praise') && !!document.querySelector('#clean') && !!document.querySelector('#rest') && document.querySelector('#gameover').hidden");
  if(!tinyReady)throw Error('FM-1 Trumpagotchi browser pet did not initialize');
  const foodBefore=await tiny.evaluate("Number(document.querySelector('#foodMeter').value)");
  await tiny.evaluate("document.querySelector('#feed').click()");
  const foodAfter=await tiny.evaluate("Number(document.querySelector('#foodMeter').value)");
  if(foodAfter<=foodBefore)throw Error('FM-1 pet FEED button failed to replenish Food');
  const moodBefore=await tiny.evaluate("Number(document.querySelector('#moodMeter').value)");
  await tiny.evaluate("document.querySelector('#praise').click()");
  const moodAfter=await tiny.evaluate("Number(document.querySelector('#moodMeter').value)");
  if(moodAfter<=moodBefore)throw Error('FM-1 pet PRAISE button failed to raise Mood');
  await tiny.evaluate("document.querySelector('#playpause').click()");
  const paused=await tiny.evaluate("document.querySelector('#playpause').getAttribute('aria-pressed')==='true'");
  if(!paused)throw Error('FM-1 pet pause control failed');
  await tiny.evaluate("document.querySelector('#save').click()");
  const saved=await tiny.evaluate("!!localStorage.getItem('random-candy-land-trumpagotchi-original-fm1-adaptation-v1')");
  if(!saved)throw Error('FM-1 pet Save failed to persist progress');
  // Regression: the melody control must offer five working note buttons.
  const pianoReady=await tiny.evaluate("document.querySelectorAll('.melody-key[data-note]').length===5 && typeof window.TrumpagotchiMelody?.note==='function' && typeof window.TrumpagotchiMelody?.play==='function'");
  if(!pianoReady)throw Error('FM-1 Trumpagotchi five-key melody piano missing');
  await tiny.evaluate("document.querySelector('#sound').click()");
  await tiny.evaluate("document.querySelector('.melody-key[data-note=\"0\"]').click()");
  const mutedPiano=await tiny.evaluate("document.querySelector('#melodyStatus').textContent.includes('SOUND ON')");
  if(!mutedPiano)throw Error('Trumpagotchi piano button did not respond to a click');
  await tiny.evaluate("document.querySelector('#melody').click()");
  const mutedTune=await tiny.evaluate("document.querySelector('#melodyStatus').textContent.includes('SOUND ON')");
  if(!mutedTune)throw Error('Trumpagotchi full melody button did not respond to a click');
  await tiny.evaluate("document.querySelector('#sound').click()");
  console.log('✓ FM-1 Trumpagotchi piano has five wired keys and a responsive tune button.');
  console.log('✓ FM-1 Trumpagotchi web pet plays, feeds, praises, pauses and saves.');

  const simon=await navigate(site+'/candy-simon/');
  const simonReady=await simon.evaluate("document.querySelectorAll('.pad[data-pad]').length===4 && !!document.querySelector('#start')");
  if(!simonReady)throw Error('Candy Simon Says is missing its interactive gummy pads');
  await simon.command('Page.bringToFront');
  await simon.evaluate("document.querySelector('#start').click()");
  let simonPlays=false;
  for(let attempt=0;attempt<75;attempt++){
    simonPlays=await simon.evaluate("document.querySelector('#level').textContent==='1' && document.querySelectorAll('.pad:not(:disabled)').length===4");
    if(simonPlays)break;
    await delay(100);
  }
  if(!simonPlays){
    console.log('Simon state:',await simon.evaluate("JSON.stringify({level:document.querySelector('#level')?.textContent,message:document.querySelector('#message')?.textContent,detail:document.querySelector('#detail')?.textContent,start:document.querySelector('#start')?.textContent,enabled:document.querySelectorAll('.pad:not(:disabled)').length,hidden:document.hidden,errors:window.onerror?.toString()})"));
    throw Error('Candy Simon Says did not play the first pattern and accept input');
  }
  console.log('✓ Candy Simon Says starts a pattern and enables all four pads.');

  const match=await navigate(site+'/candy-match/');
  const matchReady=await match.evaluate("document.querySelectorAll('#board .card').length===12 && !document.querySelector('#hint').disabled");
  if(!matchReady)throw Error('Candy Match did not deal twelve playable cards');
  await match.evaluate("document.querySelector('#board .card').click()");
  const flipped=await match.evaluate("document.querySelectorAll('#board .card.flipped').length===1");
  if(!flipped)throw Error('Candy Match card did not flip when tapped');
  console.log('✓ Candy Match creates, flips and reveals matching-card game pieces.');

  // The new arcade must be fully interactive, not just a styled landing page.
  const arcade=await navigate(site+'/goo-rush/');
  const arcadeReady=await arcade.evaluate("!!document.querySelector('[data-mode=duel]') && !!document.querySelector('#start')");
  if(!arcadeReady)throw Error('Goo Rush mode selector or Start button is missing');
  await arcade.evaluate("document.querySelector('#start').click()");
  const soloReady=await arcade.evaluate("document.querySelectorAll('#tiles0 .tile').length===16 && !!document.querySelector('#target0')");
  if(!soloReady)throw Error('Goo Rush solo game did not create sixteen interactive candies');
  await arcade.evaluate("(()=>{const wanted=document.querySelector('#target0').textContent;const correct=[...document.querySelectorAll('#tiles0 .tile')].find(b=>b.textContent===wanted);correct.click()})()");
  const soloScore=await arcade.evaluate("Number(document.querySelector('#score0').textContent.replace(/,/g,''))");
  if(soloScore<=0)throw Error('Goo Rush correct candy did not award points');
  await arcade.evaluate("document.querySelector('[data-mode=duel]').click();document.querySelector('#start').click()");
  const duelReady=await arcade.evaluate("document.querySelectorAll('.player').length===2 && document.querySelectorAll('#tiles1 .tile').length===9");
  if(!duelReady)throw Error('Goo Rush local multiplayer did not create two independent boards');
  await arcade.evaluate("(()=>{const wanted=document.querySelector('#target1').textContent;const correct=[...document.querySelectorAll('#tiles1 .tile')].find(b=>b.textContent===wanted);correct.click()})()");
  const rivalScore=await arcade.evaluate("Number(document.querySelector('#score1').textContent.replace(/,/g,''))");
  if(rivalScore<=0)throw Error('Goo Rush player 2 score did not update');
  console.log('✓ Goo Rush solo and 2-player candy gameplay work in Chrome.');

  // The homepage nonsense button must generate a genuinely different result.
  const home=await navigate(site+'/');
  const nonsenseReady=await home.evaluate("!!document.querySelector('#nonsense .nonsense-display p')");
  if(!nonsenseReady)throw Error('Homepage nonsense generator did not mount');
  const beforeNonsense=await home.evaluate("document.querySelector('#nonsense .nonsense-display p').textContent");
  await home.evaluate("document.querySelector('.nonsense-generate').click()");
  const afterNonsense=await home.evaluate("document.querySelector('#nonsense .nonsense-display p').textContent");
  if(beforeNonsense===afterNonsense)throw Error('Nonsense generator repeated its previous story');
  console.log('✓ Candy Land nonsense generator creates a new non-repeating story.');

  if(testErrors.length)throw Error('Browser runtime errors: '+testErrors.join(' ; '));
  console.log('✓ All After Dark browser interaction tests passed.');
} finally{
  proc.kill('SIGTERM');server.close();
  // Chrome may still be flushing its profile; cleanup should never fail a passing site test.
  try { fs.rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:150}); }
  catch (error) { console.warn('Chrome test profile cleanup was skipped:',error.message); }
}
async function checkLab(evaluate){
  const enter=await evaluate("!!document.querySelector('#enter')");
  if(!enter)throw Error('Clue Compass adult entry missing');
  await evaluate("document.querySelector('#enter').click()");
  const gate=await evaluate("!document.querySelector('#gate')");
  if(!gate)throw Error('Clue Compass entry did not work');
  const q=await evaluate("document.querySelector('#startquiz')?.click();!!document.querySelector('#qbox')");
  if(!q)throw Error('Clue Compass quiz failed to start');
  console.log('✓ Clue Compass entry and quiz started.');
}
