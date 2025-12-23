import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// Import CharacterData for initialization logic
import { CharacterData, JobType } from '../models/CharacterData';
import { ElementType } from './combatStore';

type PlayerState = {
  position: THREE.Vector3;
  speed: number;
  
  // Derived Stats
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number; // DAM (Total)
  defense: number; // AC (Total)
  magic: number; // MDAM (Total)
  hit: number; // HIT (Total)
  crit: number; // CRI (Total)
  weight: number; // WEIGHT (Total)
  mHit: number; // MHIT (Total)
  mDef: number; // MAC (Total)
  
  // Equipment Bonus Stats
  equipmentStats: {
    attack: number;
    defense: number;
    magic: number;
    hit: number;
    crit: number;
    weight: number;
    mHit: number;
    mDef: number;
    hp: number;
    mp: number;
    str: number;
    int: number;
    dex: number;
  };

  // Primary Stats (Attributes)
  str: number;
  int: number;
  dex: number;
  statPoints: number;
  skillPoints: number;

  baseAttack: number;
  baseDefense: number;
  baseMagic: number;
  
  level: number;
  exp: number;
  maxExp: number;
};

type LocalPlayerState = {
  state: PlayerState & {
    teleportRequest: { x: number; y: number; z: number } | null;
    job: JobType;
    element: ElementType;
  };
  setSpeed: (speed: number) => void;
  setPosition: (x: number, y: number, z: number) => void;
  clearPosition: () => void;
  setHp: (hp: number) => void;
  setMp: (mp: number) => void;
  setExp: (exp: number) => void;
  setLevel: (level: number) => void;
  setElement: (element: ElementType) => void;
  takeDamage: (amount: number) => void;
  consumeMp: (amount: number) => void;
  gainExp: (amount: number, monsterLevel?: number) => void;
  setStats: (attack: number, defense: number, magic: number) => void;
  requestTeleport: (x: number, y: number, z: number) => void;
  clearTeleportRequest: () => void;
    setEquipmentStats: (stats: Partial<LocalPlayerState['state']['equipmentStats']>) => void;
  initializeFromData: (data: CharacterData) => void;
  
  // New Actions
  increaseStat: (stat: 'str' | 'int' | 'dex') => void;
  recalculateStats: () => void;
  restoreHp: (amount: number) => void;
  restoreMp: (amount: number) => void;
  debugSetLevel: (level: number) => void;
};

// Helper to calculate next level exp requirement (Asgard Manual Scale)
const getMaxExpForLevel = (level: number): number => {
  if (level === 1) return 10;
  if (level === 2) return 50;
  if (level === 3) return 150;
  // Scale up from Lv 3
  // Using a steep curve to Lv 99
  // Formula: Previous * 1.3 roughly
  return Math.floor(150 * Math.pow(1.15, level - 3));
};

// Helper to calculate derived stats based on Job and Attributes
const calculateDerivedStats = (str: number, int: number, dex: number, level: number, job: JobType) => {
    // HP (Max): Base + (STR * 15) + (Level * 20)
    const maxHp = 100 + (str * 15) + (level * 20);
    
    // MP (Max): Base + (INT * 10) + (Level * 10)
    const maxMp = 50 + (int * 10) + (level * 10);
    
    // DAM (Physical) Scaling
    let attack = 0;
    if (job === JobType.Warrior) {
        attack = (str * 4) + (level * 1.5);
    } else if (job === JobType.Rogue) {
        attack = (dex * 2) + (str * 1) + (level * 1.5);
    } else {
        // Mage / Default
        attack = (str * 1) + (level * 1);
    }
    
    // MDAM (Magic) Scaling
    let magic = 0;
    if (job === JobType.Warrior) {
        magic = (int * 1) + (str * 0.5);
    } else if (job === JobType.Rogue) {
        magic = (int * 1) + (dex * 1);
    } else if (job === JobType.Mage) {
        magic = (int * 4);
    } else {
        magic = (int * 1);
    }
    
    // AC (Defense)
    const defense = (str * 0.5) + (level * 1);
    
    // HIT (Accuracy)
    const hitBase = 80;
    let hit = hitBase + (dex * 1.5);
    if (job === JobType.Rogue) {
        hit = hitBase + (dex * 3.0);
    }
    
    // CRI (Critical)
    let crit = parseFloat((dex * 0.1).toFixed(1));
    if (job === JobType.Rogue) {
        crit = parseFloat(((str * 0.2) + (dex * 0.1)).toFixed(1));
    }
    
    // WEIGHT
    const weight = (str * 5) + (level * 2);
    
    // MHIT (Magic Hit)
    const mHitBase = 80;
    let mHit = mHitBase + (int * 1.5);
    if (job === JobType.Mage) {
        mHit = mHitBase + (int * 3);
    }
    
    // MAC (Magic Defense)
    const mDef = (int * 0.5) + (level * 1);

    return { maxHp, maxMp, attack, magic, defense, hit, crit, weight, mHit, mDef };
};

