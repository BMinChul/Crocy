import { create } from 'zustand';

interface PlayerActionState {
  punch: boolean;
  kick: boolean;
  meleeAttack: boolean;
  cast: boolean;
  isAutoChasing: boolean;
  activeSkillId: string | null;
  casting: {
    isCasting: boolean;
    duration: number; // in ms
    startTime: number;
    label: string;
    onComplete: (() => void) | null;
  };
}

interface PlayerActionStore extends PlayerActionState {
  setPlayerAction: (action: string, pressed: boolean) => void;
  getPlayerAction: (action: string) => boolean;
  resetAllPlayerActions: () => void;
  setIsAutoChasing: (isChasing: boolean) => void;
  setActiveSkillId: (skillId: string | null) => void;
  startCasting: (duration: number, label: string, onComplete: () => void) => void;
  cancelCasting: () => void;
}

export const usePlayerActionStore = create<PlayerActionStore>((set, get) => ({
  punch: false,
  kick: false,
  meleeAttack: false,
  cast: false,
  isAutoChasing: false,
  activeSkillId: null,
  casting: {
    isCasting: false,
    duration: 0,
    startTime: 0,
    label: '',
    onComplete: null,
  },

  setPlayerAction: (action: string, pressed: boolean) => {
    // Cancel casting if moving or attacking
    if (pressed && ['punch', 'kick', 'meleeAttack', 'cast'].includes(action)) {
        get().cancelCasting();
    }
    set((state) => ({ ...state, [action]: pressed }));
  },

  getPlayerAction: (action: string): boolean => {
    const state = get();
    return (state as any)[action];
  },

  resetAllPlayerActions: () => {
    set({
      punch: false,
      kick: false,
      meleeAttack: false,
      cast: false,
      isAutoChasing: false,
      activeSkillId: null,
      casting: { isCasting: false, duration: 0, startTime: 0, label: '', onComplete: null }
    });
  },

  setIsAutoChasing: (isChasing: boolean) => {
    if (isChasing) get().cancelCasting();
    set({ isAutoChasing: isChasing });
  },

  setActiveSkillId: (skillId: string | null) => {
    set({ activeSkillId: skillId });
  },

  startCasting: (duration, label, onComplete) => {
    set({
      casting: {
        isCasting: true,
        duration,
        startTime: Date.now(),
        label,
        onComplete
      }
    });
  },

  cancelCasting: () => {
    const { casting } = get();
    if (casting.isCasting) {
      set({
        casting: { isCasting: false, duration: 0, startTime: 0, label: '', onComplete: null }
      });
    }
  }
}));
