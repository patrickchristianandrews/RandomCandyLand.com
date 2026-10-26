import React from 'react';
import { ShellColor, LcdColorTheme, MenuCategory } from '../types/game';

interface HandheldShellProps {
  shellColor: ShellColor;
  lcdTheme: LcdColorTheme;
  children: React.ReactNode;
  onButtonA: () => void;
  onButtonB: () => void;
  onButtonC: () => void;
  isSleeping: boolean;
  selectedMenu: MenuCategory;
}

const SHELL_STYLES: Record<ShellColor, {
  outerGradient: string;
  borderColor: string;
  shadow: string;
  bezelBg: string;
  buttonAColor: string;
  buttonBColor: string;
  buttonCColor: string;
  label: string;
}> = {
  gold: {
    outerGradient: 'radial-gradient(ellipse at 35% 25%, #fff3b0 0%, #e5b93b 35%, #b28315 70%, #6e4e08 100%)',
    borderColor: '#78550a',
    shadow: '0 25px 60px -15px rgba(180, 130, 20, 0.5), inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -8px 16px rgba(0,0,0,0.5)',
    bezelBg: '#2a2210',
    buttonAColor: 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-600',
    buttonBColor: 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-500',
    buttonCColor: 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-600',
    label: '24K Trump Gold',
  },
  red: {
    outerGradient: 'radial-gradient(ellipse at 35% 25%, #ff8a8a 0%, #dc2626 40%, #991b1b 75%, #450a0a 100%)',
    borderColor: '#7f1d1d',
    shadow: '0 25px 60px -15px rgba(220, 38, 38, 0.45), inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -8px 16px rgba(0,0,0,0.5)',
    bezelBg: '#1f1313',
    buttonAColor: 'bg-gradient-to-b from-neutral-800 to-neutral-950 border-neutral-700',
    buttonBColor: 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-400',
    buttonCColor: 'bg-gradient-to-b from-neutral-800 to-neutral-950 border-neutral-700',
    label: 'Presidential Red',
  },
  navy: {
    outerGradient: 'radial-gradient(ellipse at 35% 25%, #93c5fd 0%, #1d4ed8 40%, #1e3a8a 75%, #0f172a 100%)',
    borderColor: '#172554',
    shadow: '0 25px 60px -15px rgba(30, 58, 138, 0.45), inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -8px 16px rgba(0,0,0,0.5)',
    bezelBg: '#0f172a',
    buttonAColor: 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-600',
    buttonBColor: 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-400',
    buttonCColor: 'bg-gradient-to-b from-slate-700 to-slate-900 border-slate-600',
    label: 'Air Force Navy',
  },
  black: {
    outerGradient: 'radial-gradient(ellipse at 35% 25%, #64748b 0%, #1e293b 40%, #0f172a 75%, #020617 100%)',
    borderColor: '#020617',
    shadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), inset 0 3px 6px rgba(255,255,255,0.3), inset 0 -8px 16px rgba(0,0,0,0.7)',
    bezelBg: '#05070a',
    buttonAColor: 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-500',
    buttonBColor: 'bg-gradient-to-b from-amber-500 to-yellow-600 border-amber-400',
    buttonCColor: 'bg-gradient-to-b from-amber-600 to-amber-800 border-amber-500',
    label: 'Executive Onyx',
  },
  palm: {
    outerGradient: 'radial-gradient(ellipse at 35% 25%, #a7f3d0 0%, #059669 40%, #065f46 75%, #022c22 100%)',
    borderColor: '#064e3b',
    shadow: '0 25px 60px -15px rgba(5, 150, 105, 0.4), inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -8px 16px rgba(0,0,0,0.5)',
    bezelBg: '#081c15',
    buttonAColor: 'bg-gradient-to-b from-emerald-800 to-emerald-950 border-emerald-700',
    buttonBColor: 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-400',
    buttonCColor: 'bg-gradient-to-b from-emerald-800 to-emerald-950 border-emerald-700',
    label: 'Palm Beach Emerald',
  },
};

