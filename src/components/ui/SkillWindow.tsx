import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useSkillStore, Skill, SkillCategory } from '../../stores/skillStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { Lock } from 'lucide-react';
import UIWindowFrame from './common/UIWindowFrame';

const SkillWindow = () => {
  const isSkillWindowOpen = useGameStore((state) => state.isSkillWindowOpen);
  const toggleSkillWindow = useGameStore((state) => state.toggleSkillWindow);
  
  const skillPoints = useLocalPlayerStore((state) => state.state.skillPoints);
  const level = useLocalPlayerStore((state) => state.state.level);
  
  const skills = useSkillStore((state) => state.skills);
  const upgradeSkill = useSkillStore((state) => state.upgradeSkill);
  const getUpgradeCost = useSkillStore((state) => state.getUpgradeCost);
  
  const gold = useInventoryStore((state) => state.gold);

  if (!isSkillWindowOpen) return null;

  const categories: SkillCategory[] = ['Offense', 'Defense', 'Utility'];

  const handleDragStart = (e: React.DragEvent, skillId: string) => {
    e.dataTransfer.setData('skillId', skillId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <UIWindowFrame
        title="Skill Mastery"
        onClose={toggleSkillWindow}
        width="w-[900px]"
        height="h-[600px]"
    >
        <div className="flex flex-col h-full">
            
            {/* Top Bar Status */}
            <div className="flex justify-between items-center px-4 py-2 bg-black/20 border-b border-white/5 rounded-t shrink-0">
                <div className="text-sm flex items-center gap-2">
                   <span className="ui-label font-bold text-yellow-500">GOLD</span> 
                   <span className="ui-value text-white">{gold.toLocaleString()}</span>
                </div>
                <div className="text-sm flex items-center gap-2">
                   <span className="ui-label font-bold text-green-500">SP</span>
                   <span className="ui-value text-white font-black text-lg">{skillPoints}</span>
                </div>
            </div>

            {/* Content - 3 Columns */}
            <div className="flex-1 flex divide-x divide-white/5 overflow-hidden">
                {categories.map((category) => (
                    <div key={category} className="flex-1 p-4 flex flex-col gap-6 items-center overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 w-full text-center pb-2">
                            {category}
                        </h3>
                        
                        {/* Skills in this category */}
                        <div className="flex flex-col gap-8 w-full items-center py-2">
                            {skills.filter(s => s.category === category).map((skill, index, array) => {
                                const previousSkill = index > 0 ? array[index - 1] : null;
                                const isDependencyMet = !previousSkill || previousSkill.currentGrade >= previousSkill.maxGrade;

                                return (
                                    <SkillNode 
                                        key={skill.id} 
                                        skill={skill} 
                                        playerLevel={level} 
                                        playerSP={skillPoints}
                                        playerGold={gold}
                                        upgradeCost={getUpgradeCost(skill.currentGrade)}
                                        isDependencyMet={isDependencyMet}
                                        previousSkillName={previousSkill?.name}
                                        onUpgrade={() => upgradeSkill(skill.id)}
                                        onDragStart={(e) => handleDragStart(e, skill.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-black/20 p-2 text-center text-[10px] text-gray-500 border-t border-white/5 italic shrink-0">
                 Drag mastered skills to the Quickbar to use them.
            </div>
        </div>
    </UIWindowFrame>
  );
};

interface SkillNodeProps {
    skill: Skill;
    playerLevel: number;
    playerSP: number;
    playerGold: number;
    upgradeCost: number;
    isDependencyMet: boolean;
    previousSkillName?: string;
    onUpgrade: () => void;
    onDragStart: (e: React.DragEvent) => void;
}

const SkillNode = ({ 
    skill, 
    playerLevel, 
    playerSP, 
    playerGold, 
    upgradeCost, 
    isDependencyMet, 
    previousSkillName, 
    onUpgrade, 
    onDragStart 
}: SkillNodeProps) => {
    const isLevelLocked = playerLevel < skill.requiredLevel;
    const isMastered = skill.currentGrade >= skill.maxGrade;
    const canAfford = playerGold >= upgradeCost;
    const hasSP = playerSP >= 1;
    
    // Can Learn if: Dependency Met, Not Level Locked, Not Mastered, Has SP, Has Gold
    const canLearn = isDependencyMet && !isLevelLocked && !isMastered && hasSP && canAfford;
    const isLearned = skill.currentGrade > 0;
    
    // Totally Locked: Level not met OR Dependency not met
    const isLocked = isLevelLocked || !isDependencyMet;

    // Styling logic
    let borderClass = "border-gray-700 opacity-60";
    let glowClass = "";
    let iconFilter = "grayscale(100%) opacity(40%)";

    if (isMastered) {
        borderClass = "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] opacity-100";
        iconFilter = "none";
    } else if (isLearned) {
        borderClass = "border-blue-500 opacity-100";
        iconFilter = "none";
    } else if (!isLocked && hasSP && canAfford) {
        // Available to learn
        borderClass = "border-green-600 opacity-100"; 
        glowClass = "animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.5)]"; 
        iconFilter = "none"; 
    } else if (!isLocked) {
         // Unlocked but missing SP/Gold
         borderClass = "border-gray-500 opacity-80";
         iconFilter = "grayscale(50%)";
    }

    return (
        <div className="flex flex-col items-center gap-2 group relative w-full">
            
            {/* Skill Icon */}
            <div 
                className={`w-14 h-14 bg-[#1a1a1a] border-2 rounded-lg relative cursor-pointer transition-all duration-200 ${borderClass} ${glowClass} hover:scale-105`}
                draggable={isLearned}
                onDragStart={isLearned ? onDragStart : undefined}
            >
                <img 
                    src={skill.iconUrl} 
                    alt={skill.name} 
                    className="w-full h-full object-cover p-1 rounded-md transition-all"
                    style={{ filter: iconFilter }}
                />
                
                {/* Grade Indicator */}
                <div className="absolute -bottom-2 -right-2 bg-black/90 border border-gray-700 text-gray-200 text-[10px] px-1.5 rounded-full z-10 font-mono">
                    {skill.currentGrade}/{skill.maxGrade}
                </div>
                
                {/* Lock Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-md backdrop-blur-[1px]">
                        {!isDependencyMet ? (
                            <Lock className="w-5 h-5 text-gray-500" />
                        ) : (
                            <span className="text-red-500 font-bold text-[10px]">Lv.{skill.requiredLevel}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-center">
                <div className={`font-bold text-xs ${isMastered ? 'text-yellow-500' : (isLearned ? 'text-blue-300' : 'text-gray-400')}`}>
                    {skill.name}
                </div>
                {skill.element && (
                    <div className={`text-[9px] uppercase font-bold tracking-wider
                        ${skill.element === 'Fire' ? 'text-red-400' : ''}
                        ${skill.element === 'Water' ? 'text-blue-400' : ''}
                        ${skill.element === 'Earth' ? 'text-amber-600' : ''}
                        ${skill.element === 'Wind' ? 'text-green-400' : ''}
                    `}>
                        {skill.element}
                    </div>
                )}
            </div>

            {/* Upgrade Button & Cost */}
            {!isMastered && (
                <div className="flex flex-col items-center gap-1 mt-1">
                    <button 
                        onClick={onUpgrade}
                        disabled={!canLearn}
                        className={`
                            px-3 py-1 rounded-[2px] text-[10px] font-bold transition-all flex items-center gap-1 border
                            ${canLearn 
                                ? 'bg-green-700 border-green-500 hover:bg-green-600 text-white shadow-sm' 
                                : 'bg-[#1a1a1a] border-gray-800 text-gray-600 cursor-not-allowed'}
                        `}
                    >
                        {isLocked ? <Lock size={8} /> : null}
                        {upgradeCost}g
                    </button>
                    {!hasSP && !isLocked && <span className="text-[9px] text-red-500 font-bold">No SP</span>}
                </div>
            )}
            
            {/* Tooltip on Hover */}
            <div className="absolute left-full top-0 ml-4 w-48 ui-window-container p-3 z-[100] hidden group-hover:block text-left pointer-events-none transform translate-y-[-10%]">
                 <h4 className="font-bold text-yellow-500 mb-1 text-sm">{skill.name}</h4>
                 <p className="text-xs text-gray-300 mb-2 leading-tight">{skill.description}</p>
                 <div className="text-[10px] text-gray-500 space-y-1">
                    <div className="flex justify-between">
                        <span>Req Level:</span>
                        <span className={isLevelLocked ? 'text-red-500' : 'text-green-500'}>{skill.requiredLevel}</span>
                    </div>

                    {!isDependencyMet && previousSkillName && (
                        <div className="text-red-400 font-bold border-t border-gray-800 pt-1 mt-1">
                            Requires: {previousSkillName} (Max)
                        </div>
                    )}

                    <div className="border-t border-gray-800 pt-1 mt-1">
                        <div>Next: {skill.currentGrade < skill.maxGrade ? `Grade ${skill.currentGrade + 1}` : 'MAX'}</div>
                        <div className="flex justify-between mt-1">
                            <span>Cost:</span>
                            <span className={canAfford ? 'text-yellow-400' : 'text-red-400'}>{upgradeCost}g</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default SkillWindow;
