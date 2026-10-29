/* Trumpagotchi 2 Cartoon Beat Factory and Voice Remix Studio.
 * Original Web Audio cartoon rhythms; standalone existing voice samples.
 * Music uploads and generated patterns are processed entirely in this browser.
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
  const tracks = [
    {name:"🥁 Kick",kind:"kick"},
    {name:"🫧 Pop",kind:"pop"},
    {name:"🌀 Boing",kind:"boing"},
    {name:"📯 Honk",kind:"honk"}
  ];
  const styles = ["bouncy","chase","space","chaos"];
  let ctx=null, song=null, songName="", pattern=null, styleName="";
  let offset=0, playing=false, startedAt=0, source=null, musicGain=null;
  let activeSources=[], events=[], cache=new Map(), busy=false, scheduler=null, nextStep=0, lastHighlight=-1;
  const maxSeconds=180, maxBytes=30*1024*1024;
  const tempo=()=>Number($("remix-bpm").value);
  const bars=()=>Number($("cartoon-bars").value);
  const stepSeconds=()=>60/tempo()/4;
  const beatVolume=()=>Number($("cartoon-beat-volume").value)/100;
  const songVolume=()=>Number($("remix-music-volume").value)/100;
  const voiceVolume=()=>Number($("remix-voice-volume").value)/100;
  const duration=()=>song?.duration||(pattern?bars()*16*stepSeconds():0);
  const formatTime=t=>Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
  const status=(msg,err=false)=>{
    $("remix-status").textContent=msg;
    $("remix-status").dataset.error=err?"true":"false";
  };
  async function audioContext(){
    if(!ctx){
      const Constructor=window.AudioContext||window.webkitAudioContext;
      if(!Constructor)throw Error("This browser does not support the audio studio.");
      ctx=new Constructor();
    }
    if(ctx.state!=="running")await ctx.resume();
    return ctx;
  }
  const position=()=>playing?Math.min(duration(),offset+ctx.currentTime-startedAt):offset;
  function refresh(){
    const ready=!!(pattern||song),d=duration();
    $("remix-play").disabled=!ready||busy;
    $("remix-generate").disabled=!ready||busy;
    $("remix-export").disabled=!ready||busy;
    $("remix-clear").disabled=!events.length||busy;
    $("cartoon-randomize").disabled=busy;
    $("remix-play").textContent=playing?"⏸ Pause remix":"▶ Play remix";
    $("remix-count").textContent=events.length+" voice drop"+(events.length===1?"":"s");
    $("remix-clock").textContent=formatTime(position())+" / "+formatTime(d);
    $("remix-progress").value=d?Math.min(100,position()/d*100):0;
  }
  function remember(node){
    activeSources.push(node);
    node.onended=()=>{const i=activeSources.indexOf(node);if(i>=0)activeSources.splice(i,1);};
  }
  function highlight(step){
    if(step===lastHighlight)return;
    const cells=$("cartoon-step-grid").querySelectorAll(".cartoon-step");
    cells.forEach((cell)=>cell.classList.toggle("is-current",step>=0&&Number(cell.dataset.step)===step));
    lastHighlight=step;
  }
  function cleanPlayback(){
    if(scheduler){clearInterval(scheduler);scheduler=null;}
    if(source){try{source.stop();}catch{}try{source.disconnect();}catch{}source=null;}
    if(musicGain){try{musicGain.disconnect();}catch{}musicGain=null;}
    for(const node of activeSources){try{node.stop();}catch{}try{node.disconnect();}catch{}}
    activeSources=[];
    highlight(-1);
  }
  function pauseSong(){
    if(playing)offset=position();
    playing=false;
    cleanPlayback();
    refresh();
  }
  function rewindSong(){pauseSong();offset=0;refresh();}
  async function voiceClip(file){
    if(!pads.some(p=>p.file===file))throw Error("Voice recording not found.");
    if(!cache.has(file)){
      cache.set(file,(async()=>{
        const response=await fetch("/audio/trump/"+encodeURIComponent(file),{cache:"force-cache"});
        if(!response.ok)throw Error("Recording could not be loaded: "+file);
        const data=await response.arrayBuffer();
        const ac=await audioContext();
        return ac.decodeAudioData(data);
      })().catch(err=>{cache.delete(file);throw err;}));
    }
    return cache.get(file);
  }
  function playClip(ac,buffer,when,volume,destination,record=true){
    const node=ac.createBufferSource(),gain=ac.createGain();
    node.buffer=buffer;gain.gain.value=volume;
    node.connect(gain);gain.connect(destination);
    node.start(when);
    if(record)remember(node);
  }

  // All four percussive instruments are synthesized from oscillators; no samples,
  // copyrighted melodies, external audio services, or artificial spoken quotes.
  function synth(ac,kind,when,volume,destination,record=true){
    if(volume<=0)return;
    const oscillator=ac.createOscillator(),gain=ac.createGain();
    const t=Math.max(ac.currentTime||0,when),v=Math.max(.0001,volume);
    let length=.2;
    if(kind==="kick"){
      oscillator.type="sine";
      oscillator.frequency.setValueAtTime(150,t);
      oscillator.frequency.exponentialRampToValueAtTime(54,t+.17);
      length=.23;
    }else if(kind==="pop"){
      oscillator.type="triangle";
      oscillator.frequency.setValueAtTime(950,t);
      oscillator.frequency.exponentialRampToValueAtTime(190,t+.105);
      length=.12;
    }else if(kind==="boing"){
      oscillator.type="triangle";
      oscillator.frequency.setValueAtTime(185,t);
      oscillator.frequency.exponentialRampToValueAtTime(580,t+.085);
      oscillator.frequency.exponentialRampToValueAtTime(210,t+.34);
      length=.36;
    }else{
      oscillator.type="sawtooth";
      oscillator.frequency.setValueAtTime(340,t);
      oscillator.frequency.exponentialRampToValueAtTime(174,t+.23);
      length=.25;
    }
    const levels={kick:.50,pop:.16,boing:.22,honk:.12};
    const amount=v*(levels[kind]||.15);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.linearRampToValueAtTime(amount,t+.007);
    gain.gain.exponentialRampToValueAtTime(.0001,t+length);
    oscillator.connect(gain);gain.connect(destination);
    oscillator.start(t);oscillator.stop(t+length+.01);
    if(record)remember(oscillator);
  }
  function scheduleStep(ac,step,when,destination,record=true){
    if(!pattern)return;
    for(let i=0;i<tracks.length;i++){
      if(pattern[i][step])synth(ac,tracks[i].kind,when,beatVolume(),destination,record);
    }
  }
  function drawPattern(){
    const parent=$("cartoon-step-grid");
    parent.replaceChildren();
    tracks.forEach((track,row)=>{
      const group=document.createElement("div");
      group.className="cartoon-step-row";
      const label=document.createElement("span");
      label.className="cartoon-track-name";label.textContent=track.name;
      group.appendChild(label);
      for(let step=0;step<16;step++){
        const button=document.createElement("button");
        button.type="button";button.className="cartoon-step";
        button.dataset.step=String(step);
        button.setAttribute("aria-label",track.name+" · beat "+(step+1));
        button.setAttribute("aria-pressed",String(!!pattern?.[row][step]));
        button.classList.toggle("is-on",!!pattern?.[row][step]);
        button.title=track.name+" — step "+(step+1);
        button.addEventListener("click",async()=>{
          if(!pattern)pattern=tracks.map(()=>Array(16).fill(false));
          pattern[row][step]=!pattern[row][step];
          button.classList.toggle("is-on",pattern[row][step]);
          button.setAttribute("aria-pressed",String(pattern[row][step]));
          if(pattern[row][step]){
            try{const ac=await audioContext();synth(ac,track.kind,ac.currentTime,beatVolume(),ac.destination);}catch{}
          }
          status("Pattern edited! Press Play to hear it or Export WAV.");
          refresh();
        });
        group.appendChild(button);
      }
      parent.appendChild(group);
    });
    lastHighlight=-1;
  }
  function generatePattern(){
    rewindSong();
    const selected=$("cartoon-style").value;
    const style=selected==="random"?styles[Math.floor(Math.random()*styles.length)]:selected;
    const density={bouncy:[.98,.55,.22,.11],chase:[1,.75,.27,.23],space:[.64,.35,.49,.21],chaos:[.91,.64,.54,.48]}[style];
    pattern=tracks.map((track,row)=>Array.from({length:16},(_,i)=>{
      if(row===0){if(i%4===0)return true;return Math.random()<density[0]*.13;}
      if(row===1){if(i%4===2)return Math.random()<density[1];return Math.random()<density[1]*.27;}
      if(row===2){return Math.random()<density[2]*(i%2===0?1.35:.55);}
      return Math.random()<density[3]*(i%4===3?1.6:.6);
    }));
    styleName={bouncy:"🍭 Bouncy Candy",chase:"🏃 Silly Chase",space:"🛸 Space Goo",chaos:"🤪 Cartoon Chaos"}[style];
    $("cartoon-pattern-label").textContent=styleName+" · "+tempo()+" BPM";
    events=[];offset=0;drawPattern();refresh();
    status(styleName+" generated! Tap the lit squares to customize, then press Play Remix or Surprise Trump Drops.");
  }
  function schedulerTick(){
    if(!playing||!ctx)return;
    const now=ctx.currentTime,d=duration();
    if(position()>=d-.01){
      playing=false;offset=d;cleanPlayback();refresh();
      status("Cartoon remix complete! Replay, regenerate, or download the WAV.");
      return;
    }
    if(pattern){
      const stepLength=stepSeconds();
      while(nextStep*stepLength<d&&startedAt+(nextStep*stepLength-offset)<=now+.17){
        const when=startedAt+(nextStep*stepLength-offset);
        if(when>=now-.035)scheduleStep(ctx,nextStep%16,Math.max(when,now),ctx.destination);
        nextStep++;
      }
      const active=Math.floor(position()/stepLength)%16;
      highlight(active);
    }
    if(musicGain)musicGain.gain.value=songVolume();
    refresh();
  }
  async function playSong(){
    if(!song&&!pattern)return;
    if(playing){pauseSong();status("Paused. Your pattern and voice drops remain here.");return;}
    try{
      const ac=await audioContext();
      const d=duration();
      if(offset>=d-.02)offset=0;
      busy=true;refresh();
      const bank=new Map(await Promise.all([...new Set(events.map(e=>e.file))].map(async file=>[file,await voiceClip(file)])));
      startedAt=ac.currentTime+.06;
      if(song){
        source=ac.createBufferSource();musicGain=ac.createGain();
        source.buffer=song;musicGain.gain.value=songVolume();
        source.connect(musicGain);musicGain.connect(ac.destination);
        source.start(startedAt,Math.min(offset,song.duration-.01));
      }
      for(const event of events){
        const buffer=bank.get(event.file);
        if(event.at<offset||event.at>=d)continue;
        const when=startedAt+event.at-offset;
        playClip(ac,buffer,Math.max(when,ac.currentTime),voiceVolume(),ac.destination);
      }
      nextStep=Math.max(0,Math.floor(offset/stepSeconds()));
      playing=true;
      scheduler=setInterval(schedulerTick,40);
      busy=false;schedulerTick();refresh();
      status("Playing cartoon remix! Tap Trump phrase pads to add more drops.");
    }catch(error){
      busy=false;pauseSong();status(error.message||"Unable to play the remix.",true);
    }
  }
  async function addPhrase(file){
    try{
      const ac=await audioContext();
      const buffer=await voiceClip(file);
      const at=playing?Math.min(duration(),position()):null;
      if(at!==null&&at<duration()){
        events.push({at,file});events.sort((a,b)=>a.at-b.at);
      }
      playClip(ac,buffer,ac.currentTime,voiceVolume(),ac.destination);
      status(at===null?"Phrase previewed. Press Play Remix to place it in the pattern.":"Voice drop added at "+formatTime(at)+". Keep mixing!");
      refresh();
    }catch(error){status(error.message||"Recording unavailable.",true);}
  }
  async function loadSong(file){
    if(!file)return;
    if(file.size>maxBytes){status("Choose audio under 30 MB.",true);return;}
    if(file.type&&!file.type.startsWith("audio/")&&!/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)){
      status("Choose an audio file, not a document.",true);return;
    }
    pauseSong();busy=true;refresh();status("Loading the optional song on this device…");
    try{
      const ac=await audioContext();
      const decoded=await ac.decodeAudioData(await file.arrayBuffer());
      if(!decoded.duration||decoded.duration>maxSeconds)throw Error("Use an audio excerpt up to three minutes.");
      song=decoded;songName=file.name;offset=0;events=[];
      $("remix-filename").textContent=file.name+" · "+formatTime(song.duration);
      status("Song loaded! Generate a cartoon beat to layer over it or drop Trump phrases directly.");
    }catch(error){status(error.message||"Could not read this music file.",true);}
    finally{busy=false;refresh();}
  }
  async function autoRemix(){
    if(!pattern&&!song)return;
    pauseSong();offset=0;busy=true;refresh();
    status("Placing authentic Trump recordings along your cartoon beat…");
    try{
      const d=duration(),beat=60/tempo(),interval=8*beat;
      const next=[];
      let prior="";
      for(let i=0,at=2*beat;at<d-.2&&i<42;i++,at+=interval){
        const options=pads.filter(p=>p.file!==prior);
        const item=options[Math.floor(Math.random()*options.length)];
        prior=item.file;next.push({at,file:item.file});
      }
      await Promise.all([...new Set(next.map(e=>e.file))].map(voiceClip));
      events=next;
      status("Surprise remix ready! "+events.length+" complete voice clips on the beat. Press Play or Export WAV.");
    }catch(error){status(error.message||"Could not arrange the clips.",true);}
    finally{busy=false;refresh();}
  }
  function encodeWav(buffer){
    const channels=2,rate=buffer.sampleRate,length=buffer.length;
    const bytes=length*channels*2,arr=new ArrayBuffer(44+bytes),view=new DataView(arr);
    const write=(i,string)=>{for(let k=0;k<string.length;k++)view.setUint8(i+k,string.charCodeAt(k));};
    write(0,"RIFF");view.setUint32(4,36+bytes,true);write(8,"WAVE");
    write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);
    view.setUint16(22,channels,true);view.setUint32(24,rate,true);
    view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);
    view.setUint16(34,16,true);write(36,"data");view.setUint32(40,bytes,true);
    const l=buffer.getChannelData(0),r=buffer.numberOfChannels>1?buffer.getChannelData(1):l;
    let peak=0;
    for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(l[i]),Math.abs(r[i]));
    const scale=peak>.98?.98/peak:1;
    let n=44;
    for(let i=0;i<length;i++){
      const a=[l[i],r[i]];
      for(const sample of a){
        const value=Math.max(-1,Math.min(1,sample*scale));
        view.setInt16(n,value<0?value*32768:value*32767,true);n+=2;
      }
    }
    return new Blob([arr],{type:"audio/wav"});
  }
  async function exportRemix(){
    if((!pattern&&!song)||busy)return;
    pauseSong();busy=true;refresh();
    status("Rendering your original cartoon pattern and voice clips to WAV…");
    try{
      const d=duration(),rate=44100;
      if(!d||d>maxSeconds)throw Error("Keep the remix under three minutes.");
      const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      if(!Offline)throw Error("Offline audio export is not supported in this browser.");
      const offline=new Offline(2,Math.ceil(d*rate),rate);
      if(song){
        const node=offline.createBufferSource(),gain=offline.createGain();
        node.buffer=song;gain.gain.value=songVolume();
        node.connect(gain);gain.connect(offline.destination);node.start(0);
      }
      if(pattern){
        const stepLength=stepSeconds();
        for(let i=0,t=0;t<d&&i<Math.ceil(d/stepLength);i++,t=i*stepLength){
          scheduleStep(offline,i%16,t,offline.destination,false);
        }
      }
      const bank=new Map(await Promise.all([...new Set(events.map(e=>e.file))].map(async file=>[file,await voiceClip(file)])));
      for(const event of events){
        if(event.at<d)playClip(offline,bank.get(event.file),event.at,voiceVolume(),offline.destination,false);
      }
      const rendered=await offline.startRendering();
      const blob=encodeWav(rendered),url=URL.createObjectURL(blob),a=document.createElement("a");
      const name=(songName||"cartoon-beat").replace(/\.[^.]+$/,"").replace(/[^a-z0-9_-]+/gi,"-").slice(0,60)||"cartoon-beat";
      a.href=url;a.download=name+"-trumpagotchi-cartoon-remix.wav";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      status("Your cartoon remix WAV is ready! Nothing was uploaded.");
    }catch(error){status(error.message||"Export failed. Try a shorter pattern.",true);}
    finally{busy=false;refresh();}
  }

  const padArea=$("remix-pads");
  for(const item of pads){
    const button=document.createElement("button");
    button.type="button";button.className="remix-pad";
    button.textContent=item.emoji+" "+item.label;
    button.setAttribute("aria-label","Drop original Trump recording: "+item.label);
    button.addEventListener("click",()=>addPhrase(item.file));
    padArea.appendChild(button);
  }
  $("cartoon-randomize").addEventListener("click",generatePattern);
  $("cartoon-style").addEventListener("change",()=>{});
  $("cartoon-bars").addEventListener("change",()=>{if(playing)pauseSong();offset=0;refresh();});
  $("remix-file").addEventListener("change",e=>loadSong(e.target.files?.[0]));
  $("remix-play").addEventListener("click",playSong);
  $("remix-rewind").addEventListener("click",()=>{rewindSong();status("Rewound. Your cartoon beat and voice drops are preserved.");});
  $("remix-generate").addEventListener("click",autoRemix);
  $("remix-export").addEventListener("click",exportRemix);
  $("remix-clear").addEventListener("click",()=>{pauseSong();events=[];offset=0;status("Voice drops cleared. Your beat is still here.");refresh();});
  $("remix-music-volume").addEventListener("input",e=>{$("remix-music-value").textContent=e.target.value+"%";});
  $("remix-voice-volume").addEventListener("input",e=>{$("remix-voice-value").textContent=e.target.value+"%";});
  $("cartoon-beat-volume").addEventListener("input",e=>{$("cartoon-beat-value").textContent=e.target.value+"%";});
  $("remix-bpm").addEventListener("input",e=>{
    $("remix-bpm-value").textContent=e.target.value;
    if(playing){pauseSong();offset=0;status("Tempo changed. Press Play to hear the new speed.");}
    $("cartoon-pattern-label").textContent=(styleName||"Your pattern")+" · "+tempo()+" BPM";refresh();
  });
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&playing)pauseSong();});
  window.addEventListener("pagehide",()=>pauseSong());
  drawPattern();refresh();
})();