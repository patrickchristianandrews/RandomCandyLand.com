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
 'lexi-open':{sizeGB:4.92,name:'Lexi Uncensored V2 8B'},
 'qwen-coder':{sizeGB:.99,name:'Qwen2.5 Coder 1.5B'},
 'qwen-vision':{sizeGB:1.56,name:'Qwen3-VL 2B language + projector'}
});

const strengths={
 'qwen-small':{fit:'Quick chat · short writing · simple code examples',detail:'Good for brief explanations and small drafts; expect more mistakes on complex coding and reasoning. Photos/video: can describe prompts, not process media.'},
 'qwen-balanced':{fit:'General writing · everyday questions · basic coding',detail:'An accessible middle ground for questions, emails, simple reasoning and code explanations. Photos/video: prompts and storyboards only.'},
 'qwen-quality':{fit:'More detailed writing · programming help · multi-step reasoning',detail:'Better suited to longer instructions, explaining code and planning than smaller chat models, at higher memory cost. Photos/video: prompts only.'},
 'lexi-open':{fit:'Open-ended conversation · creative writing · roleplay',detail:'Community-described uncensored model intended for creative and less-restricted text replies. Not a specialist coding, image or video engine.'},
 'qwen-coder':{fit:'Coding · debugging · tests · code explanation',detail:'Specialized coding model for Python/JavaScript examples, finding simple bugs and explaining code. It cannot execute the code or guarantee correctness. Photos/video: not supported.'},
 'qwen-vision':{fit:'Describe photos · extract text · visual questions',detail:'Multimodal image-understanding model, not an image/video generator. The mobile app must load BOTH GGUF files (language and mmproj vision projector).'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const pace=gb=>{
 const ram=typeof navigator.deviceMemory==='number'&&navigator.deviceMemory>0?navigator.deviceMemory:null;
 if(ram&&gb/ram>.50)return 'Likely slow or unable to load · size-based estimate';
 if(gb<=.65)return 'Relatively lighter model · speed depends on phone/app';
 if(gb<=1.7)return 'Medium relative workload · speed not measured';
 return 'Heavier relative workload · speed not measured';
};

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
  const profile=strengths[card.dataset.portableModel];
  if(profile&&!card.querySelector('.portable-model-capabilities')){
   const holder=document.createElement('div');holder.className='portable-model-capabilities';
   holder.innerHTML='<b>Best for</b><p>'+esc(profile.fit)+'</p><small>'+esc(profile.detail)+'</small>'+
    '<div class="portable-model-ratings"><span><b>Answer accuracy</b><small>Not benchmarked</small></span><span><b>Response time</b><small>Not measured · '+esc(pace(spec.sizeGB))+'</small></span></div>';
   card.querySelector('.portable-model-size')?.insertAdjacentElement('afterend',holder);
  }
 }
 const note=$('#portableModelDevice');
 if(note){
  const ram=typeof navigator.deviceMemory==='number'&&navigator.deviceMemory>0?navigator.deviceMemory:null;
  const agent=navigator.userAgent||'';
  const tablet=/iPad/i.test(agent)||(/Macintosh/i.test(agent)&&navigator.maxTouchPoints>1)||(/Android/i.test(agent)&&!/Mobile/i.test(agent));
  const phone=!tablet&&(/iPhone|iPod/i.test(agent)||(/Android/i.test(agent)&&/Mobile/i.test(agent)));
  const computer=/Windows|Macintosh|Linux/i.test(agent);
  const device=tablet?'Tablet browser':phone?'Phone browser':computer?'Laptop/desktop browser':'Device browser';
  note.textContent=device+' · '+(ram?ram+' GB coarse reported device memory':'System RAM not available')+
    ' · the browser cannot measure free storage, actual GPU capacity, or whether a model will run here.';
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