export const HandheldShell: React.FC<HandheldShellProps> = ({
  shellColor,
  children,
  onButtonA,
  onButtonB,
  onButtonC,
  selectedMenu,
}) => {
  const currentShell = SHELL_STYLES[shellColor];

  return (
    <div className="relative flex flex-col items-center">
      {/* Keychain Loop Link at the Top */}
      <div className="flex flex-col items-center -mb-2 z-0">
        <div className="w-8 h-8 rounded-full border-4 border-amber-300 shadow-md bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-amber-400 shadow-inner" />
        </div>
        <div className="w-2.5 h-3 bg-gradient-to-b from-amber-400 to-amber-600 shadow-sm" />
      </div>

      {/* Main Ergonomic Egg Device Shell */}
      <div 
        className="relative z-10 w-[330px] sm:w-[360px] rounded-[70px_70px_85px_85px] p-5 sm:p-6 flex flex-col items-center transition-all duration-300"
        style={{
          background: currentShell.outerGradient,
          boxShadow: currentShell.shadow,
          border: `3px solid ${currentShell.borderColor}`,
        }}
      >
        {/* Brand Lockup Header on Shell */}
        <div className="w-full flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300 text-sm">★</span>
            <span className="font-pixel text-base font-bold tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              TRUMPAGOTCHI
            </span>
          </div>
          <span className="font-pixel text-[11px] tracking-wider text-amber-200/90 uppercase font-semibold drop-shadow">
            POCKET POTUS
          </span>
        </div>

        {/* Recessed Screen Bezel */}
        <div 
          className="relative rounded-2xl p-2.5 shadow-2xl border-2 border-black/50 w-full flex flex-col items-center"
          style={{ backgroundColor: currentShell.bezelBg }}
        >
          {/* Corner Screws */}
          <div className="w-full flex justify-between px-1 mb-1 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 border border-black" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 border border-black" />
          </div>

          {/* Child LCD Screen */}
          {children}

          {/* Bottom Bezel Screws */}
          <div className="w-full flex justify-between px-1 mt-1 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 border border-black" />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 border border-black" />
          </div>
        </div>

        {/* Physical Speaker Grille Perforations */}
        <div className="flex gap-1.5 my-3.5 opacity-50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/60 shadow-inner" />
          ))}
        </div>

        {/* 3 Ergonomic Physical Silicone Buttons */}
        <div className="w-full flex items-center justify-between px-3 sm:px-5 mt-1 mb-2">
          {/* Button A: Cycle / Select Icon */}
          <div className="flex flex-col items-center">
            <button
              onClick={onButtonA}
              aria-label="Button A: Cycle Menu"
              className={`w-12 h-12 rounded-full border-2 text-white font-pixel font-bold text-sm shadow-[0_4px_0_rgba(0,0,0,0.6)] active:shadow-[0_1px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none ${currentShell.buttonAColor}`}
            >
              <span className="leading-none text-base">A</span>
            </button>
            <span className="font-pixel text-[11px] font-bold text-white/90 drop-shadow mt-1 tracking-wider">
              CYCLE [A]
            </span>
          </div>

          {/* Button B: Action / Confirm / Execute */}
          <div className="flex flex-col items-center -mt-2">
            <button
              onClick={onButtonB}
              aria-label="Button B: Execute Action"
              className={`w-14 h-14 rounded-full border-2 text-neutral-950 font-pixel font-extrabold text-base shadow-[0_5px_0_rgba(0,0,0,0.6)] active:shadow-[0_1px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none ring-2 ring-white/20 ${currentShell.buttonBColor}`}
            >
              <span className="leading-none text-lg">B</span>
            </button>
            <span className="font-pixel text-[12px] font-bold text-amber-200 drop-shadow mt-1 tracking-wider uppercase">
              SELECT [B]
            </span>
          </div>

          {/* Button C: Cancel / Status Check */}
          <div className="flex flex-col items-center">
            <button
              onClick={onButtonC}
              aria-label="Button C: Cancel or Inspect"
              className={`w-12 h-12 rounded-full border-2 text-white font-pixel font-bold text-sm shadow-[0_4px_0_rgba(0,0,0,0.6)] active:shadow-[0_1px_0_rgba(0,0,0,0.6)] active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none ${currentShell.buttonCColor}`}
            >
              <span className="leading-none text-base">C</span>
            </button>
            <span className="font-pixel text-[11px] font-bold text-white/90 drop-shadow mt-1 tracking-wider">
              CANCEL [C]
            </span>
          </div>
        </div>

        {/* Small Model Stamp */}
        <div className="text-[10px] font-pixel text-white/60 tracking-widest uppercase mt-1">
          MODEL: POTUS-97 · 24K GOLD CHIP
        </div>
      </div>
    </div>
  );
};
