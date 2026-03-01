import React from 'react';

export const Background = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#F4EBD0]">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply'
        }}
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] flex items-center justify-center">
        <svg viewBox="0 0 500 500" className="w-full h-full animate-[spin_120s_linear_infinite]">
          <circle cx="250" cy="250" r="240" fill="none" stroke="#8b4513" strokeWidth="2" strokeDasharray="10 5"/>
          <circle cx="250" cy="250" r="220" fill="none" stroke="#8b4513" strokeWidth="4"/>
          <circle cx="250" cy="250" r="200" fill="none" stroke="#8b4513" strokeWidth="1"/>
          
          {[...Array(12)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 30} 250 250)`}>
              <path d="M 250,50 L 260,30 L 240,30 Z" fill="#8b4513"/>
              <circle cx="250" cy="70" r="5" fill="#8b4513"/>
            </g>
          ))}
          
          <circle cx="250" cy="250" r="150" fill="none" stroke="#8b4513" strokeWidth="2"/>
          
          <path d="M 250,150 L 320,300 L 180,300 Z" fill="none" stroke="#8b4513" strokeWidth="2"/>
          <path d="M 250,350 L 320,200 L 180,200 Z" fill="none" stroke="#8b4513" strokeWidth="2"/>
          
          <circle cx="250" cy="250" r="50" fill="none" stroke="#8b4513" strokeWidth="4"/>
          <circle cx="250" cy="250" r="20" fill="#8b4513"/>
        </svg>
      </div>
    </div>
  );
};
