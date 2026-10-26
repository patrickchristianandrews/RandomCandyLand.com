import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { Zap, Sparkles, Shuffle, Radio, Crown, ShieldAlert } from 'lucide-react';

interface ChaosEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

const FIVE_STAR_DECREES = [
  "EXECUTIVE ORDER #904: Prime-grade USDA Double Cheeseburgers & crispy fries officially designated as mandatory Oval Office cuisine.",
  "DIPLOMATIC MEMO: United Nations declares the 100% authentic Golden Comb-Over an international cultural monument.",
  "FED RESERVE ANNOUNCEMENT: The United States Dollar will henceforth be supported by 24K Bedminster Gold Trophies.",
  "GOLF COMMISSION DIRECTIVE: A hole-in-one on any Trump course entitles the golfer to unlimited two scoops of vanilla ice cream.",
  "MEDIA BRIEFING: Ratings have broken through the ceiling, pollsters confirm nobody has ever seen 99.9% approval numbers like this.",
];

const FIVE_STAR_TRIVIA = [
  "Billionaire Fact: Mar-a-Lago features 33,000 square feet of hand-carved gilded wood and the world's most magnificent ballroom.",
  "Authentic Trump Physics: The comb-over aerodynamic coefficient allows for 350-yard drives directly down the center fairway.",
  "Five-Star Standard: Two scoops for Donald, one scoop for everyone else. Pure winning protocol.",
];

