import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import UIWindowFrame from './common/UIWindowFrame';
import { Shield, Sword, User } from 'lucide-react';

const EquipmentWindow = () => {
  const { isEquipmentWindowOpen, toggleEquipmentWindow } = useGameStore();
  const { equipment, unequipItem } = useInventoryStore();
  const playerState = useLocalPlayerStore((state) => state.state);

  if (!isEquipmentWindowOpen) return null;

  // Helper for rendering an equipment slot
  const renderSlot = (label: string, slotName: keyof typeof equipment, iconPlaceholder: React.ReactNode) => {
    const item = equipment[slotName];
    
    return (
      <div className="flex flex-col items-center gap-1">
        <div 
          className={`ui-slot cursor-pointer ${item ? 'border-yellow-600/50' : ''}`}
          onClick={() => unequipItem(slotName)}
          title={item ? `${item.name} (Click to Unequip)` : label}
        >
          {item ? (
            <div className="relative w-full h-full p-1">
               <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
               {item.plusLevel ? (
                   <div className="absolute bottom-0 right-0 text-[9px] font-bold text-yellow-400 bg-black/60 px-1 rounded-tl">
                       +{item.plusLevel}
                   </div>
               ) : null}
            </div>
          ) : (
            <div className="opacity-20 text-gray-400">
                {iconPlaceholder}
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <UIWindowFrame 
        title="Equipment" 
        onClose={toggleEquipmentWindow} 
        width="w-[500px]" 
        height="h-[450px]"
    >
        <div className="flex h-full gap-4">
            
            {/* Left Side: Character Silhouette & Slots */}
            <div className="flex-1 bg-black/20 rounded border border-white/5 p-4 relative flex flex-col items-center justify-center">
                
                {/* Silhouette Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <User size={200} />
                </div>

                {/* Slots Layout */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    
                    {/* Head */}
                    {renderSlot('Head', 'helmet', <div className="text-xl">H</div>)}
                    
                    {/* Middle Row */}
                    <div className="flex gap-6 items-center">
                        {renderSlot('Weapon', 'weapon', <Sword size={20} />)}
                        {renderSlot('Armor', 'armor', <Shield size={20} />)}
                        {renderSlot('Neck', 'necklace', <div className="text-xl">N</div>)}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex gap-10">
                        {renderSlot('Ring', 'ring1', <div className="text-sm">R1</div>)}
                        {renderSlot('Ring', 'ring2', <div className="text-sm">R2</div>)}
                    </div>

                </div>
            </div>

            {/* Right Side: Core Stats */}
            <div className="w-48 bg-black/20 rounded border border-white/5 p-3 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-widest border-b border-gray-700 pb-1 mb-1 text-center">
                    Core Stats
                </h3>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label">Damage</span>
                        <span className="ui-value font-bold">{(playerState.attack || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label">Accuracy</span>
                        <span className="ui-value font-bold">{(playerState.hit || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label">Armor</span>
                        <span className="ui-value font-bold">{(playerState.defense || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label">Magic Def</span>
                        <span className="ui-value font-bold">{(playerState.mDef || 0).toFixed(0)}</span>
                    </div>

                    <div className="h-px bg-gray-700 my-2" />

                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label text-red-400/80">STR</span>
                        <span className="ui-value text-gray-300">{playerState.str}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label text-blue-400/80">INT</span>
                        <span className="ui-value text-gray-300">{playerState.int}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="ui-label text-green-400/80">DEX</span>
                        <span className="ui-value text-gray-300">{playerState.dex}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2 border-t border-gray-700">
                     <div className="flex justify-between items-center px-1">
                         <span className="ui-label text-[11px]">Weight</span>
                         <span className="ui-value text-[11px] text-gray-400">
                             {useInventoryStore.getState().getCurrentWeight().toFixed(1)} / {playerState.weight}
                         </span>
                     </div>
                </div>
            </div>
        </div>
    </UIWindowFrame>
  );
};

export default EquipmentWindow;
