import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, MapPin, Phone, Heart, Flower2 } from 'lucide-react';
import { Lunar } from 'lunar-javascript';
import { SheetMember } from '../types';

const formatSolarDate = (dateVal: string | number) => {
  if (!dateVal) return '';
  const dateStr = String(dateVal);
  if (dateStr.length === 4) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return dateStr;
};

const getDeathDates = (ngayMatVal: string | number, loaiNgayMat: string) => {
  if (!ngayMatVal) return { am: '', duong: '' };
  const ngayMat = String(ngayMatVal);
  if (ngayMat.length === 4) return { am: ngayMat, duong: ngayMat }; // Chỉ có năm
  
  const parts = ngayMat.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (loaiNgayMat === 'Âm') {
      try {
        const lunar = Lunar.fromYmd(year, month, day);
        const solar = lunar.getSolar();
        return {
          am: `${day}/${month}/${year}`,
          duong: `${solar.getDay()}/${solar.getMonth()}/${solar.getYear()}`
        };
      } catch (e) {
        return { am: ngayMat, duong: 'Không rõ' };
      }
    } else {
      try {
        // Giả sử là Dương lịch, chuyển sang Âm lịch
        const lunar = Lunar.fromDate(new Date(year, month - 1, day));
        return {
          am: `${lunar.getDay()}/${lunar.getMonth()}/${lunar.getYear()}`,
          duong: `${day}/${month}/${year}`
        };
      } catch (e) {
        return { am: 'Không rõ', duong: ngayMat };
      }
    }
  }
  return { am: ngayMat, duong: ngayMat };
};

export const MemberModal = ({ 
  member, 
  onClose,
  fatherName,
  motherName,
  spouseName
}: { 
  member: SheetMember | null; 
  onClose: () => void;
  fatherName: string;
  motherName: string;
  spouseName: string;
}) => {
  if (!member) return null;
  const isDeceased = !!member.NgayMat;
  const deathDates = isDeceased ? getDeathDates(member.NgayMat, member.LoaiNgayMat) : { am: '', duong: '' };

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
          className="relative w-full max-w-md bg-[#f9f6f0] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gold/30 max-h-[90vh] flex flex-col"
        >
          {/* Nền giấy mờ */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
          
          <div className="p-6 overflow-y-auto relative z-10">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-charcoal-light hover:text-burgundy transition-colors bg-white/50 rounded-full">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-cream shadow-inner flex items-center justify-center text-burgundy mb-4 border border-gold/20">
                <User size={40} className={isDeceased ? "opacity-50 grayscale" : ""} />
              </div>
              
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-1 uppercase">{member.Hoten}</h2>
              
              <p className="text-xs font-medium text-burgundy uppercase tracking-widest mb-2 mt-2">
                Đời thứ {member.Doithu} • {member.Loaithanhvien || 'Thành viên'}
              </p>

              <p className="text-sm text-charcoal-light italic mb-4">
                Con thứ {member.ThuTuCon || '?'} của ông {fatherName} và bà {motherName}
              </p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />

              <div className="w-full text-left space-y-4">
                
                {/* Giới tính & Ngày sinh */}
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-gold/10">
                  <User size={18} className="text-gold shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-light uppercase tracking-wider font-bold">Giới tính</p>
                    <p className="text-sm text-charcoal font-medium">{member.Gioitinh}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-gold/10">
                  <Calendar size={18} className="text-gold shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-light uppercase tracking-wider font-bold">Ngày sinh</p>
                    <p className="text-sm text-charcoal font-medium">{formatSolarDate(member.NgaySinh) || 'Không rõ'}</p>
                  </div>
                </div>

                {/* Ngày mất / Ngày giỗ */}
                {isDeceased && (
                  <div className="flex items-start gap-3 bg-red-50/50 p-3 rounded-xl border border-red-200/50">
                    <Flower2 size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-400 uppercase tracking-wider font-bold">Ngày mất (Ngày giỗ)</p>
                      <p className="text-sm text-charcoal font-medium">
                        {deathDates.am} (Âm lịch) - {deathDates.duong} (Dương lịch)
                      </p>
                      {member.NgayGio_Am && (
                        <p className="text-sm text-burgundy font-bold mt-1">
                          Ngày giỗ hàng năm: {member.NgayGio_Am} (Âm lịch)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Vợ/Chồng */}
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-gold/10">
                  <Heart size={18} className="text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-light uppercase tracking-wider font-bold">Vợ/Chồng</p>
                    <p className="text-sm text-charcoal font-medium">{spouseName}</p>
                  </div>
                </div>

                {/* Liên hệ / Địa chỉ */}
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-gold/10">
                  <Phone size={18} className="text-gold shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-light uppercase tracking-wider font-bold">Số điện thoại</p>
                    {/* Assuming SDT_LienHe is added to SheetMember, if not, fallback to 'Chưa cập nhật' */}
                    <p className="text-sm text-charcoal font-medium">{(member as any).SDT_LienHe || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-gold/10">
                  <MapPin size={18} className="text-gold shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-light uppercase tracking-wider font-bold">
                      {isDeceased ? 'Vị trí phần mộ' : 'Địa chỉ / Quê quán'}
                    </p>
                    <p className="text-sm text-charcoal font-medium">{member.ViTriMo_QueQuan || 'Chưa cập nhật'}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
