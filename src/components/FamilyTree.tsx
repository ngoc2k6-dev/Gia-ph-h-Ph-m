import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SheetMember, TreeNode } from '../types';
import { MemberCard } from './MemberCard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DesktopTreeNode = ({ 
  node, 
  onMemberClick,
  hoveredNodeId,
  setHoveredNodeId,
  isAncestorHovered = false
}: { 
  node: TreeNode, 
  onMemberClick: (m: SheetMember) => void,
  hoveredNodeId: string | null,
  setHoveredNodeId: (id: string | null) => void,
  isAncestorHovered?: boolean
}) => {
  const hasChildren = node.families.some(f => f.children.length > 0);
  
  const isHoveredDirectly = hoveredNodeId === node.mainMember.ID || node.families.some(f => f.spouse?.ID === hoveredNodeId);
  const isHighlighted = isAncestorHovered || isHoveredDirectly;
  const isDimmed = hoveredNodeId !== null && !isHighlighted;
  
  return (
    <li className={cn(isHighlighted && "highlight-branch")}>
      <div className="flex flex-col items-center node-content">
        <motion.div 
          className="flex flex-row items-start relative z-10 gap-2"
          onMouseEnter={() => setHoveredNodeId(node.mainMember.ID)}
          onMouseLeave={() => setHoveredNodeId(null)}
          animate={{ opacity: isDimmed ? 0.25 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <MemberCard member={node.mainMember} isMain={true} onClick={() => onMemberClick(node.mainMember)} />
          {node.families.map((fam, idx) => fam.spouse && (
            <React.Fragment key={fam.spouse.ID}>
               <div className="w-3 h-[1px] bg-[#8b4513]/30 mt-4 spouse-connector"></div>
               <MemberCard member={fam.spouse} isMain={false} onClick={() => onMemberClick(fam.spouse!)} />
            </React.Fragment>
          ))}
        </motion.div>
      </div>
      
      {hasChildren && (
        <ul>
          {node.families.flatMap(f => f.children).map(childNode => (
            <DesktopTreeNode 
              key={childNode.mainMember.ID} 
              node={childNode} 
              onMemberClick={onMemberClick} 
              hoveredNodeId={hoveredNodeId}
              setHoveredNodeId={setHoveredNodeId}
              isAncestorHovered={isHighlighted}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const MobileTreeNode = ({ node, onMemberClick, level = 0 }: { node: TreeNode, onMemberClick: (m: SheetMember) => void, level?: number }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const allChildren = node.families.flatMap(f => f.children);
  const hasChildren = allChildren.length > 0;

  return (
    <div className="flex flex-col w-full">
      <div className={cn("flex flex-col gap-2 mb-2", level > 0 && "ml-4 border-l-[1.5px] border-burgundy/20 pl-4")}>
        <div className="flex items-center p-3 bg-cream rounded-xl shadow-[2px_2px_5px_#e3e0d9,-2px_-2px_5px_#ffffff] border border-gold/20">
          <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => onMemberClick(node.mainMember)}>
            <div className="w-10 h-10 rounded-full bg-cream shadow-[inset_2px_2px_5px_#e3e0d9,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center text-burgundy shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-burgundy text-sm truncate">{node.mainMember.Hoten}</h3>
              {node.mainMember.HocVi_ChucVu && (
                <span className="inline-block px-1.5 py-0.5 bg-gold/10 text-[#b8860b] text-[9px] font-bold uppercase rounded mt-0.5 border border-gold/20">
                  {node.mainMember.HocVi_ChucVu}
                </span>
              )}
            </div>
          </div>
          {hasChildren && (
            <button onClick={() => setExpanded(!expanded)} className="p-2 text-burgundy hover:bg-gold/10 rounded-full transition-colors shrink-0">
              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
        </div>

        {node.families.map(fam => fam.spouse && (
          <div key={fam.spouse.ID} className="flex items-center p-2 bg-white rounded-xl border border-charcoal/10 ml-8 opacity-90">
            <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => onMemberClick(fam.spouse!)}>
              <div className="w-8 h-8 rounded-full bg-white shadow-inner flex items-center justify-center text-charcoal-light shrink-0">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-charcoal text-xs truncate">{fam.spouse.Hoten}</h3>
                <p className="text-[9px] text-charcoal-light">Phu nhân / Phu quân</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col"
          >
            {allChildren.map(child => (
              <MobileTreeNode key={child.mainMember.ID} node={child} onMemberClick={onMemberClick} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
