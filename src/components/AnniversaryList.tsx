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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AnniversaryItem | null>(null);

  const anniversaries = useMemo(() => {
    const items: AnniversaryItem[] = [];
    const currentYear = currentMonth.getFullYear();

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
  }, [data, currentMonth]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const renderCalendar = () => {
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const rowCount = Math.ceil(calendarDays.length / 7);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-2 bg-white/50 p-2 rounded-lg border border-gold/20 shrink-0">
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

        <div 
          className="flex-1 grid grid-cols-7 gap-px bg-gold/20 border border-gold/20 rounded-lg overflow-hidden shadow-inner relative"
          style={{ gridTemplateRows: `auto repeat(${rowCount}, 1fr)` }}
        >
          {weekDays.map(day => (
            <div key={day} className="bg-[#fdfbf7] py-1.5 text-center text-[10px] font-bold text-[#4A4A4A]/60 uppercase tracking-wider border-b border-gold/10">
              {day}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayAnniversaries = anniversaries.filter(a => isSameDay(a.solarDate, day));
            const hasEvents = dayAnniversaries.length > 0;
            const solar = Solar.fromDate(day);
            const lunar = solar.getLunar();
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={idx} 
                className={cn(
                  "p-1 bg-white flex flex-col transition-all duration-200 border-b border-r border-gold/10 overflow-hidden",
                  isToday && "ring-2 ring-inset ring-amber-500/40",
                  hasEvents && isCurrentMonth && "bg-amber-50/60"
                )}
              >
                <div className="flex justify-between items-start mb-0.5 shrink-0">
                  <span className={cn(
                    "text-xs font-bold",
                    isCurrentMonth ? (hasEvents ? "text-[#7B1113]" : "text-[#4A4A4A]") : "text-gray-300"
                  )}>
                    {format(day, 'd')}
                  </span>
                  <span className={cn(
                    "text-[9px] font-medium",
                    isCurrentMonth ? "text-[#B8860B]" : "text-gray-300"
                  )}>
                    {lunar.getDay() === 1 ? `${lunar.getDay()}/${lunar.getMonth()}` : lunar.getDay()}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                  {dayAnniversaries.map((ann, aIdx) => (
                    <button 
                      key={aIdx}
                      onClick={() => setSelectedEvent(ann)}
                      className="w-full text-left text-[9px] leading-tight p-1 bg-[#7B1113] text-white rounded shadow-sm font-bold truncate border-l-2 border-gold/50 hover:bg-burgundy transition-colors"
                      title={ann.member.Hoten}
                    >
                      {ann.member.Hoten}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Event Detail Overlay */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-gold/50 p-6 max-w-sm w-full pointer-events-auto relative">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy mb-4">
                      <span className="text-2xl font-serif font-bold">{selectedEvent.member.Hoten.charAt(0)}</span>
                    </div>
                    <h4 className="font-serif text-xl font-bold text-burgundy mb-1">{selectedEvent.member.Hoten}</h4>
                    <p className="text-xs text-gold font-bold uppercase tracking-widest mb-4">Đời {selectedEvent.member.Doithu} • {selectedEvent.member.Loaithanhvien || 'Thành viên'}</p>
                    
                    <div className="w-full space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gold/10">
                        <span className="text-gray-500">Ngày giỗ (Dương)</span>
                        <span className="font-bold text-charcoal">{formatDate(selectedEvent.solarDate)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gold/10">
                        <span className="text-gray-500">Ngày giỗ (Âm)</span>
                        <span className="font-bold text-burgundy">{selectedEvent.lunarDateStr}</span>
                      </div>
                      {selectedEvent.member.HocVi_ChucVu && (
                        <div className="flex justify-between items-center py-2 border-b border-gold/10">
                          <span className="text-gray-500">Chức vụ/Học vị</span>
                          <span className="font-medium text-charcoal italic">{selectedEvent.member.HocVi_ChucVu}</span>
                        </div>
                      )}
                      <div className="pt-2 text-left">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Quan hệ gia đình</span>
                        <p className="text-xs text-charcoal/80 leading-relaxed italic">
                          {(() => {
                            const parents = getParents(selectedEvent.member);
                            return (parents.fatherName !== '...' || parents.motherName !== '...') 
                              ? `Con ông ${parents.fatherName} & bà ${parents.motherName}`
                              : 'Chưa cập nhật thông tin cha mẹ';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          initial={{ opacity: 0, y: '100%' }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full h-full bg-[#f9f6f0] shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
          
          <div className="p-4 border-b border-gold/20 flex justify-between items-center bg-white/50 relative z-10 shrink-0">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#7B1113] flex items-center gap-2">
                <CalendarIcon className="text-[#B8860B]" />
                Lịch Giỗ Chạp Tộc Họ ({currentMonth.getFullYear()})
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

          <div className="p-4 overflow-hidden relative z-10 flex-1 flex flex-col">
            {anniversaries.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-charcoal-light py-8">
                Không có dữ liệu ngày giỗ.
              </div>
            ) : (
              viewMode === 'list' ? (
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-gold/30 text-[#4A4A4A] font-serif">
                        <th className="py-3 px-4 font-bold">Ngày Dương ({currentMonth.getFullYear()})</th>
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
          
          <div className="p-2 bg-yellow-50/50 border-t border-gold/20 text-[10px] text-amber-800 italic text-center relative z-10 shrink-0">
            {viewMode === 'list' 
              ? "* Các dòng được tô màu vàng là những ngày giỗ sắp tới (trong vòng 15 ngày)."
              : "* Nhấn vào tên để xem chi tiết. Lịch hiển thị ngày Dương (số lớn) và ngày Âm (số nhỏ màu vàng)."}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

