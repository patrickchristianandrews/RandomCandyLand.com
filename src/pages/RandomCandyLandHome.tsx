import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { candyAudio } from '../utils/candyAudio';
import { TrumpCartoonLookalike } from '../components/TrumpCartoonLookalike';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Dice5,
  PartyPopper,
  Compass,
  RefreshCw,
  Gift,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

// Iconic Candy Land Tile Colors
const CANDY_PATH_TILES = [
  { color: '#ef4444', label: 'Cherry Red', icon: '🍒' },
  { color: '#facc15', label: 'Lemon Drop', icon: '🍋' },
  { color: '#3b82f6', label: 'Blueberry', icon: '🫐' },
  { color: '#22c55e', label: 'Lime Green', icon: '🍏' },
  { color: '#f97316', label: 'Orange Pop', icon: '🍊' },
  { color: '#a855f7', label: 'Grape Swirl', icon: '🍇' },
];

const RANDOM_NONSENSE_FORTUNES = [
  "🎱 The Magic 8-Ball decrees: 100% chance of flying cotton candy today!",
  "🛸 Cosmic Transmission: Aliens just traded 4 galaxies for one strawberry lollipop.",
  "🦆 The Disco Duck says: 'QUACK! Life is better when you fist-pump like Trump!'",
  "🌮 Space Taco warning: Spicy salsa thrusters have entered orbit over Gumdrop Mountain.",
  "🍭 Scientific fact: Smiling at random candy burns approximately 0 calories, but increases joy by 10,000%!",
  "👑 Presidential Memo: 'Nobody has better lollipops than us, believe me. Tremendous candy!'",
  "🐔 Rubber Chicken Wisdom: 'Honk today, laugh tomorrow, eat jelly beans forever.'",
  "🎪 Amusement Alert: A new random surprise has just been sprinkled across the board!"
];

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [isMuted, setIsMuted] = useState(() => sound.getIsMuted());
  const [activeFortune, setActiveFortune] = useState<string>(RANDOM_NONSENSE_FORTUNES[0]);
  const [duckQuacks, setDuckQuacks] = useState<number>(0);
  const [tacoRotations, setTacoRotations] = useState<number>(0);
  const [alienAbductions, setAlienAbductions] = useState<number>(0);
  const [activeSpeech, setActiveSpeech] = useState<string>("TREMENDOUS! STEP INTO THE POCKET OVAL OFFICE!");

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleDuckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    candyAudio.playWinChime();
    setDuckQuacks(prev => prev + 1);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#ffd700', '#f59e0b', '#38bdf8']
    });
  };

  const handleTacoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    candyAudio.playChaosWarp();
    setTacoRotations(prev => prev + 1);
  };

  const handleUfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelectChime();
    setAlienAbductions(prev => prev + 1);
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#a855f7', '#22c55e', '#ec4899']
    });
  };

  const spinRandomNonsense = (e: React.MouseEvent) => {
    candyAudio.playJackpot();
    const nextIdx = Math.floor(Math.random() * RANDOM_NONSENSE_FORTUNES.length);
    setActiveFortune(RANDOM_NONSENSE_FORTUNES[nextIdx]);

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x: 0.5, y: 0.6 }
    });
  };

  const handleTrumpAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playButtonBlip();
    const quotes = [
      "TREMENDOUS! STEP INTO THE POCKET OVAL OFFICE!",
      "WE ARE WINNING BIG LEAGUE!",
      "BING BONG! TAP BELOW TO PLAY!",
      "I HAVE THE BEST CANDY IN THE WORLD!"
    ];
    const nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setActiveSpeech(nextQuote);
    sound.speakTrump(nextQuote, false, 'tremendous_amounts_of_dollars.mp3');
  };

  return (
    <div className="min-h-screen w-full bg-[#38bdf8] text-slate-900 font-sans select-none overflow-x-hidden relative flex flex-col justify-between">
      
      {/* CANDY LAND BOARD SKY & AMBIENT CLOUDS BACKGROUND */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 30%, #fbcfe8 70%, #fef08a 100%)',
        }}
      />

      {/* Scattered Fluffy Marshmallow Clouds */}
      <div className="absolute top-10 left-[5%] w-32 h-14 bg-white/80 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-16 right-[10%] w-44 h-16 bg-white/70 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-48 left-[75%] w-28 h-12 bg-white/60 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-96 left-[12%] w-36 h-14 bg-white/75 rounded-full blur-[1px] pointer-events-none" />

      {/* TOP CANDY LAND GAME BANNER HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-pink-400 px-4 sm:px-8 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-yellow-400 to-sky-400 p-1 shadow-md flex items-center justify-center animate-bounce">
            <span className="text-2xl">🍭</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-serif-luxury font-black text-pink-600 tracking-wider flex items-center gap-2 drop-shadow-sm">
              <span>RANDOM CANDY LAND</span>
              <span className="text-[11px] font-mono text-pink-700 bg-pink-100 border border-pink-300 px-2 py-0.5 rounded-full hidden sm:inline">
                randomcandyland.com
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToTrump}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-105 text-slate-950 font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-md border-2 border-yellow-500 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Crown className="w-4 h-4 text-amber-900" />
            <span>Play Trump Gotcha</span>
            <ArrowRight className="w-4 h-4 text-amber-900" />
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-2xl bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-300 shadow transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-pink-600" />}
          </button>
        </div>
      </header>

      {/* MAIN CANDY LAND PLAYGROUND VIEWPORT */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col items-center space-y-12">
        
        {/* BOARD WELCOME SIGNPOST */}
        <div className="relative text-center max-w-3xl space-y-3 bg-white/85 backdrop-blur-sm border-4 border-pink-400 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Peppermint Banner Pins */}
          <div className="absolute -top-4 -left-4 text-3xl animate-spin duration-3000">🍥</div>
          <div className="absolute -top-4 -right-4 text-3xl animate-spin duration-3000">🍥</div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 border-2 border-pink-400 text-pink-700 text-xs font-serif-luxury font-black tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>THE CARNIVAL OF RANDOM AMUSEMENT</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif-luxury font-black text-slate-900 tracking-wide leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500">Random Candy Land!</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
            Your cheerful corner of the internet built for <strong>pure, spontaneous amusement!</strong> Whether you need a quick laugh, a silly surprise, or a dose of colorful whimsy, this is a magical place where <strong>new fun and random games are added all the time</strong>.
          </p>

          {/* Live Fun Announcement Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-800">
            <span className="bg-yellow-200 border border-yellow-400 px-3 py-1 rounded-full shadow-sm">
              🎡 Always Expanding with New Quirky Toys!
            </span>
            <span className="bg-purple-100 border border-purple-300 text-purple-800 px-3 py-1 rounded-full shadow-sm">
              🎲 Tap Random Critters on the Board Below!
            </span>
          </div>
        </div>

        {/* CANDY LAND WINDING BOARD PATH (S-Curve Road) */}
        <div className="w-full flex items-center justify-center py-2 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/70 p-3 sm:p-4 rounded-3xl border-4 border-yellow-400 shadow-xl">
            <span className="font-serif-luxury font-black text-xs text-pink-600 uppercase pr-1 hidden md:inline">
              🏁 Start of Rainbow Path:
            </span>
            {CANDY_PATH_TILES.concat(CANDY_PATH_TILES).map((tile, idx) => (
              <div 
                key={idx}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md transform hover:scale-110 active:scale-90 transition-transform cursor-pointer border-2 border-white/80"
                style={{ backgroundColor: tile.color }}
                onClick={() => {
                  candyAudio.playBubblePop();
                  confetti({ particleCount: 15, spread: 45, colors: [tile.color] });
                }}
                title={tile.label}
              >
                <span className="text-xs sm:text-base drop-shadow">{tile.icon}</span>
              </div>
            ))}
            <span className="text-xl">🏰</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTERPIECE: THE OFFICIAL TRUMP GOTCHA DIGI-PET CARD           */}
        {/* FEATURING THE EXACT CARTOON DONALD TRUMP LOOKALIKE             */}
        {/* ============================================================== */}
        <div 
          onClick={onNavigateToTrump}
          className="w-full max-w-2xl bg-gradient-to-b from-white via-amber-50 to-yellow-100 border-4 border-amber-400 hover:border-yellow-500 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.35)] cursor-pointer transform hover:scale-[1.02] active:scale-[0.99] transition-all relative overflow-hidden group"
        >
          {/* Top Gilded Ribbon */}
          <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            
            {/* EXACT CARTOON TRUMP LOOKALIKE AVATAR */}
            <div 
              className="relative shrink-0 flex flex-col items-center"
              onClick={handleTrumpAvatarClick}
              title="Click Trump to hear his phrase!"
            >
              {/* Golden Candy Medallion Ring */}
              <div className="relative rounded-full p-2 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-2xl border-4 border-yellow-300">
                <TrumpCartoonLookalike size={175} animate={true} />
              </div>

              {/* Tag below character */}
              <div className="absolute -bottom-2 bg-amber-950 text-yellow-300 border-2 border-yellow-400 px-3 py-0.5 rounded-full text-[11px] font-mono font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>EXACT CARTOON LOOKALIKE</span>
              </div>
            </div>

            {/* CARD DETAILS & INSTANT DIRECT PLAY CTA */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-serif-luxury font-black uppercase">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>FEATURED AMUSEMENT #1</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-serif-luxury font-black text-slate-900 tracking-wide">
                Trump Gotcha Digi-Pet
              </h3>

              {/* Speech Bubble */}
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-2.5 text-xs font-mono font-bold text-amber-900 shadow-sm relative">
                <div className="absolute -left-2 top-3 w-3 h-3 bg-white border-l-2 border-b-2 border-amber-400 transform rotate-45 hidden sm:block" />
                <span>"{activeSpeech}"</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Tap anywhere on this golden card to enter the full-screen handheld virtual pet!
              </p>

              {/* Direct Launch Button */}
              <button
                onClick={onNavigateToTrump}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-serif-luxury font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 border-2 border-yellow-600 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Open Trump Gotcha Digi-Pet</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* A BUNCH OF RANDOM CANDY LAND AMUSEMENTS & CRITTERS             */}
        {/* Scattered interactive objects all over the board               */}
        {/* ============================================================== */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between text-slate-900 font-serif-luxury font-black text-sm sm:text-base px-2">
            <span className="flex items-center gap-2">
              <Dice5 className="w-5 h-5 text-purple-600" />
              <span>TAP THE RANDOM AMUSEMENTS SCATTERED ON THE BOARD:</span>
            </span>
            <span className="text-xs text-purple-700 font-bold hidden sm:inline">
              ✨ Fresh Fun Added Weekly!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Random Critter 1: UFO Gummy Bear Abduction */}
            <div 
              onClick={handleUfoClick}
              className="bg-white/85 hover:bg-white border-3 border-purple-400 rounded-2xl p-4 shadow-lg cursor-pointer transform hover:-translate-y-1 active:scale-95 transition-all text-center space-y-2 group"
            >
              <div className="text-4xl group-hover:animate-bounce">🛸</div>
              <div className="font-serif-luxury font-black text-xs text-purple-900 uppercase">
                COSMIC UFO BEAM
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Beaming up gummy bears!
              </p>
              <span className="inline-block text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                Abductions: {alienAbductions}
              </span>
            </div>

            {/* Random Critter 2: Disco Rubber Duck */}
            <div 
              onClick={handleDuckClick}
              className="bg-white/85 hover:bg-white border-3 border-yellow-400 rounded-2xl p-4 shadow-lg cursor-pointer transform hover:-translate-y-1 active:scale-95 transition-all text-center space-y-2 group"
            >
              <div className="text-4xl group-hover:rotate-12 transition-transform">🦆</div>
              <div className="font-serif-luxury font-black text-xs text-amber-900 uppercase">
                DISCO SHADES DUCK
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Floating on pudding!
              </p>
              <span className="inline-block text-[10px] font-mono font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                Quacks: {duckQuacks}
              </span>
            </div>

            {/* Random Critter 3: Rocket Propelled Taco */}
            <div 
              onClick={handleTacoClick}
              className="bg-white/85 hover:bg-white border-3 border-orange-400 rounded-2xl p-4 shadow-lg cursor-pointer transform hover:-translate-y-1 active:scale-95 transition-all text-center space-y-2 group"
            >
              <div 
                className="text-4xl transition-transform duration-500"
                style={{ transform: `rotate(${tacoRotations * 90}deg)` }}
              >
                🌮
              </div>
              <div className="font-serif-luxury font-black text-xs text-orange-900 uppercase">
                ROCKET TACO
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Salsa thrusters active!
              </p>
              <span className="inline-block text-[10px] font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                Orbit Spins: {tacoRotations}
              </span>
            </div>

            {/* Random Critter 4: Rubber Chicken Oracle */}
            <div 
              onClick={() => {
                candyAudio.playWinChime();
                confetti({ particleCount: 20, spread: 50 });
              }}
              className="bg-white/85 hover:bg-white border-3 border-red-400 rounded-2xl p-4 shadow-lg cursor-pointer transform hover:-translate-y-1 active:scale-95 transition-all text-center space-y-2 group"
            >
              <div className="text-4xl group-hover:scale-125 transition-transform">🐔</div>
              <div className="font-serif-luxury font-black text-xs text-red-900 uppercase">
                HONKING CHICKEN
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Honk for instant cheer!
              </p>
              <span className="inline-block text-[10px] font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Tap to Honk!
              </span>
            </div>

          </div>
        </div>

        {/* RANDOM NONSENSE DISPENSER (Magic 8-Ball Generator) */}
        <div className="w-full bg-white/90 border-4 border-indigo-400 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-serif-luxury font-black uppercase">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span>RANDOM AMUSEMENT DISPENSER</span>
          </div>

          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-indigo-950 text-indigo-100 font-mono text-sm sm:text-base border-2 border-indigo-500 shadow-inner">
            {activeFortune}
          </div>

          <button
            onClick={spinRandomNonsense}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-95"
          >
            <PartyPopper className="w-4 h-4 text-yellow-300" />
            <span>Spin for More Random Amusement!</span>
          </button>
        </div>

      </main>

      {/* CANDY LAND SWEET FOOTER */}
      <footer className="relative z-10 border-t-4 border-pink-400 bg-white/95 py-5 px-4 text-center text-xs text-slate-700 font-serif-luxury shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍭</span>
            <span className="font-black text-pink-600">Random Candy Land</span>
            <span>&bull;</span>
            <span className="font-mono text-slate-500">randomcandyland.com</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToTrump}
              className="text-pink-600 hover:text-pink-800 font-black transition cursor-pointer flex items-center gap-1"
            >
              <span>Play Trump Gotcha Digi-Pet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            A playful place for random amusement &bull; New fun added constantly!
          </p>
        </div>
      </footer>

    </div>
  );
}
