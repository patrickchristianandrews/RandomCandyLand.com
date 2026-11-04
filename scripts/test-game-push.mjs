/* Test opt-in phone reminders and encrypted push payload without any
 * Cloudflare account, paid service, or external network calls.
 */
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../game-notifications/worker.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const e=new TextEncoder();
const buf=(b)=>new Uint8Array(b);
const b64=(bytes)=>Buffer.from(bytes).toString('base64url');
const un64=(s)=>buf(Buffer.from(s,'base64url'));
const join=(...xs)=>{const o=new Uint8Array(xs.reduce((n,x)=>n+x.length,0));let i=0;for(const x of xs){o.set(x,i);i+=x.length}return o};
const sha=async(k,d)=>{const key=await crypto.subtle.importKey('raw',k,{name:'HMAC',hash:'SHA-256'},false,['sign']);return buf(await crypto.subtle.sign('HMAC',key,d))};
const expand=async(prk,info,n)=>{let p=new Uint8Array(0),out=new Uint8Array(0),i=0;while(out.length<n){p=await sha(prk,join(p,info,Uint8Array.of(++i)));out=join(out,p)}return out.slice(0,n)};
const database=new Map();
const KV={
 async get(k){return database.get(k)||null},
 async put(k,v){database.set(k,v)},
 async delete(k){database.delete(k)},
 async list({prefix}){return {keys:[...database.keys()].filter(k=>k.startsWith(prefix)).map(name=>({name})),list_complete:true}}
};
const vapid=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const serverPublic=b64(buf(await crypto.subtle.exportKey('raw',vapid.publicKey)));
const serverPrivate=(await crypto.subtle.exportKey('jwk',vapid.privateKey)).d;
const client=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
const clientPublic=b64(buf(await crypto.subtle.exportKey('raw',client.publicKey)));
const auth=crypto.getRandomValues(new Uint8Array(16)),authB64=b64(auth);
const env={SUBSCRIPTIONS:KV,VAPID_PUBLIC_KEY:serverPublic,VAPID_PRIVATE_KEY:serverPrivate};
const origin='https://randomcandyland.com';
const endpoint='https://fcm.googleapis.com/fcm/send/example-token';
const subscription={endpoint,keys:{p256dh:clientPublic,auth:authB64}};
const token='0123456789abcdef'.repeat(3);
const post=(url,body,method='POST')=>worker.fetch(new Request('https://push.example.test'+url,{method,headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
let captured=null;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{
 assert.equal(String(url),endpoint);
 assert.equal(options.method,'POST');
 assert.equal(options.headers['Content-Encoding'],'aes128gcm');
 assert.match(options.headers.Authorization,/^vapid t=/);
 captured=options;
 return new Response('',{status:201});
};
try{
 const health=await worker.fetch(new Request('https://push.example.test/health',{headers:{Origin:origin}}),env);
 assert.equal((await health.json()).ready,true);
 const blocked=await worker.fetch(new Request('https://push.example.test/health',{headers:{Origin:'https://bad.example'}}),env);
 assert.equal(blocked.status,403);
 const unsupported=await post('/subscribe',{token,subscription:{...subscription,endpoint:'https://example.org/secret'},preferences:{}});
 assert.equal(unsupported.status,400);
 const subscribed=await post('/subscribe',{token,subscription,preferences:{
  games:['moodropolis','trace','pet'],timezone:'America/New_York',
  hour:18,frequency:'twice-weekly',progress:{moodropolis:'active',trace:'completed',pet:'active'}
 }});
 assert.equal(subscribed.status,200);
 assert.equal((await subscribed.json()).activeGames,2);
 assert.equal(database.size,1);
 const sent=await post('/test',{token,subscription});
 assert.equal(sent.status,200);
 assert.equal((await sent.json()).sent,true);
 assert.ok(captured&&captured.body.length>140);
 // RFC 8291 aes128gcm decode with browser-keypair secrets. This verifies
 // that a real iPhone/Android push service can decrypt the message.
 const bytes=buf(captured.body);
 const salt=bytes.slice(0,16),rs=bytes.slice(16,20),keyLength=bytes[20];
 assert.deepEqual([...rs],[0,0,16,0]);
 assert.equal(keyLength,65);
 const temp=bytes.slice(21,86),encrypted=bytes.slice(86);
 const ephemeral=await crypto.subtle.importKey('raw',temp,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=buf(await crypto.subtle.deriveBits({name:'ECDH',public:ephemeral},client.privateKey,256));
 const ikm=await expand(await sha(auth,shared),join(e.encode('WebPush: info\0'),un64(clientPublic),temp),32);
 const prk=await sha(salt,ikm);
 const keyBytes=await expand(prk,e.encode('Content-Encoding: aes128gcm\0'),16);
 const nonce=await expand(prk,e.encode('Content-Encoding: nonce\0'),12);
 const key=await crypto.subtle.importKey('raw',keyBytes,{name:'AES-GCM'},false,['decrypt']);
 const plaintext=buf(await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce},key,encrypted));
 assert.equal(plaintext.at(-1),2);
 const message=JSON.parse(new TextDecoder().decode(plaintext.slice(0,-1)));
 assert.equal(message.title,'✨ Random Candy Land notifications');
 assert.equal(message.url,'/');
 const spam=await post('/test',{token,subscription});
 assert.equal(spam.status,429);
 const changed=await post('/update',{token,subscription,preferences:{
  games:['corridors'],timezone:'Europe/London',hour:13,frequency:'weekly',progress:{corridors:'active'}
 }});
 assert.equal(changed.status,200);
 const removed=await post('/unsubscribe',{token,subscription});
 assert.equal(removed.status,200);
 assert.equal(database.size,0);
 console.log('PASS: push origin/permissions API, encrypted aes128gcm payload, VAPID signing, game preferences, throttling, revoke.');
}finally{globalThis.fetch=originalFetch}
