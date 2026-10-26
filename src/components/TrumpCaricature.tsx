import React, { useState, useEffect } from 'react';
import { CurrentAnimation } from '../hooks/usePetGame';
import { PetStats, LcdColorTheme } from '../types/game';

interface TrumpCaricatureProps {
  animation: CurrentAnimation;
  stats: PetStats;
  theme: LcdColorTheme;
  isSleeping: boolean;
  scale?: number;
}

export const TrumpCaricature: React.FC<TrumpCaricatureProps> = ({
  animation,
  stats,
  isSleeping,
  scale = 1,
}) => {
  const [blink, setBlink] = useState(false);
  const [gestureTick, setGestureTick] = useState(0);

  const stage = stats.evolutionStage;
  const isBaby = stage === 'baby';
  const isApprentice = stage === 'apprentice';
  const isTycoon = stage === 'tycoon';
  const isPotus = stage === 'potus';
  const isLegend = stage === 'legend';

  // Blinking loop
  useEffect(() => {
    const blinkInterval = window.setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => window.clearInterval(blinkInterval);
  }, []);

  // Micro-gestures oscillation
  useEffect(() => {
    const gestureInterval = window.setInterval(() => {
      setGestureTick(prev => (prev + 1) % 60);
    }, 80);

    return () => window.clearInterval(gestureInterval);
  }, []);

  const isEating = animation === 'eat';
  const isGolfing = animation === 'golf';
  const isRallying = animation === 'rally';
  const isGrooming = animation === 'groom';
  const isTalking = animation === 'talk';
  const isAngry = animation === 'angry' || (stats.hunger < 25 && !isSleeping);
  const isSleep = isSleeping || animation === 'sleep';
  const isVictory = animation === 'victory';

  // Dynamic animations
  const hairSway = Math.sin(gestureTick * 0.15) * (isBaby ? 1 : 2.5);
  const accordionSpread = Math.sin(gestureTick * 0.3) * (isBaby ? 3 : 7);
  const chewOffset = isEating ? (gestureTick % 4 < 2 ? 3 : 0) : 0;
  const waddleOffset = isBaby ? Math.sin(gestureTick * 0.2) * 3 : 0;
  const rallyBounce = isRallying ? (gestureTick % 6 < 3 ? -6 : 0) : 0;

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <svg
        viewBox="0 0 200 240"
        className="w-48 h-56 drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Hair Gradient (Golden Blonde Comb-Over) */}
          <linearGradient id="trumpHairGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="30%" stopColor="#ffd54f" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Hair Highlight Shine */}
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#fff59d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
          </linearGradient>

          {/* Skin Tone Gradient (Signature Warm Tan) */}
          <linearGradient id="trumpSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffcc80" />
            <stop offset="60%" stopColor="#ffb74d" />
            <stop offset="100%" stopColor="#f57c00" />
          </linearGradient>

          {/* Baby Skin Tone Gradient */}
          <linearGradient id="babySkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>

          {/* Navy Business Suit Gradient */}
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="40%" stopColor="#172554" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Signature Bright Red Tie Gradient */}
          <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Gold Trim for Accessories */}
          <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
        </defs>

        {/* ========================================================================= */}
        {/* STAGE 1: BABY DONALD (Small version you grow into President!) */}
        {/* ========================================================================= */}
        {isBaby ? (
          <g transform={`translate(${waddleOffset}, ${rallyBounce + 15})`}>
            {/* Baby Shadow */}
            <ellipse cx="100" cy="220" rx="35" ry="8" fill="rgba(0,0,0,0.18)" />

            {/* Baby Blue Onesie / Toddler Suit */}
            <path
              d="M 68 155 C 68 140, 85 136, 100 136 C 115 136, 132 140, 132 155 L 138 205 C 138 212, 125 215, 100 215 C 75 215, 62 212, 62 205 Z"
              fill="url(#suitGrad)"
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {/* Baby Red Bib / Mini Necktie */}
            <g>
              <polygon points="95,142 105,142 103,150 97,150" fill="#dc2626" />
              <path d="M 96 150 L 104 150 L 106 195 L 100 202 L 94 195 Z" fill="url(#tieGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
            </g>

            {/* White Toddler Collar */}
            <polygon points="86,136 100,154 114,136" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

            {/* Chubby Baby Donald Head */}
            <ellipse cx="100" cy="95" rx="38" ry="34" fill="url(#babySkinGrad)" stroke="#c2410c" strokeWidth="2.5" />

            {/* Chubby Rosy Cheeks */}
            <circle cx="75" cy="105" r="9" fill="#f43f5e" opacity="0.45" />
            <circle cx="125" cy="105" r="9" fill="#f43f5e" opacity="0.45" />

            {/* Big Cute Baby Eyes */}
            {isSleep ? (
              <g>
                <path d="M 80 94 Q 87 99 94 94" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 106 94 Q 113 99 120 94" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            ) : blink ? (
              <>
                <line x1="80" y1="94" x2="94" y2="94" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="106" y1="94" x2="120" y2="94" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="87" cy="94" r="6" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
                <circle cx="113" cy="94" r="6" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
                <circle cx="85" cy="92" r="2.5" fill="#ffffff" />
                <circle cx="111" cy="92" r="2.5" fill="#ffffff" />
              </>
            )}

            {/* Baby Cute Golden Comb-Over Swirl (Little Donald Hair Tuft!) */}
            <g transform={`translate(${hairSway}, 0)`}>
              {/* Little swoosh volume */}
              <path
                d="M 68 76 C 60 55, 75 35, 95 32 C 115 30, 138 38, 142 55 C 144 65, 138 78, 126 80 C 132 68, 128 50, 115 44 C 98 38, 80 48, 68 76 Z"
                fill="url(#trumpHairGrad)"
                stroke="#b45309"
                strokeWidth="2"
              />
              {/* Highlight tuft */}
              <path d="M 82 44 Q 106 32 128 46" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" strokeLinecap="round" />
            </g>

            {/* Baby Mouth & Pacifier/Bottle */}
            {isAngry ? (
              // Crying / yelling baby mouth
              <ellipse cx="100" cy="115" rx="8" ry="6" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.5" />
            ) : isTalking ? (
              <ellipse cx="100" cy="114" rx="6" ry="4" fill="#991b1b" />
            ) : (
              // Sweet baby smile
              <path d="M 93 113 Q 100 119 107 113" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}

            {/* Baby Hands & Golden Milk Bottle */}
            <g>
              {/* Left hand holding bottle */}
              <circle cx="68" cy="175" r="7" fill="url(#babySkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
              
              {/* Golden Baby Bottle */}
              <g transform="translate(118, 160) rotate(15)">
                <rect x="0" y="0" width="16" height="24" rx="4" fill="url(#goldAcc)" stroke="#78350f" strokeWidth="1.5" />
                <rect x="3" y="-5" width="10" height="6" fill="#f59e0b" />
                <circle cx="8" cy="-8" r="3" fill="#fb923c" />
                <line x1="4" y1="6" x2="12" y2="6" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="4" y1="12" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.5" />
              </g>
              
              {/* Right hand */}
              <circle cx="124" cy="178" r="7" fill="url(#babySkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
            </g>

            {/* Baby Donald Banner Tag */}
            <rect x="65" y="218" width="70" height="14" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
            <text x="100" y="228" textAnchor="middle" fill="#facc15" fontSize="8" fontWeight="bold" fontFamily="monospace">
              BABY DONALD
            </text>

            {/* Snoring for baby */}
            {isSleep && (
              <g className="animate-pulse">
                <text x="135" y="70" fill="#facc15" fontSize="14" fontWeight="bold">z</text>
                <text x="148" y="55" fill="#facc15" fontSize="18" fontWeight="bold">Z</text>
                <text x="162" y="38" fill="#facc15" fontSize="22" fontWeight="bold">Z</text>
              </g>
            )}
          </g>
        ) : (
          /* ========================================================================= */
          /* STAGES 2-5: APPRENTICE, TYCOON, POTUS, OR GOLDEN LEGEND */
          /* ========================================================================= */
          <g transform={`translate(0, ${rallyBounce})`}>
            {/* Broad Shoulders Navy Jacket */}
            <path
              d="M 50 145 C 50 130, 80 125, 100 125 C 120 125, 150 130, 150 145 L 162 230 C 162 235, 150 238, 100 238 C 50 238, 38 235, 38 230 Z"
              fill={isLegend ? "url(#goldAcc)" : "url(#suitGrad)"}
              stroke={isLegend ? "#78350f" : "#0f172a"}
              strokeWidth="3"
            />

            {/* White Shirt V-Neck & Collar */}
            <polygon
              points="82,125 100,165 118,125"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <polygon
              points="76,123 90,148 83,148"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <polygon
              points="124,123 110,148 117,148"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1"
            />

            {/* Extra-Long Signature Red Tie (Past the Beltline!) */}
            <g>
              <polygon
                points="94,142 106,142 104,152 96,152"
                fill="#b91c1c"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              <path
                d="M 95 152 L 105 152 L 108 226 L 100 236 L 92 226 Z"
                fill="url(#tieGrad)"
                stroke="#7f1d1d"
                strokeWidth="2"
              />
              <line
                x1="98"
                y1="156"
                x2="97"
                y2="225"
                stroke="#fca5a5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Suit Lapels */}
            <path
              d="M 68 135 L 88 178 L 74 185 Z"
              fill={isLegend ? "#ca8a04" : "#1e3a8a"}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <path
              d="M 132 135 L 112 178 L 126 185 Z"
              fill={isLegend ? "#ca8a04" : "#1e3a8a"}
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Lapel Pin */}
            {(isPotus || isLegend) && (
              <circle cx="75" cy="165" r="3.5" fill="url(#goldAcc)" stroke="#78350f" strokeWidth="0.8" />
            )}

            {/* Neck */}
            <rect
              x="88"
              y="110"
              width="24"
              height="22"
              fill="url(#trumpSkinGrad)"
              stroke="#c2410c"
              strokeWidth="1.5"
            />

            {/* Head Base */}
            <path
              d="M 66 65 C 66 45, 134 45, 134 65 C 136 90, 134 110, 126 122 C 118 134, 82 134, 74 122 C 66 110, 64 90, 66 65 Z"
              fill="url(#trumpSkinGrad)"
              stroke="#9a3412"
              strokeWidth="2.5"
            />

            {/* Ears */}
            <path d="M 64 78 C 58 78, 58 92, 65 96 Z" fill="#ffb74d" stroke="#c2410c" strokeWidth="1.5" />
            <path d="M 136 78 C 142 78, 142 92, 135 96 Z" fill="#ffb74d" stroke="#c2410c" strokeWidth="1.5" />

            {/* Distinctive Eyebrows */}
            <g>
              {isAngry ? (
                <>
                  <path d="M 74 68 Q 85 75 92 72" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <path d="M 126 68 Q 115 75 108 72" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  <path d="M 74 67 Q 84 62 93 68" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 126 67 Q 116 62 107 68" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
                </>
              )}
            </g>

            {/* Eyes & Gaze */}
            <g>
              {isSleep ? (
                <g>
                  <rect x="68" y="70" width="64" height="18" rx="8" fill="#1e293b" stroke="url(#goldAcc)" strokeWidth="2" />
                  <text x="100" y="83" textAnchor="middle" fill="#facc15" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    {isPotus ? '45 / 47' : isTycoon ? 'TYCOON' : 'TRUMP'}
                  </text>
                </g>
              ) : blink ? (
                <>
                  <line x1="78" y1="78" x2="90" y2="78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="110" y1="78" x2="122" y2="78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <ellipse cx="84" cy="78" rx="6" ry="4.5" fill="#ffffff" stroke="#9a3412" strokeWidth="1" />
                  <ellipse cx="116" cy="78" rx="6" ry="4.5" fill="#ffffff" stroke="#9a3412" strokeWidth="1" />
                  <circle cx={isTalking ? 85 : 84} cy="78" r="2.8" fill="#0284c7" />
                  <circle cx={isTalking ? 117 : 116} cy="78" r="2.8" fill="#0284c7" />
                  <circle cx="83.5" cy="77" r="1" fill="#ffffff" />
                  <circle cx="115.5" cy="77" r="1" fill="#ffffff" />
                  <path d="M 77 84 Q 84 87 91 84" stroke="#c2410c" strokeWidth="1" fill="none" />
                  <path d="M 109 84 Q 116 87 123 84" stroke="#c2410c" strokeWidth="1" fill="none" />
                </>
              )}
            </g>

            {/* Nose */}
            <path
              d="M 100 74 L 102 92 L 95 95 L 105 95"
              stroke="#b45309"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Expressive Mouth */}
            <g transform={`translate(0, ${chewOffset})`}>
              {isAngry ? (
                <ellipse cx="100" cy="110" rx="9" ry="6" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2" />
              ) : isTalking ? (
                <g>
                  <ellipse cx="100" cy="108" rx="7" ry="4" fill="#881337" stroke="#4c0519" strokeWidth="1.5" />
                  <line x1="97" y1="106" x2="103" y2="106" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              ) : isEating ? (
                <path d="M 94 108 Q 100 114 106 108" stroke="#881337" strokeWidth="3" fill="none" strokeLinecap="round" />
              ) : (
                <path
                  d="M 91 108 Q 100 113 109 108"
                  stroke="#991b1b"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Iconic Golden Comb-Over */}
            <g transform={`translate(${hairSway}, 0)`}>
              {isRallying ? (
                <g>
                  <ellipse cx="100" cy="45" rx="46" ry="14" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
                  <path d="M 58 45 C 58 18, 142 18, 142 45 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
                  <rect x="76" y="26" width="48" height="12" rx="2" fill="#991b1b" />
                  <text x="100" y="35" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    ★ MAGA ★
                  </text>
                  <path d="M 54 48 C 48 58, 52 75, 62 82 Z" fill="url(#trumpHairGrad)" />
                  <path d="M 146 48 C 152 58, 148 75, 138 82 Z" fill="url(#trumpHairGrad)" />
                </g>
              ) : isLegend ? (
                <g>
                  {/* Golden Crown for Legend */}
                  <polygon points="68,36 82,15 100,28 118,15 132,36" fill="url(#goldAcc)" stroke="#78350f" strokeWidth="2" />
                  <circle cx="82" cy="15" r="2.5" fill="#ef4444" />
                  <circle cx="100" cy="28" r="2.5" fill="#3b82f6" />
                  <circle cx="118" cy="15" r="2.5" fill="#ef4444" />
                  <path d="M 54 70 C 44 48, 52 24, 78 16 C 104 8, 138 12, 152 30 C 162 44, 156 68, 142 74 Z" fill="url(#trumpHairGrad)" stroke="#b45309" strokeWidth="2" />
                </g>
              ) : (
                <g>
                  <path
                    d="M 54 70 C 44 48, 52 24, 78 16 C 104 8, 138 12, 152 30 C 162 44, 156 68, 142 74 C 146 60, 144 46, 134 36 C 118 20, 88 22, 68 40 C 58 50, 56 62, 54 70 Z"
                    fill="url(#trumpHairGrad)"
                    stroke="#b45309"
                    strokeWidth="2"
                  />
                  <path
                    d="M 58 48 C 68 28, 102 18, 132 24 C 154 28, 164 42, 158 58 C 152 46, 138 34, 116 30 C 88 26, 70 38, 58 48 Z"
                    fill="url(#trumpHairGrad)"
                    stroke="#d97706"
                    strokeWidth="1.5"
                  />
                  <path d="M 68 34 Q 106 18 142 32" stroke="url(#hairHighlight)" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M 74 26 Q 112 12 146 26" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.75" strokeLinecap="round" />
                  <path d="M 60 52 Q 95 35 130 45" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 54 58 C 46 64, 46 76, 56 82 C 54 74, 52 66, 54 58 Z" fill="url(#trumpHairGrad)" stroke="#b45309" strokeWidth="1.5" />
                  <path d="M 144 58 C 154 64, 154 76, 142 82 C 144 74, 146 66, 144 58 Z" fill="url(#trumpHairGrad)" stroke="#b45309" strokeWidth="1.5" />
                </g>
              )}
            </g>

            {/* STAGE SPECIFIC HELD ITEMS */}
            {isApprentice && !isEating && !isGolfing && (
              // Holding Apprentice Boardroom Clipboard
              <g transform="translate(42, 155) rotate(-10)">
                <rect x="0" y="0" width="24" height="34" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
                <rect x="2" y="4" width="20" height="26" fill="#ffffff" />
                <rect x="6" y="0" width="12" height="4" rx="1" fill="#475569" />
                <text x="12" y="16" textAnchor="middle" fill="#dc2626" fontSize="5" fontWeight="bold">YOU'RE</text>
                <text x="12" y="23" textAnchor="middle" fill="#dc2626" fontSize="5" fontWeight="bold">FIRED!</text>
              </g>
            )}

            {isTycoon && !isEating && !isGolfing && (
              // Holding "The Art of the Deal" Hardcover Book
              <g transform="translate(40, 152) rotate(-8)">
                <rect x="0" y="0" width="26" height="36" rx="2" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
                <rect x="2" y="2" width="22" height="32" fill="#0f172a" />
                <text x="13" y="14" textAnchor="middle" fill="#facc15" fontSize="4.5" fontWeight="bold">ART OF</text>
                <text x="13" y="20" textAnchor="middle" fill="#facc15" fontSize="4" fontWeight="bold">THE DEAL</text>
                <rect x="4" y="24" width="18" height="6" fill="#dc2626" />
                <text x="13" y="29" textAnchor="middle" fill="#ffffff" fontSize="4" fontWeight="bold">TRUMP</text>
              </g>
            )}

            {isPotus && (
              // Presidential Podium in Front
              <g transform="translate(68, 195)">
                <rect x="0" y="0" width="64" height="42" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <circle cx="32" cy="18" r="10" fill="#1e3a8a" stroke="url(#goldAcc)" strokeWidth="1.5" />
                <polygon points="32,13 34,17 38,17 35,20 36,24 32,21 28,24 29,20 26,17 30,17" fill="url(#goldAcc)" />
                {/* Microphones */}
                <line x1="16" y1="0" x2="22" y2="-12" stroke="#000000" strokeWidth="2" />
                <circle cx="22" cy="-12" r="2.5" fill="#475569" />
                <line x1="48" y1="0" x2="42" y2="-12" stroke="#000000" strokeWidth="2" />
                <circle cx="42" cy="-12" r="2.5" fill="#475569" />
              </g>
            )}

            {/* HANDS & GESTURES */}
            {isEating ? (
              <g transform="translate(0, 10)">
                <circle cx="78" cy="160" r="10" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                <circle cx="122" cy="160" r="10" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                <g transform="translate(85, 146)">
                  <path d="M 0 10 Q 15 0 30 10 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
                  <circle cx="10" cy="5" r="1" fill="#fef08a" />
                  <circle cx="16" cy="4" r="1" fill="#fef08a" />
                  <circle cx="22" cy="6" r="1" fill="#fef08a" />
                  <path d="M -2 10 Q 15 14 32 10" stroke="#22c55e" strokeWidth="3" fill="none" />
                  <rect x="0" y="12" width="30" height="5" rx="2" fill="#451a03" />
                  <polygon points="4,15 15,20 26,15" fill="#eab308" />
                  <rect x="2" y="17" width="26" height="5" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                </g>
              </g>
            ) : isGolfing ? (
              <g>
                <line x1="140" y1="210" x2="185" y2="90" stroke="url(#goldAcc)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 182 92 L 195 86 L 192 100 Z" fill="url(#goldAcc)" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="148" cy="180" r="8" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                <circle cx="154" cy="168" r="8" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
              </g>
            ) : isGrooming ? (
              <g>
                <g transform="translate(130, 20) rotate(25)">
                  <rect x="0" y="0" width="40" height="10" rx="3" fill="url(#goldAcc)" stroke="#78350f" strokeWidth="1.5" />
                  {[...Array(8)].map((_, i) => (
                    <line key={i} x1={6 + i * 4} y1="10" x2={6 + i * 4} y2="24" stroke="url(#goldAcc)" strokeWidth="1.5" />
                  ))}
                </g>
                <text x="60" y="30" fill="#facc15" fontSize="16">✨</text>
                <text x="145" y="45" fill="#facc15" fontSize="16">✨</text>
              </g>
            ) : isTalking ? (
              <g>
                <g transform={`translate(${-accordionSpread}, 0)`}>
                  <circle cx="48" cy="165" r="9" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                  <path d="M 45 160 Q 38 152 42 146" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
                <g transform={`translate(${accordionSpread}, 0)`}>
                  <circle cx="152" cy="165" r="9" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                  <path d="M 152 160 L 156 138" stroke="#c2410c" strokeWidth="4" strokeLinecap="round" />
                </g>
              </g>
            ) : isRallying || isVictory ? (
              <g>
                <circle cx="42" cy="120" r="10" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="2" />
                <path d="M 46 140 L 42 120" stroke="#1e3a8a" strokeWidth="14" strokeLinecap="round" />
                <circle cx="158" cy="120" r="10" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="2" />
                <path d="M 154 140 L 158 120" stroke="#1e3a8a" strokeWidth="14" strokeLinecap="round" />
              </g>
            ) : (
              <g>
                <circle cx="50" cy="175" r="9" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                <g transform="translate(150, 160)">
                  <circle cx="0" cy="8" r="8" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                  <path d="M -2 4 L -2 -8 Q -2 -14 4 -12 Q 8 -10 6 -4 L 4 4 Z" fill="url(#trumpSkinGrad)" stroke="#c2410c" strokeWidth="1.5" />
                </g>
              </g>
            )}

            {isSleep && (
              <g className="animate-pulse">
                <text x="140" y="70" fill="#facc15" fontSize="16" fontWeight="bold">Z</text>
                <text x="155" y="55" fill="#facc15" fontSize="20" fontWeight="bold">Z</text>
                <text x="172" y="38" fill="#facc15" fontSize="26" fontWeight="bold">Z</text>
              </g>
            )}

            {isAngry && (
              <g className="animate-ping opacity-75">
                <text x="35" y="60" fontSize="18">💨</text>
                <text x="155" y="60" fontSize="18">💨</text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
