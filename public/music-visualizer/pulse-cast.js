/* Candy Pulse TV streaming: encrypted WebRTC audio+canvas video.
 * Uses only existing two-client Cloudflare WebSocket relay for SDP and ICE.
 * No recorded audio, uploaded media, user account or persistent server data.
 * This mode works in TV browsers supporting WebRTC, NOT in the Chromecast
 * default media receiver. For Chromecast, mirror Android's screen instead.
 */
(()=>{
'use strict';
const endpoint='wss://candy-casino-relay.patrick-christian-andrews.workers.dev';
const $=id=>document.getElementById(id);
const roomPrefix='rcl-casino-';
const bytes=()=>{const a=new Uint8Array(10);crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('')};
let socket=null,pc=null,stream=null,mediaDestination=null,iceQueue=[],channelOpen=false;
const status=(s)=>{const el=$('tv-status');if(el)el.textContent=s};
const send=(kind,payload)=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({t:'data',d:{type:'draw',kind,...payload}}));};
const cleanupPeer=()=>{
 if(pc){try{pc.close()}catch{}pc=null}
 iceQueue=[];
};
function stop(){
 cleanupPeer();
 if(socket){const s=socket;socket=null;s.onclose=null;try{s.close(1000,'TV session ended')}catch{}}
 if(stream){stream.getTracks().filter(t=>t.kind==='video').forEach(t=>t.stop());stream=null}
 if(mediaDestination){try{window.CandyPulseAudio?.analyser?.disconnect(mediaDestination)}catch{}mediaDestination=null}
 $('tv-start').hidden=false;$('tv-stop').hidden=true;
 $('tv-room').hidden=true;status('TV stream stopped.');
}
async function peerReady(){
 if(!window.RTCPeerConnection){status('Your browser does not support live TV streaming. Use screen mirroring.');return}
 cleanupPeer();
 try{
  const g=$('canvas');
  if(typeof g.captureStream!=='function')throw Error('Canvas capture unavailable. Try Chrome or use screen mirroring.');
  // Audio is shared via Web Audio without sending uploaded file bytes to a server.
  const audio=window.CandyPulseAudio?.ensureAudio?.();
  if(!audio)throw Error('Start the audio visualizer first, then select TV streaming.');
  await audio.resume();
  mediaDestination=audio.createMediaStreamDestination();
  window.CandyPulseAudio.analyser.connect(mediaDestination);
  stream=g.captureStream(24);
  const audioTracks=mediaDestination.stream.getAudioTracks();
  if(audioTracks.length)stream.addTrack(audioTracks[0]);
  pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
  for(const track of stream.getTracks())pc.addTrack(track,stream);
  pc.onicecandidate=event=>{if(event.candidate)send('ice',{candidate:event.candidate.toJSON()})};
  pc.onconnectionstatechange=()=>{
   if(pc?.connectionState==='connected')status('🟢 Video and music are streaming to the TV browser.');
   else if(pc?.connectionState==='failed')status('TV connection failed. Keep both devices on the same Wi-Fi or use Android screen mirroring.');
   else if(pc?.connectionState==='disconnected')status('TV connection interrupted. Reconnecting may require reopening the TV link.');
  };
  const offer=await pc.createOffer();await pc.setLocalDescription(offer);
  send('offer',{sdp:pc.localDescription.sdp});
  status('The TV joined. Negotiating the private video and audio stream…');
 }catch(e){status('TV stream unavailable: '+(e?.message||String(e))+' Use Android screen mirroring instead.');cleanupPeer()}
}
async function onMessage(event){
 let msg;try{msg=JSON.parse(event.data)}catch{return}
 if(msg.t==='host-ready')status('Room created. Open the TV link in a smart-TV browser.');
 if(msg.t==='peer-ready')await peerReady();
 if(msg.t==='peer-left'){cleanupPeer();status('TV disconnected. Your session remains open for another TV connection.')}
 if(msg.t!=='data'||msg.d?.type!=='draw')return;
 try{
  if(msg.d.kind==='answer'&&pc){
   await pc.setRemoteDescription({type:'answer',sdp:msg.d.sdp});
   for(const c of iceQueue)await pc.addIceCandidate(c);
   iceQueue=[];
  }else if(msg.d.kind==='ice'&&msg.d.candidate){
   if(pc?.remoteDescription)await pc.addIceCandidate(msg.d.candidate);else iceQueue.push(msg.d.candidate);
  }
 }catch(e){status('Could not establish the TV stream: '+(e?.message||'connection error'))}
}
function start(){
 if(!window.RTCPeerConnection||typeof $('canvas').captureStream!=='function'){
  status('This device cannot stream to a TV browser. Use Google Home → Cast my screen.');return;
 }
 stop();const token=bytes(),room=roomPrefix+token;
 const link=location.origin+'/music-visualizer/tv.html#'+token;
 $('tv-code').textContent=token.toUpperCase();
 $('tv-link').value=link;$('tv-room').hidden=false;
 $('tv-start').hidden=true;$('tv-stop').hidden=false;
 status('Open the link on your TV browser. The stream is private to whoever has the room code.');
 socket=new WebSocket(endpoint+'/room/'+room+'?role=host');
 socket.onmessage=onMessage;
 socket.onerror=()=>status('TV signaling connection failed. Use screen mirroring instead.');
 socket.onclose=()=>{if(socket)status('TV signaling disconnected. Choose Create TV room again.');cleanupPeer()};
}
const onReady=()=>{
 $('tv-start')?.addEventListener('click',start);
 $('tv-stop')?.addEventListener('click',stop);
 $('tv-copy')?.addEventListener('click',async()=>{
  const link=$('tv-link').value;try{await navigator.clipboard.writeText(link);status('TV link copied. Open it in a browser on the television.')}
  catch{$('tv-link').focus();$('tv-link').select();status('Select and copy the highlighted link.')}
 });
 $('tv-share')?.addEventListener('click',async()=>{const link=$('tv-link').value;if(navigator.share)try{await navigator.share({title:'Candy Pulse live TV stream',url:link})}catch{}else status('Use Copy TV link to share it to a TV with a web browser.')});
 window.addEventListener('pagehide',stop,{once:true});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady);else onReady();
window.CandyPulseTV=Object.freeze({stop});
})();