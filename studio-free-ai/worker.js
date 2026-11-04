/* Candy Studio: free, public chat on Cloudflare Workers AI.
 * Real cloud inference. No visitor accounts, visitor API keys, or payment flows.
 * Inference is limited to Cloudflare's free-plan daily AI allowance; capacity
 * and availability are finite. Never switch the account to paid automatically.
 * Third-party calls from anything except approved site origins are rejected;
 * rate limiting is approximate and no visitor profile is persisted.
 */
const ORIGINS=new Set([
 'https://randomcandyland.com',
 'https://www.randomcandyland.com',
 'http://localhost:5173',
 'http://127.0.0.1:5173'
]);
const MODELS={
 'free-fast':'@cf/meta/llama-3.2-3b-instruct',
 'free-quality':'@cf/meta/llama-3.1-8b-instruct-fp8-fast'
};
const SYSTEM='You are Candy Studio, a helpful creative writing and learning assistant. Be truthful, careful with facts and privacy, practical and concise. Do not claim to have browsed the web, used tools, read an unseen document or created a file. If current information is unavailable, say so.';
const MAX_BODY=12500;
function json(data,status=200,origin='',extra={}){
 return new Response(JSON.stringify(data),{status,headers:{
   'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
   'X-Content-Type-Options':'nosniff',...origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{},...extra
 }});
}
function cors(origin){
 return {'Access-Control-Allow-Origin':origin,
   'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
   'Access-Control-Allow-Headers':'Content-Type',
   'Access-Control-Max-Age':'600','Vary':'Origin'};
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  // Do not answer even OPTIONS for unrecognized origins.
  if(!ORIGINS.has(origin))return json({error:'Forbidden origin'},403);
  const url=new URL(request.url);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  if(request.method==='GET'&&url.pathname==='/health')
   return json({available:Boolean(env.AI),mode:'free-community',models:Object.keys(MODELS),accountRequired:false,quotaLimited:true},200,origin);
  if(request.method!=='POST'||url.pathname!=='/chat')return json({error:'Route not found'},404,origin);
  if(!env.AI||!env.PER_VISITOR||!env.SHARED_LIMIT)return json({error:'Free chat is not configured yet'},503,origin);
  if((request.headers.get('Content-Type')||'').split(';')[0].trim()!=='application/json')
   return json({error:'Expected application/json'},415,origin);
  const size=Number(request.headers.get('Content-Length')||0);
  if(size>MAX_BODY)return json({error:'Message too large'},413,origin);
  let payload;
  try{
    const body=await request.text();
    if(body.length>MAX_BODY)return json({error:'Message too large'},413,origin);
    payload=JSON.parse(body);
  }catch{return json({error:'Invalid JSON'},400,origin)}
  if(!payload||typeof payload!=='object'||!Array.isArray(payload.messages)||payload.messages.length<1||payload.messages.length>12)
   return json({error:'Please send between 1 and 12 messages'},400,origin);
  if(!Object.prototype.hasOwnProperty.call(MODELS,payload.model||'free-fast'))
   return json({error:'Unavailable free model'},400,origin);
  const messages=[];
  let total=0;
  for(const m of payload.messages){
   if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>2500)
    return json({error:'Each message must be valid text of at most 2,500 characters'},400,origin);
   total+=m.content.length;
   messages.push({role:m.role,content:m.content});
  }
  if(total>8500||messages[messages.length-1].role!=='user')return json({error:'Conversation is too long. Start a fresh chat.'},400,origin);
  // Free anonymous access needs abuse safeguards. Cloudflare's limiter is
  // per-colo approximate, not a globally exact accounting or identity system.
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const [visitor,shared]=await Promise.all([
   env.PER_VISITOR.limit({key:ip}),
   env.SHARED_LIMIT.limit({key:'all-free-chat'})
  ]);
  if(!visitor.success||!shared.success)
   return json({error:'The free service is busy. Try a little later or use a local model on your device.',retryable:true},429,origin,{'Retry-After':'60'});
  try{
   const model=MODELS[payload.model||'free-fast'];
   const result=await env.AI.run(model,{messages:[{role:'system',content:SYSTEM},...messages],max_tokens:480,temperature:.65});
   const answer=typeof result?.response==='string'?result.response:
        typeof result?.result?.response==='string'?result.result.response:'';
   if(!answer.trim())return json({error:'No text returned by the free model'},502,origin);
   return json({choices:[{message:{role:'assistant',content:answer}}],model,free:true,quotaLimited:true},200,origin);
  }catch(error){
   // The free allocation runs out at 00:00 UTC; on a free account there is
   // NO automatic paid overage. Do not show internals or raw provider errors.
   const message=String(error?.message||'');
   const rate=/quota|limit|capacity|exceed|billing|neuron|429/i.test(message);
   return json({error:rate?'The shared free capacity is temporarily exhausted. Try again after the daily quota resets or use a local model.':'The free model is temporarily unavailable. Try again or switch to a local model.',retryable:true},rate?429:503,origin,{'Retry-After':rate?'3600':'90'});
  }
 }
};
