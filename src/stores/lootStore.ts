import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Item } from './inventoryStore';

export interface DroppedLoot {
  id: string;
  position: [number, number, number];
  item?: Item;
  gold?: number;
  timestamp: number;
}

interface LootStore {
  droppedItems: DroppedLoot[];
  spawnItem: (item: Item, position: [number, number, number]) => void;
  spawnGold: (amount: number, position: [number, number, number]) => void;
  removeLoot: (id: string) => void;
}

export const useLootStore = create<LootStore>()(
  subscribeWithSelector((set) => ({
    droppedItems: [],

    spawnItem: (item, position) => {
      const id = `loot_item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      set((state) => ({
        droppedItems: [
          ...state.droppedItems,
          { id, position, item, timestamp: Date.now() }
        ]
      }));
    },

    spawnGold: (amount, position) => {
      const id = `loot_gold_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      set((state) => ({
        droppedItems: [
          ...state.droppedItems,
          { id, position, gold: amount, timestamp: Date.now() }
        ]
      }));
    },

    removeLoot: (id) => {
      set((state) => ({
        droppedItems: state.droppedItems.filter(i => i.id !== id)
      }));
    }
  }))
);
