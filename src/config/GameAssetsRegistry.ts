import assetsData from '../assets.json';

/**
 * ASSET INTELLIGENCE REGISTRY
 * 
 * This file acts as the Sui Native Architecture for game assets.
 * It automatically scans the assets.json file and categorizes resources
 * into strictly typed game entities ready for the engine.
 */

// 1. Generate TypeScript Types
export enum AssetCategory {
  Character_Sprite = 'Character_Sprite',
  Ground_Tile = 'Ground_Tile',
  Building_Object = 'Building_Object',
  Monster_Entity = 'Monster_Entity',
  Skill_Effect = 'Skill_Effect',
  NPC = 'NPC',
  Icon = 'Icon',
  UI_Element = 'UI_Element',
  Unknown = 'Unknown'
}

export interface GameAsset {
  id: string;
  url: string;
  category: AssetCategory;
  description?: string;
  metadata?: Record<string, any>;
}

// Internal mapping for "Visual Inspection & Guessing" logic
const CATEGORY_MAPPING: Record<string, AssetCategory> = {
  'characters': AssetCategory.Character_Sprite,
  'textures': AssetCategory.Ground_Tile,
  'models': AssetCategory.Building_Object,
  'Monster': AssetCategory.Monster_Entity,
  'skill Effect': AssetCategory.Skill_Effect,
  'npc': AssetCategory.NPC,
  'icon': AssetCategory.Icon,
  'Item': AssetCategory.Icon,
  'ui': AssetCategory.UI_Element,
  // Fallbacks or extra categories
  'animations': AssetCategory.Character_Sprite, // 3D animations usually belong to characters
};

// 2. Build an Automated Asset Map
const buildGameAssets = (): Record<string, GameAsset> => {
  const registry: Record<string, GameAsset> = {};

  // Scan all files in the Assets folder (simulated via assets.json structure)
  Object.entries(assetsData).forEach(([jsonCategory, items]) => {
    // Determine category based on mapping
    const targetCategory = CATEGORY_MAPPING[jsonCategory] || AssetCategory.Unknown;

    // Process each item in the category
    Object.entries(items).forEach(([id, asset]: [string, any]) => {
      // Safety Rule: NEVER DELETE, just organize
      // We use the ID from assets.json as the unique key
      
      // Intelligent guessing overrides (Visual Inspection simulation)
      let finalCategory = targetCategory;
      const lowerId = id.toLowerCase();
      const desc = asset.description?.toLowerCase() || '';

      // Heuristic refinements based on names
      if (finalCategory === AssetCategory.Building_Object) {
        // Models that are clearly items might be icons, but usually models are buildings/props
        if (lowerId.includes('sword') || lowerId.includes('potion')) {
           // rare case, keep as building if it's a 3d model
        }
      }
      
      if (finalCategory === AssetCategory.Ground_Tile) {
        if (lowerId.includes('icon') || lowerId.includes('ui')) {
          finalCategory = AssetCategory.UI_Element;
        }
      }

      if (jsonCategory === 'npc' && (lowerId.includes('icon') || lowerId.includes('32x32'))) {
        // Some NPC assets are actually icons/items
        finalCategory = AssetCategory.Icon;
      }

      registry[id] = {
        id,
        url: asset.url,
        category: finalCategory,
        description: asset.description,
        metadata: asset.metadata
      };
    });
  });

  return registry;
};

// 3. Export the Registry
export const GAME_ASSETS = buildGameAssets();

/**
 * Helper to retrieve all assets of a specific type.
 * Useful for populating lists, galleries, or random spawners.
 */
export const getAssetsByCategory = (category: AssetCategory): GameAsset[] => {
  return Object.values(GAME_ASSETS).filter(asset => asset.category === category);
};

/**
 * Helper to find a specific asset by fuzzy ID search.
 */
export const findAssetId = (partialName: string): string | undefined => {
  const match = Object.values(GAME_ASSETS).find(asset => 
    asset.id.toLowerCase().includes(partialName.toLowerCase())
  );
  return match?.id;
};

// Debug log for development
console.log(`[Asset Intelligence] Registered ${Object.keys(GAME_ASSETS).length} assets.`);
