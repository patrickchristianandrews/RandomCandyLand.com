/* TRACE Pixel Quest: playable visual guide using the existing saved mission engine. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const engine=()=>window.TraceAcademyGame;
const districts=[
 ['🚉','Neon Station','station',0,5,'Mox','Your first job! Examine the public record, not the rumors.'],
 ['📷','Pixel Pier','pier',6,10,'Snap','Photos and maps contain clues. Can you verify what they show?'],
 ['🕹️','Circuit Arcade','arcade',11,13,'Byte','Digital breadcrumbs are tricky. Prove the connection!'],
 ['🗝️','Mystery Market','market',14,18,'Dot','Trace sources through a maze of claims, without jumping to conclusions.'],
 ['🏰','Clocktower Files','tower',19,24,'Cipher','One final challenge: turn what you found into a defensible story.']
];
let district=0,tip=0,selection=-1,scenesSeen=new Set();
const elem=(tag,cls,t)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(t!==undefined)e.textContent=t;return e};
const current=()=>engine()?.progress?.()||{active:0,unlocked:0,completed:[],xp:0};
function openCase(id){
 if(engine()?.openCase(id)){document.querySelector('#mission-stage')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 say('🔒 Solve the earlier cases to unlock this one.');
}
function say(message){const e=$('pq-dialogue');if(e)e.textContent=message}
function draw(){
 const api=engine(),p=current(),d=districts[district];if(!api?.missions?.length)return;
 $('pq-xp').textContent=p.xp+' XP';$('pq-solved').textContent=p.completed.length+'/25 CASES';
 $('pq-zone').textContent=d[0]+' '+d[1];$('pq-guide-name').textContent=d[5];
 $('pq-world').dataset.theme=d[2];
 $('pq-progress').style.width=(p.completed.length/25*100)+'%';
 const active=api.missions[p.active];
 if(!scenesSeen.has(district)){say(p.unlocked<d[3]?'This district is locked. Finish the previous missions to open it.':d[6]+' Your next job is '+(active?.title||'to inspect clues')+'.');scenesSeen.add(district)}
 const list=$('pq-missions');list.replaceChildren();
 for(let i=d[3];i<=d[4];i++){
  const m=api.missions[i],cleared=p.completed.includes(i),locked=i>p.unlocked;
  const b=elem('button','pq-mission'+(cleared?' done':'')+(locked?' locked':'')+(i===p.active?' active':''));b.type='button';b.disabled=locked;
  b.append(elem('span','pq-mission-symbol',cleared?'🏆':locked?'🔒':i===p.active?'✨':'📂'));
  const info=elem('span','pq-mission-text');info.append(elem('strong','',String(i+1).padStart(2,'0')+' · '+m.title),elem('small','',cleared?'Solved · Replay':locked?'Finish earlier cases first':i===p.active?'NEXT CASE · TAP TO PLAY':'Explore this case'));b.append(info);
  b.addEventListener('click',()=>openCase(i));list.append(b);
 }
 document.querySelectorAll('[data-pq-district]').forEach((b,i)=>{b.classList.toggle('selected',i===district);b.classList.toggle('unlocked',p.unlocked>=districts[i][3]);b.setAttribute('aria-pressed',String(i===district))});
 $('pq-previous').disabled=district===0;$('pq-next').disabled=district===districts.length-1;
 $('pq-play').textContent=p.completed.length===25?'🏆 Replay the final case':'▶ PLAY NEXT CASE '+String(p.active+1).padStart(2,'0');
}
function init(){
 const anchor=$('trace-game-command');if(!anchor||!engine())return;
 const hub=elem('section','pq-hub');hub.id='trace-pixel-quest';
 hub.innerHTML=`<div class="pq-status"><span>🕵️ TRACE: THE PIXEL FILES</span><span id="pq-xp">0 XP</span><span id="pq-solved">0/25 CASES</span></div>
 <div class="pq-head"><div><small>YOUR DETECTIVE ADVENTURE</small><h2>Explore. Find clues. Crack the case.</h2><p>A playful guided world with 25 real investigations. Follow your sidekick, explore districts and solve mysteries to level up.</p></div><button type="button" class="pq-big-button" id="pq-play">▶ PLAY NEXT CASE</button></div>
 <div class="pq-world" id="pq-world" data-theme="station">
 <div class="pq-stars" aria-hidden="true">✦　✧　✦　·　✧　✦　✧　·　✦</div><div class="pq-moon" aria-hidden="true"></div>
 <div class="pq-buildings" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
 <div class="pq-city-label" id="pq-zone">🚉 Neon Station</div>
 <div class="pq-avatar" aria-label="Pixel detective character"><span class="pq-hat"></span><span class="pq-face">•ᴗ•</span><span class="pq-body"></span><span class="pq-legs"></span></div>
 <div class="pq-city-ground" aria-hidden="true"></div>
 <div class="pq-districts">${districts.map((d,i)=>`<button type="button" data-pq-district="${i}" aria-pressed="false" title="${d[1]}"><b>${d[0]}</b><span>${d[1]}</span></button>`).join('')}</div></div>
 <div class="pq-dialog"><span class="pq-guide-avatar" aria-hidden="true">👾</span><div class="pq-dialog-content"><strong id="pq-guide-name">Mox</strong><p id="pq-dialogue" role="status">Welcome, detective!</p></div><button type="button" id="pq-tip" title="Get a hint">💡 HINT</button></div>
 <div class="pq-progress-track" aria-label="Academy completion"><div id="pq-progress"></div></div>
 <div class="pq-control"><button type="button" id="pq-previous">◀ PREVIOUS</button><span>CHOOSE A DISTRICT · TAP A CASE TO PLAY</span><button type="button" id="pq-next">NEXT ▶</button></div><div class="pq-missions" id="pq-missions"></div>
 <p class="pq-footnote">Your 25 original lessons, scores and saved progress are preserved. All investigations use fictional scenarios.</p>`;
 anchor.parentNode.insertBefore(hub,anchor);
 document.querySelectorAll('[data-pq-district]').forEach(b=>b.addEventListener('click',()=>{district=Number(b.dataset.pqDistrict);tip=0;scenesSeen.delete(district);draw()}));
 $('pq-previous').addEventListener('click',()=>{district=Math.max(0,district-1);scenesSeen.delete(district);draw()});
 $('pq-next').addEventListener('click',()=>{district=Math.min(4,district+1);scenesSeen.delete(district);draw()});
 $('pq-play').addEventListener('click',()=>openCase(current().active));
 $('pq-tip').addEventListener('click',()=>{tip=(tip+1)%4;const hints=['Tap a glowing case file to begin!','Inspect every clue inside the mission.','Choose an answer and read why it is or is not supported.','Finish three decisions to unlock the next file.'];say(hints[tip])});
 document.addEventListener('trace:progress',()=>{const next=current().active;district=Math.max(0,districts.findIndex(d=>next>=d[3]&&next<=d[4]));scenesSeen.delete(district);draw()});
 district=Math.max(0,districts.findIndex(d=>current().active>=d[3]&&current().active<=d[4]));draw();
 document.body.classList.add('pq-ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();