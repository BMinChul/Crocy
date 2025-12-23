import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import Assets from '../assets.json';
import { ElementType, useCombatStore } from './combatStore';
import { useLocalPlayerStore } from './localPlayerStore';
import { useNotificationStore } from './notificationStore';
import { useLootStore } from './lootStore';
import { usePlayerActionStore } from './playerActionStore';
import { useGameStore } from './gameStore';

import { generateItems } from '../constants/items';
import { JobType } from '../models/CharacterData';

export type ItemType = 'weapon' | 'armor' | 'helmet' | 'necklace' | 'ring' | 'consumable' | 'misc';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  iconUrl: string;
  description?: string;
  element?: ElementType;
  stats?: {
    damage?: number; // Physical Attack
    defense?: number; // Physical Defense
    health?: number;
    magicDamage?: number; // MDAM
    magicDefense?: number; // MAC
    hit?: number; // Accuracy
    magicHit?: number; // Magic Accuracy
    crit?: number; // Critical
    str?: number;
    int?: number;
    dex?: number;
  };
  weight: number;
  price?: number;
  stackable?: boolean;
  quantity: number; 
  requiredLevel?: number;
  requiredClass?: JobType;
  plusLevel?: number; // Upgrade Level (+1, +2...)
  effect?: {
    type: 'restore_hp' | 'restore_mp' | 'teleport_town';
    value: number;
  };
}

export interface InventoryStore {
  isOpen: boolean;
  toggleInventory: () => void;
  
  isShopOpen: boolean;
  toggleShop: () => void;
  
  gold: number;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;

  items: Item[];
  capacity: number;
  
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    helmet: Item | null;
    necklace: Item | null;
    ring1: Item | null;
    ring2: Item | null;
  };
  
  quickSlots: { [slot: number]: string }; // slot number (1-5) -> itemId
  assignQuickSlot: (slot: number, itemId: string) => void;
  
  addItem: (item: Partial<Item> & { id: string; name: string; type: ItemType; iconUrl: string; weight: number }) => boolean;
  removeItem: (itemId: string, quantity?: number) => Item | null;
  swapItems: (fromIndex: number, toIndex: number) => void;
  dropItem: (index: number) => void;
  consumeItem: (itemId: string) => boolean;
  equipItem: (item: Item) => void;
  unequipItem: (slot: 'weapon' | 'armor' | 'helmet' | 'necklace' | 'ring1' | 'ring2') => void;
  
  getCurrentWeight: () => number;
  canCarry: (item: Item) => boolean;
}

