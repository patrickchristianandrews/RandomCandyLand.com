import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { Sparkles, Package, Eye, Star, Crown, ShieldCheck } from 'lucide-react';

interface CandyArtifact {
  id: string;
  name: string;
  rarity: 'VIP Club' | 'Penthouse' | 'Presidential' | 'Sovereign 24K';
  color: string;
  badgeBg: string;
  effect: string;
  lore: string;
  sugarRating: number;
  voiceClip: string;
}

const BILLIONAIRE_CATALOG: CandyArtifact[] = [
  {
    id: 'solid-gold-trump-truffle',
    name: 'Solid 24K Gold Trump Tower Truffle',
    rarity: 'Sovereign 24K',
    color: '#facc15',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
    effect: 'Instantly increases net worth by $10 Billion and guarantees 99% poll approval.',
    lore: 'Hand-dipped in 24-karat edible gold leaf at the top penthouse of Fifth Avenue.',
    sugarRating: 100,
    voiceClip: 'well_over_ten_billion_dollars.mp3',
  },
  {
    id: 'bedminster-white-chocolate-golf-ball',
    name: 'Bedminster Hole-in-One White Chocolate Ball',
    rarity: 'Presidential',
    color: '#e2e8f0',
    badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-400/40',
    effect: 'Guarantees a perfect 62 scorecard on the 18-hole championship links.',
    lore: 'Crafted from Swiss white chocolate to celebrate legendary fairway triumphs.',
    sugarRating: 98,
    voiceClip: 'i_have_the_best_courses_in_the_world.mp3',
  },
  {
    id: 'mar-a-lago-key-lime-bonbon',
    name: 'Mar-a-Lago Grand Key Lime Bonbon',
    rarity: 'Presidential',
    color: '#10b981',
    badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    effect: 'Enchants any dinner party with pure diplomatic charm and 5-star applause.',
    lore: 'Infused with organic Florida key limes from the Palm Beach estate citrus groves.',
    sugarRating: 96,
    voiceClip: 'so_amazing.mp3',
  },
  {
    id: 'art-of-the-deal-spun-sugar-quill',
    name: 'Art of the Deal Spun-Sugar Quill',
    rarity: 'Penthouse',
    color: '#f59e0b',
    badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    effect: 'Draws bilateral multi-million dollar contracts that never fail to close.',
    lore: 'Hardened spun-sugar nib dipped in edible black currant sharpie ink.',
    sugarRating: 94,
    voiceClip: 'its_a_five_year_deal.mp3',
  },
  {
    id: 'small-million-dollar-chocolate-bar',
    name: 'The "Small Million Dollar Loan" Chocolate Bar',
    rarity: 'Penthouse',
    color: '#ec4899',
    badgeBg: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
    effect: 'Turns a tiny sugary bite into a global real estate empire.',
    lore: 'Starting out in Queens with the highest grade dark cacao and golden nougat.',
    sugarRating: 92,
    voiceClip: 'tremendous_amounts_of_dollars.mp3',
  },
  {
    id: 'air-force-one-executive-peppermint',
    name: 'Air Force One Executive Peppermint',
    rarity: 'VIP Club',
    color: '#38bdf8',
    badgeBg: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    effect: 'Keeps breath fresh through 4-hour live arena stadium speeches.',
    lore: 'Sealed with the presidential eagle stamp and served aboard the executive jet.',
    sugarRating: 88,
    voiceClip: 'were_going_to_do_a_fantastic_job.mp3',
  },
];

