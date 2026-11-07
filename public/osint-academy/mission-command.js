/* TRACE Mission Command: playable, responsive campaign map and clue inspections.
 * Existing game.js remains authoritative for progress, scoring and lessons.
 * This presentation layer never sends player or case data off-device. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const api=()=>window.TraceAcademyGame;
const ZONES=[
 {title:'Boot Camp',tag:'01 · FOUNDATION OPS',icon:'🛰️',description:'Scope the mission, secure the workstation and learn to challenge claims.',start:0,end:5},
 {title:'Visual Intelligence',tag:'02 · SEE THE DETAILS',icon:'📡',description:'Investigate imagery, locations and what visual clues can and cannot establish.',start:6,end:10},
 {title:'Digital Footprints',tag:'03 · VERIFY THE SIGNAL',icon:'🖥️',description:'Use public records, contact and domain context without jumping to conclusions.',start:11,end:13},
 {title:'Network Analysis',tag:'04 · CONNECT THE DOTS',icon:'🧩',description:'Follow sources and links while separating evidence from assumptions.',start:14,end:18},
 {title:'The Final Dossier',tag:'05 · PROVE YOUR CASE',icon:'📁',description:'Build careful analysis, justify findings and earn the Academy final badge.',start:19,end:24}
];
const el=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e};
const safeNum=n=>Number.isFinite(Number(n))?Number(n):0;
let selectedZone=0,lastStatus=null,toastTimeout=null,inspected=new Map();
function p(){return api()?.progress?.()||{completed:[],answered:0,correct:0,active:0,step:0,unlocked:0,rank:'Trainee',xp:0}}
function zoneOf(i){return Math.max(0,ZONES.findIndex(z=>i>=z.start&&i<=z.end))}
function notify(message){
 const status=$('trace-game-feedback');if(!status)return;
 status.textContent=message;status.classList.add('is-visible');
 clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>status.classList.remove('is-visible'),3400);
}
function openMission(id){
 const success=api()?.openCase(id);
 if(!success){notify('That mission unlocks when you clear the earlier missions.');return}
 selectedZone=zoneOf(id);renderMap();
}
function statUI(progress){
 const bar=$('trace-campaign-progress');
 if(bar){bar.value=progress.completed.length;bar.max=25}
 const label=$('trace-campaign-count');if(label)label.textContent=progress.completed.length+' / 25 cleared';
 const current=$('trace-current-objective'),item=api()?.missions?.[progress.active];
 if(current&&item)current.textContent=(progress.completed.length===25?'Academy cleared · Review any case':'NEXT OBJECTIVE · CASE '+String(progress.active+1).padStart(2,'0'))+' · '+item.title;
 const experience=$('trace-campaign-xp');if(experience)experience.textContent=progress.xp+' XP earned';
 const rank=$('trace-campaign-rank');if(rank)rank.textContent=progress.rank;
}
function createZoneSelector(zone,zIndex,progress){
 const completed=progress.completed.filter(i=>i>=zone.start&&i<=zone.end).length;
 const count=zone.end-zone.start+1;
 const unlocked=progress.unlocked>=zone.start;
 const btn=el('button','trace-zone'+(selectedZone===zIndex?' is-selected':''));btn.type='button';
 btn.setAttribute('aria-pressed',String(selectedZone===zIndex));btn.setAttribute('aria-controls','trace-map-cases');
 btn.append(el('span','trace-zone-symbol',zone.icon));
 const words=el('span','trace-zone-words');words.append(el('small','',zone.tag),el('strong','',zone.title),el('span','',completed+' / '+count+' missions cleared'));
 btn.append(words,el('span','trace-zone-indicator',completed===count?'✓':unlocked?'▶':'🔒'));
 btn.addEventListener('click',()=>{selectedZone=zIndex;renderMap()});
 return btn;
}
function renderMap(){
 const missions=api()?.missions;if(!missions?.length)return;
 const prog=p(),zone=ZONES[selectedZone];
 statUI(prog);
 const sectors=$('trace-mission-zones'),items=$('trace-map-cases'),heading=$('trace-sector-heading');
 if(!sectors||!items||!heading)return;
 sectors.replaceChildren(...ZONES.map((z,i)=>createZoneSelector(z,i,prog)));
 heading.replaceChildren(el('strong','',zone.icon+' '+zone.title),el('span','',zone.description));
 const fragment=document.createDocumentFragment();
 for(let id=zone.start;id<=zone.end;id++){
  const m=missions[id],done=prog.completed.includes(id),available=id<=prog.unlocked;
  const button=el('button','trace-map-mission'+(id===prog.active?' current':'')+(done?' cleared':'')+(available?'':' locked'));
  button.type='button';button.disabled=!available;button.setAttribute('aria-label','Case '+(id+1)+' '+m.title+(done?' cleared':available?' available':' locked'));
  const number=el('span','trace-map-number',String(id+1).padStart(2,'0'));
  const details=el('span','trace-map-details');
  details.append(el('small','',m.field),el('strong','',m.title),el('span','',m.brief.length>130?m.brief.slice(0,127)+'…':m.brief));
  const badge=el('span','trace-map-badge',done?'✓ REPLAY':available?id===prog.active?'▶ PLAY':'CONTINUE':'🔒 LOCKED');
  button.append(number,details,badge);
  if(available)button.addEventListener('click',()=>openMission(id));
  fragment.append(button);
 }
 items.replaceChildren(fragment);
}
function inspectClues(){
 const stage=$('mission-stage'),progress=p(),cards=[...stage?.querySelectorAll('.evidence-tile')||[]];
 if(!cards.length)return;
 const key='c'+progress.active;
 if(!inspected.has(key))inspected.set(key,new Set());
 const visited=inspected.get(key);
 let counter=stage.querySelector('.trace-clue-progress');
 if(!counter){
  counter=el('div','trace-clue-progress');counter.setAttribute('role','status');
  stage.querySelector('.case-evidence h3')?.after(counter);
 }
 function refreshCount(){counter.textContent='EVIDENCE DESK · '+visited.size+' / '+cards.length+' clues inspected · tap a file to open it'}
 cards.forEach((card,i)=>{
  card.classList.add('trace-evidence-clickable');
  card.tabIndex=0;card.setAttribute('role','button');
  const isOpen=visited.has(i);card.setAttribute('aria-expanded',String(isOpen));
  card.append(el('span','trace-clue-control','▣ '+(isOpen?'Inspected':'Inspect evidence')));
  const details=el('p','trace-clue-detail',card.querySelector('span:not(.trace-clue-control)')?.textContent||'');
  details.hidden=!isOpen;
  details.append(document.createTextNode(' · Capture the source and verify its relevance before making a finding.'));
  card.append(details);
  if(isOpen)card.classList.add('inspected');
  const toggle=()=>{
   if(details.hidden){details.hidden=false;visited.add(i);card.classList.add('inspected');card.setAttribute('aria-expanded','true');card.querySelector('.trace-clue-control').textContent='✓ Inspected'}
   else{details.hidden=true;card.classList.remove('inspected');card.setAttribute('aria-expanded','false');card.querySelector('.trace-clue-control').textContent='▣ Inspect evidence'}
   refreshCount();
  };
  card.addEventListener('click',toggle);
  card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}});
 });
 refreshCount();
}
function sync(){
 const progress=p();
 if(lastStatus){
  if(progress.xp>lastStatus.xp)notify('+'+(progress.xp-lastStatus.xp)+' XP · Evidence-based decision recorded');
  if(progress.completed.length>lastStatus.completed.length)notify('✓ CASE CLEARED · Your next mission is unlocked');
 }
 if(lastStatus?.active!==progress.active)selectedZone=zoneOf(progress.active);
 lastStatus={xp:progress.xp,completed:progress.completed.slice(),active:progress.active};
 renderMap();
}
function init(){
 if(!api()||!$('trace-game-command'))return;
 selectedZone=zoneOf(p().active);
 lastStatus={xp:p().xp,completed:p().completed.slice(),active:p().active};
 $('trace-campaign-continue')?.addEventListener('click',()=>openMission(p().active));
 $('trace-campaign-directory')?.addEventListener('click',()=>{
  $('case-directory').open=true;document.querySelector('#case-directory')?.scrollIntoView({behavior:'smooth',block:'start'});
 });
 document.addEventListener('trace:progress',sync);
 document.addEventListener('trace:case-rendered',inspectClues);
 inspectClues();renderMap();
 document.body.classList.add('trace-game-enhanced');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();