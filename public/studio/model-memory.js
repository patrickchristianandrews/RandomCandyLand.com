/* Random AI model memory — verifies WebLLM's existing browser Cache API artifacts.
 * Does not change cache backend, migrate private data, or re-download weights during discovery.
 * A remembered model ID is never presented as downloaded until hasModelInCache confirms it.
 */
(()=>{'use strict';
const KEY='random-ai-saved-models-v1', LAST='random-ai-last-local-model-v1';
const $=q=>document.querySelector(q);
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=id=>window.RandomAILocal?.getName?.(id)||id.replace(/-MLC$/,'').replace(/-/g,' ');
let known=[],last='',records=[],library=null,checking=false,checked=0,unknown=false;
const verified=new Map();
try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))known=saved.filter(x=>typeof x==='string').slice(0,200);last=localStorage.getItem(LAST)||'';}catch{}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify([...new Set(known)].slice(0,200)));if(last)localStorage.setItem(LAST,last);else localStorage.removeItem(LAST)}catch{}
}
function savedIds(){return records.map(m=>m.id).filter(id=>verified.get(id)===true)}
function isSaved(id){return verified.get(id)===true}
function preferred(){return last||known[0]||''}
function tell(){window.dispatchEvent(new CustomEvent('random-ai-saved-models-changed',{detail:{count:savedIds().length,scanning:checking}}))}
function render(){
 const count=savedIds().length,summary=$('#savedModelCount'),list=$('#savedModelList'),hint=$('#savedModelHint'),hero=$('#savedModelHome');
 if(summary)summary.textContent=checking?'Checking saved models… '+checked+'/'+records.length:count?count+' model'+(count===1?'':'s')+' stored on this device':unknown?'Could not verify stored models':'No saved models found on this device';
 if(hint)hint.textContent=unknown?'Local model files could not be checked. Try Refresh saved models while online.':
 checking?'Checking the actual browser files. This does not download model weights.':
 count?'Select a saved model and load it into memory to start chatting. No new weight download is needed while its files remain cached.':
 'Models downloaded previously may have been cleared by your browser or stored in another browser/profile. Select a model below to download it.';
 if(hero)hero.textContent=checking?'🔎 Checking saved AI models…':count?'✓ '+count+' saved local model'+(count===1?'':'s')+' available · tap to load':'No saved local models detected yet';
 if(list){
  const ids=savedIds();
  list.innerHTML=ids.map(id=>'<div class="saved-model-item"><div><strong>✓ '+esc(name(id))+'</strong><small>Stored on this device · ready to load</small></div><button type="button" data-reuse-model="'+esc(id)+'" class="outline compact">Load saved</button><button type="button" data-remove-model="'+esc(id)+'" class="outline compact saved-remove" aria-label="Remove downloaded '+esc(name(id))+'">Remove</button></div>').join('')||
   (checking?'<p class="saved-model-empty">Looking for previously downloaded models…</p>':'<p class="saved-model-empty">No verified cached models. New downloads will appear here automatically.</p>');
 }
 tell();
}
async function scan(){
 if(checking||!library||!records.length)return;
 checking=true;checked=0;unknown=false;render();
 const ids=records.map(m=>m.id).sort((a,b)=>(a===last?-2:b===last?2:0)||(known.includes(a)?-1:0)-(known.includes(b)?-1:0));
 let next=0;
 async function worker(){
  while(next<ids.length){
   const id=ids[next++];
   try{
    if(typeof library.hasModelInCache!=='function')throw Error('WebLLM cache inspection not available');
    const yes=await library.hasModelInCache(id,library.prebuiltAppConfig);
    verified.set(id,yes===true);
    if(yes&&!known.includes(id))known.push(id);
   }catch{unknown=true;if(!verified.has(id))verified.set(id,null)}
   checked++;
   if(checked%6===0||checked===ids.length)render();
  }
 }
 await Promise.all(Array.from({length:3},worker));
 checking=false;
 // Keep historical names only as hints, but rely on verified cache for "saved" badges.
 save();render();
}
function register(lib,items){
 library=lib;records=Array.isArray(items)?items.filter(m=>m?.id):[];
 // Preserve verified state if a catalog refresh is requested, then recheck the actual files.
 render();void scan();
}
function selected(id){if(id&&records.some(m=>m.id===id)){last=id;save()}}
async function keepStorage(){
 const note=$('#savedModelStorage');
 if(!navigator.storage?.persist){if(note)note.textContent='This browser does not support requesting persistent storage.';return false}
 try{
  const granted=await navigator.storage.persist();
  if(note)note.textContent=granted?'✓ Browser approved persistent storage for this site. Clearing site data can still remove models.':'Browser did not grant protected storage. Cached models should survive normal visits, but may be cleared to free space.';
  return granted;
 }catch{if(note)note.textContent='Could not request protected browser storage.';return false}
}
function markLoaded(id){
 if(!id)return;
 verified.set(id,true);if(!known.includes(id))known.push(id);
 last=id;save();render();
 // User-initiated loading can improve durability without storing model weights in localStorage.
 void keepStorage();
}
async function remove(id){
 if(!isSaved(id)||!library?.deleteModelAllInfoInCache)return;
 if(window.RandomAIActiveModel===id){window.alert('This model is in use. Reload this page or switch to a different model before removing its saved files.');return}
 if(!window.confirm('Delete the downloaded files for '+name(id)+' from this browser? Reusing this model afterward will require another download.'))return;
 const hint=$('#savedModelHint');if(hint)hint.textContent='Removing this model’s downloaded files…';
 try{
  await library.deleteModelAllInfoInCache(id,library.prebuiltAppConfig);
  verified.set(id,false);known=known.filter(x=>x!==id);if(last===id)last=savedIds()[0]||'';
  save();render();
 }catch{if(hint)hint.textContent='Could not remove this model’s files. Try again after reloading.'}
}
document.addEventListener('click',event=>{
 const reuse=event.target.closest('[data-reuse-model]');
 if(reuse){const id=reuse.dataset.reuseModel;window.RandomAILocal?.select?.(id);$('#loadModel')?.click();return}
 const del=event.target.closest('[data-remove-model]');if(del){void remove(del.dataset.removeModel);return}
 if(event.target.closest('#savedModelRefresh'))void scan();
 if(event.target.closest('#savedModelKeep'))void keepStorage();
});
window.RandomAIModelMemory=Object.freeze({register,scan,markLoaded,selected,isSaved,savedIds,preferred,getLast:()=>last,getKnown:()=>known.slice(),getChecking:()=>checking,render,keepStorage});
document.addEventListener('DOMContentLoaded',render,{once:true});
})();
