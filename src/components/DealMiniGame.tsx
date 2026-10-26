import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface DealMiniGameProps {
  onComplete: (netWorthReward: number) => void;
  onExit: () => void;
}

export const DealMiniGame: React.FC<DealMiniGameProps> = ({ onComplete, onExit }) => {
  const [currentVal, setCurrentVal] = useState<number>(50);
  const [streak, setStreak] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string>('WILL THE NEXT APPRAISAL BE HIGHER OR LOWER?');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [wonGrandPrize, setWonGrandPrize] = useState<boolean>(false);

  const makeGuess = (guess: 'higher' | 'lower') => {
    if (isDone) return;

    sound.playButtonBlip();
    // Generate new value 1-99 (different from current)
    let nextVal = Math.floor(Math.random() * 90) + 5;
    while (nextVal === currentVal) {
      nextVal = Math.floor(Math.random() * 90) + 5;
    }

    const isHigher = nextVal > currentVal;
    const correct = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

    if (correct) {
      sound.playSelectChime();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCurrentVal(nextVal);

      if (newStreak >= 3) {
        setIsDone(true);
        setWonGrandPrize(true);
        setStatusMsg('MASTERPIECE DEAL! YOU ARE A NATURAL DEALMAKER!');
        sound.playVictoryFanfare();
        sound.speakTrump("IT'S A FIVE-YEAR DEAL! Signed with the thick black Sharpie!", false, "its_a_five_year_deal.mp3");
        try {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
        } catch {}
        onComplete(1.0); // +$1.0B net worth boost
      } else {
        setStatusMsg(`CORRECT! VALUE: $${nextVal}M! ONE STEP CLOSER!`);
      }
    } else {
      sound.playCancel();
      sound.speakTrump("WRONG! We are going to negotiate a better deal anyway!", false, "wrong.mp3");
      setIsDone(true);
      setWonGrandPrize(false);
      setCurrentVal(nextVal);
      setStatusMsg(`DEAL COLLAPSED AT $${nextVal}M! STILL A VALIANT EFFORT.`);
      onComplete(0.2);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        makeGuess('higher');
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        makeGuess('lower');
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVal, streak, isDone, onExit]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm bg-neutral-900 border-2 border-amber-500/60 rounded-xl p-4 text-white shadow-2xl">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏙️</span>
          <span className="font-pixel text-lg tracking-wider text-amber-400">THE ART OF THE DEAL</span>
        </div>
        <button 
          onClick={onExit}
          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-pixel tracking-widest text-neutral-300 transition-colors"
        >
          [ESC] EXIT
        </button>
      </div>

      {/* Boardroom LCD Screen */}
      <div className="relative w-64 h-52 bg-slate-900 rounded-lg border-2 border-neutral-700 overflow-hidden flex flex-col justify-between p-3 select-none">
        <div className="flex justify-between items-center text-xs font-pixel text-neutral-400">
          <span>DEAL STREAK:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-base ${streak >= i ? 'text-amber-400' : 'text-neutral-700'}`}>
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Big Valuation Display */}
        <div className="flex flex-col items-center justify-center my-auto">
          <span className="text-xs font-pixel text-neutral-400 tracking-wider">CURRENT APPRAISAL</span>
          <span className="font-pixel text-4xl font-bold text-amber-400 tabular-nums">
            ${currentVal}M
          </span>
          <span className="text-3xl mt-1">🏢</span>
        </div>

        {/* Message ticker */}
        <div className="bg-black/60 rounded p-1.5 text-center border border-neutral-800">
          <span className="font-pixel text-xs text-neutral-200 tracking-wider">
            {statusMsg}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {!isDone ? (
        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => makeGuess('higher')}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-pixel font-bold text-sm tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg"
          >
            <span>[A] ⬆️</span>
            <span>HIGHER</span>
          </button>
          <button
            onClick={() => makeGuess('lower')}
            className="py-2.5 px-3 bg-red-600 hover:bg-red-500 rounded-lg font-pixel font-bold text-sm tracking-wider flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg"
          >
            <span>[C] ⬇️</span>
            <span>LOWER</span>
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <button
            onClick={() => {
              setCurrentVal(Math.floor(Math.random() * 50) + 25);
              setStreak(0);
              setIsDone(false);
              setStatusMsg('NEW NEGOTIATION OPENED!');
            }}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-pixel font-bold text-xs rounded-lg transition-colors"
          >
            NEW DEAL TABLE
          </button>
          <button
            onClick={onExit}
            className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-pixel text-xs rounded transition-colors"
          >
            RETURN TO PET [ESC]
          </button>
        </div>
      )}
    </div>
  );
};
