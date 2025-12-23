import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameStore {
  isMapPhysicsReady: boolean;
  setMapPhysicsReady: (ready: boolean) => void;
  dialogue: {
    isOpen: boolean;
    speakerName: string;
    text: string;
    portraitUrl?: string;
    options?: { label: string; onClick: () => void }[];
  };
  openDialogue: (speakerName: string, text: string, portraitUrl?: string, options?: { label: string; onClick: () => void }[]) => void;
  closeDialogue: () => void;
  currentMap: 'town' | 'dungeon';
  setMap: (map: 'town' | 'dungeon') => void;
  isTransitioning: boolean;
  setTransitioning: (isTransitioning: boolean) => void;
  teleportToMap: (map: 'town' | 'dungeon') => void;
  notification: string | null;
  showNotification: (message: string) => void;
  quest: {
    isActive: boolean;
    progress: number;
    target: number;
    title: string;
  };
  startQuest: () => void;
  updateQuestProgress: (amount: number) => void;
  isVictory: boolean;
  setVictory: (victory: boolean) => void;
  isGoldenWeapon: boolean;
  setGoldenWeapon: (isGolden: boolean) => void;
  isStatWindowOpen: boolean;
  toggleStatWindow: () => void;
  isSkillWindowOpen: boolean;
  toggleSkillWindow: () => void;
  isEquipmentWindowOpen: boolean;
  toggleEquipmentWindow: () => void;
  attackSignal: number;
  triggerAttack: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    isMapPhysicsReady: false,
    setMapPhysicsReady: (ready: boolean) => set({ isMapPhysicsReady: ready }),
    attackSignal: 0,
    triggerAttack: () => set({ attackSignal: Date.now() }),
    isVictory: false,
    setVictory: (victory) => set({ isVictory: victory }),
    isGoldenWeapon: false,
    setGoldenWeapon: (isGolden) => set({ isGoldenWeapon: isGolden }),
    isStatWindowOpen: false,
    toggleStatWindow: () => set((state) => ({ isStatWindowOpen: !state.isStatWindowOpen })),
    isSkillWindowOpen: false,
    toggleSkillWindow: () => set((state) => ({ isSkillWindowOpen: !state.isSkillWindowOpen })),
    isEquipmentWindowOpen: false,
    toggleEquipmentWindow: () => set((state) => ({ isEquipmentWindowOpen: !state.isEquipmentWindowOpen })),
    dialogue: {
      isOpen: false,
      speakerName: '',
      text: '',
    },
    currentMap: 'town',
    setMap: (map) => set({ currentMap: map }),
    isTransitioning: false,
    setTransitioning: (isTransitioning) => set({ isTransitioning }),
    teleportToMap: (map) => {
      // INSTANT Teleport without fade
      set({ currentMap: map });
    },
    notification: null,
    showNotification: (message: string) => {
      set({ notification: message });
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    },
    quest: {
      isActive: false,
      progress: 0,
      target: 5,
      title: 'Hunt Slimes',
    },
    startQuest: () =>
      set({
        quest: {
          isActive: true,
          progress: 0,
          target: 5,
          title: 'Hunt Slimes',
        },
      }),
    updateQuestProgress: (amount) =>
      set((state) => {
        if (!state.quest.isActive) return {};
        const newProgress = Math.min(state.quest.progress + amount, state.quest.target);
        const isComplete = newProgress >= state.quest.target;
        return {
            quest: {
                ...state.quest,
                progress: newProgress,
                title: isComplete ? 'Quest Complete! Return to Elder' : state.quest.title
            }
        };
      }),
    openDialogue: (speakerName, text, portraitUrl, options) =>
      set({
        dialogue: {
          isOpen: true,
          speakerName,
          text,
          portraitUrl,
          options,
        },
      }),
    closeDialogue: () =>
      set((state) => ({
        dialogue: { ...state.dialogue, isOpen: false },
      })),
  })),
);
