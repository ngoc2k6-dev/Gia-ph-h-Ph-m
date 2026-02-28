import React from 'react';

export const SideDecor = () => {
  return (
    <>
      <div className="fixed left-4 top-1/2 -translate-y-1/2 w-16 h-[80vh] pointer-events-none z-0 hidden lg:flex flex-col items-center justify-between opacity-40">
        <div className="w-8 h-32 border-l-2 border-t-2 border-gold/40 rounded-tl-full" />
        <div className="writing-vertical-rl text-burgundy font-serif font-bold text-xl tracking-[0.5em] drop-shadow-sm">
          MỘC BẢN THỦY NGUYÊN
        </div>
        <div className="w-8 h-32 border-l-2 border-b-2 border-gold/40 rounded-bl-full" />
      </div>
      
      <div className="fixed right-4 top-1/2 -translate-y-1/2 w-16 h-[80vh] pointer-events-none z-0 hidden lg:flex flex-col items-center justify-between opacity-40">
        <div className="w-8 h-32 border-r-2 border-t-2 border-gold/40 rounded-tr-full" />
        <div className="writing-vertical-rl text-burgundy font-serif font-bold text-xl tracking-[0.5em] drop-shadow-sm">
          BÁCH THẾ BẢN CHI
        </div>
        <div className="w-8 h-32 border-r-2 border-b-2 border-gold/40 rounded-br-full" />
      </div>
    </>
  );
};