export function MysteryCandyVault() {
  const [unlocked, setUnlocked] = useState<CandyArtifact[]>([BILLIONAIRE_CATALOG[0]]);
  const [latestPull, setLatestPull] = useState<CandyArtifact | null>(BILLIONAIRE_CATALOG[0]);
  const [isOpening, setIsOpening] = useState(false);

  const openVault = () => {
    if (isOpening) return;
    setIsOpening(true);
    candyAudio.playChaosWarp();

    setTimeout(() => {
      const item = BILLIONAIRE_CATALOG[Math.floor(Math.random() * BILLIONAIRE_CATALOG.length)];
      setLatestPull(item);
      setUnlocked(prev => {
        if (prev.some(x => x.id === item.id)) return prev;
        return [item, ...prev];
      });

      // Play real audio clip
      sound.playQuoteAudio(item.voiceClip);

      if (item.rarity === 'Sovereign 24K' || item.rarity === 'Presidential') {
        candyAudio.playJackpot();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#facc15', '#ffffff'],
        });
      } else {
        candyAudio.playWinChime();
      }

      setIsOpening(false);
    }, 700);
  };

  return (
    <div className="bg-[#0f0918] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.12)] relative overflow-hidden backdrop-blur-md">
      {/* 24K Gold luxury top trim */}
      <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
            <span>⚜️</span>
            <span>HIGH-SECURITY SWISS &amp; TRUMP TOWER PRIVATE VAULT</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            The Billionaire Private Candy Vault
          </h3>
          <p className="text-xs text-amber-200/70">
            Solid gold confectioneries &bull; Presidential relics &bull; Voice-authenticated unlocks
          </p>
        </div>

        <button
          onClick={openVault}
          disabled={isOpening}
          className="px-5 py-2.5 rounded-xl gold-shimmer hover:brightness-110 disabled:opacity-50 text-black text-xs font-serif-luxury font-black tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Package className={`w-4 h-4 ${isOpening ? 'animate-bounce' : ''}`} />
          {isOpening ? 'CRACKING 24K SAFE...' : 'CRACK PRIVATE SAFE (VIP FREE)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Showcase Item */}
        <div className="md:col-span-6">
          {latestPull ? (
            <div
              className="bg-gradient-to-b from-[#1a102c] to-[#0c0517] border-2 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300"
              style={{ borderColor: latestPull.color }}
            >
              <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-3">
                <span className={`text-[11px] font-serif-luxury font-bold px-3 py-1 rounded-full border ${latestPull.badgeBg}`}>
                  {latestPull.rarity.toUpperCase()}
                </span>
                <span className="text-xs font-serif-luxury font-bold text-amber-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {latestPull.sugarRating}/100 5-STAR POWER
                </span>
              </div>

              <h4 className="text-xl font-serif-luxury font-bold text-white mb-2">{latestPull.name}</h4>
              <p className="text-xs text-amber-100/90 mb-4 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30 font-serif-luxury leading-relaxed">
                <span className="font-bold text-amber-400">Executive Effect:</span> {latestPull.effect}
              </p>
              <p className="text-xs text-amber-300/70 font-serif-luxury italic">"{latestPull.lore}"</p>
            </div>
          ) : (
            <div className="bg-black/40 border border-dashed border-amber-500/40 rounded-2xl p-10 text-center">
              <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-serif-luxury font-bold text-white">Safe is Locked</p>
              <p className="text-xs text-amber-200/70 mt-1">
                Hit Crack Private Safe to retrieve your five-star confectionery specimen!
              </p>
            </div>
          )}
        </div>

        {/* Collection Gallery */}
        <div className="md:col-span-6">
          <div className="text-xs font-serif-luxury tracking-widest text-amber-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" /> UNLOCKED CONFECTIONERY ARTIFACTS
            </span>
            <span className="font-mono text-amber-300">
              {unlocked.length}/{BILLIONAIRE_CATALOG.length} ACQUIRED
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {BILLIONAIRE_CATALOG.map(item => {
              const isFound = unlocked.some(x => x.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isFound) {
                      setLatestPull(item);
                      sound.playQuoteAudio(item.voiceClip);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                    isFound
                      ? 'bg-gradient-to-r from-[#1c122e] to-[#120920] border-amber-500/40 hover:border-amber-300 text-white shadow-md'
                      : 'bg-black/40 border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{isFound ? '⚜️' : '🔒'}</span>
                    <span className="font-serif-luxury font-bold">{isFound ? item.name : 'Classified 5-Star Relic'}</span>
                  </div>
                  {isFound ? (
                    <span className={`text-[10px] font-serif-luxury font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                      {item.rarity}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono">SEALED</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
