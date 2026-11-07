/* Random Candy Land opt-in Web Push: genuine scheduled phone notifications.
 * Only selected, unfinished games. The push service stores encrypted
 * subscription credentials, anonymous preference data and dates, never
 * game notes, cases, chat content or personal accounts.
 * Cloudflare KV + Cron + VAPID secrets are required for background delivery.
 */
const ORIGINS=new Set(['https://randomcandyland.com','https://www.randomcandyland.com','http://localhost:5173','http://127.0.0.1:5173']);
const GAME_INFO={
 corridors:{title:'🚪 The Corridors',body:'The next chapter is ready whenever you are.',url:'/the-corridors/'},
 docket:{title:'⚖️ The Docket',body:'Step back into the courtroom and continue your case.',url:'/the-docket/'},
 trace:{title:'🔎 TRACE Academy',body:'Your next investigation lesson is waiting.',url:'/osint-academy/'},
 pet:{title:'🐣 FM-1 Trumpagotchi',body:'Your little pocket pet would love a check-in.',url:'/trumpagotchi-fm1/'},
 originalpet:{title:'🐥 Trumpagotchi OG',body:'Your original digital pet is ready to play.',url:'/trump/'}
};
const enc=new TextEncoder();
function base64url(buf){const bytes=buf instanceof ArrayBuffer?new Uint8Array(buf):buf;let s='';for(const n of bytes)s+=String.fromCharCode(n);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unbase64url(s){const b=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(b+'='.repeat((4-b.length%4)%4)),c=>c.charCodeAt(0))}
function concat(...arrays){const length=arrays.reduce((a,x)=>a+x.length,0),out=new Uint8Array(length);let n=0;for(const x of arrays){out.set(x,n);n+=x.length}return out}
async function hmac(key,data){const k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,data))}
async function hkdfExpand(prk,info,length){let result=new Uint8Array(0),previous=new Uint8Array(0),counter=1;while(result.length<length){previous=await hmac(prk,concat(previous,info,Uint8Array.of(counter++)));result=concat(result,previous)}return result.slice(0,length)}
async function idFor(endpoint){const sum=await crypto.subtle.digest('SHA-256',enc.encode(endpoint));return 'sub:'+base64url(sum)}
function endpointOK(url){try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash)return false;const h=u.hostname.toLowerCase();return h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h==='web.push.apple.com'||h.endsWith('.push.apple.com')||h.endsWith('.push.services.mozilla.com')}catch{return false}}
function validToken(t){return typeof t==='string'&&/^[0-9a-f]{32,64}$/.test(t)}
function validSub(s){try{return !!s&&typeof s==='object'&&typeof s.endpoint==='string'&&s.endpoint.length<1700&&endpointOK(s.endpoint)&&typeof s.keys?.p256dh==='string'&&typeof s.keys?.auth==='string'&&s.keys.p256dh.length<170&&s.keys.auth.length<100&&unbase64url(s.keys.p256dh).length===65&&unbase64url(s.keys.auth).length===16}catch{return false}}
function preferences(src){
 if(!src||typeof src!=='object')return null;
 const games=Array.isArray(src.games)?[...new Set(src.games.filter(x=>typeof x==='string'&&Object.hasOwn(GAME_INFO,x)))].slice(0,6):[];
 if(games.length<1)return null;
 const tz=src.timezone;
 try{if(typeof tz!=='string'||tz.length>70||!new Intl.DateTimeFormat('en',{timeZone:tz}).resolvedOptions().timeZone)return null}catch{return null}
 const hour=Number(src.hour);
 if(![9,13,18].includes(hour))return null;
 const frequency=['daily','twice-weekly','weekly'].includes(src.frequency)?src.frequency:'twice-weekly';
 const status={};
 if(src.progress&&typeof src.progress==='object')for(const g of games){status[g]=['active','completed','not-started'].includes(src.progress[g])?src.progress[g]:'not-started'}
 return {games,timezone:tz,hour,frequency,progress:status};
}
function cors(origin){return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}}
function reply(data,status,origin){return new Response(JSON.stringify(data),{status:status||200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(origin?cors(origin):{})}})}
async function vapidJwt(endpoint,env){
 const host=new URL(endpoint).origin;
 const header=base64url(enc.encode(JSON.stringify({typ:'JWT',alg:'ES256'})));
 const payload=base64url(enc.encode(JSON.stringify({aud:host,exp:Math.floor(Date.now()/1000)+11*3600,sub:'https://randomcandyland.com/'})));
 const input=header+'.'+payload;
 const privateBytes=unbase64url(env.VAPID_PRIVATE_KEY);
 const pub=unbase64url(env.VAPID_PUBLIC_KEY);
 if(privateBytes.length!==32||pub.length!==65)throw Error('Invalid VAPID key configuration');
 const key=await crypto.subtle.importKey('jwk',{
  kty:'EC',crv:'P-256',x:base64url(pub.slice(1,33)),y:base64url(pub.slice(33,65)),d:env.VAPID_PRIVATE_KEY,ext:false
 },{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(input));
 return input+'.'+base64url(sig);
}
async function encryptMessage(text,sub){
 const userPublic=unbase64url(sub.keys.p256dh),auth=unbase64url(sub.keys.auth);
 const ephemeral=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const serverPublic=new Uint8Array(await crypto.subtle.exportKey('raw',ephemeral.publicKey));
 const recipientPublic=await crypto.subtle.importKey('raw',userPublic,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:recipientPublic},ephemeral.privateKey,256));
 const prkKey=await hmac(auth,shared);
 const ikm=await hkdfExpand(prkKey,concat(enc.encode('WebPush: info\0'),userPublic,serverPublic),32);
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const prk=await hmac(salt,ikm);
 const cek=await hkdfExpand(prk,enc.encode('Content-Encoding: aes128gcm\0'),16);
 const nonce=await hkdfExpand(prk,enc.encode('Content-Encoding: nonce\0'),12);
 const key=await crypto.subtle.importKey('raw',cek,{name:'AES-GCM'},false,['encrypt']);
 const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce},key,concat(enc.encode(JSON.stringify(text)),Uint8Array.of(2))));
 // The aes128gcm content coding (RFC 8291) header: salt / rs / idlen / as-public.
 const header=concat(salt,Uint8Array.of(0,0,16,0,65),serverPublic);
 return concat(header,cipher);
}
async function sendPush(record,message,env){
 const jwt=await vapidJwt(record.subscription.endpoint,env);
 const body=await encryptMessage(message,record.subscription);
 const resp=await fetch(record.subscription.endpoint,{
  method:'POST',headers:{
   'Authorization':'vapid t='+jwt+', k='+env.VAPID_PUBLIC_KEY,
   'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',
   'TTL':'3600','Urgency':'normal'
  },body
 });
 return {ok:resp.status===201||resp.status===202||resp.status===200,
         gone:resp.status===404||resp.status===410,status:resp.status};
}
function localClock(zone){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',weekday:'short',hourCycle:'h23'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return {date:p.year+'-'+p.month+'-'+p.day,hour:Number(p.hour),weekday:p.weekday}}
function scheduledGame(record,clock){
 const options=record.games.filter(g=>record.progress?.[g]==='active');
 if(!options.length)return null;
 if(record.frequency==='twice-weekly'&&!['Mon','Thu'].includes(clock.weekday))return null;
 if(record.frequency==='weekly'&&clock.weekday!=='Sat')return null;
 let shift=0;for(const c of clock.date)shift+=c.charCodeAt(0);
 return options[shift%options.length];
}
async function cronBatch(env){
 if(!env.SUBSCRIPTIONS||!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)return;
 let cursor=undefined,visited=0,sent=0;
 do{
  const page=await env.SUBSCRIPTIONS.list({prefix:'sub:',limit:100,...cursor?{cursor}:{}});
  cursor=page.list_complete?undefined:page.cursor;
  for(const key of page.keys){
   if(++visited>300||sent>=30)return;
   const raw=await env.SUBSCRIPTIONS.get(key.name);
   if(!raw)continue;
   let record;try{record=JSON.parse(raw)}catch{continue}
   const clock=localClock(record.timezone);
   if(clock.hour!==record.hour||record.lastDate===clock.date)continue;
   const selected=scheduledGame(record,clock);if(!selected)continue;
   const item=GAME_INFO[selected];
   try{
    const delivery=await sendPush(record,{title:item.title+' · Your next move',body:item.body,url:item.url,tag:'rcl-'+selected},env);
    if(delivery.gone){await env.SUBSCRIPTIONS.delete(key.name);continue}
    if(delivery.ok){record.lastDate=clock.date;record.updatedAt=Date.now();await env.SUBSCRIPTIONS.put(key.name,JSON.stringify(record),{expirationTtl:60*60*24*365});++sent}
   }catch{} // An individual offline push provider cannot block other subscribers.
  }
 }while(cursor&&visited<=300&&sent<30);
}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  if(!ORIGINS.has(origin))return reply({error:'Origin not permitted'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
  const url=new URL(request.url);
  const ready=!!(env.SUBSCRIPTIONS&&env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY);
  if(request.method==='GET'&&url.pathname==='/health')return reply({ready,notifications:true,backgroundPush:ready,accountRequired:false},200,origin);
  if(request.method==='GET'&&url.pathname==='/public-key')return reply(ready?{publicKey:env.VAPID_PUBLIC_KEY}:{error:'Push worker is not configured'},ready?200:503,origin);
  if(request.method!=='POST'||!['/subscribe','/update','/unsubscribe','/test'].includes(url.pathname))return reply({error:'Not found'},404,origin);
  if(!ready)return reply({error:'Cloudflare Push worker, KV and VAPID keys are not configured'},503,origin);
  const length=Number(request.headers.get('Content-Length')||0);
  if(length>7000)return reply({error:'Request too large'},413,origin);
  let body;try{const raw=await request.text();if(raw.length>7000)return reply({error:'Request too large'},413,origin);body=JSON.parse(raw)}catch{return reply({error:'Invalid request'},400,origin)}
  if(!validToken(body?.token)||!validSub(body?.subscription))return reply({error:'Invalid subscription'},400,origin);
  const key=await idFor(body.subscription.endpoint);
  const oldRaw=await env.SUBSCRIPTIONS.get(key),old=oldRaw?JSON.parse(oldRaw):null;
  if(url.pathname==='/subscribe'){
   const prefs=preferences(body.preferences);if(!prefs)return reply({error:'Choose a game and valid reminder settings'},400,origin);
   if(old&&old.token!==body.token)return reply({error:'Subscription already registered on a different device session'},409,origin);
   const record={...prefs,token:body.token,subscription:body.subscription,lastDate:old?.lastDate||'',lastTest:old?.lastTest||0,updatedAt:Date.now()};
   await env.SUBSCRIPTIONS.put(key,JSON.stringify(record),{expirationTtl:60*60*24*365});
   return reply({saved:true,activeGames:prefs.games.filter(g=>prefs.progress[g]==='active').length},200,origin);
  }
  if(!old||old.token!==body.token)return reply({error:'Subscription not found'},404,origin);
  if(url.pathname==='/unsubscribe'){await env.SUBSCRIPTIONS.delete(key);return reply({removed:true},200,origin)}
  if(url.pathname==='/update'){
   const prefs=preferences(body.preferences);if(!prefs)return reply({error:'Choose at least one game'},400,origin);
   await env.SUBSCRIPTIONS.put(key,JSON.stringify({...old,...prefs,updatedAt:Date.now()}),{expirationTtl:60*60*24*365});
   return reply({saved:true},200,origin);
  }
  if(Date.now()-old.lastTest<300000)return reply({error:'A push test was already sent recently. Try again in five minutes.'},429,origin);
  try{
   const result=await sendPush(old,{title:'✨ Random Candy Land notifications',body:'This is a real push sent by your game reminder service.',url:'/',tag:'rcl-test'},env);
   if(!result.ok)return reply({error:'Push service rejected the test: '+result.status},502,origin);
   old.lastTest=Date.now();
   await env.SUBSCRIPTIONS.put(key,JSON.stringify(old),{expirationTtl:60*60*24*365});
   return reply({sent:true},200,origin);
  }catch{return reply({error:'Push service could not deliver the test'},503,origin)}
 },
 async scheduled(event,env,ctx){ctx.waitUntil(cronBatch(env))}
};
