import { useState, useEffect, useCallback, useRef } from 'react';
import { PetStats, FoodItem, EvolutionStage, TRUMP_QUOTES, TrumpQuote, FOOD_MENU } from '../types/game';
import { sound } from '../utils/audio';
import { notificationEngine } from '../utils/notifications';

const STORAGE_KEY = 'trumpagotchi_save_v2';

const INITIAL_STATS: PetStats = {
  hunger: 80,
  happiness: 85,
  energy: 90,
  cleanliness: 95,
  hairStyle: 100,
  health: 95,
  ratings: 72,

  ageMinutes: 0,
  evolutionStage: 'potus',
  growthProgress: 80,
  netWorthBillion: 10.0,
  ralliesHeld: 0,
  golfTrophies: 0,
  burgersEaten: 0,
  dealsStruck: 0,
  dancesDone: 0,
  tvYellsCount: 0,

  isSleeping: false,
  isSick: false,
  messCount: 0,
  attentionNeeded: false,
  lastFedTimestamp: Date.now(),
  lastActionTimestamp: Date.now(),
};

export type CurrentAnimation = 
  | 'idle' 
  | 'talk' 
  | 'eat' 
  | 'golf' 
  | 'rally' 
  | 'sleep' 
  | 'groom' 
  | 'angry' 
  | 'dance'
  | 'tv_fake_news'
  | 'victory';

const EVOLUTION_ORDER: EvolutionStage[] = ['baby', 'apprentice', 'tycoon', 'potus', 'legend'];

