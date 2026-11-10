/* TRACE: a one-screen play flow; preserve all Academy engines and saved progress. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function setMode(mode,focus=true){
 const academy=mode==='academy';
 document.body.dataset.traceQuickMode=academy?'academy':'pixel';
 for(const name of ['pixel','academy'])$('trace-mode-'+name)?.setAttribute('aria-pressed',String(name===mode));
 if(focus){
  document.querySelector('#tab-missions')?.click();
  const destination=academy?$('trace-game-command'):$('pq-sidecases');
  if(destination){destination.scrollIntoView({block:'start',behavior:'smooth'});destination.focus?.({preventScroll:true})}
 }
 try{sessionStorage.setItem('trace-preferred-play-v1',mode)}catch{}
}
function init(){
 if(!$('trace-mode-pixel'))return;
 $('trace-mode-pixel').addEventListener('click',()=>setMode('pixel'));
 $('trace-mode-academy').addEventListener('click',()=>setMode('academy'));
 document.querySelectorAll('[data-trace-open-academy]').forEach(b=>b.addEventListener('click',()=>setMode('academy')));
 document.querySelectorAll('[data-trace-play-scout]').forEach(b=>b.addEventListener('click',()=>setMode('pixel')));
 let start='pixel';try{if(sessionStorage.getItem('trace-preferred-play-v1')==='academy')start='academy'}catch{}
 setMode(start,false);
 if(location.hash==='#pixel-mysteries')setMode('pixel',true);
 window.TraceQuickPlay=Object.freeze({setMode,current:()=>document.body.dataset.traceQuickMode});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();