/* Random AI portable GGUF downloads for Android/iPhone.
 * No model weights are proxied, copied, or uploaded by this website.
 * Direct links are to specific, publisher-hosted quantized GGUF files.
 * Browser controls where files are saved (usually Downloads/Files).
 * These portable GGUFs are NOT directly supported by the WebLLM browser runtime.
 */
(()=>{'use strict';
const $=q=>document.querySelector(q);
const specs=Object.freeze({
 'qwen-small':{sizeGB:.484,name:'Qwen3 0.6B'},
 'qwen-balanced':{sizeGB:1.282,name:'Qwen3 1.7B'},
 'qwen-quality':{sizeGB:2.50,name:'Qwen3 4B'},
 'lexi-open':{sizeGB:4.92,name:'Lexi Uncensored V2 8B'}
});
function estimate(sizeGB){
 const ram=typeof navigator.deviceMemory==='number'&&navigator.deviceMemory>0?navigator.deviceMemory:null;
 // deviceMemory is coarse, can be capped at 8GB, and isn't free GPU/device RAM.
 // GGUF inference may use CPU or GPU, often with extra memory/context overhead.
 if(!ram)return {className:'unknown',label:'Memory not reported — check your phone before loading'};
 const ratio=sizeGB/ram;
 if(ratio>.55)return {className:'heavy',label:'Very demanding for this device · may not load'};
 if(ratio>.32)return {className:'caution',label:'Higher demand · performance and loading uncertain'};
 if(ratio>.15)return {className:'moderate',label:'Moderate size · device test required'};
 return {className:'light',label:'Lighter option for this device · not a speed guarantee'};
}
function render(){
 for(const card of document.querySelectorAll('[data-portable-model]')){
  const spec=specs[card.dataset.portableModel];
  if(!spec)continue;
  const info=estimate(spec.sizeGB),node=card.querySelector('.portable-model-fit');
  if(node){node.className='portable-model-fit '+info.className;node.textContent=info.label;}
 }
 const note=$('#portableModelDevice');
 if(note){
  const ram=typeof navigator.deviceMemory==='number'&&navigator.deviceMemory>0?navigator.deviceMemory:null;
  const device=/(Android|iPhone|iPad)/i.test(navigator.userAgent||'')?'Phone/tablet browser':'Browser';
  note.textContent=device+' · '+(ram?ram+' GB coarse reported device memory':'System RAM not available')+
    ' · browser cannot check available Downloads storage, exact GPU capacity, or guarantee a model will run.';
 }
}
const existing=$('#phoneGGUFPicker');
if(existing)existing.addEventListener('change',()=>{
 const file=existing.files&&existing.files[0],status=$('#phoneGGUFStatus');
 if(!status)return;
 if(!file){status.textContent='No file selected.';return}
 if(!/\.gguf$/i.test(file.name)){
  status.textContent='This is not a .gguf model file. Select a complete downloaded GGUF in Files / Downloads.';
  existing.value='';return;
 }
 status.textContent='✓ Selected: '+file.name+' · '+(file.size/1000000000).toFixed(2)+' GB. This file remains on your phone. To run it, open a GGUF-compatible app, choose Add local model, and select the same file. Random AI does not upload or run GGUF files in its browser chat.';
 existing.value='';
});
document.addEventListener('click',event=>{
 const goto=event.target.closest?.('[data-open-portable-files]');
 if(goto){
  event.preventDefault();
  document.querySelector('[data-view="home"]')?.click();
  window.requestAnimationFrame(()=>{
   document.querySelector('#portablePhoneModels')?.scrollIntoView({
    behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
    block:'start'
   });
  });
  return;
 }
 const button=event.target.closest?.('[data-phone-file-info]');
 if(button){
  const notice=$('#portableModelDownloadStatus');
  const id=button.dataset.phoneFileInfo,info=specs[id];
  if(info&&notice)notice.textContent='Opening the verified Hugging Face download for '+info.name+'. Your browser controls the download and save location. Check Downloads or Files afterward; this page cannot see download progress or confirm completion.';
 }
});
const api=Object.freeze({estimate,specs});
window.RandomAIPhoneFiles=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});
else render();
})();