// Initial Items with Quantity
const INITIAL_ITEMS: Item[] = [
  {
    id: 'potion_hp_small',
    name: 'Small HP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_fire.url,
    description: 'Restores 50 HP.',
    weight: 1.0,
    price: 50,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_hp', value: 50 }
  },
  {
    id: 'potion_hp_medium',
    name: 'Medium HP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_fire.url,
    description: 'Restores 150 HP.',
    weight: 3.0,
    price: 120,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_hp', value: 150 }
  },
  {
    id: 'potion_hp_large',
    name: 'Large HP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_fire.url,
    description: 'Restores 300 HP.',
    weight: 5.0,
    price: 250,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_hp', value: 300 }
  },
  {
    id: 'potion_mp_small',
    name: 'Small MP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_water.url,
    description: 'Restores 50 MP.',
    weight: 1.0,
    price: 50,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_mp', value: 50 }
  },
  {
    id: 'potion_mp_medium',
    name: 'Medium MP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_water.url,
    description: 'Restores 150 MP.',
    weight: 3.0,
    price: 120,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_mp', value: 150 }
  },
  {
    id: 'potion_mp_large',
    name: 'Large MP Potion',
    type: 'consumable',
    iconUrl: Assets.ui.icon_water.url,
    description: 'Restores 300 MP.',
    weight: 5.0,
    price: 250,
    stackable: true,
    quantity: 1,
    effect: { type: 'restore_mp', value: 300 }
  },
  {
    id: 'return_stone',
    name: 'Return Stone',
    type: 'consumable',
    iconUrl: Assets.ui.return_stone?.url || Assets.ui.icon_water.url,
    description: 'Teleports you to town. 3s Cast.',
    weight: 0.5,
    price: 100,
    stackable: true,
    quantity: 1,
    effect: { type: 'teleport_town', value: 0 }
  },
  {
    id: 'starter_wooden_sword',
    name: 'Wooden Sword',
    type: 'weapon',
    iconUrl: Assets.ui.icon_sword.url,
    stats: { damage: 5 },
    weight: 10.0,
    quantity: 1,
    description: 'A simple practice sword made of wood.'
  },
  {
    id: 'starter_sword',
    name: 'Iron Sword',
    type: 'weapon',
    iconUrl: Assets.ui.icon_sword.url,
    stats: { damage: 10 },
    weight: 10.0,
    quantity: 1,
    description: 'A standard iron sword.'
  },
  {
    id: 'starter_armor',
    name: 'Iron Armor',
    type: 'armor',
    iconUrl: Assets.ui.icon_armor.url,
    stats: { defense: 15 },
    weight: 15.0,
    quantity: 1,
    description: 'Sturdy iron chestplate.'
  },
  {
    id: 'starter_helmet',
    name: 'Iron Helmet',
    type: 'helmet',
    iconUrl: Assets.ui.icon_helmet.url,
    stats: { defense: 5 },
    weight: 5.0,
    quantity: 1,
    description: 'Basic head protection.'
  },
  {
    id: 'necklace_fire',
    name: 'Fire Necklace',
    type: 'necklace',
    iconUrl: Assets.ui.icon_fire.url,
    element: 'Fire',
    description: 'Imbues attacks with Fire element.',
    weight: 2.0,
    price: 10,
    quantity: 1
  },
  {
    id: 'necklace_water',
    name: 'Water Necklace',
    type: 'necklace',
    iconUrl: Assets.ui.icon_water.url,
    element: 'Water',
    description: 'Imbues attacks with Water element.',
    weight: 2.0,
    price: 10,
    quantity: 1
  },
  {
    id: 'necklace_earth',
    name: 'Earth Necklace',
    type: 'necklace',
    iconUrl: Assets.ui.icon_earth.url,
    element: 'Earth',
    description: 'Imbues attacks with Earth element.',
    weight: 2.0,
    price: 10,
    quantity: 1
  },
  {
    id: 'necklace_wind',
    name: 'Wind Necklace',
    type: 'necklace',
    iconUrl: Assets.ui.icon_wind.url,
    element: 'Wind',
    description: 'Imbues attacks with Wind element.',
    weight: 2.0,
    price: 10,
    quantity: 1
  },
  ...generateItems()
];

export const SHOP_ITEMS = INITIAL_ITEMS.filter(item => item.price);

const calculateTotalWeight = (items: Item[]) => {
  return items.reduce((total, item) => total + (item.weight * (item.quantity || 1)), 0);
};

