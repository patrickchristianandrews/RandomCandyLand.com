import React from 'react';

interface TrumpCartoonLookalikeProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const TrumpCartoonLookalike: React.FC<TrumpCartoonLookalikeProps> = ({
  className = '',
  size = 180,
  animate = true,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-xl"
      >
        <defs>
          {/* Hair Golden Gradient */}
          <linearGradient id="trumpHairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff2a3" />
            <stop offset="25%" stopColor="#ffd447" />
            <stop offset="65%" stopColor="#e5a110" />
            <stop offset="100%" stopColor="#aa6d06" />
          </linearGradient>

          {/* Hair Highlight Gradient */}
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffe680" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffc107" stopOpacity="0" />
          </linearGradient>

          {/* Skin Tone Gradient (Signature Tanned Bronze) */}
          <radialGradient id="trumpSkin" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fcd3a7" />
            <stop offset="60%" stopColor="#f5aa67" />
            <stop offset="100%" stopColor="#d97834" />
          </radialGradient>

          {/* Suit Navy Gradient */}
          <linearGradient id="trumpSuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="40%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Red Tie Gradient */}
          <linearGradient id="trumpTie" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Golden Halo Glow */}
          <radialGradient id="goldHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Warm Halo behind character */}
        <circle cx="100" cy="95" r="90" fill="url(#goldHalo)" />

        {/* 1. PRESIDENTIAL NAVY SUIT SHOULDERS */}
        <path
          d="M 32 175 Q 60 148 100 152 Q 140 148 168 175 L 180 200 L 20 200 Z"
          fill="url(#trumpSuit)"
          stroke="#0f172a"
          strokeWidth="3"
        />

        {/* Suit Lapels (Left & Right) */}
        <path
          d="M 58 152 L 85 188 L 72 200 L 45 168 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <path
          d="M 142 152 L 115 188 L 128 200 L 155 168 Z"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
        />

        {/* American Flag Lapel Pin */}
        <g transform="translate(62, 168)">
          <rect x="0" y="0" width="9" height="6" rx="1" fill="#dc2626" stroke="#ffffff" strokeWidth="0.8" />
          <rect x="0" y="0" width="4" height="3.5" fill="#1d4ed8" />
          <circle cx="2" cy="1.8" r="0.8" fill="#ffffff" />
        </g>

        {/* 2. CRISP WHITE DRESS SHIRT COLLAR */}
        <path
          d="M 80 148 L 100 162 L 76 182 L 72 158 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <path
          d="M 120 148 L 100 162 L 124 182 L 128 158 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* 3. SIGNATURE LONG BRIGHT RED TIE */}
        {/* Tie Knot */}
        <path
          d="M 92 160 L 108 160 L 105 174 L 95 174 Z"
          fill="url(#trumpTie)"
          stroke="#7f1d1d"
          strokeWidth="1.5"
        />
        {/* Tie Body extending long past the waist */}
        <path
          d="M 94 173 L 106 173 L 112 200 L 88 200 Z"
          fill="url(#trumpTie)"
          stroke="#7f1d1d"
          strokeWidth="1.5"
        />
        {/* Tie Highlight Sheen */}
        <path
          d="M 96 175 L 100 175 L 102 200 L 98 200 Z"
          fill="#fca5a5"
          opacity="0.4"
        />

        {/* 4. NECK */}
        <path
          d="M 86 130 L 114 130 L 118 152 L 82 152 Z"
          fill="url(#trumpSkin)"
          stroke="#b45309"
          strokeWidth="1.5"
        />

        {/* 5. CARTOON DONALD TRUMP HEAD & FACE */}
        <g id="trumpHead" className={animate ? "origin-center animate-[wiggle_4s_ease-in-out_infinite]" : ""}>
          
          {/* Back Hair Silhouette */}
          <path
            d="M 50 115 C 38 85 45 45 78 35 C 100 28 140 32 156 55 C 168 75 166 110 152 125 Z"
            fill="url(#trumpHairGradient)"
            stroke="#92400e"
            strokeWidth="3"
          />

          {/* Ears */}
          <ellipse cx="62" cy="104" rx="9" ry="12" fill="url(#trumpSkin)" stroke="#b45309" strokeWidth="2" />
          <ellipse cx="138" cy="104" rx="9" ry="12" fill="url(#trumpSkin)" stroke="#b45309" strokeWidth="2" />
          <path d="M 64 100 Q 60 104 63 109" stroke="#b45309" strokeWidth="1.5" fill="none" />
          <path d="M 136 100 Q 140 104 137 109" stroke="#b45309" strokeWidth="1.5" fill="none" />

          {/* Jaw & Cheeks */}
          <path
            d="M 66 85 C 64 118 70 144 100 144 C 130 144 136 118 134 85 C 132 65 68 65 66 85 Z"
            fill="url(#trumpSkin)"
            stroke="#b45309"
            strokeWidth="2.5"
          />

          {/* Characteristic Double Chin & Jowls */}
          <path
            d="M 84 136 Q 100 142 116 136"
            stroke="#b45309"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 88 141 Q 100 146 112 141"
            stroke="#b45309"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Rosy/Tanned Cheeks */}
          <ellipse cx="78" cy="112" rx="10" ry="7" fill="#ea580c" opacity="0.35" />
          <ellipse cx="122" cy="112" rx="10" ry="7" fill="#ea580c" opacity="0.35" />

          {/* Signature Raised Blond Eyebrows */}
          <path
            d="M 72 82 Q 85 75 94 82"
            stroke="#fff2a3"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 72 82 Q 85 75 94 82"
            stroke="#b45309"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 106 82 Q 115 75 128 82"
            stroke="#fff2a3"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 106 82 Q 115 75 128 82"
            stroke="#b45309"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Squinty Confident Eyes */}
          {/* Eye Undereye Highlights (Famous White Goggle Tan Lines) */}
          <ellipse cx="83" cy="94" rx="11" ry="6" fill="#fef08a" opacity="0.5" />
          <ellipse cx="117" cy="94" rx="11" ry="6" fill="#fef08a" opacity="0.5" />

          {/* Left Eye */}
          <ellipse cx="83" cy="92" rx="7" ry="4" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="84" cy="92" r="2.8" fill="#1e3a8a" />
          <circle cx="85" cy="91" r="1" fill="#ffffff" />
          {/* Distinct Eye Fold / Squint */}
          <path d="M 74 88 Q 83 86 92 89" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 76 96 Q 84 98 90 96" stroke="#92400e" strokeWidth="1.2" fill="none" />

          {/* Right Eye */}
          <ellipse cx="117" cy="92" rx="7" ry="4" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="116" cy="92" r="2.8" fill="#1e3a8a" />
          <circle cx="117" cy="91" r="1" fill="#ffffff" />
          {/* Distinct Eye Fold / Squint */}
          <path d="M 108 89 Q 117 86 126 88" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 110 96 Q 116 98 124 96" stroke="#92400e" strokeWidth="1.2" fill="none" />

          {/* Sculpted Nose */}
          <path
            d="M 98 86 L 97 106 Q 100 111 104 107 Q 106 104 103 103"
            stroke="#92400e"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M 92 108 Q 98 112 106 109" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Expressive Signature Mouth (The "Tremendous" Smirk / Talk) */}
          {/* Open confident grin */}
          <path
            d="M 84 122 Q 100 132 116 122 Q 100 127 84 122 Z"
            fill="#7f1d1d"
            stroke="#92400e"
            strokeWidth="2"
          />
          {/* Upper Bright White Teeth */}
          <path
            d="M 88 123 Q 100 126 112 123 Q 100 128 88 123 Z"
            fill="#ffffff"
          />
          {/* Characteristic Smile Lines (Parentheses) */}
          <path d="M 76 114 Q 78 123 82 129" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 124 114 Q 122 123 118 129" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* 6. THE FAMOUS ICONIC AERODYNAMIC COMB-OVER HAIR */}
          {/* Massive Sweeping Golden Waves from Right to Left with Volume */}
          <path
            d="M 46 82 
               C 36 60 48 30 78 20 
               C 105 10 148 14 172 32 
               C 186 42 188 64 176 78 
               C 168 88 152 92 142 86 
               C 152 74 154 58 142 46 
               C 126 34 94 30 72 44 
               C 56 54 50 68 56 82 
               Z"
            fill="url(#trumpHairGradient)"
            stroke="#92400e"
            strokeWidth="2.5"
          />

          {/* The Golden Swooping Bangs over Forehead */}
          <path
            d="M 52 74 
               C 62 48 95 38 132 40 
               C 160 42 174 54 168 70 
               C 160 82 142 76 136 64 
               C 124 50 94 48 76 58 
               C 64 66 58 74 52 74 
               Z"
            fill="url(#trumpHairGradient)"
            stroke="#b45309"
            strokeWidth="2"
          />

          {/* Hair Feathering & Strands Detail */}
          <path
            d="M 68 36 Q 110 22 152 38"
            stroke="#fef08a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 75 46 Q 115 32 160 50"
            stroke="#ffffff"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 82 56 Q 120 44 154 62"
            stroke="#fde047"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 58 64 Q 72 52 92 50"
            stroke="#ffffff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 145 65 Q 162 68 174 78"
            stroke="#b45309"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sideburns */}
          <path
            d="M 62 88 L 60 102 L 65 98 Z"
            fill="url(#trumpHairGradient)"
            stroke="#92400e"
            strokeWidth="1.5"
          />
          <path
            d="M 138 88 L 140 102 L 135 98 Z"
            fill="url(#trumpHairGradient)"
            stroke="#92400e"
            strokeWidth="1.5"
          />

        </g>

        {/* 7. SIGNATURE DOUBLE THUMBS-UP HANDS */}
        {/* Left Thumb */}
        <g transform="translate(30, 142)">
          <path
            d="M 10 22 L 12 12 C 12 8 8 4 4 4 C 1 4 0 7 0 10 L 0 25 L 8 28 Z"
            fill="url(#trumpSkin)"
            stroke="#b45309"
            strokeWidth="2"
          />
          {/* Thumb Up */}
          <path
            d="M 4 4 C 4 0 9 -4 13 -4 C 16 -4 18 -1 18 4 L 16 12 L 10 12 Z"
            fill="url(#trumpSkin)"
            stroke="#b45309"
            strokeWidth="2"
          />
          {/* White Cuff & Gold Cufflink */}
          <rect x="-2" y="24" width="12" height="5" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="4" cy="26.5" r="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />
        </g>

        {/* Right Thumb */}
        <g transform="translate(150, 142)">
          <path
            d="M 10 22 L 8 12 C 8 8 12 4 16 4 C 19 4 20 7 20 10 L 20 25 L 12 28 Z"
            fill="url(#trumpSkin)"
            stroke="#b45309"
            strokeWidth="2"
          />
          {/* Thumb Up */}
          <path
            d="M 16 4 C 16 0 11 -4 7 -4 C 4 -4 2 -1 2 4 L 4 12 L 10 12 Z"
            fill="url(#trumpSkin)"
            stroke="#b45309"
            strokeWidth="2"
          />
          {/* White Cuff & Gold Cufflink */}
          <rect x="10" y="24" width="12" height="5" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="16" cy="26.5" r="1.5" fill="#eab308" stroke="#ca8a04" strokeWidth="0.5" />
        </g>

        {/* 8. CARTOON SHINE STARS */}
        <path
          d="M 170 30 Q 174 38 182 42 Q 174 46 170 54 Q 166 46 158 42 Q 166 38 170 30 Z"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="1"
          className="animate-pulse"
        />
        <path
          d="M 35 48 Q 38 53 43 55 Q 38 57 35 62 Q 32 57 27 55 Q 32 53 35 48 Z"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="0.8"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
};
