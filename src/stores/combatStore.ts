import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

export interface DamageNumber {
  id: string;
  position: [number, number, number];
  damage: number | string;
  timestamp: number;
  type?: 'normal' | 'effective' | 'weak' | 'heal' | 'loot';
}

export interface HitEffect {
  id: string;
  position: [number, number, number];
  timestamp: number;
}

export type ElementType = 'Neutral' | 'Fire' | 'Water' | 'Earth' | 'Wind';

export const getElementMultiplier = (attacker: ElementType, defender: ElementType): number => {
  if (attacker === 'Neutral' || defender === 'Neutral') return 1.0;
  
  // Same Element: 0.5x
  if (attacker === defender) return 0.5;

  // Cycle: Water > Fire > Wind > Earth > Water
  if (attacker === 'Water' && defender === 'Fire') return 1.5;
  if (attacker === 'Fire' && defender === 'Wind') return 1.5;
  if (attacker === 'Wind' && defender === 'Earth') return 1.5;
  if (attacker === 'Earth' && defender === 'Water') return 1.5;

  // Weaknesses (Reverse of above): 0.5x
  if (attacker === 'Fire' && defender === 'Water') return 0.5;
  if (attacker === 'Wind' && defender === 'Fire') return 0.5;
  if (attacker === 'Earth' && defender === 'Wind') return 0.5;
  if (attacker === 'Water' && defender === 'Earth') return 0.5;

  return 1.0;
};

export const calculateDamageWithElement = (baseDamage: number, attacker: ElementType, defender: ElementType) => {
  const multiplier = getElementMultiplier(attacker, defender);
  return {
    finalDamage: Math.floor(baseDamage * multiplier),
    multiplier,
    isEffective: multiplier > 1.0,
    isWeak: multiplier < 1.0
  };
};

interface CombatStore {
  damageNumbers: DamageNumber[];
  hitEffects: HitEffect[];
  addDamageNumber: (position: [number, number, number], damage: number | string, type?: 'normal' | 'effective' | 'weak' | 'heal' | 'loot') => void;
  addHitEffect: (position: [number, number, number]) => void;
  removeDamageNumber: (id: string) => void;
  removeHitEffect: (id: string) => void;
  // Key: instanceId, Value: Target object with details
  hitRegistry: Map<number, { onHit: (damage: number, element?: ElementType) => void; getPosition: () => { x: number; y: number; z: number } | undefined | THREE.Vector3; type: string; element?: ElementType; name?: string }>;
  registerTarget: (instanceId: number, target: { onHit: (damage: number, element?: ElementType) => void; getPosition: () => { x: number; y: number; z: number } | undefined | THREE.Vector3; type: string; element?: ElementType; name?: string }) => void;
  unregisterTarget: (instanceId: number) => void;
  
  // Target Lock-On System
  currentTargetId: number | null;
  setTarget: (id: number | null) => void;
}

export const useCombatStore = create<CombatStore>()(
  subscribeWithSelector((set, get) => ({
    damageNumbers: [],
    hitEffects: [],
    hitRegistry: new Map(),
    currentTargetId: null,

    setTarget: (id) => set({ currentTargetId: id }),

    addDamageNumber: (position, damage, type = 'normal') => {
      const id = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        damageNumbers: [
          ...state.damageNumbers,
          { id, position, damage, timestamp: Date.now(), type },
        ],
      }));

      // Auto remove after 1 second
      setTimeout(() => {
        get().removeDamageNumber(id);
      }, 1000);
    },

    addHitEffect: (position) => {
      const id = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        hitEffects: [
          ...state.hitEffects,
          { id, position, timestamp: Date.now() },
        ],
      }));

      // Auto remove after 0.5 second (particle lifetime)
      setTimeout(() => {
        get().removeHitEffect(id);
      }, 500);
    },

    removeDamageNumber: (id) => {
      set((state) => ({
        damageNumbers: state.damageNumbers.filter((dn) => dn.id !== id),
      }));
    },

    removeHitEffect: (id) => {
      set((state) => ({
        hitEffects: state.hitEffects.filter((he) => he.id !== id),
      }));
    },

    registerTarget: (instanceId, target) => {
      const registry = get().hitRegistry;
      registry.set(instanceId, target);
    },

    unregisterTarget: (instanceId) => {
      const registry = get().hitRegistry;
      registry.delete(instanceId);
    },
  })),
);
