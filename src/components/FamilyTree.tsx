import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Xarrow, { Xwrapper } from 'react-xarrows';
import { SheetMember, TreeNode } from '../types';
import { MemberCard } from './MemberCard';
import { cn } from '../utils/cn';

interface DesktopTreeNodeProps {
  key?: React.Key;
  node: TreeNode;
  onMemberClick: (m: SheetMember) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  isAncestorHovered?: boolean;
  isRoot?: boolean;
}

export const DesktopTreeNode = ({ 
  node, 
  onMemberClick,
  hoveredNodeId,
  setHoveredNodeId,
  isAncestorHovered = false,
  isRoot = false
}: DesktopTreeNodeProps) => {
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
          <div id={`node-${node.mainMember.ID}`} className="relative">
            {isRoot && (
              <>
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[3px] h-24 bg-gradient-to-b from-transparent via-[#8b4513]/20 to-[#8b4513]/60 z-0" />
                <div 
                  id={`dot-top-${node.mainMember.ID}`} 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#b8860b] shadow-md border border-[#8b4513]/60 z-20" 
                />
              </>
            )}
            {!isRoot && (
              <div 
                id={`dot-top-${node.mainMember.ID}`} 
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#b8860b] shadow-sm border border-[#8b4513]/50 z-20" 
              />
            )}
            <MemberCard member={node.mainMember} isMain={true} onClick={() => onMemberClick(node.mainMember)} />
            {hasChildren && (
              <div 
                id={`dot-bottom-${node.mainMember.ID}`} 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#b8860b] shadow-sm border border-[#8b4513]/50 z-20" 
              />
            )}
          </div>
          
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
            <React.Fragment key={childNode.mainMember.ID}>
              <Xarrow 
                start={`dot-bottom-${node.mainMember.ID}`}
                end={`dot-top-${childNode.mainMember.ID}`}
                startAnchor="bottom"
                endAnchor="top"
                path="smooth"
                color={isHighlighted ? "rgba(139, 69, 19, 0.6)" : hoveredNodeId ? "rgba(139, 69, 19, 0.15)" : "rgba(139, 69, 19, 0.3)"}
                strokeWidth={isHighlighted ? 2.5 : 2}
                showHead={false}
                curveness={0.6}
                zIndex={0}
              />
              <DesktopTreeNode 
                node={childNode} 
                onMemberClick={onMemberClick} 
                hoveredNodeId={hoveredNodeId}
                setHoveredNodeId={setHoveredNodeId}
                isAncestorHovered={isHighlighted}
              />
            </React.Fragment>
          ))}
        </ul>
      )}
    </li>
  );
};
