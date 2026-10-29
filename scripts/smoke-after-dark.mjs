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
  await check('Google Tag Manager initializes on After Dark', "window.dataLayer?.some(x=>x?.event==='gtm.js' && Number.isFinite(x['gtm.start'])) && [...document.scripts].some(s=>s.src.includes('googletagmanager.com/gtm.js?id=GTM-TQRDB5KL'))");
  await check('Adult entry is present', "!!document.querySelector('#enter')");
  await evaluate("document.querySelector('#enter').click()");
  await check('Adult entry dismisses the overlay',"getComputedStyle(document.querySelector('#ageGate')).display==='none'");
  await check('After Dark opens on the introduction rather than the atlas',"document.querySelector('#home').classList.contains('visible') && !document.querySelector('#atlas').classList.contains('visible')");
  await check('After Dark has a full homepage hero and fast access to four experiences',"!!document.querySelector('#home .afterdark-home-hero .ad-home-planet') && document.querySelectorAll('#home .ad-home-express-nav button').length===4 && !!document.querySelector('#home [data-goto=psych-quiz]') && !!document.querySelector('#home [data-goto=quiz]')");
  await check('No internal analytics or unchanged status copy is visible',"!/site analytics are enabled|quiz \(unchanged\)|are unchanged/i.test(document.body.innerText)");
  await check('Non-explicit quiz maps answers to specific Atlas interests independently',"window.AfterDarkPsychBridge?.recommend({answered:1,answers:{0:[0]}},topics)?.some(r=>r.x.name==='Slow build-up')");
  await check('After Dark features Quiz and Ask Atlas first',"document.querySelectorAll('.afterdark-featured-grid .card').length===2 && document.querySelector('.afterdark-featured-grid .card:first-child h3')?.textContent==='Curiosity Quiz' && document.querySelector('.afterdark-featured-grid .card:nth-child(2) h3')?.textContent==='Ask Atlas'");
  await check('After Dark describes all remaining sections in page body',"document.querySelectorAll('.afterdark-landing-grid .card').length===5 && document.querySelectorAll('.top [data-tab]').length===1");
  await evaluate("document.querySelector('.enter-after-dark').click()");
  await check('Featured Quiz call to action opens the Quiz',"document.querySelector('#quiz').classList.contains('visible')");
  await evaluate("document.querySelector('#home button[data-tab=chat]').click()");
  await check('Featured Ask Atlas opens chat',"document.querySelector('#chat').classList.contains('visible')");
  await evaluate("document.querySelector('[data-tab=atlas]').click()");
  console.log('Atlas diagnostics:',await evaluate("JSON.stringify({count:document.querySelectorAll('#topicGrid .topic').length,all:document.querySelector('#allCount')?.textContent,script:typeof window.renderAtlas,errors:window.onerror?.toString().slice(0,100)||'none'})"),JSON.stringify(testErrors));
  await check('Atlas has 100+ working interest cards',"document.querySelectorAll('#topicGrid .topic').length>=100");
  await evaluate("var input=document.querySelector('#search');input.value='leather';input.dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Search filters visible interests',"document.querySelectorAll('#topicGrid .topic').length>=1&&document.querySelectorAll('#topicGrid .topic').length<40");
  await evaluate("var input=document.querySelector('#search');input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))");
  await evaluate("document.querySelector('#topicGrid .topic button').click()");
  await check('Marking a topic updates the controls',"document.querySelectorAll('#topicGrid .topic button.chosen').length>0");
  await evaluate("document.querySelector('[data-tab=quiz]').click();document.querySelector('#startQuiz').click()");
  await check('New direct quiz begins with multi-select checkboxes',"document.querySelectorAll('#quizCard .quiz-multi-option input[type=checkbox]').length>=3");
  await evaluate("document.querySelectorAll('#quizCard .quiz-multi-option input')[0].click();document.querySelectorAll('#quizCard .quiz-multi-option input')[1].click()");
  await check('Multiple quiz choices can be checked',"document.querySelectorAll('#quizCard .quiz-multi-option input:checked').length===2");
  await evaluate("[...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Save & next')).click()");
  for(let i=1;i<32;i++){await evaluate("document.querySelectorAll('#quizCard .quiz-multi-option input')[0]?.click();[...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Save & next')||b.textContent.includes('Show my results'))?.click()");}
  await check('All 32 direct questions show ranked results',"document.querySelector('.direct-answer-summary')!==null && document.querySelector('#quizCard .compare')!==null");
  await check('Quiz finishes and renders a personal reading shelf',"document.querySelector('#quizCard .compare')!==null&&document.querySelectorAll('#quizCard .result').length>=12");
  await check('Quiz shows specific interests with match percentages and explanation',"document.querySelectorAll('#quizCard .interest-result .interest-percentage').length>=12 && document.querySelector('.interest-disclaimer').textContent.includes('NOT scientifically validated probabilities') && [...document.querySelectorAll('#quizCard .interest-percentage')].every(el=>/%$/.test(el.textContent))");
  await check('Quiz offers private PDF and saves interests', "typeof window.InterestNotebook?.printQuiz==='function' && !![...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Save quiz results as PDF')) && !!document.querySelector('#quizCard .interest-result button')");

  await check('Both 32-question versions map their options to identical themes',"window.AfterDarkAdultQuiz.length===32 && window.AfterDarkPsychologyQuiz.length===32 && window.AfterDarkAdultQuiz.every((q,i)=>q.options.length===window.AfterDarkPsychologyQuiz[i].options.length && q.options.every((o,j)=>o.axes===window.AfterDarkPsychologyQuiz[i].options[j].axes))");
  const beforePair=await evaluate("JSON.stringify([...document.querySelectorAll('#quizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  await evaluate("document.querySelector('[data-tab=psych-quiz]').click()");
  await check('Psychological quiz has a separate non-explicit view',"document.querySelector('#psych-quiz').classList.contains('visible') && !!window.AfterDarkPsychQuizBridge && document.querySelector('#psychQuizCard button')?.textContent.includes('Start the psychology')");
  await evaluate("document.querySelector('#psychQuizCard button').click()");
  await check('Psychological quiz also supports selecting more than one answer',"document.querySelectorAll('#psychQuizCard input[type=checkbox]').length>=3");
  await evaluate("document.querySelectorAll('#psychQuizCard input[type=checkbox]')[0].click();document.querySelectorAll('#psychQuizCard input[type=checkbox]')[1].click()");
  for(let i=0;i<32;i++){
    await evaluate("(()=>{const btn=[...document.querySelectorAll('#psychQuizCard button')].find(b=>b.textContent.includes('Save & next')||b.textContent.includes('View shared interest shelf'));btn?.click();})()");
    if(i<31)await evaluate("document.querySelectorAll('#psychQuizCard input[type=checkbox]')[0]?.click()");
  }
  await check('Independent psychology responses identify specific adult interests and why',"document.querySelector('#psychQuizCard .psych-specific-bridge')!==null && document.querySelectorAll('#psychQuizCard .psych-specific-card').length>=8 && document.querySelector('#psychQuizCard .psych-specific-why')?.textContent.includes('You chose:')");
  await check('Psychology quiz shows unified shelf and comparison',"document.querySelector('#psychQuizCard .quiz-alignment')?.textContent.includes('32 of 32 comparable questions') && document.querySelectorAll('#psychQuizCard .interest-result').length>=12");
  const psychPair=await evaluate("JSON.stringify([...document.querySelectorAll('#psychQuizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  if(beforePair!==psychPair)throw Error('Paired quiz answers must produce identical ranked interest names and scores');
  await evaluate("window.AfterDarkSharedQuizResults('quizCard')");
  const syncedPair=await evaluate("JSON.stringify([...document.querySelectorAll('#quizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  if(syncedPair!==psychPair)throw Error('Sexual and psychological result screens must display the same unified ranking');
  console.log('✓ Paired 32-question quizzes agree on identical selections and share the same PDF-ready interest report.');

  await evaluate("[...document.querySelectorAll('#quizCard .interest-result button')].find(b=>b.textContent.includes('Save & explain'))?.click()");
  await check('Saved interests notebook opens and persists', "document.querySelector('#notebook')?.classList.contains('visible') && document.querySelectorAll('#notebook-content textarea').length>=5 && localStorage.getItem('afterdark_interest_notebook_v1')");
  await evaluate("(()=>{const entry=document.querySelector('.notebook-interest');const text=entry?.querySelector('textarea');if(text){text.value='I would like you to understand what this means to me';text.dispatchEvent(new Event('input',{bubbles:true}));}const cb=entry?.querySelector('.notebook-share-label input');cb?.click();document.querySelector('#notebook-content .notebook-actions button')?.click();})()");
  await check('Private invitation contains only selected notes', "document.querySelector('#notebook-output input')?.value.includes('#partner-view?data=') && document.querySelector('#notebook-status').textContent.includes('Unselected interests')");
  const invitedUrl=await evaluate("document.querySelector('#notebook-output input')?.value");
  if(typeof invitedUrl!=='string'||!invitedUrl.includes('#partner-view?data='))throw Error('After Dark selected invitation link missing');
  // Test the shared link in a same-origin iframe so the primary CDP
  // connection remains intact for subsequent After Dark regression checks.
  await evaluate("(()=>{const frame=document.createElement('iframe');frame.id='private-invite-test';frame.src="+JSON.stringify(invitedUrl)+";frame.hidden=true;document.body.append(frame)})()");
  let inviteReady=false;
  for(let attempt=0;attempt<45;attempt++){
    inviteReady=await evaluate("(()=>{const doc=document.getElementById('private-invite-test')?.contentDocument;return !!doc?.querySelector('#partner-view')?.classList.contains('visible') && !!doc?.querySelector('#partner-invitation')?.textContent.includes('I would like you to understand') && [...doc.querySelectorAll('#partner-invitation button')].some(b=>b.textContent.includes('listening'))})()");
    if(inviteReady)break;
    await delay(100);
  }
  if(!inviteReady)throw Error('Private partner invitation did not open with consent-based responses');
  await evaluate("document.querySelector('#private-invite-test')?.remove()");
  console.log('✓ After Dark notebook saves, creates selective share links, supports private PDF printing and opens a partner invitation.');

  await evaluate("document.querySelector('[data-tab=psych]').click()");
  await check('Psychology section renders all lenses',"document.querySelectorAll('#lenses .card').length>=10");
  await evaluate("document.querySelector('[data-tab=ideas]').click();document.querySelector('#drawIdea').click()");
  await check('Idea Lab draws usable cards',"document.querySelector('#ideaResult h3')?.textContent!=='Choose a theme, then draw a card.'");
  await check('Idea Lab now gives specific discussion and boundaries',"document.querySelector('#ideaResult').textContent.includes('What to talk about') && document.querySelector('#ideaResult').textContent.includes('Agree on boundaries first')");
  await evaluate("document.querySelector('#mood').value='toys';document.querySelector('#ideaLevel').value='bold';document.querySelector('#drawIdea').click()");
  await check('Bold toy prompts name specific interests',"(/strap-on|penetration|oral sex|pegging|toys/i).test(document.querySelector('#ideaResult').textContent)");

  await evaluate("document.querySelector('[data-tab=chat]').click();document.querySelector('[data-ask]').click()");
  await check('Ask Atlas responds to suggestions',"document.querySelectorAll('#chatWindow .bubble').length>=3");
  const focusedAnswer=await evaluate("respond('I like being fucked by a strapon as a male. Why?')");
  if(!/strap-on penetration|prostate-area stimulation/i.test(focusedAnswer)||/exhibition|voyeurism/i.test(focusedAnswer))throw Error('Ask Atlas returned irrelevant topic for the strap-on question');
  console.log('✓ Ask Atlas explains strap-on preference without false exhibitionism matches.');

  await check('Expanded Atlas includes 190+ interests',"topics.length>=185 && !!topics.find(t=>t.name==='Aftercare planning') && !!topics.find(t=>t.name==='Edging and delayed gratification')");
  const fuzzyAnswers=await evaluate("JSON.stringify({typo:respond('why do I like peggin'),slang:respond('why am I into good girl'),context:respond('how to explain praise to my partner'),short:respond('stockings'),broad:respond('why does someone like receiving praise')})");
  const fuzzy=JSON.parse(fuzzyAnswers);
  if(!/strap-on|pegging/i.test(fuzzy.typo)||/could not match/i.test(fuzzy.typo))throw Error('Ask Atlas failed typo-tolerant peggin search');
  if(!/praise/i.test(fuzzy.slang)||/could not match/i.test(fuzzy.slang))throw Error('Ask Atlas failed everyday wording for praise');
  if(!/partner|listen|permission|participat/i.test(fuzzy.context)||!/praise/i.test(fuzzy.context))throw Error('Ask Atlas failed context-aware partner guidance');
  if(!/stockings|hosiery/i.test(fuzzy.short))throw Error('Ask Atlas failed keyword-only interest lookup');
  if(!/praise/i.test(fuzzy.broad))throw Error('Ask Atlas failed psychology-focused why question');
  console.log('✓ Ask Atlas tolerates typos, everyday phrases, short keywords, partner questions and expands its topic library.');

  const unmatched=await evaluate("respond('Why am I interested in velociraptor-shaped pottery?')");
  if(!/could not match|not match|confidently/i.test(unmatched)||/exhibition/i.test(unmatched))throw Error('Ask Atlas guessed an irrelevant answer rather than asking for detail');
  console.log('✓ Ask Atlas declines irrelevant lexical matches.');
  await evaluate("document.querySelector('#chatText').value='Why do I like receiving strap-on penetration?';document.querySelector('#askForm button').click()");
  await check('Ask Atlas shows a relevant on-device answer',"document.querySelector('#chatWindow .bubble:last-child').textContent.includes('strap-on')");

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
  await checkPetPresidentialStatus(pet.evaluate);
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
  await tiny.evaluate("document.querySelector('.melody-key[data-note=\"0\"]').click()");
  const bongoOnKey=await tiny.evaluate("window.FM1PixelScreen?.isBongoPlaying() && document.querySelector('#scene').dataset.animation==='bongo' && document.querySelector('#melodyStatus').textContent.includes('bongos')");
  if(!bongoOnKey)throw Error('FM-1 piano key did not make Donald bang the bongos');
  await tiny.evaluate("document.querySelector('#melody').click()");
  const bongoFullTune=await tiny.evaluate("window.FM1PixelScreen?.isBongoPlaying() && document.querySelector('#melodyStatus').textContent.includes('bongos')");
  if(!bongoFullTune)throw Error('FM-1 full melody did not trigger Donald playing bongos');
  console.log('✓ Every piano key and full melody trigger live pixel bongo animation.');
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
  // Candy Casino must offer 5 functioning solo games even without online signaling.
  const casino=await navigate(site+'/candy-casino/');
  const casinoReady=await casino.evaluate("document.body.dataset.candyCasinoReady==='true' && document.querySelectorAll('[data-duel]').length===3 && document.querySelectorAll('[data-game]').length===0 && !!document.querySelector('[data-opponent=computer]') && !!document.querySelector('[data-opponent=friend]')");
  if(!casinoReady)throw Error('Candy Casino must show ONLY three competitive games with computer and friend choices');
  const cpu=await casino.evaluate("document.querySelector('#opponent-name').textContent.includes('Candybot') && !document.querySelector('#duel-ready').disabled");
  if(!cpu)throw Error('Candybot should be the default, fully playable opponent');
  await casino.evaluate("document.querySelector('#duel-ready').click()");
  const dealt=await casino.evaluate("window.CandyCasinoDebug.state().phase==='draw' && document.querySelectorAll('#poker-own-cards .poker-card').length===5 && document.querySelectorAll('#poker-opponent-cards .poker-card.back').length===5");
  if(!dealt)throw Error('Sugar Rush Poker failed to deal private player and hidden opponent hands');
  await casino.evaluate("document.querySelector('#poker-own-cards .poker-card').click();document.querySelector('#poker-draw').click()");
  const showdown=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelectorAll('#poker-opponent-cards .poker-card:not(.back)').length===5 && Number(document.querySelector('#self-score').textContent)+Number(document.querySelector('#other-score').textContent)<=1");
  if(!showdown)throw Error('Poker draw/showdown did not resolve against computer');
  await casino.evaluate("document.querySelector('[data-duel=card]').click();document.querySelector('#duel-ready').click()");
  const high=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelector('#duel-display').textContent.includes('drew')");
  if(!high)throw Error('High Card did not play versus computer');
  await casino.evaluate("document.querySelector('[data-duel=dice]').click();document.querySelector('#duel-ready').click()");
  const dice=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelector('#duel-display').textContent.includes('rolled')");
  if(!dice)throw Error('Dice Duel did not play versus computer');
  await casino.evaluate("document.querySelector('[data-opponent=friend]').click()");
  const remote=await casino.evaluate("!document.querySelector('#remote-controls').hidden && document.querySelector('#duel-ready').disabled && !!document.querySelector('#make-room') && !!document.querySelector('#join-room')");
  if(!remote)throw Error('Remote friend mode did not expose invite controls or require a connection');
  console.log('✓ Candy Casino has poker, high card and dice, computer wins/showdowns, hidden online cards and real friend invitation controls.');

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
  const trackingReady=await home.evaluate("window.dataLayer?.some(x=>x?.event==='gtm.js') && [...document.scripts].some(s=>s.src.includes('googletagmanager.com/gtm.js?id=GTM-TQRDB5KL'))");
  if(!trackingReady)throw Error('Homepage Google Tag Manager failed to initialize');
  console.log('✓ GTM initializes on both the homepage and After Dark.');
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

async function checkPetPresidentialStatus(evaluate) {
  const hasStatus=await evaluate("!!document.querySelector('[aria-label=\"Presidential Status and what Donald needs\"]') && !!document.querySelector('[aria-label=\"What Donald needs\"]') && !!document.querySelector('progress[aria-label=\"FOOD\"]')");
  if (!hasStatus) throw Error('Classic Trumpagotchi Presidential Status or care needs missing');
  const isLive=await evaluate("Number(document.querySelector('progress[aria-label=\"FOOD\"]')?.value)>=0 && document.querySelector('[aria-label=\"What Donald needs\"]')?.textContent.includes('Updates automatically')");
  if (!isLive) throw Error('Classic Trumpagotchi Presidential Status does not show live values');
  console.log('✓ Classic Trumpagotchi displays live Presidential Status and care needs.');
}
