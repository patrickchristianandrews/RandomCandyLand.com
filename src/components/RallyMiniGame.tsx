import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface RallyMiniGameProps {
  onComplete: (success: boolean, ratingReward: number) => void;
  onExit: () => void;
}

interface PromptStep {
  key: 'A' | 'B' | 'C';
  label: string;
  icon: string;
}

const RALLY_STEPS: PromptStep[] = [
  { key: 'A', label: 'THE BEST!', icon: '👈' },
  { key: 'B', label: 'WINNING BIGLY!', icon: '☝️' },
  { key: 'C', label: 'AMERICA FIRST!', icon: '👉' },
  { key: 'B', label: 'YUGE CROWD!', icon: '☝️' },
  { key: 'A', label: 'GREAT ENERGY!', icon: '👈' },
  { key: 'C', label: 'MAGA POWER!', icon: '👉' },
  { key: 'B', label: 'TREMENDOUS!', icon: '☝️' },
];

export const RallyMiniGame: React.FC<RallyMiniGameProps> = ({ onComplete, onExit }) => {
  const [hype, setHype] = useState<number>(50); // 0-100
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [victory, setVictory] = useState<boolean>(false);
  const [flashFeedback, setFlashFeedback] = useState<'hit' | 'miss' | null>(null);

  const currentStep = RALLY_STEPS[currentStepIdx % RALLY_STEPS.length];

  // Timer countdown
  useEffect(() => {
    if (isGameOver) return;
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          const won = hype >= 75;
          setVictory(won);
          if (won) {
            sound.playVictoryFanfare();
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {}
            onComplete(true, 20);
          } else {
            sound.playCancel();
            onComplete(false, 5);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGameOver, hype, onComplete]);

  // Handle player pressing A, B, or C
  const handleInput = (inputKey: 'A' | 'B' | 'C') => {
    if (isGameOver) return;

    if (inputKey === currentStep.key) {
      sound.playRallyBeat(true);
      setFlashFeedback('hit');
      setTimeout(() => setFlashFeedback(null), 180);

      setHype(prev => {
        const next = Math.min(100, prev + 12);
        if (next >= 100 && !isGameOver) {
          setIsGameOver(true);
          setVictory(true);
          sound.playVictoryFanfare();
          sound.speakTrump("WE'RE GOING TO DO A FANTASTIC JOB! Greatest movement in American history!", false, "were_going_to_do_a_fantastic_job.mp3");
          try {
            confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
          } catch {}
          onComplete(true, 25);
        }
        return next;
      });
      setCurrentStepIdx(prev => prev + 1);
    } else {
      sound.playRallyBeat(false);
      setFlashFeedback('miss');
      setTimeout(() => setFlashFeedback(null), 180);
      setHype(prev => Math.max(10, prev - 8));
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleInput('A');
      } else if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'b' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleInput('B');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleInput('C');
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isGameOver, onExit]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm bg-neutral-900 border-2 border-red-500/60 rounded-xl p-4 text-white shadow-2xl">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎤</span>
          <span className="font-pixel text-lg tracking-wider text-red-400">ARENA RALLY HYPE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-xs text-amber-400 tabular-nums">TIME: {timeLeft}s</span>
          <button 
            onClick={onExit}
            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-pixel tracking-widest text-neutral-300 transition-colors"
          >
            [ESC] EXIT
          </button>
        </div>
      </div>

      {/* Retro Arena Visualizer */}
      <div 
        className={`relative w-64 h-52 bg-slate-900 rounded-lg border-2 overflow-hidden flex flex-col justify-between p-3 select-none transition-colors ${
          flashFeedback === 'hit' ? 'border-emerald-500 bg-emerald-950/40' :
          flashFeedback === 'miss' ? 'border-red-500 bg-red-950/40' : 'border-neutral-700'
        }`}
      >
        {/* Arena Spotlights */}
        <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
          <div className="w-16 h-full bg-gradient-to-b from-blue-500 to-transparent transform -skew-x-12" />
          <div className="w-16 h-full bg-gradient-to-b from-red-500 to-transparent transform skew-x-12" />
        </div>

        {/* Cheering Crowd Silhouettes */}
        <div className="w-full flex justify-between px-1 opacity-70">
          <span className="text-xl animate-bounce">🙋‍♂️</span>
          <span className="text-xl animate-pulse">🇺🇸</span>
          <span className="text-xl animate-bounce">🙋‍♀️</span>
          <span className="text-xl animate-pulse">🧢</span>
          <span className="text-xl animate-bounce">🙋‍♂️</span>
        </div>

        {/* Center Podium & Donald Sprite */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="text-4xl filter drop-shadow animate-pulse">🕺</div>
          <div className="px-3 py-0.5 bg-amber-500 text-neutral-950 rounded font-pixel text-xs font-bold tracking-widest shadow">
            PODIUM
          </div>
        </div>

        {/* Target Callout Box */}
        {!isGameOver ? (
          <div className="relative z-10 bg-neutral-950/90 border border-amber-400/80 rounded-lg p-2 text-center shadow-lg">
            <span className="text-xs font-pixel text-neutral-400 block">HIT THE CHANT:</span>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-xl">{currentStep.icon}</span>
              <span className="font-pixel text-lg font-bold text-amber-300 tracking-wider">
                BUTTON {currentStep.key}: "{currentStep.label}"
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-3 text-center z-20">
            <span className={`font-pixel text-2xl font-bold tracking-wider ${victory ? 'text-amber-400' : 'text-neutral-300'}`}>
              {victory ? 'TREMENDOUS RALLY!' : 'RALLY CONCLUDED'}
            </span>
            <p className="text-xs text-neutral-300 mt-1">
              {victory ? 'The stadium was overflowing! +25 Approval Ratings!' : 'Great energy! Keep building the momentum.'}
            </p>
            <button
              onClick={() => {
                setHype(50);
                setTimeLeft(20);
                setIsGameOver(false);
                setVictory(false);
              }}
              className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-pixel font-bold text-xs rounded transition-colors"
            >
              RALLY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Hype Meter */}
      <div className="w-full mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs font-pixel text-neutral-300">
          <span>ARENA HYPE LEVEL:</span>
          <span className="tabular-nums font-bold text-red-400">{hype}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 transition-all duration-150"
            style={{ width: `${hype}%` }}
          />
        </div>
      </div>

      {/* Button Affordances */}
      <div className="w-full grid grid-cols-3 gap-2 mt-3">
        <button
          onClick={() => handleInput('A')}
          className={`py-2 px-1 rounded-lg border font-pixel font-bold text-xs flex flex-col items-center justify-center transition-transform active:scale-95 ${
            currentStep.key === 'A' 
              ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-md ring-2 ring-amber-400' 
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <span>[A] 👈</span>
          <span className="text-[10px] truncate max-w-[80px]">THE BEST</span>
        </button>

        <button
          onClick={() => handleInput('B')}
          className={`py-2 px-1 rounded-lg border font-pixel font-bold text-xs flex flex-col items-center justify-center transition-transform active:scale-95 ${
            currentStep.key === 'B' 
              ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-md ring-2 ring-amber-400' 
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <span>[B] ☝️</span>
          <span className="text-[10px] truncate max-w-[80px]">WINNING</span>
        </button>

        <button
          onClick={() => handleInput('C')}
          className={`py-2 px-1 rounded-lg border font-pixel font-bold text-xs flex flex-col items-center justify-center transition-transform active:scale-95 ${
            currentStep.key === 'C' 
              ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-md ring-2 ring-amber-400' 
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <span>[C] 👉</span>
          <span className="text-[10px] truncate max-w-[80px]">AMERICA</span>
        </button>
      </div>
    </div>
  );
};