export function usePetGame() {
  const [stats, setStats] = useState<PetStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATS, ...parsed };
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATS;
  });

  const [activeAnimation, setActiveAnimation] = useState<CurrentAnimation>('idle');
  const [currentQuote, setCurrentQuote] = useState<TrumpQuote>(TRUMP_QUOTES[0]);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hasEvolvedNotice, setHasEvolvedNotice] = useState<EvolutionStage | null>(null);

  const animTimerRef = useRef<number | null>(null);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const recentQuotesRef = useRef<string[]>([]);

  // Persist state
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* Safari private storage */ }
  }, [stats]);

  // Set temporary animation that returns to idle/sleep
  const triggerAnim = useCallback((anim: CurrentAnimation, durationMs = 2800) => {
    if (animTimerRef.current) {
      window.clearTimeout(animTimerRef.current);
    }
    setActiveAnimation(anim);
    animTimerRef.current = window.setTimeout(() => {
      setActiveAnimation(statsRef.current.isSleeping ? 'sleep' : 'idle');
    }, durationMs);
  }, []);

  // Pick a fresh random quote matching mood or stage (NEVER repeats recent quotes)
  const triggerQuote = useCallback((preferredMood?: TrumpQuote['mood']) => {
    let pool = TRUMP_QUOTES;
    const isBaby = statsRef.current.evolutionStage === 'baby';

    if (preferredMood) {
      const filtered = TRUMP_QUOTES.filter(q => q.mood === preferredMood);
      if (filtered.length > 0) {
        pool = filtered;
      }
    } else if (isBaby) {
      const babyPool = TRUMP_QUOTES.filter(q => q.mood === 'baby' || q.mood === 'hungry' || q.mood === 'happy');
      if (babyPool.length > 0) {
        pool = babyPool;
      }
    }

    if (!pool || pool.length === 0) {
      pool = TRUMP_QUOTES;
    }

    // Filter out recently heard phrases so all phrases are fresh and different
    const unplayedPool = pool.filter(q => !recentQuotesRef.current.includes(q.text));
    const activeCandidates = unplayedPool.length > 0 ? unplayedPool : pool;

    const chosen = (activeCandidates.length > 0
      ? activeCandidates[Math.floor(Math.random() * activeCandidates.length)]
      : TRUMP_QUOTES[0]) || TRUMP_QUOTES[0];

    if (!chosen || !chosen.text) return;

    // Update quote history queue (keep last 15)
    recentQuotesRef.current.push(chosen.text);
    if (recentQuotesRef.current.length > 15) {
      recentQuotesRef.current.shift();
    }

    setCurrentQuote(chosen);
    // Authentic Trump Voice Playback
    sound.speakTrump(chosen.text, isBaby, chosen.audioClip);
  }, []);

  // Evolution advancement helper
  const addGrowth = useCallback((growthDelta: number) => {
    setStats(prev => {
      if (prev.evolutionStage === 'legend') {
        return { ...prev, growthProgress: 100 };
      }

      const nextGrowth = prev.growthProgress + growthDelta;
      if (nextGrowth >= 100) {
        // EVOLVE!
        const currentIdx = EVOLUTION_ORDER.indexOf(prev.evolutionStage);
        const nextStage = EVOLUTION_ORDER[Math.min(EVOLUTION_ORDER.length - 1, currentIdx + 1)];
        
        sound.playVictoryFanfare();
        setHasEvolvedNotice(nextStage);
        triggerAnim('victory', 3500);

        return {
          ...prev,
          evolutionStage: nextStage,
          growthProgress: 0,
          ratings: Math.min(100, prev.ratings + 15),
          netWorthBillion: Number((prev.netWorthBillion + (nextStage === 'potus' ? 5.0 : 2.0)).toFixed(1)),
        };
      }

      return {
        ...prev,
        growthProgress: nextGrowth,
      };
    });
  }, [triggerAnim]);

  // Manual stage switcher for immediate testing and enjoyment
  const manuallySetStage = useCallback((stage: EvolutionStage) => {
    sound.playVictoryFanfare();
    setStats(prev => ({
      ...prev,
      evolutionStage: stage,
      growthProgress: stage === 'legend' ? 100 : 20,
    }));
    triggerAnim('victory', 3000);
    if (stage === 'baby') {
      triggerQuote('baby');
    } else {
      triggerQuote('happy');
    }
  }, [triggerAnim, triggerQuote]);

  // Main simulation tick
  useEffect(() => {
    const interval = window.setInterval(() => {
      // Keep inactive iPhone tabs from draining battery and re-rendering the game.
      if (document.visibilityState === 'hidden') return;
      setStats(prev => {
        const dt = (1 / 60) * speedMultiplier;
        const newAge = prev.ageMinutes + dt;

        // Stat decays
        const hungerDecay = prev.isSleeping ? 0.08 * speedMultiplier : 0.22 * speedMultiplier;
        const happinessDecay = prev.isSleeping ? 0.05 * speedMultiplier : 0.18 * speedMultiplier;
        const hairDecay = prev.isSleeping ? 0.08 * speedMultiplier : 0.14 * speedMultiplier;
        const energyDelta = prev.isSleeping ? +0.6 * speedMultiplier : -0.15 * speedMultiplier;
        const cleanDecay = prev.messCount > 0 ? 0.2 * speedMultiplier : 0.04 * speedMultiplier;

        const hunger = Math.max(0, Math.min(100, prev.hunger - hungerDecay));
        const happiness = Math.max(0, Math.min(100, prev.happiness - happinessDecay));
        const hairStyle = Math.max(0, Math.min(100, prev.hairStyle - hairDecay));
        const energy = Math.max(0, Math.min(100, prev.energy + energyDelta));
        const cleanliness = Math.max(0, Math.min(100, prev.cleanliness - cleanDecay));

        // Mess generator
        let messCount = prev.messCount;
        if (!prev.isSleeping && Math.random() < 0.03 * speedMultiplier && messCount < 4) {
          messCount += 1;
        }

        // Health
        let health = prev.health;
        let isSick = prev.isSick;
        if (hunger < 20 || cleanliness < 25) {
          health = Math.max(0, health - 0.2 * speedMultiplier);
          if (health < 40) isSick = true;
        } else if (health < 95 && !isSick) {
          health = Math.min(100, health + 0.1 * speedMultiplier);
        }

        // Approval Ratings calculation
        const ratings = Math.round(
          hunger * 0.25 + 
          happiness * 0.35 + 
          hairStyle * 0.2 + 
          cleanliness * 0.1 + 
          health * 0.1
        );

        // Attention needed alert & phone notifications
        const needsAttention = hunger < 30 || messCount >= 2 || isSick || hairStyle < 30;
        if (needsAttention && !prev.attentionNeeded) {
          sound.playAttentionAlert();
        }

        // Trigger phone notifications if things start going bad for Donald
        // Skip repeated notification work when the game is paused or hidden.
        if (document.visibilityState === 'visible') notificationEngine.checkAndNotifyVitals({
          ...prev,
          hunger,
          happiness,
          energy,
          cleanliness,
          hairStyle,
          health,
          isSick,
          ratings,
          messCount: messCount,
        });

        return {
          ...prev,
          hunger,
          happiness,
          energy,
          cleanliness,
          hairStyle,
          health,
          isSick,
          ratings,
          messCount,
          ageMinutes: newAge,
          attentionNeeded: needsAttention,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [speedMultiplier]);

  // Actions with growth progression
  const feed = useCallback((food: FoodItem = FOOD_MENU[0]) => {
    sound.playMunch();
    triggerAnim('eat', 2600);
    triggerQuote(statsRef.current.evolutionStage === 'baby' ? 'baby' : 'hungry');

    setStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + food.hungerBoost),
      happiness: Math.min(100, prev.happiness + food.happinessBoost),
      burgersEaten: prev.burgersEaten + 1,
      lastFedTimestamp: Date.now(),
      attentionNeeded: false,
    }));

    addGrowth(12); // Feeding builds growth towards President!
  }, [triggerAnim, triggerQuote, addGrowth]);

  const toggleSleep = useCallback(() => {
    sound.playSelectChime();
    setStats(prev => {
      const nextSleep = !prev.isSleeping;
      if (nextSleep) {
        triggerAnim('sleep', 999999);
        triggerQuote('sleepy');
      } else {
        triggerAnim('idle', 1000);
        triggerQuote(prev.evolutionStage === 'baby' ? 'baby' : 'happy');
      }
      return {
        ...prev,
        isSleeping: nextSleep,
      };
    });
  }, [triggerAnim, triggerQuote]);

  const groomHair = useCallback(() => {
    sound.playHairBrush();
    triggerAnim('groom', 2500);
    triggerQuote('happy');

    setStats(prev => ({
      ...prev,
      hairStyle: 100,
      happiness: Math.min(100, prev.happiness + 20),
      ratings: Math.min(100, prev.ratings + 5),
    }));

    addGrowth(10);
  }, [triggerAnim, triggerQuote, addGrowth]);

  const cleanMess = useCallback(() => {
    sound.playCleanSweep();
    triggerAnim('talk', 2000);
    triggerQuote(statsRef.current.evolutionStage === 'baby' ? 'baby' : 'feisty');

    setStats(prev => ({
      ...prev,
      messCount: 0,
      cleanliness: 100,
      happiness: Math.min(100, prev.happiness + 15),
    }));

    addGrowth(10);
  }, [triggerAnim, triggerQuote, addGrowth]);

  const giveMedicine = useCallback(() => {
    sound.playSelectChime();
    triggerAnim('talk', 2200);
    triggerQuote('happy');

    setStats(prev => ({
      ...prev,
      health: 100,
      isSick: false,
      happiness: Math.min(100, prev.happiness + 10),
    }));

    addGrowth(8);
  }, [triggerAnim, triggerQuote, addGrowth]);

  const pepTalk = useCallback(() => {
    sound.playSelectChime();
    triggerAnim(statsRef.current.evolutionStage === 'baby' ? 'talk' : 'rally', 3000);
    triggerQuote(statsRef.current.evolutionStage === 'baby' ? 'baby' : 'rallied');

    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 25),
      ratings: Math.min(100, prev.ratings + 8),
      netWorthBillion: Number((prev.netWorthBillion + 0.3).toFixed(1)),
    }));

    addGrowth(15);
  }, [triggerAnim, triggerQuote, addGrowth]);

  /** Trump YMCA Double Fist-Pump Dance */
  const dance = useCallback(() => {
    sound.playDanceBeat();
    triggerAnim('dance', 3800);
    triggerQuote(statsRef.current.evolutionStage === 'baby' ? 'baby' : 'dance');

    setStats(prev => ({
      ...prev,
      happiness: 100,
      ratings: Math.min(100, prev.ratings + 8),
      energy: Math.max(10, prev.energy - 5),
      dancesDone: prev.dancesDone + 1,
    }));

    addGrowth(15); // Dancing builds tremendous momentum towards President!
  }, [triggerAnim, triggerQuote, addGrowth]);

  /** Trump Yelling at TV News ("FAKE NEWS!") */
  const yellAtTv = useCallback(() => {
    sound.playTvStatic();
    setTimeout(() => sound.playAngryYell(), 250);
    triggerAnim('tv_fake_news', 4000);
    triggerQuote('fake_news');

    setStats(prev => ({
      ...prev,
      ratings: Math.min(100, prev.ratings + 10),
      energy: Math.min(100, prev.energy + 15), // Pure adrenaline rush
      tvYellsCount: prev.tvYellsCount + 1,
      attentionNeeded: false,
    }));

    addGrowth(15); // Exposing fake news rallies the base towards President!
  }, [triggerAnim, triggerQuote, addGrowth]);

  const tapDonald = useCallback(() => {
    sound.playButtonBlip();
    triggerAnim('talk', 2000);
    triggerQuote();
  }, [triggerAnim, triggerQuote]);

  const recordMiniGameWin = useCallback((type: 'golf' | 'rally' | 'deal', rewardAmount: number) => {
    sound.playVictoryFanfare();
    triggerAnim('victory', 3500);

    setStats(prev => {
      if (type === 'golf') {
        triggerQuote('golf');
        return {
          ...prev,
          golfTrophies: prev.golfTrophies + 1,
          happiness: 100,
          ratings: Math.min(100, prev.ratings + 15),
          netWorthBillion: Number((prev.netWorthBillion + 0.5).toFixed(1)),
        };
      } else if (type === 'rally') {
        triggerQuote('rallied');
        return {
          ...prev,
          ralliesHeld: prev.ralliesHeld + 1,
          happiness: 100,
          ratings: Math.min(100, prev.ratings + rewardAmount),
        };
      } else {
        triggerQuote('happy');
        return {
          ...prev,
          dealsStruck: prev.dealsStruck + 1,
          happiness: Math.min(100, prev.happiness + 25),
          netWorthBillion: Number((prev.netWorthBillion + rewardAmount).toFixed(1)),
        };
      }
    });

    addGrowth(25); // Winning a mini-game gives a big boost towards President!
  }, [triggerAnim, triggerQuote, addGrowth]);

  const resetPet = useCallback(() => {
    sound.playCancel();
    localStorage.removeItem(STORAGE_KEY);
    setStats({ 
      ...INITIAL_STATS, 
      lastFedTimestamp: Date.now(), 
      lastActionTimestamp: Date.now() 
    });
    setActiveAnimation('idle');
    setHasEvolvedNotice(null);
    triggerQuote('baby');
  }, [triggerQuote]);

  return {
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
    triggerQuote,
  };
}
