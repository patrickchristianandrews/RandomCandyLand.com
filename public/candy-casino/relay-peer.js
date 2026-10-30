/* PeerJS-compatible, WebSocket-based transport for Candy Land Casino.
 * Keeps the existing poker/high-card/dice game protocol unchanged.
 * This adapter is only selected after CandyCasinoRelayURL is configured.
 */
(()=>{'use strict';
const raw=String(window.CandyCasinoRelayURL||'').trim();
let endpoint='';
try{
 const parsed=new URL(raw);
 if(parsed.protocol==='https:' && !parsed.username && !parsed.password && parsed.pathname==='/'
    && !parsed.search && !parsed.hash)endpoint='wss://'+parsed.host;
}catch{}
const CODE=/^rcl-casino-[a-f0-9]{20}$/i;
class Events{
 constructor(){this.handlers=new Map()}
 on(type,callback){if(!this.handlers.has(type))this.handlers.set(type,[]);this.handlers.get(type).push(callback);return this}
 emit(type,...args){for(const fn of this.handlers.get(type)||[]){try{fn(...args)}catch(e){console.error('Casino relay handler error',e)}}}
}
class RelayConnection extends Events{
 constructor(peer,role,room,socket=null){
  super();this.owner=peer;this.role=role;this.peer=room;this.socket=socket;
  this.open=false;this.closed=false;this.peerConnection=null;
 }
 attach(socket){this.socket=socket}
 ready(){if(this.closed||this.open)return;this.open=true;this.emit('open')}
 data(msg){if(!this.closed&&this.open)this.emit('data',msg)}
 close(notify=true){
  if(this.closed)return;
  this.closed=true;this.open=false;
  if(notify){
   try{
    if(this.role==='host'&&this.socket?.readyState===1)this.socket.send(JSON.stringify({t:'drop-guest'}));
    if(this.role==='guest'&&this.socket?.readyState<=1)this.socket.close(1000,'Guest left');
   }catch{}
  }
  this.emit('close');
 }
 send(data){
  if(!this.open||this.closed||this.socket?.readyState!==1)return;
  const frame=JSON.stringify({t:'data',d:data});
  if(frame.length>8192)throw Error('Casino message too large');
  this.socket.send(frame);
 }
}
class RelayPeer extends Events{
 constructor(id){
  super();this.id=id||crypto.randomUUID();this.host=!!id;this.open=false;
  this.destroyed=false;this.disconnected=false;this.socket=null;this.connection=null;
  if(this.host){this.startHost()}
  else queueMicrotask(()=>{if(!this.destroyed){this.open=true;this.emit('open',this.id)}});
 }
 roomSocket(room,role){
  if(!CODE.test(room))throw Error('Invalid casino room code');
  if(!endpoint)throw Error('Cloudflare room relay is not configured');
  return new WebSocket(endpoint+'/room/'+encodeURIComponent(room)+'?role='+role);
 }
 startHost(){
  if(this.destroyed)return;
  let ws;
  try{ws=this.roomSocket(this.id,'host')}catch(e){
   queueMicrotask(()=>this.emit('error',{type:'network',message:String(e)}));return;
  }
  this.socket=ws;this.disconnected=false;
  ws.onmessage=event=>{
   if(this.destroyed||this.socket!==ws)return;
   let m;try{m=JSON.parse(event.data)}catch{return}
   if(m.t==='host-ready'){
    this.open=true;this.disconnected=false;this.emit('open',this.id);
   }else if(m.t==='host-taken'){
    this.refused=true;this.emit('error',{type:'unavailable-id'});
   }else if(m.t==='peer-ready'){
    if(this.connection&&!this.connection.closed)this.connection.close(false);
    const c=new RelayConnection(this,'host',this.id,ws);
    this.connection=c;
    this.emit('connection',c);
    queueMicrotask(()=>{if(this.connection===c)c.ready()});
   }else if(m.t==='data'){
    this.connection?.data(m.d);
   }else if(m.t==='peer-left'){
    const c=this.connection;this.connection=null;c?.close(false);
   }
  };
  ws.onerror=()=>{if(!this.destroyed&&!this.refused)this.emit('error',{type:'network'})};
  ws.onclose=event=>{
   if(this.destroyed||this.socket!==ws)return;
   if(event.code===4409&&!this.refused){
    this.refused=true;this.emit('error',{type:'unavailable-id'});
    return;
   }
   const c=this.connection;this.connection=null;c?.close(false);
   this.open=false;this.disconnected=true;
   if(!this.refused)this.emit('disconnected');
  };
 }
 connect(room){
  const c=new RelayConnection(this,'guest',room);this.connection=c;
  let ws;
  try{ws=this.roomSocket(room,'guest')}catch(e){
   queueMicrotask(()=>this.emit('error',{type:'network',message:String(e)}));return c;
  }
  this.socket=ws;c.attach(ws);
  let refused=false,accepted=false;
  ws.onmessage=event=>{
   if(this.destroyed||this.socket!==ws||this.connection!==c)return;
   let m;try{m=JSON.parse(event.data)}catch{return}
   if(m.t==='peer-ready'){accepted=true;c.ready()}
   else if(m.t==='missing'){refused=true;this.emit('error',{type:'peer-unavailable'})}
   else if(m.t==='full'){refused=true;this.emit('error',{type:'room-full'})}
   else if(m.t==='data'){c.data(m.d)}
   else if(m.t==='peer-left'){c.close(false);try{ws.close(1000,'Host left')}catch{}}
  };
  ws.onerror=()=>{
   if(!this.destroyed&&!refused&&this.connection===c)this.emit('error',{type:'network'});
  };
  ws.onclose=event=>{
   if(this.destroyed||this.socket!==ws)return;
   if(!refused&&this.connection===c){
    if(event.code===4404){refused=true;this.emit('error',{type:'peer-unavailable'})}
    else if(event.code===4410){refused=true;this.emit('error',{type:'room-full'})}
    else if(!accepted)this.emit('error',{type:'network'});
   }
   c.close(false);
  };
  return c;
 }
 reconnect(){
  if(this.destroyed||!this.host||this.refused)return;
  if(this.socket?.readyState===0||this.socket?.readyState===1)return;
  this.startHost();
 }
 destroy(){
  if(this.destroyed)return;
  this.destroyed=true;this.open=false;this.disconnected=true;
  const c=this.connection;this.connection=null;
  // Avoid sending a drop-guest packet when the whole room is being destroyed.
  c?.close(false);
  const ws=this.socket;this.socket=null;
  try{if(ws&&ws.readyState<=1)ws.close(1000,'Leaving room')}catch{}
 }
}
window.CandyCasinoRelay=Object.freeze({Peer:RelayPeer,enabled:!!endpoint,endpoint,transport:'Cloudflare WebSocket room relay'});
})();
