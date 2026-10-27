import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { candyAudio } from '../utils/candyAudio';
import { TrumpCartoonLookalike } from '../components/TrumpCartoonLookalike';
import { CandyLand3DScene } from '../components/candyland3d/CandyLand3DScene';
import { generate3DBoardTiles, ABSURD_CHAOS_CARDS } from '../utils/candyChaosEngine';
import { ChaosPlayer, BoardTile3D, ChaosCard } from '../types/candyChaos';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Dice5,
  QrCode,
  Users,
  Smartphone,
  ExternalLink,
  RotateCw,
  Trophy,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [isMuted, setIsMuted] = useState(() => sound.getIsMuted());
  const [tiles] = useState<BoardTile3D[]>(() => generate3DBoardTiles());
  const [players, setPlayers] = useState<ChaosPlayer[]>([
    {
      id: 'p_trump',
      name: 'Donald',
      characterId: 'trumpagotchi',
      tileIndex: 4,
      sugarGems: 120,
      isHost: true,
      isAi: false,
      isConnected: true,
      score: 1,
      shieldActive: false,
    },
    {
      id: 'p_marshmallow',
      name: 'Sir Fluffernutter',
      characterId: 'marshmallow',
      tileIndex: 2,
      sugarGems: 60,
      isHost: false,
      isAi: true,
      isConnected: true,
      score: 0,
      shieldActive: false,
    },
    {
      id: 'p_peppermint',
      name: 'Baron Mint',
      characterId: 'peppermint',
      tileIndex: 1,
      sugarGems: 85,
      isHost: false,
      isAi: true,
      isConnected: true,
      score: 0,
      shieldActive: false,
    }
  ]);

  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [lastDice, setLastDice] = useState<number | null>(4);
  const [activeCard, setActiveCard] = useState<ChaosCard>(ABSURD_CHAOS_CARDS[0]);
  const [showQrTicket, setShowQrTicket] = useState<boolean>(false);
  const [roomCode] = useState<string>(() => 'SUGR' + Math.floor(Math.random() * 90 + 10));
  const [spinnerAngle, setSpinnerAngle] = useState<number>(45);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>(
    "GAME ON: Roll the dice, watch the 3D board leap, or scan the QR ticket with your phone to invite friends!"
  );

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?room=${roomCode}` 
    : `https://randomcandyland.com/?room=${roomCode}`;

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Roll Physical 3D Board Dice
  const handleRollDice = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    candyAudio.playReelTick();

    const roll = Math.floor(Math.random() * 6) + 1;
    const newAngle = spinnerAngle + 720 + roll * 60;
    setSpinnerAngle(newAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setLastDice(roll);
      candyAudio.playJackpot();

      // Move active player forward
      setPlayers(prev => {
        const next = [...prev];
        const current = next[activePlayerIdx];
        const targetTile = Math.min(29, current.tileIndex + roll);
        current.tileIndex = targetTile;
        current.sugarGems += roll * 10;
        return next;
      });

      // Draw random absurd "WHAT?!" card
      const card = ABSURD_CHAOS_CARDS[Math.floor(Math.random() * ABSURD_CHAOS_CARDS.length)];
      setActiveCard(card);
      setAnnouncement(`🎲 ROLLED A ${roll}! "${card.title}": ${card.whatAnnouncement}`);

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
        colors: [card.color, '#ffd700']
      });

      // Next player turn
      setActivePlayerIdx(prev => (prev + 1) % players.length);
    }, 900);
  };

  const handleTrumpAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playButtonBlip();
    const quotes = [
      "TREMENDOUS! STEP INTO THE POCKET OVAL OFFICE!",
      "WE ARE WINNING BIG LEAGUE!",
      "BING BONG! WELCOME TO TRUMPAGOTCHI!",
      "NOBODY BUILDS A 3D BOARD GAME BETTER THAN ME!"
    ];
    const nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    sound.speakTrump(nextQuote, false, 'tremendous_amounts_of_dollars.mp3');
  };

  return (
    <div className="min-h-screen w-full tabletop-wood text-neutral-100 font-sans select-none overflow-x-hidden relative flex flex-col justify-between p-2 sm:p-6">
      
      {/* NEW: Standalone adults-only curiosity experience */}
      <section aria-label="After Dark adult curiosity offering" className="rounded-2xl border-2 border-fuchsia-300/70 bg-gradient-to-r from-[#24102d] via-[#311a40] to-[#191024] p-4 sm:p-6 shadow-[0_12px_35px_rgba(30,0,35,0.5)] text-white">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[.2em] font-black uppercase text-fuchsia-200 mb-1">New offering · 18+ only</p>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-black text-white">✳ After Dark — The Curiosity Atlas</h2>
            <p className="mt-2 text-sm text-fuchsia-100/90">Explore the psychology of adult interests, take an abstract curiosity quiz, and discover consent-first couples' ideas.</p>
          </div>
          <a href="/after-dark/" className="inline-flex shrink-0 justify-center items-center gap-2 rounded-xl border border-fuchsia-200 bg-fuchsia-200 px-5 py-3 font-black text-sm text-[#29142f] hover:bg-white transition-colors" aria-label="Open After Dark, adults only">
            Enter After Dark <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* RETRO CORNER TAPE & VINTAGE BOARD GAME TABLETOP DECOR */}
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* PHYSICAL GAME BOX HEADER / MANILA BANNER */}
        <header className="relative bg-[#faf5e8] border-4 border-[#3b1d11] rounded-2xl p-4 sm:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.6)] text-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 cardboard-texture">
          
          {/* Masking tape on top-left corner */}
          <div className="absolute -top-3 left-6 w-24 h-6 bg-[#ecd9ad]/90 transform -rotate-2 border-x border-[#cbb585] shadow-sm pointer-events-none" />
          
          {/* KB Toys Price Tag Sticker */}
          <div className="absolute -top-3 right-8 bg-[#fef08a] text-[#713f12] border-2 border-[#ca8a04] px-3 py-1 rounded font-mono font-black text-xs transform rotate-3 shadow-md pointer-events-none hidden sm:block">
            <span>KB TOYS $4.99</span>
          </div>

          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-yellow-400 to-pink-500 p-1 border-3 border-black shadow-lg flex items-center justify-center text-3xl">
              🍬
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-bungee text-2xl sm:text-4xl text-[#991b1b] tracking-wider drop-shadow-sm">
                  RANDOM CANDY LAND
                </span>
              </div>
              <p className="font-marker text-xs sm:text-sm text-[#78350f]">
                The Unhinged 3D Board Game &bull; randomcandyland.com &bull; Item No. 1997-CHAOS
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowQrTicket(prev => !prev)}
              className="px-3.5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-amber-300 border-2 border-amber-400 text-xs font-bungee tracking-wide shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Invite friends using scannable QR Code"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span>Invite via QR</span>
            </button>

            <button
              onClick={onNavigateToTrump}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black border-2 border-black text-xs font-bungee tracking-wide shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Crown className="w-4 h-4 text-black" />
              <span>Trumpagotchi</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border-2 border-neutral-700 shadow cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-700" />}
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* CENTERPIECE: THE 3D ROLLERCOASTER CANDY BOARD & MULTIPLAYER   */}
        {/* ============================================================== */}
        <section className="relative bg-[#1c0e08] border-4 border-[#4a2213] rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
          
          {/* Physical Game Board Header & Live Ticker */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-[#381809] pb-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bungee text-sm">
              <span className="text-xl">🎲</span>
              <span>CANDY LAND: SUGAR CHAOS 3D (INTERACTIVE BOARD)</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-300">
              <span className="bg-black/60 px-2.5 py-1 rounded border border-neutral-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Room: <strong className="text-amber-300">{roomCode}</strong></span>
              </span>
              <button
                onClick={() => setShowQrTicket(true)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40 font-bold cursor-pointer"
              >
                Scan to Join Phone 📱
              </button>
            </div>
          </div>

          {/* THE 3D THREE.JS ROLLERCOASTER BOARD */}
          <CandyLand3DScene
            tiles={tiles}
            players={players}
            activePlayerId={players[activePlayerIdx]?.id || ''}
          />

          {/* PHYSICAL BOARD GAME CONTROLS TRAY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#29130a] p-4 rounded-2xl border-2 border-[#542714]">
            
            {/* 1. Turn Announcement Ticker */}
            <div className="space-y-1">
              <div className="text-[10px] font-bungee text-amber-400 uppercase flex items-center gap-1">
                <span>TURN EVENT BULLETIN</span>
              </div>
              <div className="bg-[#120804] border border-[#542714] rounded-xl p-3 text-xs font-mono text-neutral-200 leading-snug min-h-[58px]">
                {announcement}
              </div>
            </div>

            {/* 2. Physical Spinner / Big Dice Button */}
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <button
                onClick={handleRollDice}
                disabled={isSpinning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:brightness-110 text-white font-bungee text-sm tracking-wider transition shadow-xl border-3 border-black cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Dice5 className="w-5 h-5 text-yellow-200" />
                <span>{isSpinning ? 'SPINNING WHEEL...' : 'ROLL 3D CANDY DICE!'}</span>
              </button>
              <span className="text-[11px] font-marker text-amber-300">
                {lastDice ? `Last Rolled: ${lastDice} Space${lastDice > 1 ? 's' : ''}` : 'Tap button to advance your pawn!'}
              </span>
            </div>

            {/* 3. Drawn Absurd Card Display */}
            <div className="bg-[#faf5e8] text-neutral-900 border-2 border-black rounded-xl p-3 shadow-md cardboard-texture space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bungee text-[#991b1b]">
                <span>DRAWN FATE CARD:</span>
                <span className="bg-red-200 px-1.5 py-0.5 rounded text-[9px] font-bold">CHAOS</span>
              </div>
              <div className="font-bungee text-xs text-black">
                {activeCard.title}
              </div>
              <p className="text-[11px] font-sans text-neutral-700 leading-tight">
                {activeCard.whatAnnouncement}
              </p>
            </div>

          </div>

          {/* Active 3D Players Leaderboard */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bungee text-neutral-400 uppercase pr-1 shrink-0">
              BOARD PAWNS:
            </span>
            {players.map((p, idx) => (
              <div 
                key={p.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono shrink-0 ${
                  activePlayerIdx === idx 
                    ? 'bg-amber-400 text-black border-white font-black shadow-md' 
                    : 'bg-black/50 text-neutral-300 border-neutral-700'
                }`}
              >
                <span>{p.characterId === 'trumpagotchi' ? '👱‍♂️' : p.characterId === 'marshmallow' ? '🎩' : '🛡️'}</span>
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75">Tile #{p.tileIndex}</span>
                <span className="text-[10px] text-yellow-300 font-bold">💎{p.sugarGems}</span>
              </div>
            ))}
          </div>

        </section>

        {/* ============================================================== */}
        {/* TRUMPAGOTCHI PHYSICAL KEYCHAIN PACKAGING DISPLAY               */}
        {/* ============================================================== */}
        <section 
          onClick={onNavigateToTrump}
          className="relative bg-gradient-to-b from-[#1c1206] to-[#0a0602] border-4 border-amber-400 hover:border-yellow-300 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.25)] cursor-pointer group transition-all"
        >
          {/* Cardboard hanger slot (like vintage toy store pegs) */}
          <div className="w-20 h-4 mx-auto mb-4 bg-black/60 rounded-full border border-amber-500/40" />

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            
            {/* Physical Keychain Visual with Golden Ring */}
            <div 
              className="relative shrink-0 flex flex-col items-center"
              onClick={handleTrumpAvatarClick}
            >
              {/* Keychain loop */}
              <div className="w-8 h-8 rounded-full border-4 border-neutral-400 -mb-2 shadow-inner" />
              
              {/* Gold Toy Medallion */}
              <div className="relative rounded-full p-2 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-2xl border-4 border-yellow-300 group-hover:scale-105 transition-transform">
                <TrumpCartoonLookalike size={170} animate={true} />
              </div>
            </div>

            {/* Toy Details & Action */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bungee">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>OFFICIAL 1997 RETRO POCKET PET</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-bungee text-white tracking-wide">
                Trumpagotchi
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                Feed prime steaks with ketchup, do the iconic YMCA fist-pump dance, scream at fake news, play golf at Bedminster, and evolve from Queens to the White House. <strong>Now with phone emergency push alerts if his stats collapse!</strong>
              </p>

              <button
                onClick={onNavigateToTrump}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-bungee text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 border-2 border-black cursor-pointer"
              >
                <Crown className="w-4 h-4 text-black" />
                <span>Pick Up &amp; Play Trumpagotchi</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* WHY THIS WEBSITE EXISTS: HUMAN HUMOR & MANIFESTO               */}
        {/* ============================================================== */}
        <section className="bg-[#faf5e8] text-neutral-900 border-4 border-[#3b1d11] rounded-2xl p-6 sm:p-8 cardboard-texture shadow-xl relative space-y-4">
          
          {/* Post-It note attached to the board */}
          <div className="sm:absolute -top-4 right-8 bg-[#fef08a] border border-[#ca8a04] p-3 rounded shadow-md transform rotate-2 max-w-xs text-xs font-marker text-[#713f12]">
            📌 NOTE TO PLAYERS: New random amusements, 3D mini-games, and absurd toys get added all the time. Do not question the gummy bear.
          </div>

          <div className="space-y-1">
            <h4 className="font-bungee text-xl text-[#991b1b]">
              WHY DOES RANDOM CANDY LAND EXIST?
            </h4>
            <p className="font-marker text-xs text-[#78350f]">
              An honest explanation from the human creator
            </p>
          </div>

          <p className="text-sm font-sans text-neutral-800 leading-relaxed max-w-2xl">
            Because someone bought <strong>randomcandyland.com</strong> in the middle of the night, drank too much sugary soda, and decided the internet took itself way too seriously. This isn't a corporate startup or an AI cookie-cutter landing page—it's a living, chaotic sandbox built for <strong>pure, unfiltered amusement</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-white/80 p-3 rounded-xl border border-[#d6c59b]">
              <div className="font-bungee text-xs text-black mb-1">🎮 3D Board Game</div>
              <p className="text-neutral-600">Roll dice, trigger hilarious "WHAT?!" announcements, and challenge friends via QR codes.</p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-[#d6c59b]">
              <div className="font-bungee text-xs text-black mb-1">👱‍♂️ Trumpagotchi</div>
              <p className="text-neutral-600">38 authentic Donald Trump voice clips, 5 evolution stages, and lock-screen emergency notifications.</p>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-[#d6c59b]">
              <div className="font-bungee text-xs text-black mb-1">🎡 Expanding Weekly</div>
              <p className="text-neutral-600">Fresh slapstick mini-games and quirky experiments added continuously.</p>
            </div>
          </div>
        </section>

      </div>

      {/* ============================================================== */}
      {/* QR CODE SCAN-TO-JOIN MULTIPLAYER MODAL TICKET                  */}
      {/* ============================================================== */}
      {showQrTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#faf5e8] text-neutral-900 border-4 border-[#3b1d11] rounded-3xl p-6 cardboard-texture shadow-2xl relative space-y-4 animate-in zoom-in-95">
            
            <button
              onClick={() => setShowQrTicket(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-black/10 hover:bg-black/20 text-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="font-marker text-xs text-[#78350f] uppercase">
                &bull; MULTIPLAYER BOARD TICKET &bull;
              </span>
              <h3 className="font-bungee text-2xl text-[#991b1b]">
                SCAN TO PLAY ON YOUR PHONE!
              </h3>
              <p className="text-xs text-neutral-600 font-sans">
                Point your iPhone Camera or Android Google Lens at the code below to join this 3D board room:
              </p>
            </div>

            {/* Centered High-Res QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-black mx-auto w-fit shadow-md">
              <QRCodeSVG
                value={joinUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            <div className="text-center space-y-1">
              <div className="font-mono text-sm font-black text-black">
                ROOM CODE: <span className="bg-yellow-200 px-2 py-0.5 rounded border border-yellow-400">{roomCode}</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                {joinUrl}
              </p>
            </div>

            <button
              onClick={() => setShowQrTicket(false)}
              className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bungee text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Close Ticket &amp; Return to Board
            </button>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-8 border-t-2 border-[#381809] pt-4 text-center text-xs text-neutral-400 font-mono">
        <p>Random Candy Land (randomcandyland.com) &bull; Built with love, sugar, and 100% human humor &bull; No generic AI templates allowed.</p>
      </footer>

    </div>
  );
}
