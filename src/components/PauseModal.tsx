import React, { useState } from 'react';
import { PetStats, EvolutionStage } from '../types/game';
import { sound } from '../utils/audio';
import { notificationEngine } from '../utils/notifications';
import { TrumpCaricature } from './TrumpCaricature';

interface PauseModalProps {
  stats: PetStats;
  onResume: () => void;
  onResetPet: () => void;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onSetStage?: (stage: EvolutionStage) => void;
  onReturnHome?: () => void;
}

const STAGE_TITLES: Record<EvolutionStage, { title: string; desc: string }> = {
  baby: { title: 'Baby Donald', desc: 'Starting out in Queens with a small million-dollar dream.' },
  apprentice: { title: 'The Apprentice', desc: 'Hosting boardroom reviews and building Manhattan penthouses.' },
  tycoon: { title: 'Real Estate Tycoon', desc: 'Acquiring Mar-a-Lago, golf courses, and skyscraper towers.' },
  potus: { title: 'Commander-in-Chief', desc: 'Leading rallies, striking global deals, and high approval ratings.' },
  legend: { title: 'Golden Golf Legend', desc: 'Achieved ultimate billionaire golfing status. Untouchable.' },
};

export const PauseModal: React.FC<PauseModalProps> = ({
  stats,
  onResume,
  onResetPet,
  speedMultiplier,
  setSpeedMultiplier,
  isMuted,
  onToggleMute,
  onSetStage,
  onReturnHome,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const stageInfo = STAGE_TITLES[stats.evolutionStage];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-amber-500/80 rounded-2xl p-5 text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-pixel text-lg font-bold tracking-widest text-amber-400">
              PET DOSSIER & SETTINGS
            </span>
          </div>
          <button
            onClick={() => {
              sound.playCancel();
              onResume();
            }}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-pixel text-neutral-300 transition-colors"
          >
            [ESC] RESUME
          </button>
        </div>

        {/* Pet Profile Badge */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 flex items-center gap-3.5 mb-4">
          <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            <TrumpCaricature
              animation="idle"
              stats={stats}
              theme="classic-green"
              isSleeping={false}
              scale={0.35}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-base font-bold text-amber-300">
                {stageInfo.title}
              </span>
              <span className="font-pixel text-xs text-neutral-400 tabular-nums">
                AGE: {Math.floor(stats.ageMinutes * 3)} V-DAYS
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {stageInfo.desc}
            </p>
          </div>
        </div>

        {/* Growth to President Progress Bar */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-3 mb-4 flex flex-col gap-1.5 text-xs font-pixel">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold">GROWTH TO PRESIDENT:</span>
            <span className="text-neutral-300 font-semibold">{stats.growthProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${stats.growthProgress}%` }}
            />
          </div>

          {/* Quick Stage Evolution Switcher */}
          {onSetStage && (
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 mt-1">
              <span className="text-neutral-400 text-[10px]">PREVIEW LIFE STAGES:</span>
              <div className="flex gap-1">
                {(['baby', 'apprentice', 'tycoon', 'potus', 'legend'] as EvolutionStage[]).map(st => (
                  <button
                    key={st}
                    onClick={() => onSetStage(st)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      stats.evolutionStage === st
                        ? 'bg-amber-400 text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st === 'baby' ? '🍼 Baby' :
                     st === 'apprentice' ? '📋 Apprentice' :
                     st === 'tycoon' ? '🏢 Tycoon' :
                     st === 'potus' ? '🏛️ POTUS' : '👑 Legend'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lifetime Statistics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-pixel mb-4">
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">EST. NET WORTH:</span>
            <span className="font-bold text-emerald-400 tabular-nums">${stats.netWorthBillion}B</span>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">APPROVAL POLL:</span>
            <span className="font-bold text-amber-400 tabular-nums">{stats.ratings}%</span>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">GOLF TROPHIES:</span>
            <span className="font-bold text-yellow-300 tabular-nums">{stats.golfTrophies} 🏆</span>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">RALLIES HELD:</span>
            <span className="font-bold text-red-400 tabular-nums">{stats.ralliesHeld} 🎤</span>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">BURGERS EATEN:</span>
            <span className="font-bold text-neutral-200 tabular-nums">{stats.burgersEaten} 🍔</span>
          </div>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">DEALS STRUCK:</span>
            <span className="font-bold text-sky-400 tabular-nums">{stats.dealsStruck} 🤝</span>
          </div>
        </div>

        {/* Game Simulation Speed */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 mb-4 flex items-center justify-between text-xs font-pixel">
          <span className="text-neutral-400">SIMULATION CLOCK SPEED:</span>
          <div className="flex gap-1.5">
            {[1, 5, 20].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  sound.playButtonBlip();
                  setSpeedMultiplier(speed);
                }}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  speedMultiplier === speed
                    ? 'bg-amber-400 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {speed}X {speed === 1 ? '(REALTIME)' : speed === 20 ? '(TURBO)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Presidential Emergency Phone Notifications */}
        <div className="bg-neutral-950 border border-amber-500/40 rounded-xl p-3 mb-4 space-y-2 text-xs font-pixel">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>🔔</span>
              <span>PHONE EMERGENCY ALERTS:</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                ? '✓ ACTIVE'
                : 'TAP TO ENABLE'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-tight">
            Donald will send lock-screen push alerts to your phone if he's starving, sick, or fake news crashes his ratings!
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={async () => {
                const granted = await notificationEngine.requestPermission();
                if (granted) {
                  sound.playVictoryFanfare();
                } else {
                  sound.playCancel();
                }
              }}
              className="flex-1 py-1.5 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 font-bold cursor-pointer transition text-[11px] text-center"
            >
              ENABLE PHONE ALERTS
            </button>
            <button
              onClick={() => {
                notificationEngine.sendTestAlert();
              }}
              className="py-1.5 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition text-[11px]"
              title="Test push notification right now"
            >
              TEST NOTIF
            </button>
          </div>
        </div>

        {/* Audio Mute & Reset Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              sound.playButtonBlip();
              onToggleMute();
            }}
            className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-pixel text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="py-2 px-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-pixel text-xs rounded-lg transition-colors"
            >
              RESET PET...
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  onResetPet();
                  setShowConfirmReset(false);
                  onResume();
                }}
                className="py-2 px-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel font-bold text-xs rounded-lg transition-colors"
              >
                CONFIRM RESET!
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="py-2 px-2 bg-neutral-800 text-neutral-400 font-pixel text-xs rounded-lg"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>

        {/* Primary Resume Button */}
        <button
          onClick={() => {
            sound.playSelectChime();
            onResume();
          }}
          className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-pixel font-bold text-sm tracking-widest rounded-xl shadow-lg transition-all cursor-pointer"
        >
          RESUME GAMEPLAY [ESC / SPACE]
        </button>

        {onReturnHome && (
          <button
            onClick={() => {
              sound.playButtonBlip();
              onReturnHome();
            }}
            className="w-full mt-2 py-2 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-pink-300 font-pixel text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🍬</span>
            <span>EXIT TO RANDOM CANDY LAND (randomcandyland.com)</span>
          </button>
        )}
      </div>
    </div>
  );
};
