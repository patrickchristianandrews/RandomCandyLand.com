import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Dice5, Volume2, VolumeX, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CandyLand3DScene } from '../components/candyland3d/CandyLand3DScene';
import { generate3DBoardTiles, ABSURD_CHAOS_CARDS } from '../utils/candyChaosEngine';
import { CHAOS_CHARACTERS, ChaosCard, ChaosCharacterId, ChaosPlayer } from '../types/candyChaos';
import { sound } from '../utils/audio';
import { candyAudio } from '../utils/candyAudio';

interface RandomCandyLandHomeProps { onNavigateToTrump: () => void; }
const STAR_IDS: ChaosCharacterId[] = ['taylor','sabrina','bunny','beyonce','lebron','gaga','bruno','billie'];
const CAST = CHAOS_CHARACTERS.filter(c => STAR_IDS.includes(c.id));
const ALL_CAST = CHAOS_CHARACTERS;
const byId = (id: ChaosCharacterId) => ALL_CAST.find(c => c.id === id) || ALL_CAST[0];
const CARD_COUNT = ABSURD_CHAOS_CARDS.length;
const ENCOUNTERS = [
  ['Taylor Swift','Sabrina Carpenter','Taylor invents an entire candy kingdom era. Sabrina responds with a miniature espresso machine. The crowd demands a remix.'],
  ['Beyoncé','Lady Gaga','Two spectacular entrances happen at exactly the same time. A gummy bear faints from the fabulousness.'],
  ['Bad Bunny','Bruno Mars','A neon dance-off erupts. The jellybeans cannot decide who has the smoothest moves.'],
  ['LeBron James','Bad Bunny','LeBron makes the winning gumdrop dunk while the whole candy stadium catches the rhythm.'],
  ['Billie Eilish','Lady Gaga','Billie sets a moody midnight vibe. Gaga turns it into an extravagant costume reveal.'],
  ['Taylor Swift','Beyoncé','The candy kingdom tries to award both stars the same glitter crown. They organize a grand finale instead.'],
  ['Sabrina Carpenter','Billie Eilish','Sabrina offers espresso. Billie suggests a mysterious moonlit cafe. A nervous waffle works the register.'],
  ['Bruno Mars','Beyoncé','A synchronized choreography battle starts, and the marshmallows insist on being backup dancers.'],
  ['Bad Bunny','Taylor Swift','A melody turns into a wild genre-swap experiment. The bubblegum orchestra requests an encore.'],
  ['Lady Gaga','LeBron James','Gaga designs a dazzling team uniform. LeBron scores before the outfit reveal is even finished.'],
  ['Trumpagotchi','Taylor Swift','Donald demands the biggest stage. Taylor replies with a twelve-song candy musical. The stage grows twice its size.'],
  ['Trumpagotchi','Beyoncé','Donald announces a candy-parade victory. Beyoncé takes charge of the choreography. All the jellybeans get in formation.'],
  ['Trumpagotchi','LeBron James','Donald names the tallest gumdrop in the kingdom. LeBron dunks it. The scoreboard explodes in confetti.'],
  ['Trumpagotchi','Bad Bunny','Donald starts a dance move. Bad Bunny drops the beat. A peppermint knight becomes a fan.'],
  ['Sabrina Carpenter','Bruno Mars','Espresso meets golden funk. Even the frosting machine starts dancing.'],
  ['Billie Eilish','Taylor Swift','Two totally different moods create a surprisingly magical duet beneath the cotton candy sky.'],
  ['Lady Gaga','Sabrina Carpenter','A catwalk becomes a rollercoaster. Sabrina keeps her tiny coffee cup perfectly upright.'],
  ['LeBron James','Beyoncé','A championship celebration transforms into a stadium-sized candy concert.'],
];
const uniqueRandom = (last: number, max: number) => {
  if (max <= 1) return 0;
  let i = Math.floor(Math.random() * max);
  if (i === last) i = (i + 1) % max;
  return i;
};
const bounceConfetti = (color: string) => {
  try {
    confetti({ particleCount: 75, spread: 92, origin: { x: 0.5, y: 0.64 }, colors: [color,'#fff68f','#ff77df','#75eaff'] });
  } catch {}
};

