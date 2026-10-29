/* Trumpagotchi 2 Remix Studio — browser-only Web Audio mixing.
 * The user owns/authorizes any music they load. Voice samples are separate originals.
 * Nothing is sent to any server: no uploaded songs, keys, accounts or analytics.
 */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const pads = [
    {label:"Bing bong!",file:"bingbong.mp3",emoji:"🔔"},
    {label:"Phenomenal",file:"phenomenal.mp3",emoji:"🌟"},
    {label:"Wrong!",file:"wrong.mp3",emoji:"❌"},
    {label:"So amazing",file:"so_amazing.mp3",emoji:"✨"},
    {label:"I'm really rich",file:"im_really_rich.mp3",emoji:"💰"},
    {label:"China",file:"china.mp3",emoji:"🌏"},
    {label:"Big league",file:"bigleague.mp3",emoji:"🏆"},
    {label:"What's going on?",file:"whats_going_on.mp3",emoji:"❓"},
    {label:"We're going to win",file:"maybe_winning.mp3",emoji:"🎉"},
    {label:"Believe it or not",file:"believe_it_or_not.mp3",emoji:"🎙️"},
    {label:"Golf",file:"golf.mp3",emoji:"⛳"},
    {label:"It's tremendous",file:"better_than_ever_before.mp3",emoji:"🚀"}
  ];
  let ctx=null, song=null, songName="", playing=false, startedAt=0, offset=0, source=null;
  let activeSources=[], events=[], cache=new Map(), busy=false;
  const maxSeconds=180, maxBytes=30*1024*1024;
  const status = (message,isError=false) => {
    const el=$("remix-status"); if(!el)return;
    el.textContent=message;el.dataset.error=isError?"true":"false";
  };
  const getAudioContext=async () => {
    if(!ctx) {
      const Constructor=window.AudioContext||window.webkitAudioContext;
      if(!Constructor)throw Error("Audio mixing is not supported in this browser.");
      ctx=new Constructor();
    }
    if(ctx.state!=="running")await ctx.resume();
    return ctx;
  };
  const musicVolume=()=>Number($("remix-music-volume").value)/100;
  const voiceVolume=()=>Number($("remix-voice-volume").value)/100;
  const tempo=()=>Number($("remix-bpm").value);
  const formatTime=t=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
  const currentPosition=()=>playing?Math.min(song.duration,offset+ctx.currentTime-startedAt):offset;
  const updateControls=()=>{
    $("remix-play").disabled=!song||busy;
    $("remix-generate").disabled=!song||busy;
    $("remix-export").disabled=!song||!events.length||busy;
    $("remix-clear").disabled=!events.length||busy;
    $("remix-play").textContent=playing?"⏸ Pause song":"▶ Play song";
    $("remix-count").textContent=events.length+" voice drop"+(events.length===1?"":"s");
    $("remix-clock").textContent=formatTime(currentPosition())+" / "+formatTime(song?.duration||0);
    const p=$("remix-progress");
    p.value=song?Math.min(100,100*currentPosition()/song.duration):0;
  };
  function clearPlayingNodes() {
    if(source) {try{source.onended=null;source.stop();}catch{} source.disconnect();source=null;}
    for(const node of activeSources) {try{node.stop();}catch{}try{node.disconnect();}catch{}}
    activeSources=[];
  }
  function pauseSong() {
    if(playing)offset=currentPosition();
    playing=false;
    clearPlayingNodes();
    updateControls();
  }
  function rewindSong(){
    pauseSong();offset=0;updateControls();
  }
  const clip=async file=>{
    if(!pads.some(p=>p.file===file))throw Error("Unknown voice clip.");
    if(!cache.has(file)){
      cache.set(file,(async()=>{
        const response=await fetch("/audio/trump/"+encodeURIComponent(file),{cache:"force-cache"});
        if(!response.ok||!response.headers.get("content-type")?.includes("audio")) {
          // Some static hosts serve MPEG files as application/octet-stream.
          if(!response.ok)throw Error("Clip unavailable: "+file);
        }
        const bytes=await response.arrayBuffer();
        const ac=await getAudioContext();
        return ac.decodeAudioData(bytes);
      })().catch(e=>{cache.delete(file);throw e;}));
    }
    return cache.get(file);
  };
  function startVoice(buffer,when,volume,dest,track=true) {
    const node=(dest.context||ctx).createBufferSource();
    const gain=(dest.context||ctx).createGain();
    node.buffer=buffer;
    gain.gain.value=volume;
    node.connect(gain).connect(dest);
    node.start(when);
    if(track){
      activeSources.push(node);
      node.onended=()=>{const i=activeSources.indexOf(node);if(i>=0)activeSources.splice(i,1);};
    }
    return node;
  }
  async function addPhrase(file) {
    try {
      const ac=await getAudioContext();
      const audio=await clip(file);
      const at=playing?Math.max(0,Math.min(song.duration,currentPosition())):null;
      if(playing&&at<song.duration){
        events.push({at,file});
        events.sort((a,b)=>a.at-b.at);
      }
      startVoice(audio,ac.currentTime,voiceVolume(),ac.destination);
      status(at===null?"Phrase previewed. Start the song to record your drops.":"Voice drop added at "+formatTime(at)+". Keep tapping to build your remix.");
      updateControls();
    }catch(error){status(error.message||"Couldn't play this voice clip.",true);}
  }
  async function playSong() {
    if(!song)return;
    if(playing){pauseSong();status("Paused. Your drops are saved in this tab.");return;}
    try {
      const ac=await getAudioContext();
      if(offset>=song.duration-.05)offset=0;
      const node=ac.createBufferSource(),gain=ac.createGain();
      node.buffer=song;gain.gain.value=musicVolume();
      node.connect(gain).connect(ac.destination);
      node.onended=()=>{
        if(source!==node)return;
        playing=false;offset=song.duration;source=null;
        clearPlayingNodes();updateControls();
        status("End of song. Replay or export your remix.");
      };
      source=node;startedAt=ac.currentTime;
      node.start(startedAt,offset);
      playing=true;
      // Replay previously placed drops only when passing their locations.
      for(const event of events){
        if(event.at+0.02<offset)continue;
        const buffer=await clip(event.file);
        if(!playing||source!==node)break;
        const when=startedAt+(event.at-offset);
        if(when+buffer.duration<ac.currentTime)continue;
        startVoice(buffer,Math.max(ac.currentTime,when),voiceVolume(),ac.destination);
      }
      status("Playing! Tap the Trump phrase buttons to place new drops on the track.");
      updateControls();
    }catch(error){pauseSong();status(error.message||"Song could not play.",true);}
  }
  async function loadSong(file){
    if(!file)return;
    if(file.size>maxBytes){status("Choose an audio file under 30 MB.",true);return;}
    if(file.type&&!file.type.startsWith("audio/")&&!/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)){
      status("Please choose an audio file (MP3, WAV, M4A, AAC or OGG).",true);return;
    }
    pauseSong();busy=true;updateControls();status("Loading your song on this device…");
    try{
      const ac=await getAudioContext();
      const audio=await ac.decodeAudioData(await file.arrayBuffer());
      if(!Number.isFinite(audio.duration)||audio.duration<=0||audio.duration>maxSeconds) {
        throw Error("Use a song or excerpt up to 3 minutes long for mobile-friendly remix exports.");
      }
      song=audio;songName=file.name;offset=0;events=[];
      $("remix-filename").textContent=file.name+" · "+formatTime(song.duration);
      status("Loaded! Press Play, then tap voice pads. Or use Auto Remix.");
    }catch(error){status(error.message||"Your browser couldn't read this audio file.",true);}
    finally{busy=false;updateControls();}
  }
  async function autoRemix(){
    if(!song)return;
    pauseSong();offset=0;busy=true;updateControls();
    status("Building a beat-timed remix…");
    try{
      const beat=60/tempo();
      const step=4*beat; // One musical phrase per bar, keeping the recording intelligible.
      const next=[];
      let previousFile=null;
      for(let i=0,at=2*beat;at<song.duration-.25&&i<64;i++,at+=step){
        const choices=pads.filter(p=>p.file!==previousFile);
        const choice=choices[Math.floor(Math.random()*choices.length)];
        previousFile=choice.file;
        next.push({at,file:choice.file});
      }
      await Promise.all([...new Set(next.map(e=>e.file))].map(clip));
      events=next;
      status("Auto Remix ready: "+events.length+" original voice drops, placed around "+tempo()+" BPM. Press Play to hear it or export.");
    }catch(error){status(error.message||"Couldn't prepare the remix.",true);}
    finally{busy=false;updateControls();}
  }
  function encodeWav(buffer){
    const rate=buffer.sampleRate;
    const length=buffer.length, channels=2, bytes=length*channels*2;
    const array=new ArrayBuffer(44+bytes),view=new DataView(array);
    const write=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
    write(0,"RIFF");view.setUint32(4,36+bytes,true);write(8,"WAVE");
    write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);
    view.setUint16(22,channels,true);view.setUint32(24,rate,true);
    view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);
    view.setUint16(34,16,true);write(36,"data");view.setUint32(40,bytes,true);
    const left=buffer.getChannelData(0),right=buffer.numberOfChannels>1?buffer.getChannelData(1):left;
    let peak=0;
    for(let i=0;i<length;i++){const a=Math.abs(left[i]),b=Math.abs(right[i]);if(a>peak)peak=a;if(b>peak)peak=b;}
    const scale=peak>0.97?0.97/peak:1;
    let index=44;
    for(let i=0;i<length;i++){
      for(const value of [left[i],right[i]]){
        const v=Math.max(-1,Math.min(1,value*scale));
        view.setInt16(index,v<0?v*32768:v*32767,true);index+=2;
      }
    }
    return new Blob([array],{type:"audio/wav"});
  }
  async function exportRemix(){
    if(!song||!events.length||busy)return;
    pauseSong();busy=true;updateControls();status("Mixing your song and the full original recordings into a WAV…");
    try{
      const rate=song.sampleRate, frames=Math.ceil(song.duration*rate);
      const offline=new OfflineAudioContext(2,frames,rate);
      const songSrc=offline.createBufferSource(),musicGain=offline.createGain();
      songSrc.buffer=song;musicGain.gain.value=musicVolume();
      songSrc.connect(musicGain).connect(offline.destination);songSrc.start(0);
      const buffers=await Promise.all([...new Set(events.map(e=>e.file))].map(async f=>[f,await clip(f)]));
      const bank=new Map(buffers);
      for(const event of events){
        if(event.at>=song.duration)continue;
        startVoice(bank.get(event.file),event.at,voiceVolume(),offline.destination,false);
      }
      const mix=await offline.startRendering();
      const blob=encodeWav(mix);
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      const base=(songName||"song").replace(/\.[^.]+$/,"").replace(/[^a-z0-9_-]+/gi,"-").slice(0,70);
      a.href=url;a.download=(base||"song")+"-trumpagotchi-remix.wav";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      status("Remix saved as WAV. Your source music never left this device.");
    }catch(error){status(error.message||"Could not export. Try a shorter song.",true);}
    finally{busy=false;updateControls();}
  }
  const padContainer=$("remix-pads");
  for(const item of pads){
    const button=document.createElement("button");
    button.type="button";button.className="remix-pad";
    button.textContent=item.emoji+" "+item.label;
    button.setAttribute("aria-label","Drop original Trump recording: "+item.label);
    button.addEventListener("click",()=>addPhrase(item.file));
    padContainer.appendChild(button);
  }
  $("remix-file").addEventListener("change",event=>loadSong(event.target.files?.[0]));
  $("remix-play").addEventListener("click",playSong);
  $("remix-rewind").addEventListener("click",()=>{rewindSong();status("Rewound. Your existing drops are preserved.");});
  $("remix-generate").addEventListener("click",autoRemix);
  $("remix-export").addEventListener("click",exportRemix);
  $("remix-clear").addEventListener("click",()=>{pauseSong();events=[];offset=0;status("Voice drops cleared. Your song is still loaded.");updateControls();});
  $("remix-music-volume").addEventListener("input",e=>{$("remix-music-value").textContent=e.target.value+"%";});
  $("remix-voice-volume").addEventListener("input",e=>{$("remix-voice-value").textContent=e.target.value+"%";});
  $("remix-bpm").addEventListener("input",e=>{$("remix-bpm-value").textContent=e.target.value;});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&playing)pauseSong();});
  window.addEventListener("pagehide",()=>{pauseSong();});
  setInterval(()=>{if(playing)updateControls();},300);
  updateControls();
})();