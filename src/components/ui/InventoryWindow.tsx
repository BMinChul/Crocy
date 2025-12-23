import React, { useEffect, useState, useRef } from 'react';
import { useInventoryStore, Item } from '../../stores/inventoryStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import UIWindowFrame from './common/UIWindowFrame';
import ConfirmationModal from './ConfirmationModal';
import Assets from '../../assets.json';

const InventoryWindow = () => {
  const { isOpen, toggleInventory, items, equipment, equipItem, unequipItem, assignQuickSlot, dropItem, isShopOpen } = useInventoryStore();
  const playerState = useLocalPlayerStore((state) => state.state);
  
  // Weight Calculation
  const currentWeight = items.reduce((total, item) => total + (item.weight * (item.quantity || 1)), 0);
  const maxWeight = playerState.weight || 100;
  const isOverweight = currentWeight > maxWeight;

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; item: Item | null }>({
    visible: false, x: 0, y: 0, item: null,
  });

  // Drop Confirmation State
  const [dropConfirm, setDropConfirm] = useState<{ isOpen: boolean; item: Item | null; index: number }>({
      isOpen: false, item: null, index: -1
  });

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'i') toggleInventory();
      if (e.key === 'Escape') {
          if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
          else if (dropConfirm.isOpen) setDropConfirm({ ...dropConfirm, isOpen: false });
          else if (isOpen) toggleInventory();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleInventory, contextMenu, dropConfirm]);

  // Close context menu when inventory closes
  useEffect(() => {
    if (!isOpen) {
        setSelectedItem(null);
        setContextMenu({ ...contextMenu, visible: false });
        setDropConfirm({ ...dropConfirm, isOpen: false });
    }
  }, [isOpen]);

  // Global click to close context menu
  useEffect(() => {
      const handleClick = () => { if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false }); };
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, item: Item) => {
      e.preventDefault();
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item: item });
  };

  const handleAction = (action: 'equip' | 'unequip' | 'register' | 'drop', slot?: number) => {
      if (!contextMenu.item) return;
      const item = contextMenu.item;

      if (action === 'equip') {
          equipItem(item);
      } else if (action === 'unequip') {
          // Find slot
          let slotName: any = null;
           if (item.type === 'weapon') slotName = 'weapon';
           else if (item.type === 'armor') slotName = 'armor';
           else if (item.type === 'helmet') slotName = 'helmet';
           else if (item.type === 'necklace') slotName = 'necklace';
           else if (item.type === 'ring') {
               // Check which ring slot
               if (equipment.ring1?.id === item.id) slotName = 'ring1';
               else if (equipment.ring2?.id === item.id) slotName = 'ring2';
           }
           if (slotName) unequipItem(slotName);
      } else if (action === 'register' && slot) {
          assignQuickSlot(slot, item.id);
      } else if (action === 'drop') {
          // Find index
          const index = items.findIndex(i => i.id === item.id);
          if (index !== -1) {
             setDropConfirm({ isOpen: true, item, index });
          }
      }
      setContextMenu({ ...contextMenu, visible: false });
  };

  const handleConfirmDrop = () => {
      if (dropConfirm.index !== -1) {
          dropItem(dropConfirm.index);
      }
      setDropConfirm({ ...dropConfirm, isOpen: false });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal 
          isOpen={dropConfirm.isOpen}
          title="Discard Item?"
          message={`Are you sure you want to discard ${dropConfirm.item?.name}? It will be dropped on the ground.`}
          onConfirm={handleConfirmDrop}
          onCancel={() => setDropConfirm({ ...dropConfirm, isOpen: false })}
          confirmLabel="Discard"
          cancelLabel="Cancel"
      />

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.item && (
          <div 
            className="fixed bg-[#1a1a1a] border border-[#a88d57] shadow-[0_0_15px_rgba(0,0,0,0.8)] z-[10000] w-48 pointer-events-auto text-sm text-[#e0c890] font-serif rounded-sm"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              <div className="px-3 py-2 bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] border-b border-[#5a4d33] font-bold text-xs uppercase tracking-wider text-[#ffd700]">
                  {contextMenu.item.name}
              </div>
              
              <div className="py-1">
                  {/* Equipment Actions */}
                  {['weapon', 'armor', 'helmet', 'necklace', 'ring'].includes(contextMenu.item.type) && (
                       <>
                         {/* Check if equipped logic simplified for menu */}
                         <button 
                            className="w-full text-left px-4 py-2 hover:bg-[#3d3118] hover:text-white transition-colors flex items-center gap-2 group"
                            onClick={() => handleAction('equip')}
                         >
                            <span className="w-1.5 h-1.5 bg-[#a88d57] rotate-45 group-hover:bg-[#ffd700] transition-colors"></span>
                            Equip
                         </button>
                       </>
                  )}

                  {/* Consumable Actions */}
                  {contextMenu.item.type === 'consumable' && (
                      <div className="relative group/submenu">
                          <button className="w-full text-left px-4 py-2 hover:bg-[#3d3118] hover:text-white transition-colors flex items-center justify-between group">
                             <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#a88d57] rotate-45 group-hover:bg-[#ffd700] transition-colors"></span>
                                Register
                             </div>
                             <span className="text-[10px] opacity-70">▶</span>
                          </button>
                          
                          {/* Submenu for Slots */}
                          <div className="absolute left-full top-0 ml-1 bg-[#1a1a1a] border border-[#a88d57] shadow-xl w-32 hidden group-hover/submenu:block">
                              {[1,2,3,4,5].map(slot => (
                                 <button 
                                    key={slot} 
                                    className="w-full text-left px-4 py-2 hover:bg-[#3d3118] hover:text-white transition-colors text-xs"
                                    onClick={() => handleAction('register', slot)}
                                 >
                                    Slot {slot}
                                 </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="my-1 border-b border-white/10"></div>

                  {/* Discard Action */}
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-red-900/30 hover:text-red-300 text-red-400 transition-colors flex items-center gap-2"
                    onClick={() => handleAction('drop')}
                  >
                     <span className="w-1.5 h-1.5 bg-red-500/50 rotate-45"></span>
                     Discard
                  </button>
              </div>
          </div>
      )}

      <UIWindowFrame 
        title="Backpack" 
        onClose={toggleInventory} 
        width="w-[400px]" 
        height="h-[520px]"
      >
        <div className="flex flex-col h-full gap-3">
            
            {/* Inventory Grid */}
            <div className="flex-1 bg-black/20 rounded p-2 overflow-y-auto custom-scrollbar border border-white/5">
                 <div className="flex flex-wrap gap-1 content-start justify-start">
                    {items.map((item, index) => {
                        const isEquipped = 
                            (item.type === 'weapon' && equipment.weapon?.id === item.id) ||
                            (item.type === 'armor' && equipment.armor?.id === item.id) ||
                            (item.type === 'helmet' && equipment.helmet?.id === item.id) ||
                            (item.type === 'necklace' && equipment.necklace?.id === item.id) ||
                            (item.type === 'ring' && (equipment.ring1?.id === item.id || equipment.ring2?.id === item.id));

                        return (
                            <div 
                                key={item.id + index} 
                                className={`ui-slot cursor-pointer group relative
                                    ${selectedItem?.id === item.id ? 'active' : ''}
                                    ${isEquipped ? 'border-red-500/50 bg-red-900/10' : ''}
                                `}
                                onClick={() => setSelectedItem(item)}
                                onDoubleClick={() => {
                                    if (item.type === 'consumable') {
                                        // Consume logic
                                    } else {
                                        equipItem(item);
                                    }
                                }}
                                onContextMenu={(e) => handleContextMenu(e, item)}
                                title={item.name}
                            >
                                <img src={item.iconUrl} alt={item.name} className={`w-[32px] h-[32px] object-contain ${isEquipped ? 'opacity-100' : 'opacity-90'}`} />
                                
                                {isEquipped && (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-bold px-1 rounded-bl z-10 box-shadow-sm">E</div>
                                )}

                                {(item.quantity || 1) > 1 && (
                                    <span className="absolute bottom-0 right-0 text-white text-[10px] font-bold bg-black/80 px-1 rounded-tl shadow-sm">
                                        {item.quantity}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    {/* Empty Slots Filler */}
                    {Array.from({ length: Math.max(0, 35 - items.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="ui-slot opacity-30 pointer-events-none" />
                    ))}
                 </div>
            </div>

            {/* Bottom Info Section */}
            <div className="shrink-0 flex flex-col gap-2 border-t border-gray-700 pt-2">
                
                {/* Selected Item Info */}
                <div className="h-16 flex gap-3 items-center">
                    {selectedItem ? (
                        <>
                            <div className="ui-slot shrink-0 border-gray-600">
                                <img src={selectedItem.iconUrl} className="w-[32px] h-[32px] object-contain" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <div className="ui-body font-bold text-white truncate">
                                        {selectedItem.name} {selectedItem.plusLevel ? `+${selectedItem.plusLevel}` : ''}
                                    </div>
                                    <div className="ui-label text-[10px] uppercase">{selectedItem.type}</div>
                                </div>
                                <div className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                                    {selectedItem.description}
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="w-full text-center text-gray-500 italic text-xs">
                             Select an item to view details
                         </div>
                    )}
                </div>

                {/* Status Bar: Gold & Weight */}
                <div className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                    <div className="flex items-center gap-2">
                         <span className="ui-label font-bold text-yellow-500 drop-shadow-sm">GOLD</span>
                         <span className="ui-value text-white">{useInventoryStore.getState().gold.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="ui-label font-bold text-xs uppercase text-gray-400">Weight</span>
                         <span className={`ui-value font-mono text-xs ${isOverweight ? 'text-red-500 font-bold' : 'text-gray-300'}`}>
                            {currentWeight.toFixed(1)} / {maxWeight.toFixed(0)}
                         </span>
                    </div>
                </div>

            </div>

        </div>
      </UIWindowFrame>
    </>
  );
};

export default InventoryWindow;
