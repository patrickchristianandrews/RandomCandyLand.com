/* Candy Land Casino — free-play, browser-only candy chips and remote friend duels.
 * No deposits, money, prizes, account or server-side cash balance.
 * The remote mode is casual, host-authoritative and not cheat-proof.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const pick=(n)=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
const symbols=['🍒','🍭','🍬','🍇','🍋','🍉','🍩'];
const keys={chips:'candyland-casino-chips-v1',best:'candyland-casino-best-v1'};
const min=10,max=250;
const storedChips=localStorage.getItem(keys.chips),storedBest=localStorage.getItem(keys.best);
let balance=storedChips===null?1000:Number(storedChips),best=storedBest===null?1000:Number(storedBest);
if(!Number.isFinite(balance)||balance<0)balance=1000;
if(!Number.isFinite(best)||best<1000)best=1000;
let game='slots', wheelPick='pink', dicePick='high', cardPick='higher', hand=null;
const labels={
 slots:['SPIN THE SPRINKLES','🍒 Gummy Slots','Match three candy treats for a sugar rush. Two matching treats get you a small sweet treat.','Three of a kind pay 6× your stake; two of a kind pay 2×. No match loses.'],
 blackjack:['THE JELLYBEAN DEALER','🃏 Candy Blackjack','Aim for 21 without going over. Hit for another card or stand to challenge the dealer.','Blackjack wins 2.5× stake (rounded down), regular win pays 2×; ties refund your stake. Dealer stands on 17.'],
 roulette:['TRY THE SUGAR WHEEL','🎡 Sugar Wheel','Pick pink, blue, or the rare golden sprinkle and spin the sugar wheel.','18 pink, 18 blue and 1 golden spot. Pink or blue pays 2×; gold pays 12×.'],
 dice:['ROLL THE GUMMIES','🎲 Gummy Dice','Roll two six-sided gummies and guess whether they will add up high or low.','Low = 2–6; High = 8–12; rolling a 7 loses. Correct guess pays 2× your stake.'],
 highcard:['THE LUCKY CANDY DRAW','🂡 High Card','Will the next card be higher or lower than the one showing? Make your guess.','Ranks 2 to Ace; ties return your original stake. A correct guess pays 2× your stake.']
};
function uiText(parent,text,className=''){const node=document.createElement('div');if(className)node.className=className;node.textContent=text;parent.append(node);return node;}
function btn(parent,text,run,cls='primary'){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',run);parent.append(b);return b;}
function save(){balance=Math.max(0,Math.round(balance));best=Math.max(best,balance);try{localStorage.setItem(keys.chips,String(balance));localStorage.setItem(keys.best,String(best));}catch{};$('balance').textContent=balance.toLocaleString();$('best').textContent=best.toLocaleString();}
function message(s){$('game-message').textContent=s;}
function stake(){return Number($('stake').value)||25;}
function canPlay(){if(balance<stake()){message('🍬 Not enough candy chips. Lower your stake or refill free chips!');return false;}return true;}
function wager(){balance-=stake();save();}
function payout(amount){balance+=Math.max(0,Math.floor(amount));save();}
function randomCard(){return {rank:2+pick(13),suit:['♥','♦','♣','♠'][pick(4)]};}
function rankName(n){return {11:'J',12:'Q',13:'K',14:'A'}[n]||String(n);}
function deckCard(){const rank=2+pick(13);return {rank:rank===14?14:rank,suit:['♥','♦','♣','♠'][pick(4)]};}
function cardFace(c){return rankName(c.rank)+c.suit;}
function handTotal(cards){let sum=0,aces=0;for(const c of cards){const v=c.rank===14?11:Math.min(c.rank,10);sum+=v;if(c.rank===14)aces++;}while(sum>21&&aces){sum-=10;aces--;}return sum;}
function drawCard(){return {rank:2+pick(13),suit:['♥','♦','♣','♠'][pick(4)]};}
function screen(){return $('game-stage');}
function controls(){return $('game-buttons');}
function displayCards(label,cards){const group=document.createElement('div');group.className='cards-group';uiText(group,label,'cards-label');const row=document.createElement('div');row.className='cards-row';for(const card of cards){const v=uiText(row,card==='?'?'🍭':cardFace(card),'candy-card '+(card==='?'?'back':card.suit==='♥'||card.suit==='♦'?'red':''));}group.append(row);screen().append(group);}
function chooseButtons(type,choices,selected,onSelect){const row=document.createElement('div');row.className='choice-row';for(const [value,text] of choices){const b=btn(row,text,()=>{onSelect(value);renderGame();},value===selected?'chosen':'');b.setAttribute('aria-pressed',String(value===selected));}screen().append(row);}
function renderGame(){
 for(const e of document.querySelectorAll('[data-game]')){const on=e.dataset.game===game;e.classList.toggle('selected',on);e.setAttribute('aria-pressed',String(on));}
 const [kicker,title,description,rule]=labels[game];$('game-kicker').textContent=kicker;$('game-title').textContent=title;$('game-description').textContent=description;$('game-rule').textContent=rule;
 screen().replaceChildren();controls().replaceChildren();
 if(game==='slots'){const row=document.createElement('div');row.className='slot-reels';(window.lastSlots||['🍒','🍭','🍬']).forEach(sym=>uiText(row,sym,'slot-reel'));screen().append(row);uiText(screen(),'🍒 Cherry · 🍭 Lollipop · 🍬 Candy · 🍇 Grape · 🍋 Lemon · 🍉 Melon · 🍩 Donut','game-stage-caption');btn(controls(),'🎰 SPIN THE SPRINKLES',spinSlots);}
 if(game==='blackjack'){
 if(!hand){uiText(screen(),'🃏 🍬 🂡','game-stage-caption');uiText(screen(),'The jellybean dealer is ready.','pill');btn(controls(),'🍭 DEAL CARDS',startBlackjack);}
 else{displayCards('🍭 YOUR HAND · '+handTotal(hand.player),hand.player);displayCards('🍬 DEALER · '+(hand.finished?handTotal(hand.dealer):'??'),hand.finished?hand.dealer:[hand.dealer[0],'?']);
 if(!hand.finished){btn(controls(),'➕ HIT',hitBlackjack);btn(controls(),'✋ STAND',standBlackjack,'secondary');}else btn(controls(),'🃏 NEW HAND',()=>{hand=null;renderGame();});}
 }
 if(game==='roulette'){const wheel=uiText(screen(),'🍭','wheel');wheel.style.transform='rotate('+((window.lastSpin||0)*29)+'deg)';uiText(screen(),'Choose your sprinkle color:','game-stage-caption');chooseButtons('color',[['pink','💗 PINK'],['blue','🩵 BLUE'],['gold','💛 GOLD'] ],wheelPick,v=>wheelPick=v);btn(controls(),'🎡 SPIN THE WHEEL',spinWheel);}
 if(game==='dice'){const row=document.createElement('div');row.className='dice-row';for(const n of (window.lastDice||[1,6]))uiText(row,['','⚀','⚁','⚂','⚃','⚄','⚅'][n],'die');screen().append(row);uiText(screen(),'Will the total be 2–6 or 8–12?','game-stage-caption');chooseButtons('dice',[['low','🍓 LOW 2–6'],['high','🍉 HIGH 8–12']],dicePick,v=>dicePick=v);btn(controls(),'🎲 ROLL THE GUMMIES',rollDice);}
 if(game==='highcard'){const row=document.createElement('div');row.className='cards-row';uiText(row,rankName(window.lastCard||8),'candy-card');uiText(row,'🍭','candy-card back');screen().append(row);uiText(screen(),'Will the next candy card be higher or lower?','game-stage-caption');chooseButtons('card',[['higher','⬆ HIGHER'],['lower','⬇ LOWER']],cardPick,v=>cardPick=v);btn(controls(),'🂡 DRAW A CARD',drawHigh);}
}
function spinSlots(){if(!canPlay())return;wager();const s=[symbols[pick(7)],symbols[pick(7)],symbols[pick(7)]];window.lastSlots=s;const unique=new Set(s).size;const win=unique===1?stake()*6:unique===2?stake()*2:0;payout(win);renderGame();message(win?'🍬 SWEET! '+(unique===1?'THREE MATCH!':'TWO MATCH!')+' +'+win+' candy chips!':'No match this time. Spin for another chance!');}
function startBlackjack(){if(!canPlay())return;wager();hand={bet:stake(),player:[drawCard(),drawCard()],dealer:[drawCard(),drawCard()],finished:false};if(handTotal(hand.player)===21)endBlackjack();else{renderGame();message('Your move: Hit or Stand.');}}
function endBlackjack(){while(handTotal(hand.dealer)<17&&handTotal(hand.player)<=21)hand.dealer.push(drawCard());const p=handTotal(hand.player),d=handTotal(hand.dealer);const natural=p===21&&hand.player.length===2;let win=p>21?0:d>21||p>d?Math.floor(hand.bet*(natural?2.5:2)):p===d?hand.bet:0;hand.finished=true;payout(win);renderGame();message(p>21?'🍬 Bust! The jellybean dealer takes this round.':win>hand.bet?'🎉 You beat the jellybean dealer! +'+win+' chips!':win===hand.bet?'🍭 Tie! Your chips are back.':'🍭 The dealer wins this hand.');}
function hitBlackjack(){if(!hand||hand.finished)return;hand.player.push(drawCard());if(handTotal(hand.player)>=21)endBlackjack();else{renderGame();message('Hit again or stand at '+handTotal(hand.player)+'.');}}
function standBlackjack(){if(!hand||hand.finished)return;endBlackjack();}
function spinWheel(){if(!canPlay())return;wager();const n=pick(37),color=n===0?'gold':n%2?'pink':'blue';const win=color===wheelPick?stake()*(color==='gold'?12:2):0;window.lastSpin=n;payout(win);renderGame();message((win?'🍬 '+win+' CHIPS! ':'🍭 No match! ')+color.toUpperCase()+' sprinkle landed on the wheel.');}
function rollDice(){if(!canPlay())return;wager();const dice=[pick(6)+1,pick(6)+1];window.lastDice=dice;const total=dice[0]+dice[1],win=((total<=6&&dicePick==='low')||(total>=8&&dicePick==='high'))?stake()*2:0;payout(win);renderGame();message('🎲 Rolled '+total+'. '+(win?'SWEET WIN! +'+win+' candy chips.':total===7?'Lucky 7 is a miss for both guesses.':'Try again!'));}
function drawHigh(){if(!canPlay())return;wager();const current=window.lastCard||8,next=2+pick(13);const win=next===current?stake():((next>current&&cardPick==='higher')||(next<current&&cardPick==='lower'))?stake()*2:0;window.lastCard=next;payout(win);renderGame();message('🂡 '+rankName(current)+' → '+rankName(next)+'! '+(win===stake()?'A tie: your chips return.':win?'Great guess! +'+win+' chips.':'Not this time!'));}
for(const b of document.querySelectorAll('[data-game]'))b.onclick=()=>{if(hand&&!hand.finished){message('Finish the current blackjack hand before switching games.');return;}game=b.dataset.game;hand=null;renderGame();message('🍭 Ready for '+labels[game][1]+'?');};
$('stake').onchange=()=>{};const stakes=[10,25,50,100,250];$('bet-down').onclick=()=>{$('stake').value=stakes[Math.max(0,stakes.indexOf(stake())-1)];};$('bet-up').onclick=()=>{$('stake').value=stakes[Math.min(stakes.length-1,stakes.indexOf(stake())+1)];};
$('refill').onclick=()=>{balance+=1000;save();message('✨ A fresh thousand candy chips just landed in your stash!');};
save();renderGame();

// Casual online two-player duels; the room host deals both players' numbers.
let peer=null,conn=null,isHost=false,duel='card',round=0,scores=[0,0],readies=[false,false],players=['Candy Captain','Waiting...'],online=false,roomId='',duelResult='',pendingJoin='';
const onlineStatus=s=>$('connection-status').textContent=s,duelStatus=s=>$('duel-status').textContent=s;
const cleanName=s=>String(s||'Candy Captain').replace(/[<>\r\n]/g,'').trim().slice(0,22)||'Candy Captain';
const ownSlot=()=>isHost?0:1;
function roomCode(v){let s=String(v||'').trim();try{s=new URL(s,location.href).searchParams.get('room')||s;}catch{}return s.replace(/[^a-zA-Z0-9-]/g,'').slice(0,100);}
function setConnected(on){
 online=on;
 $('duel-ready').disabled=!on||round>=5;
 $('duel-reset').disabled=!on;
 $('leave-room').hidden=!peer;
 if(on)onlineStatus('🟢 CONNECTED! The candy showdown is ready. Pick a game, then both players tap READY.');
 renderDuel();
}
function closeRoom(announce='Disconnected from the friend room.'){
 online=false;try{conn?.close();}catch{}try{peer?.destroy();}catch{}conn=null;peer=null;roomId='';pendingJoin='';round=0;scores=[0,0];readies=[false,false];players=['Candy Captain','Waiting...'];duelResult='';
 $('invite-panel').hidden=true;
 $('leave-room').hidden=true;
 const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u);
 onlineStatus('🔌 '+announce);
 duelStatus('Waiting for a two-player connection.');setConnected(false);
}
function wireConnection(connection){
 conn=connection;
 connection.on('open',()=>{
  // Prevent a second visitor from joining an existing single-opponent match.
  if(isHost){players[0]=cleanName($('friend-name').value);send({type:'hello',name:players[0],duel});}
  else{players[1]=cleanName($('friend-name').value);send({type:'hello',name:players[1]});}
  setConnected(true);
 });
 connection.on('data',msg=>{
  if(!msg||typeof msg!=='object')return;
  if(msg.type==='hello'){
   players[isHost?1:0]=cleanName(msg.name);if(!isHost){duel=msg.duel==='dice'?'dice':'card';}
   onlineStatus('🟢 Connected with '+players[isHost?1:0]+'!');renderDuel();
  }
  if(msg.type==='mode'&&!isHost&&(msg.duel==='dice'||msg.duel==='card')){duel=msg.duel;round=0;scores=[0,0];readies=[false,false];duelResult='';renderDuel();}
  if(msg.type==='ready'&&isHost){readies[1]=true;renderDuel();maybeDeal();}
  if(msg.type==='reset'&&isHost){newMatch();return;}
  if(msg.type==='state'&&!isHost){
   if(!Array.isArray(msg.scores)||msg.scores.length!==2||!Array.isArray(msg.readies)||msg.readies.length!==2)return;
   round=Math.max(0,Math.min(5,Number(msg.round)||0));
   scores=msg.scores.map(v=>Math.max(0,Math.min(5,Number(v)||0)));
   readies=msg.readies.map(Boolean);duelResult=String(msg.result||'').slice(0,250);
   if(msg.duel==='card'||msg.duel==='dice')duel=msg.duel;renderDuel();
  }
 });
 connection.on('close',()=>closeRoom('Your friend left or the connection closed. You can create a fresh room.'));
 connection.on('error',()=>{onlineStatus('⚠️ The connection could not be established. Check the room link or network.');});
}
function send(data){if(conn?.open)try{conn.send(data);}catch{}}
function broadcast(){if(isHost)send({type:'state',round,scores,readies,result:duelResult,duel});}
function maybeDeal(){
 if(!isHost||!online||round>=5||!readies.every(Boolean))return;
 let a,b;
 if(duel==='card'){a=2+pick(13);b=2+pick(13);duelResult='🃏 '+players[0]+': '+rankName(a)+'  ·  '+players[1]+': '+rankName(b);}
 else{a=pick(6)+1+pick(6)+1;b=pick(6)+1+pick(6)+1;duelResult='🎲 '+players[0]+': '+a+'  ·  '+players[1]+': '+b;}
 if(a>b){scores[0]++;duelResult+=' — 🍭 '+players[0]+' wins!';}
 else if(b>a){scores[1]++;duelResult+=' — 🍬 '+players[1]+' wins!';}
 else duelResult+=' — 🍭 Tie!';
 round++;readies=[false,false];
 if(round===5){duelResult+='  🏆 MATCH OVER: '+(scores[0]===scores[1]?'Sweet tie!':(scores[0]>scores[1]?players[0]:players[1])+' takes the candy crown!');}
 renderDuel();broadcast();
}
function renderDuel(){
 for(const b of document.querySelectorAll('[data-duel]')){let on=b.dataset.duel===duel;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}
 $('duel-description').textContent=duel==='card'?'Highest of two random cards wins the round. Five rounds decide the winner.':'Roll two dice each. Highest total wins the round. Five rounds decide the winner.';
 const me=ownSlot(),them=1-me;
 $('self-name').textContent=players[me]||'Candy Captain';$('opponent-name').textContent=players[them]||'Waiting...';
 $('self-score').textContent=scores[me];$('other-score').textContent=scores[them];
 $('duel-display').textContent=duelResult||'🍬 '+(online?'Both players tap READY to roll or draw!':'Invite someone to start the sugar showdown!');
 $('my-ready').textContent=readies[me]?'🍭 You: READY':'🍭 You: waiting';
 $('their-ready').textContent=readies[them]?'🍬 Friend: READY':'🍬 Friend: waiting';
 $('duel-ready').disabled=!online||readies[me]||round>=5;
 $('duel-ready').textContent=round>=5?'🏆 MATCH COMPLETE':readies[me]?'⏳ WAITING FOR FRIEND':'🎲 READY FOR ROUND '+(round+1)+' / 5';
 duelStatus(online?(round>=5?'🏆 Match complete. Select New 5-round match to play again.':'Round '+(round+1)+' of 5 · '+(readies[me]?'Waiting for your friend!':'Tap ready when you want to draw.')):'Waiting for a two-player connection.');
}
function newMatch(){round=0;scores=[0,0];readies=[false,false];duelResult='';renderDuel();broadcast();}
function connectFailure(err){onlineStatus('⚠️ Connection unavailable: '+(err?.type==='unavailable-id'?'That room code is already taken. Please create a new one.':'Check your internet connection and try again.'));try{peer?.destroy();}catch{}peer=null;conn=null;$('leave-room').hidden=true;}
let peerLibraryLoading=null;
function loadPeerLibrary(){
 if(typeof window.Peer==='function')return Promise.resolve();
 if(peerLibraryLoading)return peerLibraryLoading;
 peerLibraryLoading=new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';
  s.async=true;s.crossOrigin='anonymous';
  s.onload=()=>typeof window.Peer==='function'?resolve():reject(new Error('PeerJS did not initialize'));
  s.onerror=()=>reject(new Error('PeerJS download failed'));
  document.head.append(s);
 }).catch(e=>{peerLibraryLoading=null;throw e});
 return peerLibraryLoading;
}
async function createRoom(){
 onlineStatus('🟡 Preparing your private candy room...');
 try{await loadPeerLibrary();}catch{onlineStatus('⚠️ Online rooms could not load. Solo games still work. Check your connection or disable content blockers, then try again.');return;}
 closeRoom('Starting a new room...');
 isHost=true;roomId='rcl-casino-'+crypto.randomUUID().replace(/-/g,'').slice(0,20);players[0]=cleanName($('friend-name').value);
 try{
  peer=new window.Peer(roomId,{debug:0});
  peer.on('open',id=>{
   if(!peer)return;
   roomId=id;const url=new URL(location.href);url.searchParams.set('room',id);$('invite-link').value=url.href;$('room-input').value=id;
   $('invite-panel').hidden=false;$('leave-room').hidden=false;onlineStatus('🟡 Room ready! Copy the invitation link and send it to a friend.');renderDuel();
  });
  peer.on('connection',c=>{
   if(conn?.open){c.on('open',()=>{c.send({type:'full'});c.close();});return;}
   wireConnection(c);
  });
  peer.on('error',connectFailure);
  peer.on('disconnected',()=>{if(!online)onlineStatus('⚠️ Matchmaking disconnected. The existing room may need to be recreated.');});
 }catch(e){connectFailure(e);}
}
async function joinRoom(){
 const id=roomCode($('room-input').value);
 if(!id.startsWith('rcl-casino-')||id.length<17){onlineStatus('⚠️ Paste a valid Candy Land Casino room link or code.');return;}
 onlineStatus('🟡 Connecting to the shared candy room...');
 try{await loadPeerLibrary();}catch{onlineStatus('⚠️ Online rooms could not load. Solo games still work. Check your network or content blockers.');return;}
 closeRoom('Joining your friend...');
 isHost=false;roomId=id;pendingJoin=id;players[1]=cleanName($('friend-name').value);
 try{
  peer=new window.Peer(undefined,{debug:0});
  peer.on('open',()=>{
   const c=peer.connect(pendingJoin,{reliable:true,serialization:'json'});
   if(!c){onlineStatus('⚠️ Could not open the invitation.');return;}
   wireConnection(c);
   onlineStatus('🟡 Finding the friend room…');
  });
  peer.on('error',connectFailure);
 }catch(e){connectFailure(e);}
}
$('make-room').onclick=createRoom;$('join-room').onclick=joinRoom;
$('copy-invite').onclick=async()=>{const url=$('invite-link').value;try{await navigator.clipboard.writeText(url);$('copy-invite').textContent='✓ LINK COPIED!';}catch{$('invite-link').focus();$('invite-link').select();$('copy-invite').textContent='SELECTED — COPY LINK';}};
$('leave-room').onclick=()=>closeRoom('You left the game room.');
$('friend-name').addEventListener('change',()=>{players[ownSlot()]=cleanName($('friend-name').value);send({type:'hello',name:players[ownSlot()],duel});renderDuel();});
for(const b of document.querySelectorAll('[data-duel]'))b.addEventListener('click',()=>{if(!isHost&&online){duelStatus('Only the room host can change the showdown game.');return;}duel=b.dataset.duel==='dice'?'dice':'card';newMatch();if(online)send({type:'mode',duel});});
$('duel-ready').onclick=()=>{if(!online||round>=5||readies[ownSlot()])return;readies[ownSlot()]=true;if(isHost){broadcast();maybeDeal();}else send({type:'ready'});renderDuel();};
$('duel-reset').onclick=()=>{if(!online)return;if(isHost)newMatch();else send({type:'reset'});};
const invited=new URL(location.href).searchParams.get('room');if(invited){$('room-input').value=roomCode(invited);onlineStatus('🍬 Friend invitation detected! Add your name and tap JOIN ROOM.');}
renderDuel();
document.body.dataset.candyCasinoReady='true';
})();
