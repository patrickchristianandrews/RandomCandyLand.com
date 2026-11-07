/* Random Candy Land notification center: permission only after a real tap.
 * No automatic subscriptions or non-consensual notifications.
 * Server sees game IDs and active/completed status only, never save files.
 */
(()=>{'use strict';
const KEY='rcl-game-push-settings-v1',LAST='rcl-game-push-sync-v1',LAST_PROGRESS='rcl-game-push-progress-v1';
const GAMES=[
 {id:'corridors',name:'The Corridors',icon:'🚪'},
 {id:'docket',name:'The Docket',icon:'⚖️'},
 {id:'trace',name:'TRACE OSINT',icon:'🔎'},
 {id:'pet',name:'FM-1 Trumpagotchi',icon:'🐣'},
 {id:'originalpet',name:'Trumpagotchi OG',icon:'🐥'}
];
const $=s=>document.querySelector(s);
const endpoint=typeof window.RCL_PUSH_ENDPOINT==='string'?window.RCL_PUSH_ENDPOINT.trim().replace(/\/$/,''):'';
let ready=false,publicKey='',working=false;
let prefs=load();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&typeof r==='object'&&Array.isArray(r.games))return r;}catch{}return {token:'',games:[],hour:18,frequency:'twice-weekly',subscribed:false}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}}
const installed=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
const isMobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
function readState(key){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null}catch{return null}}
function progress(){
 const corr=readState('corridors-save-v1'),docket=readState('docket-save-v1'),trace=readState('trace-osint-professional-v1'),pet=readState('random-candy-land-trumpagotchi-original-fm1-adaptation-v1'),orig=readState('trumpagotchi_save_v2');
 const out={
  corridors:corr?(corr.finished?'completed':'active'):'not-started',
  docket:docket?(docket.finished?'completed':'active'):'not-started',
  trace:trace?(Array.isArray(trace.finished)&&trace.finished.length>=25?'completed':'active'):'not-started',
  pet:pet&&!pet.gameOver?'active':pet?'completed':'not-started',
  originalpet:orig?'active':'not-started'
 };
 return out;
}
function stateSummary(){const p=progress();const active=GAMES.filter(g=>p[g.id]==='active');return {active:p,started:active.length}}
function token(){const b=crypto.getRandomValues(new Uint8Array(24));return [...b].map(n=>n.toString(16).padStart(2,'0')).join('')}
function decodeKey(text){const s=text.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(s+'='.repeat((4-s.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function status(message,error=false){const el=$('#rcl-notify-status');if(!el)return;el.textContent=message;el.dataset.error=error?'yes':'no'}
function render(){
 const node=$('#rcl-notify-center');if(!node||node.dataset.bound)return;
 const game=GAMES.find(g=>g.id===node.dataset.game);
 if(!game)return; // The homepage no longer includes the global reminder center.
 node.dataset.bound='yes';
 node.innerHTML='<div class="rcl-notify-heading"><div><span class="rcl-notify-eyebrow">🔔 '+game.icon+' '+game.name.toUpperCase()+'</span><h2>Get a reminder to pick up where you left off.</h2><p>Only for this game, only if you choose. Alerts are scheduled for unfinished play, not automatic event-by-event updates.</p></div></div>'+
 '<div class="rcl-notify-steps"><span><b>1</b> Install this game</span><span><b>2</b> Select reminders</span><span><b>3</b> Allow notifications</span></div>'+
 '<div class="rcl-notify-games" id="rcl-notify-games">'+[game].map(g=>'<label class="rcl-notify-game"><input type="checkbox" data-game="'+g.id+'" '+(prefs.games.includes(g.id)?'checked':'')+'><span>'+g.icon+'</span><span>'+g.name+'</span><small data-state="'+g.id+'"></small></label>').join('')+'</div>'+
 '<div class="rcl-notify-options"><label>Reminder schedule<select id="rcl-notify-frequency"><option value="twice-weekly">Twice a week (Mon & Thu)</option><option value="weekly">Once a week (Saturday)</option><option value="daily">Once a day</option></select></label>'+
 '<label>Time on your phone<select id="rcl-notify-hour"><option value="9">9:00 AM</option><option value="13">1:00 PM</option><option value="18">6:00 PM</option></select></label></div>'+
 '<div class="rcl-notify-actions"><button id="rcl-notify-enable" type="button">🔔 Enable phone reminders</button><button id="rcl-notify-test" type="button" hidden>Send test push</button><button id="rcl-notify-disable" type="button" hidden>Turn off reminders</button></div>'+
 '<p class="rcl-notify-status" id="rcl-notify-status" role="status" aria-live="polite">Checking notification support…</p>'+
 '<p class="rcl-notify-small">Only optional reminders for unfinished sessions, never late-night alerts. On iPhone, install this game to the Home Screen and open that icon first. On Android, use a supported browser or installed app. Detailed game data stays on your device. Cloudflare push service configuration is required for background delivery.</p>';
 $('#rcl-notify-frequency').value=prefs.frequency;
 $('#rcl-notify-hour').value=String(prefs.hour);
 for(const input of node.querySelectorAll('[data-game]'))input.addEventListener('change',()=>{const id=input.dataset.game;prefs.games=input.checked?[...new Set([...prefs.games,id])]:prefs.games.filter(g=>g!==id);persist();if(prefs.subscribed)void sync(true);updateUI()});
 for(const id of ['frequency','hour'])$('#rcl-notify-'+id).addEventListener('change',e=>{prefs[id]=id==='hour'?Number(e.target.value):e.target.value;persist();if(prefs.subscribed)void sync(true)});
 $('#rcl-notify-enable').addEventListener('click',enable);
 $('#rcl-notify-disable').addEventListener('click',disable);
 $('#rcl-notify-test').addEventListener('click',test);
 updateUI();
}
function updateUI(){
 const node=$('#rcl-notify-center');if(!node)return;
 const p=progress();for(const g of GAMES){const el=node.querySelector('[data-state="'+g.id+'"]');if(el)el.textContent=p[g.id]==='completed'?'✓ Complete':p[g.id]==='active'?'In progress':'Not started'}
 const disable=$('#rcl-notify-disable'),test=$('#rcl-notify-test'),enable=$('#rcl-notify-enable');
 if(disable)disable.hidden=!prefs.subscribed;
 if(test)test.hidden=!prefs.subscribed;
 if(enable)enable.textContent=prefs.subscribed?'✓ Phone reminders enabled':'🔔 Enable phone reminders';
 if(enable)enable.disabled=working||prefs.subscribed||!ready;
 const scoped=GAMES.find(g=>g.id===node.dataset.game);const checked=!!scoped&&prefs.games.includes(scoped.id);const started=checked&&p[scoped.id]==='active'?1:0;
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){status('This browser cannot receive Web Push. Try a supported installed Android or iPhone web app.',true);return;}
 if(isMobile()&&!installed()){status('Install this game to your Home Screen, open its icon, then enable alerts.',false);if(enable)enable.disabled=true;return}
 if(Notification.permission==='denied'){status('Notification permission is blocked in device settings. Re-enable it there first.',true);if(enable)enable.disabled=true;return}
 if(!endpoint){status('Background alerts are not available yet: the site owner must connect the notification service. You can play without alerts.',true);if(enable)enable.disabled=true;return}
 if(!ready){status('Connecting to the notification service…',false);return}
 if(!checked){status('Select this game above to opt in to reminders.',false);if(enable)enable.disabled=true;return}
 if(prefs.subscribed)status(started?'This game is selected for scheduled reminders while your adventure is unfinished.':'This game is selected. Reminders only apply after you start playing.');
 else status('Ready: allow scheduled phone reminders for this game on days you choose.');
}
async function api(path,data){if(!endpoint)throw Error('Notification service is not connected');const response=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),mode:'cors',cache:'no-store',keepalive:path==='/update'});let json;try{json=await response.json()}catch{json={error:'Invalid response from server'}}if(!response.ok)throw Error(json.error||'Push service request failed');return json}
async function registration(){return await navigator.serviceWorker.ready}
async function subscription(){const reg=await registration();return await reg.pushManager.getSubscription()}
async function ensureConnection(){
 if(!endpoint||!endpoint.startsWith('https://')){updateUI();return}
 try{
  const r=await fetch(endpoint+'/public-key',{cache:'no-store',mode:'cors'});const j=await r.json();
  if(!r.ok||typeof j.publicKey!=='string'||decodeKey(j.publicKey).length!==65)throw Error('The push server is not yet fully configured');
  publicKey=j.publicKey;ready=true;
  if(prefs.subscribed&&!(await subscription())){prefs.subscribed=false;persist()}
  updateUI();
 }catch(e){ready=false;status('Push setup needs attention: '+(e?.message||'service unavailable'),true);updateUI()}
}
function payload(sub){return {token:prefs.token,subscription:sub.toJSON(),preferences:{games:prefs.games,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',hour:prefs.hour,frequency:prefs.frequency,progress:progress()}}}
async function enable(){
 if(working||prefs.subscribed||!ready||prefs.games.length<1)return;
 const node=$('#rcl-notify-center');if(node?.dataset.game&&!prefs.games.includes(node.dataset.game))return;
 if(isMobile()&&!installed()){updateUI();return}
 working=true;updateUI();
 try{
  // Permission must be requested directly from this tap (Safari requirement).
  const permitted=await Notification.requestPermission();
  if(permitted!=='granted')throw Error('Notification permission was not granted.');
  const reg=await registration();
  let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeKey(publicKey)});
  if(!prefs.token)prefs.token=token();
  await api('/subscribe',payload(sub));
  prefs.subscribed=true;persist();status('Enabled! Your phone will receive occasional reminders for games you have started.');
 }catch(e){status('Could not enable reminders: '+(e?.message||'unknown error'),true)}
 finally{working=false;updateUI()}
}
async function sync(force=false){
 if(!prefs.subscribed||!ready||!prefs.token)return;
 const last=Number(localStorage.getItem(LAST)||0);
 const summary=JSON.stringify(progress());
 if(!force&&Date.now()-last<90*60*1000&&localStorage.getItem(LAST_PROGRESS)===summary)return;
 try{
  const sub=await subscription();if(!sub){prefs.subscribed=false;persist();updateUI();return}
  await api('/update',payload(sub));
  localStorage.setItem(LAST,String(Date.now()));
  localStorage.setItem(LAST_PROGRESS,summary);
 }catch(e){if(force)status('Reminder settings could not sync: '+(e?.message||'server unavailable'),true)}
}
async function disable(){
 if(working)return;working=true;
 try{
  const sub=await subscription();
  if(sub&&prefs.token&&endpoint){try{await api('/unsubscribe',{token:prefs.token,subscription:sub.toJSON()})}catch(e){status('Could not reach the server; subscription is being disabled on this device.',true)}}
  if(sub)await sub.unsubscribe();
  prefs.subscribed=false;prefs.token='';persist();status('Phone reminders turned off.');
 }catch(e){status('Could not turn off alerts: '+(e?.message||'unknown error'),true)}
 finally{working=false;updateUI()}
}
async function test(){
 const button=$('#rcl-notify-test');if(!prefs.subscribed||!ready||!button)return;button.disabled=true;
 try{const sub=await subscription();if(!sub)throw Error('Subscription expired');await api('/test',{token:prefs.token,subscription:sub.toJSON()});status('A real test push was sent. Check your phone notifications.')}
 catch(e){status('Test push failed: '+(e?.message||'try again'),true)}
 finally{button.disabled=false}
}
function mount(){const node=$('#rcl-notify-center');if(!node||!GAMES.some(g=>g.id===node.dataset.game))return;render();void ensureConnection();if(prefs.subscribed){window.setTimeout(()=>void sync(),1700)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){updateUI();if(prefs.subscribed)void sync()}});
window.addEventListener('pagehide',()=>{if(prefs.subscribed&&ready)void sync()});
window.RandomCandyNotifications={getProgress:progress,refresh:()=>{updateUI();void sync(true)},mount};
})();
