import React, { useState } from 'react';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useInventoryStore } from '../../stores/inventoryStore';

interface DebugPanelProps {
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ onClose }) => {
  const { gainExp, debugSetLevel, state: playerState, setHp, setMp } = useLocalPlayerStore();
  const { addGold } = useInventoryStore();
  const [levelInput, setLevelInput] = useState<string>('99');

  const handleLevelUp = () => {
    // Calculate exp needed for next level
    // If current level is 1, maxExp is 10. Gain 10 exp.
    // Use ignorePenalty=true to bypass Level Gap logic
    const expNeeded = playerState.maxExp - playerState.exp;
    gainExp(expNeeded > 0 ? expNeeded : 1, 1, true);
  };

  const handleSetLevel = () => {
    const level = parseInt(levelInput);
    if (!isNaN(level) && level >= 1 && level <= 99) {
        debugSetLevel(level);
    }
  };

  const handleAddGold = () => {
    addGold(1000);
  };

  const handleFullRestore = () => {
    setHp(playerState.maxHp);
    setMp(playerState.maxMp);
  };

  return (
    <div className="absolute top-16 left-4 bg-slate-900/90 border-2 border-red-500 rounded p-4 text-white z-[2000] w-64 shadow-xl font-mono text-sm">
      <div className="flex justify-between items-center mb-4 border-b border-red-500/50 pb-2">
        <h3 className="text-red-400 font-bold">DEBUG MODE</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
            <input 
                type="number" 
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                className="w-16 bg-slate-800 border border-slate-600 rounded px-2 text-white"
                min="1"
                max="99"
            />
            <button 
                onClick={handleSetLevel}
                className="flex-1 bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded text-sm font-bold"
            >
                SET LEVEL
            </button>
        </div>

        <button 
          onClick={handleLevelUp}
          className="w-full bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded text-left flex justify-between items-center"
        >
          <span>Level Up</span>
          <span className="text-xs opacity-70">(+1 LV)</span>
        </button>

        <button 
          onClick={handleAddGold}
          className="w-full bg-yellow-700 hover:bg-yellow-600 px-3 py-2 rounded text-left flex justify-between items-center"
        >
          <span>Add Gold</span>
          <span className="text-xs opacity-70">(+1000 G)</span>
        </button>

        <button 
          onClick={handleFullRestore}
          className="w-full bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-left flex justify-between items-center"
        >
          <span>Full Restore</span>
          <span className="text-xs opacity-70">(HP/MP)</span>
        </button>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-700 text-xs text-gray-500">
        Player Pos: {playerState.position.x.toFixed(1)}, {playerState.position.z.toFixed(1)}
      </div>
    </div>
  );
};

export default DebugPanel;
