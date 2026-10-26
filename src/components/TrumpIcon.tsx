import React from 'react';

interface TrumpIconProps {
  className?: string;
  size?: number;
}

export const TrumpIcon: React.FC<TrumpIconProps> = ({ 
  className = "w-28 h-28", 
  size = 120 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hair Golden Glow */}
          <linearGradient id="trumpIconHairGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#fff59d" />
            <stop offset="25%" stopColor="#ffd54f" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Hair Top Sheen */}
          <linearGradient id="trumpIconHairSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fff9c4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          {/* Face Tanned Skin */}
          <linearGradient id="trumpIconSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffcc80" />
            <stop offset="40%" stopColor="#ffa726" />
            <stop offset="100%" stopColor="#fb8c00" />
          </linearGradient>

          {/* Under-Eye Concealer Glow */}
          <radialGradient id="trumpIconEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe0b2" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffa726" stopOpacity="0" />
          </radialGradient>

          {/* Navy Suit */}
          <linearGradient id="trumpIconSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#172554" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Signature Red Tie */}
          <linearGradient id="trumpIconTieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="trumpIconShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Circular Presidential Gold Border Frame */}
        <circle cx="80" cy="80" r="74" fill="#130924" stroke="url(#trumpIconHairGrad)" strokeWidth="4" filter="url(#trumpIconShadow)" />
        <circle cx="80" cy="80" r="70" fill="#1f1138" stroke="#78550a" strokeWidth="1.5" />

        {/* 1. Navy Presidential Suit & Shoulders */}
        <path
          d="M 28 150 C 35 125, 52 118, 80 118 C 108 118, 125 125, 132 150 Z"
          fill="url(#trumpIconSuitGrad)"
          stroke="#0f172a"
          strokeWidth="1.5"
        />

        {/* Suit Lapels */}
        <path d="M 52 118 L 68 150 L 58 150 Z" fill="#172554" />
        <path d="M 108 118 L 92 150 L 102 150 Z" fill="#172554" />

        {/* Gold American Flag Pin on Left Lapel */}
        <rect x="46" y="130" width="6" height="4.5" rx="1" fill="#dc2626" />
        <rect x="46" y="130" width="2.5" height="2.5" fill="#1d4ed8" />
        <circle cx="49" cy="132" r="4.5" fill="none" stroke="#ffd700" strokeWidth="0.8" />

        {/* 2. White Stiff Presidential Collar */}
        <polygon points="62,118 78,128 80,118" fill="#ffffff" />
        <polygon points="98,118 82,128 80,118" fill="#f1f5f9" />

        {/* 3. Signature Long Red Power Tie */}
        <polygon points="76,122 84,122 86,130 80,134 74,130" fill="#dc2626" />
        <polygon points="75,133 85,133 90,158 80,162 70,158" fill="url(#trumpIconTieGrad)" stroke="#7f1d1d" strokeWidth="1" />
        {/* Tie Silk Highlight Line */}
        <line x1="79" y1="135" x2="79" y2="158" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

        {/* 4. Head and Neck Base */}
        <path d="M 72 105 L 72 120 L 88 120 L 88 105 Z" fill="url(#trumpIconSkinGrad)" />

        {/* Full Face Contour */}
        <path
          d="M 50 65 C 48 90, 56 112, 80 114 C 104 112, 112 90, 110 65 C 110 45, 98 42, 80 42 C 62 42, 50 45, 50 65 Z"
          fill="url(#trumpIconSkinGrad)"
          stroke="#b45309"
          strokeWidth="1.2"
        />

        {/* Under-Eye Light Concealer Zones (Iconic Trump Feature) */}
        <ellipse cx="68" cy="74" rx="8" ry="4.5" fill="url(#trumpIconEyeGlow)" />
        <ellipse cx="92" cy="74" rx="8" ry="4.5" fill="url(#trumpIconEyeGlow)" />

        {/* Ears with natural curvature */}
        <path d="M 49 68 C 45 68, 45 80, 50 82 Z" fill="#ffa726" stroke="#b45309" strokeWidth="1" />
        <path d="M 111 68 C 115 68, 115 80, 110 82 Z" fill="#ffa726" stroke="#b45309" strokeWidth="1" />

        {/* 5. Charismatic Squinting Eyes & Brows */}
        {/* Left Brow - Expressive & Pointed */}
        <path
          d="M 58 66 Q 67 61, 75 66"
          fill="none"
          stroke="#d97706"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Right Brow */}
        <path
          d="M 85 66 Q 93 61, 102 66"
          fill="none"
          stroke="#d97706"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Confident Squint Eyes */}
        <path d="M 62 73 Q 68 70, 74 73" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="68" cy="73.5" r="1.5" fill="#1e3a8a" />
        <path d="M 63 76 Q 68 78, 73 76" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.6" />

        <path d="M 86 73 Q 92 70, 98 73" fill="none" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="92" cy="73.5" r="1.5" fill="#1e3a8a" />
        <path d="M 87 76 Q 92 78, 97 76" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.6" />

        {/* Prominent Sculpted Nose */}
        <path
          d="M 80 67 L 78 84 Q 80 87, 82 84 Z"
          fill="none"
          stroke="#b45309"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 75 84 Q 80 87, 85 84" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />

        {/* Iconic Animated Talking / Pout Mouth */}
        <ellipse cx="80" cy="95" rx="6.5" ry="3.5" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M 76 94 Q 80 93, 84 94" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 74 99 Q 80 102, 86 99" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />

        {/* Laugh / Nasolabial Lines */}
        <path d="M 63 80 Q 64 92, 70 98" fill="none" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
        <path d="M 97 80 Q 96 92, 90 98" fill="none" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />

        {/* 6. THE ICONIC GOLDEN COMB-OVER HAIR (Centerpiece) */}
        {/* Hair Volume Foundation (Back layer) */}
        <path
          d="M 45 60 C 42 35, 60 22, 85 22 C 112 22, 126 36, 124 58 C 122 70, 114 74, 114 74 C 114 74, 118 52, 102 44 C 88 38, 58 42, 45 60 Z"
          fill="#d97706"
        />

        {/* Main Sweeping Golden Comb-Over (Flows Left-to-Right with Grandeur) */}
        <path
          d="M 44 60 C 40 40, 52 26, 80 24 C 108 22, 128 32, 128 54 C 128 66, 120 72, 114 74 C 106 76, 104 62, 98 56 C 90 48, 65 48, 52 64 C 47 70, 44 68, 44 60 Z"
          fill="url(#trumpIconHairGrad)"
          stroke="#92400e"
          strokeWidth="1.5"
        />

        {/* Secondary Front Swoop Crest Over Forehead */}
        <path
          d="M 48 54 C 58 36, 88 34, 108 42 C 118 46, 124 56, 118 64 C 110 52, 92 46, 74 48 C 60 50, 52 56, 48 54 Z"
          fill="url(#trumpIconHairSheen)"
        />

        {/* Fine Feathered Comb Strands for Signature Styling */}
        <path d="M 56 38 Q 80 32, 104 40" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" strokeLinecap="round" />
        <path d="M 64 32 Q 88 28, 114 38" fill="none" stroke="#fff9c4" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
        <path d="M 72 26 Q 96 26, 122 42" fill="none" stroke="#fff59d" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />
        
        {/* Right Wing Fluff Accent (Signature Trump Silhouette) */}
        <path
          d="M 118 50 C 126 50, 130 58, 124 66 C 120 62, 120 54, 118 50 Z"
          fill="url(#trumpIconHairGrad)"
          stroke="#92400e"
          strokeWidth="1"
        />

        {/* Stars Accent */}
        <polygon points="26,45 28,50 33,50 29,53 31,58 26,55 21,58 23,53 19,50 24,50" fill="#ffd700" />
        <polygon points="134,45 136,50 141,50 137,53 139,58 134,55 129,58 131,53 127,50 132,50" fill="#ffd700" />
      </svg>
    </div>
  );
};
