import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, MapPin, Phone, Heart, Flower2, Briefcase, BookOpen, Quote } from 'lucide-react';
import { SheetMember } from '../types';
import { getAnniversarySolarDate, formatDate, parseLunarDate } from '../utils/lunar-tool';

const normalizeDateString = (dateVal: string | number) => {
  if (!dateVal) return '';
  const dateStr = String(dateVal);
  
  // Handle ISO string
  if (dateStr.includes('T') && dateStr.includes('Z')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  
  // Handle YYYY-MM-DD
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  
  return dateStr;
};

const formatSolarDate = (dateVal: string | number) => {
  const dateStr = normalizeDateString(dateVal);
  if (!dateStr) return '';
  if (dateStr.length === 4) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return dateStr;
};

const getAnniversaryInfo = (ngayMatVal: string | number) => {
  const ngayMat = normalizeDateString(ngayMatVal);
  if (!ngayMat) return { am: '', duong: '' };
  
  const parsed = parseLunarDate(ngayMat);
  if (!parsed) return { am: ngayMat, duong: 'Không rõ' };

  const amStr = parsed.year ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}/${parsed.year}` : `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}`;
  
  const solarDate = getAnniversarySolarDate(ngayMat);
  const duongStr = solarDate ? formatDate(solarDate) : 'Không rõ';

  return { am: amStr, duong: duongStr };
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
  const deathDates = isDeceased ? getAnniversaryInfo(member.NgayMat) : { am: '', duong: '' };

  const buildParentString = () => {
    const hasFather = fatherName && fatherName !== '...';
    const hasMother = motherName && motherName !== '...';
    const thuTu = member.ThuTuCon ? `Con thứ ${member.ThuTuCon}` : 'Con';

    if (hasFather && hasMother) return `${thuTu} của ông ${fatherName} và bà ${motherName}`;
    if (hasFather) return `${thuTu} của ông ${fatherName}`;
    if (hasMother) return `${thuTu} của bà ${motherName}`;
    return thuTu;
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
          className="relative w-full max-w-lg bg-[#f9f6f0] rounded-2xl shadow-2xl overflow-hidden z-10 border border-gold/30 max-h-[90vh] flex flex-col"
        >
          {/* Nền giấy mờ */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")' }}></div>
          
          <div className="p-6 overflow-y-auto relative z-10">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-charcoal-light hover:text-burgundy transition-colors bg-white/50 rounded-full z-20">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <h2 className="font-serif text-3xl font-bold text-[#4A4A4A] mb-1 uppercase tracking-tight">{member.Hoten}</h2>
              
              <p className="text-sm text-[#4A4A4A]/70 italic mb-6">
                {buildParentString()}
              </p>

              <div className="w-full text-left space-y-4">
                
                {/* Thông tin chung */}
                {(member.Gioitinh || member.NgaySinh || member.HocVi_ChucVu) && (
                  <div className="flex flex-col gap-3 bg-white/80 p-4 rounded-xl border border-[#B8860B]/20 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {member.Gioitinh && (
                        <div className="flex items-center gap-3">
                          <User size={18} className="text-[#B8860B] shrink-0" />
                          <div>
                            <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Giới tính</p>
                            <p className="text-sm text-[#4A4A4A] font-medium">{member.Gioitinh}</p>
                          </div>
                        </div>
                      )}
                      {member.NgaySinh && (
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-[#B8860B] shrink-0" />
                          <div>
                            <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Ngày sinh</p>
                            <p className="text-sm text-[#4A4A4A] font-medium">{formatSolarDate(member.NgaySinh)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {member.HocVi_ChucVu && (
                      <>
                        <div className="w-full h-px bg-[#B8860B]/10" />
                        <div className="flex items-center gap-3">
                          <Briefcase size={18} className="text-[#B8860B] shrink-0" />
                          <div>
                            <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Học vị / Chức vụ</p>
                            <p className="text-sm text-[#4A4A4A] font-medium">{member.HocVi_ChucVu}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tiểu sử */}
                {member.Tieusungan && (
                  <div className="bg-white/80 p-4 rounded-xl border border-[#B8860B]/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Quote size={16} className="text-[#B8860B]" />
                      <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Tiểu sử & Sự nghiệp</p>
                    </div>
                    <p className="text-sm text-[#4A4A4A] leading-relaxed italic">
                      "{member.Tieusungan}"
                    </p>
                  </div>
                )}

                {/* Liên hệ & Vị trí */}
                {(member.SDT_LienHe || member.ViTriMo_QueQuan) && (
                  <div className="flex flex-col gap-3 bg-white/80 p-4 rounded-xl border border-[#B8860B]/20 shadow-sm">
                    {member.SDT_LienHe && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-[#B8860B] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Số điện thoại</p>
                          <a href={`tel:${member.SDT_LienHe}`} className="text-sm text-[#B8860B] font-medium hover:underline">
                            {member.SDT_LienHe}
                          </a>
                        </div>
                      </div>
                    )}
                    {member.SDT_LienHe && member.ViTriMo_QueQuan && <div className="w-full h-px bg-[#B8860B]/10" />}
                    {member.ViTriMo_QueQuan && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-[#B8860B] shrink-0" />
                        <div>
                          <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">
                            {isDeceased ? 'Vị trí phần mộ' : 'Địa chỉ hiện tại'}
                          </p>
                          <p className="text-sm text-[#4A4A4A] font-medium">{member.ViTriMo_QueQuan}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Gia đình */}
                {spouseName && spouseName !== 'Chưa cập nhật' && spouseName !== 'Không rõ' && (
                  <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl border border-[#B8860B]/20 shadow-sm">
                    <Heart size={18} className="text-[#B8860B] shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#4A4A4A]/60 uppercase tracking-widest font-bold">Vợ/Chồng</p>
                      <p className="text-sm text-[#4A4A4A] font-medium">{spouseName}</p>
                    </div>
                  </div>
                )}

                {/* Thông tin ngày giỗ & Tâm linh */}
                {isDeceased && (
                  <div className="flex flex-col gap-3 bg-[#7B1113]/5 p-4 rounded-xl border border-[#7B1113]/20 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Flower2 size={18} className="text-[#7B1113] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-[#7B1113] uppercase tracking-widest font-bold">Thông tin ngày giỗ</p>
                        <p className="text-sm text-[#4A4A4A] font-medium mt-1">
                          Ngày giỗ: <span className="font-bold text-[#7B1113]">{deathDates.am}</span> (Âm lịch)
                        </p>
                        {deathDates.duong && deathDates.duong !== 'Không rõ' && (
                          <p className="text-xs text-[#4A4A4A]/70 mt-0.5">
                            Dương lịch (năm nay): {deathDates.duong}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.TenThuy && (
                      <>
                        <div className="w-full h-px bg-[#7B1113]/10" />
                        <div className="flex items-center gap-3">
                          <BookOpen size={18} className="text-[#7B1113] shrink-0" />
                          <div>
                            <p className="text-[10px] text-[#7B1113]/60 uppercase tracking-widest font-bold">Tên thụy</p>
                            <p className="text-sm text-[#4A4A4A] font-medium">{member.TenThuy}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

