import React from 'react';

export const DragonHeader = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-28 pointer-events-none z-10 flex justify-center overflow-hidden opacity-95">
      <div className="relative w-full max-w-5xl h-full flex items-start justify-center pt-1">
        <svg viewBox="0 0 800 120" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6c280" />
              <stop offset="50%" stopColor="#fff8dc" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
            <linearGradient id="bronze-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a2e1b" />
              <stop offset="50%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#2a1810" />
            </linearGradient>
            <filter id="text-emboss" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
              <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor="#ffffff" result="specOut">
                <fePointLight x="-5000" y="-10000" z="20000"/>
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.7"/>
            </filter>
          </defs>
          
          <text x="400" y="75" fontFamily="serif" fontSize="44" fontWeight="900" fill="#7B1113" textAnchor="middle" letterSpacing="8" filter="url(#text-emboss)">
            GIA PHẢ HỌ PHẠM
          </text>
        </svg>
      </div>
    </div>
  );
};
