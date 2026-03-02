import React, { useState, useEffect } from 'react';
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
  path?: "smooth" | "grid" | "straight" | "step";
}

export const DesktopTreeNode = React.memo(({ 
  node, 
  onMemberClick,
  hoveredNodeId,
  setHoveredNodeId,
  isAncestorHovered = false,
  isRoot = false,
  path = "smooth"
}: DesktopTreeNodeProps) => {
  const hasChildren = node.families.some(f => f.children.length > 0);
  
  const isHoveredDirectly = hoveredNodeId === node.mainMember.ID || node.families.some(f => f.spouse?.ID === hoveredNodeId);
  const isHighlighted = isAncestorHovered || isHoveredDirectly;
  const isDimmed = hoveredNodeId !== null && !isHighlighted;
  
  return (
    <li className={cn(isHighlighted && "highlight-branch")}>
      <div className="flex flex-col items-center node-content">
        <motion.div 
          className={cn("flex flex-row items-start relative gap-2", isHoveredDirectly ? "z-[100]" : "z-10")}
          onMouseEnter={() => setHoveredNodeId(node.mainMember.ID)}
          onMouseLeave={() => setHoveredNodeId(null)}
          animate={{ opacity: isDimmed ? 0.25 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div id={`node-${node.mainMember.ID}`} className="relative w-[56px] shrink-0 inline-block">
            {isRoot && (
              <>
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[2px] h-24 bg-gradient-to-b from-transparent via-[#8b4513]/10 to-[#8b4513]/40 z-0" />
                <div 
                  id={`dot-top-${node.mainMember.ID}`} 
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-md border border-[#8b4513]/40 z-20 flex items-center justify-center" 
                >
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                </div>
              </>
            )}
            {!isRoot && (
              <div 
                id={`dot-top-${node.mainMember.ID}`} 
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-sm border border-[#8b4513]/40 z-20 flex items-center justify-center" 
              >
                <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
              </div>
            )}
            <MemberCard member={node.mainMember} isMain={true} onClick={() => onMemberClick(node.mainMember)} />
            {hasChildren && (
              <div 
                id={`dot-bottom-${node.mainMember.ID}`} 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-sm border border-[#8b4513]/40 z-20 flex items-center justify-center" 
              >
                <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
              </div>
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
                startAnchor="middle"
                endAnchor="middle"
                path={path}
                color={isHighlighted ? "#8b4513" : hoveredNodeId ? "rgba(139, 69, 19, 0.1)" : "rgba(139, 69, 19, 0.4)"}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                showHead={false}
                curveness={path === "smooth" ? 0.6 : 10}
                zIndex={0}
                passProps={{
                  filter: isHighlighted ? "drop-shadow(0px 0px 4px rgba(139, 69, 19, 0.4))" : "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  className: isHighlighted ? "xarrow-highlighted" : ""
                }}
              />
              <DesktopTreeNode 
                node={childNode} 
                onMemberClick={onMemberClick} 
                hoveredNodeId={hoveredNodeId}
                setHoveredNodeId={setHoveredNodeId}
                isAncestorHovered={isHighlighted}
                path={path}
              />
            </React.Fragment>
          ))}
        </ul>
      )}
    </li>
  );
});
