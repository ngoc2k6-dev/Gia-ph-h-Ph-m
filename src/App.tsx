"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Filter, Loader2, AlertCircle, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lunar } from 'lunar-javascript';

import { SheetMember } from './types';
import { useFamilyData } from './hooks/useFamilyData';
import { DragonHeader } from './components/DragonHeader';
import { SideDecor } from './components/SideDecor';
import { Background } from './components/Background';
import { DesktopTreeNode, MobileTreeNode } from './components/FamilyTree';
import { MemberModal } from './components/MemberModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AnniversaryReminder = ({ data }: { data: SheetMember[] }) => {
  const upcoming = useMemo(() => {
    const todayLunar = Lunar.fromDate(new Date());
    const currentMonth = todayLunar.getMonth();
    const currentDay = todayLunar.getDay();
    
    return data.filter(m => {
      if (!m.NgayGio_Am) return false;
      const parts = m.NgayGio_Am.split('/');
      if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        
        if (month === currentMonth) {
          const diff = day - currentDay;
          return diff >= 0 && diff <= 7;
        }
      }
      return false;
    }).slice(0, 3);
  }, [data]);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-burgundy text-cream px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium shadow-md relative z-40">
      <Bell size={16} className="animate-pulse text-gold" />
      <span>
        Sắp đến ngày giỗ của: {upcoming.map(m => `${m.Hoten} (${m.NgayGio_Am} Âm lịch)`).join(', ')}
      </span>
    </div>
  );
};

export default function FamilyTreePage() {
  const { data, treeData, generations, loading, error, getParents, getSpouse } = useFamilyData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<SheetMember | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedGen === 'all') return [];
    const query = searchQuery.toLowerCase();
    return data.filter(m => {
      const matchesSearch = query === '' || 
        m.Hoten.toLowerCase().includes(query) || 
        (m.Loaithanhvien && m.Loaithanhvien.toLowerCase().includes(query)) ||
        (m.HocVi_ChucVu && m.HocVi_ChucVu.toLowerCase().includes(query));
      const matchesGen = selectedGen === 'all' || m.Doithu === selectedGen;
      return matchesSearch && matchesGen;
    });
  }, [data, searchQuery, selectedGen]);

  return (
    <div className="h-screen bg-cream text-charcoal font-sans flex flex-col overflow-hidden">
      <Background />
      <DragonHeader />
      <SideDecor />
      
      <AnniversaryReminder data={data} />
      
      <main className="flex-1 relative w-full h-full">
        {/* Floating Header */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 pointer-events-none">
          {/* Left: Title */}
          <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gold/30">
            <h1 className="font-serif text-lg font-bold text-burgundy px-3">Phạm Gia</h1>
          </div>

          {/* Right: Search */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gold/30 flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-light" size={14} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/50 border border-gold/20 focus:bg-white focus:border-burgundy focus:ring-1 focus:ring-burgundy rounded-lg text-sm transition-all outline-none"
              />
            </div>
            {isMobile && (
              <div className="relative">
                <select 
                  value={selectedGen}
                  onChange={(e) => setSelectedGen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="appearance-none pl-7 pr-6 py-1.5 bg-white/50 border border-gold/20 rounded-lg text-sm outline-none text-burgundy font-medium"
                >
                  <option value="all">Tất cả</option>
                  {generations.map(g => (
                    <option key={g} value={g}>Đời {g}</option>
                  ))}
                </select>
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-burgundy" size={12} />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-burgundy pointer-events-none" size={12} />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full h-full overflow-auto pt-28 sm:pt-8 pb-12 px-4 sm:px-8 relative z-10">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-burgundy">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-serif font-medium">Đang tải gia phả...</p>
            </div>
          ) : error && data.length > 0 ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 max-w-2xl mx-auto">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          ) : null}

          {!loading && (
            <div className="w-full h-full">
              {searchQuery.trim() || selectedGen !== 'all' ? (
                <div className="space-y-4 max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gold/20 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-4">Kết quả tìm kiếm ({searchResults.length})</h3>
                  {searchResults.length > 0 ? (
                    searchResults.map(member => (
                      <div 
                        key={member.ID}
                        onClick={() => setSelectedMember(member)}
                        className="flex items-center p-3 bg-cream rounded-xl shadow-[2px_2px_5px_#e3e0d9,-2px_-2px_5px_#ffffff] border border-gold/10 cursor-pointer hover:scale-[1.02] transition-transform"
                      >
                        <div className="w-10 h-10 rounded-full bg-cream shadow-[inset_2px_2px_5px_#e3e0d9,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center text-burgundy shrink-0 mr-4">
                          <span className="font-bold">{member.Hoten.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-charcoal">{member.Hoten}</h4>
                          <p className="text-[10px] text-charcoal-light">Đời {member.Doithu} • {member.Loaithanhvien || 'Thành viên'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-charcoal-light py-8">Không tìm thấy thành viên nào phù hợp.</p>
                  )}
                </div>
              ) : (
                <div className="w-full h-full">
                  {isMobile ? (
                    <div className="max-w-md mx-auto space-y-2">
                      {treeData.map(root => (
                        <MobileTreeNode key={root.mainMember.ID} node={root} onMemberClick={setSelectedMember} />
                      ))}
                    </div>
                  ) : (
                    <div className={cn("family-tree min-w-max flex justify-center", hoveredNodeId && "has-hovered")}>
                      <ul>
                        {treeData.map(root => (
                          <DesktopTreeNode 
                            key={root.mainMember.ID} 
                            node={root} 
                            onMemberClick={setSelectedMember} 
                            hoveredNodeId={hoveredNodeId}
                            setHoveredNodeId={setHoveredNodeId}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedMember && (
        <MemberModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)}
          fatherName={getParents(selectedMember).fatherName}
          motherName={getParents(selectedMember).motherName}
          spouseName={getSpouse(selectedMember)}
        />
      )}
    </div>
  );
}
