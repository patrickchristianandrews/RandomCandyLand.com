import React, { useState, useCallback } from 'react';
import { 
  ShellColor, 
  LcdColorTheme, 
  MenuCategory, 
  ActiveMiniGame, 
  GameScreenMode, 
  FOOD_MENU, 
  EvolutionStage 
} from '../types/game';
import { usePetGame } from '../hooks/usePetGame';
import { LcdScreen } from '../components/LcdScreen';
import { HandheldShell } from '../components/HandheldShell';
import { TitleScreen } from '../components/TitleScreen';
import { GolfMiniGame } from '../components/GolfMiniGame';
import { RallyMiniGame } from '../components/RallyMiniGame';
import { DealMiniGame } from '../components/DealMiniGame';
import { PauseModal } from '../components/PauseModal';
import { HeadlineModal } from '../components/HeadlineModal';
import { sound } from '../utils/audio';
import { ArrowLeft, Home, Download, Volume2, VolumeX, Sparkles, ExternalLink } from 'lucide-react';

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

interface TrumpagotchiSubpageProps {
  onReturnToCandyLand?: () => void;
}

export function TrumpagotchiSubpage({ onReturnToCandyLand }: TrumpagotchiSubpageProps = {}) {
  const [screenMode, setScreenMode] = useState<GameScreenMode>('PLAYING');
  const [shellColor, setShellColor] = useState<ShellColor>('gold');
  const [lcdTheme, setLcdTheme] = useState<LcdColorTheme>('classic-green');
  const [menuIdx, setMenuIdx] = useState<number>(0);
  const [activeMiniGame, setActiveMiniGame] = useState<ActiveMiniGame>('none');
  const [foodMenuOpen, setFoodMenuOpen] = useState<boolean>(false);
  const [gamesMenuOpen, setGamesMenuOpen] = useState<boolean>(false);
  const [headlineOpen, setHeadlineOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getIsMuted());

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

  // Button A: Cycle Menu to the next item
  const handleButtonA = useCallback(() => {
    sound.playButtonBlip();
    setMenuIdx((prev) => (prev + 1) % MENU_ORDER.length);
  }, []);

  // Button B: Execute / Action on current menu
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

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-between font-sans select-none overflow-x-hidden">
      
      {/* 24K PRESIDENTIAL TRUMPAGOTCHI TOP BAR */}
      <div className="w-full bg-[#0c0617] border-b-2 border-amber-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs z-30 shadow-[0_4px_20px_rgba(212,175,55,0.15)] relative">
        <div className="absolute top-0 inset-x-0 h-1 gold-shimmer" />

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base">⚜️</span>
          <span className="font-serif-luxury font-black text-white text-sm sm:text-base tracking-wide gold-text-shimmer">
            TRUMPAGOTCHI
          </span>
          <span className="text-amber-400/40">&bull;</span>
          <span className="text-xs font-serif-luxury text-amber-300 font-bold hidden sm:inline">
            randomcandyland.com
          </span>
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full hidden md:inline">
            38 AUTHENTIC VOICE CLIPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {screenMode === 'PLAYING' && (
            <button
              onClick={() => setScreenMode('TITLE')}
              className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 font-serif-luxury font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              title="Customize Shell Color & LCD Theme"
            >
              <span>🎨 Shell</span>
            </button>
          )}

          <a
            href="/randomcandyland-complete.zip"
            download="randomcandyland-complete.zip"
            className="px-3 py-1.5 rounded-xl gold-shimmer text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Download full project codebase & 38 authentic Trump voice files (ZIP)"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Download ZIP</span>
          </a>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-xl bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/40 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 1. TITLE SCREEN */}
      {screenMode === 'TITLE' && (
        <TitleScreen
          onStartGame={() => setScreenMode('PLAYING')}
          shellColor={shellColor}
          setShellColor={setShellColor}
          lcdTheme={lcdTheme}
          setLcdTheme={setLcdTheme}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onReturnToCandyLand={onReturnToCandyLand}
        />
      )}

      {/* 2. ACTIVE PLAY VIEWPORT */}
      {screenMode !== 'TITLE' && (
        <div className="w-full flex-1 flex flex-col items-center justify-between p-3 sm:p-5 relative">
          {/* Top Utilities Bar & Stage Switcher */}
          <div className="w-full max-w-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-pixel text-neutral-400">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setScreenMode('TITLE')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  ◀ TITLE SCREEN
                </button>
                <span>·</span>
                <span className="text-amber-300 font-bold uppercase">
                  {stats.evolutionStage === 'baby' ? '🍼 BABY DONALD' :
                   stats.evolutionStage === 'apprentice' ? '📋 THE APPRENTICE' :
                   stats.evolutionStage === 'tycoon' ? '🏢 TYCOON DONALD' :
                   stats.evolutionStage === 'potus' ? '🏛️ COMMANDER-IN-CHIEF' :
                   '👑 GOLDEN LEGEND TRUMP'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="tabular-nums">
                  POLL: <strong className="text-amber-400">{stats.ratings}%</strong>
                </span>
                <button
                  onClick={() => setScreenMode('PAUSED')}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                >
                  [ESC] DOSSIER
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Mute"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>
            </div>

            {/* EVOLUTION TIMELINE / GROWTH STRIP */}
            <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-pixel">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">GROWTH TO PRESIDENT:</span>
                <span className="text-neutral-300 font-semibold">{stats.growthProgress}%</span>
              </div>

              {/* Fast Evolution Stage Switchers */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-400 mr-1 hidden sm:inline">GROW STAGE:</span>
                {(['baby', 'apprentice', 'tycoon', 'potus', 'legend'] as EvolutionStage[]).map((stage) => {
                  const isActive = stats.evolutionStage === stage;
                  const label = 
                    stage === 'baby' ? '🍼 BABY' :
                    stage === 'apprentice' ? '📋 APPRENTICE' :
                    stage === 'tycoon' ? '🏢 TYCOON' :
                    stage === 'potus' ? '🏛️ PRESIDENT' : '👑 LEGEND';
                  
                  return (
                    <button
                      key={stage}
                      onClick={() => manuallySetStage(stage)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-neutral-950 shadow-sm scale-105'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN HANDHELD KEYCHAIN HARDWARE CENTERPIECE */}
          <div className="my-auto py-2 flex flex-col items-center">
            {screenMode === 'PLAYING' || screenMode === 'PAUSED' ? (
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
                  quoteText={currentQuote?.text || "WE ARE WINNING BIGLY!"}
                  isSleeping={stats.isSleeping}
                  onTapDonald={tapDonald}
                />
              </HandheldShell>
            ) : screenMode === 'MINIGAME' && activeMiniGame === 'golf' ? (
              <GolfMiniGame
                onComplete={(trophyWon) => {
                  recordMiniGameWin('golf', trophyWon ? 1 : 0);
                  setTimeout(() => setScreenMode('PLAYING'), 1800);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            ) : screenMode === 'MINIGAME' && activeMiniGame === 'rally' ? (
              <RallyMiniGame
                onComplete={(_success, ratingBonus) => {
                  recordMiniGameWin('rally', ratingBonus);
                  setTimeout(() => setScreenMode('PLAYING'), 1800);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            ) : screenMode === 'MINIGAME' && activeMiniGame === 'deal' ? (
              <DealMiniGame
                onComplete={(reward) => {
                  recordMiniGameWin('deal', reward);
                  setTimeout(() => setScreenMode('PLAYING'), 1800);
                }}
                onExit={() => setScreenMode('PLAYING')}
              />
            ) : null}

            {/* QUICK ACTIONS BAR: DANCE, TV FAKE NEWS, MEALS, MINI-GAMES, HEADLINE, TALK */}
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 sm:gap-2">
              <button
                onClick={dance}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-bold text-xs font-pixel transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md border border-yellow-300"
              >
                <span className="text-sm animate-bounce">🕺</span>
                <span>TRUMP DANCE!</span>
              </button>

              <button
                onClick={yellAtTv}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs font-pixel transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md border border-red-400"
              >
                <span className="text-sm">📺</span>
                <span>YELL AT FAKE NEWS!</span>
              </button>

              <button
                onClick={() => setFoodMenuOpen(prev => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-amber-500/50 hover:bg-neutral-800 text-xs font-pixel text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>🍔</span>
                <span>MEAL</span>
              </button>

              <button
                onClick={() => setGamesMenuOpen(prev => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-amber-500/50 hover:bg-neutral-800 text-xs font-pixel text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>⛳</span>
                <span>GAMES</span>
              </button>

              <button
                onClick={() => setHeadlineOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-950 to-neutral-900 border border-red-500/70 hover:from-red-900 text-xs font-pixel text-red-300 font-bold transition-colors flex items-center gap-1 cursor-pointer shadow"
              >
                <span>📰</span>
                <span>HEADLINE</span>
              </button>

              <button
                onClick={tapDonald}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-pixel text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>💬</span>
                <span>TALK</span>
              </button>
            </div>

            {/* FOOD QUICK SELECTION DRAWER */}
            {foodMenuOpen && screenMode === 'PLAYING' && (
              <div className="mt-2.5 w-[330px] sm:w-[360px] bg-neutral-900 border-2 border-amber-500/80 rounded-2xl p-3 shadow-xl z-20">
                <div className="flex items-center justify-between text-xs font-pixel mb-2">
                  <span className="font-bold text-amber-400">FEED DONALD (CLICK TO EAT):</span>
                  <button 
                    onClick={() => setFoodMenuOpen(false)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_MENU.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        feed(item);
                        setFoodMenuOpen(false);
                      }}
                      className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-2 text-left transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="overflow-hidden">
                        <div className="font-pixel text-xs font-bold text-neutral-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-pixel">
                          +{item.hungerBoost}% Hunger · +{item.happinessBoost}% Joy
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GAMES SELECTION DRAWER */}
            {gamesMenuOpen && screenMode === 'PLAYING' && (
              <div className="mt-2.5 w-[330px] sm:w-[360px] bg-neutral-900 border-2 border-amber-500/80 rounded-2xl p-3 shadow-xl z-20">
                <div className="flex items-center justify-between text-xs font-pixel mb-2">
                  <span className="font-bold text-amber-400">CHOOSE RETRO MINI-GAME:</span>
                  <button 
                    onClick={() => setGamesMenuOpen(false)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleLaunchMiniGame('golf')}
                    className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">⛳</span>
                      <div>
                        <div className="font-pixel text-xs font-bold text-amber-300">
                          BEDMINSTER GOLDEN GOLF
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Hole-in-one skill swing challenge
                        </div>
                      </div>
                    </div>
                    <span className="font-pixel text-xs text-amber-400 font-bold">PLAY ▶</span>
                  </button>

                  <button
                    onClick={() => handleLaunchMiniGame('rally')}
                    className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎤</span>
                      <div>
                        <div className="font-pixel text-xs font-bold text-red-400">
                          ARENA RALLY HYPE
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Rhythm crowd chanting & cheers
                        </div>
                      </div>
                    </div>
                    <span className="font-pixel text-xs text-red-400 font-bold">PLAY ▶</span>
                  </button>

                  <button
                    onClick={() => handleLaunchMiniGame('deal')}
                    className="p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🏙️</span>
                      <div>
                        <div className="font-pixel text-xs font-bold text-emerald-400">
                          THE ART OF THE DEAL
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          High-stakes skyscraper negotiation
                        </div>
                      </div>
                    </div>
                    <span className="font-pixel text-xs text-emerald-400 font-bold">PLAY ▶</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS & INSTRUCTIONS BAR */}
          <div className="w-full max-w-2xl py-1 flex items-center justify-between text-[11px] font-pixel text-neutral-400 border-t border-neutral-900 mt-2">
            <div className="flex items-center gap-3">
              <span>CONTROLS: [A] MENU · [B] SELECT/ACTION · [C] CANCEL/DOSSIER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">SPEED:</span>
              <button
                onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 3 : 1)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  speedMultiplier > 1 
                    ? 'bg-amber-400 text-neutral-950 font-bold' 
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {speedMultiplier}x
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOSSIER / PAUSE MODAL */}
      {screenMode === 'PAUSED' && (
        <PauseModal
          stats={stats}
          onResume={() => setScreenMode('PLAYING')}
          onResetPet={() => {
            resetPet();
            setScreenMode('TITLE');
          }}
          speedMultiplier={speedMultiplier}
          setSpeedMultiplier={setSpeedMultiplier}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onSetStage={manuallySetStage}
          onReturnHome={onReturnToCandyLand}
        />
      )}

      {/* 4. DAILY HEADLINE NEWSPAPER MODAL */}
      {headlineOpen && (
        <HeadlineModal
          stats={stats}
          onClose={() => setHeadlineOpen(false)}
        />
      )}

      {/* 5. EVOLUTION NOTIFICATION CELEBRATION */}
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
              {hasEvolvedNotice === 'potus' 
                ? '"I WENT FROM A SMALL LOAN TO COMMANDER-IN-CHIEF! BIGGEST VICTORY EVER!"'
                : '"UNBELIEVABLE PROGRESS! THE GREATEST EVOLUTION IN DIGIPET HISTORY!"'}
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
