/* Local only: measure actual GPU model performance and report browser device hints. */
(()=>{'use strict';
const $=id=>document.getElementById(id),mode=$('deviceLabMode'),run=$('deviceLabRun');
if(!mode||!run)return;
const second=$('deviceLabSecond'),status=$('deviceLabStatus'),results=$('deviceLabResults'),specs=$('deviceLabSpecs');
const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
function options(){
 const choices=$('modelSelect')?.options||[],active=window.RandomAIDeviceLab?.busy?.()?'':window.RandomAIModelBenchmark?.active?.();
 const saved=window.RandomAIModelMemory;
 const prior=second.value;second.replaceChildren(new Option('Choose a second model…',''));
 for(const opt of choices){
  if(!opt.value||opt.value===active||!saved?.isSaved?.(opt.value))continue;
  second.add(new Option(opt.textContent.trim(),opt.value));
 }
 if([...second.options].some(x=>x.value===prior))second.value=prior;
}
function description(d){
 const lines=[
  'CPU: '+(d.logicalThreads?d.logicalThreads+' reported logical threads':'not exposed'),
  'RAM: '+(d.reportedMemoryGB?d.reportedMemoryGB+' GB reported (rounded)':'not exposed'),
  'WebGPU: '+(d.webgpu?'available':'unavailable'),
  'GPU vendor: '+(d.gpuVendor||'not exposed'),
  'GPU memory: '+(d.maxBufferMB?d.maxBufferMB+' MB maximum buffer (not total VRAM)':'not exposed'),
  d.userAgent
 ];
 specs.replaceChildren(...lines.map(t=>{const span=document.createElement('span');span.textContent=t;return span}));
}
function render(item){
 results.replaceChildren();
 const heading=document.createElement('h3');heading.textContent='Measured result · '+({model:'One model',stack:'Workflow stack',infusion:'Two-model infusion'}[item.mode]||item.mode);
 const summary=document.createElement('p');summary.textContent='Total '+fmt(item.totalMs/1000)+' seconds'+(item.loadSecondMs?' · second-model loading '+fmt(item.loadSecondMs/1000)+' seconds':'');
 results.append(heading,summary);
 for(const step of item.actions){
  const line=document.createElement('div');line.className='device-lab-row';
  const a=document.createElement('strong');a.textContent=step.stage;
  const b=document.createElement('span');b.textContent=fmt(step.elapsedMs/1000)+' sec · '+step.characters+' characters'+(step.tokensPerSecond===null?' · tokens/sec unavailable':' · '+fmt(step.tokensPerSecond)+' tokens/sec');
  const c=document.createElement('small');c.textContent=step.model;
  line.append(a,b,c);results.append(line);
 }
 const foot=document.createElement('p');foot.className='fine-print';foot.textContent=item.note;results.append(foot);
}
async function refresh(){
 options();
 try{const d=await window.RandomAIDeviceLab?.profile?.();if(d)description(d)}catch{specs.textContent='GPU information is unavailable in this browser.'}
 const previous=window.RandomAIDeviceLab?.history?.();if(Array.isArray(previous)&&previous.length)render(previous[0]);
}
mode.addEventListener('change',()=>{$('deviceLabSecondWrap').hidden=mode.value!=='infusion';options()});
run.addEventListener('click',async()=>{
 const api=window.RandomAIDeviceLab;if(!api){status.textContent='AI runtime not ready. Reload Random AI and try again.';return}
 options();
 const config={mode:mode.value,secondaryId:second.value};
 if(mode.value==='infusion'&&!config.secondaryId){status.textContent='Choose a second saved, supported model first.';return}
 run.disabled=true;status.textContent='Starting a real on-device benchmark…';
 try{const r=await api.run(config);if(r.error){status.textContent='Not completed: '+r.error;return}
   status.textContent='✓ Test completed on this browser. Results saved locally.';render(r);if(r.device)description(r.device);
 }catch(e){status.textContent='Test could not finish: '+String(e?.message||e)}
 finally{run.disabled=false;options()}
});
window.addEventListener('random-ai-device-lab-progress',e=>{if(run.disabled&&e.detail?.stage!=='Done')status.textContent=e.detail.stage});
window.addEventListener('random-ai-catalog-ready',options);
window.addEventListener('random-ai-saved-models-changed',options);
window.addEventListener('random-ai-stack-changed',()=>{if(mode.value==='stack')status.textContent='Selected stack changed. Run again to measure the new instructions.'});
document.addEventListener('DOMContentLoaded',refresh,{once:true});
if(document.readyState!=='loading')void refresh();
})();