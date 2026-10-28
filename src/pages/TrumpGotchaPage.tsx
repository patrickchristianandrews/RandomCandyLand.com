import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { getTrumpTroubleAlert } from '../utils/notifications';
import {
  loadPersonalVoicePack, importPersonalVoiceFiles, listPersonalClips,
  getPersonalClip, deletePersonalClip, setPersonalClipCategory,
  personalVoicesEnabled, setPersonalVoicesEnabled, PERSONAL_CLIP_CATEGORIES,
  type PersonalClipCategory, type PersonalClipMeta,
} from '../utils/personalVoicePack';
import { HandheldShell } from '../components/HandheldShell';
import { LcdScreen } from '../components/LcdScreen';
import { GolfMiniGame } from '../components/GolfMiniGame';
import { RallyMiniGame } from '../components/RallyMiniGame';
import { DealMiniGame } from '../components/DealMiniGame';
import { PauseModal } from '../components/PauseModal';
import { HeadlineModal } from '../components/HeadlineModal';
import { InstallModal } from '../components/InstallModal';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Crown,
  Palette,
  Smartphone,
  Trophy,
  Gamepad2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Share,
  PlusSquare,
  ChevronDown
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
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [personalClips, setPersonalClips] = useState<PersonalClipMeta[]>([]);
  const [personalEnabled, setPersonalEnabled] = useState<boolean>(() => personalVoicesEnabled());
  const [personalCategory, setPersonalCategory] = useState<PersonalClipCategory | 'auto'>('auto');
  const [personalStatus, setPersonalStatus] = useState('No files are uploaded to this website. Your personal recordings stay on this device.');
  const [personalBusy, setPersonalBusy] = useState(false);

  useEffect(() => {
    void loadPersonalVoicePack().then(setPersonalClips)
      .catch(() => setPersonalStatus('Local audio storage is unavailable. Try installing the site or using a regular browser tab.'));
  }, []);

  const onPersonalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    e.currentTarget.value = '';
    if (!files.length) return;
    setPersonalBusy(true);
    setPersonalStatus('Saving selected recordings privately on this device...');
    try {
      const outcome = await importPersonalVoiceFiles(files, personalCategory);
      setPersonalClips(listPersonalClips());
      setPersonalStatus(outcome.imported + ' recording(s) imported. ' +
        (outcome.skipped ? outcome.skipped + ' skipped. ' : '') +
        (outcome.errors.slice(0, 2).join(' ') || 'These now play as reactions during gameplay.'));
    } catch (error) {
      setPersonalStatus('Import failed: ' + (error instanceof Error ? error.message : 'Device storage unavailable.'));
    } finally { setPersonalBusy(false); }
  };


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

  const trouble = getTrumpTroubleAlert(stats);
  const [dismissedTrouble, setDismissedTrouble] = useState<string|null>(null);
  const lastTroubleSoundRef = useRef<string|null>(null);
  const visibleTrouble = trouble && trouble.key !== dismissedTrouble ? trouble : null;

  useEffect(() => {
    if (!trouble) { lastTroubleSoundRef.current=null; setDismissedTrouble(null); return; }
    if (screenMode !== 'PLAYING' || isMuted || document.visibilityState !== 'visible') return;
    if (lastTroubleSoundRef.current === trouble.key) return;
    lastTroubleSoundRef.current=trouble.key;
    sound.playRecordedSequence([trouble.clip]);
  }, [trouble?.key, isMuted, screenMode]);
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

  // Listen for native PWA installation event (Android/Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050209] text-white flex flex-col justify-between font-sans select-none overflow-x-hidden touch-manipulation">
      
      {/* Sleek Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0e071c]/95 backdrop-blur-md border-b border-amber-500/30 px-3 sm:px-6 py-2.5 flex items-center justify-between text-xs shrink-0 shadow-lg">
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
              TRUMPAGOTCHI
            </span>
            <span className="text-amber-400/50 hidden md:inline">&bull; 1997 DIGI-PET</span>
          </div>
        </div>

        {/* Controls: Add to Home Screen, Shell Color, Sound, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Add to Home Screen Button */}
          <button
            onClick={() => setInstallModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl gold-shimmer text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
            title="Add to Apple iPhone or Android Home Screen"
          >
            <Smartphone className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Add to Home Screen</span>
            <span className="sm:hidden">+ App</span>
          </button>

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

      {/* Optional Shell & LCD Theme Drawer */}
      {showColorPicker && (
        <div className="bg-[#120822] border-b border-amber-500/40 p-3 z-30 shrink-0 text-xs font-serif-luxury space-y-2 animate-in slide-in-from-top-2">
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
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 relative">
        
        {screenMode === 'PLAYING' && visibleTrouble && (
          <section aria-live="polite" aria-label="Donald needs care" className="relative z-30 w-full max-w-2xl mb-3 rounded-2xl border-2 border-orange-300 bg-[#3b1822]/95 px-4 py-3 text-white shadow-[0_0_26px_rgba(251,146,60,0.25)]">
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">{visibleTrouble.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-widest text-orange-200">🚨 DONALD IS NOT DOING SO GOOD</p>
                <p className="font-black text-lg text-amber-200 leading-tight">“{visibleTrouble.title}”</p>
                <p className="text-sm mt-1">{visibleTrouble.detail}</p>
                <p className="text-xs text-orange-100 mt-1 font-semibold">{visibleTrouble.action}</p>
                <button type="button" onClick={() => sound.playRecordedSequence([visibleTrouble.clip])} className="mt-2 rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-[#3b1822]">🔊 Hear Donald</button>
              </div>
              <button type="button" aria-label="Dismiss this warning" onClick={() => setDismissedTrouble(visibleTrouble.key)} className="shrink-0 p-2 rounded-lg border border-white/35 bg-white/10 text-lg">×</button>
            </div>
          </section>
        )}
        {/* Quick-start instructions visible without scrolling down to the long manual */}
        {screenMode === 'PLAYING' && (
          <section aria-label="Quick guide to Trumpagotchi" className="relative z-20 w-full max-w-2xl mb-3 rounded-2xl border border-sky-400/40 bg-[#102039]/95 p-3 sm:p-4 text-white">
            <details>
              <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-sm font-black text-sky-100">
                <span>❓ HOW TO PLAY · 30-second guide</span>
                <span className="rounded-lg bg-sky-500/20 border border-sky-300/30 px-2 py-1 text-[10px]">TAP TO OPEN ▾</span>
              </summary>
              <ol className="mt-3 grid gap-2 text-[12px] sm:text-sm leading-relaxed list-decimal pl-5 text-sky-50">
                <li><strong>Care for Donald.</strong> Use button A on the handheld to select a care icon, then button B to feed him 🍔, make him dance 🕺, groom his hair 💇, or help him rest 💤.</li>
                <li><strong>Those little white squares are classified documents! 📄</strong> Donald scatters papers on the green screen as he makes a mess. They are intentional game objects, not mystery rewards.</li>
                <li><strong>Clean up the papers. 🧹</strong> Select the 🧹 Clean icon with button A, then press B to remove all scattered classified documents and restore cleanliness. More mess means Donald needs attention.</li>
                <li><strong>Keep his ratings up. ⭐</strong> Food, happiness, neat hair, cleanliness, and health all help his approval rating. Caring for him also helps him evolve.</li>
                <li><strong>Try the mini-games and sounds.</strong> Use the handheld menu for golf, rally, and deals. Actions can play recorded voice clips when sound is on.</li>
                <li><strong>More actual recordings:</strong> <a href="https://www.101soundboards.com/boards/10035-donald-trump-soundboard" target="_blank" rel="noopener noreferrer" className="text-amber-200 underline underline-offset-2 hover:text-white">Browse Donald Trump voice clips ↗</a> on the original soundboard. This opens a separate tab and won't interrupt your game.</li>
              </ol>
              <details className="mt-4 rounded-xl border border-sky-300/40 bg-slate-900/80 p-3">
                <summary className="cursor-pointer text-sm font-black text-sky-100">
                  🎙️ Use your own voice recordings in the game ({personalClips.length} saved)
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-sky-100">
                  Select MP3, M4A, WAV, AAC or OGG audio files on your phone to play
                  during Donald's reactions. Files are saved privately in this browser
                  — not uploaded or shared with other players. Only import audio you
                  are permitted to use. You can find personal-use clips on the linked
                  soundboard, but their copyright stays with the owners.
                </p>
                <label className="mt-3 flex items-center gap-2 text-xs text-white">
                  <input type="checkbox" checked={personalEnabled} onChange={e => {
                    setPersonalEnabled(e.target.checked);
                    setPersonalVoicesEnabled(e.target.checked);
                    setPersonalStatus(e.target.checked ? 'Personal voice clips enabled.' : 'Personal voice clips disabled; original recordings will play.');
                  }} />
                  Use my imported clips as in-game reactions
                </label>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-1 text-xs text-sky-100">
                    Import as
                    <select aria-label="Category for imported voice clips" value={personalCategory}
                      onChange={e => setPersonalCategory(e.target.value as PersonalClipCategory | 'auto')}
                      className="rounded-lg bg-slate-800 border border-sky-300/40 p-2 text-white">
                      <option value="auto">Automatically match filename to reactions</option>
                      {PERSONAL_CLIP_CATEGORIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </label>
                  <label className="cursor-pointer rounded-lg bg-sky-300 px-3 py-2 font-black text-slate-900 text-xs">
                    {personalBusy ? 'Importing...' : '📁 Select audio files'}
                    <input type="file" multiple accept=".mp3,.m4a,.wav,.aac,.ogg,audio/mpeg,audio/mp4,audio/wav,audio/ogg"
                      disabled={personalBusy} className="sr-only" onChange={onPersonalFiles} />
                  </label>
                </div>
                <p role="status" className="mt-2 text-xs text-sky-200">{personalStatus}</p>
                {!!personalClips.length && <div className="mt-2 space-y-2 max-h-72 overflow-auto">
                  {personalClips.slice(0, 25).map(clip => (
                    <div key={clip.id} className="flex flex-wrap gap-2 items-center rounded-lg border border-white/15 p-2">
                      <span className="text-xs flex-1 min-w-[110px] break-words">{clip.title}</span>
                      <select aria-label={'Reaction category for ' + clip.title} value={clip.category}
                        className="bg-slate-800 text-white border border-sky-300/30 rounded p-1 text-xs"
                        onChange={async e => {
                          try {
                            await setPersonalClipCategory(clip.id, e.target.value as PersonalClipCategory);
                            setPersonalClips(listPersonalClips());
                          } catch { setPersonalStatus('Could not update reaction category.'); }
                        }}>
                        {PERSONAL_CLIP_CATEGORIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button type="button" className="rounded bg-white/15 px-2 py-1 text-xs"
                        onClick={() => { const item = getPersonalClip(clip.id); if (item) sound.playPersonalClip(item.url); }}>
                        ▶ Hear
                      </button>
                      <button type="button" className="rounded bg-red-800/50 px-2 py-1 text-xs"
                        onClick={async () => {
                          if (!window.confirm('Remove this recording from this device?')) return;
                          try {
                            await deletePersonalClip(clip.id);
                            setPersonalClips(listPersonalClips());
                            setPersonalStatus('Recording removed from this device.');
                          } catch { setPersonalStatus('Could not remove this recording.'); }
                        }}>Remove</button>
                    </div>
                  ))}
                  {personalClips.length > 25 && <p className="text-xs text-sky-200">
                    Showing 25 of {personalClips.length} clips. All imported clips remain available during gameplay.
                  </p>}
                </div>}
                <p className="mt-2 text-[11px] text-sky-300">
                  Personal clips can be removed with their Remove button. Browser data clearing
                  may erase them; they are not synced between devices. Original game audio is unchanged.
                </p>
              </details>
              <p className="mt-3 text-xs text-sky-200/80">Handheld buttons: A = move through icons · B = perform the selected action · C = pause/back. Tap Donald to hear a reaction.</p>
            </details>
          </section>
        )}

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
          <div className="w-full flex flex-col items-center justify-center py-4 transform scale-[0.95] sm:scale-100 transition-transform">
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
                feelingText={currentQuote.feeling}
                isSleeping={stats.isSleeping}
                onTapDonald={tapDonald}
              />
            </HandheldShell>
          </div>
        ) : screenMode === 'MINIGAME' ? (
          /* Active Mini-Game View */
          <div className="w-full flex flex-col items-center justify-center py-4">
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

        {/* ============================================================== */}
        {/* SECTION UNDERNEATH THE GAME: HOW IT WORKS, HOW TO WIN, PWA     */}
        {/* ============================================================== */}
        <div className="w-full max-w-4xl mt-8 mb-12 space-y-8 px-3">
          
          {/* Scroll Down Indicator */}
          <div className="flex items-center justify-center gap-2 text-amber-400/80 text-xs font-serif-luxury uppercase tracking-widest">
            <ChevronDown className="w-4 h-4 animate-bounce" />
            <span>GAME GUIDE &amp; HOW TO WIN BELOW</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>

          {/* 1. HOW THE DIGIPET WORKS (CONTROLS & 10 ROUTINES) */}
          <div className="bg-[#120822] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl">
                🕹️
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif-luxury font-black text-amber-300">
                  How Trumpagotchi Works
                </h3>
                <p className="text-xs text-amber-100/70 font-sans">
                  The classic 1997 3-button handheld virtual pet experience.
                </p>
              </div>
            </div>

            {/* The 3 Physical Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
              <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-500 text-amber-300 font-mono font-black flex items-center justify-center text-sm shadow">
                  A
                </div>
                <h4 className="font-serif-luxury font-black text-white text-sm">BUTTON A: CYCLE</h4>
                <p className="text-neutral-400 text-xs">
                  Cycle through the 10 presidential care icons around the LCD screen border.
                </p>
              </div>

              <div className="bg-black/50 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-b from-amber-500 to-amber-700 border border-amber-300 text-white font-mono font-black flex items-center justify-center text-sm shadow">
                  B
                </div>
                <h4 className="font-serif-luxury font-black text-amber-300 text-sm">BUTTON B: ACTION</h4>
                <p className="text-neutral-400 text-xs">
                  Execute the selected action &amp; hear Donald's <strong>authentic voice recording</strong>!
                </p>
              </div>

              <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1">
                <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-b from-amber-700 to-amber-900 border border-amber-500 text-amber-300 font-mono font-black flex items-center justify-center text-sm shadow">
                  C
                </div>
                <h4 className="font-serif-luxury font-black text-white text-sm">BUTTON C: DOSSIER</h4>
                <p className="text-neutral-400 text-xs">
                  Cancel current menu, pause the game, or open Donald's Presidential Dossier stats.
                </p>
              </div>
            </div>

            {/* The 10 Presidential Care Routines */}
            <div className="space-y-3 pt-2">
              <h4 className="font-serif-luxury font-black text-amber-400 text-xs uppercase tracking-wider">
                The 10 Daily Presidential Care Routines:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-sans">
                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">🥩</span>
                  <div className="font-bold text-white">1. FEED STEAK</div>
                  <p className="text-[11px] text-neutral-400">Prime Steak with ketchup fills hunger &amp; builds growth.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">🕺</span>
                  <div className="font-bold text-white">2. YMCA DANCE</div>
                  <p className="text-[11px] text-neutral-400">Double fist-pump dance restores 100% happiness.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">📺</span>
                  <div className="font-bold text-white">3. FAKE NEWS</div>
                  <p className="text-[11px] text-neutral-400">Yell at dishonest media for an adrenaline rally boost.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">🛌</span>
                  <div className="font-bold text-white">4. EXECUTIVE NAP</div>
                  <p className="text-[11px] text-neutral-400">Turn lights off to recharge energy back to 100%.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">⛳</span>
                  <div className="font-bold text-white">5. MINI-GAMES</div>
                  <p className="text-[11px] text-neutral-400">Bedminster Golf, Arena Mega Rally &amp; Art of the Deal.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">💊</span>
                  <div className="font-bold text-white">6. DR. JACKSON</div>
                  <p className="text-[11px] text-neutral-400">White House physician vitamin pack cures fatigue.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">📁</span>
                  <div className="font-bold text-white">7. CLEAN PAPERS</div>
                  <p className="text-[11px] text-neutral-400">Shred messy classified documents &amp; clean desk.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">📊</span>
                  <div className="font-bold text-white">8. CHECK POLLS</div>
                  <p className="text-[11px] text-neutral-400">Review approval ratings &amp; trigger victory chimes.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">🎤</span>
                  <div className="font-bold text-white">9. PRESS RALLY</div>
                  <p className="text-[11px] text-neutral-400">Inspire the press room with bilateral trade memos.</p>
                </div>

                <div className="bg-black/40 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-lg">👑</span>
                  <div className="font-bold text-white">10. GROOM HAIR</div>
                  <p className="text-[11px] text-neutral-400">Golden comb-over styling maintains peak majesty.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. HOW TO WIN THE GAME (THE 5 EVOLUTION STAGES) */}
          <div className="bg-[#120822] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif-luxury font-black text-amber-300">
                  How to Win Trumpagotchi
                </h3>
                <p className="text-xs text-amber-100/70 font-sans">
                  The ultimate objective: Evolve Donald through all 5 life stages to Commander-in-Chief!
                </p>
              </div>
            </div>

            {/* 5 Evolution Stages Roadmap */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-sans">
              
              <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1.5">
                <span className="text-3xl block">🍼</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">STAGE 1</span>
                <h5 className="font-serif-luxury font-bold text-white text-xs">BABY DONALD</h5>
                <p className="text-[11px] text-neutral-400">
                  Starting in Queens with a small million-dollar dream.
                </p>
              </div>

              <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1.5">
                <span className="text-3xl block">📋</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">STAGE 2</span>
                <h5 className="font-serif-luxury font-bold text-white text-xs">THE APPRENTICE</h5>
                <p className="text-[11px] text-neutral-400">
                  Boardroom boss, rating champion, "You're Fired!"
                </p>
              </div>

              <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1.5">
                <span className="text-3xl block">🏢</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">STAGE 3</span>
                <h5 className="font-serif-luxury font-bold text-white text-xs">TYCOON DONALD</h5>
                <p className="text-[11px] text-neutral-400">
                  Manhattan towers, Mar-a-Lago, casino billionaire empire.
                </p>
              </div>

              <div className="bg-black/40 border border-amber-400 rounded-2xl p-4 text-center space-y-1.5 shadow-md shadow-amber-500/20">
                <span className="text-3xl block">🏛️</span>
                <span className="text-[10px] font-mono font-bold text-yellow-300">STAGE 4 (GOAL)</span>
                <h5 className="font-serif-luxury font-black text-amber-300 text-xs">COMMANDER-IN-CHIEF</h5>
                <p className="text-[11px] text-neutral-300">
                  45th &amp; 47th President of the United States!
                </p>
              </div>

              <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1.5">
                <span className="text-3xl block">👑</span>
                <span className="text-[10px] font-mono font-bold text-amber-400">STAGE 5 (ULTIMATE)</span>
                <h5 className="font-serif-luxury font-bold text-white text-xs">GOLF LEGEND</h5>
                <p className="text-[11px] text-neutral-400">
                  Billionaire golf perfection. Totally untouchable.
                </p>
              </div>

            </div>

            {/* Winning Conditions Checklist */}
            <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 sm:p-5 font-sans space-y-2">
              <h4 className="font-serif-luxury font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>The 4 Official Winning Conditions:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>100% Growth Progress</strong> via regular steak feeding &amp; daily care.</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>90%+ Approval Rating</strong> by exposing fake news &amp; rally dancing.</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>$10B+ Net Worth</strong> achieved by closing deals in The Art of the Deal.</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Win All 3 Mini-Games</strong> (Bedminster Golf, Mega Rally, Art of the Deal).</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ADD TO HOME SCREEN GUIDE (APPLE iOS & ANDROID) */}
          <div className="bg-gradient-to-r from-[#17082e] via-[#100522] to-[#17082e] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0">
                  📱
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif-luxury font-black text-amber-300">
                    Add Trumpagotchi to Your Phone Home Screen
                  </h3>
                  <p className="text-xs text-amber-100/70 font-sans">
                    Launch your digipet in full screen with one tap — looks and plays like a native app!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInstallModalOpen(true)}
                className="px-6 py-3 rounded-2xl gold-shimmer text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-black" />
                <span>Open Install Instructions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
              
              {/* Apple iPhone Card */}
              <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif-luxury font-black text-white text-sm flex items-center gap-1.5">
                    <span>🍎 Apple iPhone / iPad</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Safari
                  </span>
                </div>

                <ol className="space-y-2 text-neutral-300 list-decimal list-inside text-[11px] leading-relaxed">
                  <li>Open <strong className="text-white">randomcandyland.com/trump</strong> in Safari.</li>
                  <li>Tap the <strong className="text-white">Share</strong> button <Share className="w-3 h-3 text-sky-400 inline mx-0.5" /> (square with up-arrow) at the bottom.</li>
                  <li>Scroll down and tap <strong className="text-amber-300">"Add to Home Screen"</strong> <PlusSquare className="w-3 h-3 text-amber-400 inline mx-0.5" />.</li>
                  <li>Tap <strong className="text-white">Add</strong> in the top-right corner. Done!</li>
                </ol>
              </div>

              {/* Android Card */}
              <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif-luxury font-black text-white text-sm flex items-center gap-1.5">
                    <span>🤖 Android Phones &amp; Tablets</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Chrome
                  </span>
                </div>

                <ol className="space-y-2 text-neutral-300 list-decimal list-inside text-[11px] leading-relaxed">
                  <li>Open <strong className="text-white">randomcandyland.com/trump</strong> in Google Chrome.</li>
                  <li>Tap the <strong className="text-white">3 dots [⋮]</strong> in the top-right corner.</li>
                  <li>Tap <strong className="text-amber-300">"Install app"</strong> or <strong className="text-amber-300">"Add to Home screen"</strong>.</li>
                  <li>Confirm <strong className="text-white">Install</strong>. The gold Trump icon appears on your home screen!</li>
                </ol>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Minimal Mobile Footer Ticker */}
      <footer className="w-full bg-[#0a0414] border-t border-amber-500/20 px-3 py-2 flex items-center justify-between text-[11px] font-mono text-amber-300/70 shrink-0">
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

      {/* Add to Home Screen Modal */}
      {installModalOpen && (
        <InstallModal
          onClose={() => setInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
        />
      )}

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
