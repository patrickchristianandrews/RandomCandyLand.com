/* Honest start-up status for The Corridors. No pretend percentages. */
(()=>{'use strict';
let ready=false,failed=false,started=Date.now(),timer=null;
const $=id=>document.getElementById(id);
const loader=()=>$('corr-boot');
function status(message){
 const n=$('corr-boot-status');if(n)n.textContent=message;
}
function stop(){ready=true;clearInterval(timer);timer=null}
function failure(reason){
 if(ready||failed)return;
 failed=true;clearInterval(timer);
 const root=loader();if(!root)return;
 const headline=root.querySelector('h2');if(headline)headline.textContent='The world needs a quick restart.';
 status(reason||'A game file did not load. Your local progress has not been reset.');
 const buttons=$('corr-boot-recovery');if(buttons)buttons.hidden=false;
 root.classList.add('corr-boot-failed');
}
function check(){
 if(ready||failed)return;
 if(!loader()){stop();return}
 const elapsed=Date.now()-started;
 if(elapsed>=12000){failure('The game is taking longer than expected. Check your connection or retry. Your locally saved progress is preserved.');return}
 if(elapsed>=7000)status('Still initializing policy scenarios and saved progress…');
 else if(elapsed>=3500)status('Loading the decision engine and your saved game…');
 else status('Connecting the scenario engine…');
}
function init(){
 if(!loader()){stop();return}
 $('corr-boot-retry')?.addEventListener('click',()=>{status('Reloading the current game files…');const next=new URL(location.href);next.searchParams.set('fresh',Date.now().toString(36));location.replace(next.href)});
 $('corr-boot-solo')?.addEventListener('click',()=>{const app=$('app');if(app)app.innerHTML='<section class="panel"><h2>Offline recovery</h2><p>The complete scenario engine is temporarily unavailable. Use Retry to reload the original game. Your saved progress remains on this device.</p><button type="button" class="button" onclick="location.reload()">Retry game</button></section>';stop()});
 check();timer=setInterval(check,900);
}
window.addEventListener('error',event=>{
 if(ready||failed)return;
 const url=event?.filename||event?.target?.src||'';
 if(url&&(/\/the-corridors\/|\/worlds\/(core|experience)/.test(url)))
  failure('A required game script did not load or encountered an error. Retry the game. Your saved progress is preserved.');
},true);
window.addEventListener('unhandledrejection',()=>{
 if(!ready&&!failed&&loader())failure('An initialization step failed. Retry the game. Your saved progress is preserved.');
});
window.CorridorsBoot=Object.freeze({failure,ready:stop,status});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();