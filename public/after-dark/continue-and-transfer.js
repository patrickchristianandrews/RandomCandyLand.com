/* Private progress, reading bookmarks and cross-device quiz transfer.
 * All personal quiz content stays in this browser unless someone explicitly
 * downloads a JSON file and chooses to import it on another device.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const DIRECT=()=>window.AfterDarkDirectQuizBridge;
const PSYCH=()=>window.AfterDarkPsychQuizBridge;
const BOOKMARK_KEY='afterdark_reading_places_v1';
const FORMAT='afterdark-private-quiz-transfer';
const VERSION=1;
const allowedTabs=new Set(['atlas','quiz','psych-quiz','psych','ideas','chat','howto','guide','notebook']);
const el=(tag,text,cls)=>{
 const e=document.createElement(tag);
 if(text!==undefined)e.textContent=text;
 if(cls)e.className=cls;
 return e;
};
const btn=(text,action,cls='btn alt')=>{
 const b=el('button',text,cls);b.type='button';b.addEventListener('click',action);return b;
};
const safeJSON=s=>{try{return JSON.parse(s)}catch{return null}};
const local={
 get(key){try{return localStorage.getItem(key)}catch{return null}},
 set(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
};
const currentTab=()=>document.querySelector('.tab.visible')?.id||'home';
const cleanSaved=()=>{
 const raw=safeJSON(local.get(BOOKMARK_KEY)||'null');
 if(!raw||typeof raw!=='object'||!raw.sections||typeof raw.sections!=='object')return{sections:{},last:null};
 const sections={};
 for(const [key,value] of Object.entries(raw.sections)){
  if(!allowedTabs.has(key)||!value||typeof value!=='object')continue;
  sections[key]={tab:key,offset:Number.isFinite(value.offset)?Math.max(0,Math.min(200000,value.offset)):0,
   guide:typeof value.guide==='string'?value.guide.slice(0,60):'',time:Number(value.time)||0};
 }
 return{sections,last:allowedTabs.has(raw.last)?raw.last:null};
};
let bookmarks=cleanSaved();
let scrollTimer=0,restoring=false;
function activeGuide(){
 const detail=$('howto-guide-detail');
 if(!detail||detail.hidden)return'';
 const heading=detail.querySelector('h2')?.textContent||'';
 return window.AfterDarkIntimacyGuides?.guides?.find(g=>heading.includes(g.title))?.id||'';
}
function savePlace(showNotice=false){
 const tab=currentTab();
 if(!allowedTabs.has(tab))return false;
 const old=bookmarks.sections[tab];
 const guide=tab==='howto'?activeGuide():'';
 bookmarks.sections[tab]={tab,offset:Math.max(0,Math.round(window.scrollY||0)),guide:guide||old?.guide||'',time:Date.now()};
 bookmarks.last=tab;
 const ok=local.set(BOOKMARK_KEY,JSON.stringify(bookmarks));
 if(showNotice)setStatus(ok?'✓ Place saved privately on this device.':'Could not save in this browser. You can still download your quiz answers.');
 refreshReading();
 return ok;
}
function setStatus(message){
 const node=$('afterdark-save-status');
 if(node)node.textContent=message;
 const feedback=$('quiz-save-feedback');
 if(feedback)feedback.textContent=message;
}
function friendlyTab(tab){
 return {'quiz':'Sexual Preferences Quiz','psych-quiz':'Psychology Quiz','howto':'Orgasm Guides','atlas':'Curiosity Atlas','psych':'Psychology Library','ideas':'Idea Lab','chat':'Ask Atlas','guide':'Resources','notebook':'My Notebook'}[tab]||'your reading';
}
function goTo(tab){
 if(tab==='quiz'){DIRECT()?.resume?.();return;}
 if(tab==='psych-quiz'){PSYCH()?.resume?.();return;}
 const trigger=document.querySelector('[data-tab="'+tab+'"]')||document.querySelector('[data-goto="'+tab+'"]');
 if(trigger)trigger.click();
 else if(typeof window.renderTabs==='function')window.renderTabs(tab);
}
function resumePlace(){
 const existing=bookmarks.last&&bookmarks.sections[bookmarks.last]?bookmarks.sections[bookmarks.last]:null;
 const direct=Number(DIRECT()?.getProgress?.()?.position??-1);
 const psych=Number(PSYCH()?.getProgress?.()?.position??-1);
 const place=existing||(direct>=0&&direct<32?{tab:'quiz',offset:0}:psych>=0&&psych<32?{tab:'psych-quiz',offset:0}:null);
 if(!place){setStatus('No saved place yet. Open a guide or start a quiz first.');return;}
 restoring=true;
 goTo(place.tab);
 if(place.tab==='howto'&&place.guide)window.AfterDarkIntimacyGuides?.open?.(place.guide);
 setTimeout(()=>{
  if(place.tab==='quiz'||place.tab==='psych-quiz'){
   $(place.tab==='quiz'?'quizCard':'psychQuizCard')?.scrollIntoView?.({block:'start',behavior:'instant'});
  }else window.scrollTo({top:place.offset,behavior:'instant'});
  restoring=false;
  setStatus('✓ Returned to '+friendlyTab(place.tab)+'. Your progress is saved locally.');
 },180);
}
function refreshReading(){
 const target=$('afterdark-resume-place'),last=bookmarks.last;
 if(!target)return;
 const direct=Number(DIRECT()?.getProgress?.()?.position??-1);
 const psych=Number(PSYCH()?.getProgress?.()?.position??-1);
 const actual=last||(direct>=0&&direct<32?'quiz':psych>=0&&psych<32?'psych-quiz':null);
 target.disabled=!actual;
 target.textContent=actual?'↪ Continue '+friendlyTab(actual):'↪ Continue later';
}
function formatProgress(kind){
 const p=kind==='direct'?DIRECT()?.getProgress?.():PSYCH()?.getProgress?.();
 if(!p)return 'Unavailable';
 if(p.complete)return 'Completed · '+p.answered+' of 32 answered';
 if(p.position<0)return 'Not started';
 return 'Saved at question '+(p.position+1)+' of 32 · '+p.answered+' answered';
}
function answered(kind){
 const p=kind==='direct'?DIRECT()?.getProgress?.():PSYCH()?.getProgress?.();
 return Number(p?.answered)||0;
}
function started(kind){
 const p=kind==='direct'?DIRECT()?.getProgress?.():PSYCH()?.getProgress?.();
 return (p?.position??-1)>=0;
}
function createTransfer({direct=null,psych=null}){
 return{format:FORMAT,version:VERSION,created:new Date().toISOString(),
  note:'Contains private quiz answers and notes. It is not encrypted. Only share when intended.',
  direct,psych};
}
function download(kind){
 const direct=kind==='psych'?null:DIRECT()?.exportState?.();
 const psych=kind==='direct'?null:PSYCH()?.exportState?.();
 const pack=createTransfer({direct,psych});
 const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;
 a.download='after-dark-'+(kind==='both'?'both-quizzes':kind==='direct'?'sexual-preferences-quiz':'psychology-quiz')+'-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 setStatus('Quiz file saved to your downloads. It includes private answers and optional notes; keep it somewhere safe.');
}
function validatePayload(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||value.format!==FORMAT||value.version!==VERSION)return null;
 const validQuiz=(raw,type)=>{
  if(raw===null||raw===undefined)return null;
  if(typeof raw!=='object'||Array.isArray(raw))throw Error('Quiz section has an invalid structure');
  const index=type==='direct'?raw.qIndex:raw.position;
  const answerSet=type==='direct'?raw.multiAnswers:raw.answers;
  const noteSet=type==='direct'?raw.freeResponses:raw.notes;
  if(!Number.isInteger(index)||index< -1||index>32||
    !answerSet||typeof answerSet!=='object'||Array.isArray(answerSet)||
    !noteSet||typeof noteSet!=='object'||Array.isArray(noteSet))throw Error('Invalid saved quiz position or answers');
  const questions=type==='direct'?window.AfterDarkAdultQuiz:window.AfterDarkPsychologyQuiz;
  if(!Array.isArray(questions)||questions.length!==32)throw Error('Quiz questions are unavailable');
  if(Object.keys(answerSet).length>32||Object.keys(noteSet).length>32)throw Error('Too many quiz entries');
  const validKeys=obj=>Object.keys(obj).every(k=>/^(?:[0-9]|[12][0-9]|3[01])$/.test(k));
  if(!validKeys(answerSet)||!validKeys(noteSet))throw Error('Unexpected question in saved file');
  for(let i=0;i<32;i++){
   if(Object.hasOwn(answerSet,i)){
    const entries=answerSet[i];
    if(!Array.isArray(entries)||entries.length>questions[i].options.length||
       !entries.every(n=>Number.isInteger(n)&&n>=0&&n<questions[i].options.length))throw Error('Invalid selected answer at question '+(i+1));
   }
   if(Object.hasOwn(noteSet,i)&&(typeof noteSet[i]!=='string'||noteSet[i].length>600))
    throw Error('Invalid private note at question '+(i+1));
  }
  return raw;
 };
 let direct,psych;
 try{direct=validQuiz(value.direct,'direct');psych=validQuiz(value.psych,'psych')}catch(e){return{error:e.message}}
 if(!direct&&!psych)return{error:'The file does not contain a quiz.'};
 return{direct,psych};
}
async function importFile(file){
 if(!file)return;
 try{
  if(file.size>125000)throw Error('This quiz file is too large (maximum 125 KB).');
  const pack=validatePayload(safeJSON(await file.text()));
  if(!pack||pack.error)throw Error(pack?.error||'This is not an After Dark quiz JSON export.');
  const replacing=(pack.direct&&answered('direct')>0)||(pack.psych&&answered('psych')>0);
  if(replacing&&!window.confirm('The imported file contains answers for a quiz you have already started. Replace only that matching quiz? Answers from the other quiz will be preserved.'))return;
  // The two quiz datasets remain distinct. A psychology file NEVER overwrites
  // sexual-preference answers, and vice versa.
  if(pack.direct&&!DIRECT()?.importState?.(pack.direct))throw Error('The saved sexual-preferences quiz could not be loaded.');
  if(pack.psych&&!PSYCH()?.importState?.(pack.psych))throw Error('The saved psychology quiz could not be loaded.');
  refreshPanels();
  const both=answered('direct')>0&&answered('psych')>0;
  setStatus('✓ Imported '+[pack.direct?'sexual-preferences':'',pack.psych?'psychology':''].filter(Boolean).join(' and ')+' answers privately. '+(both?'Both quizzes now contribute to your full combined report.':'Your other quiz remains available to finish later.'));
  if(both)showCombined();
 }catch(e){setStatus('⚠️ '+String(e.message||'Could not read this file.'))}
}
function showCombined(){
 const d=DIRECT(),p=PSYCH();
 if(!d||!p)return;
 const both=answered('direct')>0&&answered('psych')>0;
 const tab=both?'quiz':(answered('psych')>0?'psych-quiz':'quiz');
 // Show the same canonical report for either entry point: no duplicate scoring.
 goTo(tab);
 window.AfterDarkSharedQuizResults?.(tab==='quiz'?'quizCard':'psychQuizCard');
 setStatus(both?'✓ Your full combined report uses answers from both quizzes.':'This is a preliminary report. Complete or import the second quiz for a full comparison.');
 if(typeof window.scrollTo==='function')window.scrollTo({top:0,behavior:'smooth'});
}
let panels=[];
function resetQuiz(kind){
 const label=kind==='direct'?'Sexual Preferences Quiz':'Psychology Quiz';
 const bridge=kind==='direct'?DIRECT():PSYCH();
 if(!bridge){setStatus('Quiz is unavailable.');return;}
 if(!window.confirm('Reset the '+label+'? This will permanently delete answers and notes for this quiz on this device. Your other quiz and saved reading will be kept. Download a backup first if needed.'))return;
 if(kind==='direct')bridge.reset?.();
 else bridge.restart?.();
 refreshPanels();
 if(currentTab()!==(kind==='direct'?'quiz':'psych-quiz'))goTo(kind==='direct'?'quiz':'psych-quiz');
 setStatus('✓ '+label+' reset. Your other quiz is unchanged.');
}
function makeTransferPanel(kind){
 const card=el('section',undefined,'ad-progress-panel');
 card.setAttribute('aria-label','Saved quiz progress and options');
 card.dataset.quizTools=kind;
 const header=el('div',undefined,'ad-progress-heading');
 header.append(el('strong','Your quiz progress'));
 const indicator=el('span',formatProgress(kind),'ad-progress-indicator');
 indicator.dataset.quizProgress=kind;header.append(indicator);card.append(header);
 const toolbar=el('div',undefined,'ad-progress-actions ad-primary-actions');
 toolbar.append(btn('↪ Resume',()=>{
  (kind==='direct'?DIRECT():PSYCH())?.resume?.();
  setStatus('✓ Returned to your saved question.');
 },'btn'));
 toolbar.append(btn('💾 Save & leave',()=>{
  const bridge=kind==='direct'?DIRECT():PSYCH();
  if(!bridge){setStatus('Quiz is unavailable.');return}
  if(!started(kind))bridge.resume?.();
  savePlace();
  goTo('home');refreshPanels();
  setStatus('✓ Saved. Reopen the quiz and choose Resume.');
 },'btn alt'));
 toolbar.append(btn('↻ Reset quiz',()=>resetQuiz(kind),'btn alt ad-reset-quiz'));
 card.append(toolbar);
 const details=el('details',undefined,'ad-transfer-details');
 details.append(el('summary','More options: import, download & combined report'));
 const inner=el('div',undefined,'ad-transfer-inner');
 inner.append(el('p','Answers save automatically on this device. Download a private file to continue on another device or import an earlier quiz.','ad-progress-note'));
 const actions=el('div',undefined,'ad-progress-actions');
 const chooser=el('label','📁 Import saved quiz','btn alt ad-upload-label');
 const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.setAttribute('aria-label','Choose saved After Dark quiz JSON file');
 fileInput.addEventListener('change',async()=>{const file=fileInput.files?.[0];await importFile(file);fileInput.value='';});
 chooser.append(fileInput);actions.append(chooser);
 actions.append(btn('⬇ Download this quiz',()=>download(kind),'btn alt'));
 actions.append(btn('⬇ Download both quizzes',()=>download('both'),'btn alt'));
 actions.append(btn('📊 View combined report',showCombined,'btn'));
 inner.append(actions);
 inner.append(el('p','Downloaded JSON files contain private answers and notes and are not encrypted. Importing replaces matching quiz answers only after confirmation.','ad-transfer-privacy'));
 details.append(inner);card.append(details);
 const target=$(kind==='direct'?'quizCard':'psychQuizCard');
 target?.parentNode?.insertBefore(card,target);
 panels.push(card);
}
function refreshPanels(){
 for(const node of document.querySelectorAll('[data-quiz-progress]')){
  node.textContent=formatProgress(node.dataset.quizProgress);
 }
 refreshReading();
}
function refineDirectQuizPanel(){
 const card=document.querySelector('[data-quiz-tools="direct"]');
 if(!card||card.classList.contains('ad-focus-tools'))return;
 const headline=card.querySelector('.ad-progress-indicator');
 const toolbar=card.querySelector('.ad-primary-actions');
 const extra=card.querySelector('.ad-transfer-details');
 if(!headline||!toolbar||!extra)return;
 const save=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Save & leave'));
 const resume=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Resume'));
 const reset=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Reset quiz'));
 if(!save||!resume||!reset)return;
 const shell=el('div',undefined,'ad-focus-toolbar');
 const progress=el('div',undefined,'ad-focus-progress');
 progress.append(el('span','● AUTO-SAVED LOCALLY','ad-focus-saved'),headline);
 const actions=el('div',undefined,'ad-primary-actions ad-focus-actions');
 save.textContent='Save & exit';
 save.classList.add('ad-focus-exit');
 actions.append(save);
 const dropdown=el('details',undefined,'ad-focus-menu');
 dropdown.append(el('summary','⋯ Options'));
 const options=el('div',undefined,'ad-focus-menu-inner');
 resume.textContent='↪ Resume saved question';
 reset.textContent='↻ Reset this quiz';
 options.append(resume,reset,extra);
 dropdown.append(options);
 actions.append(dropdown);shell.append(progress,actions);
 const statusText=el('p','','ad-focus-feedback');statusText.id='quiz-save-feedback';
 statusText.setAttribute('role','status');
 card.replaceChildren(shell,statusText);
 card.classList.add('ad-focus-tools');
}
function buildReadingBar(){
 const head=document.querySelector('.top');
 if(!head)return;
 const bar=el('div',undefined,'ad-resume-strip');
 bar.id='afterdark-resume-strip';
 bar.append(el('span','📖 Pick up where you left off','ad-resume-title'));
 const resume=btn('↪ Continue later',resumePlace,'btn');
 resume.id='afterdark-resume-place';bar.append(resume);
 bar.append(btn('💾 Save reading place',()=>savePlace(true),'btn alt'));
 const status=el('span','','ad-resume-status');status.id='afterdark-save-status';
 status.setAttribute('role','status');bar.append(status);
 head.after(bar);
 refreshReading();
}
function listenForReading(){
 let last=currentTab();
 document.addEventListener('click',event=>{
  const before=last;
  if(event.target.closest('[data-tab],[data-goto]') && allowedTabs.has(before)&&!restoring)savePlace();
  setTimeout(()=>{
   const now=currentTab();
   if(now!==last){last=now;refreshPanels()}
   document.body.classList.toggle('afterdark-quiz-mode',now==='quiz'||now==='psych-quiz');
  },50);
 },true);
 window.addEventListener('scroll',()=>{
  if(restoring)return;
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{if(currentTab()!=='home')savePlace()},350);
 },{passive:true});
 const detail=$('howto-guide-detail');
 if(detail){
  const observer=new MutationObserver(()=>{
   if(detail.hidden||currentTab()!=='howto'||restoring)return;
   setTimeout(()=>savePlace(),120);
  });
  observer.observe(detail,{childList:true,subtree:false,attributes:true,attributeFilter:['hidden']});
 }
}
function style(){
 const sheet=document.createElement('style');
 sheet.textContent='.ad-resume-strip{display:flex;align-items:center;gap:9px;flex-wrap:wrap;border:1px solid #604469;border-radius:13px;padding:10px 12px;margin:12px 0;background:#241832}.ad-resume-title{font-size:12px;font-weight:850;color:#ffe8bb;margin-right:auto}.ad-resume-strip .btn{padding:7px 10px;min-height:34px;font-size:11px}.ad-resume-status{flex-basis:100%;font-size:11px;color:#d9bfde}.ad-progress-panel{margin:15px 0 14px;padding:14px;border:1px solid #74517c;border-radius:15px;background:linear-gradient(145deg,#34233e,#221831)}.ad-progress-heading{display:flex;gap:9px;justify-content:space-between;align-items:center;flex-wrap:wrap}.ad-progress-heading strong{color:#ffe6b4;font-size:14px}.ad-progress-indicator{font-size:12px;font-weight:800;color:#eed2ee}.ad-progress-note{font-size:12px;line-height:1.55;margin:8px 0;color:#d9c7e2}.ad-progress-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.ad-progress-actions .btn{min-height:38px;padding:8px 11px;font-size:12px}.ad-transfer-details{margin-top:8px;border-top:1px solid #78567f;padding-top:9px}.ad-transfer-details summary{cursor:pointer;color:#ffe4ae;font-size:13px;font-weight:800}.ad-transfer-inner{padding:6px 0}.ad-transfer-privacy{font-size:11px;color:#ddc4e0}.ad-upload-label{position:relative;cursor:pointer;overflow:hidden}.ad-upload-label input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.ad-upload-label:focus-within{outline:2px solid #ffe4ae;outline-offset:2px}@media(max-width:600px){.ad-resume-strip{gap:6px}.ad-resume-title{width:100%}.ad-progress-actions .btn{flex:1 1 135px}.ad-progress-panel{padding:12px}}';
 document.head.append(sheet);
}
function styleQuizCleanup(){ const sheet=document.createElement("style");sheet.textContent="\n.quiz-page-heading{max-width:835px;margin:5px auto 10px;padding:7px 3px 11px;border-bottom:1px solid #674a78}\n.quiz-page-heading h2{font:700 clamp(26px,4vw,37px)/1.18 Georgia,serif;margin:6px 0 6px}\n.quiz-page-heading p{margin:0;color:#e0cede;font-size:13px;line-height:1.5}\n.quiz-switch-row{max-width:835px;display:flex;justify-content:flex-end;gap:8px;margin:9px auto}\n.quiz-switch-row .btn{font-size:12px;padding:8px 11px}\n.quiz-footnote{max-width:835px;margin:12px auto;color:#cbb6d2;font-size:12px}\n.afterdark-quiz-mode .top{margin-bottom:8px!important;padding-bottom:11px!important}\n.afterdark-quiz-mode .top>.ad-liquid-goo{display:none!important}\n.afterdark-quiz-mode .ad-resume-strip{display:none!important}\n.ad-resume-strip{padding:7px 10px!important;margin:6px 0!important;gap:8px!important;border-radius:10px!important}\n.ad-resume-strip .ad-resume-title{font-size:11px!important}\n.ad-resume-strip .btn{min-height:32px!important;padding:6px 10px!important}\n.ad-resume-status:empty{display:none!important}\n.ad-progress-panel{padding:11px 14px!important;max-width:835px!important;margin:8px auto 13px!important;border-radius:12px!important;border-color:#60436f!important;box-shadow:none!important;background:#291c39!important}\n.ad-progress-heading{margin-bottom:6px;gap:8px}\n.ad-progress-heading strong{font-size:12px!important}\n.ad-progress-indicator{font-size:11px!important;color:#d6bbde!important}\n.ad-primary-actions{gap:7px!important;margin:6px 0!important}\n.ad-primary-actions .btn{min-height:36px!important;font-size:11px!important;padding:7px 12px!important}\n.ad-reset-quiz{margin-left:auto;background:#2e1c34!important;border-color:#986d91!important;color:#f0d7e4!important}\n.ad-transfer-details{margin:5px 0 0!important;padding-top:7px!important;border-top:1px solid #61466e!important}\n.ad-transfer-details summary{font-weight:650!important;font-size:11px!important;color:#dfc7e5!important}\n#quizCard,#psychQuizCard{max-width:835px;margin:0 auto;padding:clamp(14px,3vw,24px)}\n#quizCard .quiz-multi,#psychQuizCard .quiz-multi{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}\n#quizCard .quiz-multi-option,#psychQuizCard .quiz-multi-option{margin:0!important;min-height:49px;padding:11px 13px!important;border-radius:11px!important}\n#quizCard .quiz-help,#psychQuizCard .quiz-help{font-size:12px;color:#dac9e0;margin:6px 0 10px}\n#quizCard .quiz-nav-actions,#psychQuizCard .quiz-nav-actions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0 8px}\n#quizCard .quiz-nav-actions button,#psychQuizCard .quiz-nav-actions button{min-height:40px;padding:8px 12px}\n.quiz-question-more{margin:10px 0 0;border-top:1px solid #664c72;padding-top:9px}\n.quiz-question-more summary{cursor:pointer;color:#dcc0e2;font-size:12px}\n.quiz-question-more button{margin-top:9px}\n.quiz-preview-return{display:flex;align-items:center;flex-wrap:wrap;gap:11px;padding:11px;border:1px solid #9a72a9;border-radius:12px;background:#392448;margin:0 0 15px}\n.quiz-preview-note{font-size:12px;color:#e6cfe8}\n@media(max-width:600px){\n.quiz-page-heading h2{font-size:27px}\n.ad-progress-panel{padding:10px!important}\n.ad-primary-actions{display:flex!important;flex-wrap:wrap!important}\n.ad-primary-actions .btn{flex:1 1 95px!important;padding:8px 7px!important}\n.ad-reset-quiz{margin-left:0}\n.quiz-switch-row{justify-content:flex-start}\n#quizCard,#psychQuizCard{padding:13px 11px}\n}\n";document.head.append(sheet);}
style();styleQuizCleanup();buildReadingBar();makeTransferPanel('direct');makeTransferPanel('psych');refineDirectQuizPanel();listenForReading();refreshPanels();
const quizFocusSheet=document.createElement('link');
quizFocusSheet.rel='stylesheet';
quizFocusSheet.href='/after-dark/quiz-focus.css?v=20261030-v1';
document.head.append(quizFocusSheet);
document.body.classList.toggle('afterdark-quiz-mode',currentTab()==='quiz'||currentTab()==='psych-quiz');
if(currentTab()==='quiz'&&started('direct'))DIRECT()?.resume?.();
if(currentTab()==='psych-quiz'&&started('psych'))PSYCH()?.render?.();
window.AfterDarkProgressTransfer=Object.freeze({
 refresh:refreshPanels,
 exportQuiz:download,
 importQuiz:importFile,
 report:showCombined,
 progress:()=>({direct:DIRECT()?.getProgress?.(),psych:PSYCH()?.getProgress?.(),reading:bookmarks}),
 savePlace:()=>savePlace(true),
 resumePlace
});
})();
