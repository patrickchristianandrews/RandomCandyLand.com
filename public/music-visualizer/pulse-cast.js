/* Candy Pulse TV Sync.
 * Phone streams a compact spectrum/control feed via the existing Cloudflare two-peer relay.
 * TV renders the original geometry locally rather than encoding/decoding canvas video.
 * If WebRTC audio is available, it uses a separate encrypted peer-to-peer audio-only link.
 * Uploaded file bytes are never sent to the relay. Pairing codes are ephemeral.
 */
(()=>{
'use strict';
const endpoint='wss://candy-casino-relay.patrick-christian-andrews.workers.dev';
const $=id=>document.getElementById(id);
const roomPrefix='rcl-casino-';
const token=()=>{const b=new Uint8Array(6);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');};
let socket=null,pc=null,mediaDestination=null,syncTimer=0,viewerReady=false,iceQueue=[],audioAttempted=false;
const status=s=>{const el=$('tv-status');if(el)el.textContent=s;};
function send(kind,payload){
 if(socket?.readyState!==WebSocket.OPEN)return;
 try{socket.send(JSON.stringify({t:'data',d:{type:'draw',kind,...payload}}));}catch{}
}
function closeAudio(){
 iceQueue=[];
 if(pc){try{pc.close();}catch{}pc=null;}
 if(mediaDestination){
  try{window.CandyPulseAudio?.analyser?.disconnect(mediaDestination);}catch{}
  mediaDestination=null;
 }
 audioAttempted=false;
}
function stop(){
 viewerReady=false;clearInterval(syncTimer);syncTimer=0;closeAudio();
 if(socket){const ws=socket;socket=null;ws.onclose=null;try{ws.close(1000,'TV sync ended');}catch{}}
 $('tv-start').hidden=false;$('tv-stop').hidden=true;$('tv-room').hidden=true;
 status('TV Sync stopped. Create a new room when ready.');
}
const shrink=(arr,count)=>{
 const out=[];
 if(!arr?.length)return out;
 for(let i=0;i<count;i++){
  const start=Math.floor(i*arr.length/count),end=Math.max(start+1,Math.floor((i+1)*arr.length/count));
  let total=0;
  for(let j=start;j<end;j++)total+=arr[j]||0;
  out.push(Math.round(total/(end-start)));
 }
 return out;
};
function emitSpectrum(){
 if(!viewerReady)return;
 const frame=window.CandyPulseCastFrame;
 if(!frame)return;
 send('sync',{
  time:Math.round(frame.time*1000)/1000,
  mode:frame.mode,cols:frame.cols,
  active:frame.active,reduced:frame.reduced,
  bands:shrink(frame.data,80),
  wave:shrink(frame.wave,128),
  sensitivity:+$('sensitivity').value,
  glow:+$('glow').value,
  symmetry:+$('symmetry').value,
  density:+$('density').value,
  trails:+$('trails').value,
  speed:+$('speed').value
 });
}
async function beginAudio(){
 // A failed WebRTC audio handshake must never block the low-bandwidth visual feed.
 if(audioAttempted||!window.RTCPeerConnection)return;
 audioAttempted=true;closeAudio();audioAttempted=true;
 try{
  const ctx=window.CandyPulseAudio?.ensureAudio?.();
  if(!ctx)throw Error('Audio unavailable');
  if(ctx.state!=='running')await ctx.resume();
  mediaDestination=ctx.createMediaStreamDestination();
  window.CandyPulseAudio.analyser.connect(mediaDestination);
  const stream=mediaDestination.stream;
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
  for(const track of stream.getAudioTracks())pc.addTrack(track,stream);
  pc.onicecandidate=e=>{if(e.candidate)send('ice',{candidate:e.candidate.toJSON()});};
  pc.onconnectionstatechange=()=>{
   if(pc?.connectionState==='connected')status('🟢 TV visuals live · audio connected.');
   if(pc?.connectionState==='failed')status('🟢 TV visuals live. TV audio could not connect; keep sound on your phone.');
  };
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);
  send('offer',{sdp:pc.localDescription.sdp});
 }catch(e){
  closeAudio();audioAttempted=true;
  status('🟢 TV visuals live. TV audio unavailable — use your phone or screen mirroring for sound.');
 }
}
async function receive(event){
 let msg;try{msg=JSON.parse(event.data)}catch{return}
 if(msg.t==='host-ready'){status('Room is ready. Enter the code in your TV browser.');return}
 if(msg.t==='peer-ready'){
  viewerReady=true;emitSpectrum();
  status('🟢 TV Sync connected. Visuals stream as lightweight spectrum data.');
  beginAudio();return;
 }
 if(msg.t==='peer-left'){
  viewerReady=false;closeAudio();status('TV left the room. Re-enter the code on your television.');return;
 }
 if(msg.t!=='data'||msg.d?.type!=='draw')return;
 try{
  if(msg.d.kind==='answer'&&pc){
    await pc.setRemoteDescription({type:'answer',sdp:msg.d.sdp});
    for(const c of iceQueue)await pc.addIceCandidate(c);
    iceQueue=[];
  }else if(msg.d.kind==='ice'&&msg.d.candidate){
    if(pc?.remoteDescription)await pc.addIceCandidate(msg.d.candidate);
    else iceQueue.push(msg.d.candidate);
  }else if(msg.d.kind==='ready'){
    viewerReady=true;emitSpectrum();
  }
 }catch{status('TV visuals continue; audio pairing could not complete.');}
}
function start(){
 stop();
 if(!window.WebSocket||!window.crypto?.getRandomValues){
  status('This browser cannot establish a secure TV room. Use Android screen mirroring.');return;
 }
 const secret=token(),room=roomPrefix+secret;
 $('tv-code').textContent=secret.toUpperCase();
 $('tv-link').value=location.origin+'/music-visualizer/tv.html#'+secret;
 $('tv-room').hidden=false;$('tv-start').hidden=true;$('tv-stop').hidden=false;
 status('Opening TV room…');
 try{
  const ws=new WebSocket(endpoint+'/room/'+room+'?role=host');
  socket=ws;
  ws.onmessage=receive;
  ws.onerror=()=>status('Cannot reach TV sync relay. Check connectivity or use screen mirroring.');
  ws.onclose=()=>{if(socket===ws){viewerReady=false;clearInterval(syncTimer);syncTimer=0;closeAudio();status('TV room disconnected. Create another room to retry.');}};
  syncTimer=setInterval(emitSpectrum,85);
 }catch(e){stop();status('Could not open a TV room. Use Android screen mirroring.');}
}
const ready=()=>{
 $('tv-start')?.addEventListener('click',start);
 $('tv-stop')?.addEventListener('click',stop);
 $('tv-copy')?.addEventListener('click',async()=>{
  const url=$('tv-link').value;
  try{await navigator.clipboard.writeText(url);status('TV link copied. Open it in the TV browser.');}
  catch{$('tv-link').focus();$('tv-link').select();status('Copy the selected TV link.');}
 });
 $('tv-share')?.addEventListener('click',async()=>{
  const url=$('tv-link').value;
  if(navigator.share)try{await navigator.share({title:'Candy Pulse TV Sync',url});}catch{}
  else status('Use Copy TV link to share it to a smart-TV browser.');
 });
 window.addEventListener('pagehide',stop,{once:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);
else ready();
window.CandyPulseTV=Object.freeze({stop});
})();