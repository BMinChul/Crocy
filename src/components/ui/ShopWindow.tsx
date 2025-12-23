import React, { useState, useMemo } from 'react';
import { useInventoryStore, SHOP_ITEMS } from '../../stores/inventoryStore';
import { X, Coins, Filter } from 'lucide-react';
import Assets from '../../assets.json';
import { JobType } from '../../models/CharacterData';

const ShopWindow = () => {
  const { isShopOpen, toggleShop, gold, removeGold, addItem } = useInventoryStore();
  const [category, setCategory] = useState<'all' | 'warrior' | 'mage' | 'consumable'>('all');

  const filteredItems = useMemo(() => {
    return SHOP_ITEMS.filter(item => {
      if (category === 'all') return true;
      if (category === 'consumable') return item.type === 'consumable';
      if (category === 'warrior') return item.requiredClass === JobType.Warrior;
      if (category === 'mage') return item.requiredClass === JobType.Mage;
      return true;
    }).sort((a, b) => (a.requiredLevel || 0) - (b.requiredLevel || 0)); // Sort by level
  }, [category]);

  if (!isShopOpen) return null;

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (!item.price) return;
    
    if (gold >= item.price) {
      const success = removeGold(item.price);
      if (success) {
        addItem(item);
        // Optional: Show a small notification or sound
      }
    } else {
      alert("Not enough gold!");
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative w-[500px] h-[600px] pointer-events-auto animate-fade-in-up">
        {/* Background Frame */}
        <img 
          src={Assets.ui.frame.url} 
          alt="Shop Frame" 
          className="absolute inset-0 w-full h-full object-fill rounded-xl shadow-2xl"
        />

        {/* Content Container */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b-2 border-yellow-700/30 pb-4">
            <h2 className="text-3xl font-bold text-yellow-900 font-serif tracking-wider">Merchant Shop</h2>
            <button 
              onClick={toggleShop}
              className="p-1 hover:bg-red-500/20 rounded-full transition-colors group"
            >
              <X className="w-8 h-8 text-yellow-900 group-hover:text-red-600" />
            </button>
          </div>

          {/* Gold Display */}
          <div className="flex items-center justify-between mb-4 bg-black/20 p-2 rounded-lg">
             <div className="flex gap-2">
                <button 
                  onClick={() => setCategory('all')}
                  className={`px-3 py-1 rounded text-sm font-bold transition-colors ${category === 'all' ? 'bg-yellow-600 text-white' : 'bg-white/20 text-yellow-900 hover:bg-white/40'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setCategory('warrior')}
                  className={`px-3 py-1 rounded text-sm font-bold transition-colors ${category === 'warrior' ? 'bg-red-600 text-white' : 'bg-white/20 text-yellow-900 hover:bg-white/40'}`}
                >
                  Warrior
                </button>
                <button 
                  onClick={() => setCategory('mage')}
                  className={`px-3 py-1 rounded text-sm font-bold transition-colors ${category === 'mage' ? 'bg-blue-600 text-white' : 'bg-white/20 text-yellow-900 hover:bg-white/40'}`}
                >
                  Mage
                </button>
                <button 
                  onClick={() => setCategory('consumable')}
                  className={`px-3 py-1 rounded text-sm font-bold transition-colors ${category === 'consumable' ? 'bg-green-600 text-white' : 'bg-white/20 text-yellow-900 hover:bg-white/40'}`}
                >
                  Items
                </button>
             </div>
             
             <div className="flex items-center">
                <Coins className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-xl font-bold text-yellow-100">{gold} G</span>
             </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center bg-white/50 p-3 rounded-lg border border-yellow-900/20 hover:bg-white/80 transition-colors"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-black/20 rounded border border-yellow-900/30 flex items-center justify-center mr-4 shrink-0">
                  <img src={item.iconUrl} alt={item.name} className="w-12 h-12 pixelated" />
                </div>

                {/* Info */}
                <div className="flex-1 mr-4">
                  <h3 className="font-bold text-yellow-900">{item.name}</h3>
                  <p className="text-xs text-yellow-800/80 line-clamp-2">{item.description}</p>
                  <div className="flex gap-1 mt-1">
                    {item.element && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block
                        ${item.element === 'Fire' ? 'bg-red-100 text-red-700' : 
                            item.element === 'Water' ? 'bg-blue-100 text-blue-700' :
                            item.element === 'Earth' ? 'bg-amber-100 text-amber-700' :
                            item.element === 'Wind' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                        }
                        `}>
                        {item.element}
                        </span>
                    )}
                    {item.requiredLevel && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                            Lv.{item.requiredLevel}
                        </span>
                    )}
                  </div>
                </div>

                {/* Price & Buy Button */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center font-bold text-yellow-900">
                    <span>{item.price} G</span>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={gold < (item.price || 0)}
                    className={`px-4 py-1 rounded font-bold text-sm shadow-sm transition-all
                      ${gold >= (item.price || 0)
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500 hover:scale-105 active:scale-95' 
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }
                    `}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopWindow;
