import React, { useRef, useEffect } from 'react';
import { PetStats, MenuCategory, LcdColorTheme } from '../types/game';
import { 
  PixelGrid,
  SPRITE_TRUMP_BABY,
  SPRITE_TRUMP_BABY_2,
  SPRITE_TRUMP_IDLE_1, 
  SPRITE_TRUMP_IDLE_2, 
  SPRITE_TRUMP_TALK, 
  SPRITE_TRUMP_EAT, 
  SPRITE_TRUMP_GOLF, 
  SPRITE_TRUMP_RALLY, 
  SPRITE_TRUMP_SLEEP, 
  SPRITE_TRUMP_GROOM, 
  SPRITE_TRUMP_ANGRY,
  SPRITE_TRUMP_DANCE_1,
  SPRITE_TRUMP_DANCE_2,
  SPRITE_TRUMP_TV_FAKENEWS_1,
  SPRITE_TRUMP_TV_FAKENEWS_2,
  SPRITE_CRT_TV,
  SPRITE_MUSIC_NOTE,
  SPRITE_FAKE_BUBBLE,
  SPRITE_PAPER_MESS, 
  SPRITE_BURGER,
  SPRITE_GOLF_FLAG,
  SPRITE_HEART,
  SPRITE_ALERT
} from '../utils/sprites';
import { CurrentAnimation } from '../hooks/usePetGame';
import { sound } from '../utils/audio';

interface LcdScreenProps {
  stats: PetStats;
  animation: CurrentAnimation;
  currentMenu: MenuCategory;
  theme: LcdColorTheme;
  quoteText: string;
  isSleeping: boolean;
  onTapDonald?: () => void;
}

const THEME_COLORS: Record<LcdColorTheme, {
  bg: string;
  pixelOff: string;
  pixelOn: string;
  gold: string;
  highlight: string;
  skin: string;
  red: string;
  blue: string;
  white: string;
  podium: string;
}> = {
  'classic-green': {
    bg: '#8da678',
    pixelOff: '#81996c',
    pixelOn: '#1a2910',
    gold: '#b45309',
    highlight: '#eab308',
    skin: '#ea580c',
    red: '#dc2626',
    blue: '#1e3a8a',
    white: '#f1f5f9',
    podium: '#5c2b09',
  },
  'amber-glow': {
    bg: '#d49842',
    pixelOff: '#be8636',
    pixelOn: '#261403',
    gold: '#78350f',
    highlight: '#b45309',
    skin: '#9a3412',
    red: '#991b1b',
    blue: '#0f172a',
    white: '#fef3c7',
    podium: '#451a03',
  },
  'ice-blue': {
    bg: '#7ca4b8',
    pixelOff: '#6f96aa',
    pixelOn: '#0c2333',
    gold: '#b45309',
    highlight: '#f59e0b',
    skin: '#ea580c',
    red: '#dc2626',
    blue: '#0284c7',
    white: '#f8fafc',
    podium: '#1e293b',
  },
  'matrix-green': {
    bg: '#0a1a0c',
    pixelOff: '#112914',
    pixelOn: '#22c55e',
    gold: '#eab308',
    highlight: '#facc15',
    skin: '#f97316',
    red: '#ef4444',
    blue: '#3b82f6',
    white: '#f8fafc',
    podium: '#854d0e',
  },
};

