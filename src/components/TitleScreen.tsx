import { ShellColor, LcdColorTheme, PetStats } from '../types/game';
import { sound } from '../utils/audio';
import { TrumpCaricature } from './TrumpCaricature';

interface TitleScreenProps {
  onStartGame: () => void;
  shellColor: ShellColor;
  setShellColor: (color: ShellColor) => void;
  lcdTheme: LcdColorTheme;
  setLcdTheme: (theme: LcdColorTheme) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onReturnToCandyLand?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  shellColor,
  setShellColor,
  lcdTheme,
  setLcdTheme,
  isMuted,
  onToggleMute,
  onReturnToCandyLand,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-radial from-neutral-900 via-neutral-950 to-black text-white select-none overflow-hidden">
      {/* Subtle Background Ambience */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

      {/* Top Bar Utilities */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {onReturnToCandyLand && (
            <button
              onClick={() => {
                sound.playButtonBlip();
                onReturnToCandyLand();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/50 bg-pink-950/60 hover:bg-pink-900 text-xs font-pixel text-pink-300 transition-colors shadow-sm cursor-pointer"
            >
              <span>🍬</span>
              <span className="hidden sm:inline">RETURN TO CANDY LAND</span>
              <span className="sm:hidden">CANDY LAND</span>
            </button>
          )}
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-pixel text-xs tracking-widest text-amber-300 hidden sm:inline">
            DIGIPET CARTRIDGE LOADED · 1997 RETRO EDITION
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/trumpagotchi-project.zip"
            download="trumpagotchi-project.zip"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/60 bg-amber-950/60 hover:bg-amber-900 text-xs font-pixel text-amber-300 transition-colors shadow-sm cursor-pointer"
            title="Download full project source code and audio files (ZIP)"
          >
            <span>📦</span>
            <span>DOWNLOAD ZIP</span>
          </a>
          <button
            onClick={() => {
              sound.playButtonBlip();
              onToggleMute();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-pixel text-neutral-300 transition-colors cursor-pointer"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece & Bespoke Title Lockup */}
      <div className="flex flex-col items-center my-auto z-10 text-center max-w-xl">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="w-full max-w-md px-2 mb-2">
          <svg viewBox="0 0 460 95" className="w-full h-auto drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]">
            <defs>
              <linearGradient id="goldTitleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {/* Stars row */}
            <text x="230" y="16" textAnchor="middle" fill="#f59e0b" fontSize="11" letterSpacing="6" fontFamily="Plus Jakarta Sans" fontWeight="bold">
              ★ ★ ★ THE ORIGINAL 1997 DIGIPET ★ ★ ★
            </text>
            {/* Main Wordmark */}
            <text 
              x="230" 
              y="60" 
              textAnchor="middle" 
              fill="url(#goldTitleGrad)" 
              stroke="#000" 
              strokeWidth="4" 
              paintOrder="stroke fill" 
              fontSize="44" 
              fontFamily="VT323, monospace" 
              letterSpacing="4" 
              fontWeight="900"
            >
              TRUMPAGOTCHI
            </text>
            {/* Subtitle Ribbon */}
            <text 
              x="230" 
              y="84" 
              textAnchor="middle" 
              fill="url(#chromeGrad)" 
              fontSize="14" 
              fontFamily="Plus Jakarta Sans, sans-serif" 
              letterSpacing="5" 
              fontWeight="800"
            >
              THE POCKET POTUS VIRTUAL PET
            </text>
          </svg>
        </div>

        {/* Animated Trump Caricature Hero Centerpiece */}
        <div className="relative my-2 flex flex-col items-center">
          <div className="w-40 h-44 rounded-2xl bg-neutral-900/80 border-2 border-amber-500/60 p-1 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
            <TrumpCaricature
              animation="idle"
              stats={{
                hunger: 80,
                happiness: 90,
                energy: 85,
                cleanliness: 95,
                hairStyle: 100,
                health: 95,
                ratings: 88,
                ageMinutes: 10,
                evolutionStage: 'potus',
                growthProgress: 85,
                netWorthBillion: 10.5,
                ralliesHeld: 15,
                golfTrophies: 4,
                burgersEaten: 12,
                dealsStruck: 8,
                dancesDone: 5,
                tvYellsCount: 12,
                isSleeping: false,
                isSick: false,
                messCount: 0,
                attentionNeeded: false,
                lastFedTimestamp: Date.now(),
                lastActionTimestamp: Date.now(),
              }}
              theme={lcdTheme}
              isSleeping={false}
              scale={0.72}
            />
          </div>
          <div className="mt-2 font-pixel text-xs text-amber-300 tracking-wider">
            "TREMENDOUS QUALITY. NEVER SEEN ANYTHING LIKE IT!"
          </div>
        </div>

        {/* Start Game CTA Button */}
        <button
          onClick={() => {
            sound.playSelectChime();
            onStartGame();
          }}
          className="mt-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-pixel font-bold text-lg tracking-widest rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          START POCKET PET · [SPACE / ENTER]
        </button>

        {/* Casing & LCD Customization Bar */}
        <div className="mt-6 w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-2.5">
          {/* Shell Selector */}
          <div className="flex items-center justify-between text-xs font-pixel">
            <span className="text-neutral-400">SHELL FINISH:</span>
            <div className="flex gap-1.5">
              {(['gold', 'red', 'navy', 'black', 'palm'] as ShellColor[]).map(color => (
                <button
                  key={color}
                  onClick={() => {
                    sound.playButtonBlip();
                    setShellColor(color);
                  }}
                  className={`px-2 py-0.5 rounded capitalize text-[11px] font-bold transition-all ${
                    shellColor === color
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* LCD Screen Glow Theme */}
          <div className="flex items-center justify-between text-xs font-pixel">
            <span className="text-neutral-400">LCD SCREEN GLOW:</span>
            <div className="flex gap-1.5">
              {(['classic-green', 'amber-glow', 'ice-blue', 'matrix-green'] as LcdColorTheme[]).map(theme => (
                <button
                  key={theme}
                  onClick={() => {
                    sound.playButtonBlip();
                    setLcdTheme(theme);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    lcdTheme === theme
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {theme.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flat Control-Hint Line */}
      <div className="w-full max-w-4xl py-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-pixel tracking-wider text-neutral-400 z-10">
        <div>
          <span>A / D or ◄ ► Cycle Items</span>
          <span className="mx-2">·</span>
          <span>Space or B Select / Action</span>
          <span className="mx-2">·</span>
          <span>Esc Cancel / Pause</span>
        </div>
        <div className="text-neutral-500 mt-1 sm:mt-0">
          AUTO-SAVED IN BROWSER STORAGE
        </div>
      </div>
    </div>
  );
};
