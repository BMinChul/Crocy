import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterData, JobType } from '../models/CharacterData';

interface LobbyStore {
  characterList: CharacterData[];
  createCharacter: (name: string, job: JobType) => void;
  deleteCharacter: (index: number) => void;
}

export const useLobbyStore = create<LobbyStore>()(
  persist(
    (set, get) => ({
      characterList: [],

      createCharacter: (name: string, job: JobType) => {
        const currentList = get().characterList;
        if (currentList.length >= 2) {
          console.warn('Character slot full!');
          return;
        }
        
        const newChar = new CharacterData(name, job);
        set({ characterList: [...currentList, newChar] });
      },

      deleteCharacter: (index: number) => {
        const currentList = get().characterList;
        const newList = currentList.filter((_, i) => i !== index);
        set({ characterList: newList });
      },
    }),
    {
      name: 'lobby-storage', // name of the item in localStorage
    }
  )
);
