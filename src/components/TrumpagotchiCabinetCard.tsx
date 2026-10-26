import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { candyAudio } from '../utils/candyAudio';
import { Crown, Volume2, ArrowRight, Sparkles, Award, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrumpagotchiCabinetCardProps {
  onLaunchFullscreen: () => void;
}

interface ActionButton {
  label: string;
  icon: string;
  quoteText: string;
  voiceClip: string;
  statusText: string;
}

const CABINET_ACTIONS: ActionButton[] = [
  {
    label: 'Feed Prime Steak',
    icon: '🥩',
    quoteText: "I THINK I'VE BEEN SHOWING A LOT OF MEAT! Top prime steak with ketchup!",
    voiceClip: 'i_think_ive_been_showing_a_lot_of_meat.mp3',
    statusText: 'Hunger Satisfied &bull; Stamina +30',
  },
  {
    label: 'YMCA Fist-Pump Dance',
    icon: '🕺',
    quoteText: "BING BING BING BONG! Look at that rhythm! Nobody dances like Donald!",
    voiceClip: 'bingbong.mp3',
    statusText: '60,000 People Cheering in Unison',
  },
  {
    label: 'Yell at Fake News',
    icon: '📺',
    quoteText: "WRONG! Dishonest television anchors, lowest ratings in history!",
    voiceClip: 'wrong.mp3',
    statusText: 'Ratings +15 &bull; Fake News Demolished',
  },
  {
    label: 'Bedminster Golf Drive',
    icon: '🏌️',
    quoteText: "I HAVE THE BEST COURSES IN THE WORLD! Perfect 340-yard drive!",
    voiceClip: 'i_have_the_best_courses_in_the_world.mp3',
    statusText: 'Hole-in-One on the 18th Fairway',
  },
  {
    label: 'Executive Sharpie Deal',
    icon: '📜',
    quoteText: "IT'S A FIVE-YEAR DEAL! Signed with the thick black Sharpie!",
    voiceClip: 'its_a_five_year_deal.mp3',
    statusText: 'Bilateral Trade Pact Sealed',
  },
  {
    label: 'Groom Comb-Over',
    icon: '💈',
    quoteText: "WITHOUT QUESTION! The golden hair is 100% real and majestic!",
    voiceClip: 'without_question.mp3',
    statusText: 'Maximum Volume & Wind Resistance',
  },
];

export function TrumpagotchiCabinetCard({ onLaunchFullscreen }: TrumpagotchiCabinetCardProps) {
  const [activeAction, setActiveAction] = useState<ActionButton>(CABINET_ACTIONS[1]);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [approvalRating, setApprovalRating] = useState(99);
  const [netWorth, setNetWorth] = useState(10.5);

  const executeAction = (action: ActionButton) => {
    setActiveAction(action);
    setIsPlayingVoice(true);
    candyAudio.playWinChime();
    sound.speakTrump(action.quoteText, false, action.voiceClip);

    setApprovalRating(prev => Math.min(100, prev + 1));
    setNetWorth(prev => Number((prev + 0.2).toFixed(1)));

    if (action.label.includes('Dance') || action.label.includes('Golf')) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#facc15', '#ffffff'],
      });
    }

    setTimeout(() => {
      setIsPlayingVoice(false);
    }, 2800);
  };

  const replayVoice = () => {
    sound.speakTrump(activeAction.quoteText, false, activeAction.voiceClip);
  };

  return (
    <div className="bg-[#0f0918] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.12)] relative overflow-hidden backdrop-blur-md">
      {/* 24K Gold luxury top trim */}
      <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
            <span>⚜️</span>
            <span>CABINET #1 &bull; 100% AUTHENTIC VOICE VIRTUAL PET</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            Trumpagotchi Presidential Arcade Cabinet
          </h3>
          <p className="text-xs text-amber-200/70">
            Click any button to interact &bull; Always speaks in Donald's 100% authentic booming voice
          </p>
        </div>

        <button
          onClick={onLaunchFullscreen}
          className="px-5 py-2.5 rounded-xl gold-shimmer hover:brightness-110 text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Crown className="w-4 h-4 text-black" />
          <span>Launch Fullscreen Subpage (/trump)</span>
          <ExternalLink className="w-3.5 h-3.5 text-black" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Retro LCD Console */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#b8860b] via-[#ffd700] to-[#aa771c] p-3 shadow-2xl border-2 border-amber-300">
            {/* Screen Bezel */}
            <div className="bg-black/90 rounded-2xl p-4 border-2 border-black/80 flex flex-col items-center">
              
              {/* Top Banner inside LCD */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 border-b border-amber-500/30 pb-1.5 mb-3">
                <span>POTUS PET 45 &amp; 47</span>
                <span className="text-emerald-400">NET WORTH: ${netWorth}B</span>
                <span>APPROVAL: {approvalRating}%</span>
              </div>

              {/* LCD Screen Display */}
              <div className="w-full h-44 bg-[#8fae85] rounded-xl border-4 border-black/40 flex flex-col items-center justify-between p-3 relative overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]">
                {/* Scanlines effect */}
                <div className="absolute inset-0 bg-repeating-linear-gradient(to-bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px) pointer-events-none" />

                {/* Status indicator */}
                <span className="text-[10px] font-mono font-bold text-black uppercase tracking-wider self-start bg-black/10 px-2 py-0.5 rounded">
                  STAGE: 45TH &amp; 47TH PRESIDENT
                </span>

                {/* Animated Trump Sprite / Caricature */}
                <div className="my-auto flex flex-col items-center transform transition-transform duration-300">
                  <div className={`text-6xl filter drop-shadow select-none ${isPlayingVoice ? 'animate-bounce scale-110' : 'animate-pulse'}`}>
                    👱
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs">👔</span>
                    <span className="text-[10px] font-mono font-bold text-black uppercase">
                      PRESIDENT TRUMP
                    </span>
                  </div>
                </div>

                {/* Bottom ticker */}
                <div className="w-full text-center text-[10px] font-mono text-black truncate px-1 font-bold">
                  "{activeAction.label}"
                </div>
              </div>

              {/* Console Badge */}
              <div className="w-full mt-3 flex items-center justify-between px-2 text-[10px] font-serif-luxury text-amber-300/80">
                <span>★ SOLID 24K GOLD SHELL ★</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-emerald-400" /> AUTHENTIC VOICE ON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Actions & Real Voice Readout */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Current Authentic Trump Vocal Decree */}
          <div className="bg-gradient-to-b from-[#1c122e] to-[#0c0617] border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl relative mb-5">
            <div className="flex items-center justify-between mb-2 border-b border-amber-500/20 pb-2">
              <span className="text-xs font-serif-luxury font-bold text-amber-400 flex items-center gap-1.5">
                <Volume2 className={`w-4 h-4 ${isPlayingVoice ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                REAL DONALD TRUMP VOCAL TRANSMISSION:
              </span>
              <button
                onClick={replayVoice}
                className="px-2.5 py-1 rounded-lg gold-shimmer text-black text-xs font-serif-luxury font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
              >
                <span>Replay Voice</span>
              </button>
            </div>

            <blockquote className="text-base sm:text-lg font-serif-luxury font-bold text-white leading-relaxed my-2">
              "{activeAction.quoteText}"
            </blockquote>

            <div className="text-xs text-amber-300/80 font-serif-luxury mt-2 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Status: {activeAction.statusText}</span>
            </div>
          </div>

          {/* 6 Direct Interactive Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-serif-luxury font-bold tracking-widest text-amber-300 block mb-1">
              CLICK ANY ACTION TO HEAR DONALD SPEAK HIS FAMOUS PHRASES:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CABINET_ACTIONS.map(action => {
                const isSelected = activeAction.label === action.label;
                return (
                  <button
                    key={action.label}
                    onClick={() => executeAction(action)}
                    className={`p-3 rounded-xl border text-left transition-all transform active:scale-95 cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'gold-shimmer text-black font-extrabold shadow-md border-amber-300 scale-102 ring-2 ring-amber-300'
                        : 'bg-black/60 hover:bg-[#1a0f2c] border-amber-500/30 text-amber-200 hover:text-white'
                    }`}
                  >
                    <span className="text-xl shrink-0">{action.icon}</span>
                    <div className="overflow-hidden">
                      <span className="text-xs font-serif-luxury font-bold block truncate">
                        {action.label}
                      </span>
                      <span className={`text-[10px] font-mono block truncate ${isSelected ? 'text-black/80 font-bold' : 'text-amber-400/70'}`}>
                        Real Voice Clip
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
