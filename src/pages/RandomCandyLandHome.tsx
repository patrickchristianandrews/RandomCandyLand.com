import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Download, 
  Smartphone, 
  Heart, 
  Award,
  Zap,
  Globe
} from 'lucide-react';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

const QUICK_TRUMP_CLIPS = [
  { label: 'TREMENDOUS!', clip: 'tremendous_amounts_of_dollars.mp3' },
  { label: 'BING BONG!', clip: 'bingbong.mp3' },
  { label: 'WRONG!', clip: 'wrong.mp3' },
  { label: 'REALLY RICH!', clip: 'im_really_rich.mp3' },
  { label: 'SO AMAZING!', clip: 'so_amazing.mp3' },
  { label: 'WE ARE WINNING!', clip: 'maybe_winning.mp3' },
];

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [isMuted, setIsMuted] = useState(() => sound.getIsMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen w-full bg-[#090511] text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black overflow-x-hidden">
      
      {/* 24K Top Banner */}
      <header className="sticky top-0 z-40 bg-[#120822]/90 backdrop-blur-md border-b-2 border-amber-500/40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍬</span>
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
            <span>Play Trump Gotcha</span>
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

      {/* Hero Showcase Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
        
        {/* Welcome Tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-serif-luxury font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome to randomcandyland.com</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-black text-white tracking-wide leading-tight">
            The Whimsical Wonderland of <br className="hidden sm:inline" />
            <span className="gold-text-shimmer">Everything Random</span>
          </h2>
          <p className="text-sm sm:text-base text-amber-100/75 max-w-2xl mx-auto font-serif-luxury leading-relaxed">
            Welcome to Random Candy Land — your portal for sweet confectionery wonder, pop culture absurdity, and the legendary handheld virtual pet!
          </p>
        </div>

        {/* PRIMARY FEATURED ATTRACTION: TRUMP GOTCHA HERO CARD */}
        <div className="bg-gradient-to-b from-[#1f1035] via-[#140a24] to-[#0c0517] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(212,175,55,0.2)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Device Preview Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={onNavigateToTrump}>
                {/* Handheld Shell Mockup */}
                <div className="w-56 sm:w-64 rounded-[50px_50px_60px_60px] bg-gradient-to-b from-[#ffd700] via-[#d4af37] to-[#aa771c] p-4 shadow-2xl border-4 border-amber-300 transform group-hover:scale-105 transition duration-300">
                  <div className="bg-black/90 rounded-2xl p-3 border-2 border-black flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold text-amber-400 mb-2">★ TRUMP GOTCHA 1997 ★</span>
                    
                    {/* Retro LCD Screen */}
                    <div className="w-full h-36 bg-[#8fae85] rounded-xl border-3 border-black/50 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      <div className="text-5xl animate-bounce">👱</div>
                      <span className="text-[10px] font-mono font-black text-black mt-1">POTUS PET</span>
                      <span className="text-[8px] font-mono text-black/70">TOUCH TO PLAY</span>
                    </div>

                    {/* 3 Handheld Buttons A, B, C */}
                    <div className="flex justify-between w-full mt-3 px-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-amber-700 border border-amber-500 shadow-sm" />
                        <span className="text-[8px] font-mono text-amber-300 mt-0.5">A</span>
                      </div>
                      <div className="flex flex-col items-center -mt-1">
                        <div className="w-6 h-6 rounded-full bg-amber-500 border border-amber-300 shadow-sm" />
                        <span className="text-[8px] font-mono text-amber-200 mt-0.5">B</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-amber-700 border border-amber-500 shadow-sm" />
                        <span className="text-[8px] font-mono text-amber-300 mt-0.5">C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-black/90 border border-amber-400 text-[10px] font-mono font-bold text-amber-300 shadow-md">
                    📱 FULL SCREEN ON MOBILE
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Description & Big Launch CTA */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-serif-luxury font-bold text-amber-400">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>FEATURED CANDY LAND ATTRACTION</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-serif-luxury font-black text-white tracking-wide">
                Trump Gotcha Virtual Digi-Pet
              </h3>

              <p className="text-sm sm:text-base text-amber-100/80 font-serif-luxury leading-relaxed">
                Step inside the pocket Oval Office! Feed him prime steaks with ketchup, practice the iconic YMCA double fist-pump dance, yell at dishonest anchors on television, hit 340-yard drives at Bedminster Golf, and sign bilateral trade deals with the thick black Sharpie!
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-serif-luxury">
                <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-200 font-bold">38 Real Voice Master Clips</span>
                </div>
                <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-amber-200 font-bold">Full Screen on Mobile</span>
                </div>
                <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-200 font-bold">3 Mini-Games Included</span>
                </div>
              </div>

              {/* Big Golden Launch Button */}
              <div className="pt-2">
                <button
                  onClick={onNavigateToTrump}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-sm uppercase tracking-wider transition shadow-[0_10px_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 cursor-pointer active:scale-95"
                >
                  <Crown className="w-5 h-5 text-black" />
                  <span>Open Trump Gotcha Digi-Pet</span>
                  <ArrowRight className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Voice Soundboard Bar */}
        <div className="bg-black/60 border-2 border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-serif-luxury text-amber-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Volume2 className="w-4 h-4 text-amber-400" />
              HEAR 100% REAL DONALD TRUMP VOICE CLIPS:
            </span>
            <span className="text-[11px] text-amber-200/60 hidden sm:inline">CLICK TO LISTEN</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_TRUMP_CLIPS.map(item => (
              <button
                key={item.label}
                onClick={() => sound.speakTrump(item.label, false, item.clip)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#1c122e] to-[#0c0617] hover:border-amber-300 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-serif-luxury font-bold transition cursor-pointer active:scale-95 shadow-sm"
              >
                "{item.label}"
              </button>
            ))}
          </div>
        </div>

        {/* Download Codebase & Deployment Info */}
        <div className="bg-gradient-to-r from-[#170a2c] via-[#0f061c] to-[#170a2c] border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-serif-luxury font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Full Project Codebase &amp; Audio Master Bundle</span>
            </h4>
            <p className="text-xs text-amber-200/70 font-serif-luxury">
              Includes all source files, 38 authentic Trump voice recordings, and GitHub Pages configuration for randomcandyland.com.
            </p>
          </div>

          <a
            href="/randomcandyland-complete.zip"
            download="randomcandyland-complete.zip"
            className="px-5 py-2.5 rounded-xl gold-shimmer text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shrink-0 flex items-center gap-2 active:scale-95 shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Download ZIP</span>
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 bg-[#06020c] py-6 px-4 text-center text-xs text-amber-200/60 font-serif-luxury">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🍬</span>
            <span className="font-bold text-white">Random Candy Land</span>
            <span>&bull;</span>
            <span className="text-amber-400">randomcandyland.com</span>
          </div>

          <button
            onClick={onNavigateToTrump}
            className="text-amber-300 hover:text-white transition cursor-pointer underline underline-offset-4"
          >
            Launch Trump Gotcha Digi-Pet →
          </button>

          <p className="text-[10px] text-amber-400/40">
            Certified 100% Authentic Donald Trump Audio &bull; Handheld Digi-Pet Experience
          </p>
        </div>
      </footer>

    </div>
  );
}