export const useInventoryStore = create<InventoryStore>()(
  subscribeWithSelector((set, get) => ({
    isOpen: false,
    toggleInventory: () => set((state) => ({ isOpen: !state.isOpen })),
    
    isShopOpen: false,
    toggleShop: () => set((state) => ({ isShopOpen: !state.isShopOpen })),
    
    gold: 100,
    addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
    removeGold: (amount) => {
      const { gold } = get();
      if (gold < amount) return false;
      set({ gold: gold - amount });
      return true;
    },

    items: INITIAL_ITEMS.filter(i => !i.price), 
    capacity: 20,
    
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      necklace: null,
      ring1: null,
      ring2: null,
    },
    
    quickSlots: {},

    getCurrentWeight: () => {
      return calculateTotalWeight(get().items);
    },

    canCarry: (item) => {
      const { items } = get();
      const incomingQty = item.quantity || 1;
      const itemWeight = item.weight * incomingQty;
      const currentWeight = calculateTotalWeight(items);
      const maxWeight = useLocalPlayerStore.getState().state.weight;
      
      return currentWeight + itemWeight <= maxWeight;
    },

    assignQuickSlot: (slot, itemId) => {
      const { items } = get();
      const item = items.find(i => i.id === itemId);
      
      if (!item) return;

      // STRICT RULE: Only Consumables allowed in Quickslots
      if (item.type !== 'consumable') {
          useNotificationStore.getState().addNotification("Equipment cannot be placed in a Quickslot.", "error");
          return;
      }

      set((state) => ({
        quickSlots: { ...state.quickSlots, [slot]: itemId }
      }));
      
      useNotificationStore.getState().addNotification(`Registered to Slot ${slot}`, "success");
    },
    
    addItem: (item) => {
      const { items, capacity } = get();
      
      // Calculate weight of incoming item(s)
      const incomingQty = item.quantity || 1;
      const itemWeight = item.weight * incomingQty;
      const currentWeight = calculateTotalWeight(items);
      const maxWeight = useLocalPlayerStore.getState().state.weight; 
      
      if (currentWeight + itemWeight > maxWeight) {
        useNotificationStore.getState().addNotification("Inventory too heavy!", "warning", "weight_full");
        return false;
      }
      
      // Check for existing item by ID
      const existingItemIndex = items.findIndex(i => i.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Exists: Increment quantity
        const existingItem = items[existingItemIndex];
        const newQuantity = (existingItem.quantity || 1) + incomingQty;
        
        // Constraint: Max quantity per slot is 99
        if (newQuantity > 99) {
          useNotificationStore.getState().addNotification("Cannot carry more of this item (Max 99).", "warning", "max_qty");
          return false;
        }
        
        const newItems = [...items];
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        set({ items: newItems });
        return true;
      } else {
        // Does not exist: Add new item
        if (items.length >= capacity) {
          useNotificationStore.getState().addNotification("Inventory full!", "warning", "inv_full");
          return false;
        }

        const newItem: Item = {
          ...item,
          quantity: incomingQty,
        } as Item; 
        
        set({ items: [...items, newItem] });
        return true;
      }
    },
    
    removeItem: (itemId, amount = 1) => {
      let removedItem: Item | null = null;
      set((state) => {
        const existingItemIndex = state.items.findIndex(i => i.id === itemId);
        if (existingItemIndex === -1) return state;

        const existingItem = state.items[existingItemIndex];
        const currentQty = existingItem.quantity || 1;
        
        let newItems = [...state.items];
        
        if (currentQty > amount) {
           // Reduce stack
           newItems[existingItemIndex] = {
             ...existingItem,
             quantity: currentQty - amount
           };
           removedItem = { ...existingItem, quantity: amount };
        } else {
           // Remove completely
           removedItem = { ...existingItem };
           newItems = state.items.filter(i => i.id !== itemId);
        }

        // Check equipment if removed completely
        const newEquipment = { ...state.equipment };
        // If the item doesn't exist in newItems anymore, unequip it
        if (!newItems.find(i => i.id === itemId)) {
             (Object.keys(newEquipment) as Array<keyof typeof newEquipment>).forEach((slot) => {
              if (newEquipment[slot]?.id === itemId) {
                newEquipment[slot] = null;
              }
            });
        }
        
        return { items: newItems, equipment: newEquipment };
      });
      return removedItem;
    },

    swapItems: (fromIndex, toIndex) => {
      set((state) => {
        const newItems = [...state.items];
        // Validate indices against array length
        if (fromIndex < 0 || fromIndex >= newItems.length) return state;
        
        // If dragging to a slot beyond current array length, it means moving to end
        // BUT, drag and drop usually works with grid indices (0-19)
        // Since we store items as a compacted array, this is tricky.
        // We need to implement a full grid system (array of 20 items, some null)
        // OR, just swap the items in the list if both exist.
        // If toIndex is empty (>= length), move to end.
        
        // For simplicity with current system:
        // We'll trust the caller passes valid array indices.
        // If toIndex >= length, we move fromIndex to end.
        
        if (toIndex >= newItems.length) {
            const [movedItem] = newItems.splice(fromIndex, 1);
            newItems.push(movedItem);
            return { items: newItems };
        }

        const temp = newItems[fromIndex];
        newItems[fromIndex] = newItems[toIndex];
        newItems[toIndex] = temp;
        return { items: newItems };
      });
    },

    dropItem: (index) => {
        const { items, removeItem } = get();
        if (index < 0 || index >= items.length) return;
        const item = items[index];
        
        const qtyToDrop = item.quantity || 1;

        const removed = removeItem(item.id, qtyToDrop);
        
        if (removed) {
             const playerPos = useLocalPlayerStore.getState().state.position;
             // Spawn slightly in front
             const dropPos: [number, number, number] = [
                 playerPos.x + (Math.random() - 0.5), 
                 playerPos.y + 0.5, 
                 playerPos.z + (Math.random() - 0.5)
             ];
             useLootStore.getState().spawnItem(removed, dropPos);
             useNotificationStore.getState().addNotification(`Dropped ${removed.name}`, "info");
        }
    },

    consumeItem: (itemId) => {
      const { items, removeItem } = get();
      const item = items.find(i => i.id === itemId);
      
      if (!item || !item.effect) return false;

      // Handle Teleport (Return Stone)
      if (item.effect.type === 'teleport_town') {
         // Start Casting
         usePlayerActionStore.getState().startCasting(3000, "Returning to Town...", () => {
             const player = useLocalPlayerStore.getState();
             
             // Fully Heal
             player.restoreHp(9999);
             player.restoreMp(9999);
             
             // Consume Item (Actually remove it now)
             get().removeItem(itemId, 1);

             // Teleport
             const resetPosition = { x: 0, y: 2, z: 0 };
             window.dispatchEvent(new CustomEvent('force-teleport', { detail: resetPosition }));
             
             useNotificationStore.getState().addNotification("Welcome back to Asgard!", "success");
         });
         return true; 
      }

      // Apply Effect
      const playerPos = useLocalPlayerStore.getState().state.position;
      const position: [number, number, number] = [playerPos.x, playerPos.y + 2, playerPos.z];

      if (item.effect.type === 'restore_hp') {
        useLocalPlayerStore.getState().restoreHp(item.effect.value);
        useCombatStore.getState().addDamageNumber(position, item.effect.value, 'heal');
      } else if (item.effect.type === 'restore_mp') {
        useLocalPlayerStore.getState().restoreMp(item.effect.value);
        useCombatStore.getState().addDamageNumber(position, item.effect.value, 'heal');
      }

      removeItem(itemId, 1);
      return true;
    },
    
    equipItem: (item) => {
      const { equipment } = get();
      
      // Validation: Check Requirements
      const playerState = useLocalPlayerStore.getState().state;
      
      if (item.requiredLevel && playerState.level < item.requiredLevel) {
          useNotificationStore.getState().addNotification(`Req: Lv ${item.requiredLevel}. You are Lv ${playerState.level}`, "error");
          return;
      }
      
      if (item.requiredClass && playerState.job !== item.requiredClass) {
          useNotificationStore.getState().addNotification(`Req: ${item.requiredClass}. You are ${playerState.job}`, "error");
          return;
      }
      
      let slot: keyof typeof equipment | null = null;
      if (item.type === 'weapon') slot = 'weapon';
      if (item.type === 'armor') slot = 'armor';
      if (item.type === 'helmet') slot = 'helmet';
      if (item.type === 'necklace') slot = 'necklace';
      if (item.type === 'ring') {
          if (!equipment.ring1) slot = 'ring1';
          else if (!equipment.ring2) slot = 'ring2';
          else slot = 'ring1'; 
      }
      
      if (!slot) return;
      
      const newEquipment = {
        ...equipment,
        [slot]: item,
      };

      set({ equipment: newEquipment });

      if (slot === 'necklace') {
        useLocalPlayerStore.getState().setElement(item.element || 'Neutral');
      }

      calculateAndSetEquipmentStats(newEquipment);
    },
    
    unequipItem: (slot) => {
      const { equipment } = get();
      const newEquipment = {
        ...equipment,
        [slot]: null,
      };

      set({ equipment: newEquipment });

      if (slot === 'necklace') {
        useLocalPlayerStore.getState().setElement('Neutral');
      }

      calculateAndSetEquipmentStats(newEquipment);
    },
  }))
);

