/* Random AI separate-tab WebLLM transfer.
 * Uses the SAME WebLLM version, built-in model ids and Cache API as studio.js.
 * Do not claim an offline browser-background fetch: the tab must stay alive.
 */
const CDN='https://esm.run/@mlc-ai/web-llm@0.2.87';
const KEY='random-ai-background-download-v1';
const SAVED='random-ai-saved-models-v1';
const LAST='random-ai-last-local-model-v1';
const $=id=>document.getElementById(id);
const requested=new URLSearchParams(location.search).get('model')||'';
const model=/^[A-Za-z0-9][A-Za-z0-9._-]{2,160}$/.test(requested)?requested:'';
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel(KEY):null;
let busy=false,activeEngine=null;
function publish(status,percent,message){
 const data={id:model,status,percent:Math.max(0,Math.min(100,Math.round(Number(percent)||0))),
  message:String(message||'').slice(0,240),updated:Date.now()};
 $('downloadBar').value=data.percent;
 $('downloadPercent').textContent=data.percent+'%';
 $('downloadText').textContent=data.message;
 $('retryDownload').hidden=status==='loading'||status==='ready';
 try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}
 try{channel?.postMessage(data)}catch{}
 return data;
}
function remember(){
 try{
  const existing=JSON.parse(localStorage.getItem(SAVED)||'[]');
  const ids=Array.isArray(existing)?existing.filter(x=>typeof x==='string'):[];
  localStorage.setItem(SAVED,JSON.stringify([...new Set([...ids,model])].slice(0,200)));
  localStorage.setItem(LAST,model);
 }catch{}
}
async function start(){
 if(busy)return;
 if(!model){publish('error',0,'No valid local model was selected. Return to Random AI and choose a model.');return;}
 busy=true;
 $('modelName').textContent=model;
 $('retryDownload').hidden=true;
 publish('loading',1,'Preparing the supported local-model catalog…');
 try{
  const lib=await import(CDN);
  const spec=lib.prebuiltAppConfig?.model_list?.find(m=>m.model_id===model);
  if(!lib.CreateMLCEngine||!spec)throw Error('That model is not offered by this WebLLM runtime. Choose a different model in Random AI.');
  $('modelName').textContent=spec.model_id;
  try{await navigator.storage?.persist?.()}catch{}
  // Avoid a new weight download when the actual model artifacts are already present.
  if(lib.hasModelInCache&&await lib.hasModelInCache(model)){
   remember();publish('ready',100,'Model files are already saved. Return to Random AI and press Load saved model.');
   return;
  }
  if(!navigator.gpu)throw Error('This browser does not support WebGPU, which this model needs to download and initialize.');
  const adapter=await navigator.gpu.requestAdapter();
  if(!adapter)throw Error('No WebGPU adapter is available. Try a supported browser/device or a smaller model.');
  publish('loading',2,'Downloading model files into this browser…');
  activeEngine=await lib.CreateMLCEngine(model,{initProgressCallback:report=>{
   const value=typeof report.progress==='number'?Math.round(report.progress*100):2;
   publish('loading',value,report.text||'Downloading and verifying model files…');
  }});
  // The engine finished downloading and initializing, and its cache remains after unload.
  const cached=lib.hasModelInCache?await lib.hasModelInCache(model):false;
  if(!cached)throw Error('Initialization finished, but stored model files could not be verified. Try again before assuming the download is saved.');
  remember();
  publish('ready',100,'Download complete! Return to Random AI and choose Load saved model.');
 }catch(error){
  publish('error',0,String(error?.message||'The model download did not finish. Reopen or retry.'));
 }finally{
  try{await activeEngine?.unload?.()}catch{}
  activeEngine=null;busy=false;
 }
}
$('retryDownload').addEventListener('click',()=>void start());
window.addEventListener('pagehide',()=>{
 const current=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}})();
 if(busy&&current?.id===model&&current?.status==='loading')
  publish('paused',current.percent,'Transfer tab was closed or navigated away. Reopen to resume using cached files.');
});
void start();
