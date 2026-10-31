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
  // Actually load and animate Candy Pulse in headless Chrome. Static syntax checks
  // previously missed a missing reset() that crashed every render frame.
  const pulse=await navigate(site+'/music-visualizer/');
  const pulseReady=await pulse.evaluate("Boolean(window.CandyPulseGeometry?.render)&&typeof window.CandyPulseGeometry.reset==='function'&&window.CandyPulseDebug?.geometryReady&&window.CandyPulseDebug.frameCount>=1");
  if(!pulseReady)throw Error('Pulse regression: geometry engine did not initialize');
  await delay(500);
  const visualReady=await pulse.evaluate("(()=>{const c=document.querySelector('#canvas');return window.CandyPulseDebug.frameCount>=5&&c.width>100&&c.height>100&&!!c.getContext('2d').getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data[3]})()");
  if(!visualReady)throw Error('Pulse regression: animated canvas did not render visible frames');
  await pulse.evaluate("document.querySelector('#mode').value='vortex';document.querySelector('#mode').dispatchEvent(new Event('change'));document.querySelector('#surprise').click();document.querySelector('#reset-look').click();document.querySelector('#cast-toggle').click()");
  const controlsReady=await pulse.evaluate("(()=>{const x=window.CandyPulseDebug;return x.geometryReady&&x.mode==='auto'&&!document.querySelector('#cast-tools').hidden&&document.querySelector('#tv-start')&&document.querySelector('#cast-toggle').getAttribute('aria-expanded')==='true'})()");
  if(!controlsReady)throw Error('Pulse regression: geometry controls or TV casting panel malfunction');
  await pulse.evaluate("document.querySelector('#demo').click()");
  await delay(500);
  const demoReady=await pulse.evaluate("window.CandyPulseDebug.source==='demo'&&document.querySelector('#status').textContent.includes('Demo beat looping')");
  if(!demoReady)throw Error('Pulse regression: demo beat does not start');
  await pulse.evaluate("document.querySelector('#stop').click()");
  const stopped=await pulse.evaluate("window.CandyPulseDebug.source==='none'");
  if(!stopped)throw Error('Pulse regression: Stop did not turn off audio source');
  console.log('✓ Candy Pulse renders, cycles geometry modes, opens Cast/TV controls and plays/stops demo audio in Chrome.');
  const tv=await navigate(site+'/music-visualizer/tv.html');
  if(!await tv.evaluate("!!document.querySelector('#join')&&!!document.querySelector('#code')&&typeof window.RTCPeerConnection==='function'"))
    throw Error('Pulse regression: TV WebRTC receiver page is not available');
  console.log('✓ Candy Pulse standalone TV receiver loads in Chrome.');
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
  await check('After Dark has its illustrated discovery logo and quick access to four experiences',"!!document.querySelector('#home .afterdark-home-hero .ad-discovery-image') && document.querySelectorAll('#home .ad-home-express-nav button').length===4 && !!document.querySelector('#home [data-goto=psych-quiz]') && !!document.querySelector('#home [data-goto=quiz]')");
  await check('After Dark is visually illustrated throughout',"document.querySelectorAll('#home .ad-card-visual').length===10 && document.querySelectorAll('.ad-section-art-banner>img').length>=7 && document.querySelector('#home .ad-discovery-image')?.getAttribute('src').includes('discovery-emblem.svg')");
  await check('Curved Candy Land goo decorates After Dark throughout',"window.AfterDarkCandyGoo?.count()>=20 && document.querySelector('.top>.ad-liquid-goo') && document.querySelector('.afterdark-home-hero>.ad-liquid-goo') && document.querySelector('.ad-practical-guides-teaser>.ad-liquid-goo') && document.querySelectorAll('.ad-section-art-banner>.ad-liquid-goo').length>=7 && document.querySelectorAll('.afterdark-feature-card>.ad-liquid-goo').length>=2 && document.querySelectorAll('.howto-guide-card>.ad-liquid-goo').length>=16 && document.querySelector('.footer>.ad-liquid-goo')");
  await check('The goo is a real curved liquid silhouette with glaze instead of rectangular bars',"document.querySelector('.ad-liquid-goo path[data-goo-outline]')?.getAttribute('d').includes('C 925,107 921,143 901,150') && document.querySelectorAll('.ad-liquid-goo linearGradient').length>=2 && !document.querySelector('.ad-home-goo')");
  await check('Decorative goo cannot intercept any clicks or controls',"Array.from(document.querySelectorAll('.ad-liquid-goo')).every(svg=>getComputedStyle(svg).pointerEvents==='none' && svg.getAttribute('aria-hidden')==='true')");
  await check('Candy goo header and hero preserve space for scrolling and controls',"parseInt(getComputedStyle(document.querySelector('.top')).marginBottom,10)>=60 && parseInt(getComputedStyle(document.querySelector('.afterdark-home-hero')).marginBottom,10)>=70");

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
  await check('Body-fluid, semen, urine, flatulence, sweat and adult lactation topics are individually available',
    "(()=>{const q=window.AfterDarkAdultQuiz;const t=window.AfterDarkNotebookBridge.getTopics();return q.filter(x=>x.id>=63).length===7&&[63,64,65,66,67,68,69].every(id=>q.some(x=>x.id===id))&&['Semen ingestion interest','Consensual semen-sharing fantasy','Urine play curiosity','Flatulence scent interest','Sweat and natural body scent interest','Adult lactation interest'].every(name=>t.some(x=>x.name===name))})()");
  await check('Sexual preferences use 15 themed sections and keep 69 separate questions',
    "(()=>{const p=window.AfterDarkGroupedQuizUI.prepare(window.AfterDarkAdultQuiz);return p.length===15&&p.flatMap(x=>x.indexes).length===69&&document.querySelector('#quizCard .quiz-group-heading')!==null&&document.querySelectorAll('#quizCard .quiz-group-question').length>=2})()");
  await evaluate("document.querySelectorAll('#quizCard .quiz-group-question[open] .quiz-multi-option input')[0].click();document.querySelectorAll('#quizCard .quiz-group-question[open] .quiz-multi-option input')[1].click()");
  await check('Two distinct options save inside one specific question',
    "(()=>{const p=window.AfterDarkDirectQuizBridge.exportState();return p.multiAnswers[0].length===2&&p.qIndex===0&&document.querySelectorAll('#quizCard .quiz-group-question[open] .quiz-multi-option.selected').length===2})()");
  await check('Sexual preferences keep advanced tools behind a single closed menu',
    "(()=>{const x=document.querySelector('#quiz .ad-focus-tools');return !!x&&!x.querySelector('.ad-focus-menu').open&&x.querySelector('.ad-focus-actions')?.textContent.includes('Save & exit')})()");
  await evaluate("([...document.querySelectorAll('[data-quiz-tools=direct] .ad-primary-actions button')].find(b=>b.textContent.includes('Save & exit'))).click()");
  await check('Save and leave preserves independent selections',
    "document.querySelector('#home').classList.contains('visible')&&JSON.parse(localStorage.getItem('afterdark_direct_quiz_v6')).multiAnswers[0].length===2");
  await evaluate("document.querySelector('#afterdark-resume-place').click()");
  await check('Resume reopens the same section with both selected answers',
    "document.querySelector('#quiz').classList.contains('visible')&&window.AfterDarkDirectQuizBridge.getProgress().position===0&&document.querySelectorAll('#quizCard .quiz-group-question[open] input:checked').length===2");
  await evaluate("document.querySelectorAll('#quizCard .quiz-group-question')[1].querySelector(':scope > summary').click()");
  await check('Opening second question in a section saves the precise resume position',
    "window.AfterDarkDirectQuizBridge.getProgress().position===1&&document.querySelector('#quizCard [data-question-index=\"1\"]').open");
  await evaluate("document.querySelector('#quizCard .quiz-group-footer .quiz-question-more summary').click();document.querySelector('#quizCard .quiz-group-footer .quiz-secondary-link').click()");
  await check('Previewing results never marks grouped quiz complete',
    "window.AfterDarkDirectQuizBridge.getProgress().position===1&&!window.AfterDarkDirectQuizBridge.getProgress().complete&&!!document.querySelector('#quizCard .quiz-preview-return')");
  await evaluate("([...document.querySelectorAll('[data-quiz-tools=direct] .ad-focus-menu-inner>button')].find(b=>b.textContent.includes('Resume saved'))).click()");
  await check('Resume reopens exact question after preview',
    "window.AfterDarkDirectQuizBridge.getProgress().position===1&&!!document.querySelector('#quizCard [data-question-index=\"1\"][open]')&&!document.querySelector('#quizCard .quiz-preview-return')");
  await evaluate("(()=>{const t=document.querySelector('#customInterestText');t.value='A quiet ASMR whispering experience';t.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#customInterestIntent').value='receive';document.querySelector('#customInterestIntent').dispatchEvent(new Event('change',{bubbles:true}))})()");
  await check('Personal ideas autosave with intended role',
    "(()=>{const v=window.AfterDarkDirectQuizBridge.exportState();return v.questionVersion===5&&v.customThings.includes('ASMR whispering')&&v.customIntent==='receive'})()");
  await evaluate("window.confirm=()=>true;([...document.querySelectorAll('[data-quiz-tools=direct] .ad-focus-menu-inner>button')].find(b=>b.textContent.includes('Reset this quiz'))).click()");
  await check('Reset clears the whole direct quiz but leaves the other quiz untouched',
    "(()=>{const d=window.AfterDarkDirectQuizBridge.exportState();return d.qIndex===0&&d.customThings===''&&d.customIntent==='unsure'&&Object.values(d.multiAnswers).every(a=>Array.isArray(a)&&!a.length)})()");
  await evaluate("(()=>{const t=document.querySelector('#customInterestText');t.value='I want to try a private whispering experience\\nI would like to talk about strap-on play';t.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#customInterestIntent').value='together';document.querySelector('#customInterestIntent').dispatchEvent(new Event('change',{bubbles:true}))})()");
  await check('Unlisted user interests stay separate from suggested results',
    "(()=>{const x=window.AfterDarkCanonicalReport.buildData();return x.direct.personalIdeas.length===2&&x.direct.personalIdeas.every(i=>i.intent==='together')})()");
  await evaluate("(()=>{const state=window.AfterDarkDirectQuizBridge.exportState();state.qIndex=window.AfterDarkAdultQuiz.findIndex(q=>q.dropdown);window.AfterDarkDirectQuizBridge.importState(state)})()");
  await check('Diverse adult-media dropdown is inside a normal grouped question',
    "window.AfterDarkAdultQuiz.length===69&&window.AfterDarkAdultQuiz.filter(q=>q.dropdown).length===1&&!!document.querySelector('#quizCard .quiz-group-question[open] .quiz-media-dropdown')&&document.querySelectorAll('#quizCard .quiz-media-group .quiz-multi-option').length>=55");
  await evaluate("(()=>{document.querySelector('#quizCard .quiz-media-dropdown summary').click();const t=document.querySelector('#quizCard .quiz-media-search');t.value='group';t.dispatchEvent(new Event('input',{bubbles:true}))})()");
  await check('Porn category dropdown filters multiple options',
    "document.querySelectorAll('#quizCard .quiz-media-group .quiz-multi-option:not([hidden])').length>=2&&document.querySelectorAll('#quizCard .quiz-media-group .quiz-multi-option[hidden]').length>20");
  await evaluate("(()=>{const t=document.querySelector('#quizCard .quiz-media-search');t.value='';t.dispatchEvent(new Event('input',{bubbles:true}));const labels=[...document.querySelectorAll('#quizCard .quiz-media-group .quiz-multi-option')];labels.find(x=>x.textContent.includes('Consensual threesomes')).querySelector('input').click();labels.find(x=>x.textContent.includes('group sex / orgy scenes')).querySelector('input').click();document.querySelector('#quizCard .quiz-group-question[open] .quiz-question-intent input[value=fantasy]').click()})()");
  await check('Adult-media categories save as fantasy without implying participation',
    "(()=>{const x=window.AfterDarkDirectQuizBridge.exportState(),i=window.AfterDarkAdultQuiz.findIndex(q=>q.dropdown);return x.multiAnswers[i].length===2&&x.questionIntents[i]==='fantasy'})()");
  await evaluate("(()=>{const state=window.AfterDarkDirectQuizBridge.exportState();state.qIndex=window.AfterDarkAdultQuiz.findIndex(q=>q.id===60);window.AfterDarkDirectQuizBridge.importState(state)})()");
  await check('Partner swapping belongs to Watching and group experiences and offers three independent gender choices',
    "(()=>{const d=document.querySelector('#quizCard');const q=d.querySelector('.quiz-group-question[open]');const n=[...q.querySelectorAll('.quiz-multi-option')].map(x=>x.textContent);return d.querySelector('.quiz-group-heading h2')?.textContent==='Watching & group experiences'&&q.dataset.questionId==='60'&&n.some(x=>x.includes('same gender'))&&n.some(x=>x.includes('different gender'))&&n.some(x=>x.includes('either or multiple genders'))})()");
  await evaluate("(()=>{const rows=[...document.querySelectorAll('#quizCard .quiz-group-question[open] .quiz-multi-option')];['same gender','different gender','either or multiple genders'].forEach(x=>rows.find(y=>y.textContent.includes(x)).querySelector('input').click());document.querySelector('#quizCard .quiz-group-question[open] .quiz-question-intent input[value=explore]').click()})()");
  await check('Partner gender preferences save individually without overwriting fantasy/exploration intent',
    "(()=>{const i=window.AfterDarkAdultQuiz.findIndex(q=>q.id===60),d=window.AfterDarkDirectQuizBridge.exportState();return d.multiAnswers[i].length===3&&d.questionIntents[i]==='explore'})()");
  await evaluate("(()=>{const state=window.AfterDarkDirectQuizBridge.exportState();state.qIndex=0;state.questionIntents[0]='explore';window.AfterDarkDirectQuizBridge.importState(state)})()");
  await check('Fantasy-versus-exploration selection is available separately in every question',
    "document.querySelectorAll('#quizCard .quiz-group-question .quiz-question-intent').length===4&&window.AfterDarkDirectQuizBridge.exportState().questionIntents[0]==='explore'");
  await evaluate("(()=>{const s=window.AfterDarkDirectQuizBridge.exportState();window.AfterDarkAdultQuiz.forEach((q,i)=>{if(!s.multiAnswers[i]?.length)s.multiAnswers[i]=[0]});s.qIndex=window.AfterDarkAdultQuiz.length;window.AfterDarkDirectQuizBridge.importState(s)})()");
  await check('All 69 direct questions show ranked results',"document.querySelector('.direct-answer-summary')!==null && document.querySelector('#quizCard .compare')!==null");
  await check('Quiz finishes and renders a personal reading shelf',"document.querySelector('#quizCard .compare')!==null&&document.querySelectorAll('#quizCard .result').length>=12");
  await check('Quiz shows specific interests with match percentages and explanation',"document.querySelectorAll('#quizCard .interest-result .interest-percentage').length>=12 && document.querySelector('.interest-disclaimer').textContent.includes('NOT scientifically validated probabilities') && [...document.querySelectorAll('#quizCard .interest-percentage')].every(el=>/%$/.test(el.textContent))");
  await check('Quiz offers private PDF and saves interests', "typeof window.InterestNotebook?.printQuiz==='function' && !![...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Save quiz results as PDF')) && !!document.querySelector('#quizCard .interest-result button')");
  await check('Custom ideas appear in personal results and detailed PDF, never counted as inferred preferences',
    "(()=>{const d=window.AfterDarkCanonicalReport.buildData(),p=window.AfterDarkDetailedReport.build();return d.direct.personalIdeas.length===2&&document.querySelector('#quizCard .custom-interest-results')?.textContent.includes('whispering')&&p.querySelectorAll('.report-personal-idea').length===2&&p.textContent.includes('Your stated intention')})()");
  await check('Specific acts selected in revised 32 questions are recorded independently of psychological guesses',
    "(()=>{const d=window.AfterDarkCanonicalReport.buildData();return d.direct.specificSelections.length>=32&&d.direct.specificSelections.some(x=>x.text)&&d.interests.some(x=>x.specificSelected>0)})()");


  await check('All 32 original paired questions retain corresponding psychological axes',"window.AfterDarkAdultQuiz.length===69 && window.AfterDarkPsychologyQuiz.length===32 && window.AfterDarkAdultQuiz.filter(q=>q.id<=32).every(q=>q.options.length===window.AfterDarkPsychologyQuiz[q.id-1].options.length && q.options.every((o,j)=>o.axes===window.AfterDarkPsychologyQuiz[q.id-1].options[j].axes))");
  const beforePair=await evaluate("JSON.stringify([...document.querySelectorAll('#quizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  await evaluate("document.querySelector('[data-tab=psych-quiz]').click()");
  await check('Psychological quiz has a separate non-explicit view',"document.querySelector('#psych-quiz').classList.contains('visible') && !!window.AfterDarkPsychQuizBridge && document.querySelector('#psychQuizCard button')?.textContent.includes('Start the psychology')");
  await evaluate("document.querySelector('#psychQuizCard button').click()");
  await check('Psychological quiz also supports selecting more than one answer',"document.querySelectorAll('#psychQuizCard input[type=checkbox]').length>=3");
  await evaluate("document.querySelectorAll('#psychQuizCard input[type=checkbox]')[0].click();document.querySelectorAll('#psychQuizCard input[type=checkbox]')[1].click()");
  await evaluate("([...document.querySelectorAll('[data-quiz-tools=psych] .ad-primary-actions button')].find(b=>b.textContent.includes('Save & leave'))).click()");
  await check('Psychology save and leave preserves chosen responses', "document.querySelector('#home').classList.contains('visible')&&JSON.parse(localStorage.getItem('afterdark_psychology_quiz_v1')).answers[0].length===2");
  await evaluate("document.querySelector('#afterdark-resume-place').click()");
  await check('Psychology resume restores saved question and both selections', "document.querySelector('#psych-quiz').classList.contains('visible')&&window.AfterDarkPsychQuizBridge.getProgress().position===0&&document.querySelectorAll('#psychQuizCard input:checked').length===2");
  await evaluate("document.querySelector('#psychQuizCard .quiz-question-more summary').click();document.querySelector('#psychQuizCard .quiz-question-more button').click()");
  await check('Psychology results preview does not mark quiz complete', "window.AfterDarkPsychQuizBridge.getProgress().position===0&&!window.AfterDarkPsychQuizBridge.getProgress().complete&&document.querySelector('#psychQuizCard .quiz-preview-return')!==null");
  await evaluate("([...document.querySelectorAll('[data-quiz-tools=psych] .ad-primary-actions button')].find(b=>b.textContent.includes('Resume'))).click()");
  await check('Psychology resume leaves preview and returns to saved selections', "window.AfterDarkPsychQuizBridge.getProgress().position===0&&document.querySelectorAll('#psychQuizCard input:checked').length===2");
  await evaluate("window.confirm=()=>true;([...document.querySelectorAll('[data-quiz-tools=psych] .ad-primary-actions button')].find(b=>b.textContent.includes('Reset quiz'))).click()");
  await check('Psychology reset clears only psychology answers, leaving direct quiz results intact', "window.AfterDarkPsychQuizBridge.getProgress().position===0&&window.AfterDarkPsychQuizBridge.getProgress().answered===0&&window.AfterDarkDirectQuizBridge.getProgress().answered===69");
  await evaluate("document.querySelectorAll('#psychQuizCard input[type=checkbox]')[0].click();document.querySelectorAll('#psychQuizCard input[type=checkbox]')[1].click()");
  for(let i=0;i<32;i++){
    await evaluate("(()=>{const btn=[...document.querySelectorAll('#psychQuizCard button')].find(b=>b.textContent.includes('Save & next')||b.textContent.includes('View shared interest shelf'));btn?.click();})()");
    if(i<31)await evaluate("document.querySelectorAll('#psychQuizCard input[type=checkbox]')[0]?.click()");
  }
  await check('Independent psychology responses identify specific adult interests and why',"document.querySelector('#psychQuizCard .psych-specific-bridge')!==null && document.querySelectorAll('#psychQuizCard .psych-specific-card').length>=8 && document.querySelector('#psychQuizCard .psych-specific-why')?.textContent.includes('You chose:')");
  await check('Psychology quiz shows unified shelf and comparison',"document.querySelector('#psychQuizCard .quiz-alignment')?.textContent.includes('32 of 32 comparable questions') && document.querySelectorAll('#psychQuizCard .interest-result').length>=12");
  const psychPair=await evaluate("JSON.stringify([...document.querySelectorAll('#psychQuizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  // The psychology quiz adds evidence, so rankings may change after completing it.
  // The two RESULT SCREENS must agree once both sets of answers are present.
  await evaluate("window.AfterDarkSharedQuizResults('quizCard')");
  const syncedPair=await evaluate("JSON.stringify([...document.querySelectorAll('#quizCard .interest-result')].map(el=>el.querySelector('h3')?.textContent+'|'+el.querySelector('.interest-percentage')?.textContent))");
  if(syncedPair!==psychPair)throw Error('Sexual and psychological result screens must display the same unified ranking');
  console.log('✓ Paired 32-question quizzes agree on identical selections and share the same PDF-ready interest report.');

  await check('Partner result sharing is available without exposing answers by default',
    "typeof window.AfterDarkPartnerShare?.open==='function' && document.querySelector('#share-results')!==null && document.querySelector('#partner-invitation')!==null");
  await evaluate("window.AfterDarkPartnerShare.open()");
  await check('Partner sharing starts with nothing selected',
    "document.querySelector('#share-results').classList.contains('visible') && !!window.AfterDarkPartnerShare.buildPack().error && document.querySelectorAll('#share-results .ps-options-grid .ps-check input:checked').length===0");
  await evaluate("document.querySelector('.ps-options-grid .ps-check input').click()");
  await check('Selected interest does not automatically expose psychology, private notes, scores or answers',
    "(()=>{const p=window.AfterDarkPartnerShare.buildPack().pack;return p?.interests.length===1&&p.themes.length===0&&p.answers.length===0&&!p.interests[0].personalNotes&&!p.interests[0].score&&!p.interests[0].psychology&&!p.interests[0].suggestions})()");
  await evaluate("document.querySelector('.ps-select-card .ps-detail-settings summary').click();[...document.querySelectorAll('.ps-select-card .ps-detail-choice input')].find(x=>x.parentNode.textContent.includes('Psychology explanation')).click()");
  await check('Opting into interest psychology adds only that selected explanation',
    "(()=>{const p=window.AfterDarkPartnerShare.buildPack().pack;return p.interests.length===1&&!!p.interests[0].psychology&&p.answers.length===0&&p.themes.length===0})()");
  await evaluate("document.querySelectorAll('#share-results .ps-section')[1].open=true;document.querySelectorAll('#share-results .ps-section')[1].querySelector('.ps-check input')?.click()");
  await evaluate("document.querySelectorAll('#share-results .ps-section')[2].open=true;document.querySelectorAll('#share-results .ps-section')[2].querySelector('.ps-check input')?.click()");
  await check('Only explicitly chosen psychology themes and answer excerpts enter partner payload',
    "(()=>{const p=window.AfterDarkPartnerShare.buildPack().pack;return p.interests.length===1&&p.themes.length===1&&p.answers.length===1&&!('note' in p.answers[0])&&p.answers[0].selection.length>0})()");
  await evaluate("[...document.querySelectorAll('#share-results .ps-actions button')].find(x=>x.textContent.includes('Create selected-results link')).click()");
  await check('A shareable partner link contains only an encoded custom selection, not full quiz state',
    "(()=>{const link=document.querySelector('#partner-share-link input')?.value;if(!link||!link.includes('#partner-results?data='))return false;const payload=window.AfterDarkPartnerShare.decode(link.split('data=')[1]);return payload?.interests.length===1&&payload.themes.length===1&&payload.answers.length===1&&!JSON.stringify(payload).includes('multiAnswers')&&!JSON.stringify(payload).includes('freeResponses')})()");
  await evaluate("(()=>{const frame=document.createElement('iframe');frame.id='selected-results-preview-test';frame.src=document.querySelector('#partner-share-link input').value;frame.hidden=true;document.body.append(frame)})()");
  let selectiveReady=false;
  for(let attempt=0;attempt<45;attempt++){
    selectiveReady=await evaluate("(()=>{const doc=document.getElementById('selected-results-preview-test')?.contentDocument;return !!doc?.querySelector('#partner-view.visible .ps-reader-heading')&&doc.querySelectorAll('.ps-reader-section').length===3&&doc.querySelectorAll('.ps-reader-section:first-of-type .ps-preview-card').length===1&&doc.querySelectorAll('.ps-reader-section .ps-preview-card').length===3})()");
    if(selectiveReady)break;
    await delay(100);
  }
  if(!selectiveReady)throw Error('Selective partner link did not render the exact chosen subset on a fresh page');
  await evaluate("document.querySelector('#selected-results-preview-test')?.remove();document.querySelectorAll('#share-results .ps-section')[3].open=true;document.querySelectorAll('#share-results .ps-section')[3].querySelector('.ps-check input')?.click()");
  await check('Custom interests remain private until individually checked by the user',
    "(()=>{const x=window.AfterDarkPartnerShare.buildPack().pack;return x?.customIdeas?.length===1&&x.customIdeas[0].text.includes('whispering')&&x.customIdeas[0].intentLabel.includes('together')})()");
  await evaluate("document.querySelector('[data-tab=quiz]').click()");

  console.log('✓ Partner sharing previews and opens only explicitly selected interests, psychological themes and individual answers.');



  await check('Detailed PDF uses the same canonical answers and named interests in both quizzes',
    "(()=>{const d=window.AfterDarkCanonicalReport?.buildData?.(),r=window.AfterDarkDetailedReport?.build?.();return !!d && d.direct.answered===69 && d.psych.answered===32 && d.interests.length>=12 && r?.querySelectorAll('.report-interest').length===d.interests.length && !!r.querySelector('.report-cover-stats') && r.querySelector('.report-cover')?.textContent.includes('My Interests & Psychology Report')})()");
  await check('Interest PDF pairs individual psychology, answer evidence, suggested activities and discussion prompts',
    "(()=>{const r=window.AfterDarkDetailedReport?.build?.();const p=r?.querySelector('.report-interest');return !!p && !!p.querySelector('.report-lenses') && p.textContent.includes('Sexual-preferences quiz') && p.textContent.includes('Non-explicit psychology quiz') && p.textContent.includes('Things you might consider or like') && p.textContent.includes('Discussing this specific interest with a partner') && p.querySelectorAll('.report-idea-list li').length>=3 && p.querySelectorAll('.report-evidence li').length>=1 && !!r.querySelector('.report-related')})()");
  await check('PDF includes all original answers, psychology suggestions, boundaries and readable print styling',
    "(()=>{const r=window.AfterDarkDetailedReport?.build?.(),css=[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(x=>x.cssText.includes('print-detailed-report'))}catch{return false}});return !!r && r.textContent.includes('Appendix A') && r.textContent.includes('Appendix B') && r.textContent.includes('Specific interests') && r.textContent.includes('convers') && r.querySelectorAll('.report-answer').length>=94 && r.querySelectorAll('.report-step').length===6 && css})()");


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

  await evaluate("document.querySelector('[data-tab=howto]').click()");
  await check('Orgasm-only library opens with 18 guides',"document.querySelector('#howto')?.classList.contains('visible') && document.querySelectorAll('#howto-guide-grid .howto-guide-card').length===18 && document.querySelector('#howto-category option')?.textContent==='All guides'");
  await check('All guides are specifically about orgasm',"window.AfterDarkIntimacyGuides.guides.length===18 && window.AfterDarkIntimacyGuides.guides.every(g=>/orgasm/i.test(g.title+' '+g.subtitle+' '+g.facts)) && !window.AfterDarkIntimacyGuides.guides.some(g=>['squirting','communication','toys','sexual-health'].includes(g.id))");
  await check('Orgasm guides offer practical steps without repetitive partner scripts',"window.AfterDarkIntimacyGuides.guides.every(g=>g.steps.length===5 && !('partner' in g)) && document.querySelector('#howto .lead')?.textContent.includes('starting approach') && document.querySelector('#howto .note')?.textContent.includes('withdraws consent')");

  await evaluate("document.querySelector('#howto [data-guide-open=vaginal-orgasm]').click()");
  await check('Internal vaginal orgasm guide includes practical steps, nuance, sources and safety',"document.querySelector('#howto-guide-detail').hidden===false && document.querySelector('#howto-guide-detail h2')?.textContent.includes('vaginal') && document.querySelectorAll('#howto-guide-detail ol li').length>=4 && document.querySelectorAll('#howto-guide-detail .howto-guide-sources a[href^=https]').length>=2 && document.querySelector('#howto-guide-detail').textContent.includes('clitoral')");
  await check('Orgasm detail has a getting-started heading without scripted partner coaching',"document.querySelector('#howto-guide-detail .howto-guide-steps h3')?.textContent.includes('practical way to get started') && !document.querySelector('#howto-guide-detail .howto-guide-partner')");

  await evaluate("document.querySelector('#howto [data-guide-open=nipple-pleasure]').click()");
  await check('Nipple orgasm guide remains available',"document.querySelector('#howto-guide-detail h2')?.textContent.includes('Nipple') && document.querySelector('#howto-guide-detail').textContent.includes('scientifically established')");
  await evaluate("document.querySelector('#howto [data-guide-open=testicular-orgasm]').click()");
  await check('Testicular orgasm guide describes scrotal sensitivity and safe limits',"document.querySelector('#howto-guide-detail h2')?.textContent.includes('testicular') && document.querySelector('#howto-guide-detail').textContent.includes('testicles')");
  await evaluate("document.querySelector('#howto-search').value='pelvic';document.querySelector('#howto-search').dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Orgasm guide search filters correctly',"document.querySelectorAll('#howto-guide-grid .howto-guide-card').length>=1 && document.querySelectorAll('#howto-guide-grid .howto-guide-card').length<18");
  await evaluate("document.querySelector('#howto-search').value='';document.querySelector('#howto-search').dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Ask Atlas answers orgasm questions with new guides',"respond('how do nipple orgasms work').includes('Nipple') && respond('how can vaginal orgasm work').includes('vaginal') && respond('how does testicular orgasm work').includes('testicular')");
  await evaluate("document.querySelector('[data-tab=home]').click();document.querySelector('#home [data-guide-open=vaginal-orgasm]').click()");
  await check('Homepage orgasm button opens internal vaginal guide',"document.querySelector('#howto').classList.contains('visible') && !document.querySelector('#howto-guide-detail').hidden && document.querySelector('#howto-guide-detail h2')?.textContent.includes('vaginal')");
  console.log('✓ After Dark offers 18 orgasm-specific articles, practical steps, anatomy, sources and Ask Atlas answers.');

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
  const compactCasino=await casino.evaluate("(()=>{const friends=document.querySelector('#friends'),howto=document.querySelector('#casino-howto'),scores=document.querySelector('.scorebar'),games=document.querySelector('#games');return document.querySelectorAll('.scorebar>div').length===2 && !document.querySelector('.hero') && !document.querySelector('#hero-play-friend') && howto?.compareDocumentPosition(scores)===Node.DOCUMENT_POSITION_FOLLOWING && scores?.compareDocumentPosition(games)===Node.DOCUMENT_POSITION_FOLLOWING && friends?.hidden && getComputedStyle(friends).display==='none' && document.querySelectorAll('.game-pickers .game-pick').length===3 && !!document.querySelector('.connection-troubleshoot') && !document.querySelector('.friend-arena')})()");
  if(!compactCasino)throw Error('Casino must have no giant hero banner and must keep game controls and optional friend setup');
  await casino.command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const narrowCasino=await casino.evaluate("document.documentElement.scrollWidth<=innerWidth+3 && document.querySelector('.game-pickers').getBoundingClientRect().width<=innerWidth && getComputedStyle(document.querySelector('.game-pickers')).gridTemplateColumns.split(' ').length===3");
  if(!narrowCasino)throw Error('Casino mobile layout must fit a 390px viewport with all three game buttons visible');
  await casino.command('Emulation.clearDeviceMetricsOverride');

  const cpu=await casino.evaluate("document.querySelector('#opponent-name').textContent.includes('Candybot') && !document.querySelector('#duel-ready').disabled");
  if(!cpu)throw Error('Candybot should be the default, fully playable opponent');
  await casino.evaluate("document.querySelector('#duel-ready').click()");
  const dealt=await casino.evaluate("window.CandyCasinoDebug.state().phase==='draw' && document.querySelectorAll('#poker-own-cards .poker-card').length===5 && document.querySelectorAll('#poker-opponent-cards .poker-card.back').length===5");
  if(!dealt)throw Error('Sugar Rush Poker failed to deal private player and hidden opponent hands');
  const unclutteredPoker=await casino.evaluate("document.querySelector('#casino-arena').classList.contains('is-poker-active') && getComputedStyle(document.querySelector('.scoreboards')).display==='none' && getComputedStyle(document.querySelector('#duel-display')).display==='none' && getComputedStyle(document.querySelector('.poker-score-strip')).display==='grid'");
  if(!unclutteredPoker)throw Error('Poker should show only its in-table scoreboard once cards are dealt');

  await casino.evaluate("document.querySelector('#poker-own-cards .poker-card').click();document.querySelector('#poker-draw').click()");
  const showdown=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelectorAll('#poker-opponent-cards .poker-card:not(.back)').length===5 && Number(document.querySelector('#self-score').textContent)+Number(document.querySelector('#other-score').textContent)<=1");
  if(!showdown)throw Error('Poker draw/showdown did not resolve against computer');

  const overlay=await casino.evaluate("(()=>{const el=document.querySelector('#poker-showdown'),why=document.querySelector('#poker-why'),table=document.querySelector('#poker-table'),score=document.querySelector('.poker-score-strip');return !!el&&!el.hidden&&!!why&&/wins because|Both players have|round is a tie|exactly equal/i.test(why.textContent) && score?.contains(document.querySelector('#poker-self-score'))&&table?.contains(el)&&getComputedStyle(el).position==='absolute'&&Number(document.querySelector('#poker-self-score').textContent)===Number(document.querySelector('#self-score').textContent)&&Number(document.querySelector('#poker-other-score').textContent)===Number(document.querySelector('#other-score').textContent)})()");
  if(!overlay)throw Error('Poker winner and explanation must overlay the cards, with an adjacent live scoreboard');
  await casino.evaluate("document.querySelector('#poker-reveal').click()");
  const revealed=await casino.evaluate("document.querySelector('#poker-showdown').hidden && document.querySelectorAll('#poker-own-cards .poker-card:not(.back)').length===5");
  if(!revealed)throw Error('View both hands must dismiss the poker result overlay');
  await casino.evaluate("document.querySelector('#duel-ready').click()");
  const nextPoker=await casino.evaluate("window.CandyCasinoDebug.state().phase==='draw' && document.querySelector('#poker-round-label').textContent.includes('2 OF 5') && document.querySelector('#poker-showdown').hidden");
  if(!nextPoker)throw Error('Poker scoreboard did not advance to round two');

  await casino.evaluate("document.querySelector('[data-duel=card]').click();document.querySelector('#duel-ready').click()");
  const high=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelector('#duel-display').textContent.includes('drew')");
  if(!high)throw Error('High Card did not play versus computer');
  await casino.evaluate("document.querySelector('[data-duel=dice]').click();document.querySelector('#duel-ready').click()");
  const dice=await casino.evaluate("window.CandyCasinoDebug.state().phase==='result' && document.querySelector('#duel-display').textContent.includes('rolled')");
  if(!dice)throw Error('Dice Duel did not play versus computer');
  await casino.evaluate("document.querySelector('[data-opponent=friend]').click()");
  const remote=await casino.evaluate("!document.querySelector('#remote-controls').hidden && document.querySelector('#duel-ready').disabled && !!document.querySelector('#make-room') && !!document.querySelector('#join-room')");
  if(!remote)throw Error('Remote friend mode did not expose invite controls or require a connection');
  const singleFriendPanel=await casino.evaluate("(()=>{const f=document.querySelector('#friends'),d=f?.querySelector('.connection-troubleshoot');return !!f&&!f.hidden&&getComputedStyle(f).display!=='none'&&f.compareDocumentPosition(document.querySelector('#casino-arena'))===Node.DOCUMENT_POSITION_FOLLOWING&&d&&!d.open&&document.querySelectorAll('#make-room').length===1&&document.querySelectorAll('#join-room').length===1})()");
  if(!singleFriendPanel)throw Error('Friend setup must be a single compact panel above the game with optional help collapsed');

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
