const pages = {finder:['✧','Stack Finder'],models:['▤','Top Models'],benchmark:['◴','Benchmarks'],chat:['▢','Chat'],device:['▣','My Device']};
const models = {
  smol: {name:'SmolLM2 360M', type:'Local', caps:['Writing','Summarizing'], id:'SmolLM2-360M-Instruct-q4f32_1-MLC', description:'Compact text model for short drafts and summaries.'},
  qwen: {name:'Qwen2.5 Coder 0.5B', type:'Local', caps:['Writing','Coding','Reasoning'], id:'Qwen2.5-Coder-0.5B-Instruct-q4f32_1-MLC', description:'Small general-purpose model for simple text and code.'},
  mini: {name:'Cloud Mini', type:'API', caps:['Writing','Coding','Reasoning','Summarizing'], id:'gpt-4.1-mini', description:'Cloud text model for everyday work and coding.'},
  full: {name:'Cloud Standard', type:'API', caps:['Writing','Coding','Reasoning','Summarizing'], id:'gpt-4.1', description:'Cloud text model for more involved instructions and coding.'},
  image: {name:'GPT Image', type:'API', caps:['Images'], description:'Image generation and editing. Requires a provider image workflow.'},
  video: {name:'Veo', type:'API', caps:['Video'], description:'Video generation. Requires a provider video workflow.'}
};
const stacks = {
  local:{name:'Fully local', kind:'Local stack', icon:'▣', models:['smol','qwen'], desc:'Write and explore privately. Runs on your device after setup.'},
  hybrid:{name:'Hybrid', kind:'Hybrid stack', icon:'◈', models:['qwen','mini'], desc:'Run everyday text locally and send coding or reasoning tasks to the cloud.'},
  api:{name:'All API', kind:'API stack', icon:'☁', models:['mini','full'], desc:'Use cloud models for everyday work and more complex requests.'},
  infusion:{name:'Draft + review', kind:'Infusion', icon:'✧', models:['qwen','full'], desc:'Draft locally, then send the draft and prompt to an API model for review.'}
};
const tasks = ['Writing','Coding','Images','Video','Reasoning','Summarizing'];
const deviceTypes = ['Phone','Tablet','Laptop','Desktop'];
const ua = navigator.userAgent;
const guessed = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'Tablet' : /iPhone|Android|Mobile/i.test(ua) ? 'Phone' : 'Laptop';
const get = (key, fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}};
const save = (key,value) => localStorage.setItem(key,JSON.stringify(value));
const state = {device:get('rai-device',guessed),hardware:get('rai-hardware',{}),history:get('rai-history',[]),target:get('rai-target','hybrid'),task:'',intent:'',recommendation:null,filter:'All',mode:'',cache:{},chat:[],active:[],busy:false};
const spec = {cores:navigator.hardwareConcurrency, ram:navigator.deviceMemory, gpu:navigator.gpu?'Available':'Unavailable', checked:false};
const main = document.querySelector('#main');
const settings = document.querySelector('#settings');
let runtime, engine, loaded, api;
const escape = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const cap = (task) => /\b(video|movie|animation|footage)\b/i.test(task)?'Video':/\b(image|photo|picture|illustration|logo|art)\b/i.test(task)?'Images':/\b(code|coding|python|javascript|app|debug|software|program|website)\b/i.test(task)?'Coding':/\b(reason|reasoning|math|logic|solve|analyze|analyse|compare)\b/i.test(task)?'Reasoning':/summar/i.test(task)?'Summarizing':'Writing';
const page = () => Object.hasOwn(pages,location.hash.slice(1))?location.hash.slice(1):'finder';
const go = name => {if(page()===name)render();else location.hash=name;};
const modelNames = keys => keys.map(key=>models[key].name).join(' · ');
const showStatus = value => {const el=document.querySelector('#status');if(el)el.textContent=value;};
const targetLabel = key => stacks[key]?.name ?? models[key]?.name ?? 'Choose a target';
const choose = key => {state.target=key;state.active=[];state.chat=[];save('rai-target',key);};
const heading = (title,description) => `<div class="pagehead"><h1>${title}</h1><p>${description}</p></div>`;
const art = `<div class="art" aria-hidden="true"><svg viewBox="0 0 450 240"><defs><radialGradient id="halo"><stop stop-color="#64efb9" stop-opacity=".42"/><stop offset="1" stop-color="#64efb9" stop-opacity="0"/></radialGradient></defs><circle cx="265" cy="118" r="105" fill="url(#halo)"/><g fill="none" stroke="#7be0b181"><ellipse cx="260" cy="120" rx="155" ry="45" transform="rotate(-19 260 120)"/><ellipse cx="260" cy="120" rx="140" ry="45" transform="rotate(27 260 120)"/><circle cx="260" cy="120" r="75" stroke-dasharray="3 6"/><circle cx="260" cy="120" r="53"/><path d="M260 12v216M116 120h289" opacity=".45"/></g><rect x="232" y="92" width="56" height="56" rx="13" fill="#74edbc"/><text x="260" y="132" text-anchor="middle" font-size="34" fill="#10291f">✳</text><circle cx="143" cy="141" r="5" fill="#75f2c1"/><circle cx="348" cy="172" r="5" fill="#c1a5ff"/><circle cx="370" cy="83" r="4" fill="#8ebcff"/></svg></div>`;
function finder() {
  const rec = state.recommendation;
  return `<section class="hero">${art}<div class="hero-copy"><div class="eyebrow">✧ &nbsp; AI STACK FINDER</div><h1>Find the right AI<br>for <span class="mint">your device.</span></h1><p>Tell us what you want to do. Compare local and cloud options before you download a model.</p></div></section>
  <div class="workgrid"><section class="panel"><div class="step">START HERE</div><h2>What do you want to do?</h2><form id="finder-form"><label><span class="sr-only">Describe your task</span><textarea id="intent" placeholder="I want help coding a website on my laptop…">${escape(state.intent)}</textarea></label><div class="chips">${tasks.map(t=>`<button class="chip" type="button" data-task="${t}" aria-pressed="${state.task===t}">${t}</button>`).join('')}</div><div class="actions"><button class="primary">Recommend a stack ↗</button><button type="button" class="ghost" data-page="device">Device · ${state.device}</button></div></form>${rec?`<div class="recommend" role="status"><b>${stacks[rec.key].name} · ${rec.task}</b><p>${rec.reason}</p><button class="linkbutton" data-target="${rec.target}" data-destination="benchmark">${rec.task==='Images'||rec.task==='Video'?'View text benchmark options':'Test this setup'} ↗</button>${['Images','Video'].includes(rec.task)?`<button class="linkbutton" data-catalog="${rec.task}">View ${rec.task.toLowerCase()} model →</button>`:''}</div>`:''}</section>
  <section class="panel guided"><span class="stack-icon">✦</span><h3>Not sure which model to choose?</h3><p>Browse Top Models by what they can do, then pick one to test on your device.</p><button class="linkbutton" data-page="models">Explore Top Models →</button></section></div>
  <section class="stackarea"><div class="sectionhead"><h2>Compare stack types</h2><button data-page="benchmark">Open benchmarks ↗</button></div><div class="grid3">${['local','hybrid','api'].map(key=>{const s=stacks[key];return `<article class="panel stack ${rec?.key===key?'selected':''}"><span class="stack-icon">${s.icon}</span>${rec?.key===key?'<span class="tag">RECOMMENDED</span>':''}<h3>${s.name}</h3><p>${s.desc}</p><small>${modelNames(s.models)}</small><button data-target="${escape(key)}" data-destination="benchmark">Test stack →</button></article>`;}).join('')}</div></section>`;
}
function catalog() {
  const rows=Object.entries(models).filter(([,m])=>state.filter==='All'||m.caps.includes(state.filter));
  return heading('Top Models','Filter by capability and check which local models are ready to reuse.')+`<section class="panel"><div class="sectionhead"><h2>Model catalog</h2><button data-cache>Check downloads</button></div><div class="chips">${['All',...tasks].map(t=>`<button class="chip" data-filter="${t}" aria-pressed="${state.filter===t}">${t}</button>`).join('')}</div><div class="tablewrap"><table class="data"><thead><tr><th>Model</th><th>Runs on</th><th>Capabilities</th><th>Action</th></tr></thead><tbody>${rows.map(([key,m])=>`<tr><td>${escape(m.name)}<br><small>${escape(m.description)}</small></td><td>${m.type==='Local'?'This device':'Cloud'}${state.cache[key]?'<br><span class="tag">DOWNLOADED</span>':''}</td><td>${m.caps.join(' · ')}</td><td>${m.type==='Local'?`<button data-load="${escape(key)}">${loaded===key?'Loaded':state.cache[key]?'Load saved model':'Download & load'}</button> `:''}${m.id?`<button data-target="${escape(key)}" data-destination="benchmark">Test</button>`:'<small>Catalog only</small>'}</td></tr>`).join('')}</tbody></table></div><div id="status" class="status" role="status"></div></section>`;
}
function targetSelect() {
  return `<select id="target" aria-label="Model, stack, or infusion"><optgroup label="Stacks">${Object.entries(stacks).filter(([k])=>k!=='infusion').map(([k,s])=>option(k,s.name,state.target)).join('')}</optgroup><optgroup label="Infusions">${option('infusion',stacks.infusion.name,state.target)}</optgroup><optgroup label="Models">${Object.entries(models).filter(([,m])=>m.id).map(([k,m])=>option(k,m.name,state.target)).join('')}</optgroup></select>`;
}
const option=(key,label,selected)=>`<option value="${escape(key)}" ${key===selected?'selected':''}>${escape(label)}</option>`;
function benchmark() {
  const s=stacks[state.target];
  return heading('Benchmarks','Measure actual response time and check answers on your current device.')+`<section class="panel"><div class="sectionhead"><h2>Run a test</h2><button data-api>${api?'API connected':'Connect API'}</button></div><div class="field">${targetSelect()}<button class="primary" data-run>Run benchmark ↗</button></div><p class="notice">${s?escape(s.desc)+' '+modelNames(s.models)+'.':escape(models[state.target]?.description)} Three text checks cover reasoning, coding, and instruction following. First runs may need a model download. API requests can incur provider charges.</p><div id="status" class="status" role="status"></div></section>
  <section class="panel padtop"><div class="sectionhead"><h2>Saved results</h2>${state.history.length?'<button data-export>Export JSON</button>':''}</div>${state.history.length?`<div class="tablewrap"><table class="data"><thead><tr><th>Target</th><th>Device</th><th>Accuracy</th><th>Average response</th><th>Date</th></tr></thead><tbody>${state.history.map(row=>`<tr><td>${escape(row.target)}<br><small>${escape(row.models)}</small></td><td>${escape(row.device)}${row.hardware?.name?`<br><small>${escape(row.hardware.name)}</small>`:''}</td><td>${row.correct}/3 · ${row.correct===3?'Passed':row.correct===2?'Partial':'Needs review'}${row.details?`<details><summary>Test details</summary>${row.details.map(test=>`<p>${escape(test.task)} · ${(test.ms/1000).toFixed(2)} s<br>Expected ${escape(test.answer)} · Received ${escape(test.text)}</p>`).join('')}</details>`:''}</td><td>${(row.ms/1000).toFixed(2)} s · ${row.ms<2000?'Fast':row.ms<6000?'Moderate':'Slow'}</td><td>${escape(new Date(row.date).toLocaleString())}</td></tr>`).join('')}</tbody></table></div>`:'<p>Completed tests will appear here on this browser.</p>'}</section>`;
}
function chat() {
  const s=stacks[state.target];
  const selectedModels=(s?.models??[state.target]).filter(key=>models[key]).map(displayModel).join(' · ');
  return heading('Chat','Try your selected model, stack, or infusion with your own prompt.')+`<section class="panel"><div class="sectionhead"><h2>Conversation</h2><button data-api>${api?'API connected':'Connect API'}</button></div><div class="chatlog" aria-live="polite">${state.chat.length?state.chat.map(m=>`<div class="message"><b>${escape(m.label)}</b>${escape(m.text)}</div>`).join(''):'<p>Send a message to start.</p>'}</div><form id="chat-form"><div class="chatmeta field">${targetSelect()}<small>${state.active.length?'Last response · '+escape(state.active.join(' → ')):'Selected · '+escape(selectedModels)}</small></div><label><span class="sr-only">Message</span><textarea name="message" required placeholder="Ask anything…"></textarea></label><button class="primary">Send ↑</button><div id="status" class="status" role="status"></div></form></section>`;
}
function device() {
  return heading('My Device','Check what your browser can detect and add details for your benchmark history.')+`<section class="panel"><div class="sectionhead"><h2>Device profile</h2><button data-scan>Check hardware ↗</button></div><div class="metrics"><div class="metric"><b>${spec.cores??'—'}</b><small>Logical CPU cores</small></div><div class="metric"><b>${spec.ram?spec.ram+' GB':'—'}</b><small>Browser memory estimate</small></div><div class="metric"><b>${spec.gpu}</b><small>WebGPU ${spec.checked?'adapter check':'browser support'}</small></div></div><form id="device-form"><label>Device type<select name="type">${deviceTypes.map(t=>option(t,t,state.device)).join('')}</select></label><label>Device name or CPU (optional)<input name="name" maxlength="100" value="${escape(state.hardware.name)}" placeholder="Pixel 9, MacBook Air…"></label><label>RAM in GB (optional)<input name="ram" type="number" min="1" max="2048" value="${escape(state.hardware.ram)}"></label><button class="primary">Save profile</button><div id="status" class="status" role="status"></div></form></section>`;
}
function render() {
  const current=page();
  document.querySelector('#nav').innerHTML='<div class="navlabel">WORKSPACE</div>'+Object.entries(pages).map(([key,[icon,label]])=>`<button data-page="${key}" class="navbutton ${key===current?'active':''}" ${key===current?'aria-current="page"':''}><span class="ico" aria-hidden="true">${icon}</span>${label}</button>`).join('');
  document.querySelector('#crumb').textContent=pages[current][1];
  document.querySelector('#header-device').textContent=state.device+' profile';
  document.querySelector('#side-device').textContent=state.device+' profile';
  main.innerHTML={finder,models:catalog,benchmark,chat,device}[current]();
  const log=main.querySelector('.chatlog');if(log)log.scrollTop=log.scrollHeight;
}
const apiModel = key => api?.model || models[key].id;
const displayModel = key => models[key].type==='API'&&api?.model?api.model:models[key].name;
const getRuntime = () => runtime ??= import('https://esm.run/@mlc-ai/web-llm@0.2.87').catch(error=>{runtime=null;throw error;});
async function detectCache() {
  const cacheNames=await caches.keys();
  state.cache={};
  if(!cacheNames.some(name=>name.startsWith('webllm')))return;
  const lib=await getRuntime();
  const local=Object.entries(models).filter(([,model])=>model.type==='Local');
  const known=get('random-ai-saved-models-v1',[]);
  const candidates=lib.prebuiltAppConfig.model_list.filter(record=>Array.isArray(known)&&known.includes(record.model_id)&&!local.some(([,model])=>model.id===record.model_id));
  await Promise.all(local.map(async ([key,model])=>{state.cache[key]=await lib.hasModelInCache(model.id).catch(()=>false);}));
  await Promise.all(candidates.map(async record=>{
    const id=record.model_id;
    if(!await lib.hasModelInCache(id).catch(()=>false))return;
    const key='saved-'+id;
    models[key]={id,name:id,type:'Local',caps:['Writing'],description:'Previously downloaded in Random AI Studio.'};
    state.cache[key]=true;
  }));
}
async function load(key, update) {
  if(loaded===key&&engine)return;
  if(!navigator.gpu)throw Error('This browser has no WebGPU support. Try another browser or select an All API stack.');
  update('Checking local model…');
  const lib=await getRuntime();
  const cached=await lib.hasModelInCache(models[key].id).catch(()=>false);
  if(engine){await engine.unload();engine=null;loaded=null;}
  update(cached?'Loading saved model…':'Downloading model for this browser…');
  engine=await lib.CreateMLCEngine(models[key].id,{initProgressCallback:progress=>update(progress.text)});
  loaded=key;
  state.cache[key]=true;
  const known=get('random-ai-saved-models-v1',[]);
  try{
    save('random-ai-saved-models-v1',[...new Set([models[key].id,...(Array.isArray(known)?known:[])])].slice(0,200));
  }catch{}
}
function route(key,task) {
  if(models[key])return [key];
  const complex=task==='Coding'||task==='Reasoning';
  if(key==='infusion')return stacks.infusion.models;
  if(key==='local')return [complex?'qwen':'smol'];
  if(key==='hybrid')return [complex?'mini':'qwen'];
  return [complex?'full':'mini'];
}
async function complete(key,messages,update) {
  const model=models[key];
  let result;
  if(model.type==='Local'){
    await load(key,update);
    update('Generating with '+model.name+'…');
    const start=performance.now();
    result=await engine.chat.completions.create({messages,max_tokens:256,temperature:0});
    return {text:responseText(result),ms:performance.now()-start};
  }
  if(!api)throw Error('Connect an API provider to run this selection.');
  update('Waiting for '+displayModel(key)+'…');
  const start=performance.now();
  const response=await fetch(api.url+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',...(api.key?{Authorization:'Bearer '+api.key}:{})},body:JSON.stringify({model:apiModel(key),messages,max_tokens:256,temperature:0}),redirect:'error',signal:AbortSignal.timeout(90000)});
  result=await response.json().catch(()=>null);
  if(!response.ok)throw Error(result?.error?.message || 'Provider returned HTTP '+response.status+'.');
  return {text:responseText(result),ms:performance.now()-start};
}
function responseText(result) {
  const value=result?.choices?.[0]?.message?.content;
  if(typeof value!=='string'||!value.trim())throw Error('The model returned no text.');
  return value.trim();
}
async function execute(key,task,messages,update) {
  const keys=route(key,task);
  if(keys.some(k=>models[k].type==='API')&&!api)throw Error('Connect an API provider to run this selection.');
  if(keys.some(k=>models[k].type==='Local')&&!navigator.gpu)throw Error('This selection needs WebGPU. Choose an All API stack or check your device.');
  const first=await complete(keys[0],messages,update);
  if(keys.length===1)return {...first,models:keys.map(displayModel)};
  const final=await complete(keys[1],[...messages,{role:'assistant',content:first.text},{role:'user',content:'Review the draft for correctness. Return only the final answer, following the original output instructions.'}],update);
  return {...final,ms:first.ms+final.ms,models:keys.map(displayModel)};
}
const checks = [
  {task:'Reasoning',prompt:'There are 17 red cards and 8 blue cards. Remove 6 red cards and add 4 blue cards. How many cards are left? Reply with only the number.',answer:'23'},
  {task:'Coding',prompt:'What exact number does Python print for print(len(set([4, 4, 5, 6, 6])))? Reply with only the number.',answer:'3'},
  {task:'Writing',prompt:'Reply with exactly this word in all caps: ORBIT',answer:'ORBIT'}
];
async function runBenchmark() {
  const target=state.target, deviceName=state.device, hardware={...spec,...state.hardware,ram:state.hardware.ram||spec.ram};
  if(checks.some(test=>route(target,test.task).some(key=>models[key].type==='API'))&&!api)throw Error('Connect an API provider before running this benchmark.');
  const details=[];
  for(const [index,test] of checks.entries()){
    const result=await execute(target,test.task,[{role:'user',content:test.prompt}],message=>showStatus(`Test ${index+1}/3 · ${message}`));
    details.push({...test,...result,correct:result.text===test.answer});
  }
  const record={target:targetLabel(target),models:[...new Set(details.flatMap(r=>r.models))].join(' · '),device:deviceName,hardware,date:new Date().toISOString(),correct:details.filter(r=>r.correct).length,ms:details.reduce((sum,r)=>sum+r.ms,0)/details.length,details};
  state.history.unshift(record);
  save('rai-history',state.history);
  render();
  showStatus('Benchmark saved. Response time excludes model download and initialization.');
}
function recommend() {
  const task=state.task||cap(state.intent);
  const media=task==='Images'||task==='Video';
  const cloudOnly=!navigator.gpu||spec.gpu==='Unavailable';
  const privacy=/\b(offline|private|privacy|locally|on-device|no cloud)\b/i.test(state.intent);
  const mobile=['Phone','Tablet'].includes(state.device);
  const memory=Number(state.hardware.ram||spec.ram);
  const complex=task==='Coding'||task==='Reasoning';
  let key='local', reason='Use a small local text model for short tasks. Your browser downloads it only when you choose to run it.';
  if(media){key='api';reason=`${models[task==='Images'?'image':'video'].name} is a cloud option for ${task.toLowerCase()}. The catalog includes it for comparison. This lab runs text benchmarks.`;}
  else if(privacy&&cloudOnly){reason='Your browser currently reports no usable WebGPU. Use a WebGPU-capable browser or another device to keep this task local.';}
  else if(cloudOnly||(!privacy&&complex&&(mobile||(memory>0&&memory<=4)))){key='api';reason=cloudOnly?'The browser reports no usable WebGPU. An API stack runs the model remotely and needs an internet connection.':'A cloud model avoids placing a larger coding or reasoning workload on this device.';}
  else if(complex&&!privacy){key='hybrid';reason='Use a compact local model for routine text and a cloud model for coding and reasoning.';}
  state.recommendation={key,task,reason,target:key};
    render();
}
async function scan() {
  const adapter=await navigator.gpu?.requestAdapter().catch(()=>null);
  spec.checked=true;
  spec.gpu=adapter?'Ready':'Unavailable';
  spec.adapter=adapter?.info?.description||adapter?.info?.architecture||undefined;
  if(adapter)spec.maxBufferMB=Math.round(adapter.limits.maxBufferSize/1048576);
  render();
  showStatus(adapter?`WebGPU adapter ready · ${spec.adapter||'Adapter name unavailable'} · ${spec.maxBufferMB} MB maximum buffer`:'No usable WebGPU adapter found in this browser.');
}
async function busy(action) {
  if(state.busy)return;
  state.busy=true;
  const buttons=[...main.querySelectorAll('button,select')];
  buttons.forEach(button=>button.disabled=true);
  try{await action();}
  catch(error){showStatus(error instanceof TypeError?'Connection failed. Check the provider URL, internet connection and browser access settings.':error.message);}
  finally{state.busy=false;buttons.forEach(button=>button.disabled=false);}
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const d=button.dataset;
  if('close' in d){settings.close();return;}
  if(state.busy)return;
  if(d.page){go(d.page);return;}
  if(d.task){state.intent=document.querySelector('#intent').value;state.task=state.task===d.task?'':d.task;render();return;}
  if(d.catalog){state.filter=d.catalog;go('models');return;}
  if(d.filter){state.filter=d.filter;render();return;}
  if(d.target){choose(d.target);go(d.destination);return;}
  if('api' in d){settings.showModal();return;}
  if('cache' in d){busy(async()=>{await detectCache();render();const count=Object.values(state.cache).filter(Boolean).length;showStatus(count?count+' saved model(s) available in this browser.':'No saved local models found in this browser.');});return;}
  if(d.load){busy(async()=>{await load(d.load,showStatus);render();showStatus(models[d.load].name+' is ready.');});return;}
  if('scan' in d){busy(scan);return;}
  if('run' in d){busy(runBenchmark);return;}
  if('export' in d){
    const url=URL.createObjectURL(new Blob([JSON.stringify(state.history,null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='random-ai-benchmarks.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
});
main.addEventListener('input',event=>{if(event.target.id==='intent')state.intent=event.target.value;});
main.addEventListener('change',event=>{if(event.target.id==='target'&&!state.busy){choose(event.target.value);render();}});
document.addEventListener('submit',event=>{
  event.preventDefault();
  if(state.busy)return;
  const form=event.target;
  const data=new FormData(form);
  if(form.id==='finder-form'){
    state.intent=document.querySelector('#intent').value.trim();
    if(!state.intent&&!state.task){document.querySelector('#intent').focus();return;}
    recommend();
  }
  if(form.id==='device-form'){
    state.device=data.get('type');
    state.hardware={name:data.get('name').trim(),ram:data.get('ram')||undefined};
    save('rai-device',state.device);save('rai-hardware',state.hardware);render();showStatus('Device profile saved.');
  }
  if(form.id==='api-form'){
    const url=new URL(data.get('url'));
    if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))){form.elements.url.setCustomValidity('Use an HTTPS provider URL or a localhost address.');form.elements.url.reportValidity();return;}
    api={url:url.href.replace(/\/+$/,''),key:data.get('key').trim(),model:data.get('model').trim()};
    form.elements.key.value='';settings.close();render();showStatus('API settings saved for this session. Send a message or run a benchmark to test the connection.');
  }
  if(form.id==='chat-form'){
    const prompt=data.get('message').trim();
    if(!prompt)return;
    busy(async()=>{
      const messages=[...state.chat.slice(-8).map(m=>({role:m.role,content:m.text})),{role:'user',content:prompt}];
      const result=await execute(state.target,cap(prompt),messages,showStatus);
      state.chat.push({role:'user',label:'You',text:prompt},{role:'assistant',label:result.models.join(' → '),text:result.text});
      state.active=result.models;
      render();
      showStatus('Response · '+(result.ms/1000).toFixed(2)+' s');
    });
  }
});
document.querySelector('#api-form').elements.url.addEventListener('input',event=>event.target.setCustomValidity(''));
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
render();
navigator.gpu?.requestAdapter().then(adapter=>{
  if(!spec.checked&&!adapter)spec.gpu='Unavailable';
}).catch(()=>{if(!spec.checked)spec.gpu='Unavailable';});
detectCache().then(()=>{if(['models','benchmark','chat'].includes(page())&&!state.busy)render();}).catch(()=>{});

