import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { JobType } from '../../models/CharacterData';
import { Sword, Zap, Target } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import UIWindowFrame from './common/UIWindowFrame';

const StatWindow = () => {
  const { isStatWindowOpen, toggleStatWindow } = useGameStore();
  const { addNotification } = useNotificationStore();
  
  const playerState = useLocalPlayerStore((state) => state.state);
  const increaseStat = useLocalPlayerStore((state) => state.increaseStat);
  
  const { 
    str = 0, int = 0, dex = 0, 
    statPoints = 0, 
    job = JobType.Warrior, 
    level = 1
  } = playerState || {};

  if (!isStatWindowOpen) return null;

  const canIncrease = (stat: 'str' | 'int' | 'dex') => {
    if (statPoints <= 0) return false;
    if (stat === 'str' && job !== JobType.Warrior) return false;
    if (stat === 'int' && job !== JobType.Mage) return false;
    return true;
  };

  const handleIncreaseStat = (stat: 'str' | 'int' | 'dex') => {
      const currentVal = stat === 'str' ? str : stat === 'int' ? int : dex;
      if (currentVal >= 100) {
          addNotification("Max stat reached.", "warning");
          return;
      }
      increaseStat(stat);
  };

  return (
    <UIWindowFrame 
        title="Status" 
        onClose={toggleStatWindow} 
        width="w-[350px]" 
        height="h-[420px]"
    >
        <div className="flex flex-col gap-4 h-full">
            
            {/* Header Info */}
            <div className="bg-black/20 p-3 rounded border border-white/5 flex justify-between items-center">
                 <div>
                     <div className="ui-label text-xs uppercase font-bold">Class</div>
                     <div className="text-yellow-500 font-bold">{job}</div>
                 </div>
                 <div className="text-right">
                     <div className="ui-label text-xs uppercase font-bold">Level</div>
                     <div className="text-white font-bold text-xl">{level}</div>
                 </div>
            </div>

            {/* Stat Points */}
            <div className="bg-yellow-900/10 border border-yellow-700/30 p-2 rounded flex justify-between items-center px-4">
                 <span className="text-yellow-500 font-bold text-sm uppercase">Points Available</span>
                 <span className="text-white font-black text-xl shadow-glow">{statPoints}</span>
            </div>

            {/* Stats List */}
            <div className="flex-1 space-y-2">
                 {/* STR */}
                 <div className="bg-black/20 p-2 rounded border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-red-900/20 text-red-500 rounded"><Sword size={16} /></div>
                          <span className="ui-label font-bold text-gray-300">Strength</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="ui-value font-bold text-white text-lg">{str}</span>
                          <button 
                              onClick={() => handleIncreaseStat('str')}
                              disabled={!canIncrease('str')}
                              className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs transition-all
                                  ${canIncrease('str') 
                                      ? 'bg-yellow-600 border-yellow-500 text-white hover:bg-yellow-500' 
                                      : 'bg-[#2a2a2a] border-gray-700 text-gray-600 cursor-not-allowed'}
                              `}
                          >
                              +
                          </button>
                      </div>
                 </div>

                 {/* INT */}
                 <div className="bg-black/20 p-2 rounded border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-900/20 text-blue-500 rounded"><Zap size={16} /></div>
                          <span className="ui-label font-bold text-gray-300">Intellect</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="ui-value font-bold text-white text-lg">{int}</span>
                          <button 
                              onClick={() => handleIncreaseStat('int')}
                              disabled={!canIncrease('int')}
                              className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs transition-all
                                  ${canIncrease('int') 
                                      ? 'bg-yellow-600 border-yellow-500 text-white hover:bg-yellow-500' 
                                      : 'bg-[#2a2a2a] border-gray-700 text-gray-600 cursor-not-allowed'}
                              `}
                          >
                              +
                          </button>
                      </div>
                 </div>

                 {/* DEX */}
                 <div className="bg-black/20 p-2 rounded border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-900/20 text-green-500 rounded"><Target size={16} /></div>
                          <span className="ui-label font-bold text-gray-300">Dexterity</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="ui-value font-bold text-white text-lg">{dex}</span>
                          <button 
                              onClick={() => handleIncreaseStat('dex')}
                              disabled={!canIncrease('dex')}
                              className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs transition-all
                                  ${canIncrease('dex') 
                                      ? 'bg-yellow-600 border-yellow-500 text-white hover:bg-yellow-500' 
                                      : 'bg-[#2a2a2a] border-gray-700 text-gray-600 cursor-not-allowed'}
                              `}
                          >
                              +
                          </button>
                      </div>
                 </div>
            </div>

            <div className="text-[10px] text-gray-600 text-center italic mt-auto">
                Increase stats to improve combat efficiency.
            </div>

        </div>
    </UIWindowFrame>
  );
};

export default StatWindow;
