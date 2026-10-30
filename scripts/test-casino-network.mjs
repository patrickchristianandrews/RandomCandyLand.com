// Deterministic PeerJS room lifecycle tests. Simulates signaling, not real WebRTC traversal.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';

const casino=readFileSync('public/candy-casino/casino.js','utf8');
const peers=new Map(),timers=new Map();
let generated=0,timerId=0;
const delay=(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id};
const cancel=id=>timers.delete(id);
const flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve()};
const advance=async(max=500)=>{
 for(let i=0;i<12;i++){
  await flush();
  const due=[...timers.entries()].filter(([,t])=>t.ms<=max);
  if(!due.length)break;
  for(const [id,t] of due){timers.delete(id);t.fn()}
 }
 await flush();
};
class Events {
 on(type,fn){(this.events??={})[type]??=[];this.events[type].push(fn)}
 emit(type,...args){for(const fn of this.events?.[type]||[])fn(...args)}
}
class Connection extends Events {
 constructor(id){super();this.peer=id;this.open=false;this.closed=false;this.peerConnection={iceConnectionState:'new',signalingState:'have-local-offer',addEventListener(){}}}
 send(msg){if(this.open&&this.other?.open)queueMicrotask(()=>this.other.emit('data',msg))}
 close(){if(this.closed)return;this.closed=true;this.open=false;this.emit('close');if(this.other&&!this.other.closed)this.other.close()}
}
class Peer extends Events {
 constructor(id){super();this.id=id||'guest-'+(++generated);this.open=false;this.destroyed=false;this.disconnected=false;queueMicrotask(()=>{
  if(peers.has(this.id)){this.emit('error',{type:'unavailable-id'});return}
  peers.set(this.id,this);this.open=true;this.emit('open',this.id);
 })}
 connect(id){
  const local=new Connection(id),remote=new Connection(this.id);local.other=remote;remote.other=local;
  queueMicrotask(()=>{
   const target=peers.get(id);
   if(!target?.open){this.emit('error',{type:'peer-unavailable'});return}
   target.emit('connection',remote);local.open=remote.open=true;remote.emit('open');local.emit('open');
  });
  return local;
 }
 destroy(){this.destroyed=true;this.open=false;this.disconnected=true;if(peers.get(this.id)===this)peers.delete(this.id)}
 reconnect(){this.disconnected=false;queueMicrotask(()=>{
  if(peers.has(this.id)){this.emit('error',{type:'unavailable-id'});return}
  peers.set(this.id,this);this.open=true;this.emit('open',this.id);
 })}
}
function browser(name,href='https://example.test/candy-casino/'){
 const elements={};
 const get=id=>elements[id]??={value:id==='friend-name'?name:'',textContent:'',hidden:false,disabled:false,dataset:{},
  classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener(){},focus(){},select(){},after(){}};
 const doc={getElementById:get,querySelectorAll(){return []},addEventListener(){},createElement(){return get('mock-element')},
  body:{dataset:{}},head:{append(){}},hidden:false};
 const location={href,hash:''};
 const history={replaceState(_a,_b,v){location.href=String(v)}};
 const window={CandyPoker:{random:()=>1,valid:()=>false},Peer,addEventListener(){}};
 runInNewContext(casino,{window,document:doc,location,history,URL,crypto:{randomUUID},
  localStorage:{getItem(){return null},setItem(){}},setTimeout:delay,clearTimeout:cancel,
  navigator:{userAgent:'test browser'},queueMicrotask,console});
 return {get,location,status:()=>get('connection-status').textContent,
  diagnostics:()=>window.CandyCasinoDebug.connectionDetails()};
}
const room='rcl-casino-abcdef0123456789abcd';
{
 const a=browser('Alice');a.get('room-input').value=room;await a.get('join-room').onclick();await flush();
 assert.match(a.status(),/reopened the SAME room/);
 assert.match(a.diagnostics(),/Role: Host/);
 const b=browser('Bob');b.get('room-input').value=room;await b.get('join-room').onclick();await flush();
 assert.match(a.status(),/Both players connected and responding/);
 assert.match(b.status(),/Both players connected and responding/);
 assert.match(b.diagnostics(),/Host offers received: N\/A \(guest\)/);
 console.log('✓ Abandoned invite automatically elects a host; second player joins');
}
{
 const a=browser('Charlie');await a.get('make-room').onclick();await flush();
 const id=a.get('room-input').value;
 assert.match(id,/^rcl-casino-[a-f0-9]{20}$/);
 assert.ok(a.location.href.includes('room='+id));
 const b=browser('Diana');b.get('room-input').value=id;await b.get('join-room').onclick();await flush();
 assert.match(a.status(),/Both players connected and responding/);
 assert.match(b.status(),/Both players connected and responding/);
 assert.match(a.diagnostics(),/Confirmed app handshake: true/);
 assert.match(b.diagnostics(),/Confirmed app handshake: true/);
 // A signaling hiccup must not tear down the established game data channel.
 const hostPeer=peers.get(id);
 hostPeer.disconnected=true;hostPeer.emit('disconnected');await flush();
 assert.match(a.diagnostics(),/Online: true/);
 assert.match(a.diagnostics(),/Role: Host/);
 console.log('✓ Established room survives a signaling disconnect without changing roles');
 console.log('✓ Standard room creation and joining work with a persistent invitation URL');
}
{
 const id='rcl-casino-1234567890abcdef1234';
 const a=browser('Eva'),b=browser('Frank');
 a.get('room-input').value=id;b.get('room-input').value=id;
 await Promise.all([a.get('join-room').onclick(),b.get('join-room').onclick()]);
 await flush();await advance(500);
 assert.ok(/connected and responding/i.test(a.status())&&/connected and responding/i.test(b.status()),
   'Concurrent guests must settle into one host and one guest: '+a.status()+' / '+b.status());
 assert.notEqual(/Role: Host/.test(a.diagnostics()),/Role: Host/.test(b.diagnostics()));
 console.log('✓ Simultaneous attempts to recover a missing room settle without duplicate hosts');
}
console.log('Casino room lifecycle tests passed (simulation only; real device WebRTC not verified).');
