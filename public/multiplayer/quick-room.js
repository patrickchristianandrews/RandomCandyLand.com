/* Quick Remote Rooms · 2-player, low-overhead Cloudflare relay transport.
   A single small controls row shared by Candy Match and Goo Rush.
   Room IDs use the already deployed casino relay's 20-hex namespace;
   the server only forwards approved frame types, so all messages use
   hello/ready/draw/reset/state. No user accounts, API keys, WebRTC, or
   persistent room data. Neither app transmits personal information.
 */
(()=>{'use strict';
const ROOM=/^rcl-casino-[a-f0-9]{20}$/i;
const relay=()=>window.CandyCasinoRelay;
const parseRoom=text=>{
 const value=String(text||'').trim();
 if(ROOM.test(value))return value.toLowerCase();
 try{const url=new URL(value,location.href);const from=url.searchParams.get('room')||'';return ROOM.test(from)?from.toLowerCase():''}catch{return ''}
};
const newRoom=()=>{
 if(!crypto?.getRandomValues)throw Error('Secure randomness is unavailable.');
 const b=new Uint8Array(10);crypto.getRandomValues(b);
 return 'rcl-casino-'+[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
};
class QuickRoom {
 constructor({root,game,onConnected,onDisconnected,onMessage,onWaiting}){
  this.root=typeof root==='string'?document.querySelector(root):root;
  if(!this.root)throw Error('Remote room controls not found.');
  this.game=game||'game';this.onConnected=onConnected||(()=>{});
  this.onDisconnected=onDisconnected||(()=>{});this.onMessage=onMessage||(()=>{});
  this.onWaiting=onWaiting||(()=>{});this.peer=null;this.connection=null;
  this.host=false;this.connected=false;this.room='';this.epoch=0;
  this.mount();
 }
 mount(){
  this.root.innerHTML='<details class="qr-compact"><summary>🌐 Play remotely <span class="qr-status" role="status" aria-live="polite">Not connected</span></summary>'+
  '<div class="qr-controls"><div class="qr-row"><button type="button" class="qr-create">＋ Create room</button>'+
  '<input type="text" class="qr-code" aria-label="Remote room code or invitation link" placeholder="Paste invite or code" autocomplete="off" spellcheck="false">'+
  '<button type="button" class="qr-join">Join</button></div>'+
  '<div class="qr-invite" hidden><span class="qr-invite-label">Share this link with a friend</span><input class="qr-link" type="text" aria-label="Invitation link" readonly>'+
  '<button class="qr-copy" type="button">Copy link</button></div><div class="qr-foot"><span class="qr-help">Two people · no sign-in · share one link · both keep the page open</span><button type="button" class="qr-leave" hidden>Leave</button></div></div></details>';
  this.details=this.root.querySelector('details');
  this.statusEl=this.root.querySelector('.qr-status');
  this.code=this.root.querySelector('.qr-code');
  this.invite=this.root.querySelector('.qr-invite');
  this.link=this.root.querySelector('.qr-link');
  this.leaveBtn=this.root.querySelector('.qr-leave');
  this.createBtn=this.root.querySelector('.qr-create');
  this.joinBtn=this.root.querySelector('.qr-join');
  this.createBtn.addEventListener('click',()=>this.create());
  this.joinBtn.addEventListener('click',()=>this.join(this.code.value));
  this.code.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.join(this.code.value)}});
  this.root.querySelector('.qr-copy').addEventListener('click',()=>this.copy());
  this.leaveBtn.addEventListener('click',()=>this.leave());
  addEventListener('pagehide',()=>this.destroy());
 }
 status(message){this.statusEl.textContent=message}
 get active(){return !!this.room}
 get role(){return this.host?'host':'guest'}
 get ready(){return this.connected&&!!this.connection?.open}
 update(){
  this.createBtn.disabled=this.active;
  this.joinBtn.disabled=this.active;
  this.code.disabled=this.active;
  this.invite.hidden=!this.active;
  this.leaveBtn.hidden=!this.active;
  if(this.active){
   const url=new URL(location.href);
   url.searchParams.delete('seed');url.searchParams.delete('mode');
   url.searchParams.set('room',this.room);
   this.link.value=url.href;
  }
 }
 available(){
  if(!relay()?.enabled){this.open();this.status('Remote service unavailable');return false}
  return true;
 }
 open(){this.details.open=true}
 create(){
  if(!this.available())return;
  this.destroy();this.epoch++;const epoch=this.epoch;
  this.open();this.host=true;this.room=newRoom();this.status('Opening room…');this.update();
  this.peer=new relay().Peer(this.room);
  this.bindPeer(this.peer,epoch);
  this.peer.on('open',()=>{
   if(epoch!==this.epoch)return;
   this.status('Waiting for friend · copy invite');
   this.onWaiting('host');
  });
  const url=new URL(location.href);url.searchParams.set('room',this.room);history.replaceState(null,'',url);
 }
 join(text){
  if(!this.available())return;
  const code=parseRoom(text);
  if(!code){this.open();this.status('Paste a valid invite link or room code');return}
  this.destroy();this.epoch++;const epoch=this.epoch;
  this.open();this.host=false;this.room=code;this.status('Connecting to host…');this.update();
  this.peer=new relay().Peer();
  this.bindPeer(this.peer,epoch);
  this.peer.on('open',()=>{
   if(epoch!==this.epoch)return;
   const c=this.peer.connect(code);
   this.attach(c,epoch);
  });
 }
 bindPeer(peer,epoch){
  peer.on('error',e=>{
   if(epoch!==this.epoch)return;
   const type=String(e?.type||'');
   this.status(type==='peer-unavailable'?'Room not found. Ask host to reopen it.':
    type==='room-full'?'Room full · two people maximum':
    type==='unavailable-id'?'Room already exists. Create a new one.':
    'Connection failed. Check the relay/network.');
   this.connected=false;this.onDisconnected(type||'error');
  });
  peer.on('disconnected',()=>{
   if(epoch!==this.epoch)return;
   this.status('Connection interrupted · reopen the room');
   this.connected=false;this.onDisconnected('disconnected');
  });
  if(this.host)peer.on('connection',c=>{
   if(epoch!==this.epoch)return;
   if(this.connection&&!this.connection.closed){this.connection.close()}
   this.attach(c,epoch);
  });
 }
 attach(c,epoch){
  this.connection=c;
  c.on('open',()=>{
   if(epoch!==this.epoch||this.connection!==c)return;
   this.connected=true;this.status('● Connected · '+(this.host?'friend joined':'joined room'));
   this.onConnected(this.role);
   if(!this.host)this.send({type:'hello',game:this.game,protocol:1});
  });
  c.on('data',data=>{
   if(epoch!==this.epoch||this.connection!==c)return;
   if(!data||typeof data!=='object'||Array.isArray(data))return;
   if(data.game&&data.game!==this.game)return;
   this.onMessage(data);
  });
  c.on('close',()=>{
   if(epoch!==this.epoch||this.connection!==c)return;
   this.connected=false;this.connection=null;
   this.status(this.host?'Friend left · invite stays active':'Host disconnected · reopen invite');
   this.onDisconnected('left');
  });
 }
 send(msg){
  if(!this.ready||!msg||typeof msg!=='object')return false;
  try{this.connection.send({...msg,game:this.game});return true}catch{
   this.status('Send failed · check connection');return false;
  }
 }
 async copy(){
  if(!this.active)return;
  try{
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(this.link.value);this.status('Invite link copied · share it');return}
  }catch{}
  this.link.focus();this.link.select();this.status('Select and copy invite link');
 }
 leave(){
  this.destroy();this.epoch++;this.room='';this.connected=false;this.host=false;
  this.update();this.status('Not connected');this.code.value='';
  const url=new URL(location.href);url.searchParams.delete('room');
  history.replaceState(null,'',url);
  this.onDisconnected('left');
 }
 destroy(){
  this.epoch++;
  const c=this.connection;this.connection=null;this.connected=false;
  const p=this.peer;this.peer=null;
  try{c?.close()}catch{}
  try{p?.destroy()}catch{}
 }
 tryInvite(){
  const code=parseRoom(new URLSearchParams(location.search).get('room'));
  if(code){this.open();this.code.value=code;this.join(code);return true}
  return false;
 }
}
window.CandyQuickRoom={create:options=>new QuickRoom(options),parseRoom};
})();