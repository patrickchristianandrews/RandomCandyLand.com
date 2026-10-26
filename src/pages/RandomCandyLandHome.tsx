import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Download
} from 'lucide-react';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [isMuted, setIsMuted] = useState(() => sound.getIsMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen w-full bg-[#090511] text-white flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-black overflow-x-hidden">
      
      {/* Top Banner */}
      <header className="bg-[#120822]/90 backdrop-blur-md border-b-2 border-amber-500/40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍬</span>
          <div>
            <h1 className="text-base sm:text-lg font-serif-luxury font-black text-white tracking-wider flex items-center gap-2">
              <span className="gold-text-shimmer">RANDOM CANDY LAND</span>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 hidden sm:inline">
                randomcandyland.com
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToTrump}
            className="px-4 py-2 rounded-xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-black" />
            <span>Play Digi-Pet</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Main Home Hero */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-serif-luxury font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>randomcandyland.com</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl sm:text-6xl font-serif-luxury font-black text-white tracking-wide">
            Welcome to <br />
            <span className="gold-text-shimmer">Random Candy Land</span>
          </h2>
          <p className="text-base sm:text-lg text-amber-100/80 font-serif-luxury max-w-lg mx-auto">
            A playful place of sweet candy treats, pop culture fun, and the retro pocket virtual pet.
          </p>
        </div>

        {/* Direct Play Card - Straight to DigiPet */}
        <div 
          onClick={onNavigateToTrump}
          className="w-full max-w-md bg-gradient-to-b from-[#1c0f33] to-[#0d061a] border-2 border-amber-400/60 hover:border-amber-300 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.25)] cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-all text-center space-y-5 group relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

          {/* Mini Device Sprite */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-amber-300 to-amber-600 p-2 shadow-xl border-2 border-amber-200 flex flex-col items-center justify-center">
            <span className="text-4xl animate-bounce">👱</span>
            <span className="text-[8px] font-mono font-black text-black">POTUS</span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-serif-luxury text-amber-400 font-bold mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>RETRO 1997 HANDHELD</span>
            </div>
            <h3 className="text-2xl font-serif-luxury font-black text-white">
              Trump Gotcha Digi-Pet
            </h3>
            <p className="text-xs text-amber-200/70 font-mono mt-1">
              Tap below to enter fullscreen virtual pet
            </p>
          </div>

          <button
            onClick={onNavigateToTrump}
            className="w-full py-4 rounded-2xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-black" />
            <span>Open Digi-Pet</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-amber-500/20 bg-[#06020c] py-4 px-4 text-center text-xs text-amber-200/60 font-serif-luxury">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🍬</span>
            <span className="font-bold text-white">Random Candy Land</span>
          </div>
          <button
            onClick={onNavigateToTrump}
            className="text-amber-300 hover:text-white transition cursor-pointer text-xs font-bold"
          >
            Launch Digi-Pet →
          </button>
        </div>
      </footer>

    </div>
  );
}
