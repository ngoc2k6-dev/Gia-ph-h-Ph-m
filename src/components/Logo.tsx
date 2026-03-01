import React from 'react';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          {/* Outer Circle - Bronze/Gold with gradient */}
          <defs>
            <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFF8DC" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
            <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <circle cx="50" cy="50" r="46" stroke="url(#logo-gold)" strokeWidth="2.5" fill="#FDFBF7" />
          <circle cx="50" cy="50" r="42" stroke="#8B4513" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
          
          {/* Stylized Tree - Burgundy */}
          <g filter="url(#logo-shadow)">
            <path 
              d="M50 22C50 22 32 38 32 54C32 63.9411 40.0589 72 50 72C59.9411 72 68 63.9411 68 54C68 38 50 22 50 22Z" 
              fill="#7B1113" 
            />
            <path 
              d="M50 72V82M42 82H58" 
              stroke="#5A3A26" 
              strokeWidth="4" 
              strokeLinecap="round" 
            />
            {/* Inner Detail */}
            <path 
              d="M50 35L58 48H42L50 35Z" 
              fill="#D4AF37" 
              fillOpacity="0.8"
            />
            <circle cx="50" cy="54" r="6" fill="#D4AF37" fillOpacity="0.6" />
          </g>
        </svg>
        {/* Decorative corner dots */}
        <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-gold/40"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-gold/40"></div>
      </div>
      <div className="flex flex-col leading-tight">
        <h1 className="font-serif font-black text-burgundy text-xl tracking-tight">PHẠM GIA</h1>
        <div className="flex items-center gap-1.5">
          <div className="h-[1px] w-3 bg-gold/60"></div>
          <span className="text-[9px] text-gold font-bold tracking-[0.25em] uppercase">Tộc Phả Trường Tồn</span>
          <div className="h-[1px] w-3 bg-gold/60"></div>
        </div>
      </div>
    </div>
  );
};
