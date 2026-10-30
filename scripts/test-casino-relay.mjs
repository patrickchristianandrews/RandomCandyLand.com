// Deterministic protocol tests for the Cloudflare relay browser adapter.
// This simulates WebSocket messages; a live cross-device test still follows deployment.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const code=readFileSync('public/candy-casino/relay-peer.js','utf8');
const sockets=new Map();
const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve()};
class WebSocketMock{
 static CONNECTING=0;static OPEN=1;static CLOSING=2;static CLOSED=3;
 constructor(input){
  const u=new URL(input),room=u.pathname.split('/').pop();
  this.url=input;this.room=room;this.role=u.searchParams.get('role');
  this.readyState=WebSocketMock.CONNECTING;
  queueMicrotask(()=>{
   this.readyState=WebSocketMock.OPEN;this.onopen?.();
   const existing=sockets.get(room)||{};
   if(this.role==='host'){
    if(existing.host?.readyState===1){this.deliver({t:'host-taken'});this.close(4409,'Taken')}
    else{existing.host=this;sockets.set(room,existing);this.deliver({t:'host-ready'})}
   }else if(!existing.host||existing.host.readyState!==1){
    this.deliver({t:'missing'});this.close(4404,'Missing');
   }else if(existing.guest?.readyState===1){
    this.deliver({t:'full'});this.close(4410,'Full');
   }else{
    existing.guest=this;sockets.set(room,existing);
    existing.host.deliver({t:'peer-ready'});this.deliver({t:'peer-ready'});
   }
  });
 }
 deliver(data){queueMicrotask(()=>{if(this.readyState===1)this.onmessage?.({data:JSON.stringify(data)})})}
 send(text){
  if(this.readyState!==1)throw Error('Socket closed');
  const obj=JSON.parse(text),room=sockets.get(this.room)||{};
  if(WebSocketMock.blockHeartbeats&&obj.t==='data'&&['heartbeat','heartbeat-ack'].includes(obj.d?.type))return;
  if(obj.t==='data')room[this.role==='host'?'guest':'host']?.deliver({t:'data',d:obj.d});
  if(obj.t==='drop-guest')room.guest?.close(1000,'Host dropped guest');
 }
 close(code=1000,reason='Closing'){
  if(this.readyState>=2)return;this.readyState=3;
  const room=sockets.get(this.room);
  if(room?.[this.role]===this){room[this.role]=null;room[this.role==='host'?'guest':'host']?.deliver({t:'peer-left'})}
  queueMicrotask(()=>this.onclose?.({code,reason}));
 }
}
function createPeerScope(endpoint='https://candy-casino-relay.example.workers.dev'){
 const window={CandyCasinoRelayURL:endpoint};
 runInNewContext(code,{window,WebSocket:WebSocketMock,URL,crypto:{randomUUID:()=>String(Date.now())},
   queueMicrotask,console});
 return window.CandyCasinoRelay;
}
const relay=createPeerScope();assert.equal(relay.enabled,true);
const room='rcl-casino-aabbccddeeff00112233';
const host=new relay.Peer(room);
let hostConn=null,guestConn=null,hostMessages=[],guestMessages=[];
host.on('connection',conn=>{hostConn=conn;conn.on('data',msg=>hostMessages.push(msg))});
await flush();assert.equal(host.open,true);
const guest=new relay.Peer();
guest.on('open',()=>{guestConn=guest.connect(room);guestConn.on('data',msg=>guestMessages.push(msg))});
await flush();
assert.equal(hostConn?.open,true);
assert.equal(guestConn?.open,true);
guestConn.send({type:'hello',name:'Visitor'});hostConn.send({type:'state',round:2});
await flush();
assert.equal(hostMessages[0].name,'Visitor');assert.equal(guestMessages[0].round,2);
guest.destroy();await flush();assert.equal(host.open,true,'Host must remain open when guest leaves');
const second=new relay.Peer(),rec=[];
second.on('open',()=>{const c=second.connect(room);c.on('open',()=>rec.push('joined'))});
await flush();assert.deepEqual(rec,['joined'],'Another guest should join the existing room');
second.destroy();host.destroy();await flush();
const absent=new relay.Peer(),errors=[];
absent.on('error',e=>errors.push(e.type));
absent.on('open',()=>absent.connect(room));
await flush();assert.ok(errors.includes('peer-unavailable'),'Missing host must be reported');
absent.destroy();
const disabled=createPeerScope('');assert.equal(disabled.enabled,false,'Empty configuration cannot activate a false relay');

