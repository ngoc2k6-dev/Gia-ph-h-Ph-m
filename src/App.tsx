"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ChevronDown, Filter, Loader2, AlertCircle, Calendar as CalendarIcon, ZoomIn, ZoomOut, RotateCcw, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Xwrapper, useXarrow } from 'react-xarrows';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { SheetMember } from './types';
import { useFamilyData } from './hooks/useFamilyData';
import { Background } from './components/Background';
import { DesktopTreeNode } from './components/FamilyTree';
import { MemberModal } from './components/MemberModal';
import { AnniversaryList } from './components/AnniversaryList';
import { EventManager } from './components/EventManager';
import { Logo } from './components/Logo';
import { cn } from './utils/cn';

export default function FamilyTreePage() {
  const { data, events, treeData, generations, loading, error, getParents, getSpouse } = useFamilyData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<SheetMember | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isAnniversaryOpen, setIsAnniversaryOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }, [loading]);

  const triggerArrowUpdate = () => {
    window.dispatchEvent(new Event('resize'));
  };

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

  const treeContent = (
    <div key={isMobile ? 'mobile' : 'desktop'} className={cn("family-tree min-w-max flex justify-center p-20 sm:p-40", hoveredNodeId && "has-hovered")}>
      <ul>
        {treeData.map(root => (
          <DesktopTreeNode 
            key={root.mainMember.ID} 
            node={root} 
            onMemberClick={setSelectedMember} 
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            isRoot={true}
            path="grid"
          />
        ))}
      </ul>
    </div>
  );

  return (
    <div className="h-screen bg-[#F4EBD0] text-charcoal font-sans flex flex-col overflow-hidden">
      <Background />
      
      <main className="flex-1 relative w-full h-full flex flex-col">
        {/* Navigation Bar - Optimized for PC and Mobile */}
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-gold/20 z-30 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <Logo className="shrink-0" />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAnniversaryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy/5 hover:bg-burgundy/10 text-burgundy transition-colors text-xs font-bold border border-burgundy/10"
              >
                <CalendarIcon size={14} />
                <span>Giỗ Chạp</span>
              </button>
              <button 
                onClick={() => setIsEventOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 transition-colors text-xs font-bold border border-amber-500/10"
              >
                <Clock size={14} />
                <span>Sự kiện</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-light" size={14} />
              <input 
                type="text" 
                placeholder="Tìm kiếm thành viên..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/50 border border-gold/20 focus:bg-white focus:border-burgundy focus:ring-1 focus:ring-burgundy rounded-lg text-sm transition-all outline-none"
              />
            </div>
            <div className="relative">
              <select 
                value={selectedGen}
                onChange={(e) => setSelectedGen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="appearance-none pl-7 pr-8 py-1.5 bg-white/50 border border-gold/20 rounded-lg text-sm outline-none text-burgundy font-bold"
              >
                <option value="all">Tất cả đời</option>
                {generations.map(g => (
                  <option key={g} value={g}>Đời {g}</option>
                ))}
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-burgundy" size={12} />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-burgundy pointer-events-none" size={12} />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-burgundy z-20">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-serif font-medium">Đang tải gia phả...</p>
            </div>
          ) : error && data.length > 0 ? (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 max-w-2xl w-[90%]">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          ) : null}

          {!loading && (
            <div className="w-full h-full">
              {searchQuery.trim() || selectedGen !== 'all' ? (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-8">
                  <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gold/20 shadow-lg">
                    <h3 className="font-serif text-lg font-bold text-charcoal mb-4 border-b border-gold/10 pb-2">Kết quả tìm kiếm ({searchResults.length})</h3>
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.map(member => (
                          <div 
                            key={member.ID}
                            onClick={() => setSelectedMember(member)}
                            className="flex items-center p-3 bg-cream rounded-xl shadow-sm border border-gold/10 cursor-pointer hover:bg-gold/5 transition-all"
                          >
                            <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy shrink-0 mr-3">
                              <span className="font-bold">{member.Hoten.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif font-bold text-charcoal truncate">{member.Hoten}</h4>
                              <p className="text-[10px] text-charcoal-light">Đời {member.Doithu} • {member.Loaithanhvien || 'Thành viên'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-charcoal-light py-12 italic">Không tìm thấy thành viên nào phù hợp.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <Xwrapper>
                    {isMobile ? (
                      <TransformWrapper
                        initialScale={0.4}
                        minScale={0.1}
                        maxScale={2}
                        centerOnInit={true}
                        limitToBounds={false}
                        wheel={{ step: 0.1 }}
                        pinch={{ step: 5 }}
                        onTransformed={triggerArrowUpdate}
                        onZoom={triggerArrowUpdate}
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
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-gold/30 shadow-lg pointer-events-none">
                              <p className="text-[11px] text-burgundy font-bold uppercase tracking-wider">Dùng 2 ngón tay để thu phóng • Kéo để di chuyển</p>
                            </div>
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                              {treeContent}
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    ) : (
                      <div className="w-full h-full overflow-auto custom-scrollbar">
                        {treeContent}
                      </div>
                    )}
                  </Xwrapper>
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

      {isEventOpen && (
        <EventManager 
          data={data}
          events={events}
          onClose={() => setIsEventOpen(false)}
        />
      )}
    </div>
  );
}
