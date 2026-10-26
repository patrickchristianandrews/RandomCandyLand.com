import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShellColor, 
  LcdColorTheme, 
  GameScreenMode, 
  ActiveMiniGame, 
  MenuCategory,
  FOOD_MENU,
  EvolutionStage
} from '../types/game';
import { usePetGame } from '../hooks/usePetGame';
import { sound } from '../utils/audio';
import { HandheldShell } from '../components/HandheldShell';
import { LcdScreen } from '../components/LcdScreen';
import { GolfMiniGame } from '../components/GolfMiniGame';
import { RallyMiniGame } from '../components/RallyMiniGame';
import { DealMiniGame } from '../components/DealMiniGame';
import { PauseModal } from '../components/PauseModal';
import { HeadlineModal } from '../components/HeadlineModal';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Crown,
  Palette
} from 'lucide-react';

interface TrumpGotchaPageProps {
  onReturnHome: () => void;
}

const MENU_ORDER: MenuCategory[] = [
  'feed',
  'dance',
  'tv',
  'lights',
  'games',
  'medicine',
  'clean',
  'ratings',
  'pep',
  'groom'
];

export function TrumpGotchaPage({ onReturnHome }: TrumpGotchaPageProps) {
  const [screenMode, setScreenMode] = useState<GameScreenMode>('PLAYING');
  const [shellColor, setShellColor] = useState<ShellColor>('gold');
  const [lcdTheme, setLcdTheme] = useState<LcdColorTheme>('classic-green');
  const [menuIdx, setMenuIdx] = useState<number>(0);
  const [activeMiniGame, setActiveMiniGame] = useState<ActiveMiniGame>('none');
  const [foodMenuOpen, setFoodMenuOpen] = useState<boolean>(false);
  const [gamesMenuOpen, setGamesMenuOpen] = useState<boolean>(false);
  const [headlineOpen, setHeadlineOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getIsMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const {
    stats,
    activeAnimation,
    currentQuote,
    speedMultiplier,
    hasEvolvedNotice,
    setSpeedMultiplier,
    setHasEvolvedNotice,
    feed,
    toggleSleep,
    groomHair,
    cleanMess,
    giveMedicine,
    pepTalk,
    dance,
    yellAtTv,
    tapDonald,
    manuallySetStage,
    recordMiniGameWin,
    resetPet,
    triggerAnim,
  } = usePetGame();

  const currentMenu = MENU_ORDER[menuIdx];

  // Button A: Cycle Menu to next item
  const handleButtonA = useCallback(() => {
    sound.playButtonBlip();
    setMenuIdx((prev) => (prev + 1) % MENU_ORDER.length);
  }, []);

  // Button B: Action on current menu
  const handleButtonB = useCallback(() => {
    if (stats.isSleeping && currentMenu !== 'lights') {
      sound.playCancel();
      tapDonald();
      return;
    }

    switch (currentMenu) {
      case 'feed':
        feed(FOOD_MENU[0]);
        setFoodMenuOpen(false);
        break;

      case 'dance':
        dance();
        break;

      case 'tv':
        yellAtTv();
        break;

      case 'lights':
        toggleSleep();
        break;

      case 'games':
        if (gamesMenuOpen) {
          handleLaunchMiniGame('golf');
        } else {
          setGamesMenuOpen(true);
          sound.playSelectChime();
        }
        break;

      case 'medicine':
        giveMedicine();
        break;

      case 'clean':
        cleanMess();
        break;

      case 'ratings':
        sound.playRatingsChime();
        triggerAnim('victory');
        break;

      case 'pep':
        pepTalk();
        break;

      case 'groom':
        groomHair();
        break;

      default:
        sound.playButtonBlip();
    }
  }, [currentMenu, stats.isSleeping, feed, dance, yellAtTv, toggleSleep, giveMedicine, cleanMess, pepTalk, groomHair, gamesMenuOpen, tapDonald, triggerAnim]);

  // Button C: Cancel / Pause / Back
  const handleButtonC = useCallback(() => {
    sound.playCancel();
    if (foodMenuOpen) {
      setFoodMenuOpen(false);
      return;
    }
    if (gamesMenuOpen) {
      setGamesMenuOpen(false);
      return;
    }
    if (screenMode === 'PLAYING') {
      setScreenMode('PAUSED');
    } else if (screenMode === 'PAUSED') {
      setScreenMode('PLAYING');
    }
  }, [foodMenuOpen, gamesMenuOpen, screenMode]);

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleLaunchMiniGame = (game: ActiveMiniGame) => {
    sound.playSelectChime();
    setGamesMenuOpen(false);
    setActiveMiniGame(game);
    setScreenMode('MINIGAME');
  };

  // Fullscreen toggle for mobile browsers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-full bg-[#050209] text-white flex flex-col justify-between font-sans select-none overflow-hidden touch-manipulation">
      
      {/* Sleek Top Navigation Bar */}
      <header className="w-full bg-[#0e071c]/90 border-b border-amber-500/30 px-3 sm:px-6 py-2 flex items-center justify-between text-xs z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onReturnHome}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-serif-luxury font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Return to Random Candy Land"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Random Candy Land</span>
            <span className="sm:hidden">Home</span>
          </button>

          <div className="flex items-center gap-1.5 text-amber-400 font-serif-luxury font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-white text-xs sm:text-sm font-black tracking-wider gold-text-shimmer">
              TRUMP GOTCHA
            </span>
            <span className="text-amber-400/50 hidden md:inline">&bull; 1997 DIGI-PET</span>
          </div>
        </div>

        {/* Controls: Shell Color, Sound, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Shell customizer toggle */}
          <button
            onClick={() => setShowColorPicker(prev => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 text-xs font-serif-luxury font-bold transition flex items-center gap-1 cursor-pointer"
            title="Customize Shell Color & LCD Theme"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Shell</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Fullscreen Mobile Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-300" /> : <Maximize2 className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </header>

      {/* Optional Quick Shell & LCD Theme Picker Drawer */}
      {showColorPicker && (
        <div className="bg-[#120822] border-b border-amber-500/40 p-3 z-40 shrink-0 text-xs font-serif-luxury space-y-2 animate-in slide-in-from-top-2">
          <div className="max-w-md mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold">SHELL COLOR:</span>
              <div className="flex gap-1.5">
                {(['gold', 'red', 'navy', 'black', 'palm'] as ShellColor[]).map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setShellColor(color);
                      sound.playButtonBlip();
                    }}
                    className={`px-2.5 py-1 rounded-lg capitalize border text-[11px] font-bold cursor-pointer ${
                      shellColor === color
                        ? 'gold-shimmer text-black border-amber-300 font-black'
                        : 'bg-black/60 text-amber-200 border-amber-500/30'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold">LCD SCREEN:</span>
              <div className="flex gap-1.5">
                {(['classic-green', 'amber-glow', 'ice-blue', 'matrix-green'] as LcdColorTheme[]).map(theme => (
                  <button
                    key={theme}
                    onClick={() => {
                      setLcdTheme(theme);
                      sound.playButtonBlip();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                      lcdTheme === theme
                        ? 'bg-amber-400 text-black border-white'
                        : 'bg-black/50 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    {theme.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT: THE POCKET DIGI-PET CENTERPIECE */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        
        {/* Subtle radial ambient background glow */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffd700 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Handheld Digi-Pet Shell */}
        {screenMode === 'PLAYING' || screenMode === 'PAUSED' ? (
          <div className="w-full flex flex-col items-center justify-center my-auto transform scale-[0.92] sm:scale-100 transition-transform">
            <HandheldShell
              shellColor={shellColor}
              lcdTheme={lcdTheme}
              onButtonA={handleButtonA}
              onButtonB={handleButtonB}
              onButtonC={handleButtonC}
              isSleeping={stats.isSleeping}
              selectedMenu={currentMenu}
            >
              <LcdScreen
                stats={stats}
                animation={activeAnimation}
                currentMenu={currentMenu}
                theme={lcdTheme}
                quoteText={currentQuote.text}
                isSleeping={stats.isSleeping}
                onTapDonald={tapDonald}
              />
            </HandheldShell>
          </div>
        ) : screenMode === 'MINIGAME' ? (
          /* Active Mini-Game View */
          <div className="w-full flex flex-col items-center justify-center my-auto p-2">
            {activeMiniGame === 'golf' && (
              <GolfMiniGame
                onComplete={(trophyEarned, score) => {
                  recordMiniGameWin('golf', score);
                  setTimeout(() => setScreenMode('PLAYING'), 1400);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            )}
            {activeMiniGame === 'rally' && (
              <RallyMiniGame
                onComplete={(success, ratingsBoost) => {
                  recordMiniGameWin('rally', ratingsBoost);
                  setTimeout(() => setScreenMode('PLAYING'), 1400);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            )}
            {activeMiniGame === 'deal' && (
              <DealMiniGame
                onComplete={(netWorthBoost) => {
                  recordMiniGameWin('deal', netWorthBoost);
                  setTimeout(() => setScreenMode('PLAYING'), 1400);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            )}
          </div>
        ) : null}

      </main>

      {/* Minimal Mobile Footer Ticker */}
      <footer className="w-full bg-[#0a0414] border-t border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-amber-300/70 shrink-0">
        <div className="flex items-center gap-2">
          <span>NET WORTH: <strong className="text-emerald-400">${stats.netWorthBillion.toFixed(1)}B</strong></span>
          <span>&bull;</span>
          <span>POLL: <strong className="text-amber-400">{stats.ratings}%</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => manuallySetStage(stats.evolutionStage === 'potus' ? 'legend' : 'potus')}
            className="hover:text-amber-300 transition text-[10px] cursor-pointer"
          >
            STAGE: <span className="uppercase text-white font-bold">{stats.evolutionStage}</span>
          </button>
          <span>&bull;</span>
          <button
            onClick={() => setScreenMode('PAUSED')}
            className="text-[10px] text-amber-400 hover:text-white cursor-pointer"
          >
            DOSSIER
          </button>
        </div>
      </footer>

      {/* Pause & Stats Modal */}
      {screenMode === 'PAUSED' && (
        <PauseModal
          stats={stats}
          onResume={() => setScreenMode('PLAYING')}
          onResetPet={resetPet}
          speedMultiplier={speedMultiplier}
          setSpeedMultiplier={setSpeedMultiplier}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onSetStage={manuallySetStage}
          onReturnHome={onReturnHome}
        />
      )}

      {/* Daily Headline Modal */}
      {headlineOpen && (
        <HeadlineModal
          stats={stats}
          onClose={() => setHeadlineOpen(false)}
        />
      )}

      {/* Evolution Notice Notification */}
      {hasEvolvedNotice && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-neutral-900 border-2 border-amber-400 rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95">
            <span className="text-5xl block mb-2 animate-bounce">👑</span>
            <span className="font-pixel text-2xl font-bold text-amber-300 tracking-wider">
              DONALD EVOLVED!
            </span>
            <div className="my-2 font-pixel text-lg text-white font-bold uppercase">
              NEW STAGE: {
                hasEvolvedNotice === 'baby' ? 'BABY DONALD' :
                hasEvolvedNotice === 'apprentice' ? 'THE APPRENTICE' :
                hasEvolvedNotice === 'tycoon' ? 'REAL ESTATE TYCOON' :
                hasEvolvedNotice === 'potus' ? '45TH & 47TH PRESIDENT!' : 'GOLDEN GOLF LEGEND'
              }
            </div>
            <p className="text-xs text-neutral-300 font-pixel mb-4">
              "UNBELIEVABLE PROGRESS! THE GREATEST EVOLUTION IN DIGIPET HISTORY!"
            </p>
            <button
              onClick={() => setHasEvolvedNotice(null)}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-pixel font-bold text-sm rounded-xl cursor-pointer"
            >
              TREMENDOUS! CONTINUE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
