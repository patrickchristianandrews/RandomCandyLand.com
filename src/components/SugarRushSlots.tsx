import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { Coins, Sparkles, Trophy, Crown, Flame } from 'lucide-react';

interface SlotSymbol {
  icon: string;
  name: string;
  value: number;
  label: string;
}

const FIVE_STAR_SYMBOLS: SlotSymbol[] = [
  { icon: '💎', name: 'Mar-a-Lago Diamond', value: 50, label: '5-STAR DIAMOND' },
  { icon: '🥩', name: 'Prime Porterhouse Steak', value: 75, label: 'PRIME STEAK' },
  { icon: '🏆', name: 'Bedminster Gold Cup', value: 120, label: 'GOLF TROPHY' },
  { icon: '🏢', name: 'Trump Tower Penthouse', value: 250, label: 'TRUMP TOWER' },
  { icon: '🍬', name: '24K Imperial Truffle', value: 400, label: '24K TRUFFLE' },
  { icon: '👑', name: 'Golden Comb-Over POTUS', value: 1500, label: 'SOVEREIGN JACKPOT' },
];

export function SugarRushSlots() {
  const [reels, setReels] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>([
    FIVE_STAR_SYMBOLS[0],
    FIVE_STAR_SYMBOLS[1],
    FIVE_STAR_SYMBOLS[2],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sugarCoins, setSugarCoins] = useState(() => {
    const saved = localStorage.getItem('candyland_coins');
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [bet, setBet] = useState(50);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [winTitle, setWinTitle] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('candyland_coins', sugarCoins.toString());
  }, [sugarCoins]);

  const spin = () => {
    if (isSpinning || sugarCoins < bet) return;

    setSugarCoins(prev => prev - bet);
    setIsSpinning(true);
    setLastWin(null);
    setWinTitle('');

    // Audio ticks during spin
    let ticks = 0;
    const tickInterval = setInterval(() => {
      candyAudio.playReelTick();
      setReels([
        FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)],
        FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)],
        FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)],
      ]);
      ticks++;
      if (ticks >= 14) {
        clearInterval(tickInterval);
      }
    }, 80);

    setTimeout(() => {
      clearInterval(tickInterval);

      const r1 = FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)];
      let r2 = FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)];
      let r3 = FIVE_STAR_SYMBOLS[Math.floor(Math.random() * FIVE_STAR_SYMBOLS.length)];

      // 30% chance for a pair
      if (Math.random() < 0.3) {
        r2 = r1;
      }
      // 10% chance for 3-of-a-kind jackpot
      if (Math.random() < 0.1) {
        r2 = r1;
        r3 = r1;
      }

      setReels([r1, r2, r3]);
      setIsSpinning(false);

      if (r1.name === r2.name && r2.name === r3.name) {
        // Triple Match!
        const winAmount = r1.value * (bet / 25);
        setLastWin(winAmount);
        setSugarCoins(prev => prev + winAmount);
        setStreak(prev => prev + 1);

        if (r1.name === 'Golden Comb-Over POTUS') {
          // ULTRA COMB-OVER JACKPOT!
          setWinTitle('👑 SUPREME 1,500X GOLDEN JACKPOT!');
          sound.playQuoteAudio('well_over_ten_billion_dollars.mp3');
          candyAudio.playJackpot();
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.5 },
            colors: ['#facc15', '#ffd700', '#ec4899', '#ffffff'],
          });
        } else if (r1.name === 'Trump Tower Penthouse') {
          setWinTitle('🏢 TRUMP TOWER 1,000X LUXURY PAYOUT!');
          sound.playQuoteAudio('tremendous_amounts_of_dollars.mp3');
          candyAudio.playJackpot();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#ffd700', '#f59e0b', '#38bdf8'],
          });
        } else {
          setWinTitle(`🏆 FIVE-STAR TRIPLE: ${r1.label}!`);
          sound.playQuoteAudio('im_really_rich.mp3');
          candyAudio.playWinChime();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ffffff'],
          });
        }
      } else if (r1.name === r2.name || r2.name === r3.name || r1.name === r3.name) {
        // Pair match
        const matched = r1.name === r2.name ? r1 : (r2.name === r3.name ? r2 : r1);
        const winAmount = Math.round(matched.value * 0.75 * (bet / 25));
        setLastWin(winAmount);
        setSugarCoins(prev => prev + winAmount);
        setStreak(prev => prev + 1);
        setWinTitle(`PAIRED 5-STAR ${matched.label}!`);
        candyAudio.playWinChime();
        if (Math.random() < 0.4) {
          sound.playQuoteAudio('were_going_to_do_a_fantastic_job.mp3');
        }
      } else {
        setStreak(0);
      }
    }, 1350);
  };

  const refillCoins = () => {
    setSugarCoins(prev => prev + 500);
    candyAudio.playWinChime();
    sound.playQuoteAudio('believe_it_or_not.mp3');
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
            <span>HIGH-ROLLER CASINO AT RANDOM CANDY LAND</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            The Sovereign 777 Trump Grand Slots
          </h3>
          <p className="text-xs text-amber-200/70">
            Five-Star authentic casino action &bull; Voice-celebrated jackpots &bull; Pays up to 1,500x
          </p>
        </div>

        {/* 5-Star Vault Counter */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-b from-[#1a102a] to-[#0d0716] border border-amber-400/50 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-inner">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="text-right">
              <span className="text-[10px] text-amber-300/80 font-serif-luxury tracking-wider block">BILLIONAIRE BANK</span>
              <span className="text-base font-extrabold text-amber-300 font-mono tracking-tight tabular-nums">
                ${sugarCoins.toLocaleString()}
              </span>
            </div>
          </div>
          {sugarCoins < bet && (
            <button
              onClick={refillCoins}
              className="px-3 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold font-serif-luxury shadow-md transition cursor-pointer active:scale-95"
            >
              +$500 VIP Credit
            </button>
          )}
        </div>
      </div>

      {/* Main Machine Body - Gilded Art Deco Casing */}
      <div className="bg-gradient-to-b from-[#1c1130] via-[#120a20] to-[#090510] border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl relative">
        {/* Machine Arch Title */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1 rounded-full bg-black/60 border border-amber-400/30 text-[11px] font-serif-luxury tracking-widest text-amber-300">
            ★ ★ ★ ★ ★ FIVE-STAR HIGH ROLLER EDITION ★ ★ ★ ★ ★
          </div>
        </div>

        {/* 3 Large Reels with Polished Gold Frames */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-black/90 p-4 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-[inset_0_4px_24px_rgba(0,0,0,0.9)]">
          {reels.map((sym, idx) => (
            <div
              key={idx}
              className={`h-36 sm:h-40 rounded-xl bg-gradient-to-b from-neutral-900 via-[#180e28] to-black border-2 border-amber-500/40 flex flex-col items-center justify-center transition-all transform shadow-lg ${
                isSpinning ? 'scale-95 blur-[0.5px]' : 'scale-100 hover:border-amber-300'
              }`}
            >
              <span className="text-5xl sm:text-6xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] select-none animate-in zoom-in duration-150">
                {sym.icon}
              </span>
              <span className="text-[11px] sm:text-xs font-serif-luxury font-bold text-amber-300 mt-2 text-center px-1 tracking-wider">
                {sym.label}
              </span>
            </div>
          ))}
        </div>

        {/* Win Status Display */}
        <div className="mt-4 min-h-[40px] flex items-center justify-between px-2">
          {lastWin !== null && lastWin > 0 ? (
            <div className="text-amber-300 text-sm font-serif-luxury font-bold flex items-center gap-2 animate-bounce">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{winTitle} (+${lastWin.toLocaleString()})</span>
            </div>
          ) : lastWin === 0 ? (
            <span className="text-xs text-purple-300/60 font-serif-luxury">
              Spin again &bull; Authentic billionaire jackpots await
            </span>
          ) : (
            <span className="text-xs text-amber-300/80 font-serif-luxury flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Triple Comb-Over pays 1,500x with authentic victory voice
            </span>
          )}

          {streak > 1 && (
            <span className="text-xs font-serif-luxury font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {streak}X HIGH-ROLLER STREAK
            </span>
          )}
        </div>

        {/* Controls Bar */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
          {/* Bet Tier Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif-luxury font-bold text-amber-300/80">WAGER:</span>
            {[25, 50, 100, 250].map(val => (
              <button
                key={val}
                onClick={() => setBet(val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  bet === val
                    ? 'gold-shimmer text-black font-extrabold shadow-md'
                    : 'bg-black/60 text-amber-200/80 hover:bg-white/10 border border-amber-500/30'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          {/* Golden Spin Lever */}
          <button
            onClick={spin}
            disabled={isSpinning || sugarCoins < bet}
            className="px-8 py-3 rounded-2xl gold-shimmer hover:brightness-110 disabled:opacity-40 text-black font-serif-luxury font-black text-sm tracking-wider uppercase transition shadow-[0_10px_25px_rgba(212,175,55,0.35)] cursor-pointer active:scale-95 flex items-center gap-2.5"
          >
            <Crown className="w-4 h-4 text-black" />
            <span>{isSpinning ? 'SPINNING REELS...' : 'PULL 24K LEVER & SPIN'}</span>
          </button>
        </div>
      </div>

      {/* Paytable Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-serif-luxury text-amber-300/70 text-center">
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">👑 3x POTUS = 1500x</div>
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">🍬 3x Truffle = 400x</div>
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">🏢 3x Tower = 250x</div>
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">🏆 3x Trophy = 120x</div>
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">🥩 3x Steak = 75x</div>
        <div className="p-1.5 bg-black/40 rounded-lg border border-amber-500/20">💎 3x Diamond = 50x</div>
      </div>
    </div>
  );
}