export const useLocalPlayerStore = create<LocalPlayerState>()(
  subscribeWithSelector((set, get) => ({
    state: {
      position: new THREE.Vector3(98, 1, 226),
      speed: 0,
      
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 21.5,
      defense: 0,
      magic: 0,
      hit: 80,
      crit: 0,
      weight: 52,
      mHit: 80,
      mDef: 0,
      
      equipmentStats: {
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
        dex: 0,
      },

      str: 10,
      int: 10,
      dex: 10,
      statPoints: 0,
      skillPoints: 0,
      
      baseAttack: 10,
      baseDefense: 0,
      baseMagic: 0,
      
      level: 1,
      exp: 0,
      maxExp: 10,
      
      teleportRequest: null,
      job: JobType.Warrior,
      element: 'Neutral',
    },

    setSpeed: (speed: number) => {
      set((store) => ({
        state: { ...store.state, speed }
      }));
    },

    setPosition: (x: number, y: number, z: number) => {
      set((store) => {
          const newPos = store.state.position.clone();
          newPos.set(x, y, z);
          return {
             state: { ...store.state, position: newPos }
          };
      });
    },

    clearPosition: () => {
      set((store) => ({
          state: { ...store.state, position: new THREE.Vector3(98, 1, 226) }
      }));
    },

    setHp: (hp: number) => {
      set((store) => ({
        state: { 
            ...store.state, 
            hp: Math.max(0, Math.min(hp, store.state.maxHp)) 
        }
      }));
    },

    setMp: (mp: number) => {
       set((store) => ({
        state: { 
            ...store.state, 
            mp: Math.max(0, Math.min(mp, store.state.maxMp)) 
        }
      }));
    },

    setExp: (exp: number) => {
      set((store) => ({
        state: { ...store.state, exp }
      }));
    },

    setLevel: (level: number) => {
      set((store) => ({
        state: { ...store.state, level }
      }));
    },

    setElement: (element: ElementType) => {
      set((store) => ({
        state: { ...store.state, element }
      }));
    },

    takeDamage: (amount: number) => {
      set((store) => ({
        state: { 
            ...store.state, 
            hp: Math.max(0, store.state.hp - amount) 
        }
      }));
    },

    consumeMp: (amount: number) => {
      set((store) => ({
        state: { 
            ...store.state, 
            mp: Math.max(0, store.state.mp - amount) 
        }
      }));
    },

    gainExp: (amount: number, monsterLevel: number = 1, ignorePenalty: boolean = false) => {
      set((store) => {
          let { exp, maxExp, level, statPoints, skillPoints, job } = store.state;
          
          if (level >= 99) return { state: store.state };
          if (!ignorePenalty && level - monsterLevel >= 10) return { state: store.state };

          exp += amount;
          let leveledUp = false;
          
          while (exp >= maxExp && level < 99) {
            leveledUp = true;
            exp -= maxExp;
            level += 1;
            maxExp = getMaxExpForLevel(level);
            statPoints += 1;
            if (level % 2 === 0) skillPoints += 1;
          }
          
          if (level === 99) {
             exp = 0;
             maxExp = 0;
          }
          
          const newState = {
              ...store.state,
              exp,
              maxExp,
              level,
              statPoints,
              skillPoints
          };
          
          if (leveledUp) {
              const { str, int, dex, equipmentStats } = newState;
              const stats = calculateDerivedStats(str, int, dex, level, job);
              
              const totalMaxHp = stats.maxHp + (equipmentStats.hp || 0);
              const totalMaxMp = stats.maxMp + (equipmentStats.mp || 0);
              
              Object.assign(newState, {
                  ...stats,
                  maxHp: totalMaxHp,
                  maxMp: totalMaxMp,
                  hp: totalMaxHp, // Full Heal
                  mp: totalMaxMp, // Full Heal
                  
                  baseAttack: stats.attack,
                  baseDefense: stats.defense,
                  baseMagic: stats.magic,
                  
                  // Recalculate totals
                  attack: stats.attack + (equipmentStats.attack || 0),
                  defense: stats.defense + (equipmentStats.defense || 0),
                  magic: stats.magic + (equipmentStats.magic || 0),
                  hit: stats.hit + (equipmentStats.hit || 0),
                  crit: stats.crit + (equipmentStats.crit || 0),
                  weight: stats.weight + (equipmentStats.weight || 0),
                  mHit: stats.mHit + (equipmentStats.mHit || 0),
                  mDef: stats.mDef + (equipmentStats.mDef || 0),
              });
          }
          
          return { state: newState };
      });
    },

    setStats: (attack: number, defense: number, magic: number) => {
      set((store) => ({
        state: { ...store.state, attack, defense, magic }
      }));
    },

    requestTeleport: (x: number, y: number, z: number) => {
      set((store) => ({
        state: { ...store.state, teleportRequest: { x, y, z } }
      }));
    },

    clearTeleportRequest: () => {
       set((store) => ({
        state: { ...store.state, teleportRequest: null }
      }));
    },

    initializeFromData: (data: CharacterData) => {
      set((store) => {
        const safeLevel = isNaN(data.level) ? 1 : data.level;
        const safeStr = isNaN(data.str) ? (data.job === JobType.Warrior ? 10 : 5) : data.str;
        const safeInt = isNaN(data.int) ? (data.job === JobType.Mage ? 10 : 5) : data.int;
        const safeDex = isNaN(data.dex) ? 10 : data.dex;
        const safeStatPoints = isNaN(data.statPoints) ? 0 : data.statPoints;
        const safeSkillPoints = isNaN(data.skillPoints) ? 0 : data.skillPoints;

        const stats = calculateDerivedStats(safeStr, safeInt, safeDex, safeLevel, data.job);

        return {
          state: {
            ...store.state,
            str: safeStr,
            int: safeInt,
            dex: safeDex,
            statPoints: safeStatPoints,
            skillPoints: safeSkillPoints,
            
            ...stats,
            hp: stats.maxHp,
            mp: stats.maxMp,
            
            baseAttack: stats.attack,
            baseDefense: stats.defense,
            baseMagic: stats.magic,

            // Force Spawn at Exact Center (98, 1, 226) - Safety Height Y=1
            position: new THREE.Vector3(98, 1, 226),
            teleportRequest: null, // Clear any pending teleports
            
            level: safeLevel,
            job: data.job,
            element: 'Neutral',
            exp: 0,
            maxExp: getMaxExpForLevel(safeLevel),
          }
        };
      });
    },
    
    increaseStat: (stat: 'str' | 'int' | 'dex') => {
        set((store) => {
            const { statPoints, job } = store.state;
            
            if (statPoints <= 0) return { state: store.state };
            
            // Check Job Constraints
            // Relaxing constraints to allow experimenting with builds as per RPG standards
            
            if (job === JobType.Warrior && stat !== 'str' && stat !== 'dex') return { state: store.state }; 
            if (job === JobType.Mage && stat !== 'int' && stat !== 'dex') return { state: store.state };
            if (job === JobType.Rogue && stat !== 'dex' && stat !== 'str') return { state: store.state };
            
            if (store.state[stat] >= 100) return { state: store.state };
            
            const newState = { ...store.state };
            newState[stat] += 1;
            newState.statPoints -= 1;
            
            const { str, int, dex, level, equipmentStats } = newState;
            // Calculate Effective Attributes
            const effectiveStr = str + (equipmentStats.str || 0);
            const effectiveInt = int + (equipmentStats.int || 0);
            const effectiveDex = dex + (equipmentStats.dex || 0);
            
            const stats = calculateDerivedStats(effectiveStr, effectiveInt, effectiveDex, level, job);
            
            Object.assign(newState, {
                ...stats,
                baseAttack: stats.attack,
                baseDefense: stats.defense,
                baseMagic: stats.magic,
                
                // Recalculate totals
                maxHp: stats.maxHp + (equipmentStats.hp || 0),
                maxMp: stats.maxMp + (equipmentStats.mp || 0),
                attack: stats.attack + (equipmentStats.attack || 0),
                defense: stats.defense + (equipmentStats.defense || 0),
                magic: stats.magic + (equipmentStats.magic || 0),
                hit: stats.hit + (equipmentStats.hit || 0),
                crit: stats.crit + (equipmentStats.crit || 0),
                weight: stats.weight + (equipmentStats.weight || 0),
                mHit: stats.mHit + (equipmentStats.mHit || 0),
                mDef: stats.mDef + (equipmentStats.mDef || 0),
            });
            
            return { state: newState };
        });
    },
    
    recalculateStats: () => {
        set((store) => {
            const { str, int, dex, level, job, equipmentStats } = store.state;
            
            const effectiveStr = str + (equipmentStats.str || 0);
            const effectiveInt = int + (equipmentStats.int || 0);
            const effectiveDex = dex + (equipmentStats.dex || 0);

            const stats = calculateDerivedStats(effectiveStr, effectiveInt, effectiveDex, level, job);
            
            // Calculate Totals = Base + Equipment
            const totalMaxHp = stats.maxHp + (equipmentStats.hp || 0);
            const totalMaxMp = stats.maxMp + (equipmentStats.mp || 0);
            const totalAttack = stats.attack + (equipmentStats.attack || 0);
            const totalDefense = stats.defense + (equipmentStats.defense || 0);
            const totalMagic = stats.magic + (equipmentStats.magic || 0);
            const totalHit = stats.hit + (equipmentStats.hit || 0);
            const totalCrit = stats.crit + (equipmentStats.crit || 0);
            const totalWeight = stats.weight + (equipmentStats.weight || 0);
            const totalMHit = stats.mHit + (equipmentStats.mHit || 0);
            const totalMDef = stats.mDef + (equipmentStats.mDef || 0);

            const newState = { 
                ...store.state, 
                // Base Stats
                baseAttack: stats.attack,
                baseDefense: stats.defense,
                baseMagic: stats.magic,
                
                // Total Stats
                maxHp: totalMaxHp,
                maxMp: totalMaxMp,
                attack: totalAttack,
                defense: totalDefense,
                magic: totalMagic,
                hit: totalHit,
                crit: totalCrit,
                weight: totalWeight,
                mHit: totalMHit,
                mDef: totalMDef,
            };
            
            return { state: newState };
        });
    },

    setEquipmentStats: (newStats) => {
        set((store) => {
            const currentEquip = store.state.equipmentStats;
            const updatedEquip = { ...currentEquip, ...newStats };
            
            // Trigger recalculate with new equipment stats
            // We duplicate logic here or call a shared helper? 
            // Since we can't easily call actions from within actions without `get().recalculateStats()`,
            // and `recalculateStats` uses `store.state` which might be stale if we don't update it first.
            
            // Let's update state with new equipment stats first
            const stateWithNewEquip = {
                ...store.state,
                equipmentStats: updatedEquip
            };
            
            // Then recalculate
            const { str, int, dex, level, job } = stateWithNewEquip;
            
            const effectiveStr = str + (updatedEquip.str || 0);
            const effectiveInt = int + (updatedEquip.int || 0);
            const effectiveDex = dex + (updatedEquip.dex || 0);

            const stats = calculateDerivedStats(effectiveStr, effectiveInt, effectiveDex, level, job);
            
            const totalMaxHp = stats.maxHp + (updatedEquip.hp || 0);
            const totalMaxMp = stats.maxMp + (updatedEquip.mp || 0);
            const totalAttack = stats.attack + (updatedEquip.attack || 0);
            const totalDefense = stats.defense + (updatedEquip.defense || 0);
            const totalMagic = stats.magic + (updatedEquip.magic || 0);
            const totalHit = stats.hit + (updatedEquip.hit || 0);
            const totalCrit = stats.crit + (updatedEquip.crit || 0);
            const totalWeight = stats.weight + (updatedEquip.weight || 0);
            const totalMHit = stats.mHit + (updatedEquip.mHit || 0);
            const totalMDef = stats.mDef + (updatedEquip.mDef || 0);
            
            return {
                state: {
                    ...stateWithNewEquip,
                    maxHp: totalMaxHp,
                    maxMp: totalMaxMp,
                    attack: totalAttack,
                    defense: totalDefense,
                    magic: totalMagic,
                    hit: totalHit,
                    crit: totalCrit,
                    weight: totalWeight,
                    mHit: totalMHit,
                    mDef: totalMDef,
                }
            };
        });
    },

    restoreHp: (amount: number) => {
        set((store) => ({
            state: {
                ...store.state,
                hp: Math.min(store.state.maxHp, store.state.hp + amount)
            }
        }));
    },

    restoreMp: (amount: number) => {
        set((store) => ({
            state: {
                ...store.state,
                mp: Math.min(store.state.maxMp, store.state.mp + amount)
            }
        }));
    },

    debugSetLevel: (targetLevel: number) => {
        set((store) => {
            const newLevel = Math.max(1, Math.min(99, Math.floor(targetLevel)));
            
            const newExp = newLevel === 1 ? 0 : getMaxExpForLevel(newLevel - 1);
            const newMaxExp = getMaxExpForLevel(newLevel);
            
            const newStatPoints = Math.max(0, newLevel - 1);
            const newSkillPoints = Math.floor(newLevel / 2);
            
            const { str, int, dex, job } = store.state;
            const stats = calculateDerivedStats(str, int, dex, newLevel, job);
            
            return {
                state: {
                    ...store.state,
                    level: newLevel,
                    exp: newExp,
                    maxExp: newMaxExp,
                    statPoints: newStatPoints,
                    skillPoints: newSkillPoints,
                    
                    ...stats,
                    hp: stats.maxHp,
                    mp: stats.maxMp,
                    baseAttack: stats.attack,
                    baseDefense: stats.defense,
                    baseMagic: stats.magic,
                }
            };
        });
    }
  })),
);
