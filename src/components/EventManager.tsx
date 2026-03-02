import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Info, AlertCircle, Flower2, Star } from 'lucide-react';
import { SheetMember, ClanEvent } from '../types';
import { getEventDate, formatDate, parseLunarDate, isWithinNextNDays } from '../utils/lunar-tool';
import { isSameDay } from 'date-fns';
import { cn } from '../utils/cn';

type TimelineEvent = {
  id: string;
  title: string;
  solarDate: Date;
  lunarDateStr: string;
  type: 'anniversary' | 'clan_event';
  category: string;
  note: string;
  isUpcoming: boolean;
  isPast: boolean;
};

export const EventManager = ({ 
  data, 
  events, 
  onClose 
}: { 
  data: SheetMember[]; 
  events: ClanEvent[]; 
  onClose: () => void;
}) => {
  const timeline = useMemo(() => {
    const items: TimelineEvent[] = [];
    const referenceDate = new Date(2026, 2, 1); // 01/03/2026 theo yêu cầu

    // 1. Xử lý Ngày Giỗ từ danh sách thành viên
    data.forEach(member => {
      if (member.NgayMat) {
        const solarDate = getEventDate(member.NgayMat, true);
        if (solarDate) {
          const parsed = parseLunarDate(member.NgayMat);
          const lunarStr = parsed ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}` : '...';
          
          // Tính isUpcoming dựa trên referenceDate
          const diffTime = solarDate.getTime() - referenceDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isUpcoming = diffDays >= 0 && diffDays <= 15;
          const isPast = solarDate < referenceDate && !isSameDay(solarDate, referenceDate);

          items.push({
            id: `ann-${member.ID}`,
            title: `Ngày giỗ: ${member.Hoten}`,
            solarDate,
            lunarDateStr: lunarStr,
            type: 'anniversary',
            category: `Đời ${member.Doithu}`,
            note: member.Tieusungan || 'Tưởng nhớ người đã khuất.',
            isUpcoming,
            isPast
          });
        }
      }
    });

    // 2. Xử lý Sự kiện Tộc họ từ Tab Event
    events.forEach(event => {
      if (event.NgayDienRa) {
        const solarDate = getEventDate(event.NgayDienRa, event.isLunar);
        if (solarDate) {
          const parsed = parseLunarDate(event.NgayDienRa);
          const lunarStr = event.isLunar && parsed 
            ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}` 
            : '---';

          const diffTime = solarDate.getTime() - referenceDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isUpcoming = diffDays >= 0 && diffDays <= 15;
          const isPast = solarDate < referenceDate && !isSameDay(solarDate, referenceDate);

          items.push({
            id: `event-${event.ID}`,
            title: event.TenSuKien,
            solarDate,
            lunarDateStr: lunarStr,
            type: 'clan_event',
            category: event.LoaiSuKien === 'CoDinh' ? 'Cố định' : event.LoaiSuKien === 'LinhHoat' ? 'Linh hoạt' : 'Giỗ',
            note: event.GhiChu,
            isUpcoming,
            isPast
          });
        }
      }
    });

    // Sắp xếp theo trình tự thời gian
    return items.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
  }, [data, events]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-[#f9f6f0] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gold/30 flex flex-col h-[85vh]"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
          
          <div className="p-6 border-b border-gold/20 flex justify-between items-center bg-white/50 relative z-10">
            <h2 className="font-serif text-2xl font-bold text-burgundy flex items-center gap-3">
              <Calendar className="text-gold" />
              Sự kiện & Giỗ chạp 2026
            </h2>
            <button onClick={onClose} className="p-2 text-charcoal-light hover:text-burgundy transition-colors bg-white/80 rounded-full shadow-sm">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-charcoal-light">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="italic">Chưa có sự kiện nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gold/20">
                {timeline.map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "relative pl-12 transition-opacity duration-500",
                      event.isPast && "opacity-40 grayscale-[0.4]"
                    )}
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-[#f9f6f0] flex items-center justify-center z-10 shadow-sm",
                      event.type === 'anniversary' ? "bg-burgundy text-white" : "bg-gold text-white"
                    )}>
                      {event.type === 'anniversary' ? <Flower2 size={16} /> : <Star size={16} />}
                    </div>

                    <div className={cn(
                      "p-4 rounded-xl border transition-all duration-300",
                      event.isUpcoming 
                        ? "bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-500/20" 
                        : "bg-white border-gold/10 shadow-sm hover:shadow-md"
                    )}>
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                        <div className="flex flex-col">
                          <h3 className={cn(
                            "font-serif text-lg font-bold leading-tight",
                            event.type === 'anniversary' ? "text-burgundy" : "text-amber-900"
                          )}>
                            {event.title}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80 mt-1">
                            {event.category}
                          </span>
                        </div>
                        {event.isUpcoming && (
                          <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full animate-pulse flex items-center gap-1">
                            <AlertCircle size={10} />
                            Sắp diễn ra
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-gold shrink-0" />
                          <span className="text-charcoal font-medium">{formatDate(event.solarDate)}</span>
                          <span className="text-[10px] text-charcoal-light">(Dương)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-gold shrink-0" />
                          <span className="text-charcoal font-medium">{event.lunarDateStr}</span>
                          <span className="text-[10px] text-charcoal-light">(Âm)</span>
                        </div>
                      </div>

                      {event.note && (
                        <div className="text-xs text-charcoal-light italic bg-charcoal/5 p-2 rounded-lg border-l-2 border-gold/30">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white/50 border-t border-gold/20 text-[10px] text-charcoal-light italic text-center relative z-10">
            * Danh sách bao gồm Ngày Giỗ thành viên và các Sự kiện chung của Tộc họ trong năm 2026. Các mục mờ là sự kiện đã diễn ra.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
