/* Candy Land Casino: all games are head-to-head, with Candybot or one invited
 * remote player. Poker is genuine five-card draw, with hidden hands until
 * showdown. Free fictional chips only; no bets, prizes, payments or deposits.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.CandyPoker;
if(!P)throw Error('Poker rules missing');
const rand=P.random,rank=n=>({11:'J',12:'Q',13:'K',14:'A'}[n]||String(n)),face=c=>rank(c.rank)+c.suit;
const sanitize=s=>String(s||'Candy Captain').replace(/[<>\r\n]/g,'').trim().slice(0,22)||'Candy Captain';
const labels={poker:['WELCOME TO THE POKER PALACE','🃏 Sugar Rush Poker','Five-card draw: both players receive five cards, choose up to three to swap, then compare hands.'],card:['THE CANDY CROWN DRAW','👑 High Card Clash','Each player draws a card. Highest rank wins.'],dice:['THE GUMMY BATTLE','🎲 Gummy Dice Duel','Each player rolls two dice. Highest total wins.']};
const me=()=>host?0:1,them=()=>1-me(),playing=()=>mode==='computer'||online;
const saveKey='candyland-casino-chips-v1',winKey='candyland-casino-victories-v2';
let chips=Number(localStorage.getItem(saveKey)),victories=Number(localStorage.getItem(winKey));
if(!Number.isFinite(chips)||chips<0)chips=1000;
if(!Number.isFinite(victories)||victories<0)victories=0;
function save(){try{localStorage.setItem(saveKey,String(chips));localStorage.setItem(winKey,String(victories));}catch{}$('balance').textContent=chips.toLocaleString();$('best').textContent=victories.toLocaleString();}
save();
let mode='computer',duel='poker',host=true,online=false,peer=null,connection=null,loading=null,roomId='';
let players=[sanitize($('friend-name').value),'Candybot'],round=0,scores=[0,0],readies=[false,false],stage='ready',result='',winner=-1,match=crypto.randomUUID(),awarded='';
let hands=[null,null],shoe=[],draws=[null,null],selected=new Set();
const status=s=>$('duel-status').textContent=s,onlineStatus=s=>$('connection-status').textContent=s;
const send=msg=>{if(connection?.open)try{connection.send(msg)}catch{}};
function reset(){round=0;scores=[0,0];readies=[false,false];stage='ready';result='';winner=-1;match=crypto.randomUUID();hands=[null,null];shoe=[];draws=[null,null];selected.clear();}
function transmit(){
 if(!host||!connection?.open)return;
 const state={type:'state',duel,players,match,round,scores,readies,stage,result,winner};
 if(duel==='poker'){
  if(stage==='draw')state.guestHand=hands[1];
  if(stage==='result')state.revealedHands=hands;
  state.guestDrew=draws[1]!==null;state.hostDrew=draws[0]!==null;
 }
 send(state);
}
function award(){
 if(stage!=='result')return;
 const key=match+':'+round;if(awarded===key)return;awarded=key;
 if(winner===me()){chips+=50;victories++;save();}
}
function cards(container,hand,conceal){
 container.replaceChildren();
 for(let i=0;i<5;i++){
  const c=hand?.[i],button=document.createElement('button');button.type='button';
  button.className='candy-card poker-card'+(conceal?' back':'')+(c&&['♥','♦'].includes(c.suit)?' red':'');
  button.textContent=conceal||!c?'🍭':face(c);
  if(!conceal&&stage==='draw'&&draws[me()]===null&&c){
   button.classList.toggle('held-for-swap',selected.has(i));
   button.setAttribute('aria-pressed',String(selected.has(i)));
   button.setAttribute('aria-label',(selected.has(i)?'Swap ':'Keep ')+face(c));
   button.onclick=()=>{if(selected.has(i))selected.delete(i);else if(selected.size<3)selected.add(i);render();};
  }else{button.disabled=true;button.setAttribute('aria-label',conceal?'Hidden opponent card':'Card '+(c?face(c):'unavailable'));}
  container.append(button);
 }
}
function render(){
 for(const b of document.querySelectorAll('[data-duel]')){let on=b.dataset.duel===duel;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}
 for(const b of document.querySelectorAll('[data-opponent]')){let on=b.dataset.opponent===mode;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}
 const [k,title,description]=labels[duel];$('game-kicker').textContent=k;$('game-title').textContent=title;$('duel-description').textContent=description;
 $('self-name').textContent=players[me()];$('opponent-name').textContent=players[them()];
 $('self-score').textContent=scores[me()];$('other-score').textContent=scores[them()];
 const drawing=stage==='draw',final=stage==='result'&&round>=5;
 $('poker-table').hidden=duel!=='poker'||!['draw','result'].includes(stage);
 if(!$('poker-table').hidden){
  cards($('poker-own-cards'),hands[me()],false);cards($('poker-opponent-cards'),hands[them()],stage!=='result');
  $('poker-opponent-tip').textContent=stage==='result'?'Opponent held '+P.title(hands[them()]):'Hidden until both players finish their draw.';
  $('poker-hand-tip').textContent=drawing?'Tap up to three cards to replace.':'You held '+P.title(hands[me()]);
  $('poker-stage-label').textContent=drawing?'CHOOSE CARDS TO SWAP':'SHOWDOWN: '+P.title(hands[me()])+' VS '+P.title(hands[them()]);
 }
 $('duel-display').textContent=result||(drawing?'🃏 Choose up to three cards to swap.':playing()?'🍭 '+players[them()]+' is ready to compete!':'🌍 Connect to a remote friend or switch to Candybot.');
 $('my-ready').textContent=drawing?(draws[me()]===null?'🍭 You: picking cards':'🍭 You: draw locked'):(readies[me()]?'🍭 You: READY':'🍭 You: waiting');
 $('their-ready').textContent=drawing?(draws[them()]===null?'🍬 Opponent: picking cards':'🍬 Opponent: draw locked'):(readies[them()]?'🍬 Opponent: READY':'🍬 Opponent: waiting');
 $('duel-ready').hidden=drawing;
 $('duel-ready').disabled=!playing()||readies[me()]||final;
 $('duel-ready').textContent=final?'🏆 MATCH COMPLETE':readies[me()]?'⏳ WAITING FOR OPPONENT':duel==='poker'?'🃏 DEAL POKER CARDS · ROUND '+(round+1):'🍬 PLAY ROUND '+(round+1)+' / 5';
 $('poker-draw').hidden=duel!=='poker'||!drawing;
 $('poker-draw').disabled=!playing()||draws[me()]!==null;
 $('poker-draw').textContent=draws[me()]===null?'♻️ DRAW SELECTED CARDS ('+selected.size+'/3)':'⏳ WAITING FOR OPPONENT';
 $('duel-reset').disabled=mode==='friend'&&!online;
 status(!playing()?'Create or join a room, or play Candybot.':final?'🏆 Five-round match complete. '+(scores[me()]===scores[them()]?'A tie!':scores[me()]>scores[them()]?'You won!':'Your rival won!'):
 drawing?(draws[me()]!==null?'Waiting for your rival to draw.':'Select up to three cards and tap Draw.'):
 'Round '+Math.min(round+1,5)+' of 5 · '+(readies[me()]?'Waiting for your rival.':'Tap Ready to play.'));
 award();
}
function finish(text,win){
 winner=win;if(win>=0)scores[win]++;
 round++;stage='result';readies=[false,false];result=text+(win<0?' · 🍭 TIE!':' · 🏆 '+players[win]+' WINS!');
 if(round===5)result+=' · MATCH FINISHED';
 render();transmit();
}
function resolvePoker(){
 if(!draws.every(x=>x!==null)||stage!=='draw')return;
 for(let who=0;who<2;who++)for(const index of draws[who])hands[who][index]=shoe.pop();
 const cmp=P.compare(hands[0],hands[1]);
 finish('🃏 '+players[0]+': '+P.title(hands[0])+' · '+players[1]+': '+P.title(hands[1]),cmp>0?0:cmp<0?1:-1);
}
function commitDraw(slot,indices){
 if(stage!=='draw'||draws[slot]!==null||!Array.isArray(indices)||indices.length>3||
 !indices.every(Number.isInteger)||indices.some(n=>n<0||n>4)||new Set(indices).size!==indices.length)return;
 draws[slot]=indices.slice();if(slot===me())selected.clear();
 if(draws.every(x=>x!==null))resolvePoker();else{render();transmit();}
}
function deal(){
 if(!host||!playing()||stage==='draw'||round>=5||!readies.every(Boolean))return;
 readies=[false,false];
 if(duel==='poker'){
  shoe=P.deck();hands=[shoe.splice(0,5),shoe.splice(0,5)];draws=[null,null];selected.clear();stage='draw';
  result='🃏 Five cards each. Select up to three to replace!';
  if(mode==='computer')commitDraw(1,P.computerDiscards(hands[1]));
  render();transmit();
 }else if(duel==='card'){
  const a=2+rand(13),b=2+rand(13);
  finish('👑 '+players[0]+' drew '+rank(a)+' · '+players[1]+' drew '+rank(b),a>b?0:b>a?1:-1);
 }else{
  const a=rand(6)+rand(6)+2,b=rand(6)+rand(6)+2;
  finish('🎲 '+players[0]+' rolled '+a+' · '+players[1]+' rolled '+b,a>b?0:b>a?1:-1);
 }
}
function ready(){
 if(!playing()||stage==='draw'||round>=5||readies[me()])return;
 readies[me()]=true;if(mode==='computer')readies[1]=true;
 if(host)deal();else send({type:'ready'});
 render();transmit();
}
function draw(){
 if(stage!=='draw'||draws[me()]!==null)return;
 const indices=[...selected].sort((a,b)=>a-b);
 if(host)commitDraw(0,indices);
 else{draws[1]=indices;send({type:'draw',indices});render();}
}
function newMatch(){if(mode==='friend'&&!host&&online){send({type:'reset'});status('Requesting a new match from the host.');return;}reset();render();transmit();}
function chooseGame(next){
 if(!labels[next]||next===duel)return;
 if(mode==='friend'&&!host&&online){status('The host must choose the game for this online room.');return;}
 duel=next;newMatch();
}
function leave(text='Online room closed.'){
 const old=connection;connection=null;const p=peer;peer=null;
 try{old?.close()}catch{}try{p?.destroy()}catch{}
 online=false;roomId='';$('invite-panel').hidden=true;$('leave-room').hidden=true;
 const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);
 onlineStatus('🔌 '+text);
}
function setMode(next){
 if(next==='computer'){
  leave('Candybot is your opponent.');mode='computer';host=true;players=[sanitize($('friend-name').value),'Candybot'];$('remote-controls').hidden=true;
 }else{
  mode='friend';host=true;players=[sanitize($('friend-name').value),'Waiting...'];$('remote-controls').hidden=false;
 }
 reset();render();
}
function connect(c){
 connection=c;
 c.on('open',()=>{
  online=true;$('leave-room').hidden=false;
  if(host){players[0]=sanitize($('friend-name').value);send({type:'hello',name:players[0]});transmit();}
  else {players[1]=sanitize($('friend-name').value);send({type:'hello',name:players[1]});}
  onlineStatus('🟢 Connected! Choose a game and play.');render();
 });
 c.on('data',msg=>{
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='hello'){players[host?1:0]=sanitize(msg.name);render();if(host)transmit();return;}
  if(msg.type==='ready'&&host&&stage!=='draw'){readies[1]=true;deal();render();transmit();return;}
  if(msg.type==='draw'&&host){commitDraw(1,msg.indices);return;}
  if(msg.type==='reset'&&host){newMatch();return;}
  if(msg.type==='state'&&!host){
   if(!labels[msg.duel]||!Array.isArray(msg.scores)||msg.scores.length!==2||!Array.isArray(msg.readies)||msg.readies.length!==2||!['ready','draw','result'].includes(msg.stage))return;
   if(match!==msg.match||stage!==msg.stage)selected.clear();
   match=String(msg.match||'').slice(0,70);duel=msg.duel;
   players=Array.isArray(msg.players)&&msg.players.length===2?msg.players.map(sanitize):players;
   round=Math.max(0,Math.min(5,Number(msg.round)||0));scores=msg.scores.map(n=>Math.max(0,Math.min(5,Number(n)||0)));
   readies=msg.readies.map(Boolean);stage=msg.stage;result=String(msg.result||'').slice(0,370);
   winner=[-1,0,1].includes(msg.winner)?msg.winner:-1;
   if(duel==='poker'){
    if(stage==='draw'&&P.valid(msg.guestHand)){
     hands=[null,msg.guestHand];draws=[msg.hostDrew?[]:null,msg.guestDrew?[]:null];
    }else if(stage==='result'&&Array.isArray(msg.revealedHands)&&msg.revealedHands.length===2&&msg.revealedHands.every(P.valid)){
     hands=msg.revealedHands;draws=[[],[]];
    }else{hands=[null,null];draws=[null,null];}
   }
   render();
  }
 });
 c.on('close',()=>{if(connection!==c)return;online=false;connection=null;onlineStatus('⚠️ Opponent disconnected. Rejoin or use Candybot.');render();});
 c.on('error',()=>onlineStatus('⚠️ Connection could not be established. Try Candybot or another network.'));
}
function loadPeer(){
 if(typeof window.Peer==='function')return Promise.resolve();
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';script.async=true;script.crossOrigin='anonymous';
  script.onload=()=>typeof window.Peer==='function'?resolve():reject(Error('PeerJS failed'));
  script.onerror=()=>reject(Error('PeerJS unavailable'));document.head.append(script);
 }).catch(error=>{loading=null;throw error});
 return loading;
}
function roomCode(raw){let s=String(raw||'').trim();try{s=new URL(s,location.href).searchParams.get('room')||s;}catch{}return s.replace(/[^a-zA-Z0-9-]/g,'').slice(0,100);}
async function createRoom(){
 setMode('friend');onlineStatus('🟡 Opening your candy room...');
 try{await loadPeer();}catch{onlineStatus('⚠️ Remote rooms unavailable. Candybot is always ready.');return;}
 leave('Creating a new room.');mode='friend';host=true;players=[sanitize($('friend-name').value),'Waiting...'];
 roomId='rcl-casino-'+crypto.randomUUID().replace(/-/g,'').slice(0,20);
 try{
  peer=new window.Peer(roomId,{debug:0});
  peer.on('open',id=>{
   roomId=id;const url=new URL(location.href);url.searchParams.set('room',id);
   $('invite-link').value=url.href;$('room-input').value=id;$('invite-panel').hidden=false;$('leave-room').hidden=false;
   onlineStatus('🟡 Room created! Send the invitation link to your friend.');render();
  });
  peer.on('connection',c=>{if(connection?.open){c.on('open',()=>{c.send({type:'full'});c.close();});return;}connect(c);});
  peer.on('error',()=>onlineStatus('⚠️ Room unavailable. Try again or use Candybot.'));
 }catch{onlineStatus('⚠️ Could not create a room. Try Candybot.');}
}
async function joinRoom(){
 const id=roomCode($('room-input').value);
 if(!/^rcl-casino-[a-f0-9]{20}$/i.test(id)){onlineStatus('⚠️ Paste a valid Candy Land Casino room link or code.');return;}
 setMode('friend');$('room-input').value=id;
 onlineStatus('🟡 Finding the remote candy room...');
 try{await loadPeer();}catch{onlineStatus('⚠️ Remote rooms unavailable. Candybot is always ready.');return;}
 leave('Joining the room.');mode='friend';host=false;players=['Waiting...',sanitize($('friend-name').value)];
 roomId=id;
 try{
  peer=new window.Peer(undefined,{debug:0});
  peer.on('open',()=>{if(!peer)return;connect(peer.connect(id,{reliable:true,serialization:'json'}));onlineStatus('🟡 Waiting for the host connection…');});
  peer.on('error',()=>onlineStatus('⚠️ Failed to join. Check the link or try another network.'));
 }catch{onlineStatus('⚠️ Could not join that room.');}
 render();
}
document.querySelectorAll('[data-duel]').forEach(b=>b.onclick=()=>chooseGame(b.dataset.duel));
document.querySelectorAll('[data-opponent]').forEach(b=>b.onclick=()=>setMode(b.dataset.opponent));
$('play-computer').onclick=()=>{setMode('computer');location.hash='games';};
$('show-online').onclick=()=>{setMode('friend');location.hash='friends';};
$('duel-ready').onclick=ready;$('poker-draw').onclick=draw;$('duel-reset').onclick=newMatch;
$('make-room').onclick=createRoom;$('join-room').onclick=joinRoom;
$('leave-room').onclick=()=>setMode('computer');
$('copy-invite').onclick=async()=>{try{await navigator.clipboard.writeText($('invite-link').value);$('copy-invite').textContent='✓ LINK COPIED';}catch{$('invite-link').focus();$('invite-link').select();$('copy-invite').textContent='SELECTED — COPY LINK';}};
$('friend-name').addEventListener('change',()=>{players[me()]=sanitize($('friend-name').value);if(online)send({type:'hello',name:players[me()]});render();transmit();});
const incoming=new URL(location.href).searchParams.get('room');
if(incoming){mode='friend';players=['Waiting...',sanitize($('friend-name').value)];host=false;$('remote-controls').hidden=false;$('room-input').value=roomCode(incoming);onlineStatus('🍬 Friend invitation detected! Type your name and tap JOIN ROOM.');}
render();
window.CandyCasinoDebug=Object.freeze({state:()=>({mode,duel,round,phase:stage,scores,online,hand:hands[me()]}),rules:P});
document.body.dataset.candyCasinoReady='true';
})();