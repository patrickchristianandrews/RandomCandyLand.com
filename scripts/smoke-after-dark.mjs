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
const chromeLogPath=path.join(profile,'chrome-startup.log');
const chromeLogFd=fs.openSync(chromeLogPath,'w');
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'--remote-allow-origins=*','about:blank'],{stdio:['ignore','ignore',chromeLogFd]});
fs.closeSync(chromeLogFd);
let chromeLaunchError='';
proc.on('error',error=>{chromeLaunchError=String(error)});
const testErrors=[];
let browserPort=0;
try{
  // Runners can take substantially longer than nine seconds to start headless Chrome.
  // Wait for the actual DevTools endpoint instead of treating a slow launch as a website failure.
  for(let i=0;i<300;i++){
    const f=path.join(profile,'DevToolsActivePort');
    if(fs.existsSync(f)){
      const candidate=Number(fs.readFileSync(f,'utf8').split('\n')[0]);
      if(Number.isInteger(candidate)&&candidate>0){browserPort=candidate;break;}
    }
    if(chromeLaunchError||proc.exitCode!==null)break;
    await delay(200);
  }
  if(!browserPort){
    const details=fs.existsSync(chromeLogPath)?fs.readFileSync(chromeLogPath,'utf8').slice(-3000):'';
    throw Error('Chrome did not open DevTools port. Binary: '+chrome+'; exit: '+proc.exitCode+'; spawn: '+chromeLaunchError+'; Chrome log: '+details);
  }
  let client;
  async function navigate(url){
    if(client)client.close();
    const target=await (await fetch(`http://127.0.0.1:${browserPort}/json/new?${encodeURIComponent(url)}`,{method:'PUT'})).json();
    client=new WebSocket(target.webSocketDebuggerUrl);
    await Promise.race([
      new Promise((resolve,reject)=>{client.addEventListener('open',resolve,{once:true});client.addEventListener('error',reject,{once:true});}),
      delay(20000).then(()=>{throw Error('Chrome WebSocket connection timed out: '+url);})
    ]);
    let next=0;
    const pending=new Map();
    client.addEventListener('message',event=>{
      const msg=JSON.parse(String(event.data));
      if(msg.method==='Runtime.exceptionThrown')testErrors.push(msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'Runtime exception');
      if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error')testErrors.push(msg.params.entry.text);
      if(msg.id&&pending.has(msg.id)){const [resolve,reject]=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}
    });
    // Never leave CI hanging forever if Chrome stops answering one command.
    // Keep genuine browser regressions fatal, but surface the operation and URL.
    const command=(method,params={})=>new Promise((resolve,reject)=>{
      const id=++next;
      const watchdog=setTimeout(()=>{
        pending.delete(id);
        reject(Error('Chrome DevTools timeout: '+method+' at '+url+' (20 seconds without a response)'));
      },20000);
      pending.set(id,[
        result=>{clearTimeout(watchdog);resolve(result);},
        error=>{clearTimeout(watchdog);reject(error);}
      ]);
      try{client.send(JSON.stringify({id,method,params}));}
      catch(error){clearTimeout(watchdog);pending.delete(id);reject(error);}
    });
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
  const afterDark=await navigate(site+'/after-dark/');
  const {evaluate}=afterDark;
  const check=async(desc,js)=>{
    const value=await evaluate(js);
    if(!value)throw Error('After Dark regression: '+desc);
    console.log('✓',desc);
  };
  await check('Google Tag Manager initializes on After Dark', "window.dataLayer?.some(x=>x?.event==='gtm.js' && Number.isFinite(x['gtm.start'])) && [...document.scripts].some(s=>s.src.includes('googletagmanager.com/gtm.js?id=GTM-TQRDB5KL'))");
  await check('Adult entry is present', "!!document.querySelector('#enter')");
  // A fixed age gate can conceal a browser-restored scroll position. Verify
  // accepting it always places the visitor at the top of the Unwrapped page.
  await evaluate("window.scrollTo({top:780,behavior:'instant'})");
  await check('Adult gate can be presented above a restored scroll position',
    "window.scrollY>100");
  await evaluate("document.querySelector('#enter').click()");
  await check('Adult entry dismisses the overlay',"getComputedStyle(document.querySelector('#ageGate')).display==='none'");
  await check('Accepting the 18+ age gate resets the Unwrapped page to the top',
    "window.scrollY<=2 && document.documentElement.scrollTop<=2 && document.body.classList.contains('ad-entered')");
  await check('Save-your-place toolbar appears on the main page',
    "!!document.querySelector('#od-bookmark-bar .od-bookmark-save') && !!document.querySelector('#od-continue') && !!document.querySelector('#od-bookmark-menu') && typeof window.OtherDrawerBookmarks?.save==='function'");
  const saveBarMetrics="(()=>{const bar=document.querySelector('#od-bookmark-bar');const names=['.od-bookmark-save','.od-bookmark-continue','#rcl-share-page','.od-bookmark-summary'];const r=names.map(name=>{const el=bar.querySelector(name),v=el.getBoundingClientRect();return{name,top:v.top,bottom:v.bottom,left:v.left,right:v.right}});const box=bar.getBoundingClientRect();const overlap=Math.min(...r.map(v=>v.bottom))-Math.max(...r.map(v=>v.top));return{display:getComputedStyle(bar).display,barHeight:box.height,overlap,viewport:innerWidth,buttons:r,oneRow:overlap>=20&&r.every(v=>v.right<=innerWidth+4&&v.left>=-4)&&box.height<=85}})()";
  const desktopBar=await evaluate(saveBarMetrics);
  console.log('Save bar desktop geometry:',JSON.stringify(desktopBar));
  if(!desktopBar?.oneRow)throw Error('After Dark regression: Save bar is one row on desktop');
  await afterDark.command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobileBar=await evaluate(saveBarMetrics);
  console.log('Save bar phone geometry:',JSON.stringify(mobileBar));
  if(!mobileBar?.oneRow)throw Error('After Dark regression: Save bar is one row at phone width');
  await afterDark.command('Emulation.clearDeviceMetricsOverride');
  await evaluate("document.querySelector('#od-bookmark-bar .od-bookmark-save').click()");
  await check('Saving a bookmark persists without quiz answers leaving the device',
    "window.OtherDrawerBookmarks.list().length===1 && !!localStorage.getItem('otherdrawer_saved_places_v1') && document.querySelector('#od-bookmark-count').textContent==='1'");
  await check('Saved place controls include search, section filters and separate quiz backups',
    "!!document.querySelector('#od-saved-search') && !!document.querySelector('#od-saved-section') && !!document.querySelector('#od-saved-sort') && !!document.querySelector('.od-backup-quizzes') && !!document.querySelector('#od-bookmark-panel, .od-bookmark-panel')");
  await evaluate("document.querySelector('#od-bookmark-menu').open=true;document.querySelector('#od-saved-search').value='no-such-saved-spot';document.querySelector('#od-saved-search').dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Saved place search narrows results without losing stored bookmarks',
    "document.querySelector('#od-saved-results').textContent.includes('0 of 1') && window.OtherDrawerBookmarks.list().length===1");
  await evaluate("document.querySelector('#od-saved-search').value='';document.querySelector('#od-saved-search').dispatchEvent(new Event('input',{bubbles:true}))");
  await evaluate("document.querySelector('#od-bookmark-menu').open=true;document.querySelector('#od-bookmark-list .od-saved-actions button:last-child').click()");
  await check('Saved places can be removed',
    "window.OtherDrawerBookmarks.list().length===0 && document.querySelector('#od-bookmark-count').textContent==='0'");
  await check('Save toolbar includes Back to Top and Share Page',
    "!!document.querySelector('#od-back-to-top') && !!document.querySelector('#rcl-share-page') && typeof window.RandomCandyLandShare?.share==='function'");
  await check('Guide and topic links contain no private quiz data',
    "(()=>{const s=window.RandomCandyLandShare;const g=s.itemURL('guide','nipple-pleasure'),t=s.itemURL('topic','0-0');return g.endsWith('?guide=nipple-pleasure#howto')&&t.endsWith('?topic=0-0#atlas')&&!g.includes('answer')&&!t.includes('answer')})()");
  await check('Origins library loads 16 research-aware nonsexual development topics',
    "window.AfterDarkOrigins?.entries()?.length===16&&document.querySelectorAll('#origins-grid .od-origin-card').length===16");
  await check('Oral fixation is explained without deterministic sexual inference',
    "document.querySelector('#origin-oral-comfort').innerText.includes('not a reliable clinical explanation') && window.AfterDarkOrigins.answer('Is thumb-sucking an oral fixation?')?.includes('no reliable way')");
  await check('Specific psychology topics have shareable public deep links',
    "window.RandomCandyLandShare?.itemURL('origin','oral-comfort')?.includes('origin=oral-comfort') && window.RandomCandyLandShare?.itemURL('origin','oral-comfort')?.endsWith('#psych')");
  await check('After Dark opens on the introduction rather than the atlas',"document.querySelector('#home').classList.contains('visible') && !document.querySelector('#atlas').classList.contains('visible')");
  await check('Unwrapped homepage shows four essential starting points',"!!document.querySelector('#home .afterdark-home-hero .ad-discovery-image') && document.querySelectorAll('#home .od-compact-tool').length===4 && !!document.querySelector('#home [data-tab=psych-quiz]') && !!document.querySelector('#home [data-tab=quiz]')");
  await check('After Dark retains illustrations throughout the site without a crowded landing',"document.querySelectorAll('#home .ad-card-visual').length===4 && document.querySelectorAll('.ad-section-art-banner>img').length>=7 && document.querySelector('#home .ad-discovery-image')?.getAttribute('src').includes('discovery-emblem.svg')");
  await check('Unwrapped removes all decorative goo while retaining its guide illustrations',
    "document.querySelectorAll('.ad-liquid-goo,.ad-goo-coated,.ad-home-goo').length===0 && !window.AfterDarkCandyGoo && document.querySelectorAll('.ad-section-art-banner>img').length>=7 && document.querySelectorAll('.howto-guide-card').length>=16");


  await check('No internal analytics or unchanged status copy is visible',"!/site analytics are enabled|quiz \(unchanged\)|are unchanged/i.test(document.body.innerText)");
  await check('Non-explicit quiz maps answers to specific Atlas interests independently',"window.AfterDarkPsychBridge?.recommend({answered:1,answers:{0:[0]}},topics)?.some(r=>r.x.name==='Slow build-up')");
  await check('Unwrapped report center is visible from home',
    "!!document.querySelector('#home .od-compact-tool button[data-tab=notebook]') && document.querySelectorAll('#home .od-compact-tool').length===4 && !!document.querySelector('#uw-personal-workflow') && !!document.querySelector('#uc-partner') && !!document.querySelector('#uc-compare')");
  await check('Upgraded menu has a labelled mobile toggle and current section feedback',
    "!!document.querySelector('#od-nav-toggle[aria-controls=od-ribbon-nav]') && !!document.querySelector('.od-ribbon-nav button[data-tab=home][aria-current=page]')");
  await check('Top ribbon makes all Other Drawer sections discoverable',
    "(()=>{const h=document.querySelector('.od-ribbon-nav');return !!h && !!h.querySelector('button[data-tab=notebook]') && ['home','quiz','psych-quiz','chat','atlas','psych','notebook','ideas','howto','guide'].every(tab=>h.querySelector('[data-tab='+tab+']')) && !!h.querySelector('a[href*=psychology-lab]')})()");
  await evaluate("document.querySelector('.od-ribbon-menu-quizzes summary').click();document.querySelector('.od-ribbon-menu-quizzes button[data-tab=psych-quiz]').click()");
  await check('Ribbon dropdown opens psychology quiz and closes cleanly',
    "document.querySelector('#psych-quiz').classList.contains('visible')&&!document.querySelector('.od-ribbon-menu-quizzes').open");
  await evaluate("renderTabs('home')");
  await check('Homepage features Quiz, Reports, Mira and the Toy Guide',
    "document.querySelectorAll('#home .od-compact-tool').length===4 && document.querySelectorAll('#home .od-compact-tool h3').length===4 && !!document.querySelector('#home .od-compact-tool [data-tab=toys]') && !document.querySelector('#home .od-home-directory-tile')");
  await evaluate("document.querySelector('.enter-after-dark').click()");
  await check('Featured Quiz call to action opens the Quiz',"document.querySelector('#quiz').classList.contains('visible')");
  await evaluate("document.querySelector('#home .od-compact-tool button[data-tab=chat]').click()");
  await check('Featured Ask Mira opens chat',"document.querySelector('#chat').classList.contains('visible')");
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
  await check('Body-sound curiosity is integrated without a standalone flatulence prompt or lost answer indices',
    "(()=>{const q=window.AfterDarkAdultQuiz.find(x=>x.id===65);const t=window.AfterDarkNotebookBridge.getTopics();return !!q && /body sounds, scents/i.test(q.q)&&q.options.length===8&&q.optionDisplayOrder.join(',')==='5,6,7,0,1,2,3,4'&&q.options[0].interests.includes('Flatulence sound interest')&&q.options[1].interests.includes('Flatulence scent interest')&&q.options[4].role==='none'&&t.some(x=>x.name==='Temperature and tactile contrast curiosity')})()");
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
  await check('Quiz offers private PDF and saves interests', "typeof window.InterestNotebook?.printQuiz==='function' && !![...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Save readable report as PDF')) && !![...document.querySelectorAll('#quizCard button')].find(b=>b.textContent.includes('Expanded evidence report')) && !!document.querySelector('#quizCard .interest-result button')");
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



  await check('Personal report includes tailored toy reading ideas; partner version keeps them private unless selected',
    "(()=>{const full=window.AfterDarkDetailedReport?.build?.(),partner=window.AfterDarkPartnerPDF?.build?.();return !!full?.textContent.includes('Sex toy guide · Ideas that fit my selected interests')&&!!full.querySelector('.report-boundaries')&&!!partner&&!partner.textContent.includes('Toy ideas I want to share')&&!!document.querySelector('#quizCard .partner-pdf-chooser input[value=toys]')&&!document.querySelector('#quizCard .partner-pdf-chooser input[value=toys]').checked})()");
  await check('Detailed PDF uses the same canonical answers and named interests in both quizzes',
    "(()=>{const d=window.AfterDarkCanonicalReport?.buildData?.(),r=window.AfterDarkDetailedReport?.build?.();return !!d && d.direct.answered===69 && d.psych.answered===32 && d.interests.length>=12 && r?.querySelectorAll('.report-interest').length===d.interests.length && !!r.querySelector('.report-cover-stats') && r.querySelector('.report-cover')?.textContent.includes('My Interests & Psychology Report')})()");
  await check('Editorial PDF groups interests and preserves expanded evidence and partner discussion guidance',
    "(()=>{const r=window.AfterDarkDetailedReport?.build?.();const p=r?.querySelector('.report-interest');return !!r?.classList.contains('report-editorial') && r.querySelectorAll('.report-cluster').length>=2 && !!r.querySelector('.report-glance') && !!r.querySelector('.report-theme-chart') && !!p?.querySelector('.report-lenses') && p.textContent.includes('Sexual-preferences quiz') && p.textContent.includes('Non-explicit psychology quiz') && p.textContent.includes('Specific ideas to reflect on') && p.textContent.includes('Discussing this topic with a partner') && p.querySelectorAll('.report-idea-list li').length>=2 && p.querySelectorAll('.report-evidence li').length>=1})()");
  await check('Personal Unwrapped report includes accessible visual results, evidence-aware categories and paired theme chart tables',
    "(()=>{const d=window.AfterDarkCanonicalReport.buildData(),r=window.AfterDarkDetailedReport.build(),p=r.querySelector('.report-visual-dashboard'),b=p?.querySelectorAll('.report-visual-completion-row'),status=p?.querySelectorAll('.report-visual-status-table tbody tr'),chart=p?.querySelectorAll('.report-visual-matrix tbody tr'),total=[...p.querySelectorAll('.report-visual-status-table tbody .report-visual-number')].reduce((a,x)=>a+Number(x.textContent),0);return !!p&&b?.length===2&&status?.length===4&&chart?.length>=2&&total===d.interests.length&&!!r.querySelector('.report-visual-footnote')&&!!document.querySelector('link[href*=report-visuals]')})()");
  await check('Personal visual report maps relationships between the two questionnaires and keeps detailed interpretations',
    "(()=>{const r=window.AfterDarkDetailedReport.build(),m=r.querySelector('.report-connection-map');return !!m&&m.querySelectorAll('.report-connection-lane').length>=2&&m.querySelectorAll('.report-connection-explanation p').length>=1&&r.querySelectorAll('.report-interest').length>=12})()");
  await check('Complete Unwrapped report displays all supported themes, nested connections and answer evidence',
    "(()=>{const data=window.AfterDarkCanonicalReport.buildData(),r=window.AfterDarkDetailedReport.build(),map=r.querySelector('.report-deep-connections');if(!map)return false;const named=data.interests.filter(x=>x.directSelection||x.specificSelected).length;const rows=map.querySelectorAll('.report-cross-matrix tbody tr'),pairs=map.querySelectorAll('.report-cross-pair-table tbody tr'),profiles=map.querySelectorAll('.report-cross-topic');return rows.length>=6&&pairs.length>=5&&profiles.length===named&&!!map.querySelector('.report-cross-interpret')&&!!map.querySelector('.report-cross-evidence')})()");
  await check('Selected partner PDF includes connection paths alongside full written report sections',
    "(()=>{const r=window.AfterDarkPartnerPDF.build();return !!r.querySelector('.report-connection-map .report-connection-lane')&&r.querySelectorAll('.partner-report-section').length>=4})()");
  await check('Partner comparison offers an on-device selective export and printable visual report',
    "!!document.querySelector('#uc-comparison #uc-export')&&!!document.querySelector('#uc-a[type=file]')&&!!document.querySelector('#uc-b[type=file]')&&!!document.querySelector('#uc-print[hidden]')");
  await evaluate("document.querySelector('#uc-export').open=true");
  await delay(100);
  await check('Partner report export starts with nothing selected, including sensitive topics',
    "(()=>{const inputs=[...document.querySelectorAll('#uc-select .uc-check input[type=checkbox]')];return inputs.length>=8&&inputs.every(x=>!x.checked)})()");
  await evaluate("(()=>{const a={format:'unwrapped-shared-comparison-v1',version:1,from:'Alex',interests:[{title:'Shared curiosity',category:'Interests',status:'Marked Curious',description:'Selected for discussion',themes:[]}],themes:[{label:'Communication',description:'Communication notes'},{label:'Reflection',description:'Reflection notes'}],answers:[{quiz:'psych',question:'What helps you listen?',selection:['Asking questions'],intentLabel:''}]};const b={...a,from:'Sam',themes:[{label:'Communication',description:'Shared communication notes'},{label:'Novelty',description:'Novelty notes'}],answers:[{quiz:'psych',question:'What helps you listen?',selection:['Offering solutions'],intentLabel:''}]};for(const [id,pack] of [['uc-a',a],['uc-b',b]]){const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(pack)],id+'.json',{type:'application/json'}));document.getElementById(id).files=dt.files}document.querySelector('#uc-partner').click()})()");
  await delay(200);
  await check('A selected personal file creates a partner-facing report from one JSON upload',
    "(()=>{const r=document.querySelector('#uc-results');return !!r&&r.textContent.includes('A little more about Alex')&&r.textContent.includes('Communication')&&!document.querySelector('#uc-print').hidden&&document.body.classList.contains('print-unwrapped-solo')})()");
  await evaluate("document.querySelector('#uc-compare').click()");
  await delay(200);
  await check('Two partner reports reveal shared and distinct themes as connected nodes with explanatory advice',
    "(()=>{const r=document.querySelector('#uc-results');return !!r?.querySelector('.uc-dashboard')&&r.querySelectorAll('.uc-metric').length===4&&r.querySelectorAll('.uc-connection-row').length===2&&r.querySelectorAll('.uc-action-path').length>=2&&r.querySelectorAll('.uc-answer-comparison .uc-answer-pair').length===1&&r.textContent.includes('What your everyday answers may tell you together')&&r.querySelectorAll('.uc-result').length>=5&&document.querySelector('#uc-print').hidden===false&&r.textContent.includes('Communication')&&r.textContent.includes('One useful step this week')&&!!r.querySelector('.unwrapped-web-svg')})()");
  await check('Expanded PDF clearly distinguishes named interests from unconfirmed psychology suggestions',
    "(()=>{const d=window.AfterDarkCanonicalReport.buildData(),r=window.AfterDarkDetailedReport.build(),confirmed=d.interests.filter(i=>i.directSelection||i.specificSelected).length;return !!r.querySelector('.report-insight') && !!r.querySelector('.report-comparison') && !!r.querySelector('.unwrapped-web-svg') && !!r.querySelector('.unwrapped-web-playbook') && r.querySelectorAll('.report-interest[data-evidence=selected]').length===confirmed && r.querySelectorAll('.report-interest[data-evidence=suggested]').length===d.interests.length-confirmed && !!r.querySelector('.report-comparison-pair') && r.textContent.includes('not a probability')})()");
   await check('Live report has print styling for comparison and selection evidence',
    "!!document.querySelector('link[href*=report-upgrade]') && !!window.AfterDarkDetailedReport.build().querySelector('.report-comparison-columns')");
   await check('Suggestions use both quiz themes, diversify categories and exclude excluded interests',
     "(()=>{const d=window.AfterDarkCanonicalReport.buildData(),e=window.AfterDarkDiscovery.evaluate(d),topics=window.AfterDarkNotebookBridge.getTopics(),marks=window.AfterDarkNotebookBridge.getChoices();return e.eligible&&e.suggestions.length>=5&&e.categories.length>=2&&e.suggestions.every(x=>!marks[x.id]&&!topics.find(t=>t.id===x.id)?.warning)&&e.suggestions.every(x=>x.status.startsWith('Unconfirmed'))&&window.AfterDarkDetailedReport.build().querySelectorAll('.report-discover-card').length===e.suggestions.length})()");
   await check('New partner report starts nonsexual with all quiz disclosures switched off',
     "(()=>{const root=document.querySelector('#new-partner-report');const switches=root?.querySelectorAll('.new-partner-toggle input')||[];const fields=root?.querySelectorAll('.new-partner-field textarea')||[];return !!window.AfterDarkNewPartnerReport&&switches.length===3&&[...switches].every(x=>!x.checked)&&fields.length>=12&&!root.querySelector('.new-partner-preview:not([hidden])')})()");
   await evaluate("(()=>{const t=document.querySelector('#new-partner-introduction');t.value='I love a quiet morning and value direct communication.';t.dispatchEvent(new Event('input',{bubbles:true}));})()");
   await check('New partner report includes only chosen everyday content by default',
     "(()=>{const x=window.AfterDarkNewPartnerReport.build();return x.textContent.includes('quiet morning')&&!x.textContent.includes('Intimacy and what I choose to share')&&!x.textContent.includes('Some everyday answers I chose to show you')&&!x.textContent.includes('My selected quiz answers')})()");
   await evaluate("document.querySelector('#new-partner-report .new-partner-actions button:last-child').click()");
   await check('New partner report refreshes optional choices after quizzes are completed',
     "(()=>{const areas=document.querySelectorAll('#new-partner-report .new-partner-choices');return areas.length===2&&[...areas].every(x=>x.querySelector('input[type=checkbox]'))})()");
   await evaluate("(()=>{const n=document.querySelector('#new-partner-report');const fields=n.querySelectorAll('.new-partner-choice input');const toggles=n.querySelectorAll('.new-partner-toggle input');toggles[0].click();toggles[1].click();const details=n.querySelectorAll('.new-partner-choices');details.forEach(x=>x.querySelector('input')?.click());})()");
   await check('New partner report only discloses separately opted-in psych and sexual interests',
     "(()=>{const x=window.AfterDarkNewPartnerReport.build();return x.textContent.includes('Some everyday answers I chose to show you')&&x.textContent.includes('Intimacy and what I choose to share')&&x.querySelectorAll('.partner-report-card').length>=2&&!x.textContent.includes('Specific toy topics I elected to share')})()");
   await check('Selective partner PDF uses visual tables only for sections approved for sharing',
     "(()=>{const r=window.AfterDarkPartnerPDF.build();return !!r.querySelector('.report-visual-partner-progress')&&!!r.querySelector('.report-visual-matrix')&&!!r.querySelector('.report-visual-named .report-visual-table')&&!r.textContent.includes('My exact quiz answers')&&!r.textContent.includes('My personal notes')})()");
   await check('New-partner report adds a compact table only from the personal communication text entered',
     "(()=>{const field=document.querySelector('#new-partner-communication');if(!field)return false;const original=field.value;field.value='I prefer direct, calm communication during misunderstandings.';field.dispatchEvent(new Event('input',{bubbles:true}));const report=window.AfterDarkNewPartnerReport.build(),table=report.querySelector('.report-visual-intro-table');const ok=!!table&&table.textContent.includes('direct, calm communication')&&!table.textContent.includes('sexual')&&!table.textContent.includes('questionnaire');field.value=original;field.dispatchEvent(new Event('input',{bubbles:true}));return ok})()");
   await check('Both personal and partner reports include the offline After Dark QR footer',
    "(()=>{const full=window.AfterDarkDetailedReport?.build?.(),partner=window.AfterDarkPartnerPDF?.build?.();return !!full?.querySelector('.afterdark-qr-section img[src^=\\\"data:image/png;base64,\\\"]')&&!!partner?.querySelector('.afterdark-qr-section img[src^=\\\"data:image/png;base64,\\\"]')&&partner.querySelector('.partner-report-cover')?.textContent.includes('Before you read')})()");
  await check('Partner report chooser defaults to protecting answers and private notes',
    "(()=>{const panel=document.querySelector('#quizCard .partner-pdf-chooser');const answers=panel?.querySelector('input[value=answers]');const notes=panel?.querySelector('input[value=notes]');const r=window.AfterDarkPartnerPDF?.build?.();return !!panel&&!!answers&&!answers.checked&&!!notes&&!notes.checked&&r.querySelectorAll('.partner-report-section').length===4&&!r.textContent.includes('My selected quiz answers')&&!r.textContent.includes('My own words')})()");
  await check('PDF includes all original answers, psychology suggestions, boundaries and readable print styling',
    "(()=>{const r=window.AfterDarkDetailedReport?.build?.(),css=[...document.styleSheets].some(s=>{try{return [...s.cssRules].some(x=>x.cssText.includes('print-detailed-report'))}catch{return false}});return !!r && r.textContent.includes('Appendix A') && r.textContent.includes('Appendix B') && r.textContent.includes('Interests you named or selected') && r.textContent.includes('Conversation starter') && r.querySelectorAll('.report-answer').length>=94 && r.querySelectorAll('.report-step').length===6 && css})()");


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
  await check('Ask Mira responds to suggestions',"document.querySelectorAll('#chatWindow .bubble').length>=3");
  const focusedAnswer=await evaluate("respond('I like being fucked by a strapon as a male. Why?')");
  if(!/strap-on penetration|prostate-area stimulation/i.test(focusedAnswer)||/exhibition|voyeurism/i.test(focusedAnswer))throw Error('Ask Mira returned irrelevant topic for the strap-on question');
  console.log('✓ Ask Mira explains strap-on preference without false exhibitionism matches.');

  await check('Expanded Atlas includes 190+ interests',"topics.length>=185 && !!topics.find(t=>t.name==='Aftercare planning') && !!topics.find(t=>t.name==='Edging and delayed gratification')");
  const fuzzyAnswers=await evaluate("JSON.stringify({typo:respond('why do I like peggin'),slang:respond('why am I into good girl'),context:respond('how to explain praise to my partner'),short:respond('stockings'),broad:respond('why does someone like receiving praise')})");
  const fuzzy=JSON.parse(fuzzyAnswers);
  if(!/strap-on|pegging/i.test(fuzzy.typo)||/could not match/i.test(fuzzy.typo))throw Error('Ask Mira failed typo-tolerant peggin search');
  if(!/praise/i.test(fuzzy.slang)||/could not match/i.test(fuzzy.slang))throw Error('Ask Mira failed everyday wording for praise');
  if(!/partner|listen|permission|participat/i.test(fuzzy.context)||!/praise/i.test(fuzzy.context))throw Error('Ask Mira failed context-aware partner guidance');
  if(!/stockings|hosiery/i.test(fuzzy.short))throw Error('Ask Mira failed keyword-only interest lookup');
  if(!/praise/i.test(fuzzy.broad))throw Error('Ask Mira failed psychology-focused why question');
  console.log('✓ Ask Mira tolerates typos, everyday phrases, short keywords, partner questions and expands its topic library.');

  const unmatched=await evaluate("respond('Why am I interested in velociraptor-shaped pottery?')");
  if(!/could not match|not match|confidently|not sure|try saying it another way/i.test(unmatched)||/exhibition/i.test(unmatched))throw Error('Ask Mira guessed an irrelevant answer rather than asking for detail');
  console.log('✓ Ask Mira declines irrelevant lexical matches.');
  await evaluate("document.querySelector('#chatText').value='Why do I like receiving strap-on penetration?';document.querySelector('#askForm button').click()");
  await check('Ask Mira shows a relevant on-device answer',"document.querySelector('#chatWindow .bubble:last-child').textContent.includes('strap-on')");

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
  await check('Ask Mira answers orgasm questions with new guides',"respond('how do nipple orgasms work').includes('Nipple') && respond('how can vaginal orgasm work').includes('vaginal') && respond('how does testicular orgasm work').includes('testicular')");
  await evaluate("document.querySelector('.od-ribbon-nav [data-tab=home]').click();document.querySelector('.od-ribbon-menu-more summary').click();document.querySelector('.od-ribbon-menu-more [data-tab=howto]').click();document.querySelector('#howto [data-guide-open=vaginal-orgasm]').click()");
  await check('Ribbon guides link opens internal vaginal guide',"document.querySelector('#howto').classList.contains('visible') && !document.querySelector('#howto-guide-detail').hidden && document.querySelector('#howto-guide-detail h2')?.textContent.includes('vaginal')");
  await evaluate("document.querySelector('[data-tab=toys]').click()");
  await check('Unwrapped toy explorer explains male, female, and partner uses for all twelve toy types',
    "(()=>{const lib=window.UnwrappedToyLibrary,types=lib?.types||[],cards=document.querySelectorAll('#toy-grid [data-toy-open]'),detail=document.querySelector('#toy-detail'),focus=document.querySelector('#toy-body-focus');if(!document.querySelector('#toys')?.classList.contains('visible')||types.length!==12||cards.length!==12||types.some(x=>x.uses.length<4)||!focus||types.some(x=>!lib.bodyUses(x.id)?.male?.note||!lib.bodyUses(x.id)?.female?.note))return false;focus.value='male';focus.dispatchEvent(new Event('change',{bubbles:true}));const male=document.querySelector('#toy-grid .toy-card-body-note')?.textContent.includes('Male anatomy');focus.value='female';focus.dispatchEvent(new Event('change',{bubbles:true}));const female=document.querySelector('#toy-grid .toy-card-body-note')?.textContent.includes('Female anatomy');focus.value='both';focus.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#toy-grid [data-toy-open]').click();return male&&female&&!detail.hidden&&detail.querySelectorAll('li').length>=4&&detail.querySelectorAll('.toy-body-cell').length===3&&detail.textContent.includes('Male anatomy')&&detail.textContent.includes('Female anatomy')&&detail.textContent.includes('partner')&&detail.textContent.includes('safety')})()");
  await check('Toy suggestions use direct interests and protect fantasy-only answers',
    "(()=>{const rec=window.UnwrappedToyLibrary?.recommend;if(!rec)return false;const none=rec({direct:{specificSelections:[]},interests:[{name:'Nipple interest',directSelection:0,specificSelected:false}]});const wish=rec({direct:{specificSelections:[{text:'Strap-on play',intent:'fantasy',questionNumber:1}]},interests:[{name:'Strap-on play',specificSelected:true,directSelection:0}]});const excluded=rec({direct:{specificSelections:[{text:'Anal play interests me',intent:'explore',questionNumber:1},{text:'Anal play is not for me',intent:'explore',questionNumber:2}]}});return none.length===0&&wish.some(x=>x.id==='harness')&&wish.every(x=>x.mode.includes('Fantasy-only'))&&!excluded.some(x=>x.id==='anal-plug')})()");
  console.log('✓ After Dark offers 18 orgasm-specific articles, practical steps, anatomy, sources and Ask Mira answers.');

  // Retired sample downloads must not be advertised; the guide links to real tools.
  const samples=await navigate(site+'/after-dark/report-samples/');
  const guideCheck=await samples.evaluate("(()=>{const s=document.body.innerText,links=[...document.querySelectorAll('a[href]')].map(x=>x.getAttribute('href'));return s.includes('Create or upload a report')&&s.includes('Private backup')&&s.includes('Selected report')&&links.includes('/after-dark/#notebook')&&!document.querySelector('[data-sample-download]')&&!links.some(x=>/complete-rowan|complete-ellis|sample-pdf\.js/.test(x))})()");
  if(!guideCheck)throw Error('Outdated example links remain or the current file guide is missing');
  console.log('✓ Retired sample links and verified report export/import guidance.');
  const generatedFullReports=await samples.evaluate("(async()=>{for(const name of ['rowan','ellis']){const response=await fetch('/after-dark/report-samples/complete-'+name+'-personal-report.pdf',{cache:'no-store'});if(!response.ok)return false;const file=await response.arrayBuffer();if(file.byteLength<10000||new TextDecoder().decode(file.slice(0,5))!=='%PDF-')return false;}return true})()");
  if(!generatedFullReports)throw Error('Both completed fictional-person PDFs must be present in the release');
  console.log('✓ Rowan and Ellis complete 101-question fictional-person PDFs are downloadable.');

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
  const tinyGameFirst=await tiny.evaluate("(()=>{const main=document.querySelector('.fm1-tiny-mode main');const guide=document.querySelector('#how-to-play');return main?.firstElementChild===guide && !document.querySelector('.candyland-game-site-header') && !document.querySelector('.candyland-game-site-goo') && !!document.querySelector('.game-layout .gamebody') && parseFloat(getComputedStyle(document.querySelector('.shell')).paddingTop)<=12})()");
  if(!tinyGameFirst)throw Error('FM-1 Trumpagotchi must start directly with How to Play, without giant Candy Land header or decorative goo');
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
  // TRACE must be a playable 25-case academy, not a static tool directory.
  const trace=await navigate(site+'/osint-academy/');
  const traceReady=await trace.evaluate("document.body.dataset.traceReady==='true' && window.TraceAcademyDebug?.missionCount===25 && window.TraceAcademyDebug?.toolCount>=15 && document.querySelectorAll('.mission-option').length===25 && document.querySelector('#mission-stage').textContent.includes('Define the mandate')");
  if(!traceReady)throw Error('TRACE OSINT Academy failed to load the 25-case interactive mission desk');
  const traceOnboarding=await trace.evaluate("(()=>{const guide=document.querySelector('.trace-first-steps');const buttons=[...document.querySelectorAll('.trace-play-steps li')];const directory=document.querySelector('#case-directory');return !!guide&&buttons.length===3&&guide.textContent.includes('You do not need to set up any tools first')&&!directory.open&&document.querySelector('#mission-stage .case-navigation')?.textContent.includes('CASE')&&!!document.querySelector('#continue-training')})()");
  if(!traceOnboarding)throw Error('TRACE must start with a 3-step guided learning path and a collapsed mission browser');
  await trace.evaluate("document.querySelector('#continue-training').click()");
  const startedCase=await trace.evaluate("!document.querySelector('#view-missions').hidden && document.querySelector('#current-decision').textContent.includes('What should come first?')");
  if(!startedCase)throw Error('TRACE primary start button must lead directly into the first question');
  await trace.evaluate("document.querySelector('.question-choices button:nth-child(2)').click()");
  const traceAnswered=await trace.evaluate("document.querySelector('.question-feedback')?.textContent.includes('Correct decision') && window.TraceAcademyDebug.getProgress().questionsAnswered===1");
  if(!traceAnswered)throw Error('TRACE OSINT mission choice must receive feedback and save grading');
  const traceNextCue=await trace.evaluate("document.querySelector('#next-decision')?.textContent.includes('Continue to question 2') && document.querySelector('.case-direction')?.textContent.includes('press the green button')");
  if(!traceNextCue)throw Error('TRACE answered question must visibly explain how to move forward');
  await trace.evaluate("document.querySelector('#next-decision').click()");
  const traceStep=await trace.evaluate("window.TraceAcademyDebug.getProgress().step===1 && !!document.querySelector('.question-choices button:nth-child(1)')");
  if(!traceStep)throw Error('TRACE next-decision control did not advance the case');
  const traceNavigation=await trace.evaluate("document.querySelector('#case-directory')?.open===false && document.querySelector('#mission-stage .case-navigation-progress')?.textContent.includes('2 / 3')");
  if(!traceNavigation)throw Error('TRACE must show current question count while keeping other missions out of the way');
  await trace.evaluate("document.querySelector('#tab-scope').click();document.querySelector('[data-scope-prompt=plan]').click()");
  const scopeGuide=await trace.evaluate("!document.querySelector('#view-scope').hidden && document.querySelector('#scope-case-label').textContent.includes('DEFINE THE MANDATE') && document.querySelector('#scope-answer').textContent.includes('mandate')");
  if(!scopeGuide)throw Error('SCOPE research coach must open and explain current mission with its own identity');
  await trace.evaluate("document.querySelector('#tab-tools').click()");
  const traceTools=await trace.evaluate("!document.querySelector('#view-tools').hidden && !!document.querySelector('#atlas-search') && document.querySelectorAll('.tool-card').length===4 && document.querySelectorAll('[data-atlas]').length===6");
  if(!traceTools)throw Error('TRACE Tool Atlas should open with a compact essentials view and six categories');
  await trace.evaluate("document.querySelector('[data-atlas=all]').click()");
  const traceAllTools=await trace.evaluate("document.querySelectorAll('.tool-card').length>=16 && document.querySelector('#tools-grid').textContent.includes('libphonenumber')");
  if(!traceAllTools)throw Error('TRACE all-tools filter must reveal the complete official tool catalog');
  await trace.evaluate("(()=>{const input=document.querySelector('#atlas-search');input.value='email';input.dispatchEvent(new Event('input',{bubbles:true}))})()");
  const traceSearch=await trace.evaluate("document.querySelectorAll('.tool-card').length>=1 && document.querySelector('#tools-grid').textContent.includes('Google Admin Toolbox')");
  if(!traceSearch)throw Error('TRACE Tool Atlas search must find email-header tools');
  await trace.evaluate("document.querySelector('#tab-setup').click()");
  const traceSetup=await trace.evaluate("!document.querySelector('#view-setup').hidden && document.querySelectorAll('[data-setup]').length===12 && document.querySelectorAll('.workstation-stage').length===4 && !!document.querySelector('#command-form') && !!document.querySelector('#command-input')");
  if(!traceSetup)throw Error('TRACE guided four-stage workstation and browser command desk missing');
  await trace.evaluate("document.querySelector('.command-samples button:nth-child(4)').click()");
  const tracePhone=await trace.evaluate("document.querySelector('#command-output').textContent.includes('Phone-number FORMAT only')");
  if(!tracePhone)throw Error('TRACE phone command must provide local format guidance');
  await trace.evaluate("(()=>{document.querySelector('#command-input').value='tools email';document.querySelector('#command-form').requestSubmit()})()");
  const traceCommandTools=await trace.evaluate("document.querySelector('#command-output').textContent.includes('headers') && !!document.querySelector('#command-links a')");
  if(!traceCommandTools)throw Error('TRACE command desk must return a linked official tool from search');
  await trace.evaluate("document.querySelector('[data-setup]').click()");
  const traceChecklist=await trace.evaluate("document.querySelector('#setup-progress-label').textContent.includes('1 of 12')");
  if(!traceChecklist)throw Error('TRACE workstation step tracking did not update');
  await trace.evaluate("document.querySelector('#tab-report').click()");
  const traceReport=await trace.evaluate("!document.querySelector('#view-report').hidden && !!document.querySelector('#export-brief') && !!document.querySelector('#export-transcript')");
  if(!traceReport)throw Error('TRACE capstone portfolio and export controls missing');
  // Finish the original case and confirm the next case unlocks without revisiting a list.
  await trace.evaluate("document.querySelector('#tab-missions').click()");
  await trace.evaluate("document.querySelector('.question-choices button:nth-child(1)').click()");
  await trace.evaluate("document.querySelector('#next-decision').click()");
  const traceLastStep=await trace.evaluate("window.TraceAcademyDebug.getProgress().step===2 && document.querySelector('#mission-stage .case-navigation-progress')?.textContent.includes('3 / 3')");
  if(!traceLastStep)throw Error('TRACE should advance visibly to the last decision');
  await trace.evaluate("document.querySelector('.question-choices button:nth-child(3)').click()");
  const traceFinishCue=await trace.evaluate("document.querySelector('#next-decision')?.textContent.includes('Complete case & start next')");
  if(!traceFinishCue)throw Error('TRACE must show an explicit finish-and-continue action');
  await trace.evaluate("document.querySelector('#next-decision').click()");
  const traceAdvanced=await trace.evaluate("window.TraceAcademyDebug.getProgress().completed===1 && window.TraceAcademyDebug.getProgress().active===1 && document.querySelector('#mission-stage h2')?.textContent.includes('Build a secure workstation') && document.querySelectorAll('.mission-option')[1]?.disabled===false && document.querySelector('#continue-training')?.textContent.includes('Resume Case 02')");
  if(!traceAdvanced)throw Error('TRACE must unlock and automatically open the next case and update its resume button');
  await trace.evaluate("document.querySelector('#case-directory > summary').click()");
  const traceDirectory=await trace.evaluate("document.querySelector('#case-directory').open && document.querySelectorAll('.mission-option').length===25");
  if(!traceDirectory)throw Error('TRACE optional case browser should open on demand');
  const casino=await navigate(site+'/candy-casino/');
  const casinoReady=await casino.evaluate("document.body.dataset.candyCasinoReady==='true' && document.querySelectorAll('[data-duel]').length===3 && document.querySelectorAll('[data-game]').length===0 && !!document.querySelector('[data-opponent=computer]') && !!document.querySelector('[data-opponent=friend]')");
  if(!casinoReady)throw Error('Candy Casino must show ONLY three competitive games with computer and friend choices');
  const casinoHeader=await casino.evaluate("(()=>{const h=document.querySelector('.casino-compact-header');const back=h?.querySelector('a.casino-back');return !!h&&back?.getAttribute('href')==='/'&&h.querySelector('.casino-header-title img')?.getAttribute('src')?.includes('casino.svg')&&!h.querySelector('.site-goo')&&!h.querySelector('.rcl-site-home-icon')&&document.querySelector('.casino-release-label')?.textContent.includes('Casino refresh')&&getComputedStyle(h).minHeight==='0px'})()");
  if(!casinoHeader)throw Error('Casino is showing the older duplicate-logo page instead of the compact refreshed header');
  const pokerGuideReady=await casino.evaluate("(()=>{const guide=document.querySelector('#poker-hand-guide'),arena=document.querySelector('#casino-arena'),rows=[...guide.querySelectorAll('.poker-rank-row')],names=rows.map(row=>row.querySelector('.poker-rank-meaning strong')?.textContent);return !guide.hidden && !!(arena.compareDocumentPosition(guide)&Node.DOCUMENT_POSITION_FOLLOWING) && rows.length===10 && names[0]==='Royal flush' && names[9]==='High card' && rows.every(row=>row.querySelectorAll('.poker-example-card').length===5) && document.querySelector('#poker-rules-jump')?.getAttribute('href')==='#poker-hand-guide'})()");
  if(!pokerGuideReady)throw Error('Casino poker hand rankings must appear below the game, from Royal flush down to High card with five-card examples');
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
  const guideHiddenOutsidePoker=await casino.evaluate("document.querySelector('#poker-hand-guide').hidden && getComputedStyle(document.querySelector('#poker-hand-guide')).display==='none' && document.querySelector('#poker-rules-jump').hidden");
  if(!guideHiddenOutsidePoker)throw Error('Poker hand guide must hide when High Card is selected');
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
  const duelReady=await arcade.evaluate("document.querySelectorAll('.player').length===2 && document.querySelectorAll('#tiles1 .tile').length===12");
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
  // The older "check" helper is bound to the After Dark tab, which was closed
  // when we navigated to the homepage. Always query the CURRENT home tab.
  const checkHomepage=async (desc,js)=>{
    const result=await home.evaluate(js);
    if(!result)throw Error('Candy Land homepage regression: '+desc);
    console.log('✓',desc);
  };
  const homepageCardAudit=await home.evaluate("(()=>{const cards=[...document.querySelectorAll('.candyland-play-shelves .candyland-hero-tool-link')],shelves=[...document.querySelectorAll('.candyland-play-shelf')];return {hero:!!document.querySelector('.candyland-opening'),shelves:shelves.length,cards:cards.length,withImage:cards.filter(x=>!!x.querySelector('img')).length,withName:cards.filter(x=>!!x.querySelector('.candyland-hero-tool-name')).length,withDurationOrReports:cards.filter(x=>!!x.querySelector('.candyland-hero-tool-duration')||!!x.querySelector('.candyland-unwrapped-feature-outputs')).length,links:[...new Set(cards.map(x=>x.getAttribute('href')))],classes:shelves.map(x=>x.className),noNotify:!document.querySelector('.candyland-notify-section')&&!document.querySelector('#rcl-notify-center'),noToolStrip:!document.querySelector('.candyland-tools-strip')}})()");
  console.log('Homepage card audit:',JSON.stringify(homepageCardAudit));
  await checkHomepage('Thirteen illustrated games and learning tools are organized into seven categories',
    "(()=>{const hero=document.querySelector('.candyland-opening');const shelves=[...document.querySelectorAll('.candyland-play-shelf')];const cards=[...document.querySelectorAll('.candyland-play-shelves .candyland-hero-tool-link')];const links=new Set(cards.map(x=>x.getAttribute('href')));return !!hero&&shelves.length===7&&cards.length===13&&cards.every(x=>!!x.querySelector('img')&&!!x.querySelector('.candyland-hero-tool-name')&&(!!x.querySelector('.candyland-hero-tool-duration')||!!x.querySelector('.candyland-unwrapped-feature-cta')))&&links.has('/after-dark/')&&links.has('/moodropolis/')&&links.has('/the-corridors/')&&links.has('/the-docket/')&&links.has('/ai-academy/')&&!!document.querySelector('.candyland-play-shelf-multiplayer')&&!!document.querySelector('.candyland-play-shelf-ongoing')&&!document.querySelector('.candyland-notify-section')&&!document.querySelector('#rcl-notify-center')&&!document.querySelector('.candyland-tools-strip')})()");
  await checkHomepage('Explore & Understand showcases six spaced Unwrapped topic bubbles',
    "(()=>{const first=document.querySelector('.candyland-play-shelves > .candyland-play-shelf'),card=first?.querySelector('a.candyland-unwrapped-feature-card'),logo=card?.querySelector('img'),desc=card?.querySelector('.candyland-unwrapped-feature-description'),cta=card?.querySelector('.candyland-unwrapped-feature-cta');return !!first?.classList.contains('candyland-play-shelf-discovery')&&first.querySelector('h2')?.textContent==='Explore & Understand'&&card?.getAttribute('href')==='/after-dark/'&&logo?.getAttribute('src')==='/tool-icons/unwrapped.svg'&&!!desc?.textContent.includes('psychology')&&!!desc.textContent.includes('partner')&&!!cta&&card.querySelectorAll('.candyland-unwrapped-feature-outputs>span').length===6&&document.querySelectorAll('.candyland-play-shelf').length===7})()");
  await checkHomepage('Thirteen illustrated homepage tool icons resolve successfully',
    "(async()=>{const imgs=[...document.querySelectorAll('.candyland-play-shelves .candyland-hero-tools img')];return imgs.length===13&&(await Promise.all(imgs.map(async img=>{try{const r=await fetch(img.src,{method:'GET',cache:'no-store'});return r.ok&&(r.headers.get('content-type')||'').startsWith('image/')}catch{return false}}))).every(Boolean)})()");
  await checkHomepage('Multiplayer, ongoing and story games remain separated',
    "!document.querySelector('.candyland-hero-categories') && !document.querySelector('.candyland-category-guide') && document.querySelectorAll('.candyland-play-shelf').length===7 && !!document.querySelector('.candyland-play-shelf-multiplayer .candyland-multiplayer-tag.online') && !!document.querySelector('.candyland-play-shelf-ongoing') && !document.querySelector('.candyland-future-games') && !document.body.textContent.includes('Meridian Universe') && !!document.querySelector('.candyland-install-apps:not([open])')");
  await checkHomepage('Creative and Music Tools section and Candy Pulse are gone, but Random AI advertisement remains',
    "(()=>{const shelves=[...document.querySelectorAll('.candyland-play-shelf')];return shelves.length===7&&!shelves.some(x=>/Creative & Music Tools/i.test(x.textContent))&&!document.body.textContent.includes('Candy Pulse')&&!document.querySelector('a[href^=\"/music-visualizer/\"]')&&!document.querySelector('.candyland-play-shelf-creative')&&!!document.querySelector('.candyland-random-ai-promo-link[href=\"/studio/\"]')})()");
  await checkHomepage('Left-aligned Candy Land brand with wide Random AI feature and no Unwrapped top promotion',
    "(()=>{const bar=document.querySelector('header.candyland-navbar.candyland-navbar-ai'),brand=bar?.querySelector('.candyland-identity'),ad=bar?.querySelector('.candyland-random-ai-promo-link'),shelf=document.querySelector('.candyland-play-shelf-discovery');if(!bar||!brand||!ad||!shelf)return false;const h=bar.getBoundingClientRect(),l=brand.getBoundingClientRect(),a=ad.getBoundingClientRect();return h.height<=110&&l.left<a.left&&a.right<=h.right+3&&a.width>l.width&&ad.getAttribute('href')==='/studio/'&&!!ad.textContent.includes('Free, unlimited private local AI')&&!!ad.textContent.includes('recommended AI stack')&&!bar.querySelector('.candyland-unwrapped-promo')&&!!shelf.querySelector('a[href=\"/after-dark/\"]')})()");
  await checkHomepage('All seven grouped shelves display without filter tabs or extra instruction text',
    "document.querySelectorAll('.candyland-play-shelf').length===7 && !document.querySelector('.candyland-hero-categories') && !document.querySelector('.candyland-category-guide') && !!document.querySelector('.candyland-play-shelf-ongoing a[href=\"/moodropolis/\"]')");
  await checkHomepage('All thirteen games and learning tools return in categorized sections',
    "document.querySelectorAll('.candyland-play-shelves .candyland-hero-tool-link').length===13 && document.querySelectorAll('.candyland-play-shelf').length===7");
  await checkHomepage('ARN news ticker links to a lower full Absurdity Report article',
    "(()=>{const bar=document.querySelector('#nonsense.nonsense-report'),ticker=bar?.querySelector('.nonsense-report-ticker'),brand=bar?.querySelector('#nonsense-heading'),open=bar?.querySelector('.nonsense-report-open'),destination=document.querySelector('#absurder-report-destination'),detail=destination?.querySelector('#nonsense-story-detail');return !!bar&&!!ticker&&brand?.textContent.includes('ARN NEWS')&&!brand?.textContent.includes('ABSURDITY')&&!!open?.textContent.includes('Read full story')&&!!destination?.textContent.includes('THE ABSURDITY REPORT')&&detail?.hidden===true&&ticker.getBoundingClientRect().height<=70})()");
  await home.evaluate("window.scrollTo(0,0);document.querySelector('#nonsense .nonsense-report-open').click()");
  await delay(220);
  const scrolledToArticle=await home.evaluate("(()=>{const target=document.querySelector('#absurder-report-destination');return !!target&&document.activeElement===target&&window.scrollY>0})()");
  if(!scrolledToArticle)throw Error('ARN ticker should scroll and focus the lower Absurdity Report destination');
  const storyOpen=await home.evaluate("(()=>{const destination=document.querySelector('#absurder-report-destination'),panel=destination?.querySelector('#nonsense-story-detail');return panel?.hidden===false&&!!panel.querySelector('h3')&&!!panel.querySelector('.nonsense-generate')&&destination.textContent.includes('THE ABSURDITY REPORT')})()");
  if(!storyOpen)throw Error('Ticker click must open the full article inside the lower Absurdity Report section');
  const beforeStory=await home.evaluate("document.querySelector('#absurder-report-destination .nonsense-news-article').textContent");
  await home.evaluate("document.querySelector('#absurder-report-destination .nonsense-generate').click()");
  const afterStory=await home.evaluate("document.querySelector('#absurder-report-destination .nonsense-news-article').textContent");
  if(beforeStory===afterStory)throw Error('Next Story must change the lower report article');
  await home.evaluate("document.querySelector('#absurder-report-destination .nonsense-report-close').click()");
  const storyClosed=await home.evaluate("document.querySelector('#absurder-report-destination #nonsense-story-detail')?.hidden===true");
  if(!storyClosed)throw Error('Close Story must collapse the lower article');
  await checkHomepage('Unwrapped stays in first shelf with six topic bubbles and a clear CTA',
    "(()=>{const first=document.querySelector('.candyland-play-shelves')?.firstElementChild,card=first?.querySelector('.candyland-unwrapped-feature-card'),desc=card?.querySelector('.candyland-unwrapped-feature-description');return !!first?.classList.contains('candyland-play-shelf-discovery')&&card?.getAttribute('href')==='/after-dark/'&&!!desc?.textContent.includes('psychology')&&!!card.querySelector('.candyland-unwrapped-feature-cta')&&card.querySelectorAll('.candyland-unwrapped-feature-outputs>span').length===6&&!document.querySelector('header .candyland-unwrapped-promo')})()");
  console.log('✓ The Absurdity Report live ticker opens and closes full articles; all Unwrapped and game shelves remain intact.');

  // Candy Studio is an additional /studio/ section, never the new homepage.
  // Test actual browser controls without a paid model or customer credentials.
  const studio=await navigate(site+'/studio/');
  const studioLoaded=await studio.evaluate("!!document.querySelector('#view-home.active') && document.querySelectorAll('.feature-card').length===4 && document.querySelector('a.brand')?.getAttribute('href')==='/'");
  if(!studioLoaded)throw Error('Candy Studio did not load as its own add-on section');
  await studio.evaluate(`document.querySelector('[data-view="tools"]').click()`);
  const studioTools=await studio.evaluate("document.querySelector('#view-tools.active')!==null && document.querySelectorAll('#toolsGrid .tool-card').length===24");
  if(!studioTools)throw Error('Candy Studio must show 24 working guided tools');
  await studio.evaluate("document.querySelector('#toolSearch').value='email';document.querySelector('#toolSearch').dispatchEvent(new Event('input',{bubbles:true}))");
  const studioSearch=await studio.evaluate("document.querySelectorAll('#toolsGrid .tool-card').length>=1 && [...document.querySelectorAll('#toolsGrid .tool-card')].every(x=>x.textContent.toLowerCase().includes('email'))");
  if(!studioSearch)throw Error('Candy Studio searchable tools filter did not work');
  await studio.evaluate(`document.querySelector('#toolsGrid [data-tool="professional-email"]').click()`);
  const studioPrompt=await studio.evaluate("!!document.querySelector('#view-chat.active') && document.querySelector('#chatInput').value.includes('Draft a polished professional email')");
  if(!studioPrompt)throw Error('Candy Studio guided tool did not open chat with a real prompt');
  await studio.evaluate(`document.querySelector('[data-view="visual"]').click();document.querySelector('#artPrompt').value='bright playful nebula';document.querySelector('#artGenerate').click()`);
  const studioArt=await studio.evaluate("document.querySelector('#view-visual.active')!==null && document.querySelector('#artCanvas').width===1024 && document.querySelector('#artCanvas').getContext('2d').getImageData(30,30,1,1).data[3]>0");
  if(!studioArt){const artDiagnostics=await studio.evaluate("(()=>{const c=document.querySelector('#artCanvas'),context=c?.getContext('2d');return {visible:!!document.querySelector('#view-visual.active'),canvasWidth:c?.width,canvasHeight:c?.height,context:!!context,pixel:context?[...context.getImageData(30,30,1,1).data]:null,generatedButton:!!document.querySelector('#artGenerate'),status:document.querySelector('#toast')?.textContent,selectedView:document.querySelector('.view.active')?.id}})()");console.error('Candy Studio art diagnostics:',JSON.stringify(artDiagnostics));throw Error('Candy Studio original artwork generator did not create pixels');}
  await studio.evaluate(`document.querySelector('[data-view="settings"]').click()`);
  const studioSettings=await studio.evaluate("!!document.querySelector('#view-settings.active') && !!document.querySelector('#modelSelect') && !!document.querySelector('#loadModel') && !!document.querySelector('#topModelSelect') && !!document.querySelector('#modelResults') && !!document.querySelector('#instantSetup') && !!document.querySelector('#instantSetupCheck') && !document.querySelector('#cloudKey') && !document.querySelector('#connectCloud') && !document.querySelector('#communityStatus')");
  if(!studioSettings)throw Error('Random AI must expose local and Instant AI setup without browser-side provider credentials');
  const savedModelControls=await studio.evaluate("(()=>{const m=window.RandomAIModelMemory;return !!m&&typeof m.register==='function'&&typeof m.isSaved==='function'&&typeof m.markLoaded==='function'&&!!document.querySelector('#savedModels #savedModelList')&&!!document.querySelector('#savedModelRefresh')&&!!document.querySelector('#savedModelKeep')&&!!document.querySelector('#savedModelHome')&&!!document.querySelector('#chatSavedModelHint')})()");
  if(!savedModelControls)throw Error('Random AI must rediscover and list downloaded models when reopened');

  const persistentProgress=await studio.evaluate("(()=>{const p=document.querySelector('#modelProgress'),bar=document.querySelector('#modelProgressBar');return !!p && !!bar && p.closest('.workspace') && !p.closest('#view-settings') && !!document.querySelector('#modelProgressPercent') && !!document.querySelector('#modelProgressText') && !!document.querySelector('#modelProgressClose') && document.querySelectorAll('#modelProgress').length===1})()");
  if(!persistentProgress)throw Error('Model download progress needs to be accessible outside Settings');
  await studio.evaluate("document.querySelector('[data-view=chat]').click();document.querySelector('#chatTransport').value='local';document.querySelector('#chatTransport').dispatchEvent(new Event('change',{bubbles:true}))");
  const localModeControl=await studio.evaluate("document.querySelector('#hostedChoice')?.hidden && !!document.querySelector('#chatModelHint')?.textContent.includes('device')");
  if(!localModeControl)throw Error('Local AI mode selection is not working');
  await studio.evaluate("document.querySelector('#chatTransport').value='instant';document.querySelector('#chatTransport').dispatchEvent(new Event('change',{bubbles:true}))");
  const instantModeControl=await studio.evaluate("!document.querySelector('#hostedChoice')?.hidden && !!document.querySelector('#instantStatus')?.textContent && !!document.querySelector('#instantModel').value");
  if(!instantModeControl)throw Error('Instant AI no-download selection or status is unavailable');
  await studio.evaluate("document.querySelector('[data-view=home]').click()");
  const modelFirst=await studio.evaluate("(()=>{const home=document.querySelector('#view-home'),list=home?.querySelector('#topAiList'),uncensored=home?.querySelector('#uncensoredChoices'),picker=document.querySelector('#stackTaskChat');return !!window.RandomAITopModels&&!!list&&!!uncensored&&!!document.querySelector('#topAiRefresh')&&!!document.querySelector('#topAiDeviceSummary')&&!!document.querySelector('#uncensoredModels[open]')&&!!document.querySelector('#advancedModelCatalog:not([open])')&&!document.querySelector('#stackTaskHome')&&!document.querySelector('.stack-feature')&&!document.querySelector('.stack-chat-controls')&&!!picker?.closest('[hidden]')&&!!document.querySelector('#chatQuickSavedModels')})()");
  if(!modelFirst)throw Error('Random AI must replace task selectors with phone-aware top models and a distinct open-model section');
  const portableDownloads=await studio.evaluate("(()=>{const host=document.querySelector('#portablePhoneModels'),cards=[...host?.querySelectorAll('[data-portable-model]')||[]],links=[...host?.querySelectorAll('a[data-phone-file-info]')||[]];return !!host&&!!document.querySelector('#portableModelDevice')&&!!document.querySelector('#phoneGGUFPicker')&&!!window.RandomAIPhoneFiles&&cards.length===6&&links.length===7&&links.every(link=>{const u=new URL(link.href);return u.protocol==='https:'&&u.hostname==='huggingface.co'&&u.pathname.endsWith('.gguf')&&u.searchParams.get('download')==='true'&&link.target==='_blank'})&&host.textContent.includes('Lexi Uncensored')&&host.textContent.includes('WebLLM')})()");
  if(!portableDownloads)throw Error('Phone model list must have six role-specialized models and seven verified downloadable GGUF files');
  const portablePicker=await studio.evaluate("(()=>{const input=document.querySelector('#phoneGGUFPicker'),selection=new DataTransfer();selection.items.add(new File(['GGUF'],'my-local-model.gguf',{type:'application/octet-stream'}));input.files=selection.files;input.dispatchEvent(new Event('change',{bubbles:true}));const text=document.querySelector('#phoneGGUFStatus').textContent;return text.includes('my-local-model.gguf')&&text.includes('never uploads')===false&&input.files.length===0})()");
  if(!portablePicker)throw Error('Phone GGUF picker must inspect files locally and not retain model bytes');
  await studio.evaluate("document.querySelector('[data-view=settings]').click();document.querySelector('[data-open-portable-files]').click()");
  const portableShortcut=await studio.evaluate("!!document.querySelector('#view-home.active')&&!!document.querySelector('#portablePhoneModels')");
  if(!portableShortcut)throw Error('Models & setup should open the portable model download section in one tap');
  console.log('✓ Six phone models for chat, coding and photo understanding with seven GGUF files; uncensored and external photo apps are available.');

  // A beginner should have an obvious, working model selection route from chat and settings.
  // Test it at mobile, tablet and desktop viewport widths.
  for(const width of [390,820,1365]){
    await studio.setViewport({width,height:860});
    await studio.evaluate("document.querySelector('[data-view=chat]').click()");
    const chatChooser=await studio.evaluate("(()=>{const helper=document.querySelector('#view-chat .model-chooser-help'),button=helper?.querySelector('[data-open-top-models]');return !!helper&&!!button&&getComputedStyle(helper).display!=='none'&&button.getBoundingClientRect().width>0&&button.getBoundingClientRect().right<=window.innerWidth+2})()");
    if(!chatChooser)throw Error('Model chooser should be visible and usable across device widths '+width);
    await studio.evaluate("new Promise(done=>{document.querySelector('#view-chat [data-open-top-models]').click();requestAnimationFrame(()=>requestAnimationFrame(done))})");
    const arrived=await studio.evaluate("(()=>{const section=document.querySelector('#topAiModels');return !!document.querySelector('#view-home.active')&&!!section&&document.activeElement===section&&section.getAttribute('tabindex')==='-1'&&section.querySelector('h2')?.textContent.includes('your device')})()");
    if(!arrived)throw Error('Help me choose button must open and focus Top Models on viewport '+width);
    await studio.evaluate("document.querySelector('[data-view=settings]').click()");
    const settingsChooser=await studio.evaluate("(()=>{const helper=document.querySelector('#view-settings .model-chooser-help');return !!helper&&!!helper.querySelector('[data-open-top-models]')&&!!document.querySelector('.model-picker-help [data-open-top-models]')&&document.querySelector('.top-ai-settings h2')?.textContent.includes('your device')})()");
    if(!settingsChooser)throw Error('Settings must offer a Top Models guide rather than assuming a phone '+width);
  }
  await studio.setViewport({width:1240,height:860});
  console.log('✓ Top Models beginner prompts work and are keyboard-focusable at phone, tablet and desktop viewports.');


  const capabilitiesTest=await studio.evaluate("(()=>{const area=document.querySelector('#topAiModels'),filter=area?.querySelectorAll('[data-capability-view]'),skills=area?.querySelector('.model-specialist-guide'),status=area?.querySelector('#topAiBenchmarkStatus'),code=document.querySelector('[data-portable-model=\"qwen-coder\"]'),vision=document.querySelector('[data-portable-model=\"qwen-vision\"]'),images=document.querySelector('#phoneImageModels');return !!window.RandomAIModelBenchmark?.run&&filter?.length===6&&!!skills&&!!status&&!!code?.querySelector('.portable-model-capabilities')&&!!vision?.querySelector('.portable-model-capabilities')&&!!images?.textContent.includes('Stable Diffusion')&&!!images.textContent.includes('Draw Things')&&!!document.querySelector('.model-rating-legend')})()");
  if(!capabilitiesTest)throw Error('Random AI must explain six categories, coding/image models, performance ratings and real mini-test');
  await studio.evaluate("document.querySelector('[data-capability-view=\"photos\"]').click()");
  const photoTabTest=await studio.evaluate("document.querySelector('#topAiCapabilityNote')?.textContent.includes('cannot generate')&&document.querySelector('[data-capability-view=\"photos\"]').getAttribute('aria-pressed')==='true'");
  if(!photoTabTest)throw Error('Photo capabilities must distinguish text prompts from true photo generation');
  await studio.evaluate("document.querySelector('[data-capability-view=\"all\"]').click()");
  const benchmarkNotFabricated=await studio.evaluate("(()=>{const b=document.querySelector('.model-rating-legend');return !!b?.textContent.includes('Four checks')&&!!document.querySelector('#topAiBenchmarkStatus')&&!!document.querySelector('[data-portable-model=\"qwen-coder\"] .portable-model-ratings')})()");
  if(!benchmarkNotFabricated)throw Error('Accuracy and response-time labels must be testable and honest');
  const modelEvaluate=await studio.evaluate("(()=>{const api=window.RandomAITopModels;const x=api.evaluate({id:'Hermes-3-Llama-3.1-8B-q4f16_1-MLC',vram:3950});return x&&typeof x.label==='string'&&typeof x.explanation==='string'&&Array.isArray(api.listed())})()");
  if(!modelEvaluate)throw Error('Random AI device assessment should be explicit and conservative');
  console.log('✓ Random AI top models, uncensored-compatible section, hidden task controls, and local/hosted modes work.');

  // TRACE Evidence Files stays in the course; the profile tool is on an independent route.
  const traceEvidence=await navigate(site+'/osint-academy/');
  const evidenceReady=await traceEvidence.evaluate("(()=>{document.querySelector('#tab-identity').click();return document.querySelector('#view-identity h2')?.textContent==='Evidence Files'&&!!document.querySelector('#trace-identity-lab [data-idcase]')&&!document.querySelector('#trace-profile-review')})()");
  if(!evidenceReady)throw Error('TRACE Evidence Files challenge or standalone separation failed');
  const traceProfile=await navigate(site+'/identity-lab/');
  const profileReady=await traceProfile.evaluate("(()=>{const p=window.TraceProfileReview;return !!p&&p.getCurrentStep()===0&&!!document.querySelector('#trace-profile-review')&&document.querySelectorAll('#profileSteps [data-profile-step]').length===3&&document.querySelector('#profile-username')})()");
  if(!profileReady)throw Error('Standalone Identity Lab optional self-report editor failed to initialize');
  const liveResearchReady=await traceProfile.evaluate("(async()=>{const old=window.fetch;let apiCalls=0;try{const field=document.querySelector('#profile-quick-input'),button=document.querySelector('#profile-research'),permission=document.querySelector('#profile-research-consent'),kind=document.querySelector('#profile-quick-kind');if(!field||!button||!permission||!kind)return false;field.value='publictesthandle';kind.value='username';if(window.TraceProfileReview.getLiveResultCount()!==0)return false;window.fetch=async function(url,opts){if(String(url).startsWith('https://api.github.com/users/')){apiCalls++;return {ok:true,status:200,json:async()=>({type:'User',login:'publictesthandle',name:'Sample Public Account',html_url:'https://github.com/publictesthandle'})}}if(String(url).startsWith('https://gitlab.com/api/v4/users?username=')){return {ok:true,status:200,json:async()=>([])}}if(String(url).startsWith('https://codeberg.org/api/v1/users/')){return {ok:true,status:404,json:async()=>({})}}return old.call(this,url,opts)};permission.checked=true;button.click();for(let i=0;i<30&&document.querySelectorAll('#profile-research-results .trace-profile-found-card').length===0;i++)await new Promise(r=>setTimeout(r,30));const good=!!document.querySelector('#profile-report-from-results')&&!document.querySelector('#profile-report-from-results').hidden&&apiCalls===1&&window.TraceProfileReview.getLiveResultCount()===1&&document.querySelector('#profile-research-results').textContent.includes('Sample Public Account')&&document.querySelector('#profile-research-results a[href=\"https://github.com/publictesthandle\"]')&&window.TraceProfileReview.getCount()===0;field.value='';permission.checked=false;return !!good}finally{window.fetch=old}})()");
  if(!liveResearchReady)throw Error('Identity Lab one-clue public-source lookup did not show an attributed result without creating a false confirmed connection');
  await traceProfile.evaluate("document.querySelector('#profile-username').value='@sampleconsented';document.querySelector('#profile-next').click()");
  const step2=await traceProfile.evaluate("window.TraceProfileReview.getCurrentStep()===1&&document.querySelector('#profile-username').value==='@sampleconsented'&&document.querySelector('#profile-candidates').children.length===1");
  if(!step2)throw Error('Identity Lab lost an optional-only username or did not show evidence step');
  await traceProfile.evaluate("document.querySelector('#candidate-notes').value='Publicly supplied clue without URL or formal source.';document.querySelector('#candidate-add').click()");
  const partialClue=await traceProfile.evaluate("window.TraceProfileReview.getCount()===1&&document.querySelectorAll('#profile-candidates .trace-profile-evidence-card').length===1&&document.querySelector('#candidate-status').textContent.includes('Clue added')");
  if(!partialClue)throw Error('Identity Lab must accept partial evidence without requiring a URL, platform or source');
  await traceProfile.evaluate("document.querySelector('#profile-next').click()");
  const review=await traceProfile.evaluate("window.TraceProfileReview.getCurrentStep()===2&&document.querySelector('#profile-report').textContent.includes('@sampleconsented')&&document.querySelector('#profile-report').textContent.includes('1')");
  if(!review)throw Error('Identity Lab could not produce a partial-information report');
  await traceProfile.evaluate("document.querySelector('#profile-consent').checked=true;document.querySelector('#profile-export').click()");
  const reportExport=await traceProfile.evaluate("document.querySelector('#profile-status').textContent.includes('prepared for download')");
  if(!reportExport){const reportDiagnostics=await traceProfile.evaluate("(()=>{const x=document.querySelector('#trace-profile-review'),buttons=[...document.querySelectorAll('#profile-export')],sts=[...document.querySelectorAll('#profile-status')];return {status:sts.map(n=>({text:n.textContent,inRoot:x?.contains(n),outer:n.outerHTML.slice(0,250)})),buttons:buttons.map(n=>({outer:n.outerHTML,connected:n.isConnected,inRoot:x?.contains(n)})),consent:document.querySelector('#profile-consent')?.checked,step:window.TraceProfileReview?.getCurrentStep(),count:window.TraceProfileReview?.getCount(),href:location.href}})()");console.error('TRACE JS runtime errors:',JSON.stringify(testErrors.slice(-6)));console.error('TRACE export diagnostics:',JSON.stringify(reportDiagnostics));throw Error('Identity Lab could not export an explicitly authorized partial report');}
  await traceProfile.evaluate("window.confirm=()=>true;document.querySelector('#profile-clear').click();document.querySelector('[data-profile-step=\"2\"]').click()");
  const blank=await traceProfile.evaluate("window.TraceProfileReview.getCount()===0&&document.querySelector('#profile-report').textContent.includes('blank template')&&document.querySelector('#profile-name').value===''"); 
  if(!blank)throw Error('Identity Lab must allow an entirely blank profile template');
  console.log('✓ TRACE Identity Lab supports optional data, incomplete clues, editable guided steps, export and blank reports.');

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
