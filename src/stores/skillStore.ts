import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useLocalPlayerStore } from './localPlayerStore';
import { ElementType } from './combatStore';
import { useInventoryStore } from './inventoryStore';
import { useGameStore } from './gameStore';
import Assets from '../assets.json';

export type SkillCategory = 'Offense' | 'Defense' | 'Utility';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  requiredLevel: number;
  element?: ElementType;
  maxGrade: number;
  currentGrade: number;
  description: string;
  iconUrl: string;
}

interface SkillStore {
  skills: Skill[];
  quickbar: (string | null)[]; // 5 slots, stores skill ID
  
  getSkill: (id: string) => Skill | undefined;
  getUpgradeCost: (currentGrade: number) => number;
  upgradeSkill: (id: string) => void;
  assignToQuickbar: (slotIndex: number, skillId: string | null) => void;
  removeFromQuickbar: (slotIndex: number) => void;
}

// Initial Skill Data
const INITIAL_SKILLS: Skill[] = [
  // Offense
  {
    id: 'crash',
    name: 'Crash',
    category: 'Offense',
    requiredLevel: 2,
    maxGrade: 3,
    currentGrade: 0,
    description: 'A powerful strike that deals bonus damage.',
    iconUrl: Assets.ui.icon_sword.url
  },
  {
    id: 'fire_slash',
    name: 'Fire Slash',
    category: 'Offense',
    requiredLevel: 6,
    element: 'Fire',
    maxGrade: 3,
    currentGrade: 0,
    description: 'Engulfs your weapon in flames, dealing Fire damage.',
    iconUrl: Assets.ui.icon_fire.url
  },
  {
    id: 'whirl',
    name: 'Whirl',
    category: 'Offense',
    requiredLevel: 12,
    maxGrade: 3,
    currentGrade: 0,
    description: 'Spin around to hit all nearby enemies.',
    iconUrl: Assets.ui.icon_sword.url
  },
  
  // Defense
  {
    id: 'guard_stance',
    name: 'Guard Stance',
    category: 'Defense',
    requiredLevel: 4,
    maxGrade: 3,
    currentGrade: 0,
    description: 'Increases defense for a short duration.',
    iconUrl: Assets.ui.icon_armor.url
  },
  {
    id: 'stone_skin',
    name: 'Stone Skin',
    category: 'Defense',
    requiredLevel: 10,
    element: 'Earth',
    maxGrade: 3,
    currentGrade: 0,
    description: 'Hardens skin like stone, granting Earth element and high defense.',
    iconUrl: Assets.ui.icon_earth.url
  },
  {
    id: 'indomitable',
    name: 'Indomitable',
    category: 'Defense',
    requiredLevel: 15,
    maxGrade: 3,
    currentGrade: 0,
    description: 'Become immune to knockback and reduce damage taken.',
    iconUrl: Assets.ui.icon_helmet.url
  },
  
  // Utility
  {
    id: 'dash',
    name: 'Dash',
    category: 'Utility',
    requiredLevel: 3,
    maxGrade: 3,
    currentGrade: 0,
    description: 'Quickly dash forward to evade attacks.',
    iconUrl: Assets.ui.icon_wind.url
  },
  {
    id: 'intimidate',
    name: 'Intimidate',
    category: 'Utility',
    requiredLevel: 8,
    maxGrade: 3,
    currentGrade: 0,
    description: 'Lowers attack power of nearby enemies.',
    iconUrl: Assets.ui.icon_helmet.url
  },
  {
    id: 'wind_walk',
    name: 'Wind Walk',
    category: 'Utility',
    requiredLevel: 14,
    element: 'Wind',
    maxGrade: 3,
    currentGrade: 0,
    description: 'Move with the speed of wind. Grants Wind element.',
    iconUrl: Assets.ui.icon_wind.url
  }
];

export const useSkillStore = create<SkillStore>()(
  subscribeWithSelector((set, get) => ({
    skills: INITIAL_SKILLS,
    quickbar: [null, null, null, null, null], // 5 slots

    getSkill: (id) => get().skills.find(s => s.id === id),

    getUpgradeCost: (currentGrade) => {
        // Cost Table: Grade 1 (500g), Grade 2 (2000g), Grade 3 (5000g)
        // currentGrade 0 -> Upgrade to 1 -> 500
        // currentGrade 1 -> Upgrade to 2 -> 2000
        // currentGrade 2 -> Upgrade to 3 -> 5000
        if (currentGrade === 0) return 500;
        if (currentGrade === 1) return 2000;
        if (currentGrade === 2) return 5000;
        return 999999;
    },

    upgradeSkill: (id) => {
      set((state) => {
        const skillIndex = state.skills.findIndex(s => s.id === id);
        if (skillIndex === -1) return {};

        const skill = state.skills[skillIndex];
        const playerState = useLocalPlayerStore.getState().state;
        const inventoryStore = useInventoryStore.getState();
        const gameStore = useGameStore.getState();

        // Check Max Grade
        if (skill.currentGrade >= skill.maxGrade) return {};

        // Check Level Requirement
        if (playerState.level < skill.requiredLevel) {
            gameStore.showNotification(`Requires Level ${skill.requiredLevel}`);
            return {};
        }

        // Check Dependency (Previous skill in category must be max grade)
        const categorySkills = state.skills.filter(s => s.category === skill.category);
        const skillCategoryIndex = categorySkills.findIndex(s => s.id === id);

        if (skillCategoryIndex > 0) {
            const previousSkill = categorySkills[skillCategoryIndex - 1];
            if (previousSkill.currentGrade < previousSkill.maxGrade) {
                gameStore.showNotification(`You must master ${previousSkill.name} (Grade 3) first.`);
                return {};
            }
        }

        // Check Skill Points
        if (playerState.skillPoints < 1) {
            gameStore.showNotification("Not enough Skill Points.");
            return {};
        }

        // Check Gold
        const cost = get().getUpgradeCost(skill.currentGrade);
        if (inventoryStore.gold < cost) {
            gameStore.showNotification("Not enough gold to upgrade skill.");
            return {};
        }

        // DEDUCT COSTS
        // 1. Skill Point
        useLocalPlayerStore.setState(prev => ({
          state: { ...prev.state, skillPoints: prev.state.skillPoints - 1 }
        }));
        
        // 2. Gold
        inventoryStore.removeGold(cost);

        // Upgrade Skill
        const newSkills = [...state.skills];
        newSkills[skillIndex] = { ...skill, currentGrade: skill.currentGrade + 1 };
        
        gameStore.showNotification(`${skill.name} upgraded to Grade ${newSkills[skillIndex].currentGrade}!`);

        return { skills: newSkills };
      });
    },

    assignToQuickbar: (slotIndex, skillId) => {
      set((state) => {
        const newQuickbar = [...state.quickbar];
        // Remove skill from other slots if it exists there
        for (let i = 0; i < newQuickbar.length; i++) {
            if (newQuickbar[i] === skillId) {
                newQuickbar[i] = null;
            }
        }
        newQuickbar[slotIndex] = skillId;
        return { quickbar: newQuickbar };
      });
    },

    removeFromQuickbar: (slotIndex) => {
      set((state) => {
        const newQuickbar = [...state.quickbar];
        newQuickbar[slotIndex] = null;
        return { quickbar: newQuickbar };
      });
    },
  }))
);
