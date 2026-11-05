/* Shared interactive presentation, sound, and illustrated environments. No external assets or services required. */
(function(){
'use strict';
const W=window.WorldKit;
let muted=true;
try{muted=localStorage.getItem('meridian-sound-v1')!=='on'}catch{}
let ctx=null;
function tone(positive=true){
 if(muted)return;
 try{
  const Audio=(window.AudioContext||window.webkitAudioContext);if(!Audio)return;
  ctx=ctx||new Audio();if(ctx.state==='suspended')ctx.resume();
  const now=ctx.currentTime;
  const notes=positive?[523,659,784]:[294,246];
  notes.forEach((hz,i)=>{
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(hz,now+i*.085);
   gain.gain.setValueAtTime(.0001,now+i*.085);
   gain.gain.exponentialRampToValueAtTime(.06,now+i*.085+.01);
   gain.gain.exponentialRampToValueAtTime(.0001,now+i*.085+.17);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now+i*.085);osc.stop(now+i*.085+.2);
  });
 }catch{}
}
function burst(x,y,emoji){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const el=document.createElement('div');el.className='wfx-spark';
 el.textContent=emoji||'✨';el.style.left=(x||window.innerWidth/2)+'px';
 el.style.top=(y||window.innerHeight/2)+'px';document.body.append(el);
 setTimeout(()=>el.remove(),950)
}
function celebrate(emoji='✨'){
 tone(true);burst(window.innerWidth*.45,window.innerHeight*.48,emoji);
 burst(window.innerWidth*.6,window.innerHeight*.58,'✦');
 try{if(navigator.vibrate)navigator.vibrate(18)}catch{}
}
function sceneCity(day,person,mood,selected){
 const night=day%5===0||day%5===4,faces=mood>74?'🥳':mood>55?'😊':mood>37?'😐':'😢';
 const buildings=[70,118,95,141,98,169,85,132,108].map((h,i)=>'<div class="wfx-building '+(night?'is-dark':'')+'" style="--h:'+Math.max(35,Math.round(h*(.9+mood/500)))+'px;--color:'+['#d7adc4','#bfc2e9','#b4dcd4','#d6b1df','#d7c59a'][i%5]+'"></div>').join('');
 return '<div class="wfx-scene wfx-city-scene '+(night?'night':'')+'" role="img" aria-label="Animated illustrated city skyline with citizens and a selected neighborhood">'+
 '<span class="wfx-scene-label">🏙️ MOODROPOLIS • '+(night?'EVENING LIGHTS':'CITY IN MOTION')+'</span><span class="wfx-scene-stamp">DAY '+Number(day)+'</span>'+
 '<div class="wfx-sun"></div><div class="wfx-cloud"></div><div class="wfx-cloud alt"></div><div class="wfx-skyline">'+buildings+'</div>'+
 '<div class="wfx-road"></div><div class="wfx-person" style="left:16%">🚶</div><div class="wfx-person b">🧑‍🎨</div><div class="wfx-person c">🚴</div><div class="wfx-vehicle">🚗</div>'+
 '<div class="wfx-speech">'+W.escape(person)+' wonders how you will shape '+W.escape(selected)+'.</div><div class="wfx-mood-face">'+faces+'</div></div>';
}
function sceneHall(chapter,choices,pending){
 const icons=['🗳️','🤝','⚖️'];
 return '<div class="wfx-scene wfx-hall-scene"><span class="wfx-scene-label">🏛️ CITY HALL • THE THREE DOORS</span><span class="wfx-scene-stamp">ACT '+(Number(chapter)+1)+'</span>'+
 '<div class="wfx-hall-ceiling"></div><div class="wfx-hall-floor"></div><div class="wfx-hall-grid"></div><div class="wfx-hall-door-grid">'+
 choices.map((o,i)=>'<button type="button" class="wfx-door" '+(pending?'disabled':'data-pick="'+i+'"')+' aria-label="'+W.escape(o.name)+'">'+
 '<span class="symbol">'+icons[i]+'</span><b>DOOR '+(i+1)+'<br>'+W.escape(o.name)+'</b><small>'+(pending?'Decision recorded':'OPEN THIS DOOR ↗')+'</small></button>').join('')+'</div></div>';
}
function sceneCourt(phase,caseTitle){
 return '<div class="wfx-scene wfx-court-scene" role="img" aria-label="Illustrated courthouse interior with judge, bench, and participants"><span class="wfx-scene-label">⚖️ THE COURT • '+W.escape(phase.toUpperCase())+'</span>'+
 '<span class="wfx-scene-stamp">THE DOCKET</span><div class="wfx-court-pillars"><i></i><i></i><i></i><i></i></div>'+
 '<div class="wfx-court-panel"><div class="wfx-seal">⚖️</div><div class="wfx-bench"></div></div>'+
 '<div class="wfx-court-side left">🧑🏽‍💼<span>COUNSEL</span></div><div class="wfx-court-side right">👩🏻‍💼<span>COUNSEL</span></div></div>';
}
function caseBoard(evidence,reviewed){
 const points=[[15,21],[48,13],[80,25],[29,75],[73,79]];
 const lines='<svg class="wfx-cork-threads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M15 23 48 15 80 27 73 80 29 76 15 23 73 80 48 15 29 76" fill="none" stroke="#edbe83" stroke-width=".7" opacity=".7" stroke-dasharray="2 2"/></svg>';
 return '<div class="wfx-caseboard" aria-label="Interactive evidence board"><span class="overline" style="color:#f9d8a3">🧵 THE INVESTIGATION WALL</span>'+lines+
 '<div class="wfx-evidence-dots">'+evidence.map((e,i)=>'<button class="wfx-evidence-pin '+(reviewed.includes(i)?'seen':'')+'" data-evidence="'+i+'" style="--rot:'+([-4,4,2,-3,6][i])+'deg"><span class="symbol">'+['📃','📼','🧾','📌','📁'][i]+'</span>'+W.escape(e[0])+'</button>').join('')+'</div></div>';
}
function setup(){
 const bar=document.querySelector('.topbar');if(!bar)return;
 const controls=document.createElement('div');controls.className='wfx-controls';
 controls.innerHTML='<button class="wfx-toggle" type="button" aria-pressed="'+!muted+'" aria-label="Toggle game sound">'+(muted?'🔇 Sound off':'🔊 Sound on')+'</button><button class="wfx-help" type="button">❔ How to play</button>';
 bar.append(controls);
 const text=document.body.classList.contains('mood')?
 ['Choose a neighborhood on the living city map.','Spend three city-hall actions each day, or respond to a resident request.','Watch mood, stress, trust and resources evolve; special events occur every three days.','Earn milestones and view your local city report.']:
 document.body.classList.contains('corridors')?
 ['Begin a policy chapter and inspect the public and private pressures.','Interview stakeholders for intelligence before choosing one of three doors.','Track alliances, influence and public trust across seven chapters.','See real consequences and earn an ending based on your decisions.']:
 ['Choose one of four courtroom roles and examine the evidence board.','Inspect source reliability, compare conflicting exhibits and question a witness.','Decide the pretrial motion, reach a reasoned outcome and consider appeal.','Complete five cases to build your legal dossier.'];
 function openHelp(){
  if(document.querySelector('.wfx-info'))return;
  const modal=document.createElement('div');modal.className='wfx-info';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','How to play');
  modal.innerHTML='<div class="wfx-info-inner"><span class="overline">THE GAME GUIDE</span><h2>How to play ✨</h2><ol>'+text.map(x=>'<li>'+W.escape(x)+'</li>').join('')+'</ol><p>All events and characters are fictional. Your progress stays on this device unless you export it. This is a simulation, not professional advice.</p><button class="button" type="button" data-close-help>Let’s play →</button></div>';
  document.body.append(modal);modal.querySelector('button').focus();
  modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close-help]'))modal.remove()});
  modal.addEventListener('keydown',e=>{if(e.key==='Escape')modal.remove()});
 }
 controls.querySelector('.wfx-toggle').addEventListener('click',e=>{
  muted=!muted;try{localStorage.setItem('meridian-sound-v1',muted?'off':'on')}catch{}
  e.currentTarget.textContent=muted?'🔇 Sound off':'🔊 Sound on';
  e.currentTarget.setAttribute('aria-pressed',String(!muted));if(!muted)tone()
 });
 controls.querySelector('.wfx-help').addEventListener('click',openHelp);
 document.body.addEventListener('click',e=>{
  const b=e.target.closest('button[data-act],button[data-pick],button[data-event],button[data-decide],button[data-role],button[data-evidence],button[data-district],button[data-resident],button[data-consult],button[data-link-check],button[data-witness],button[data-next],button[data-nextcase],button[data-appeal]');
  if(!b||b.disabled)return;
  tone(true);
  if(b.dataset.next!==undefined||b.dataset.nextcase!==undefined||b.dataset.event!==undefined)burst(e.clientX||window.innerWidth*.5,e.clientY||window.innerHeight*.5,'✨');
 },{passive:true,capture:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
window.WorldFX={tone,burst,celebrate,sceneCity,sceneHall,sceneCourt,caseBoard};
})();