export function RandomChaosGenerator() {
  const [chaosLog, setChaosLog] = useState<ChaosEvent[]>([
    {
      id: 'init-1',
      title: '⚜️ Five-Star Executive Chaos Suite Activated',
      description: 'The laws of confectionery reality have been calibrated to maximum Trump luxury and pure randomness.',
      timestamp: '00:00:01'
    }
  ]);
  const [isWarping, setIsWarping] = useState(false);
  const [gravityInverted, setGravityInverted] = useState(false);
  const [discoMode, setDiscoMode] = useState(false);

  const triggerChaos = () => {
    if (isWarping) return;
    setIsWarping(true);
    candyAudio.playChaosWarp();

    const roll = Math.floor(Math.random() * 6);
    const nowStr = new Date().toLocaleTimeString();

    setTimeout(() => {
      let newEvent: ChaosEvent;

      switch (roll) {
        case 0: {
          const text = FIVE_STAR_DECREES[Math.floor(Math.random() * FIVE_STAR_DECREES.length)];
          newEvent = {
            id: Math.random().toString(),
            title: '📜 Presidential Executive Order',
            description: text,
            timestamp: nowStr
          };
          candyAudio.playWinChime();
          sound.playQuoteAudio('were_going_to_do_a_fantastic_job.mp3');
          break;
        }
        case 1: { // 24K Confetti Shower
          confetti({
            particleCount: 160,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#facc15', '#ffffff', '#e2e8f0'],
          });
          candyAudio.playBubblePop();
          sound.playQuoteAudio('well_over_ten_billion_dollars.mp3');
          newEvent = {
            id: Math.random().toString(),
            title: '👑 24K Billionaire Confetti Shower',
            description: '160 pure golden sugar photons detonated across the coordinate grid.',
            timestamp: nowStr
          };
          break;
        }
        case 2: { // Authentic vocal blast
          const voiceQuotes = [
            'wrong.mp3',
            'bingbong.mp3',
            'tremendous_amounts_of_dollars.mp3',
            'im_really_rich.mp3',
            'better_than_ever_before.mp3',
            'i_have_the_best_courses_in_the_world.mp3',
          ];
          const picked = voiceQuotes[Math.floor(Math.random() * voiceQuotes.length)];
          sound.playQuoteAudio(picked);
          newEvent = {
            id: Math.random().toString(),
            title: '🎙️ Authentic Trump Voice Transmission',
            description: `Inter-dimensional audio blast from the Trumpagotchi Penthouse suite: "${picked.replace('.mp3', '')}"!`,
            timestamp: nowStr
          };
          break;
        }
        case 3: { // Gravity flip
          setGravityInverted(prev => !prev);
          newEvent = {
            id: Math.random().toString(),
            title: gravityInverted ? '⚖️ Penthouse Gravity Normalized' : '🌌 Anti-Gravity Penthouse Mode',
            description: gravityInverted ? 'The grand ballroom settled back to Earth.' : 'The entire resort is floating into the stratosphere!',
            timestamp: nowStr
          };
          candyAudio.playCrankClick();
          break;
        }
        case 4: { // 5-Star Disco
          setDiscoMode(prev => !prev);
          newEvent = {
            id: Math.random().toString(),
            title: '🕺 Mar-a-Lago Gala YMCA Dance Mode',
            description: 'The double fist pump is sweeping the nation! Music up, hands up!',
            timestamp: nowStr
          };
          sound.playQuoteAudio('bingbong.mp3');
          break;
        }
        default: {
          const t = FIVE_STAR_TRIVIA[Math.floor(Math.random() * FIVE_STAR_TRIVIA.length)];
          newEvent = {
            id: Math.random().toString(),
            title: '💎 5-Star Billionaire Reality Fact',
            description: t,
            timestamp: nowStr
          };
          sound.playQuoteAudio('so_amazing.mp3');
          break;
        }
      }

      setChaosLog(prev => [newEvent, ...prev.slice(0, 7)]);
      setIsWarping(false);
    }, 400);
  };

  return (
    <div className={`bg-[#0f0918] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.12)] relative overflow-hidden backdrop-blur-md transition-all duration-700 ${
      gravityInverted ? 'rotate-[-1deg] translate-y-[-4px]' : ''
    } ${discoMode ? 'ring-4 ring-amber-400 shadow-amber-500/40' : ''}`}>
      {/* 24K Gold luxury top trim */}
      <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
            <span>⚜️</span>
            <span>A RANDOM PLACE OF EVERYTHING RANDOM &bull; 5-STAR EDITION</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            The Executive Chaos Suite
          </h3>
          <p className="text-xs text-amber-200/70">
            Press the 24K golden plunger to unleash unpredictable presidential decrees, audio blasts &amp; reality warps
          </p>
        </div>

        <button
          onClick={triggerChaos}
          disabled={isWarping}
          className="px-6 py-3 rounded-2xl gold-shimmer hover:brightness-110 disabled:opacity-50 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-[0_10px_25px_rgba(212,175,55,0.35)] flex items-center gap-2.5 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Shuffle className={`w-4 h-4 ${isWarping ? 'animate-spin' : ''}`} />
          {isWarping ? 'WARPING REALITY...' : 'UNLEASH 5-STAR CHAOS!'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Status Box */}
        <div className="md:col-span-5 flex flex-col justify-between bg-black/60 border-2 border-amber-500/30 rounded-2xl p-5 shadow-inner">
          <div>
            <div className="text-xs font-serif-luxury tracking-widest text-amber-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> RESORT ENTROPY MONITOR
            </div>
            <div className="space-y-3 text-xs font-serif-luxury">
              <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
                <span className="text-amber-200/80">Winning Index:</span>
                <span className="font-bold text-amber-300">99.9% UNSTOPPABLE</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
                <span className="text-amber-200/80">Penthouse Gravity:</span>
                <span className="font-bold text-amber-400">{gravityInverted ? 'INVERTED (-1.0G)' : 'STANDARD (1.0G)'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-amber-500/20">
                <span className="text-amber-200/80">YMCA Dance Gala:</span>
                <span className="font-bold text-amber-400">{discoMode ? 'DOUBLE FIST PUMP ACTIVE' : 'STANDBY'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-amber-500/20 flex gap-2">
            {gravityInverted && (
              <button
                onClick={() => setGravityInverted(false)}
                className="flex-1 text-xs py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-xl font-serif-luxury transition cursor-pointer"
              >
                Normalize Gravity
              </button>
            )}
            {discoMode && (
              <button
                onClick={() => setDiscoMode(false)}
                className="flex-1 text-xs py-1.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-xl font-serif-luxury transition cursor-pointer"
              >
                End Dance Gala
              </button>
            )}
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="md:col-span-7 bg-black/85 border-2 border-amber-500/30 rounded-2xl p-5 font-mono shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20 text-xs text-amber-300">
            <span className="flex items-center gap-2 font-serif-luxury font-bold text-white">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" /> Live Presidential Chaos Dispatch
            </span>
            <span className="text-[10px] text-amber-400/70 font-serif-luxury">BROADCASTING</span>
          </div>

          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {chaosLog.map(item => (
              <div
                key={item.id}
                className="text-xs p-3 rounded-xl bg-gradient-to-r from-[#1d1130] to-[#0d0716] border border-amber-500/25 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif-luxury font-bold text-amber-300">{item.title}</span>
                  <span className="text-[10px] text-amber-400/60">{item.timestamp}</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed font-serif-luxury">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