function CandyLink({emoji,title,subtitle,href,shade,label}: {emoji:string,title:string,subtitle:string,href:string,shade:string,label?:string}) {
  return (
    <a className={'sugar-offering sugar-offering--'+shade} href={href} aria-label={'Open '+title}>
      <div className="sugar-offering-orb" aria-hidden="true">{emoji}</div>
      <div className="sugar-offering-body">
        {label && <span className="sugar-tag">{label}</span>}
        <h3>{title}</h3><p>{subtitle}</p>
        <span className="sugar-linktext">Step inside <ArrowRight size={16}/></span>
      </div>
    </a>
  );
}
export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const tiles = useMemo(() => generate3DBoardTiles(), []);
  const [players, setPlayers] = useState<ChaosPlayer[]>(() => [
    { id:'you',name:'You',characterId:'taylor',tileIndex:0,sugarGems:140,isHost:true,isAi:false,isConnected:true,score:0,shieldActive:false },
    { id:'guest1',name:'Sabrina',characterId:'sabrina',tileIndex:2,sugarGems:80,isHost:false,isAi:true,isConnected:true,score:0,shieldActive:false },
    { id:'guest2',name:'Bad Bunny',characterId:'bunny',tileIndex:4,sugarGems:90,isHost:false,isAi:true,isConnected:true,score:0,shieldActive:false },
    { id:'guest3',name:'Donald',characterId:'trumpagotchi',tileIndex:1,sugarGems:105,isHost:false,isAi:true,isConnected:true,score:0,shieldActive:false },
  ]);
  const [activePlayerIdx,setActivePlayerIdx] = useState(0);
  const [isRolling,setIsRolling] = useState(false);
  const [lastDice,setLastDice] = useState<number|null>(null);
  const [eventCard,setEventCard] = useState<ChaosCard|null>(null);
  const [lastCard,setLastCard] = useState<ChaosCard|null>(null);
  const [encounter,setEncounter] = useState('');
  const [showGuide,setShowGuide] = useState(false);
  const [isMuted,setIsMuted] = useState(()=>sound.getIsMuted());
  const [activeCategory,setActiveCategory] = useState('all');
  const [turn,setTurn] = useState(1);
  const [zoom,setZoom] = useState(0);
  const deckRef = useRef<number[]>([]);
  const lastEncounterRef = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timerRef.current)clearTimeout(timerRef.current)},[]);
  const character = byId(players[0].characterId);
  const turnPlayer = players[activePlayerIdx];
  const drawCard = () => {
    if(!deckRef.current.length) {
      deckRef.current = Array.from({length:CARD_COUNT},(_,i)=>i);
      for(let i=deckRef.current.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deckRef.current[i],deckRef.current[j]]=[deckRef.current[j],deckRef.current[i]];}
    }
    return ABSURD_CHAOS_CARDS[deckRef.current.pop()||0];
  };
  const randomEncounter = () => {
    const i = uniqueRandom(lastEncounterRef.current,ENCOUNTERS.length);
    lastEncounterRef.current = i;
    const [a,b,dialogue] = ENCOUNTERS[i];
    return a+' × '+b+' — '+dialogue;
  };
  const roll = () => {
    if(isRolling || eventCard)return;
    setIsRolling(true);
    try{candyAudio.playReelTick()}catch{}
    const rollValue=1+Math.floor(Math.random()*6),card=drawCard(),acting=activePlayerIdx;
    timerRef.current=setTimeout(()=>{
      setLastDice(rollValue);
      setLastCard(card);
      setPlayers(prev=>{
        const next=prev.map(x=>({...x}));
        const me=next[acting];
        let destination=Math.max(0,Math.min(tiles.length-1,me.tileIndex+rollValue+card.moveDelta));
        if(card.specialAction==='SWAP_LEADER'){
          const leader=next.reduce((best,p,i)=>p.tileIndex>next[best].tileIndex?i:best,0);
          if(leader!==acting){const swap=next[leader].tileIndex;next[leader].tileIndex=me.tileIndex;destination=swap;}
        }
        if(card.specialAction==='FIRE_CANNON'){
          const other=(acting+1)%next.length;
          next[other].tileIndex=Math.max(0,next[other].tileIndex-3);
        }
        me.tileIndex=destination;me.sugarGems=Math.max(0,me.sugarGems+card.gemDelta);if(destination>=tiles.length-1){me.score+=1;me.tileIndex=0;}
        return next;
      });
      setEventCard(card);
      setEncounter(randomEncounter());
      setTurn(t=>t+1);
      setIsRolling(false);
      bounceConfetti(card.color);
      try{candyAudio.playJackpot()}catch{}
    },760);
  };
  const advance = () => {setEventCard(null);setActivePlayerIdx(i=>(i+1)%players.length);};
  const chooseCharacter=(id: ChaosCharacterId)=>{
    if(isRolling||eventCard)return;
    const chosen=byId(id);
    setPlayers(prev=>prev.map((p,i)=>i===0?{...p,characterId:id,name:chosen.name.split(' ')[0]}:p));
    bounceConfetti(chosen.color);
  };
  const reset = () => {
    if(timerRef.current)clearTimeout(timerRef.current);
    setIsRolling(false);setEventCard(null);setLastCard(null);setActivePlayerIdx(0);setLastDice(null);setTurn(1);deckRef.current=[];
    setPlayers(prev=>prev.map((p,i)=>({...p,tileIndex:i,sugarGems:i===0?140:80,score:0})));
  };
  const mute = ()=>setIsMuted(sound.toggleMute());
  const goBoard=()=>document.getElementById('candy-board')?.scrollIntoView({behavior:'smooth'});
  const showGroup=(id:string)=>activeCategory==='all'||activeCategory===id;
  return (
    <main className="sugar-universe">
      <div className="sugar-sky" aria-hidden="true">
        <i className="sugar-cloud sugar-cloud-a"/><i className="sugar-cloud sugar-cloud-b"/><i className="sugar-cloud sugar-cloud-c"/>
        <span className="sugar-floater one">🍭</span><span className="sugar-floater two">🍬</span><span className="sugar-floater three">🍩</span><span className="sugar-floater four">🌈</span><span className="sugar-floater five">⭐</span>
      </div>
      <header className="sugar-nav">
        <a href="/" className="sugar-mark">🍬 <strong>RANDOM<span>CANDYLAND</span></strong><small>.com</small></a>
        <div className="sugar-navlinks"><button onClick={goBoard}>🎲 Board game</button><a href="#attractions">✨ Attractions</a><button onClick={mute} aria-label={isMuted?'Unmute game':'Mute game'}>{isMuted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button></div>
      </header>
      <section className="sugar-hero">
        <div className="sugar-kicker">✦ WELCOME TO THE WILDEST CORNER OF THE INTERNET ✦</div>
        <h1><span>WONDER.</span><br/><em>WEIRDNESS.</em><br/><b>PURE CANDY CHAOS!</b></h1>
        <p>Welcome to a neon-soaked sugar universe where gummy bears have drama, pop stars battle for the crown, and every click opens a new surprise.</p>
        <div className="sugar-herobuttons"><button onClick={goBoard} className="sugar-mainbtn">🎲 PLAY THE 3D BOARD <ArrowRight/></button><a href="#attractions" className="sugar-otherbtn">Explore attractions ↓</a></div>
        <div className="sugar-hero-stats"><span>🎴 {CARD_COUNT} chaos cards</span><span>🌟 {CAST.length} star guests</span><span>🌈 One ridiculous universe</span></div>
        <div className="sugar-hero-planet" aria-hidden="true"><span className="planet-ring"/><span className="planet-eye eye-left"/><span className="planet-eye eye-right"/><span className="planet-smile"/><span className="planet-star">✦</span></div>
      </section>
      <section id="attractions" className="sugar-section sugar-attractions">
        <div className="sugar-sectiontop"><div><span className="sugar-eyebrow">✦ PICK YOUR PORTAL</span><h2>The candy <em>multiverse.</em></h2><p>Little worlds. Big personalities. Zero boring corners.</p></div></div>
        <div className="sugar-filter" role="group" aria-label="Filter attractions">
          {[['all','All attractions'],['games','🎮 Games'],['music','🎵 Music'],['discovery','🌙 Explore']].map(([id,label])=><button key={id} className={activeCategory===id?'on':''} onClick={()=>setActiveCategory(id)}>{label}</button>)}
        </div>
        {showGroup('games') && <div className="sugar-group"><h3>🎮 Games & ridiculous adventures</h3><div className="sugar-offerings">
          <button className="sugar-offering sugar-offering--bubble" onClick={goBoard}><div className="sugar-offering-orb">🎲</div><div className="sugar-offering-body"><span className="sugar-tag">172+ SURPRISE CARDS</span><h3>Sugar Chaos 3D</h3><p>Explore a spectacular 3D candy board, face pop-culture guests and reveal bizarre cards.</p><span className="sugar-linktext">Play now <ArrowRight size={16}/></span></div></button>
          <button className="sugar-offering sugar-offering--gold" onClick={onNavigateToTrump}><div className="sugar-offering-orb">👱‍♂️</div><div className="sugar-offering-body"><span className="sugar-tag">RETRO POCKET PET</span><h3>Trumpagotchi</h3><p>Feed, dress, dance and evolve your chaotic little presidential digi-pet.</p><span className="sugar-linktext">Pick up & play <ArrowRight size={16}/></span></div></button>
          <CandyLink emoji="🎰" title="The Candy Arcade" subtitle="Play with slot machines, a mystical gumball oracle, curious collectibles and a beatbox." href="/arcade" shade="violet" label="CLASSIC CABINETS"/>
        </div></div>}
        {showGroup('music') && <div className="sugar-group"><h3>🎵 Sound, color & imagination</h3><div className="sugar-offerings"><CandyLink emoji="🌈" title="Candy Pulse" subtitle="Turn your favorite music into hypnotic light waves, neon blooms and dancing frequencies." href="/music-visualizer/" shade="pink" label="MUSIC VISUALIZER"/><CandyLink emoji="🎹" title="FM-1 Synth Lab" subtitle="Make weird and wonderful sounds with a browser-based pocket synthesizer." href="/fm1-emu/" shade="blue" label="MUSIC MAKER"/></div></div>}
        {showGroup('discovery') && <div className="sugar-group"><h3>🌙 Discover something unexpected</h3><div className="sugar-offerings"><CandyLink emoji="✳️" title="After Dark" subtitle="An adults-only, judgment-free atlas of curiosity, psychology and playful self-discovery." href="/after-dark/" shade="midnight" label="18+ ONLY"/></div></div>}
      </section>
      <section id="candy-board" className="sugar-section sugar-board-section">
        <div className="sugar-sectiontop"><div><span className="sugar-eyebrow">✦ THE MAIN EVENT</span><h2>Sugar Chaos <em>3D.</em></h2><p>Spin, zoom, collect candy gems and survive the most absurd deck on the internet.</p></div><button className="sugar-pill" onClick={()=>setShowGuide(v=>!v)} aria-expanded={showGuide}>❔ How to play</button></div>
        {showGuide && <div className="sugar-guide"><strong>YOUR 30-SECOND GUIDE:</strong> Pick a character below, roll the dice, and watch your pawn cross the 3D candy world. A surprise card changes your gem total or moves you. Read the big pop-up, collect, then the next guest takes their turn. Drag the board to rotate, use + and − to zoom, and click the character list to switch your star. Reach the candy castle to score a victory! This is a local pass-and-play adventure with fictional guest characters. Tap Roll to take each guest’s turn; it is not a live multiplayer room.</div>}
        <div className="sugar-game-shell">
          <div className="sugar-game-top"><div><span className="sugar-chip">LIVE CANDY REALM</span> <span className="sugar-chip">DECK: {CARD_COUNT} CARDS</span></div><div className="sugar-game-score">🎲 {turnPlayer?.name || 'Player'}'s turn · Round {turn}</div></div>
          <CandyLand3DScene tiles={tiles} players={players} activePlayerId={turnPlayer?.id||''} zoomLevel={zoom}/>
          <div className="sugar-board-controls"><div className="sugar-camera-buttons"><button onClick={()=>setZoom(n=>Math.max(-6,n-1))} aria-label="Zoom in"><ZoomIn/></button><button onClick={()=>setZoom(n=>Math.min(6,n+1))} aria-label="Zoom out"><ZoomOut/></button><button onClick={()=>setZoom(0)} aria-label="Reset camera zoom"><RotateCcw/></button></div>
            <button className="sugar-mainbtn" onClick={roll} disabled={isRolling||!!eventCard}><Dice5/> {isRolling?'ROLLING…':'ROLL THE MAGIC DICE!'}</button>
            <button className="sugar-otherbtn" onClick={reset}>↻ Reset game</button>
          </div>
          {lastCard && <p className="sugar-last-event">✨ Last surprise: <strong>{lastCard.title}</strong> · {lastDice!==null?'Rolled '+lastDice:''}</p>}
          <div className="sugar-scoreboard">{players.map((p,i)=><div className={'sugar-score '+(i===activePlayerIdx?'active':'')} key={p.id}><span className="sugar-scoreface">{byId(p.characterId).emoji}</span><div><strong>{p.name}</strong><small>Tile {p.tileIndex+1}/30 · {p.score} wins</small></div><span className="sugar-gems">💎{p.sugarGems}</span></div>)}</div>
        </div>
      </section>
      <section className="sugar-section sugar-cast-section"><span className="sugar-eyebrow">✦ PICK YOUR MAIN CHARACTER</span><h2>Meet the <em>chaos crew.</em></h2><p className="sugar-section-description">Playful, exaggerated fantasy versions of famous performers and larger-than-life characters. Dialogues are invented for this game, not real quotes or actual relationships.</p><div className="sugar-cast-grid">
        {CAST.map(c=><button type="button" key={c.id} onClick={()=>chooseCharacter(c.id)} className={'sugar-cast-card '+(character.id===c.id?'chosen':'')} style={{'--candy-hue':c.color} as React.CSSProperties}><span className="sugar-cast-face">{c.emoji}</span><strong>{c.name}</strong><small>{c.title}</small><span className="sugar-cast-ability">{c.abilityName}</span></button>)}
      </div><div className="sugar-cast-note"><span>👑 Your star: <strong>{character.name}</strong></span><span>✨ {character.abilityDesc}</span><button className="sugar-pill" onClick={()=>setEncounter(randomEncounter())}>Surprise character encounter ↗</button></div>
      {encounter && !eventCard && <div className="sugar-encounter" role="status"><span className="sugar-eyebrow">SUGAR CELEBRITY ENCOUNTER</span><p>{encounter}</p><button onClick={()=>setEncounter('')} aria-label="Dismiss encounter"><X size={17}/></button></div>}
      </section>
      <section className="sugar-endcap"><span>🍭</span><div><h2>The internet should feel <em>this fun.</em></h2><p>Take a little detour into something delightfully ridiculous.</p></div><button className="sugar-mainbtn" onClick={goBoard}>One more roll <ArrowRight/></button></section>
      <footer className="sugar-footer"><span>✦ RANDOMCANDYLAND.COM ✦</span><span>Made with sugar, imagination, and a spectacular lack of seriousness.</span><a href="#attractions">Back to the candy portals ↑</a></footer>
      {eventCard && <div className="sugar-modal-backdrop" role="presentation"><section className="sugar-reveal" role="dialog" aria-modal="true" aria-labelledby="reveal-heading" style={{'--reveal':eventCard.color} as React.CSSProperties}><div className="sugar-reveal-stamp">✦ THE UNIVERSE HAS SPOKEN ✦</div><div className="sugar-reveal-art">🍬✨🎲</div><span className="sugar-reveal-tag">CHAOS CARD #{eventCard.id.replace(/\D/g,'').slice(0,4)}</span><h2 id="reveal-heading">{eventCard.title}</h2><p>{eventCard.whatAnnouncement}</p><div className="sugar-reveal-awards"><span>{eventCard.moveDelta>=0?'+':''}{eventCard.moveDelta} bonus spaces</span><span>{eventCard.gemDelta>=0?'+':''}{eventCard.gemDelta} 💎</span></div><div className="sugar-reveal-encounter"><strong>✨ Character cameo</strong><p>{encounter}</p></div><button className="sugar-mainbtn" autoFocus onClick={advance}>Collect & continue <ArrowRight/></button></section></div>}
    </main>
  );
}
