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
// The full-screen pixel adventure uses the same fictional cases and solved progress.\nwindow.TracePixelCaseData=Object.freeze(cases.map(c=>Object.freeze(c)));\nconst STORE='trace-pixel-sidecases-v1';let index=0,found=new Set(),solved=new Set(),attempts=0;
try{const x=JSON.parse(localStorage.getItem(STORE)||'[]');if(Array.isArray(x))solved=new Set(x.filter(n=>Number.isInteger(n)&&n>=0&&n<cases.length))}catch{}
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function say(text){const n=$('pq-scout-feedback');if(n)n.textContent=text}
// Draw actual low-resolution scenery with browser canvas, not decorative text blocks.
function paintScene(canvas,caseIndex,clues){
 const cx=canvas.getContext('2d');if(!cx)return;
 const w=160,h=60;canvas.width=w;canvas.height=h;
 const sky=['#253667','#2d416c','#222c64','#4d335b','#353561'][caseIndex]||'#253667';
 const rect=(x,y,a,b,color)=>{cx.fillStyle=color;cx.fillRect(x,y,a,b)};
 rect(0,0,w,h,sky);
 for(let i=0;i<18;i++){const x=(i*37+caseIndex*13)%w,y=(i*17+7)%26;rect(x,y,1,1,'#c8e4ff')}
 rect(111,8,12,12,caseIndex===4?'#f5e6aa':'#b8c7f3');
 // Distant skyline and lit windows: distinct colors by district.
 for(let i=0;i<12;i++){
  const x=i*15-3,hh=12+((i*11+caseIndex*7)%23);
  rect(x,42-hh,15,hh+18,i%2?'#19294a':'#24395a');
  for(let y=44-hh;y<43;y+=6)for(let wx=x+3;wx<x+14;wx+=6)
   if((wx+y+caseIndex)%3!==0)rect(wx,y,2,3,caseIndex===3?'#e6b0c2':'#d8c380');
 }
 rect(0,49,w,11,'#263752');rect(0,47,w,2,'#8192a2');
 for(let i=0;i<12;i++)rect(i*15+2,53,7,1,'#d6cda4');
 // Pixel detective, simple hat/head/jacket/boots silhouette.
 const px=10+clues*5,py=26;
 rect(px,py,10,3,'#161d35');rect(px+2,py-3,7,4,'#a9c7dc');
 rect(px+2,py+3,7,9,'#e7b79e');rect(px+1,py+12,9,9,'#66c7ab');
 rect(px+3,py+21,2,5,'#121d39');rect(px+8,py+21,2,5,'#121d39');
 rect(px+7,py+6,1,1,'#263d51');
 // Scene-specific investigation landmark.
 const colors=['#fa9b9b','#79d5de','#ce93db','#f6c879','#e4b8ae'];
 rect(112,35,32,2,colors[caseIndex]);rect(115,31,4,4,'#d7edf6');
 rect(131,27,7,10,colors[caseIndex]);rect(132,28,5,7,'#293a64');
 for(let i=0;i<3;i++){rect(84+i*11,44,7,2,clues>i?'#9dffcf':'#53678b')}
}
function render(){
 const c=cases[index],scene=$('pq-scout-scene'),notes=$('pq-scout-notes'),choices=$('pq-scout-choices'),map=$('pq-scout-map');if(!scene)return;
 $('pq-scout-title').textContent=(index+1)+' / '+cases.length+' · '+c.title;
 $('pq-scout-brief').textContent=c.brief;
 $('pq-scout-npc').textContent=c.npc+' · '+c.place;
 $('pq-scout-score').textContent=solved.size+' / '+cases.length+' side cases solved';
 scene.replaceChildren();notes.replaceChildren();choices.replaceChildren();map.replaceChildren();
 const canvas=el('canvas','pq-scout-pixel-canvas');canvas.setAttribute('aria-hidden','true');scene.append(canvas);paintScene(canvas,index,found.size);
 const stage=$('pq-scout-stage');if(stage)stage.textContent=solved.has(index)?'✓ Mystery solved · choose Next':found.size===3?'✓ All clues found · make your deduction':'🔎 Find '+(3-found.size)+' more clue'+(3-found.size===1?'':'s')+' in the scene';
 choices.hidden=found.size<3||solved.has(index);
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
   if(i!==c.correct){say('Not quite. Compare the source dates and reliability. Try a different conclusion.');b.classList.add('incorrect');return}
   solved.add(index);try{localStorage.setItem(STORE,JSON.stringify([...solved]))}catch{}
   say('🏆 Case solved! Your evidence checked out. Tap Next mystery to continue.');
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
 const lesson=$('pq-scout-lesson');if(lesson){lesson.hidden=!solved.has(index);$('pq-scout-lesson-text').textContent=c.why}
 const finish=solved.size===cases.length;const badge=$('pq-scout-badge');badge.hidden=!finish;
 if(finish)badge.textContent='🏆 Pixel Evidence Detective · five verified side mysteries solved';
}
function init(){
 const hub=$('trace-pixel-quest');if(!hub||$('pq-sidecases'))return;
 const wrap=el('section','pq-scout');wrap.id='pq-sidecases';wrap.setAttribute('aria-label','Interactive pixel clue hunt');
 wrap.innerHTML='<div class="pq-scout-head"><span>🎮 TRACE PIXEL PLAY · ONE MYSTERY AT A TIME</span><h3 id="pq-scout-title"></h3><p id="pq-scout-brief"></p><small id="pq-scout-score"></small></div><div class="pq-scout-map" id="pq-scout-map" role="group" aria-label="Five side mysteries"></div><div class="pq-scout-world"><div class="pq-scout-npc" id="pq-scout-npc"></div><div id="pq-scout-stage" class="pq-scout-stage" role="status"></div><div class="pq-scout-scene" id="pq-scout-scene"></div></div><p id="pq-scout-feedback" class="pq-scout-feedback" role="status" aria-live="polite">Tap a glowing clue to begin.</p><div class="pq-scout-board"><details class="pq-scout-journal"><summary>📎 Evidence notebook (optional)</summary><div id="pq-scout-notes" class="pq-scout-notes"></div></details><div class="pq-scout-decision"><h4>🧠 Your deduction</h4><p class="pq-scout-hint">Find three clues to unlock your choices.</p><div id="pq-scout-choices" class="pq-scout-choices"></div></div></div><details class="pq-scout-lesson" id="pq-scout-lesson" hidden><summary>💡 Why that conclusion works</summary><p id="pq-scout-lesson-text"></p></details><p id="pq-scout-badge" class="pq-scout-badge" hidden></p><button type="button" id="pq-scout-next" class="pq-scout-next" disabled>▶ Next mystery</button><p class="pq-scout-caution">Fictional data only. Your progress saves on this device.</p>';
 hub.insertBefore(wrap,hub.querySelector('.pq-world')||hub.firstChild);
 // Expose a stable entry for the main Play button and direct #pixel-mysteries link.
 wrap.setAttribute('tabindex','-1');
 wrap.setAttribute('data-trace-release','20261111-play-v3');
 const jump=()=>{document.querySelector('#tab-missions')?.click();wrap.scrollIntoView({behavior:'smooth',block:'start'});wrap.focus({preventScroll:true})};
 document.querySelectorAll('[data-trace-play-scout]').forEach(button=>button.addEventListener('click',jump));
 if(location.hash==='#pixel-mysteries')requestAnimationFrame(jump);
  $('pq-scout-next').addEventListener('click',()=>{if(index<cases.length-1&&solved.has(index)){index++;found=new Set();attempts=0;render();say('New scene unlocked! Tap the evidence objects to investigate.')}});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();