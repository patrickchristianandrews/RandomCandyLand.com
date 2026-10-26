import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GolfMiniGameProps {
  onComplete: (trophyEarned: boolean, score: number) => void;
  onExit: () => void;
}

type GolfState = 'AIM' | 'POWER' | 'FLYING' | 'RESULT';

export const GolfMiniGame: React.FC<GolfMiniGameProps> = ({ onComplete, onExit }) => {
  const [gameState, setGameState] = useState<GolfState>('AIM');
  const [aimAngle, setAimAngle] = useState<number>(0); // -40 to +40 degrees
  const [power, setPower] = useState<number>(0);       // 0 to 100%
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultSub, setResultSub] = useState<string>('');
  const [isHoleInOne, setIsHoleInOne] = useState<boolean>(false);

  const aimDirRef = useRef<number>(1);
  const powerDirRef = useRef<number>(1);
  const ballPosRef = useRef<{ x: number; y: number }>({ x: 120, y: 170 });

  // Aim oscillating animation
  useEffect(() => {
    if (gameState !== 'AIM') return;
    const interval = window.setInterval(() => {
      setAimAngle(prev => {
        let next = prev + aimDirRef.current * 3;
        if (next > 40) {
          next = 40;
          aimDirRef.current = -1;
        } else if (next < -40) {
          next = -40;
          aimDirRef.current = 1;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(interval);
  }, [gameState]);

  // Power oscillating animation
  useEffect(() => {
    if (gameState !== 'POWER') return;
    const interval = window.setInterval(() => {
      setPower(prev => {
        let next = prev + powerDirRef.current * 4.5;
        if (next >= 100) {
          next = 100;
          powerDirRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          powerDirRef.current = 1;
        }
        return next;
      });
    }, 25);
    return () => window.clearInterval(interval);
  }, [gameState]);

  // Handle player button click or spacebar
  const handleSwingAction = () => {
    if (gameState === 'AIM') {
      sound.playButtonBlip();
      setGameState('POWER');
    } else if (gameState === 'POWER') {
      sound.playGolfHit();
      setGameState('FLYING');

      // Calculate outcome
      // Sweet spot: aim between -10 and +10, power between 75 and 90
      const angleErr = Math.abs(aimAngle);
      const isPerfectAim = angleErr <= 12;
      const isPerfectPower = power >= 75 && power <= 92;

      setTimeout(() => {
        if (isPerfectAim && isPerfectPower) {
          // Hole in one!
          setIsHoleInOne(true);
          setResultMessage('HOLE IN ONE!');
          setResultSub('TREMENDOUS SHOT! NOBODY GOLFS BETTER!');
          sound.playVictoryFanfare();
          sound.speakTrump("I HAVE THE BEST COURSES IN THE WORLD!", false, "i_have_the_best_courses_in_the_world.mp3");
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {}
          onComplete(true, 100);
        } else if (angleErr <= 20 && power >= 60) {
          // Good shot / Birdie
          setResultMessage('BIRDIE ON THE GREEN!');
          setResultSub('Spectacular drive onto the fairway! +15 Ratings');
          sound.playSelectChime();
          sound.speakTrump("GOLF! Straight down the middle, pure muscle!", false, "golf.mp3");
          onComplete(false, 60);
        } else if (power < 40) {
          setResultMessage('SHORT CHIP');
          setResultSub('Need more power! The ball rolled short.');
          sound.playCancel();
          sound.speakTrump("CAN YOU BELIEVE THIS?! Need more power!", false, "can_you_believe_this.mp3");
        } else {
          setResultMessage('IN THE BUNKER');
          setResultSub('Very unfair rough! Still a champion swing.');
          sound.playCancel();
          sound.speakTrump("WRONG! Very unfair rough, believe me!", false, "wrong.mp3");
        }
        setGameState('RESULT');
      }, 1200);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'RESULT') {
          // Reset or exit
          setGameState('AIM');
          setPower(0);
          setIsHoleInOne(false);
        } else {
          handleSwingAction();
        }
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, aimAngle, power, onExit]);

  return (
    <div className="flex flex-col items-center w-full max-w-sm bg-neutral-900 border-2 border-amber-500/60 rounded-xl p-4 text-white shadow-2xl">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⛳</span>
          <span className="font-pixel text-lg tracking-wider text-amber-400">BEDMINSTER GOLDEN GOLF</span>
        </div>
        <button 
          onClick={onExit}
          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-pixel tracking-widest text-neutral-300 transition-colors"
        >
          [ESC] EXIT
        </button>
      </div>

      {/* Retro 8-bit Golf Field Viewport */}
      <div className="relative w-64 h-52 bg-[#336b2b] rounded-lg border-2 border-[#1e4418] overflow-hidden flex flex-col justify-between p-3 select-none">
        {/* Background Grass Textures */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Sand Trap Hazard */}
        <div className="absolute top-12 left-6 w-16 h-10 bg-[#c2a649] rounded-full opacity-80 border border-[#8a7229]" />
        
        {/* Water Hazard */}
        <div className="absolute top-10 right-6 w-14 h-12 bg-[#2d6287] rounded-full opacity-80 border border-[#1b3e57]" />

        {/* Putting Green & Pin Flag */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-16 bg-[#4ba33e] rounded-full border-2 border-[#60bf50] flex items-center justify-center">
          {/* Hole cup */}
          <div className="w-4 h-4 bg-black rounded-full relative flex items-center justify-center">
            {/* Flag stick */}
            <div className="absolute bottom-2 left-1.5 w-1 h-8 bg-white">
              <div className="absolute top-0 right-1 w-4 h-3 bg-red-600 rounded-sm font-pixel text-[8px] flex items-center justify-center text-white font-bold">
                1
              </div>
            </div>
          </div>
        </div>

        {/* Donald with Golden Club (Tee Box) */}
        <div className="relative z-10 mt-auto flex flex-col items-center">
          {/* Aim Arrow Indicator */}
          {gameState === 'AIM' && (
            <div 
              className="w-1 h-12 bg-amber-400 origin-bottom transition-transform mb-1 shadow-lg flex flex-col items-center"
              style={{ transform: `rotate(${aimAngle}deg)` }}
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-amber-300 -mt-2" />
            </div>
          )}

          {/* Golfer Avatar Sprite */}
          <div className="text-3xl filter drop-shadow">🏌️‍♂️</div>
          <div className="text-[10px] font-pixel text-amber-300 font-bold tracking-widest mt-0.5">
            TEE BOX 18
          </div>
        </div>

        {/* Flying ball animation */}
        {gameState === 'FLYING' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>
        )}

        {/* Result Overlay */}
        {gameState === 'RESULT' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center">
            <span className={`font-pixel text-xl tracking-wider font-bold ${isHoleInOne ? 'text-amber-400' : 'text-white'}`}>
              {resultMessage}
            </span>
            <p className="text-xs text-neutral-300 mt-1 max-w-[200px]">
              {resultSub}
            </p>
            <button
              onClick={() => {
                setGameState('AIM');
                setPower(0);
                setIsHoleInOne(false);
              }}
              className="mt-3 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-pixel font-bold text-xs rounded transition-colors"
            >
              SWING AGAIN [SPACE]
            </button>
          </div>
        )}
      </div>

      {/* Control Meters */}
      <div className="w-full mt-3 space-y-2">
        {/* Aim Status */}
        <div className="flex items-center justify-between text-xs font-pixel text-neutral-300">
          <span>DIRECTION:</span>
          <span className="font-bold text-amber-400">
            {aimAngle < -8 ? '👈 HOOK (LEFT)' : aimAngle > 8 ? '👉 SLICE (RIGHT)' : '🎯 STRAIGHT TO CUP'}
          </span>
        </div>

        {/* Power Meter Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-pixel text-neutral-300">
            <span>DRIVER POWER:</span>
            <span className="tabular-nums font-bold text-amber-400">{Math.round(power)}%</span>
          </div>
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700 relative">
            {/* Sweet Spot Guide (75-90%) */}
            <div className="absolute top-0 bottom-0 left-[75%] right-[10%] bg-emerald-500/30 border-x border-emerald-400" />
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 transition-all duration-75"
              style={{ width: `${power}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-pixel text-neutral-400">
            <span>0%</span>
            <span className="text-emerald-400 font-bold">SWEET SPOT</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      {gameState !== 'RESULT' && (
        <button
          onClick={handleSwingAction}
          className="w-full mt-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-pixel font-bold tracking-widest text-sm rounded-lg shadow-lg active:scale-95 transition-all"
        >
          {gameState === 'AIM' ? 'LOCK AIM [SPACE / BUTTON B]' : 'SWING DRIVER! [SPACE / BUTTON B]'}
        </button>
      )}
    </div>
  );
};
