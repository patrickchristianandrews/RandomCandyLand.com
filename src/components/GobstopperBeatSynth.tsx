import React, { useState, useEffect, useRef } from 'react';
import { candyAudio } from '../utils/candyAudio';
import { sound } from '../utils/audio';
import { Play, Square, Music, Sliders, Volume2, Crown } from 'lucide-react';

interface PadConfig {
  id: number;
  label: string;
  sub: string;
  color: string;
  isVoice?: boolean;
  voiceClip?: string;
  synthIdx?: number;
}

const FIVE_STAR_PADS: PadConfig[] = [
  { id: 0, label: '24K Bass 808', sub: 'Low Sine 45Hz', color: 'from-amber-600 to-yellow-800', synthIdx: 1 },
  { id: 1, label: 'Penthouse Snare', sub: 'Crisp Crack', color: 'from-amber-500 to-amber-700', synthIdx: 4 },
  { id: 2, label: 'Gold Hi-Hat', sub: 'Noise 8kHz', color: 'from-yellow-500 to-amber-600', synthIdx: 2 },
  { id: 3, label: 'Mar-a-Lago Chime', sub: 'Triangle E6', color: 'from-amber-400 to-yellow-600', synthIdx: 3 },
  { id: 4, label: '"WRONG!"', sub: 'Authentic Vocal', color: 'from-red-600 to-rose-800', isVoice: true, voiceClip: 'wrong.mp3' },
  { id: 5, label: '"BING BONG!"', sub: 'YMCA Dance Beat', color: 'from-amber-500 to-yellow-600', isVoice: true, voiceClip: 'bingbong.mp3' },
  { id: 6, label: '"TREMENDOUS!"', sub: 'Authentic Vocal', color: 'from-yellow-400 to-amber-600', isVoice: true, voiceClip: 'tremendous_amounts_of_dollars.mp3' },
  { id: 7, label: '"REALLY RICH!"', sub: 'Authentic Vocal', color: 'from-emerald-500 to-teal-700', isVoice: true, voiceClip: 'im_really_rich.mp3' },
];

export function GobstopperBeatSynth() {
  const [activePad, setActivePad] = useState<number | null>(null);
  const [bpm, setBpm] = useState<number>(124);
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pattern, setPattern] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false], // Bass 808
    [false, false, true, false, false, false, true, false], // Snare
    [true, true, true, true, true, true, true, true],       // HiHat
    [false, false, false, true, false, false, false, true], // Chime
  ]);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerPad = (pad: PadConfig) => {
    setActivePad(pad.id);
    setTimeout(() => setActivePad(null), 180);

    if (pad.isVoice && pad.voiceClip) {
      sound.playQuoteAudio(pad.voiceClip);
    } else if (pad.synthIdx !== undefined) {
      candyAudio.playSynthPad(pad.synthIdx);
    }
  };

  const toggleSequenceStep = (trackIdx: number, stepIdx: number) => {
    setPattern(prev => {
      const copy = prev.map(row => [...row]);
      copy[trackIdx][stepIdx] = !copy[trackIdx][stepIdx];
      return copy;
    });
    const padIndex = trackIdx === 0 ? 1 : trackIdx === 1 ? 4 : trackIdx === 2 ? 2 : 3;
    candyAudio.playSynthPad(padIndex);
  };

  useEffect(() => {
    if (!isPlayingLoop) {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      return;
    }

    const intervalMs = (60 / bpm / 2) * 1000;
    loopTimerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 8;
        if (pattern[0][nextStep]) candyAudio.playSynthPad(1);
        if (pattern[1][nextStep]) candyAudio.playSynthPad(4);
        if (pattern[2][nextStep]) candyAudio.playSynthPad(2);
        if (pattern[3][nextStep]) candyAudio.playSynthPad(3);
        return nextStep;
      });
    }, intervalMs);

    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
    };
  }, [isPlayingLoop, bpm, pattern]);

  return (
    <div className="bg-[#0f0918] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(212,175,55,0.12)] relative overflow-hidden backdrop-blur-md">
      {/* 24K Gold luxury top trim */}
      <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif-luxury tracking-widest text-amber-400">
            <span>⚜️</span>
            <span>PENTHOUSE AUDIO SUITE AT RANDOM CANDY LAND</span>
            <span>⚜️</span>
          </div>
          <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-wide mt-1">
            24K Gold MPC Beatbox &amp; Vocal Soundboard
          </h3>
          <p className="text-xs text-amber-200/70">
            Procedural 808 rhythms &bull; Authentic Trump vocal master chops &bull; 8-step sequencer
          </p>
        </div>

        <button
          onClick={() => setIsPlayingLoop(prev => !prev)}
          className={`px-5 py-2.5 rounded-xl text-xs font-serif-luxury font-black tracking-wider transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 self-start sm:self-auto ${
            isPlayingLoop
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
              : 'gold-shimmer hover:brightness-110 text-black shadow-amber-500/20'
          }`}
        >
          {isPlayingLoop ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlayingLoop ? 'STOP 808 GROOVE' : 'START 808 GROOVE'}
        </button>
      </div>

      {/* 8 Luxury MPC Pads */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {FIVE_STAR_PADS.map(pad => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad)}
              className={`h-28 rounded-2xl p-4 bg-gradient-to-br ${pad.color} border-2 border-amber-300/40 text-left transition-all transform active:scale-95 cursor-pointer relative overflow-hidden shadow-xl ${
                isActive ? 'brightness-150 scale-102 ring-4 ring-amber-300' : 'hover:brightness-110 hover:border-amber-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-serif-luxury font-bold text-white uppercase tracking-wider block">
                  {pad.label}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/50 text-amber-300 border border-amber-400/40">
                  {pad.isVoice ? 'VOCAL' : `PAD ${pad.id + 1}`}
                </span>
              </div>
              <span className="text-xs text-amber-100/90 font-serif-luxury mt-3 block">{pad.sub}</span>

              {pad.isVoice && (
                <div className="absolute bottom-2 right-2 opacity-30 text-white">
                  <Volume2 className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 8-Step Sequencer Rack */}
      <div className="bg-black/80 rounded-2xl p-5 border-2 border-amber-500/30 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 text-xs">
          <span className="font-serif-luxury font-bold text-amber-300 flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            24K Presidential 8-Step Sequencer
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> {bpm} BPM
            </span>
            <input
              type="range"
              min="90"
              max="150"
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-28 accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Step Matrix */}
        <div className="space-y-2">
          {['Bass 808', 'Snare', 'Hi-Hat', 'Chime'].map((name, trackIdx) => (
            <div key={trackIdx} className="flex items-center gap-3">
              <span className="w-20 text-xs font-serif-luxury text-amber-300/80 truncate">{name}</span>
              <div className="flex-1 grid grid-cols-8 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(stepIdx => {
                  const isOn = pattern[trackIdx][stepIdx];
                  const isCurrent = currentStep === stepIdx && isPlayingLoop;
                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleSequenceStep(trackIdx, stepIdx)}
                      className={`h-9 rounded-xl transition cursor-pointer flex items-center justify-center ${
                        isOn
                          ? 'gold-shimmer text-black shadow-md shadow-amber-500/30'
                          : 'bg-[#1a102a] hover:bg-[#25173e] border border-amber-500/20'
                      } ${isCurrent ? 'ring-2 ring-white scale-105' : ''}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${isOn ? 'bg-black' : 'bg-amber-600/30'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
