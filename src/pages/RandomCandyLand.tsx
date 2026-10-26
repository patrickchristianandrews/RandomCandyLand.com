import React, { useState } from 'react';
import { TrumpagotchiCabinetCard } from '../components/TrumpagotchiCabinetCard';
import { GumballOracle } from '../components/GumballOracle';
import { SugarRushSlots } from '../components/SugarRushSlots';
import { GobstopperBeatSynth } from '../components/GobstopperBeatSynth';
import { MysteryCandyVault } from '../components/MysteryCandyVault';
import { RandomChaosGenerator } from '../components/RandomChaosGenerator';
import { DomainDeployModal } from '../components/DomainDeployModal';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Gamepad2, 
  Globe, 
  Download, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Shuffle, 
  Zap, 
  Coins, 
  Crown, 
  Award,
  ExternalLink 
} from 'lucide-react';

interface RandomCandyLandProps {
  onNavigateToTrump: () => void;
}

const QUICK_VOICE_QUOTES = [
  { label: 'TREMENDOUS!', clip: 'tremendous_amounts_of_dollars.mp3' },
  { label: 'WE ARE WINNING!', clip: 'were_going_to_do_a_fantastic_job.mp3' },
  { label: 'REALLY RICH!', clip: 'im_really_rich.mp3' },
  { label: 'BING BING BONG!', clip: 'bingbong.mp3' },
  { label: 'BEST COURSES!', clip: 'i_have_the_best_courses_in_the_world.mp3' },
  { label: 'BETTER THAN EVER!', clip: 'better_than_ever_before.mp3' },
];

