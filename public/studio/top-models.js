/* Random AI: current runnable models, local cache reuse, honest device-specific estimates.
 * Uses the same model registry and loader as chat; this is not a global leaderboard.
 */
(()=>{'use strict';
const $=q=>document.querySelector(q);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const perfKey='random-ai-observed-performance-v1';
let records=[],device={gpu:false,ram:null,adapter:false,reason:'Checking your browser…'},lastRefresh=0,probing=false;
const readPerf=()=>{try{const x=JSON.parse(localStorage.getItem(perfKey)||'{}');return x&&typeof x==='object'?x:{}}catch{return {}}};
const remembered=()=>window.RandomAIModelMemory;
const name=m=>window.RandomAILocal?.getName?.(m.id)||m.id;
const memoryMB=m=>Number(m.vram)||0;
const memoryText=m=>memoryMB(m)?(memoryMB(m)/1024).toFixed(1)+' GB GPU estimate':'GPU estimate unknown';
const isUncensored=m=>/Hermes-3-Llama-3\.1|uncensored|abliterated|dolphin/i.test(m.id);
const isLessFiltered=m=>/openhermes|neuralhermes|hermes-2|hermes-3|uncensored|abliterated|dolphin/i.test(m.id);
const recentScore=id=>{
 const s=id.toLowerCase();
 if(/qwen3\.5|gemma-4/.test(s))return 95;
 if(/qwen3|gemma-3|phi-4/.test(s))return 85;
 if(/llama-3\.3|llama-3\.2|ministral-3|smollm3/.test(s))return 76;
 if(/llama-3\.1|gemma-2|qwen2\.5|phi-3\.5/.test(s))return 66;
 return 42;
};
function evaluation(m){
 const v=memoryMB(m),r=device.ram;
 if(!device.gpu)return {label:'Cannot run locally in this browser',kind:'no',explanation:'WebGPU is unavailable. Try supported Chrome/Edge or hosted Instant AI.',score:-300};
 if(!device.adapter)return {label:'GPU compatibility not confirmed',kind:'warn',explanation:device.reason,score:-100};
 if(!v)return {label:'Unknown GPU memory requirement',kind:'warn',explanation:'The runtime did not publish a memory estimate for this model.',score:-15};
 // System RAM is a coarse, privacy-limited hint, NOT reported GPU capacity.
 // We deliberately avoid predicting exact speed or guaranteeing model loads.
 if(r){
  const ratio=v/(r*1024);
  if(ratio>=.65)return {label:'High risk on this device',kind:'no',score:-90,explanation:'Model estimates use a large share of reported system memory. Browser GPU limits may prevent loading.'};
  if(ratio>=.35)return {label:'May be too heavy',kind:'warn',score:-35,explanation:'Large local model relative to coarse device memory; loading and speed are uncertain.'};
  if(ratio<=.14)return {label:'Likely lighter to run',kind:'good',score:36,explanation:'Lower memory requirement relative to coarse device memory; this is not a benchmark.'};
  return {label:'Possibly workable',kind:'mid',score:12,explanation:'Moderate demand relative to coarse device memory; an actual load is needed to confirm.'};
 }
 if(v<1300)return {label:'Smaller download · best first try',kind:'good',score:25,explanation:'Low listed memory requirement. Your browser does not expose enough RAM information for a stronger prediction.'};
 if(v<3000)return {label:'Medium demand · test to confirm',kind:'mid',score:4,explanation:'GPU capacity is not exposed, so success and speed cannot be predicted.'};
 return {label:'High memory demand · test to confirm',kind:'warn',score:-38,explanation:'Large model; the browser does not expose its actual available GPU memory.'};
}
function score(m){const e=evaluation(m);return e.score+recentScore(m.id)+((remembered()?.isSaved(m.id))?28:0)+(memoryMB(m)>0?8:0)-(m.special?100:0)-(memoryMB(m)>7000?35:0);}
function uniqueVariants(input){
 const seen=new Set();
 return input.filter(m=>{
  const key=m.id.replace(/-(?:q\d+[a-z0-9_]+|q0f\d+)(?:-MLC)?$/i,'').replace(/-MLC$/i,'').toLowerCase();
  if(seen.has(key))return false;seen.add(key);return true;
 });
}
function latest(){
 return uniqueVariants(records.filter(m=>!m.special).sort((a,b)=>score(b)-score(a)||a.vram-b.vram)).slice(0,7);
}
function card(m,extra=''){
 const evaluationResult=evaluation(m);
 const obs=readPerf()[m.id];
 const saved=remembered()?.isSaved(m.id);
 const action=saved?'▶ Load saved':'↓ Download & load';
 const real=obs&&obs.chars>=30&&obs.ms>=250?'<small class="top-model-observed">Measured here: '+Number(obs.chars/obs.ms*1000).toFixed(1)+' output characters/sec during a previous local chat.</small>':'';
 const origin=isUncensored(m)?'<span class="model-candidate-tag">Publisher-described uncensored</span>':isLessFiltered(m)?'<span class="model-candidate-tag">Community fine-tune · filtering varies</span>':'';
 return '<article class="top-model-card" data-rank-id="'+esc(m.id)+'">'+
 '<div class="top-model-card-top"><span class="model-candidate-family">'+esc(m.family+' · '+m.role)+'</span>'+origin+'</div>'+
 '<h3>'+esc(name(m))+'</h3>'+
 '<p class="top-model-requirement">'+esc(memoryText(m))+(saved?' · ✓ Downloaded on this browser':'')+'</p>'+
 '<p class="top-model-prediction '+esc(evaluationResult.kind)+'">'+esc(evaluationResult.label)+'</p>'+
 '<small class="top-model-caveat">'+esc(evaluationResult.explanation)+'</small>'+real+
 '<button type="button" class="primary top-model-action" data-top-load="'+esc(m.id)+'"'+(device.gpu?'':' disabled title="WebGPU unavailable"')+'>'+action+'</button>'+
 '</article>';
}
function render(){
 const found=latest();
 for(const [container,count] of [['#topAiList',7],['#topAiSettingsList',4]]){
  const el=$(container);if(!el)continue;
  el.innerHTML=found.length?found.slice(0,count).map(m=>card(m)).join(''):'<p class="fine-print">Checking current browser-compatible model choices… Models appear after the local model catalog loads.</p>';
 }
 const matches=uniqueVariants(records.filter(isUncensored).sort((a,b)=>score(b)-score(a))).slice(0,3);
 const relaxed=uniqueVariants(records.filter(isLessFiltered).sort((a,b)=>score(b)-score(a))).slice(0,3);
 const group=$('#uncensoredChoices');
 if(group){
  group.innerHTML=matches.length?
   matches.map(m=>card(m)).join(''):
   relaxed.length?'<p class="fine-print">No explicitly uncensored model verified in this WebLLM runtime. These more open community fine-tunes are available, but may still refuse requests.</p>'+relaxed.map(m=>card(m)).join(''):
   '<p class="fine-print">No explicitly uncensored, locally loadable model was found in this runtime. An arbitrary GGUF download cannot be loaded directly by the WebLLM browser engine. A compatible MLC weight bundle and WebGPU library would be needed.</p>';
 }
 const s=device.ram?device.ram+' GB coarse memory estimate':'Memory not exposed';
 const message=device.gpu?(device.adapter?'WebGPU adapter detected':'WebGPU present; '+device.reason):'WebGPU not available';
 const label=message+' · '+s+'. Model fit is an estimate, not measured speed. Browser storage and GPU limits may still prevent loading.';
 for(const id of ['topAiDeviceSummary','topAiSettingsSummary']){const e=$('#'+id);if(e)e.textContent=label}
 const freshness=$('#topAiUpdated');if(freshness)freshness.textContent=records.length?'Catalog checked this visit · '+records.length+' loadable variants · auto-checks when this page is active':'Waiting for the current WebLLM model catalog…';
 const saved=remembered()?.savedIds?.()||[];
 const quick=$('#chatQuickSavedModels');
 if(quick){
  quick.innerHTML=saved.length?'<strong>Already downloaded on this browser</strong><div class="chat-quick-model-buttons">'+saved.slice(0,6).map(id=>'<button type="button" data-top-load="'+esc(id)+'"'+(device.gpu?'':' disabled')+'>'+esc(window.RandomAILocal?.getName?.(id)||id)+' · Load</button>').join('')+'</div>':'';
  quick.hidden=!saved.length;
 }
}
async function probe(){
 if(probing)return;probing=true;
 const gpu=Boolean(navigator.gpu);
 device={gpu,adapter:false,ram:typeof navigator.deviceMemory==='number'&&navigator.deviceMemory>0?navigator.deviceMemory:null,
  reason:gpu?'Checking browser GPU adapter…':'This device/browser does not expose WebGPU.'};
 render();
 if(gpu){
  try{
   const a=await navigator.gpu.requestAdapter();
   device.adapter=Boolean(a);
   device.reason=a?'Device adapter detected; actual GPU memory is not exposed.':'No usable WebGPU adapter. Try current Chrome/Edge and hardware acceleration.';
  }catch{device.reason='GPU adapter check failed. Model loading remains unverified.'}
 }
 probing=false;render();
}
function updateCatalog(){
 records=window.RandomAILocal?.getModels?.()||[];
 lastRefresh=Date.now();
 render();
}
function load(id){
 if(!records.some(m=>m.id===id))return;
 const local=window.RandomAILocal;
 local?.select?.(id);
 const settings=$('#view-settings');
 if(!device.gpu||!device.adapter){
  settings?.querySelector('#gpuCheck')?.scrollIntoView({behavior:'smooth',block:'center'});
  document.querySelector('[data-go="settings"]')?.click();
  return;
 }
 const button=$('#loadModel');
 if(button&&!button.disabled)button.click();
 else document.querySelector('[data-go="settings"]')?.click();
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-top-load]');
 if(b){e.preventDefault();load(b.dataset.topLoad)}
 const refresh=e.target.closest?.('#topAiRefresh');
 if(refresh){refresh.disabled=true;refresh.textContent='Checking catalog…';Promise.resolve(window.RandomAILocal?.refresh?.()).finally(()=>{refresh.disabled=false;refresh.textContent='↻ Check newest supported models';updateCatalog()})}
});
window.addEventListener('random-ai-catalog-ready',updateCatalog);
window.addEventListener('random-ai-saved-models-changed',render);
window.addEventListener('random-ai-performance-measured',render);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)return;
 if(Date.now()-lastRefresh>6*60*60*1000){
  void Promise.resolve(window.RandomAILocal?.refresh?.()).finally(updateCatalog);
 }
});
window.RandomAITopModels=Object.freeze({updateCatalog,evaluate:evaluation,listed:()=>latest().slice(),probe});
const init=()=>{updateCatalog();void probe()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
