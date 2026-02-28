import React from 'react';
import { User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SheetMember } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MemberCard = ({ member, isMain, onClick }: { member: SheetMember, isMain: boolean, onClick: () => void }) => {
  const isDeceased = !!member.NgayMat;
  const isMale = member.Gioitinh === 'Nam';
  
  const words = member.Hoten.split(' ');
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center py-2 px-1 rounded-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md z-10 w-[56px]",
        isMain ? "bg-[#f4e8c1] border border-gold/60 shadow-sm" : "bg-[#f9f6f0] border border-charcoal/5 shadow-sm opacity-60 hover:opacity-100",
        isDeceased && isMain ? "opacity-80" : ""
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-full shadow-inner flex items-center justify-center mb-2 shrink-0",
        isMain ? "border border-gold" : "border border-charcoal/10",
        isMale ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700",
        isDeceased && "grayscale opacity-70"
      )}>
        <User size={14} />
      </div>
      <div className={cn(
        "flex flex-col items-center font-serif text-[12px] leading-tight text-center uppercase",
        isMain ? "text-burgundy font-black" : "text-charcoal-light font-semibold"
      )}>
        {words.map((word, idx) => (
          <span key={idx} className="block">{word}</span>
        ))}
      </div>

      {/* Tooltip */}
      <div className="absolute left-full top-0 ml-2 w-max opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-charcoal/95 backdrop-blur text-cream text-[10px] py-1.5 px-2.5 rounded shadow-lg z-50 flex flex-col gap-0.5 border border-gold/20">
        <span className="font-bold text-gold text-xs">{member.Hoten}</span>
        <span>{member.NgaySinh ? (String(member.NgaySinh).length === 4 ? member.NgaySinh : String(member.NgaySinh).split('/')[2]) : '???'} - {member.NgayMat ? (String(member.NgayMat).length === 4 ? member.NgayMat : String(member.NgayMat).split('/')[2]) : 'Hiện tại'}</span>
        {member.HocVi_ChucVu && <span className="text-[#b8860b] font-semibold mt-0.5">{member.HocVi_ChucVu}</span>}
      </div>
    </div>
  );
};
