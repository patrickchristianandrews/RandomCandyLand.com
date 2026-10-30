// Live Cloudflare Worker probe, independent of the website build.
// Checks /health and a real two-device WebSocket room handshake from GitHub Actions.
// It does not simulate, mutate deployed data, or store any game information.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import WebSocket from 'ws';

const BASE=process.env.CANDY_CASINO_RELAY_URL || 'https://candy-casino-relay.patrick-christian-andrews.workers.dev';
const origin='https://randomcandyland.com';
const u=new URL(BASE);
assert.equal(u.protocol,'https:');
const abort=AbortSignal.timeout(12000);
const health=await fetch(new URL('/health',u),{signal:abort,headers:{accept:'application/json'}});
const text=await health.text();
if(!health.ok)throw Error('Relay health check returned HTTP '+health.status+': '+text.slice(0,200));
let json;try{json=JSON.parse(text)}catch{throw Error('Relay /health did not return JSON: '+text.slice(0,200))}
assert.equal(json.ok,true,'Health endpoint must report ok:true');
assert.equal(json.service,'candy-casino-room-relay','Expected the Casino relay Worker, not a website deployment');
console.log('✓ Live relay /health returns the expected Casino worker identity');

const code='rcl-casino-'+randomUUID().replace(/-/g,'').slice(0,20);
const wsURL=new URL('/room/'+code,u);wsURL.protocol='wss:';
function connect(role){
 const url=new URL(wsURL);url.searchParams.set('role',role);
 return new WebSocket(url,{origin,handshakeTimeout:11000});
}
function event(ws,eventName,timeout=12000){
 return new Promise((resolve,reject)=>{
  const t=setTimeout(()=>{cleanup();reject(new Error(eventName+' not received before timeout; socket state='+ws.readyState))},timeout);
  const onEvent=(...args)=>{cleanup();resolve(args)};
  const onError=e=>{cleanup();reject(e)};
  const onClose=(code,reason)=>{cleanup();reject(new Error('Socket closed before '+eventName+' ('+code+': '+String(reason)+')'))};
  const cleanup=()=>{clearTimeout(t);ws.removeListener(eventName,onEvent);ws.removeListener('error',onError);if(eventName!=='close')ws.removeListener('close',onClose)};
  ws.on(eventName,onEvent);ws.on('error',onError);if(eventName!=='close')ws.on('close',onClose);
 });
}
function message(ws,kind){
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{cleanup();reject(new Error('Missing WebSocket '+kind+' message after 12 seconds'))},12000);
  const onMessage=raw=>{
   let x;try{x=JSON.parse(String(raw))}catch{return}
   if(x.t!==kind && x.d?.type!==kind)return;
   cleanup();resolve(x);
  };
  const onClose=(code,reason)=>{cleanup();reject(new Error('Socket closed '+code+' before message '+kind+': '+String(reason)))};
  const onError=e=>{cleanup();reject(e)};
  const cleanup=()=>{clearTimeout(timer);ws.off('message',onMessage);ws.off('close',onClose);ws.off('error',onError)};
  ws.on('message',onMessage);ws.on('close',onClose);ws.on('error',onError);
 });
}
let host,guest;
try{
 host=connect('host');
 const hostReady=message(host,'host-ready');
 await event(host,'open');
 await hostReady;
 console.log('✓ Cloudflare Durable Object successfully registered a host room');
 guest=connect('guest');
 const guestReady=message(guest,'peer-ready');
 const hostJoined=message(host,'peer-ready');
 await event(guest,'open');
 await Promise.all([guestReady,hostJoined]);
 console.log('✓ Guest joined the host on the same room ID');
 const hostHeard=message(host,'heartbeat');
 guest.send(JSON.stringify({t:'data',d:{type:'heartbeat',sent:Date.now()}}));
 await hostHeard;
 const guestHeard=message(guest,'hello');
 host.send(JSON.stringify({t:'data',d:{type:'hello',name:'RelayHealthCheck'}}));
 await guestHeard;
 const guestState=message(guest,'state');
 host.send(JSON.stringify({t:'data',d:{type:'state',round:1}}));
 await guestState;
 console.log('✓ Two-way WebSocket game messages and heartbeat packets forwarded successfully');
 console.log('LIVE CASINO RELAY VERIFIED: '+BASE);
}finally{
 for(const ws of [host,guest])try{ws?.close(1000,'Health check complete')}catch{}
}
