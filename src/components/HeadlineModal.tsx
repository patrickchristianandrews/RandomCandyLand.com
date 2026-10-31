import React, { useState, useEffect } from 'react';
import { PetStats, EvolutionStage } from '../types/game';
import { sound } from '../utils/audio';

interface HeadlineData {
  headline: string;
  subhead: string;
  quote: string;
  category: string;
}

interface HeadlineModalProps {
  stats: PetStats;
  onClose: () => void;
}

export const HeadlineModal: React.FC<HeadlineModalProps> = ({ stats, onClose }) => {
  const [headlineData, setHeadlineData] = useState<HeadlineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fetch daily headline on open
  const fetchHeadline = async () => {
    setLoading(true);
    sound.playButtonBlip();

    try {
      const res = await fetch('/api/trump/headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: stats.evolutionStage,
          ratings: stats.ratings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHeadlineData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch headline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadline();
  }, [stats.evolutionStage]);

  // Speak the quote using the site's existing audio service
  const handleSpeak = async () => {
    if (!headlineData) return;
    setIsSpeaking(true);
    sound.playSelectChime();

    const fullSpeech = `${headlineData.headline}... ${headlineData.quote}`;
    await sound.speakTrump(fullSpeech, stats.evolutionStage === 'baby');
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md bg-[#fdfbf7] text-neutral-900 border-4 border-neutral-900 rounded-xl p-5 shadow-2xl relative flex flex-col font-serif">
        {/* Newspaper Masthead */}
        <div className="border-b-4 border-neutral-900 pb-2 mb-3 text-center">
          <div className="flex items-center justify-between text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-600 border-b border-neutral-400 pb-1 mb-1.5">
            <span>VOL. XLVII NO. 1</span>
            <span>★ THE POCKET POTUS DAILY DISPATCH ★</span>
            <span>PRICE: $1,000,000</span>
          </div>
          <h2 className="font-pixel text-4xl sm:text-5xl font-black tracking-tight leading-none text-neutral-950 uppercase drop-shadow-sm">
            THE DAILY DONALD
          </h2>
          <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-neutral-700 mt-1">
            <span>STAGE: {stats.evolutionStage.toUpperCase()} DONALD</span>
            <span>POLL: {stats.ratings}% APPROVAL</span>
            <span>WEATHER: SUNNY IN PALM BEACH</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="my-10 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl animate-bounce">📰</span>
            <span className="font-pixel text-base text-neutral-600 tracking-wider">
              PRINTING EXTRA MORNING EDITION...
            </span>
          </div>
        )}

        {/* Headline Body */}
        {!loading && headlineData && (
          <div className="flex flex-col gap-3 my-1">
            {/* Category Tag */}
            <div className="text-[11px] font-sans font-extrabold uppercase tracking-widest text-red-700">
              ● {headlineData.category || 'SPECIAL REPORT'}
            </div>

            {/* Giant Bold Headline */}
            <h1 className="font-pixel text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-950 uppercase border-b-2 border-neutral-900 pb-2">
              "{headlineData.headline}"
            </h1>

            {/* Subhead Context */}
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-neutral-700 italic">
              {headlineData.subhead}
            </p>

            {/* Spoken Quote Callout Box */}
            <div className="bg-amber-50 border-2 border-amber-500/80 rounded-lg p-3 my-1 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-bold text-amber-800 tracking-wider uppercase">
                  DONALD'S OFFICIAL STATEMENT
                </span>
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-amber-600 animate-pulse" />
                    <span className="w-1.5 h-4 bg-amber-600 animate-pulse delay-75" />
                    <span className="w-1.5 h-2 bg-amber-600 animate-pulse delay-150" />
                  </div>
                )}
              </div>
              <p className="font-pixel text-base sm:text-lg font-bold text-neutral-900 tracking-wide">
                "{headlineData.quote}"
              </p>

              {/* Hear Voice Button */}
              <button
                onClick={handleSpeak}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-pixel font-bold text-xs tracking-wider rounded-md shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>🗣️</span>
                <span>{isSpeaking ? 'TRUMP IS SPEAKING...' : 'HEAR TRUMP SAY THIS HEADLINE!'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t-2 border-neutral-900 flex items-center justify-between gap-2">
          <button
            onClick={fetchHeadline}
            disabled={loading}
            className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded font-pixel text-xs font-bold transition-colors cursor-pointer"
          >
            🔄 NEW HEADLINE
          </button>
          <button
            onClick={() => {
              sound.playCancel();
              onClose();
            }}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-pixel text-xs font-bold transition-colors cursor-pointer"
          >
            [ESC] RETURN TO PET
          </button>
        </div>
      </div>
    </div>
  );
};
