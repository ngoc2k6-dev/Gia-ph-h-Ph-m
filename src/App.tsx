"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Filter, Loader2, AlertCircle, Calendar as CalendarIcon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Xwrapper } from 'react-xarrows';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { SheetMember } from './types';
import { useFamilyData } from './hooks/useFamilyData';
import { DragonHeader } from './components/DragonHeader';
import { SideDecor } from './components/SideDecor';
import { Background } from './components/Background';
import { DesktopTreeNode } from './components/FamilyTree';
import { MemberModal } from './components/MemberModal';
import { AnniversaryList } from './components/AnniversaryList';
import { cn } from './utils/cn';

export default function FamilyTreePage() {
  const { data, treeData, generations, loading, error, getParents, getSpouse } = useFamilyData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<SheetMember | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isAnniversaryOpen, setIsAnniversaryOpen] = useState(false);

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
    <div className="h-screen bg-[#F4EBD0] text-charcoal font-sans flex flex-col overflow-hidden">
      <Background />
      <DragonHeader />
      <SideDecor />
      
      <main className="flex-1 relative w-full h-full">
        {/* Floating Header */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 pointer-events-none">
          {/* Left: Title & Menu */}
          <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gold/30">
            <h1 className="font-serif text-lg font-bold text-burgundy px-3">Phạm Gia</h1>
            <div className="w-px h-6 bg-gold/30 mx-1"></div>
            <button 
              onClick={() => setIsAnniversaryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gold/10 text-burgundy transition-colors text-sm font-medium"
            >
              <CalendarIcon size={16} />
              <span className="hidden sm:inline">Giỗ Chạp</span>
            </button>
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
        <div className="w-full h-full overflow-auto pt-32 sm:pt-24 pb-12 px-4 sm:px-8 relative z-10">
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
                <div className="w-full h-full relative">
                  <TransformWrapper
                    initialScale={isMobile ? 0.4 : 0.8}
                    minScale={0.1}
                    maxScale={2}
                    centerOnInit={true}
                    limitToBounds={false}
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3 pointer-events-auto">
                          <button onClick={() => zoomIn()} className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gold/30 text-burgundy hover:bg-gold/10 transition-all active:scale-90">
                            <ZoomIn size={24} />
                          </button>
                          <button onClick={() => zoomOut()} className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gold/30 text-burgundy hover:bg-gold/10 transition-all active:scale-90">
                            <ZoomOut size={24} />
                          </button>
                          <button onClick={() => resetTransform()} className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gold/30 text-burgundy hover:bg-gold/10 transition-all active:scale-90">
                            <RotateCcw size={24} />
                          </button>
                        </div>
                        {isMobile && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-gold/30 shadow-lg pointer-events-none">
                            <p className="text-[11px] text-burgundy font-bold uppercase tracking-wider">Dùng 2 ngón tay để thu phóng • Kéo để di chuyển</p>
                          </div>
                        )}
                        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                          <div className={cn("family-tree min-w-max flex justify-center p-40", hoveredNodeId && "has-hovered")}>
                            <Xwrapper>
                              <ul>
                                {treeData.map(root => (
                                  <DesktopTreeNode 
                                    key={root.mainMember.ID} 
                                    node={root} 
                                    onMemberClick={setSelectedMember} 
                                    hoveredNodeId={hoveredNodeId}
                                    setHoveredNodeId={setHoveredNodeId}
                                    isRoot={true}
                                  />
                                ))}
                              </ul>
                            </Xwrapper>
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
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

      {isAnniversaryOpen && (
        <AnniversaryList 
          data={data} 
          onClose={() => setIsAnniversaryOpen(false)} 
          getParents={getParents}
        />
      )}
    </div>
  );
}
