/* Random AI: API-free WebLLM model catalog + featured local task stacks.
 * Each model option comes from the exact runtime used for inference.
 * Stacks use one downloaded model; the optional refinement pass is real generation.
 * Image/video tasks produce prompts only: this text runtime does not render media.
 */
(()=>{'use strict';
const $=q=>document.querySelector(q);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WEBLLM='https://esm.run/@mlc-ai/web-llm@0.2.87';
const memory=()=>window.RandomAIModelMemory;
const stackKey='random-ai-stack-v1';
const PRESETS=[
 {id:'general',label:'✳ Everyday chat · just ask',name:'Everyday Assistant',description:'A flexible helper for questions, writing, explanations and plans—without extra technical steps.',steps:['Understand your request','Give a useful response','Clarify what matters','Suggest a practical next step'],family:/llama|qwen|gemma|phi/i,temperature:.55,firstTokens:850,secondTokens:950,
 instructions:'Respond naturally and helpfully to the user’s request. Avoid assuming they want code. Use clear language, ask only for essential missing details, and explain uncertainty.',review:'Check accuracy and usefulness, remove unnecessary complexity, and make the final answer easy to follow.'},
 {id:'coding',label:'💻 Build an app or website',name:'Code Architect',description:'Build working software with clear requirements, readable files, edge-case handling and practical tests.',steps:['Define features & constraints','Write working code','Audit bugs & accessibility','Deliver tests & setup'],family:/coder|qwen|phi|llama/i,temperature:.25,firstTokens:1100,secondTokens:1150,
 instructions:'You are a careful software engineer. State assumptions briefly, produce usable code with filenames and no fake dependencies. Respect existing files and scope. Include implementation steps and realistic test cases.',review:'Check syntax, missing imports, error handling, accessibility, security, mobile usability and requirements. Correct mistakes and give the complete best solution.'},
 {id:'writing',label:'✍️ Write or improve text',name:'Precision Writer',description:'Turn rough ideas into clear, compelling, audience-appropriate writing without changing the underlying facts.',steps:['Identify audience & purpose','Draft with clarity','Tighten tone & flow','Deliver polished copy'],family:/llama|gemma|qwen|mistral/i,temperature:.7,firstTokens:850,secondTokens:950,
 instructions:'You are a professional editor. Respect the facts and voice of the user. Craft coherent, engaging writing with the requested tone and formatting. Avoid filler or invented details.',review:'Remove repetition, improve readability, verify against the user-provided facts, strengthen the opening and ensure the result is ready to use.'},
 {id:'reasoning',label:'🧠 Solve a difficult problem',name:'Reason & Verify',description:'Break down complicated choices, compare trade-offs and openly identify assumptions and uncertainty.',steps:['Frame the question','Compare approaches','Check gaps & trade-offs','Explain the recommendation'],family:/phi|qwen|deepseek|llama/i,temperature:.25,firstTokens:900,secondTokens:1050,
 instructions:'Be analytical, precise and concise. Clarify assumptions, evaluate alternatives and identify missing evidence. Do not claim to have researched facts or verified external data.',review:'Recheck calculations and consistency, challenge unsupported leaps, examine counterexamples, explain limitations and give a grounded final recommendation.'},
 {id:'research',label:'🔎 Research & fact-check',name:'Evidence Detective',description:'Organize available evidence, identify what needs checking and develop a reliable investigation plan.',steps:['Separate claims from facts','Evaluate supplied evidence','Spot missing sources','Build a verification plan'],family:/qwen|llama|gemma|phi/i,temperature:.3,firstTokens:900,secondTokens:1000,
 instructions:'Act as an evidence analyst working only from information the user supplies. Never fabricate sources, links, quotes or current findings. Mark unverified claims and describe what primary documents to check.',review:'Audit every factual claim for support in the provided material, remove invented citations and create a practical next-check list.'},
 {id:'ideas',label:'💡 Brainstorm something new',name:'Idea Accelerator',description:'Generate diverse creative options, select the most promising and turn one into an actionable concept.',steps:['Generate contrasting directions','Choose the strongest options','Assess feasibility','Develop the best concept'],family:/llama|qwen|gemma|mistral/i,temperature:.85,firstTokens:900,secondTokens:900,
 instructions:'Be inventive and specific. Produce varied options, not superficial synonyms. Explain which are feasible and which are unconventional. Keep original ideas distinct and actionable.',review:'Discard derivative or impractical ideas, improve originality, and expand the most compelling option with a first-step plan.'},
 {id:'image',label:'🖼️ Design an image prompt',name:'Visual Art Director',description:'Compose a detailed, professional prompt with subject, composition, lighting, style and exclusions.',steps:['Define the subject','Direct the composition','Specify lighting & materials','Polish the generation prompt'],family:/qwen|llama|gemma/i,temperature:.65,firstTokens:650,secondTokens:750,
 instructions:'You are an art director writing prompts for a separate image-generation tool. Give a detailed image prompt: subject, composition, perspective, lighting, materials, style, aspect ratio and exclusions. Do not claim to produce an image in this chat.',review:'Improve visual coherence, remove contradictory instructions and deliver a single clear image-generation prompt with optional variation.'},
 {id:'video',label:'🎬 Direct a short video',name:'Cinematic Storyboard',description:'Describe realistic shots, camera movement, timing and continuity in a concise video-generation brief.',steps:['Plan scene & duration','Lay out shots','Specify motion & continuity','Refine the storyboard'],family:/qwen|llama|gemma/i,temperature:.65,firstTokens:750,secondTokens:820,
 instructions:'You write production-ready prompts for a separate video generator. Specify subject, location, shot order, movement, camera, lighting, duration and continuity. Do not claim to render or download video.',review:'Fix impossible movements, clarify timing, simplify contradictory actions and output a clean storyboard plus concise video prompt.'},
 {id:'custom',label:'🛠️ My own workflow',name:'Custom Studio',description:'Choose your own instructions and build a reusable personalized process.',steps:['Set a goal','Follow your instructions','Review if refined','Deliver final output'],family:/llama|qwen|phi/i,temperature:.55,firstTokens:850,secondTokens:950,
 instructions:'Follow the custom process defined by the user; otherwise provide a helpful structured answer with assumptions and an actionable deliverable.',review:'Check the draft against the custom instructions and the original question. Correct unsupported claims and improve completeness.'}
];
let currentId='general',records=[],activeGroup='all',selectedRecord=null,loadError='';
// Old task selections no longer take over a new chat visit.
const currentPreset=()=>PRESETS.find(p=>p.id===currentId)||PRESETS[0];
function current(){
 const p=currentPreset();
 const custom=$('#stackCustomInstruction')?.value?.trim();
 return {...p,refined:$('#stackDepth')?.value!=='fast',
  instructions:p.id==='custom'&&custom?p.instructions+'\nUser workflow: '+custom.slice(0,1400):p.instructions};
}
window.RandomAIStacks={current,choose:setStack,presets:PRESETS.map(p=>({id:p.id,name:p.name,label:p.label,description:p.description,steps:p.steps.slice()}))};
const normalize=r=>({
 id:String(r.model_id),vram:Number(r.vram_required_MB)||0,
 family:family(r.model_id),role:role(r.model_id),
 source:String(r.model||''),special:/vision|audio|speech|multimodal|vl-/i.test(r.model_id)
});
function family(id){const s=id.toLowerCase();if(/qwen/.test(s))return 'Qwen';if(/llama|hermes/.test(s))return 'Llama / Hermes';if(/gemma/.test(s))return 'Gemma';if(/mistral/.test(s))return 'Mistral';if(/phi-/.test(s))return 'Phi';if(/smollm/.test(s))return 'SmolLM';if(/deepseek/.test(s))return 'DeepSeek';return 'Other'}
function role(id){const s=id.toLowerCase();return /coder|code/.test(s)?'Coding':/reason|r1|qwq|think/.test(s)?'Reasoning':/vision|vl-|multi.?modal/.test(s)?'Multimodal': 'Chat & writing'}
function displayName(id){return String(id).replace(/-MLC$/,'').replace(/-(?:q[0-9][a-z0-9_]+)$/i,'').replace(/-/g,' ')}
function vramLabel(m){return m.vram?(m.vram/1024).toFixed(1)+' GB GPU memory':'GPU memory estimate unavailable'}
function weight(m,task='coding'){
 let points=0;const id=m.id.toLowerCase();
 if(/qwen2\.5|llama-3\.2|llama-3\.1|phi-3\.5|gemma-2|mistral-7b|smollm2/.test(id))points+=25;
 if(currentPreset().family.test(m.id))points+=12;
 if(task==='coding'&&/coder|code/.test(id))points+=22;
 if(task==='reasoning'&&/phi|qwen|reason/.test(id))points+=12;
 if(m.special)points-=55;
 if(m.vram>0)points+=m.vram<1800?16:m.vram<=3800?23:m.vram<=6200?9:-9;
 if(/q4f16_1|q4f32_1/i.test(m.id))points+=8;
 return points;
}
function recommendModel(p=currentPreset()){
 const candidates=records.filter(m=>!m.special);
 if(!candidates.length)return null;
 return candidates.slice().sort((a,b)=>weight(b,p.id)-weight(a,p.id)||a.vram-b.vram)[0];
}
function setStack(id){
 if(!PRESETS.some(p=>p.id===id))return;
 currentId=id;try{localStorage.setItem(stackKey,JSON.stringify({id}))}catch{}
 for(const el of document.querySelectorAll('[data-stack-task]'))el.value=id;
 renderStack();
 window.dispatchEvent(new CustomEvent('random-ai-stack-changed',{detail:{id}}));
}
function renderStack(){
 const p=currentPreset(),pick=recommendModel(p),steps=$('#stackSpotlightSteps');
 if($('#stackSpotlightName'))$('#stackSpotlightName').textContent=p.name;
 if($('#stackSpotlightDesc'))$('#stackSpotlightDesc').textContent=p.description;
 if(steps)steps.innerHTML=p.steps.map((t,i)=>'<span><b>'+String(i+1).padStart(2,'0')+'</b> '+E(t)+'</span>').join('');
 if($('#stackModelSuggestion'))$('#stackModelSuggestion').textContent=pick?'Suggested local model: '+displayName(pick.id)+' · '+vramLabel(pick)+' (device dependent).':'Choose a compatible local model from the full catalog to run this stack.';
 if($('#stackChatNote'))$('#stackChatNote').textContent='✦ '+p.name+': '+p.steps.join(' → ')+' · '+($('#stackDepth')?.value==='fast'?'one model pass':'two local model passes')+'.'+(p.id==='image'||p.id==='video'?' Produces prompts, not finished media.':'');
 if($('#stackCustomWrap'))$('#stackCustomWrap').hidden=p.id!=='custom';
}
function setupStacks(){
 const markup=PRESETS.map(p=>'<option value="'+p.id+'">'+E(p.label)+'</option>').join('');
 for(const el of document.querySelectorAll('[data-stack-task]')){el.innerHTML=markup;el.value=currentId;el.addEventListener('change',()=>setStack(el.value))}
 $('#stackDepth')?.addEventListener('change',renderStack);
 $('#stackCustomInstruction')?.addEventListener('input',renderStack);
 $('#stackUse')?.addEventListener('click',()=>{
  const chatButton=document.querySelector('[data-go="chat"]');
  chatButton?.click();$('#chatInput')?.focus();
 });
 renderStack();
}
function browseFilters(){
 return [
 ['all','✦ All local models'],
 ['saved','✓ Saved on this device'], 
 ['popular','⭐ Popular / practical'],
 ['small','📱 Small (<1.5 GB)'],
 ['balanced','⚖️ Medium (1.5–4 GB)'],
 ['large','💻 Large (>4 GB)']
 ];
}
function filterRecords(){
 const term=$('#modelSearch')?.value?.trim().toLowerCase()||'';
 return records.filter(m=>{
  if(term&&!(m.id+' '+m.family+' '+m.role).toLowerCase().includes(term))return false;
  if(activeGroup==='saved')return memory()?.isSaved(m.id)===true;
  if(activeGroup==='popular')return weight(m)>45&&!m.special;
  if(activeGroup==='small')return m.vram>0&&m.vram<1536;
  if(activeGroup==='balanced')return m.vram>=1536&&m.vram<=4096;
  if(activeGroup==='large')return m.vram>4096;
  if(activeGroup==='code')return m.role==='Coding';
  if(activeGroup==='reason')return m.role==='Reasoning';
  return true;
 }).sort((a,b)=>activeGroup==='popular'?weight(b)-weight(a):a.family.localeCompare(b.family)||a.vram-b.vram);
}
function renderCatalog(){
 const list=filterRecords();
 $('#modelCount').textContent=loadError?'Unable to load the runtime catalog: '+loadError:records.length+' WebLLM-supported downloadable variants · '+(memory()?.savedIds()?.length||0)+' verified saved · '+list.length+' shown · model support depends on device';
 $('#modelResults').innerHTML=loadError?'<div class="finder-guide"><p>Catalog unavailable. Check your connection and try again.</p><button type="button" id="retryModels" class="primary">Retry catalog download</button></div>':
 list.map(m=>'<button type="button" class="model-card '+(selectedRecord?.id===m.id?'chosen':'')+'" data-local-id="'+E(m.id)+'"><span class="model-kicker">'+E(m.family)+' · '+E(m.role)+'</span><strong>'+E(displayName(m.id))+'</strong><span>'+E(m.id)+'</span><small>'+(memory()?.isSaved(m.id)?'✓ Saved on this device · ':'')+E(vramLabel(m))+(m.special?' · Specialized runtime':'')+'</small></button>').join('')||'<p class="fine-print">No matching local models. Try another search.</p>';
 $('#retryModels')?.addEventListener('click',()=>{loadError='';loadCatalog(true)});
}
function selectRecord(id){
 const m=records.find(x=>x.id===id);
 if(!m)return;
 selectedRecord=m;
 memory()?.selected(id);
 const dropdown=$('#modelSelect'),top=$('#topModelSelect');
 if(dropdown&&dropdown.value!==id)dropdown.value=id;
 if(top&&[...top.options].some(o=>o.value===id))top.value=id;
 const details=$('#selectedModelDetails');
 if(details)details.textContent=(memory()?.isSaved(id)?'✓ Previously downloaded · load from this device · ':'')+m.family+' · '+m.role+' · '+vramLabel(m)+(m.special?' · specialized model; chat-only input may be insufficient':'');
 const guide=$('#modelGuide');
 if(guide)guide.innerHTML='<h3>'+E(displayName(m.id))+'</h3><p>'+E(m.id)+'</p><ol>'+
 '<li>Use an up-to-date browser with WebGPU support and enough GPU memory ('+E(vramLabel(m))+').</li>'+
 '<li>Press <b>'+(memory()?.isSaved(id)?'Load saved model':'Download &amp; load model')+'</b>. The browser reuses existing cached files when present.</li>'+ 
 '<li>Wait until the status says <b>Local model ready</b>, then open Chat and type naturally.</li></ol>'+
 '<p class="guide-warning">Initial download requires internet and substantial storage. This model runs locally afterward, subject to cache retention. No chat API or API key is used. Runtime catalog inclusion does not guarantee your device can run it.</p>'+
 '<div class="model-guide-actions"><button type="button" id="guideLoad" class="primary">'+(memory()?.isSaved(id)?'▶ Load saved model':'↓ Download selected model')+'</button><a href="/ai-academy/" class="outline">Learn prompting in AI Academy ↗</a></div>';
 $('#guideLoad')?.addEventListener('click',()=>$('#loadModel')?.click());
 if($('#loadModel'))$('#loadModel').disabled=!navigator.gpu;
 if($('#topModelDownload'))$('#topModelDownload').disabled=false; // Keep actionable: Load explains unsupported GPU/catalog instead of silently doing nothing.
 if($('#loadModel')&&!$('#loadModel').disabled)$('#loadModel').textContent=memory()?.isSaved(id)?'▶ Load saved model':'↓ Download & load model';
 renderCatalog();
}
function setupModelCatalog(){
 const filters=$('#modelCategoryFilters');
 if(!filters)return;
 filters.innerHTML=browseFilters().map(([id,label])=>'<button type="button" class="'+(id===activeGroup?'active':'')+'" data-group="'+id+'">'+E(label)+'</button>').join('');
 filters.addEventListener('click',e=>{
  const b=e.target.closest('[data-group]');if(!b)return;
  activeGroup=b.dataset.group;for(const x of filters.querySelectorAll('button'))x.classList.toggle('active',x===b);renderCatalog();
 });
 $('#modelSearch')?.addEventListener('input',renderCatalog);
 $('#modelResults')?.addEventListener('click',e=>{const b=e.target.closest('[data-local-id]');if(b)selectRecord(b.dataset.localId)});
 $('#modelSelect')?.addEventListener('change',e=>selectRecord(e.target.value));
}
function getName(id){return displayName(id)}
window.RandomAILocal={getName,getModels:()=>records.slice(),select:selectRecord,refresh:()=>loadCatalog(true),isSaved:id=>memory()?.isSaved(id)===true,savedCount:()=>memory()?.savedIds()?.length||0,preferredName:()=>displayName(memory()?.preferred()||''),refreshButtons:()=>{if(selectedRecord)selectRecord(selectedRecord.id)}};
async function loadCatalog(force=false){
 if(force){loadError='';records=[]}
 if($('#modelCount'))$('#modelCount').textContent='Loading the complete list from the local-model runtime…';
 try{
  const library=await import('https://esm.run/@mlc-ai/web-llm@0.2.87');
  const original=library?.prebuiltAppConfig?.model_list;
  if(!Array.isArray(original)||!original.length)throw Error('The runtime returned no downloadable models.');
  const ids=new Set();
  records=original.filter(x=>x?.model_id&&x?.model&&x?.model_lib&&!ids.has(x.model_id)&&(ids.add(x.model_id),true)).map(normalize);
  if(!records.length)throw Error('No complete downloadable model records were found.');
  records.sort((a,b)=>a.family.localeCompare(b.family)||a.vram-b.vram);
  const dropdown=$('#modelSelect'),top=$('#topModelSelect');
  if(dropdown)dropdown.innerHTML=records.map(m=>'<option value="'+E(m.id)+'">'+E(displayName(m.id))+' — '+E(vramLabel(m))+'</option>').join('');
  const picks=records.filter(x=>!x.special).sort((a,b)=>weight(b)-weight(a));
  const unique=[];const fam=new Set();
  for(const m of picks){const tag=m.family+' '+(m.vram>3500?'big':'small');if(fam.has(tag))continue;fam.add(tag);unique.push(m);if(unique.length>=8)break}
  const remembered=records.find(m=>m.id===memory()?.preferred());
  if(remembered&&!unique.some(m=>m.id===remembered.id))unique.unshift(remembered);
  if(top){top.innerHTML='<option value="">Pick a recommended model…</option>'+unique.map(m=>'<option value="'+E(m.id)+'">'+E(displayName(m.id))+' · '+E(vramLabel(m))+'</option>').join('');$('#topModelDownload').disabled=false;}
  memory()?.register(library,records);
  const preferred=memory()?.preferred();
  selectRecord(records.some(m=>m.id===preferred)?preferred:(recommendModel()?.id||records[0].id));
  if(top)top.value=records.some(m=>m.id===selectedRecord?.id&&[...top.options].some(o=>o.value===m.id))?selectedRecord.id:(unique[0]?.id||'');
  renderStack();
  window.dispatchEvent(new CustomEvent('random-ai-catalog-ready',{detail:{count:records.length}}));
  if(!navigator.gpu){if($('#gpuCheck'))$('#gpuCheck').textContent='WebGPU unavailable on this browser/device. The top Load button can explain the problem; hosted Instant AI does not require WebGPU.';}
 }catch(error){
  loadError=String(error?.message||error).slice(0,190);
  if($('#modelSelect'))$('#modelSelect').innerHTML='<option value="">Catalog unavailable; retry below</option>';
  if($('#topModelSelect'))$('#topModelSelect').innerHTML='<option value="">Models unavailable</option>';
  if($('#loadModel'))$('#loadModel').disabled=true;
  if($('#topModelDownload'))$('#topModelDownload').disabled=false; // Show error when pressed, rather than a dead button.
  if($('#gpuCheck'))$('#gpuCheck').textContent='Model list unavailable: '+loadError+'. Check connectivity and use the retry button below.';
  renderCatalog();
 }
}
function refreshSavedPicker(){
 const top=$('#topModelSelect'),dropdown=$('#modelSelect');if(!records.length)return;
 const saved=new Set(memory()?.savedIds()||[]);
 if(top)for(const id of saved){
  if(![...top.options].some(o=>o.value===id)){const option=document.createElement('option');option.value=id;top.add(option)}
 }
 if(top){for(const option of top.options){const m=records.find(x=>x.id===option.value);if(m)option.textContent=(saved.has(m.id)?'✓ Saved · ':'')+displayName(m.id)+' · '+vramLabel(m)}
  if(selectedRecord&&[...top.options].some(o=>o.value===selectedRecord.id))top.value=selectedRecord.id;
 }
 if(dropdown)for(const option of dropdown.options){const m=records.find(x=>x.id===option.value);if(m)option.textContent=(saved.has(m.id)?'✓ Saved · ':'')+displayName(m.id)+' — '+vramLabel(m)}
 if(selectedRecord&&memory()?.isSaved(selectedRecord.id)&&$('#loadModel')&&!$('#loadModel').disabled)$('#loadModel').textContent='▶ Load saved model';
 renderCatalog();
}
window.addEventListener('random-ai-saved-models-changed',()=>refreshSavedPicker());
function initialize(){
 setupStacks();setupModelCatalog();setupLab();
 // The runtime JavaScript loads only; model weights download after explicit user action.
 void loadCatalog();
}
const CODE_KEY='random-ai-code-lab-v1';
const starters={
 landing:{html:'<main class="wrap"><span class="eyebrow">HELLO WORLD</span><h1>Make something amazing.</h1><p>A beautiful little landing page you can customize.</p><button id="action">Let’s begin →</button><p id="feedback"></p></main>',css:'*{box-sizing:border-box}body{margin:0;font-family:system-ui;background:linear-gradient(135deg,#121631,#513a84);color:#fff;min-height:100vh;display:grid;place-items:center;padding:20px}.wrap{max-width:650px}.eyebrow{color:#a9ffe2;font-size:12px;letter-spacing:.2em;font-weight:800}h1{font-size:clamp(38px,7vw,70px);line-height:1.1}p{color:#e4d7ff;line-height:1.6}button{background:#adffe2;color:#17293a;padding:12px 20px;border:0;border-radius:9px;font-weight:900}',js:'document.getElementById("action").addEventListener("click",()=>{document.getElementById("feedback").textContent="Your project is interactive!"})'},
 dashboard:{html:'<main><h1>Project pulse</h1><p>Track your goals with one click.</p><div class="tiles"><button data-metric="Visitors">Visitors <b>42</b></button><button data-metric="Conversions">Conversions <b>8</b></button><button data-metric="Tasks">Tasks <b>3</b></button></div><p id="details">Choose a metric to explore.</p></main>',css:'*{box-sizing:border-box}body{font-family:system-ui;background:#eaf3ff;color:#10233d;margin:0;padding:30px}main{max-width:850px;margin:auto}.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.tiles button{background:white;border:1px solid #c5d7f0;border-radius:15px;padding:25px;text-align:left;color:inherit;cursor:pointer}.tiles b{display:block;font-size:28px;margin-top:8px}@media(max-width:550px){.tiles{grid-template-columns:1fr}}',js:'document.querySelectorAll("[data-metric]").forEach(b=>b.addEventListener("click",()=>{document.getElementById("details").textContent="You selected "+b.dataset.metric+" — add data here."}))'},
 game:{html:'<main><h1>✨ Catch the Spark</h1><p>Tap the glowing spark before time runs out!</p><div class="panel"><div id="spark" role="button" tabindex="0">⭐</div></div><strong id="score">Score: 0</strong><button id="reset">New round</button></main>',css:'body{margin:0;padding:20px;background:#17112e;color:white;font-family:system-ui;text-align:center}.panel{height:230px;position:relative;overflow:hidden;background:linear-gradient(130deg,#372579,#b061a6);border-radius:20px;margin:25px auto;max-width:450px}#spark{position:absolute;left:50%;top:50%;font-size:50px;cursor:pointer;transition:all .15s}button{padding:10px 18px;border:0;border-radius:8px;color:#252043;background:#ffe7a8;font-weight:bold}',js:'let score=0;const star=document.getElementById("spark");function hit(){score++;document.getElementById("score").textContent="Score: "+score;star.style.left=(5+Math.random()*80)+"%";star.style.top=(5+Math.random()*70)+"%"}star.addEventListener("click",hit);star.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();hit()}});document.getElementById("reset").addEventListener("click",()=>{score=0;document.getElementById("score").textContent="Score: 0"})'},
 blank:{html:'<main><h1>Your next project</h1><p>Edit these files and hit Run.</p></main>',css:'body{font-family:system-ui;padding:30px;background:#fff;color:#222}',js:''}
};
let project={...starters.landing},currentFile='html',saveTimer=0;
try{const saved=JSON.parse(localStorage.getItem(CODE_KEY)||'null');if(saved&&['html','css','js'].every(k=>typeof saved[k]==='string'))project=saved}catch{}
function assembled(){
 const script=project.js.replace(/<\/script/gi,'<\\/script');
 const css=project.css.replace(/<\/style/gi,'<\\/style');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Random AI Project</title><style>'+css+'</style></head><body>'+project.html+'<script>'+script+'</script></body></html>'
}
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function saveProject(){try{localStorage.setItem(CODE_KEY,JSON.stringify(project));$('#codeStatus').textContent='✓ Saved to this browser'}catch{$('#codeStatus').textContent='Storage full; export your project to keep it.'}}
function renderEditor(){
 $('#codeContent').value=project[currentFile];for(const b of document.querySelectorAll('[data-code-file]'))b.classList.toggle('active',b.dataset.codeFile===currentFile)
}
function preview(){$('#codeFrame').srcdoc=assembled();$('#codeStatus').textContent='✓ Sandboxed preview updated';saveProject()}
function setupLab(){
 if(!$('#codeContent'))return;
 renderEditor();preview();
 document.querySelector('.code-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-code-file]');if(!b)return;project[currentFile]=$('#codeContent').value;currentFile=b.dataset.codeFile;renderEditor()});
 $('#codeContent').addEventListener('input',e=>{project[currentFile]=e.target.value;$('#codeStatus').textContent='Unsaved changes · tap Run preview';clearTimeout(saveTimer);saveTimer=setTimeout(saveProject,400)});
 $('#codeRun').addEventListener('click',()=>{project[currentFile]=$('#codeContent').value;preview()});
 $('#codeReset').addEventListener('click',()=>{if(!confirm('Replace your current Code Lab edits with this starter? Export first if needed.'))return;project={...starters[$('#codeTemplate').value]};renderEditor();preview()});
 $('#codeTemplate').addEventListener('change',()=>{$('#codeStatus').textContent='Choose “Load starter” to replace current files.'});
 $('#codeExport').addEventListener('click',()=>{project[currentFile]=$('#codeContent').value;download('random-ai-project.html',assembled(),'text/html');saveProject()});
 $('#codeCopy').addEventListener('click',()=>{project[currentFile]=$('#codeContent').value;const t=assembled();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>{$('#codeStatus').textContent='✓ Complete HTML copied'}).catch(()=>{$('#codeStatus').textContent='Clipboard blocked; use Download instead.'});else $('#codeStatus').textContent='Clipboard unavailable; use Download.'});
 $('#codeAskAI').addEventListener('click',()=>{
  project[currentFile]=$('#codeContent').value;
  const prompt='Act as a senior front-end engineer. Review these files and suggest the most impactful improvements to usability, accessibility and design. Return complete revised HTML, CSS and JavaScript in separate code blocks. Keep everything working; do not invent dependencies.\\n\\nHTML:\\n'+project.html.slice(0,4500)+'\\n\\nCSS:\\n'+project.css.slice(0,5500)+'\\n\\nJS:\\n'+project.js.slice(0,4500);
  $('#chatInput').value=prompt;document.querySelector('[data-view="chat"]')?.click();$('#chatInput').focus();
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();