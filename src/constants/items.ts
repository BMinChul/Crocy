import { JobType } from '../models/CharacterData';
import { Item } from '../stores/inventoryStore';
import Assets from '../assets.json';

// Helper to generate ID
const generateId = (type: string, job: string, level: number) => `${type}_${job.toLowerCase()}_${level}`;

// Weapon Name Generators
const getWarriorWeaponName = (level: number): string => {
  if (level <= 10) return "Dull Iron Sword";
  if (level <= 20) return "Soldier's Blade";
  if (level <= 30) return "Polished Steel Longsword";
  if (level <= 40) return "Knight's Honor Blade";
  if (level <= 55) return "Flame-Etched Claymore";
  if (level <= 65) return "Guardian's Silver Sword";
  if (level <= 75) return "Dimension Ripper";
  if (level <= 85) return "Heavenly Justice Blade";
  return "Dragon Slayer Sword"; // Lv 90+ Goal
};

const getMageWeaponName = (level: number): string => {
  if (level <= 10) return "Oak Wand";
  if (level <= 20) return "Apprentice Staff";
  if (level <= 30) return "Focusing Crystal Rod";
  if (level <= 40) return "Sage's Willow Staff";
  if (level <= 55) return "Mana-Infused Wand";
  if (level <= 65) return "Arcane Storm Rod";
  if (level <= 75) return "Archmage's Eternal Staff";
  if (level <= 85) return "God-King's Revelation Staff";
  return "Void Star Wand"; // Lv 90+ Goal
};

// Base Item Generator
export const generateItems = (): Item[] => {
  const items: Item[] = [];
  // Levels 5 to 95 (step 5) + Level 99
  const levels = Array.from({ length: 19 }, (_, i) => (i + 1) * 5); 
  levels.push(99);

  levels.forEach(level => {
    // Scaling Factors
    const priceScale = level * 100;
    
    // === WARRIOR SET (STR Focus, Swords) ===
    
    // Helmet (High AC, STR Bonus)
    items.push({
      id: generateId('helmet', 'warrior', level),
      name: `Warrior Helm Lv.${level}`,
      type: 'helmet',
      iconUrl: Assets.ui.icon_helmet.url,
      description: `Heavy helm. +STR. Req: War Lv.${level}`,
      weight: 3 + level * 0.1,
      price: priceScale,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Warrior,
      stats: {
        defense: 5 + level * 1.5,
        str: Math.floor(1 + level / 10), // STR Bonus
      }
    });

    // Armor (High AC, STR Bonus)
    items.push({
      id: generateId('armor', 'warrior', level),
      name: `Warrior Plate Lv.${level}`,
      type: 'armor',
      iconUrl: Assets.ui.icon_armor.url,
      description: `Heavy plate. +STR. Req: War Lv.${level}`,
      weight: 12 + level * 0.5,
      price: priceScale * 2,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Warrior,
      stats: {
        defense: 10 + level * 2.5,
        str: Math.floor(2 + level / 8), // STR Bonus
      }
    });

    // Weapon (Sword Concept, High DAM)
    items.push({
      id: generateId('weapon', 'warrior', level),
      name: getWarriorWeaponName(level) + (level % 5 === 0 && level !== 99 && level > 5 && ![10,20,30,40,55,65,75,85].includes(level) ? "" : ""), // Keeping names clean
      type: 'weapon',
      iconUrl: Assets.ui.icon_sword.url,
      description: `Melee Damage. Req: War Lv.${level}`,
      weight: 8 + level * 0.2,
      price: priceScale * 3,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Warrior,
      stats: {
        damage: 12 + level * 3.5, // High DAM
      }
    });

    // Ring (DAM + HIT)
    items.push({
      id: generateId('ring', 'warrior', level),
      name: `Ring of Might Lv.${level}`,
      type: 'necklace',
      iconUrl: Assets.ui.icon_fire.url, 
      description: `+DAM, +HIT. Req: War Lv.${level}`,
      weight: 0.5,
      price: priceScale * 1.5,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Warrior,
      stats: {
        damage: 2 + level * 0.6,
        hit: 5 + level * 1.2,
      }
    });

    // === MAGE SET (INT Focus, Staves) ===

    // Helmet (High MAC, INT Bonus)
    items.push({
      id: generateId('helmet', 'mage', level),
      name: `Mage Circlet Lv.${level}`,
      type: 'helmet',
      iconUrl: Assets.ui.icon_helmet.url,
      description: `Magical circlet. +INT. Req: Mage Lv.${level}`,
      weight: 1 + level * 0.05,
      price: priceScale,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Mage,
      stats: {
        defense: 2 + level * 0.4,
        magicDefense: 6 + level * 1.8,
        int: Math.floor(1 + level / 10), // INT Bonus
      }
    });

    // Armor (High MAC, INT Bonus)
    items.push({
      id: generateId('armor', 'mage', level),
      name: `Mage Robe Lv.${level}`,
      type: 'armor',
      iconUrl: Assets.ui.icon_armor.url,
      description: `Enchanted robe. +INT. Req: Mage Lv.${level}`,
      weight: 3 + level * 0.1,
      price: priceScale * 2,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Mage,
      stats: {
        defense: 3 + level * 0.6,
        magicDefense: 12 + level * 2.8,
        int: Math.floor(2 + level / 8), // INT Bonus
      }
    });

    // Weapon (Staff Concept, High MDAM)
    items.push({
      id: generateId('weapon', 'mage', level),
      name: getMageWeaponName(level),
      type: 'weapon',
      iconUrl: Assets.ui.icon_sword.url, // Using sword icon as placeholder for staff
      description: `Magic Damage. Req: Mage Lv.${level}`,
      weight: 5 + level * 0.15,
      price: priceScale * 3,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Mage,
      stats: {
        magicDamage: 15 + level * 4, // Very High MDAM
      }
    });

    // Ring (MDAM + MHIT)
    items.push({
      id: generateId('ring', 'mage', level),
      name: `Ring of Insight Lv.${level}`,
      type: 'necklace',
      iconUrl: Assets.ui.icon_water.url, 
      description: `+MDAM, +MHIT. Req: Mage Lv.${level}`,
      weight: 0.5,
      price: priceScale * 1.5,
      quantity: 1,
      requiredLevel: level,
      requiredClass: JobType.Mage,
      stats: {
        magicDamage: 3 + level * 0.7,
        magicHit: 5 + level * 1.2,
      }
    });
  });

  return items;
};
