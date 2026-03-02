import React from 'react';

export const SideDecor = () => {
  const leftCouplet = ['MỘC', 'BẢN', 'THỦY', 'NGUYÊN'];
  const rightCouplet = ['BÁCH', 'THẾ', 'BẢN', 'CHI'];

  const WoodSquare = ({ char }: { char: string, key?: React.Key }) => (
    <div className="group relative w-14 h-14 flex items-center justify-center">
      {/* Outer wooden frame */}
      <div className="absolute inset-0 bg-black rounded-sm shadow-lg border-2 border-[#1a1a1a] transform rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>
      {/* Inner carved area */}
      <div className="absolute inset-1.5 bg-[#111111] rounded-sm border border-black shadow-inner flex items-center justify-center">
        {/* Wood grain texture overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>
        <span className="relative text-[#e6c280] font-serif font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10">
          {char}
        </span>
      </div>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#d4af37]/40"></div>
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#d4af37]/40"></div>
    </div>
  );

  return (
    <>
      <div className="fixed left-6 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden lg:flex flex-col items-center justify-center opacity-90">
        <div className="flex flex-col items-center gap-6">
          {leftCouplet.map((char, idx) => (
            <WoodSquare key={idx} char={char} />
          ))}
        </div>
      </div>
      
      <div className="fixed right-6 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden lg:flex flex-col items-center justify-center opacity-90">
        <div className="flex flex-col items-center gap-6">
          {rightCouplet.map((char, idx) => (
            <WoodSquare key={idx} char={char} />
          ))}
        </div>
      </div>
    </>
  );
};