// Exercise the unchanged casino game controller through this relay adapter.
const casinoSource=readFileSync('public/candy-casino/casino.js','utf8');
function casinoBrowser(name){
 let fakeNow=Date.now(),nextTimer=0;
 const timers=new Map(),listeners=new Map();
 const DateMock=class extends Date{static now(){return fakeNow}};
 const setTimer=(fn,delay=0)=>{const id=++nextTimer;timers.set(id,{fn,due:fakeNow+Number(delay)});return id};
 const advance=ms=>{
  fakeNow+=ms;
  for(const [id,timer] of [...timers])if(timer.due<=fakeNow){timers.delete(id);timer.fn()}
 };
 const nodes={};
 const get=id=>nodes[id]??={value:id==='friend-name'?name:'',textContent:'',hidden:false,disabled:false,dataset:{},
  classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},addEventListener(){},focus(){},select(){},after(){}};
 const document={getElementById:get,querySelectorAll(){return []},addEventListener(event,fn){listeners.set(event,fn)}, 
  createElement(){return get('generated-element')},body:{dataset:{}},head:{append(){}},hidden:false};
 const location={href:'https://randomcandyland.com/candy-casino/',hash:''};
 const history={replaceState(_a,_b,url){location.href=String(url)}};
 const window={CandyCasinoRelayURL:'https://candy-casino-relay.example.workers.dev',
  CandyPoker:{random:()=>1,valid:()=>false},addEventListener(){}};
 const ctx={window,document,location,history,URL,Date:DateMock,WebSocket:WebSocketMock,queueMicrotask,
  crypto:{randomUUID:()=>cryptoRandomUUID()},localStorage:{getItem(){return null},setItem(){}},
  setTimeout:setTimer,clearTimeout:id=>timers.delete(id),navigator:{userAgent:'test browser'},console};
 runInNewContext(code,ctx);runInNewContext(casinoSource,ctx);
 return {get,window,location,status:()=>get('connection-status').textContent,advance,
  setHidden:hidden=>{document.hidden=hidden;listeners.get('visibilitychange')?.()},
  diagnostics:()=>window.CandyCasinoDebug.connectionDetails()};
}
const {randomUUID:cryptoRandomUUID}=await import('node:crypto');
const hostGame=casinoBrowser('Ginger');
hostGame.get('show-online').onclick();
await hostGame.get('make-room').onclick();await flush();
const activeRoom=hostGame.get('room-input').value;
assert.match(activeRoom,/^rcl-casino-[a-f0-9]{20}$/);
const guestGame=casinoBrowser('Candy');
guestGame.get('show-online').onclick();
guestGame.get('room-input').value=activeRoom;
await guestGame.get('join-room').onclick();await flush();
assert.match(hostGame.status(),/Both players connected and responding/);
assert.match(guestGame.status(),/Both players connected and responding/);
assert.match(hostGame.diagnostics(),/Transport: Cloudflare WebSocket room relay/);
assert.match(hostGame.diagnostics(),/Online: true/);
assert.match(hostGame.diagnostics(),/Confirmed app handshake: true/);
assert.match(guestGame.diagnostics(),/Confirmed app handshake: true/);
assert.equal(hostGame.get('opponent-name').textContent,'Candy');
assert.equal(guestGame.get('opponent-name').textContent,'Ginger');
console.log('✓ Complete Casino host/guest UI connects and exchanges player names through the relay');
// Heartbeats can be delayed on mobile; a late response must clear the warning.
WebSocketMock.blockHeartbeats=true;
hostGame.advance(32000);
assert.match(hostGame.status(),/Waiting for your friend to respond/);
WebSocketMock.blockHeartbeats=false;
hostGame.advance(7500);await flush();
assert.match(hostGame.status(),/Both players connected and responding/, 'A heartbeat response clears the unstable warning');
// A backgrounded mobile browser can suspend JavaScript timers for minutes.
hostGame.setHidden(true);
hostGame.advance(120000);await flush();
assert.match(hostGame.diagnostics(),/Online: true/, 'Suspending a tab must not close a healthy Cloudflare socket');
hostGame.setHidden(false);await flush();
assert.match(hostGame.status(),/Both players connected and responding/, 'Returning to a tab probes and recovers the room');
console.log('✓ Idle warning recovers on heartbeat and mobile background pause preserves the room');
hostGame.get('leave-room').onclick();guestGame.get('leave-room').onclick();await flush();

console.log('✓ Relay adapter opens two sockets, forwards state, retains host, rejoins, and reports missing rooms');
console.log('✓ Relay configuration requires a real HTTPS endpoint; this is not a live-server test');
