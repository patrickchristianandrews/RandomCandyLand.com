/* Unwrapped report delivery safety net.
 * Honest local-persistence checks and clear report/export expectations.
 * Reads only local quiz state; sends no sensitive answers off the device.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
let latestFailure='',updatedAt=0;
const keyFor={direct:'afterdark_direct_quiz_v6',psych:'afterdark_psychology_quiz_v1'};
const progress=()=>window.AfterDarkProgressTransfer?.progress?.()||{};
const capture=kind=>{try{return JSON.parse(localStorage.getItem(keyFor[kind])||'null')}catch{return null}};
function inspect(){
 const p=progress(),direct=p.direct||{},psych=p.psych||{};
 const answerDirect=Number(direct.answered)||0,answerPsych=Number(psych.answered)||0;
 const completedDirect=Boolean(direct.complete),completedPsych=Boolean(psych.complete);
 const typed={direct:answerDirect,psych:answerPsych};
 const saved={direct:null,psych:null};
 let writable=true;
 try{const k='unwrapped-storage-check-v1';localStorage.setItem(k,'ok');writable=localStorage.getItem(k)==='ok';localStorage.removeItem(k)}catch{writable=false}
 for(const kind of ['direct','psych']){
  const active=kind==='direct'?direct:psych,answered=typed[kind];
  if(!answered&&!active.complete&&!(Number(active.position)>=0))continue;
  const file=capture(kind);
  const answers=kind==='direct'?file?.multiAnswers:file?.answers,
   original=active.answers;
  saved[kind]=Boolean(file&&original&&JSON.stringify(answers)===JSON.stringify(original));
  if(kind==='direct'&&saved[kind])saved[kind]=Boolean(
   JSON.stringify(file.freeResponses||{})===JSON.stringify(active.notes||{}));
  if(kind==='psych'&&saved[kind])saved[kind]=Boolean(
   JSON.stringify(file.notes||{})===JSON.stringify(active.notes||{}));
 }
 const reliable=writable&&!latestFailure&&Object.values(saved).every(x=>x!==false);
 const complete=completedDirect&&completedPsych;
 const personal=answerDirect+answerPsych>0;
 return Object.freeze({directAnswered:answerDirect,psychAnswered:answerPsych,completedDirect,completedPsych,complete,personal,
  saved,reliable,writable,latestFailure,summary:!personal?'No quiz answers entered yet':complete?'Both quizzes completed':(completedDirect||completedPsych?'One quiz completed':'Quiz in progress')});
}
function reportInstruction(){
 return 'The site prepares your report locally, then opens your browser’s Print screen. On Android or desktop choose “Save as PDF”; on iPhone use the Share/Print options to save the PDF. Verify the file exists in Files/Downloads before clearing browser data.';
}
function refresh(){
 const data=inspect(),root=$('uw-delivery-health');
 if(root){
  const status=root.querySelector('[data-delivery-status]'),answers=root.querySelector('[data-delivery-answers]'),
   help=root.querySelector('[data-delivery-help]'),backup=root.querySelector('[data-delivery-backup]');
  if(status)status.textContent=data.reliable?
    '✓ Local answer storage confirmed'+(data.complete?' · both quizzes complete':''):
    '⚠️ Your local save could not be verified';
  if(answers)answers.textContent=data.directAnswered+'/69 preferences · '+data.psychAnswered+'/32 psychology answers. '+
    (data.complete?'Full personal-report input available.':data.personal?'A preliminary personal report is available; finish both quizzes for the complete result.':'Complete a quiz to generate a personal report.');
  if(help)help.textContent=data.reliable?
   'Your answers are in this browser only, not automatically synchronized. Download a private backup before changing devices, clearing site data, or relying on a long session.':
   'Do not close this tab or clear browser data. Download a private backup now if possible. Browser storage failed, is blocked or cannot be verified.'+
    (data.latestFailure?' Last error: '+data.latestFailure:'');
  if(backup)backup.disabled=!data.personal;
  root.dataset.deliveryOk=String(data.reliable);
 }
 for(const tab of ['quiz','psych-quiz']){
  const strip=$('uw-guard-'+tab);if(!strip)continue;
  const span=strip.querySelector('span');
  if(span)span.textContent=data.reliable?'✓ Answers saved on this device · download a backup to protect your work':
   '⚠️ Local autosave is not verified. Download a backup before leaving this quiz.';
  strip.dataset.deliveryOk=String(data.reliable);
 }
 updatedAt=Date.now();return data;
}
function downloadBackup(){
 const result=refresh();
 if(!result.personal){inform('Answer or import at least one question before downloading a private backup.');return false}
 if(!window.AfterDarkProgressTransfer?.exportQuiz){inform('Private export is not ready. Reload the page without clearing site data.');return false}
 const ok=window.AfterDarkProgressTransfer.exportQuiz('both');
 if(ok!==false)inform('Private backup requested. Open Files/Downloads to confirm the .json file was saved. Never send this full backup to a partner.');
 else inform('Backup could not be prepared. Your existing answers are still shown here; avoid closing this tab.');
 return ok!==false;
}
function inform(message){const el=$('uw-delivery-message');if(el)el.textContent=message;}
function init(){
 const host=$('uw-personal-workflow');
 if(host){
  const node=make('div',undefined,'uw-delivery-health');node.id='uw-delivery-health';
  node.setAttribute('aria-label','Check report and answer recovery');
  node.append(make('strong','Report readiness & answer protection'));
  const status=make('p','Checking your browser storage…','uw-delivery-status');status.dataset.deliveryStatus='';
  const count=make('p','','uw-delivery-answers');count.dataset.deliveryAnswers='';
  const help=make('p','','uw-delivery-help');help.dataset.deliveryHelp='';
  const actions=make('div',undefined,'uw-delivery-actions'),backup=make('button','Download recovery backup (.json)','btn alt');
  backup.type='button';backup.dataset.deliveryBackup='';backup.onclick=downloadBackup;
  const test=make('button','Check saved answers','btn alt');test.type='button';test.onclick=()=>{
   const d=refresh();inform(d.reliable?'Saved answers match this browser’s local quiz data. A separate downloadable backup is still recommended.':
    'Could not confirm persistent storage. Download a backup now and avoid clearing the browser.');
  };
  actions.append(backup,test);
  const guide=make('details',undefined,'uw-delivery-guide');guide.append(make('summary','How to save and recover every report'),make('p',reportInstruction()),
   make('p','For a combined report: each person downloads their selected-sharing .json (not their full private backup). Import both into Report Center, check the preview, then choose Print / Save as PDF. Save the final PDF as well as your own private recovery backup.'));
  const message=make('p','','uw-delivery-message');message.id='uw-delivery-message';message.setAttribute('role','status');
  node.append(status,count,help,actions,guide,message);
  host.querySelector('.uw-report-actions')?.before(node);
 }
 for(const quiz of ['quiz','psych-quiz']){
  const sec=$(quiz),card=sec?.querySelector('#quizCard,#psychQuizCard');
  if(!card)continue;
  const row=make('div',undefined,'uw-quiz-recovery');row.id='uw-guard-'+quiz;
  const text=make('span','Checking local answer storage…');
  const btn=make('button','Back up answers','btn alt');btn.type='button';btn.onclick=downloadBackup;
  row.append(text,btn);card.before(row);
 }
 window.addEventListener('unwrapped:save-status',event=>{
  const detail=event.detail||{};
  if(detail.ok===false)latestFailure=(detail.kind||'Quiz')+' did not save'+(detail.reason?' ('+String(detail.reason).slice(0,90)+')':'');
  else if(detail.ok===true&&latestFailure?.startsWith(detail.kind||'ImpossibleToMatch'))latestFailure='';
  refresh();
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-updatedAt>15000)refresh()});
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-tab],[data-goto],#uw-view-personal,#uw-import-private,#uw-save-private,#uc-save,#uc-compare,#uc-partner')){
   requestAnimationFrame(refresh);
  }
 });
 refresh();
}
window.UnwrappedDeliverySafety=Object.freeze({inspect,refresh,downloadBackup,reportInstruction});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