export function RandomCandyLand({ onNavigateToTrump }: RandomCandyLandProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'gameroom' | 'chaos' | 'vault'>('all');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => candyAudio.getIsMuted());

  const handleToggleMute = () => {
    const muted = candyAudio.toggleMute();
    sound.toggleMute();
    setIsMuted(muted);
  };

  const handleQuickChaos = () => {
    candyAudio.playChaosWarp();
    const el = document.getElementById('chaos-suite');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-slate-100 font-sans selection:bg-amber-400 selection:text-black relative overflow-x-hidden">
      {/* 24K Gold Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/2 left-2/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0c0716]/90 backdrop-blur-md border-b border-amber-500/25 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* ZONE 1 (Left): Brandmark & Domain */}
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow">⚜️</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif-luxury font-bold tracking-wider text-white">
                  RANDOM CANDY LAND
                </h1>
                <span className="text-amber-400/60 hidden sm:inline">&bull;</span>
                <span className="text-xs font-serif-luxury text-amber-300/80 hidden sm:inline">
                  randomcandyland.com
                </span>
              </div>
              <p className="text-[10px] font-serif-luxury tracking-widest text-amber-400/70 hidden sm:block">
                THE FIVE-STAR CONFECTIONERY RESORT &amp; CASINO
              </p>
            </div>
          </div>

          {/* ZONE 2 (Center): Segmented Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-amber-500/30">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif-luxury font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'gold-shimmer text-black shadow-md'
                  : 'text-amber-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              All Attractions
            </button>
            <button
              onClick={() => setActiveTab('gameroom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif-luxury font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gameroom'
                  ? 'gold-shimmer text-black shadow-md'
                  : 'text-amber-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> High-Roller Game Room
            </button>
            <button
              onClick={() => setActiveTab('chaos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif-luxury font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chaos'
                  ? 'gold-shimmer text-black shadow-md'
                  : 'text-amber-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Executive Chaos
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif-luxury font-bold transition cursor-pointer ${
                activeTab === 'vault'
                  ? 'gold-shimmer text-black shadow-md'
                  : 'text-amber-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Billionaire Vault
            </button>
          </nav>

          {/* ZONE 3 (Right): Actions & Subpage Launcher */}
          <div className="flex items-center gap-2.5">
            {/* Trumpagotchi Subpage Button */}
            <button
              onClick={onNavigateToTrump}
              className="px-4 py-2 rounded-xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-[0_4px_16px_rgba(212,175,55,0.35)] flex items-center gap-2 cursor-pointer active:scale-95 group"
              title="Launch 5-Star Trumpagotchi Virtual Pet Subpage (/trump)"
            >
              <Crown className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Trumpagotchi Subpage</span>
              <span className="sm:hidden">POTUS Pet</span>
              <span className="font-mono text-[10px] bg-black/25 px-1 py-0.5 rounded text-black font-bold">/trump</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </button>

            {/* Quick Chaos Roller */}
            <button
              onClick={handleQuickChaos}
              title="Unleash Random Chaos Event"
              className="p-2 rounded-xl bg-black/60 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 transition cursor-pointer active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Domain Deploy Modal */}
            <button
              onClick={() => setIsDeployModalOpen(true)}
              title="Domain Setup & ZIP Download"
              className="p-2 rounded-xl bg-black/60 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 transition cursor-pointer active:scale-95"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-xl bg-black/60 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 lg:px-8 pt-8 pb-12 border-b border-amber-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          {/* 5-Star Diamond Ribbon */}
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400 mb-3">
            <span>★ ★ ★ ★ ★</span>
            <span>FIVE-STAR CERTIFIED OPULENCE</span>
            <span>&bull;</span>
            <span className="text-amber-200/80">randomcandyland.com</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading & Narrative */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-black text-white tracking-wide leading-[1.15] mb-4">
                The Five-Star Confectionery &amp; High-Roller Gaming Oasis
              </h2>
              <p className="text-sm sm:text-base text-amber-100/80 font-serif-luxury leading-relaxed max-w-2xl mb-6">
                Step into <strong className="text-amber-300">randomcandyland.com</strong> — where 24-karat gold confectionery physics meet high-stakes 777 slots, cut-crystal gumball oracles, and the legendary <strong className="text-white">Trumpagotchi Virtual Pet</strong> presiding in his private penthouse subpage!
              </p>

              {/* Instant Authentic Trump Soundboard Bar */}
              <div className="mb-6 bg-black/70 border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2 text-xs font-serif-luxury text-amber-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    INSTANT 5-STAR TRUMP VOICE SOUNDBOARD:
                  </span>
                  <span className="text-[11px] text-amber-200/60">CLICK TO HEAR 100% REAL CLIPS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_VOICE_QUOTES.map(item => (
                    <button
                      key={item.label}
                      onClick={() => sound.playQuoteAudio(item.clip)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#1c122e] to-[#0c0617] hover:border-amber-300 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-serif-luxury font-bold transition cursor-pointer active:scale-95 shadow-sm"
                    >
                      "{item.label}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Action Row */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById('high-roller-room');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-2xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-[0_10px_25px_rgba(212,175,55,0.35)] flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Gamepad2 className="w-4 h-4 text-black" />
                  <span>Enter High-Roller Arcade</span>
                </button>

                <button
                  onClick={onNavigateToTrump}
                  className="px-6 py-3.5 rounded-2xl bg-[#1b102c] hover:bg-[#281844] border-2 border-amber-400/60 text-amber-300 hover:text-white font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Play Trumpagotchi (/trump)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsDeployModalOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-black/60 hover:bg-white/10 border border-amber-500/30 text-amber-200 text-xs font-serif-luxury font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Domain &amp; ZIP</span>
                </button>
              </div>
            </div>

            {/* Right Column: Featured Subpage Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-[#1f1335] via-[#120822] to-[#080310] border-2 border-amber-400/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 inset-x-0 h-1 gold-shimmer" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-serif-luxury font-bold text-amber-400 tracking-wider">
                    FEATURED GAME ROOM ATTRACTION
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/40">
                    SUBPAGE /trump
                  </span>
                </div>

                {/* Handheld Preview Card */}
                <div className="flex items-center gap-4 bg-black/80 p-4 rounded-2xl border-2 border-amber-500/40 mb-4 shadow-inner">
                  <div className="w-20 h-20 rounded-2xl gold-shimmer p-1 shadow-lg shrink-0 flex items-center justify-center">
                    <div className="w-full h-full bg-[#8fae85] rounded-xl border-2 border-black/50 flex flex-col items-center justify-center text-center p-1">
                      <span className="text-3xl animate-bounce">👱</span>
                      <span className="text-[8px] font-mono font-black text-black">POTUS PET</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-base font-serif-luxury font-bold text-white">Trumpagotchi Virtual Pet</h4>
                    <p className="text-xs text-amber-200/80 font-serif-luxury mt-1 leading-snug">
                      Retro pocket digipet with 38 authentic Donald voice clips, Bedminster golden golf, arena rally chanting &amp; skyscraper negotiations!
                    </p>
                  </div>
                </div>

                <button
                  onClick={onNavigateToTrump}
                  className="w-full py-3 rounded-2xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-[0_10px_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Crown className="w-4 h-4 text-black" />
                  <span>Launch Trumpagotchi Subpage (/trump)</span>
                  <ExternalLink className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN ATTRACTIONS CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-14">

        {/* SECTION: THE HIGH-ROLLER GAME ROOM */}
        {(activeTab === 'all' || activeTab === 'gameroom') && (
          <section id="high-roller-room" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
                  <span>⚜️</span>
                  <span>THE FIVE-STAR CASINO &amp; ARCADE FLOOR</span>
                </div>
                <h2 className="text-3xl font-serif-luxury font-bold text-white tracking-wide mt-1">
                  The High-Roller Game Room
                </h2>
                <p className="text-xs text-amber-200/70 mt-1">
                  All cabinets are 100% interactive &bull; Real Trump voice clips &bull; Authentic casino payouts
                </p>
              </div>

              <button
                onClick={onNavigateToTrump}
                className="px-4 py-2 rounded-xl gold-shimmer text-black text-xs font-serif-luxury font-black transition flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-md"
              >
                <span>Launch Fullscreen Subpage (/trump)</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Cabinets List */}
            <div className="space-y-10">
              {/* Cabinet 1: Trumpagotchi 100% Authentic Voice Virtual Pet */}
              <TrumpagotchiCabinetCard onLaunchFullscreen={onNavigateToTrump} />

              {/* Cabinet 2: The Sovereign 777 Trump Grand Slots */}
              <SugarRushSlots />

              {/* Cabinet 3: 24K Cut-Crystal Gumball Oracle */}
              <GumballOracle />

              {/* Cabinet 4: 24K Gold MPC Beatbox & Vocal Soundboard */}
              <GobstopperBeatSynth />
            </div>
          </section>
        )}

        {/* SECTION: THE EXECUTIVE CHAOS SUITE */}
        {(activeTab === 'all' || activeTab === 'chaos') && (
          <section id="chaos-suite" className="space-y-4">
            <div className="border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
                <span>⚡</span>
                <span>A RANDOM PLACE OF EVERYTHING RANDOM</span>
              </div>
              <h2 className="text-3xl font-serif-luxury font-bold text-white tracking-wide mt-1">
                The Executive Chaos Suite
              </h2>
              <p className="text-xs text-amber-200/70 mt-1">
                Random presidential decrees, inter-dimensional speech broadcasts, anti-gravity penthouse mode, and gold showers
              </p>
            </div>

            <RandomChaosGenerator />
          </section>
        )}

        {/* SECTION: THE BILLIONAIRE PRIVATE CANDY VAULT */}
        {(activeTab === 'all' || activeTab === 'vault') && (
          <section id="billionaire-vault" className="space-y-4">
            <div className="border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
                <span>💎</span>
                <span>CLASSIFIED SWISS &amp; TRUMP TOWER ARTIFACTS</span>
              </div>
              <h2 className="text-3xl font-serif-luxury font-bold text-white tracking-wide mt-1">
                The Billionaire Private Candy Vault
              </h2>
              <p className="text-xs text-amber-200/70 mt-1">
                Unbox solid 24K gold truffles, Bedminster white chocolate golf balls, and presidential executive peppermints
              </p>
            </div>

            <MysteryCandyVault />
          </section>
        )}

        {/* DOMAIN & DEPLOYMENT SECTION */}
        <section className="bg-gradient-to-r from-[#170c26] via-[#10071c] to-[#170c26] border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 gold-shimmer" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-serif-luxury font-bold text-white">
                Live at randomcandyland.com
              </h3>
            </div>
            <p className="text-xs text-amber-200/80 font-serif-luxury max-w-xl leading-relaxed">
              Main landing page hosted at <code className="text-amber-300 font-mono">randomcandyland.com/</code> and Trumpagotchi Virtual Pet at <code className="text-amber-300 font-mono">randomcandyland.com/trump</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 text-xs font-serif-luxury font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              DNS Guide
            </button>
            <a
              href="/trumpagotchi-project.zip"
              download="randomcandyland-trumpagotchi.zip"
              className="px-6 py-3 rounded-xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-[0_10px_25px_rgba(212,175,55,0.35)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-black" />
              Download All Files (.ZIP)
            </a>
          </div>
        </section>

      </main>

      {/* 5-STAR FOOTER */}
      <footer className="border-t border-amber-500/20 bg-[#050209] py-10 px-4 lg:px-8 text-center text-xs text-amber-200/60 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚜️</span>
            <span className="font-serif-luxury font-bold text-white">Random Candy Land</span>
            <span>&bull;</span>
            <span className="font-serif-luxury text-amber-400">randomcandyland.com</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-serif-luxury">
            <button
              onClick={onNavigateToTrump}
              className="text-amber-300 hover:text-white transition cursor-pointer"
            >
              Trumpagotchi Subpage (/trump)
            </button>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="text-amber-300 hover:text-white transition cursor-pointer"
            >
              Domain Setup Guide
            </button>
            <a
              href="/trumpagotchi-project.zip"
              download="randomcandyland-trumpagotchi.zip"
              className="text-amber-300 hover:text-white transition"
            >
              Download Full ZIP
            </a>
          </div>

          <p className="text-[10px] font-serif-luxury text-amber-400/40">
            Certified 5-Star Confectionery &amp; Gaming Oasis &bull; 100% Authentic
          </p>
        </div>
      </footer>

      {/* Domain Deployment Modal */}
      <DomainDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onNavigateToTrump={onNavigateToTrump}
      />
    </div>
  );
}
