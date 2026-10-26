import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { Sparkles, RefreshCw, Trophy, Volume2, Award, Crown } from 'lucide-react';

interface Fortune {
  id: string;
  color: string;
  flavor: string;
  fortune: string;
  luckyNumber: number;
  prophecy: string;
  is24KGold?: boolean;
}

const FIVE_STAR_GUMBALLS = [
  { name: 'Solid 24K Gold Nugget', hex: '#facc15', is24KGold: true },
  { name: 'Mar-a-Lago Imperial Ruby', hex: '#f43f5e' },
  { name: 'Bedminster Fairway Emerald', hex: '#10b981' },
  { name: 'Trump Tower Sapphire', hex: '#38bdf8' },
  { name: 'Air Force One Platinum Swirl', hex: '#e2e8f0' },
  { name: 'Diplomatic Royal Amethyst', hex: '#a855f7' },
];

const FIVE_STAR_FORTUNES = [
  {
    flavor: 'Solid 24K Gold Nugget',
    fortune: 'THE SOVEREIGN DECREE: You are officially leading in all confectionery polls by 50 points.',
    prophecy: 'Tremendous ratings will follow every single transaction you make this month.',
    voiceClip: 'tremendous_amounts_of_dollars.mp3',
  },
  {
    flavor: 'Trump Tower Sapphire',
    fortune: 'MANHATTAN SKYLINE REVELATION: The golden penthouse view confirms your deal-making genius.',
    prophecy: 'Nobody negotiates leases like you, not even the confectionery syndicate.',
    voiceClip: 'well_over_ten_billion_dollars.mp3',
  },
  {
    flavor: 'Bedminster Fairway Emerald',
    fortune: 'BEDMINSTER 18TH HOLE PROPHECY: A magnificent 340-yard drive is heading directly into the cup.',
    prophecy: 'Crowds will cheer as you raise the golden golf championship trophy.',
    voiceClip: 'i_have_the_best_courses_in_the_world.mp3',
  },
  {
    flavor: 'Mar-a-Lago Imperial Ruby',
    fortune: 'GRAND BALLROOM ORACLE: 50,000 guests in black-tie attire are applauding your victory.',
    prophecy: 'Your speech will be declared the greatest address in Palm Beach history.',
    voiceClip: 'were_going_to_do_a_fantastic_job.mp3',
  },
  {
    flavor: 'Air Force One Platinum Swirl',
    fortune: 'COMMANDER-IN-CHIEF BULLETIN: Prime rib, golden fries, and diet soda served at 40,000 feet.',
    prophecy: 'Your comb-over volume will remain 100% aerodynamic through hurricane wind shear.',
    voiceClip: 'without_question.mp3',
  },
  {
    flavor: 'Diplomatic Royal Amethyst',
    fortune: 'THE ART OF THE CANDY DEAL: A 5-year bilateral trade pact signed with the thick black Sharpie.',
    prophecy: 'The greatest economic victory in candy history is yours.',
    voiceClip: 'its_a_five_year_deal.mp3',
  },
];

