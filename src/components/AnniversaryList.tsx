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
  subMonths,
  addDays
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
  isPast: boolean;
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
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AnniversaryItem | null>(null);

  const anniversaries = useMemo(() => {
    const items: AnniversaryItem[] = [];
    const currentYear = 2026; // Cố định năm 2026 theo yêu cầu chung của dự án
    const today = new Date(2026, 2, 1); // 01/03/2026 theo reference time

    data.forEach(member => {
      if (member.NgayMat) {
        const parsed = parseLunarDate(member.NgayMat);
        if (parsed) {
          const solarDate = getAnniversarySolarDate(member.NgayMat, currentYear);
          if (solarDate) {
            const lunarDateStr = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}`;
            const isUpcoming = isWithinNextNDays(solarDate, 15);
            const isPast = solarDate < today && !isSameDay(solarDate, today);
            
            items.push({
              member,
              lunarDateStr,
              solarDate,
              isUpcoming,
              isPast
            });
          }
        }
      }
    });

    items.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
    return items;
  }, [data]);

  const renderCalendar = () => {
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const nextMonth = addMonths(currentMonth, 1);

    const renderMonth = (month: Date, showHeader: boolean = true) => {
      const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
      let end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
      let days = eachDayOfInterval({ start, end });
      
      if (days.length < 42) {
        end = addDays(end, 42 - days.length);
        days = eachDayOfInterval({ start, end });
      }
      
      const rowCount = 6;

      return (
        <div className="flex flex-col h-full overflow-hidden">
          {showHeader && (
            <div className="flex items-center justify-between mb-2 bg-white/50 p-2 rounded-lg border border-gold/20 shrink-0">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 hover:bg-gold/10 rounded-full transition-colors"
              >
                <ChevronLeft size={20} className="text-[#7B1113]" />
              </button>
              <h3 className="font-serif font-bold text-lg text-[#7B1113] capitalize">
                Tháng {format(month, 'MM/yyyy', { locale: vi })}
              </h3>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 hover:bg-gold/10 rounded-full transition-colors"
              >
                <ChevronRight size={20} className="text-[#7B1113]" />
              </button>
            </div>
          )}
          {!showHeader && (
            <div className="flex items-center justify-center mb-2 bg-white/50 p-2 rounded-lg border border-gold/20 shrink-0">
              <h3 className="font-serif font-bold text-lg text-[#7B1113] capitalize">
                Tháng {format(month, 'MM/yyyy', { locale: vi })}
              </h3>
            </div>
          )}

          <div 
            className="flex-1 grid grid-cols-7 gap-px bg-gold/20 border border-gold/20 rounded-lg overflow-hidden shadow-inner relative"
            style={{ gridTemplateRows: `auto repeat(${rowCount}, 1fr)` }}
          >
            {weekDays.map(day => (
              <div key={day} className="bg-[#fdfbf7] py-1.5 text-center text-[10px] font-bold text-[#4A4A4A]/60 uppercase tracking-wider border-b border-gold/10">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, month);
              const dayAnniversaries = anniversaries.filter(a => isSameDay(a.solarDate, day));
              const hasEvents = dayAnniversaries.length > 0;
              const solar = Solar.fromDate(day);
              const lunar = solar.getLunar();
              const isToday = isSameDay(day, new Date(2026, 2, 1));

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
                        className={cn(
                          "w-full text-left text-[9px] leading-tight p-1 text-white rounded shadow-sm font-bold truncate border-l-2 border-gold/50 transition-colors",
                          ann.isPast ? "bg-gray-400 hover:bg-gray-500" : "bg-[#7B1113] hover:bg-burgundy"
                        )}
                        title={ann.member.Hoten}
                      >
                        {ann.member.Hoten}
                      </button>
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
      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
        <div className="flex-1 h-full overflow-hidden">
          {renderMonth(currentMonth)}
        </div>
        <div className="hidden md:flex flex-1 h-full overflow-hidden border-l border-gold/20 pl-6">
          {renderMonth(nextMonth, false)}
        </div>

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
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                    selectedEvent.isPast ? "bg-gray-100 text-gray-400" : "bg-burgundy/10 text-burgundy"
                  )}>
                    <span className="text-2xl font-serif font-bold">{selectedEvent.member.Hoten.charAt(0)}</span>
                  </div>
                  <h4 className={cn("font-serif text-xl font-bold mb-1", selectedEvent.isPast ? "text-gray-500" : "text-burgundy")}>{selectedEvent.member.Hoten}</h4>
                  <p className="text-xs text-gold font-bold uppercase tracking-widest mb-4">Đời {selectedEvent.member.Doithu} • {selectedEvent.member.Loaithanhvien || 'Thành viên'}</p>
                  
                  <div className="w-full space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gold/10">
                      <span className="text-gray-500">Ngày giỗ (Dương)</span>
                      <span className="font-bold text-charcoal">{formatDate(selectedEvent.solarDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gold/10">
                      <span className="text-gray-500">Ngày giỗ (Âm)</span>
                      <span className={cn("font-bold", selectedEvent.isPast ? "text-gray-500" : "text-burgundy")}>{selectedEvent.lunarDateStr}</span>
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
                Lịch Giỗ Chạp Tộc Họ (2026)
              </h2>
              <div className="flex bg-gold/10 p-1 rounded-lg border border-gold/20">
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all",
                    viewMode === 'timeline' ? "bg-white text-[#7B1113] shadow-sm" : "text-[#4A4A4A]/60 hover:text-[#7B1113]"
                  )}
                >
                  <List size={14} /> Dòng thời gian
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
              viewMode === 'timeline' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 sm:px-10 py-6">
                  <div className="max-w-4xl mx-auto relative before:absolute before:left-4 sm:before:left-1/2 sm:before:-translate-x-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gold/20">
                    {anniversaries.map((item, index) => {
                      const parents = getParents(item.member);
                      const relationStr = (parents.fatherName !== '...' || parents.motherName !== '...') 
                        ? `Con ông ${parents.fatherName} & bà ${parents.motherName}`
                        : 'Chưa cập nhật';
                      
                      const isEven = index % 2 === 0;

                      return (
                          <motion.div 
                            key={`${item.member.ID}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "relative mb-12 flex flex-col sm:flex-row items-start sm:items-center w-full transition-opacity duration-500",
                              isEven ? "sm:flex-row" : "sm:flex-row-reverse",
                              item.isPast && "opacity-40 grayscale-[0.4]"
                            )}
                          >
                          {/* Timeline Dot */}
                          <div className={cn(
                            "absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-0 sm:top-1/2 sm:-translate-y-1/2 w-8 h-8 rounded-full border-4 border-[#f9f6f0] z-10 shadow-md flex items-center justify-center",
                            item.isUpcoming ? "bg-amber-500 animate-pulse" : "bg-burgundy"
                          )}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>

                          {/* Date Label (Desktop) */}
                          <div className={cn(
                            "hidden sm:flex flex-col w-[45%] px-8",
                            isEven ? "text-right" : "text-left"
                          )}>
                            <div className="text-lg font-serif font-bold text-burgundy">{formatDate(item.solarDate)}</div>
                            <div className="text-sm text-gold font-medium">Âm lịch: {item.lunarDateStr}</div>
                          </div>

                          {/* Card */}
                          <div className={cn(
                            "w-full sm:w-[45%] pl-12 sm:pl-0",
                            !isEven && "sm:pr-0"
                          )}>
                            <div className={cn(
                              "p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md",
                              item.isUpcoming 
                                ? "bg-amber-50 border-amber-200 ring-1 ring-amber-500/20" 
                                : "bg-white border-gold/10"
                            )}>
                              <div className="sm:hidden mb-3">
                                <div className="text-sm font-bold text-burgundy">{formatDate(item.solarDate)}</div>
                                <div className="text-[10px] text-gold font-bold uppercase tracking-widest">Âm lịch: {item.lunarDateStr}</div>
                              </div>

                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-serif text-lg font-bold text-charcoal leading-tight uppercase tracking-wide">
                                  {item.member.Hoten}
                                </h3>
                                {item.isUpcoming && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1 shrink-0">
                                    <AlertCircle size={10} />
                                    Gần kề
                                  </span>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                  <span>Đời {item.member.Doithu}</span>
                                  <span className="w-1 h-1 rounded-full bg-gold/40" />
                                  <span>{item.member.Loaithanhvien || 'Thành viên'}</span>
                                </div>
                                <div className="text-xs text-charcoal/80 leading-relaxed bg-charcoal/5 p-3 rounded-xl border-l-4 border-gold/30 italic">
                                  <span className="text-[9px] font-bold text-gold uppercase block mb-1 not-italic">Quan hệ:</span>
                                  {relationStr}
                                </div>
                                {item.member.HocVi_ChucVu && (
                                  <div className="text-[10px] text-burgundy font-bold uppercase tracking-tighter">
                                    {item.member.HocVi_ChucVu}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                renderCalendar()
              )
            )}
          </div>
          
          <div className="p-2 bg-yellow-50/50 border-t border-gold/20 text-[10px] text-amber-800 italic text-center relative z-10 shrink-0">
            {viewMode === 'timeline' 
              ? "* Dòng thời gian hiển thị tất cả ngày giỗ trong năm 2026. Các mục màu vàng là ngày giỗ sắp tới (trong vòng 15 ngày). Các mục mờ là đã qua."
              : "* Nhấn vào tên để xem chi tiết. Lịch hiển thị ngày Dương (số lớn) và ngày Âm (số nhỏ màu vàng). Trên máy tính hiển thị 2 tháng liên tiếp."}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

