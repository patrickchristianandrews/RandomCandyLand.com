/* Random AI model explorer and self-contained Code Lab.
   Family catalog is discovery guidance, not proof of provider availability.
   No keys are stored, and no media-generation capability is simulated.
*/
(()=>{'use strict';
const $=q=>document.querySelector(q),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GROUPS=[['all','✦ All'],['chat','💬 Chat'],['reasoning','🧠 Reasoning'],['coding','⌘ Coding'],['image','🖼️ Images'],['video','🎬 Video'],['vision','👁️ Vision'],['audio','🎙️ Audio'],['local','📱 Local']];
const F=[
 ['SmolLM2 360M','local','Browser / WebGPU','Very small local chat option','SmolLM2-360M-Instruct-q4f16_1-MLC','local'],
 ['Llama 3.2 1B','local','Browser / WebGPU','Local everyday questions','Llama-3.2-1B-Instruct-q4f16_1-MLC','local'],
 ['SmolLM2 1.7B','local','Browser / WebGPU','Larger browser chat','SmolLM2-1.7B-Instruct-q4f16_1-MLC','local'],
 ['Llama 3.3','chat','Hosted text model','General writing and instruction following','meta-llama/llama-3.3-70b-instruct','cloud'],
 ['Llama 3.1','chat','Hosted text model','Long-form writing and Q&A','','cloud'],
 ['Qwen3','chat','Hosted text model','Multilingual chat, coding and problem solving','','cloud'],
 ['Qwen2.5','chat','Hosted text model','General purpose language work','','cloud'],
 ['Mistral Small','chat','Hosted text model','Fast everyday assistance','','cloud'],
 ['Mixtral','chat','Hosted text model','Creative writing and drafts','','cloud'],
 ['Gemma 3','chat','Hosted text model','Efficient general assistance','','cloud'],
 ['Phi-4','chat','Hosted text model','Compact math, writing and tasks','','cloud'],
 ['Command A','chat','Hosted text model','Document and knowledge workflows','','cloud'],
 ['Granite','chat','Hosted text model','Enterprise-oriented language tasks','','cloud'],
 ['DeepSeek V3','reasoning','Hosted text model','Extended analysis and planning','','cloud'],
 ['DeepSeek R1','reasoning','Hosted text model','Complex reasoning and problem solving','deepseek/deepseek-r1','cloud'],
 ['QwQ','reasoning','Hosted text model','Analytical questions and math','','cloud'],
 ['Qwen3 Thinking','reasoning','Hosted text model','Reasoning-heavy tasks','','cloud'],
 ['Nemotron','reasoning','Hosted text model','Research and reasoning support','','cloud'],
 ['Kimi K2','reasoning','Hosted text model','Tool-using workflows and complex tasks','','cloud'],
 ['Qwen3 Coder','coding','Hosted text model','Software projects, refactors and code repair','','cloud'],
 ['Qwen2.5 Coder','coding','Hosted text model','Programming and debugging','','cloud'],
 ['DeepSeek Coder','coding','Hosted text model','Code writing and explanations','','cloud'],
 ['Codestral','coding','Hosted text model','Code completion and project support','','cloud'],
 ['Devstral','coding','Hosted text model','Software engineering workflows','','cloud'],
 ['StarCoder2','coding','Hosted text model','Open code models','','cloud'],
 ['Code Llama','coding','Hosted text model','Coding and code reasoning','','cloud'],
 ['FLUX.1','image','Image generation provider','Photorealistic images and creative imagery','','media'],
 ['FLUX.2','image','Image generation provider','Advanced visual generation, if offered','','media'],
 ['Stable Diffusion XL','image','Image generation provider','Illustration, product art and local image workflows','','media'],
 ['Stable Diffusion 3.5','image','Image generation provider','Detailed text-to-image creation','','media'],
 ['Qwen-Image','image','Image generation provider','Visual creation and typography workflows','','media'],
 ['Recraft','image','Image generation provider','Design-focused image output','','media'],
 ['Ideogram','image','Image generation provider','Image compositions with lettering','','media'],
 ['Imagen','image','Image generation provider','High-quality photography and illustration','','media'],
 ['Wan2.2','video','Video generation provider','Motion, scene direction and video clips','','media'],
 ['Wan2.1','video','Video generation provider','Text/image to video workflows','','media'],
 ['LTX-Video','video','Video generation provider','Fast video experiments','','media'],
 ['HunyuanVideo','video','Video generation provider','Cinematic clips','','media'],
 ['CogVideoX','video','Video generation provider','Short form text-to-video','','media'],
 ['Mochi 1','video','Video generation provider','Motion-focused video generation','','media'],
 ['Kling','video','Video generation provider','Text/image-driven cinematic scenes','','media'],
 ['Runway','video','Video generation provider','Video storytelling and visual editing','','media'],
 ['Pika','video','Video generation provider','Creative short-form motion','','media'],
 ['Luma Ray','video','Video generation provider','Camera movement and short scenes','','media'],
 ['Llama Vision','vision','Hosted multimodal model','Analyze user-provided pictures','','cloud'],
 ['Qwen VL','vision','Hosted multimodal model','Understand images and documents','','cloud'],
 ['Gemma 3 Vision','vision','Hosted multimodal model','Describe and interpret images','','cloud'],
 ['Whisper','audio','Audio processing provider','Transcribe existing audio','','media'],
 ['XTTS','audio','Audio processing provider','Synthesize spoken audio','','media'],
 ['Bark','audio','Audio processing provider','Text-driven speech and sounds','','media'],
 ['SpeechT5','audio','Audio processing provider','Text-to-speech workflows','','media']
].map(([name,group,provider,description,id,method],i)=>({name,group,provider,description,id,method,i}));
let category='all',selected=null;
const status={local:'Browser model · WebGPU required',cloud:'Requires provider chat API',media:'Requires compatible media API'};
function renderModels(){
 const q=($('#modelSearch')?.value||'').trim().toLowerCase();
 const list=F.filter(m=>(category==='all'||m.group===category)&&(m.name+' '+m.description+' '+m.provider+' '+m.group).toLowerCase().includes(q));
 $('#modelCount').textContent=list.length+' model families / variants to explore · availability and pricing vary by provider';
 $('#modelResults').innerHTML=list.length?list.map(m=>
 '<button type="button" class="model-card '+(selected?.i===m.i?'chosen':'')+'" data-model="'+m.i+'"><span class="model-kicker">'+E(m.group.toUpperCase())+'</span><strong>'+E(m.name)+'</strong><span>'+E(m.description)+'</span><small>'+E(status[m.method])+'</small></button>').join(''):'<p class="fine-print">No matching models. Try a different category or search phrase.</p>';
}
function guide(m){
 const isLocal=m.method==='local',isCloud=m.method==='cloud',media=m.method==='media';
 const warning=media?'<p class="guide-warning">Image, video and audio models cannot be run through this chat-only endpoint. To generate media, a provider-specific media API or hosted app is needed. This listing is an overview—not an active media generator.</p>':
 '<p class="guide-warning">Check the provider model catalog and account eligibility before use. Provider usage and billing rules apply. This browser can only call endpoints that allow cross-origin requests.</p>';
 const steps=isLocal?[
 'Check whether your browser supports WebGPU and whether your device has enough memory.',
 'Select '+m.name+' under Local language models below.',
 'Tap “Download & load model”. After it finishes, open Chat and start creating.'
 ]:isCloud?[
 'Create an account with a trusted model provider that supports standard chat completions and browser requests.',
 'Copy the provider’s API key and exact model identifier (provider IDs change).',
 'Paste the HTTPS completion endpoint, model identifier and your key into Own Provider below; press Connect. Your key stays in this tab, and prompts are sent to that provider.'
 ]:[
 'Choose a trusted provider that hosts '+m.name+' for '+m.group+' tasks.',
 'Review its media API, pricing, supported resolutions, output format, usage policy and CORS/browser support.',
 'Use the provider’s application or connect a secure media relay. This studio currently provides guided prompts and local visual tools, not a working generic hosted '+m.group+' service.'
 ];
 $('#modelGuide').innerHTML='<h3>'+E(m.name)+' <small>· '+E(m.group)+'</small></h3><p>'+E(m.description)+' · '+E(m.provider)+'</p><ol>'+steps.map(s=>'<li>'+E(s)+'</li>').join('')+'</ol>'+warning+
 '<div class="model-guide-actions">'+(m.method==='local'?'<button type="button" class="primary" id="applyModel">Select local model ↓</button>':m.method==='cloud'?'<button type="button" class="primary" id="applyModel">Fill provider model ↓</button>':'<button type="button" class="outline" id="mediaPrompt">Make a professional prompt ↗</button>')+
 '<a class="outline" href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer">Compare hosted text models ↗</a><a class="outline" href="/ai-academy/">Learn prompting in AI Academy ↗</a></div>';
 $('#applyModel')?.addEventListener('click',()=>{
  if(isLocal){$('#modelSelect').value=m.id;$('#modelSelect').focus();$('#modelSelect').scrollIntoView({behavior:'smooth',block:'center'})}
  else{if(m.id)$('#cloudModel').value=m.id;$('#cloudModel').focus();$('#cloudModel').scrollIntoView({behavior:'smooth',block:'center'})}
 });
 $('#mediaPrompt')?.addEventListener('click',()=>{
  const task='Create a detailed '+m.group+' production prompt for '+m.name+'. Ask me for subject, composition, desired style, aspect ratio, camera or motion requirements and important exclusions. Return a ready-to-copy prompt and a short verification checklist.';
  const box=$('#chatInput');if(box)box.value=task;document.querySelector('[data-view="chat"]')?.click();
 });
}
function select(i){selected=F[i]||null;renderModels();if(selected)guide(selected)}
function initialize(){
 if(!$('#modelResults'))return;
 $('#modelCategoryFilters').innerHTML=GROUPS.map(([id,name])=>'<button type="button" data-model-group="'+id+'" class="'+(id===category?'active':'')+'">'+E(name)+'</button>').join('');
 $('#modelCategoryFilters').addEventListener('click',e=>{const button=e.target.closest('[data-model-group]');if(!button)return;category=button.dataset.modelGroup;for(const node of $('#modelCategoryFilters').children)node.classList.toggle('active',node===button);renderModels()});
 $('#modelSearch').addEventListener('input',renderModels);
 $('#modelResults').addEventListener('click',e=>{const b=e.target.closest('[data-model]');if(b)select(Number(b.dataset.model))});
 renderModels();select(0);
 setupLab();
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