export const LcdScreen: React.FC<LcdScreenProps> = ({
  stats,
  animation,
  currentMenu,
  theme,
  quoteText,
  isSleeping,
  onTapDonald,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);
  const tickRef = useRef<number>(0);

  // Full-time 100% authentic retro LCD pixel matrix drawing loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid size: 64 width x 48 height LCD pixels
    const cols = 64;
    const rows = 48;
    const pixelSize = 4; // 256x192 physical canvas resolution

    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    const themePalette = THEME_COLORS[theme];

    const render = () => {
      tickRef.current++;
      const t = tickRef.current;

      // 1. Draw LCD background
      ctx.fillStyle = isSleeping && theme !== 'matrix-green' ? '#4f5e43' : themePalette.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Background pixel dot matrix
      ctx.fillStyle = themePalette.pixelOff;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(c * pixelSize, r * pixelSize, 1, 1);
          }
        }
      }

      // Helper to stamp a pixel sprite
      const drawSprite = (sprite: PixelGrid, startCol: number, startRow: number, flipX = false) => {
        const spriteRows = sprite.length;
        const spriteCols = sprite[0].length;

        for (let r = 0; r < spriteRows; r++) {
          for (let c = 0; c < spriteCols; c++) {
            const val = sprite[r][c];
            if (val === 0) continue;

            let color = themePalette.pixelOn;
            if (val === 2) color = themePalette.gold;
            else if (val === 3) color = themePalette.red;
            else if (val === 4) color = themePalette.blue;
            else if (val === 5) color = themePalette.white;
            else if (val === 6) color = themePalette.skin;
            else if (val === 7) color = themePalette.highlight;
            else if (val === 8) color = themePalette.podium;

            ctx.fillStyle = color;
            const targetCol = flipX ? startCol + (spriteCols - 1 - c) : startCol + c;
            const targetRow = startRow + r;

            if (targetCol >= 0 && targetCol < cols && targetRow >= 0 && targetRow < rows) {
              // Draw LCD dot with 1px border gap for genuine handheld screen matrix
              ctx.fillRect(
                targetCol * pixelSize, 
                targetRow * pixelSize, 
                pixelSize - 1, 
                pixelSize - 1
              );
            }
          }
        }
      };

      // 3. Determine Donald Sprite & Coordinates based on Stage & Animation
      let currentSprite: PixelGrid = SPRITE_TRUMP_IDLE_1;
      let xOffset = 16;
      let yOffset = 8;

      if (stats.evolutionStage === 'baby') {
        // Small toddler Donald!
        const isBouncing = Math.floor(t / 18) % 2 === 0;
        currentSprite = isBouncing ? SPRITE_TRUMP_BABY : SPRITE_TRUMP_BABY_2;
        xOffset = 20;
        yOffset = 16;
      } else if (isSleeping || animation === 'sleep') {
        currentSprite = SPRITE_TRUMP_SLEEP;
        yOffset = 10;
      } else if (animation === 'dance') {
        // Trump Fist-Pump YMCA Dance!
        const isPumpLeft = Math.floor(t / 10) % 2 === 0;
        currentSprite = isPumpLeft ? SPRITE_TRUMP_DANCE_1 : SPRITE_TRUMP_DANCE_2;
        xOffset = 16;
        yOffset = isPumpLeft ? 7 : 8;

        // Floating musical notes
        if (t % 16 < 8) {
          drawSprite(SPRITE_MUSIC_NOTE, 6, 8);
        } else {
          drawSprite(SPRITE_MUSIC_NOTE, 50, 6);
        }
      } else if (animation === 'tv_fake_news') {
        // Donald yelling at CRT TV news!
        const isShakeFists = Math.floor(t / 8) % 2 === 0;
        currentSprite = isShakeFists ? SPRITE_TRUMP_TV_FAKENEWS_1 : SPRITE_TRUMP_TV_FAKENEWS_2;
        xOffset = 26; // Position Donald on the right
        yOffset = 8;

        // Draw the retro CRT television on the left
        drawSprite(SPRITE_CRT_TV, 4, 18);

        // Draw floating "FAKE!" banner above television
        drawSprite(SPRITE_FAKE_BUBBLE, 3, 6);
      } else if (animation === 'eat') {
        currentSprite = SPRITE_TRUMP_EAT;
        drawSprite(SPRITE_BURGER, 6, 22);
        if (t % 20 < 10) drawSprite(SPRITE_HEART, 48, 12);
      } else if (animation === 'golf') {
        currentSprite = SPRITE_TRUMP_GOLF;
        drawSprite(SPRITE_GOLF_FLAG, 48, 20);
      } else if (animation === 'rally') {
        currentSprite = SPRITE_TRUMP_RALLY;
        if (Math.floor(t / 8) % 2 === 0) {
          yOffset = 7;
        }
      } else if (animation === 'groom') {
        currentSprite = SPRITE_TRUMP_GROOM;
        if (t % 16 < 8) {
          drawSprite(SPRITE_HEART, 48, 10);
        }
      } else if (animation === 'angry' || (stats.hunger < 25 && !isSleeping)) {
        currentSprite = SPRITE_TRUMP_ANGRY;
        if (t % 12 < 6) xOffset += 1;
      } else if (animation === 'talk') {
        currentSprite = SPRITE_TRUMP_TALK;
        if (Math.floor(t / 10) % 2 === 0) {
          xOffset += 1;
        }
      } else {
        // Adult Trump Idle (breathing & hair gleam)
        const cycle = Math.floor(t / 24) % 4;
        if (cycle === 0 || cycle === 2) {
          currentSprite = SPRITE_TRUMP_IDLE_1;
          xOffset = 16;
        } else if (cycle === 1) {
          currentSprite = SPRITE_TRUMP_IDLE_2;
          xOffset = 17;
        } else {
          currentSprite = SPRITE_TRUMP_IDLE_2;
          xOffset = 15;
        }
      }

      // Draw Trump Character Sprite
      drawSprite(currentSprite, xOffset, yOffset);

      // 4. Draw Scattered Secret Documents if messy
      if (stats.messCount >= 1) drawSprite(SPRITE_PAPER_MESS, 4, 30);
      if (stats.messCount >= 2) drawSprite(SPRITE_PAPER_MESS, 48, 30);
      if (stats.messCount >= 3) drawSprite(SPRITE_PAPER_MESS, 14, 32);
      if (stats.messCount >= 4) drawSprite(SPRITE_PAPER_MESS, 42, 32);

      // 5. Draw Attention Alert Icon
      if (stats.attentionNeeded && (Math.floor(t / 15) % 2 === 0)) {
        drawSprite(SPRITE_ALERT, 54, 3);
      }

      // 6. Draw Carpet Baseline
      ctx.fillStyle = themePalette.pixelOn;
      for (let c = 0; c < cols; c += 2) {
        ctx.fillRect(c * pixelSize, 40 * pixelSize, pixelSize - 1, 1);
      }

      frameRef.current = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, animation, isSleeping, stats.messCount, stats.attentionNeeded, stats.hunger, stats.evolutionStage]);

  // Icons for top and bottom status bars
  const TOP_ICONS: { id: MenuCategory; label: string; icon: string }[] = [
    { id: 'feed', label: 'FEED', icon: '🍔' },
    { id: 'dance', label: 'DANCE', icon: '🕺' },
    { id: 'tv', label: 'TV NEWS', icon: '📺' },
    { id: 'lights', label: 'LIGHT', icon: isSleeping ? '🌙' : '💡' },
    { id: 'games', label: 'PLAY', icon: '⛳' },
  ];

  const BOTTOM_ICONS: { id: MenuCategory; label: string; icon: string }[] = [
    { id: 'medicine', label: 'DOC', icon: '💊' },
    { id: 'clean', label: 'CLEAN', icon: '🧹' },
    { id: 'ratings', label: 'POLL', icon: '📊' },
    { id: 'pep', label: 'RALLY', icon: '🎤' },
    { id: 'groom', label: 'COMB', icon: '👑' },
  ];

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* LCD Housing Inner Frame */}
      <div 
        className="relative rounded-xl p-3 border-4 border-neutral-900/40 shadow-inner flex flex-col items-center overflow-hidden"
        style={{
          backgroundColor: THEME_COLORS[theme].bg,
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.4), 0 2px 4px rgba(255,255,255,0.2)'
        }}
      >
        {/* TOP STATUS BAR ICONS */}
        <div className="w-full flex items-center justify-between px-2 mb-1.5 border-b border-black/20 pb-1">
          {TOP_ICONS.map((item) => {
            const isSelected = currentMenu === item.id;
            return (
              <div 
                key={item.id}
                className={`flex flex-col items-center transition-transform ${
                  isSelected ? 'scale-125 font-bold animate-pulse' : 'opacity-40'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span 
                  className="font-pixel text-[10px] tracking-widest leading-none mt-0.5"
                  style={{ color: THEME_COLORS[theme].pixelOn }}
                >
                  {item.label}
                </span>
                {isSelected && (
                  <div 
                    className="w-2.5 h-0.5 mt-0.5" 
                    style={{ backgroundColor: THEME_COLORS[theme].pixelOn }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* MAIN CANVAS VIEWPORT (RETRO LCD MODE AT ALL TIMES) */}
        <div 
          onClick={() => {
            if (onTapDonald) {
              onTapDonald();
            }
          }}
          title="Click Donald to hear him speak his phrase!"
          className="relative border border-black/25 rounded bg-black/5 overflow-hidden w-64 h-52 flex flex-col items-center justify-center cursor-pointer active:scale-[0.99] transition-transform"
        >
          <canvas 
            ref={canvasRef}
            className="block w-64 h-48 pixelated"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Authentic scanline & glass glare overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.25) 50%, transparent 50%)',
              backgroundSize: '100% 4px',
            }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/15" />

          {/* Voice indicator badge in corner */}
          <div className="absolute top-1 left-1.5 z-20 flex items-center gap-1 opacity-60">
            <span className="text-[10px]">🗣️</span>
            <span 
              className="font-pixel text-[9px] tracking-wider font-bold"
              style={{ color: THEME_COLORS[theme].pixelOn }}
            >
              TAP TO HEAR TRUMP
            </span>
          </div>
        </div>

        {/* GROWTH TO PRESIDENT TRACKER */}
        <div className="w-full mt-1.5 px-2 py-0.5 rounded border border-black/20 bg-black/10 flex flex-col gap-0.5">
          <div className="flex items-center justify-between font-pixel text-[10px]" style={{ color: THEME_COLORS[theme].pixelOn }}>
            <span className="font-bold uppercase tracking-wider">
              {stats.evolutionStage === 'baby' ? '🍼 STAGE 1: BABY DONALD' :
               stats.evolutionStage === 'apprentice' ? '📋 STAGE 2: THE APPRENTICE' :
               stats.evolutionStage === 'tycoon' ? '🏢 STAGE 3: REAL ESTATE TYCOON' :
               stats.evolutionStage === 'potus' ? '🏛️ STAGE 4: COMMANDER-IN-CHIEF' :
               '👑 STAGE 5: GOLDEN GOLF LEGEND'}
            </span>
            <span className="tabular-nums font-bold">
              {stats.evolutionStage === 'potus' ? 'PRESIDENT!' : `${stats.growthProgress}% TO GROW`}
            </span>
          </div>
          <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden border border-black/15">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${stats.growthProgress}%` }}
            />
          </div>
        </div>

        {/* BOTTOM STATUS BAR ICONS */}
        <div className="w-full flex items-center justify-between px-2 mt-1 border-t border-black/20 pt-1">
          {BOTTOM_ICONS.map((item) => {
            const isSelected = currentMenu === item.id;
            return (
              <div 
                key={item.id}
                className={`flex flex-col items-center transition-transform ${
                  isSelected ? 'scale-125 font-bold animate-pulse' : 'opacity-40'
                }`}
              >
                {isSelected && (
                  <div 
                    className="w-2.5 h-0.5 mb-0.5" 
                    style={{ backgroundColor: THEME_COLORS[theme].pixelOn }}
                  />
                )}
                <span className="text-base leading-none">{item.icon}</span>
                <span 
                  className="font-pixel text-[10px] tracking-widest leading-none mt-0.5"
                  style={{ color: THEME_COLORS[theme].pixelOn }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* LCD SPEECH / ACTION TICKER (Displays Trump's spoken phrase) */}
        <div 
          onClick={() => {
            if (onTapDonald) onTapDonald();
          }}
          className="w-full mt-2 px-2 py-1 rounded border border-black/25 flex items-center justify-between font-pixel text-xs tracking-wider overflow-hidden cursor-pointer hover:bg-black/15 transition-colors"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)',
            color: THEME_COLORS[theme].pixelOn,
          }}
        >
          <span className="truncate max-w-[195px] font-bold">
            {isSleeping ? 'STATUS: WINNING IN SLEEP (Zzz)' : `"${quoteText}"`}
          </span>
          <span className="tabular-nums font-bold text-[11px] ml-1 shrink-0">
            {stats.ratings}% POLL
          </span>
        </div>
      </div>
    </div>
  );
};
