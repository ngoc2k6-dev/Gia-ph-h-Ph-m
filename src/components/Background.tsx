import React from 'react';

export const Background = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F4EBD0]">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("/image_3.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/rice-paper-2.png")`,
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};
