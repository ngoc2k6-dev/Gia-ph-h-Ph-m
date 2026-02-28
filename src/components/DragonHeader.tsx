import React from 'react';

export const DragonHeader = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-32 pointer-events-none z-0 flex justify-center overflow-hidden opacity-80">
      <div className="relative w-full max-w-4xl h-full flex items-start justify-center pt-2">
        <svg viewBox="0 0 800 120" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#fff8dc" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            <filter id="emboss">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8b4513" floodOpacity="0.5"/>
            </filter>
          </defs>
          
          <path d="M 150,60 Q 250,10 400,20 Q 550,10 650,60" fill="none" stroke="url(#gold-grad)" strokeWidth="4" filter="url(#emboss)"/>
          
          <g transform="translate(150, 60) scale(0.6)">
            <path d="M 0,0 C -30,-40 -80,-20 -100,10 C -120,40 -80,80 -40,60 C -10,45 -20,10 0,0 Z" fill="none" stroke="url(#gold-grad)" strokeWidth="3"/>
            <circle cx="-60" cy="20" r="5" fill="#b8860b"/>
            <path d="M -20,-10 Q -40,-30 -60,-10" fill="none" stroke="url(#gold-grad)" strokeWidth="2"/>
          </g>
          
          <g transform="translate(650, 60) scale(0.6) scale(-1, 1)">
            <path d="M 0,0 C -30,-40 -80,-20 -100,10 C -120,40 -80,80 -40,60 C -10,45 -20,10 0,0 Z" fill="none" stroke="url(#gold-grad)" strokeWidth="3"/>
            <circle cx="-60" cy="20" r="5" fill="#b8860b"/>
            <path d="M -20,-10 Q -40,-30 -60,-10" fill="none" stroke="url(#gold-grad)" strokeWidth="2"/>
          </g>

          <g transform="translate(400, 50)">
            <circle cx="0" cy="0" r="25" fill="url(#gold-grad)" filter="url(#emboss)"/>
            <circle cx="0" cy="0" r="18" fill="#8b4513"/>
            <circle cx="0" cy="0" r="12" fill="url(#gold-grad)"/>
            <path d="M -30,0 Q 0,-30 30,0 Q 0,30 -30,0" fill="none" stroke="url(#gold-grad)" strokeWidth="2"/>
          </g>

          <text x="400" y="105" fontFamily="serif" fontSize="28" fontWeight="bold" fill="#8b4513" textAnchor="middle" letterSpacing="6" filter="url(#emboss)">
            GIA PHẢ HỌ PHẠM
          </text>
        </svg>
      </div>
    </div>
  );
};
