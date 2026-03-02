import React from 'react';
import { User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SheetMember } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const normalizeDateString = (dateVal: string | number) => {
  if (!dateVal) return '';
  const dateStr = String(dateVal);
  
  if (dateStr.includes('T') && dateStr.includes('Z')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  
  return dateStr;
};

export const MemberCard = ({ member, isMain, onClick }: { member: SheetMember, isMain: boolean, onClick: () => void }) => {
  const isDeceased = !!member.NgayMat;
  const isMale = member.Gioitinh === 'Nam';
  
  const words = member.Hoten.split(' ');
  
  const ngaySinhNorm = normalizeDateString(member.NgaySinh);
  const ngayMatNorm = normalizeDateString(member.NgayMat);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center py-2 px-1 rounded-[2px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl z-10 w-[56px]",
        isMain ? "bg-[#D4AF37] border border-[#D4AF37]/80 shadow-md" : "bg-[#FDFDFD] border border-charcoal/10 shadow-md opacity-80 hover:opacity-100",
        isDeceased && isMain ? "opacity-90" : ""
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-full shadow-inner flex items-center justify-center mb-2 shrink-0",
        isMain ? "border border-white/40" : "border border-charcoal/10",
        isMale ? (isMain ? "bg-white/20 text-[#7B1113]" : "bg-blue-50 text-blue-700") : (isMain ? "bg-white/20 text-[#7B1113]" : "bg-rose-50 text-rose-700"),
        isDeceased && "grayscale opacity-80"
      )}>
        <User size={14} />
      </div>
      <div className={cn(
        "flex flex-col items-center font-serif text-[12px] leading-[1.0] text-center uppercase",
        isMain ? "text-[#7B1113] font-black" : "text-[#4A4A4A] font-semibold"
      )}>
        {words.map((word, idx) => (
          <span key={idx} className="block">{word}</span>
        ))}
      </div>

      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-max opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-[#1a1a1a]/95 backdrop-blur-md text-cream text-[11px] py-2.5 px-3.5 rounded-xl shadow-2xl z-[9999] flex flex-col gap-1 border border-gold/30 min-w-[160px]">
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border-r border-b border-gold/30 rotate-45"></div>
        <span className="font-serif font-black text-gold text-sm border-b border-gold/20 pb-1 mb-1">{member.Hoten}</span>
        <div className="flex items-center gap-2 text-white/90">
          <span className="font-bold">Đời {member.Doithu}</span>
          <span className="w-1 h-1 rounded-full bg-gold/40"></span>
          <span>{ngaySinhNorm ? (ngaySinhNorm.length === 4 ? ngaySinhNorm : ngaySinhNorm.split('/')[2]) : '???'} - {ngayMatNorm ? (ngayMatNorm.length === 4 ? ngayMatNorm : ngayMatNorm.split('/')[2]) : 'Hiện tại'}</span>
        </div>
        {member.HocVi_ChucVu && (
          <span className="text-gold/90 font-medium italic mt-0.5 leading-tight">{member.HocVi_ChucVu}</span>
        )}
        {member.Loaithanhvien && (
          <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">{member.Loaithanhvien}</span>
        )}
      </div>
    </div>
  );
};
