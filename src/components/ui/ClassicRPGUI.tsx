import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { User, Backpack, Sparkles, Sword, LogOut } from 'lucide-react';

const ClassicRPGUI = () => {
  const { dialogue, closeDialogue, toggleStatWindow, toggleSkillWindow, toggleEquipmentWindow } = useGameStore();
  const { toggleInventory } = useInventoryStore();
  const playerState = useLocalPlayerStore((state) => state.state);
  
  const quickSlots = useInventoryStore((state) => state.quickSlots);
  const items = useInventoryStore((state) => state.items);
  const consumeItem = useInventoryStore((state) => state.consumeItem);

  const handleQuickSlot = (slot: number) => {
    const itemId = quickSlots[slot];
    if (itemId) {
      consumeItem(itemId);
    }
  };

  // Keyboard Listeners for Quickslots (1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        
        const key = e.key;
        if (['1', '2', '3', '4', '5'].includes(key)) {
            const slot = parseInt(key);
            handleQuickSlot(slot);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickSlots, items]);

  const safeMaxHP = playerState.maxHp > 0 ? playerState.maxHp : 1;
  const safeMaxMP = playerState.maxMp > 0 ? playerState.maxMp : 1;
  const hpPercentage = (playerState.hp / safeMaxHP) * 100;
  const mpPercentage = (playerState.mp / safeMaxMP) * 100;
  const expPercentage = (playerState.exp / playerState.maxExp) * 100;

  // Unified Style Constants
  const CONTAINER_STYLE = "bg-black/80 border border-[#C0A080] backdrop-blur-sm rounded-lg shadow-lg pointer-events-auto z-[9999]";
  const TEXT_TITLE = "text-[#E0E0E0] font-bold text-[18px] font-serif tracking-wide";
  const TEXT_LABEL = "text-[#B0B0B0] text-[14px] font-sans";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-serif select-none overflow-hidden z-[9999]">
      
      {/* --- XP BAR (Bottom Edge) --- */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black/90 border-t border-[#C0A080] z-[9999]">
         <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-all duration-300"
            style={{ width: `${expPercentage}%` }}
         />
      </div>

      {/* --- DIALOGUE BOX --- */}
      {dialogue.isOpen && (
        <div className="pointer-events-auto absolute bottom-40 left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-[10000]">
          <div className="bg-slate-900/95 border-2 border-[#C0A080] rounded-lg p-6 flex gap-6 items-center shadow-2xl relative">
            {/* Portrait */}
            <div className="w-24 h-24 bg-black/50 border border-[#C0A080]/50 rounded-md overflow-hidden flex-shrink-0">
               {dialogue.portraitUrl ? (
                 <img src={dialogue.portraitUrl} alt="Portrait" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
               )}
            </div>
            
            {/* Text Content */}
            <div className="flex-1 text-[#E0E0E0]">
              <h3 className="text-xl font-bold text-[#C0A080] mb-2 font-serif">{dialogue.speakerName}</h3>
              <p className="text-lg leading-relaxed font-sans">{dialogue.text}</p>
            </div>

            {/* Close Button (X) */}
            <button 
              onClick={closeDialogue}
              className="absolute top-2 right-2 text-[#C0A080] hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center border border-transparent hover:border-[#C0A080] rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* --- LEFT SIDE: CHARACTER HUB --- */}
      {/* Positioned slightly above the XP bar */}
      <div className={`absolute bottom-4 left-4 flex flex-col gap-3 p-4 w-64 ${CONTAINER_STYLE}`}>
         
         {/* Name & Class Header */}
         <div className="flex flex-col border-b border-[#C0A080]/30 pb-2 mb-1">
             <div className="flex items-center gap-3">
                 {/* Level Box */}
                 <div className="flex items-center justify-center w-10 h-10 bg-[#C0A080] text-black font-bold rounded-sm text-lg border border-white/20 shadow-inner font-serif">
                    {playerState.level}
                 </div>
                 
                 {/* Class Info */}
                 <div className="flex flex-col">
                     <span className={TEXT_TITLE}>Warrior</span>
                     <span className={`${TEXT_LABEL} text-xs uppercase tracking-wider opacity-80`}>Player Class</span>
                 </div>
             </div>
         </div>

         {/* HP Bar */}
         <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
                <span className="text-[#FF4444] font-bold text-xs tracking-wider font-serif">HP</span>
                <span className="text-white text-xs font-mono opacity-90">{Math.floor(playerState.hp)} / {playerState.maxHp}</span>
            </div>
            <div className="h-3 bg-black/60 border border-white/10 rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[#330000]"></div>
                <div 
                    className="h-full bg-[#CC0000] transition-all duration-300 relative shadow-[0_0_8px_rgba(255,0,0,0.5)]"
                    style={{ width: `${hpPercentage}%` }}
                >
                     <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </div>
         </div>

         {/* MP Bar */}
         <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
                <span className="text-[#4488FF] font-bold text-xs tracking-wider font-serif">MP</span>
                <span className="text-white text-xs font-mono opacity-90">{Math.floor(playerState.mp)} / {playerState.maxMp}</span>
            </div>
             <div className="h-3 bg-black/60 border border-white/10 rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[#000033]"></div>
                <div 
                    className="h-full bg-[#0066CC] transition-all duration-300 relative shadow-[0_0_8px_rgba(0,100,255,0.5)]"
                    style={{ width: `${mpPercentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </div>
         </div>
      </div>

      {/* --- CENTER: QUICKSLOTS --- */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 px-3 flex gap-2 ${CONTAINER_STYLE}`}>
        {[1, 2, 3, 4, 5].map((slot) => {
            const itemId = quickSlots[slot];
            const item = items.find(i => i.id === itemId);
            
            return (
            <div 
                key={slot}
                className="w-12 h-12 bg-black/60 border border-[#C0A080]/30 hover:border-[#C0A080] rounded-md flex items-center justify-center relative cursor-pointer group transition-all shadow-inner"
                onClick={() => handleQuickSlot(slot)}
                title={item ? `${item.name} (Key: ${slot})` : `Slot ${slot} (Empty)`}
            >
                <span className="absolute top-0.5 left-1 text-[10px] text-[#C0A080] font-bold z-10 opacity-70 group-hover:opacity-100 font-mono">{slot}</span>
                
                {/* Icon */}
                {item ? (
                    <div className="w-full h-full p-1 relative">
                        <img src={item.iconUrl} className="w-full h-full object-contain filter drop-shadow-lg" />
                        {/* Quantity Indicator */}
                        {(item.quantity || 1) > 0 && (
                            <span className="absolute bottom-0 right-0 text-white text-[10px] font-bold bg-black/80 px-1.5 rounded-tl-md backdrop-blur-sm border-t border-l border-[#C0A080]/30 font-mono">
                                {item.quantity}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                         <div className="w-2 h-2 rounded-full bg-[#C0A080]"></div>
                    </div>
                )}
            </div>
        )})}
      </div>

      {/* --- RIGHT SIDE: FUNCTION HUB --- */}
      <div className={`absolute bottom-4 right-4 flex gap-1 p-2 ${CONTAINER_STYLE}`}>
         <MenuButton 
            icon={<User size={18} />} 
            label="Status" 
            hotkey="P" 
            onClick={toggleStatWindow} 
            color="text-[#FFD700]" // Gold
         />
         <MenuButton 
            icon={<Backpack size={18} />} 
            label="Inven" 
            hotkey="I" 
            onClick={toggleInventory} 
            color="text-[#44AAFF]" // Blue
         />
         <MenuButton 
            icon={<Sparkles size={18} />} 
            label="Skill" 
            hotkey="K" 
            onClick={toggleSkillWindow} 
            color="text-[#CC66FF]" // Purple
         />
         <MenuButton 
            icon={<Sword size={18} />} 
            label="Equip" 
            hotkey="E" 
            onClick={toggleEquipmentWindow} 
            color="text-[#FF6666]" // Red
         />
         
         {/* Vertical Separator */}
         <div className="w-px bg-[#C0A080]/30 mx-1 h-8 self-center"></div>

         <MenuButton 
            icon={<LogOut size={18} />} 
            label="Lobby" 
            onClick={() => window.location.reload()} 
            color="text-gray-400" 
            isDanger
         />
      </div>

    </div>
  );
};

// Helper Component for Menu Buttons
const MenuButton = ({ icon, label, hotkey, onClick, color, isDanger = false }: any) => (
    <button 
        onClick={onClick}
        className={`
            flex flex-col items-center justify-center w-14 h-12 
            bg-transparent hover:bg-white/5 
            ${isDanger ? 'hover:text-red-300' : 'text-[#B0B0B0] hover:text-white'}
            rounded-md transition-all group relative gap-0.5
        `}
    >
        <div className={`group-hover:scale-110 transition-transform ${isDanger ? '' : 'group-hover:' + color.replace('text-', 'text-')}`}>
            {React.cloneElement(icon, { strokeWidth: 2 })}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 group-hover:opacity-100 font-sans">{label}</span>
        {hotkey && <span className="absolute top-1 right-1 text-[8px] text-[#C0A080] opacity-40 font-mono">{hotkey}</span>}
    </button>
);

export default ClassicRPGUI;