export function GumballOracle() {
  const [isCranking, setIsCranking] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [crankAngle, setCrankAngle] = useState(0);
  const [history, setHistory] = useState<Fortune[]>([]);

  const handleCrank = () => {
    if (isCranking) return;
    setIsCranking(true);
    candyAudio.playCrankClick();
    setCrankAngle(prev => prev + 360);

    setTimeout(() => {
      candyAudio.playCrankClick();
    }, 250);

    setTimeout(() => {
      candyAudio.playBubblePop();
      candyAudio.playWinChime();

      const ball = FIVE_STAR_GUMBALLS[Math.floor(Math.random() * FIVE_STAR_GUMBALLS.length)];
      const item = FIVE_STAR_FORTUNES[Math.floor(Math.random() * FIVE_STAR_FORTUNES.length)];

      const fortune: Fortune = {
        id: Math.random().toString(36).substring(2, 9),
        color: ball.hex,
        flavor: ball.name,
        fortune: item.fortune,
        prophecy: item.prophecy,
        luckyNumber: Math.floor(Math.random() * 900) + 100,
        is24KGold: ball.is24KGold,
      };

      setCurrentFortune(fortune);
      setHistory(prev => [fortune, ...prev.slice(0, 4)]);
      setIsCranking(false);

      // Play authentic Trump praise audio
      sound.playQuoteAudio(item.voiceClip);

      confetti({
        particleCount: ball.is24KGold ? 90 : 50,
        spread: 80,
        origin: { y: 0.65 },
        colors: [ball.hex, '#ffd700', '#facc15', '#ffffff'],
      });
    }, 650);
  };

  const playVoiceAgain = () => {
    if (currentFortune) {
      const match = FIVE_STAR_FORTUNES.find(f => f.flavor === currentFortune.flavor);
      if (match?.voiceClip) {
        sound.playQuoteAudio(match.voiceClip);
      } else {
        sound.playQuoteAudio('so_amazing.mp3');
      }
    }
  };

  return (
    <div className="bg-[#0f0918] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.12)] relative overflow-hidden backdrop-blur-md">
      {/* 24K Gold luxury top trim */}
      <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
            <span>⚜️</span>
            <span>MAR-A-LAGO GRAND BALLROOM ATTRACTION</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            24K Cut-Crystal Gumball Oracle
          </h3>
          <p className="text-xs text-amber-200/70">
            Hand-crafted in solid brass &amp; gold &bull; Authentic presidential prophecies &bull; Real audio readouts
          </p>
        </div>

        <button
          onClick={handleCrank}
          disabled={isCranking}
          className="px-5 py-2.5 rounded-xl gold-shimmer hover:brightness-110 disabled:opacity-50 text-black text-xs font-serif-luxury font-black tracking-wider transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isCranking ? 'animate-spin' : ''}`} />
          {isCranking ? 'DISPENSING GOLD...' : 'TURN 24K CRANK (VIP FREE)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Machine Visual */}
        <div className="md:col-span-5 flex flex-col items-center">
          {/* Eagle Finial */}
          <div className="text-xl mb-1 filter drop-shadow">🦅</div>

          {/* Cut-Crystal Glass Globe with Gold Trim */}
          <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-amber-400/20 via-yellow-500/10 to-amber-600/30 border-4 border-amber-300/60 shadow-[inset_0_0_25px_rgba(255,215,0,0.4)] flex items-center justify-center overflow-hidden p-3">
            {/* Crystal reflection highlight */}
            <div className="absolute top-3 left-5 w-14 h-7 bg-white/50 rounded-full blur-[1px] rotate-[-25deg] pointer-events-none" />

            {/* Floating Luxury Balls */}
            <div className="grid grid-cols-3 gap-2.5 p-2 w-full h-full items-center justify-center">
              {FIVE_STAR_GUMBALLS.map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center"
                  style={{
                    backgroundColor: c.hex,
                    transform: isCranking ? `scale(1.25) translateY(${Math.sin(i * 1.5) * 10}px)` : 'scale(1)',
                    boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.6), inset 2px 2px 6px rgba(255,255,255,0.7)`
                  }}
                >
                  {c.is24KGold && <span className="text-[10px]">👑</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Solid 24K Brass Pedestal Base */}
          <div className="w-40 bg-gradient-to-b from-amber-600 via-yellow-700 to-amber-950 border-2 border-amber-300/70 rounded-b-2xl p-3 flex flex-col items-center shadow-2xl relative -mt-3">
            {/* Brass Crank Handle */}
            <button
              onClick={handleCrank}
              disabled={isCranking}
              title="Click or Tap to turn crank!"
              className="w-14 h-14 rounded-full gold-shimmer border-2 border-amber-200 shadow-xl flex items-center justify-center cursor-pointer active:scale-90 transition transform"
              style={{
                transform: `rotate(${crankAngle}deg)`,
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="w-3.5 h-8 bg-amber-950 rounded-full border border-amber-200" />
            </button>
            <span className="text-[10px] font-serif-luxury font-black text-amber-200 mt-1 uppercase tracking-widest">
              TURN 24K LEVER
            </span>

            {/* Chute */}
            <div className="w-20 h-8 bg-black/90 rounded-t-lg mt-1 border border-amber-500/50 flex items-center justify-center relative overflow-hidden">
              {currentFortune ? (
                <div
                  className="w-6 h-6 rounded-full shadow-inner animate-bounce flex items-center justify-center"
                  style={{
                    backgroundColor: currentFortune.color,
                    boxShadow: `inset -1px -1px 4px rgba(0,0,0,0.6), inset 2px 2px 4px rgba(255,255,255,0.8)`
                  }}
                >
                  {currentFortune.is24KGold && <span className="text-[9px]">👑</span>}
                </div>
              ) : (
                <span className="text-[9px] text-amber-400/60 font-serif-luxury tracking-widest">24K CHUTE</span>
              )}
            </div>
          </div>
        </div>

        {/* Fortune Display Area */}
        <div className="md:col-span-7 flex flex-col justify-center">
          {currentFortune ? (
            <div className="bg-gradient-to-b from-[#1c122e] to-[#0c0617] border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: currentFortune.color }}
                  />
                  <span className="text-xs font-serif-luxury font-bold uppercase tracking-wider text-amber-300">
                    {currentFortune.flavor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    DECREE #{currentFortune.luckyNumber}
                  </span>
                  <button
                    onClick={playVoiceAgain}
                    title="Play authentic Trump audio clip again"
                    className="px-2.5 py-1 rounded-lg gold-shimmer text-black text-xs font-serif-luxury font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-black" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              </div>

              <blockquote className="text-base font-serif-luxury font-bold text-white leading-relaxed my-3 border-l-2 border-amber-400 pl-4">
                "{currentFortune.fortune}"
              </blockquote>

              <div className="text-xs text-amber-200/90 font-serif-luxury bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 flex items-center gap-2.5 mt-3">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Prophecy: {currentFortune.prophecy}</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 border border-dashed border-amber-500/40 rounded-2xl p-8 text-center">
              <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-pulse" />
              <h4 className="text-base font-serif-luxury font-bold text-white mb-1">
                The 24K Presidential Oracle Awaits
              </h4>
              <p className="text-xs text-amber-200/70 max-w-sm mx-auto">
                Turn the solid brass crank on the Mar-a-Lago crystal gumball machine to dispense an authentic, 5-star presidential decree with real voice playback!
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-5 pt-3 border-t border-amber-500/20">
              <div className="text-[11px] font-serif-luxury tracking-widest text-amber-400/80 mb-2 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Recent Presidential Prophecies
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <span
                    key={h.id + i}
                    className="text-xs font-serif-luxury px-3 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                    {h.flavor.split(' ')[0]}: #{h.luckyNumber}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
