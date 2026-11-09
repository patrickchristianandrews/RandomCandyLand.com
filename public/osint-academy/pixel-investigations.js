/* TRACE side cases: actual clickable clue discovery and evidence-based conclusions.
 * All characters and situations are fictional; saved locally, independent of campaign XP. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const cases=[
 {title:'The Vanishing Train',place:'🚉 Neon Station',npc:'Mox',brief:'A viral screenshot insists the last train left at 9:00. Is that proven?',
  scene:'🚉',objects:[['📱','Cropped post','The viral screenshot shows a line reading “last train 9:00”, but its date and route are cut off.'],['🕰️','Public schedule','The current official timetable lists trains on the route until 11:00.'],['📰','Community board','A local post repeats the 9:00 claim without linking any source.']],
  options:['The cropped screenshot proves the route closed at 9:00.','The claim is contradicted by the current timetable; verify the route and date.','The community post counts as independent confirmation.'],correct:1,
  why:'A screenshot missing its route and date cannot outrank a current primary timetable. Record what you checked; never infer someone’s movements from a rumor.'},
 {title:'The Pier Photograph',place:'📷 Pixel Pier',npc:'Snap',brief:'Someone says a dramatic pier photo was taken yesterday. Find the time clue.',
  scene:'🌉',objects:[['🖼️','Shared photograph','The image lacks a trustworthy original timestamp and its caption says “yesterday”.'],['🗂️','Archive postcard','A public archive contains the same distinctive painted railing in a 2018 image.'],['🏗️','Current pier map','The current city map shows a new railing installed after the older photograph.']],
  options:['The post date proves when the image was taken.','The image is confirmed to show yesterday’s weather.','The older archival match undermines the claim that this is a new photograph.'],correct:2,
  why:'A re-post can be new while the image is old. Compare visual landmarks and dated primary records; do not guess at people’s exact locations.'},
 {title:'The Borrowed Username',place:'🕹️ Circuit Arcade',npc:'Byte',brief:'Two public accounts share a nickname. Do they belong to the same person?',
  scene:'🕹️',objects:[['🪪','Profile A','The handle is “neon_fox”; no verified contact or identity is disclosed.'],['💬','Profile B','The handle is also “neon_fox”; the biography contains different hobbies.'],['📚','Name registry','The fictional platform allows duplicate display names and never guarantees account ownership.']],
  options:['The identical handle is enough to identify one owner.','The overlap alone cannot establish identity; mark the connection unverified.','The different hobbies prove deliberate deception.'],correct:1,
  why:'Display names are weak identifiers. Do not attribute accounts to real people without reliable, appropriately obtained corroboration.'},
 {title:'The Counterfeit Bulletin',place:'🗝️ Mystery Market',npc:'Dot',brief:'A bulletin asks residents to enter private information on a nearly familiar domain.',
  scene:'🏬',objects:[['📜','Printed notice','The poster has an urgent deadline but gives no agency department or documented authority.'],['🌐','Web address','The notice uses cit-yrecords.example instead of the fictional agency’s published cityrecords.example.'],['🏛️','Official portal','The agency portal has no matching notice or announcement.']],
  options:['The matching colors confirm the bulletin is official.','Enter personal information quickly to avoid missing the deadline.','Treat the source as unverified and use the agency’s known official channel to check.'],correct:2,
  why:'Lookalike addresses and urgency are warning signs. Verify via a known trusted source; never enter sensitive details because a poster requests them.'},
 {title:'The Clocktower Dossier',place:'🏰 Clocktower Files',npc:'Cipher',brief:'Three sources suggest an event occurred. What can your final report actually support?',
  scene:'🏰',objects:[['📅','Event calendar','An archived official calendar records a meeting on May 14.'],['📻','Broadcast transcript','An independent broadcast mentions the meeting date but not the attendees.'],['📷','Undated image','An image claims to show a particular attendee, but provenance and time are unverified.']],
  options:['The May 14 meeting is supported; attendance and the image claim remain unverified.','All attendees in the image definitely participated.','An undated image proves the entire dossier.'],correct:0,
  why:'A strong report separates well-supported dates from unsupported identity or location claims. State uncertainty clearly and preserve provenance.'}
];
const STORE='trace-pixel-sidecases-v1';let index=0,found=new Set(),solved=new Set(),attempts=0;
try{const x=JSON.parse(localStorage.getItem(STORE)||'[]');if(Array.isArray(x))solved=new Set(x.filter(n=>Number.isInteger(n)&&n>=0&&n<cases.length))}catch{}
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function say(text){const n=$('pq-scout-feedback');if(n)n.textContent=text}
function render(){
 const c=cases[index],scene=$('pq-scout-scene'),notes=$('pq-scout-notes'),choices=$('pq-scout-choices'),map=$('pq-scout-map');if(!scene)return;
 $('pq-scout-title').textContent=(index+1)+' / '+cases.length+' · '+c.title;
 $('pq-scout-brief').textContent=c.brief;
 $('pq-scout-npc').textContent=c.npc+' · '+c.place;
 $('pq-scout-score').textContent=solved.size+' / '+cases.length+' side cases solved';
 scene.replaceChildren();notes.replaceChildren();choices.replaceChildren();map.replaceChildren();
 const landmark=el('span','pq-scout-landmark',c.scene);landmark.setAttribute('aria-hidden','true');scene.append(landmark);
 c.objects.forEach(([icon,name,detail],i)=>{
  const button=el('button','pq-scout-hotspot'+(found.has(i)?' found':''));button.type='button';button.setAttribute('aria-label','Investigate '+name);
  button.append(el('b','',icon),el('span','',name),el('small','',found.has(i)?'✓ Evidence collected':'Tap to investigate'));
  button.addEventListener('click',()=>{found.add(i);render();say(name+': '+detail)});
  scene.append(button);
  if(found.has(i)){const item=el('article','pq-scout-evidence');item.append(el('strong','',icon+' '+name),el('p','',detail));notes.append(item)}
 });
 c.options.forEach((answer,i)=>{
  const b=el('button','pq-scout-answer');b.type='button';b.disabled=found.size<c.objects.length||solved.has(index);
  b.textContent=String.fromCharCode(65+i)+'. '+answer;
  b.addEventListener('click',()=>{
   attempts++;
   if(i!==c.correct){say('Not quite. '+c.why+' Try again using the evidence you collected.');b.classList.add('incorrect');return}
   solved.add(index);try{localStorage.setItem(STORE,JSON.stringify([...solved]))}catch{}
   say('🏆 CASE SOLVED! '+c.why+' Badge earned. Choose the next side case to keep investigating.');
   render();
  });choices.append(b);
 });
 cases.forEach((caseItem,i)=>{
  const b=el('button','pq-scout-map-item'+(index===i?' selected':'')+(solved.has(i)?' solved':''));b.type='button';
  b.disabled=i>0&&!solved.has(i-1);b.textContent=(solved.has(i)?'✅ ':i>0&&!solved.has(i-1)?'🔒 ':'📂 ')+(i+1)+'. '+caseItem.title;
  b.addEventListener('click',()=>{index=i;found=new Set();attempts=0;render();say('Search the scene and collect all three clues before deciding.')});
  map.append(b);
 });
 const next=$('pq-scout-next');next.disabled=!solved.has(index)||index===cases.length-1;
 const finish=solved.size===cases.length;const badge=$('pq-scout-badge');badge.hidden=!finish;
 if(finish)badge.textContent='🏆 Pixel Evidence Detective · five verified side mysteries solved';
}
function init(){
 const hub=$('trace-pixel-quest');if(!hub||$('pq-sidecases'))return;
 const wrap=el('section','pq-scout');wrap.id='pq-sidecases';wrap.setAttribute('aria-label','Interactive pixel clue hunt');
 wrap.innerHTML='<div class="pq-scout-head"><span>🔍 THE CLUE HUNT</span><h3 id="pq-scout-title"></h3><p id="pq-scout-brief"></p><small id="pq-scout-score"></small></div><div class="pq-scout-map" id="pq-scout-map" role="group" aria-label="Five side mysteries"></div><div class="pq-scout-world"><div class="pq-scout-npc" id="pq-scout-npc"></div><div class="pq-scout-scene" id="pq-scout-scene"></div></div><div class="pq-scout-board"><div><h4>📎 Collected evidence</h4><div id="pq-scout-notes" class="pq-scout-notes"></div></div><div><h4>🧠 What can you conclude?</h4><p class="pq-scout-hint">Find all three clues to unlock the deduction.</p><div id="pq-scout-choices" class="pq-scout-choices"></div></div></div><p id="pq-scout-feedback" class="pq-scout-feedback" role="status" aria-live="polite">Choose a hotspot in the scene and start searching.</p><p id="pq-scout-badge" class="pq-scout-badge" hidden></p><button type="button" id="pq-scout-next" class="pq-scout-next" disabled>▶ Next mystery</button><p class="pq-scout-caution">Fictional cases teach source verification. They do not collect personal data or connect to real people. Side-case badges are separate from campaign XP.</p>';
 hub.append(wrap);
 $('pq-scout-next').addEventListener('click',()=>{if(index<cases.length-1&&solved.has(index)){index++;found=new Set();attempts=0;render();say('New scene unlocked! Tap the evidence objects to investigate.')}});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();