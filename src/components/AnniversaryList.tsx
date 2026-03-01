import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, AlertCircle, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Solar } from 'lunar-javascript';
import { SheetMember } from '../types';
import { getAnniversarySolarDate, parseLunarDate, formatDate, isWithinNextNDays } from '../utils/lunar-tool';
import { cn } from '../utils/cn';

type AnniversaryItem = {
  member: SheetMember;
  lunarDateStr: string;
  solarDate: Date;
  isUpcoming: boolean;
};

export const AnniversaryList = ({ 
  data, 
  onClose,
  getParents
}: { 
  data: SheetMember[]; 
  onClose: () => void;
  getParents: (member: SheetMember) => { fatherName: string, motherName: string };
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // Mặc định tháng 3/2026

  const anniversaries = useMemo(() => {
    const items: AnniversaryItem[] = [];
    const currentYear = 2026;

    data.forEach(member => {
      if (member.NgayMat) {
        const parsed = parseLunarDate(member.NgayMat);
        if (parsed) {
          const solarDate = getAnniversarySolarDate(member.NgayMat, currentYear);
          if (solarDate) {
            const lunarDateStr = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}`;
            const isUpcoming = isWithinNextNDays(solarDate, 15);
            
            items.push({
              member,
              lunarDateStr,
              solarDate,
              isUpcoming
            });
          }
        }
      }
    });

    items.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
    return items;
  }, [data]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const renderCalendar = () => {
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 bg-white/50 p-2 rounded-lg border border-gold/20">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gold/10 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-[#7B1113]" />
          </button>
          <h3 className="font-serif font-bold text-lg text-[#7B1113] capitalize">
            Tháng {format(currentMonth, 'MM/yyyy', { locale: vi })}
          </h3>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gold/10 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="text-[#7B1113]" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gold/20 border border-gold/20 rounded-lg overflow-hidden shadow-inner">
          {weekDays.map(day => (
            <div key={day} className="bg-[#fdfbf7] py-2 text-center text-[10px] font-bold text-[#4A4A4A]/60 uppercase tracking-wider">
              {day}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayAnniversaries = anniversaries.filter(a => isSameDay(a.solarDate, day));
            const solar = Solar.fromDate(day);
            const lunar = solar.getLunar();
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[80px] p-1 bg-white flex flex-col transition-all duration-200",
                  !isCurrentMonth && "bg-gray-50/50 opacity-40",
                  isToday && "ring-1 ring-inset ring-amber-500 bg-amber-50/30"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-xs font-bold",
                    isCurrentMonth ? "text-[#4A4A4A]" : "text-gray-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-[9px] text-[#B8860B] font-medium">
                    {lunar.getDay() === 1 ? `${lunar.getDay()}/${lunar.getMonth()}` : lunar.getDay()}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                  {dayAnniversaries.map((ann, aIdx) => (
                    <div 
                      key={aIdx}
                      className="text-[9px] leading-tight p-1 bg-[#7B1113]/10 text-[#7B1113] rounded border-l-2 border-[#7B1113] font-medium truncate"
                      title={ann.member.Hoten}
                    >
                      {ann.member.Hoten}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#f9f6f0] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gold/30 max-h-[90vh] flex flex-col"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
          
          <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-white/50 relative z-10">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-2xl font-bold text-[#7B1113] flex items-center gap-2">
                <CalendarIcon className="text-[#B8860B]" />
                Lịch Giỗ Chạp Tộc Họ (2026)
              </h2>
              <div className="flex bg-gold/10 p-1 rounded-lg border border-gold/20">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all",
                    viewMode === 'list' ? "bg-white text-[#7B1113] shadow-sm" : "text-[#4A4A4A]/60 hover:text-[#7B1113]"
                  )}
                >
                  <List size={14} /> Danh sách
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all",
                    viewMode === 'calendar' ? "bg-white text-[#7B1113] shadow-sm" : "text-[#4A4A4A]/60 hover:text-[#7B1113]"
                  )}
                >
                  <CalendarIcon size={14} /> Lịch tháng
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-charcoal-light hover:text-burgundy transition-colors bg-white/80 rounded-full shadow-sm">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto relative z-10 flex-1 custom-scrollbar">
            {anniversaries.length === 0 ? (
              <div className="text-center text-charcoal-light py-8">
                Không có dữ liệu ngày giỗ.
              </div>
            ) : (
              viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gold/30 text-[#4A4A4A] font-serif">
                        <th className="py-3 px-4 font-bold">Ngày Dương (2026)</th>
                        <th className="py-3 px-4 font-bold">Ngày Âm</th>
                        <th className="py-3 px-4 font-bold">Họ tên người quá cố</th>
                        <th className="py-3 px-4 font-bold">Quan hệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anniversaries.map((item, index) => {
                        const parents = getParents(item.member);
                        const relationStr = (parents.fatherName !== '...' || parents.motherName !== '...') 
                          ? `Con ông ${parents.fatherName} & bà ${parents.motherName}`
                          : 'Chưa cập nhật';

                        return (
                          <tr 
                            key={`${item.member.ID}-${index}`}
                            className={cn(
                              "border-b border-gold/10 transition-colors",
                              item.isUpcoming ? "bg-yellow-100/80" : "hover:bg-white/40"
                            )}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {item.isUpcoming && <AlertCircle size={14} className="text-amber-600 animate-pulse" />}
                                <span className={cn("font-medium", item.isUpcoming ? "text-amber-800" : "text-[#4A4A4A]")}>
                                  {formatDate(item.solarDate)}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#B8860B] font-medium">
                              {item.lunarDateStr}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#4A4A4A]">{item.member.Hoten}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#4A4A4A]/70 italic">
                              {relationStr}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                renderCalendar()
              )
            )}
          </div>
          
          <div className="p-4 bg-yellow-50/50 border-t border-gold/20 text-[10px] text-amber-800 italic text-center relative z-10">
            {viewMode === 'list' 
              ? "* Các dòng được tô màu vàng là những ngày giỗ sắp tới (trong vòng 15 ngày)."
              : "* Nhấn vào các mũi tên để chuyển tháng. Lịch hiển thị ngày Dương (số lớn) và ngày Âm (số nhỏ màu vàng)."}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