const calculateAndSetEquipmentStats = (equipment: InventoryStore['equipment']) => {
    let totalStats = {
        attack: 0,
        defense: 0,
        magic: 0,
        hit: 0,
        crit: 0,
        weight: 0,
        mHit: 0,
        mDef: 0,
        hp: 0,
        mp: 0,
        str: 0,
        int: 0,
        dex: 0
    };

    Object.values(equipment).forEach(item => {
        if (!item || !item.stats) return;
        
        const bonus = (item.plusLevel || 0) * 2;

        if (item.stats.damage) totalStats.attack += item.stats.damage + bonus;
        if (item.stats.defense) totalStats.defense += item.stats.defense + bonus;
        if (item.stats.magicDamage) totalStats.magic += item.stats.magicDamage + bonus;
        if (item.stats.magicDefense) totalStats.mDef += item.stats.magicDefense + bonus;
        
        if (item.stats.hit) totalStats.hit += item.stats.hit;
        if (item.stats.magicHit) totalStats.mHit += item.stats.magicHit;
        if (item.stats.crit) totalStats.crit += item.stats.crit;
        if (item.stats.health) totalStats.hp += item.stats.health;
        if (item.stats.str) totalStats.str += item.stats.str;
        if (item.stats.int) totalStats.int += item.stats.int;
        if (item.stats.dex) totalStats.dex += item.stats.dex;
    });

    useLocalPlayerStore.getState().setEquipmentStats(totalStats);
};
