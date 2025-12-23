import Assets from '../assets.json';

// 1x1 transparent pixel as fallback to prevent crashes
const FALLBACK_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const getAssetUrl = (category: keyof typeof Assets, key: string): string => {
  try {
    const cat = Assets[category] as Record<string, { url: string }>;
    if (!cat) {
      console.warn(`Asset category '${category}' not found.`);
      return FALLBACK_URL;
    }
    
    const item = cat[key];
    if (!item || !item.url) {
      console.warn(`Asset '${category}.${key}' not found or missing URL.`);
      return FALLBACK_URL;
    }
    
    return item.url;
  } catch (e) {
    console.error(`Error loading asset ${category}.${key}:`, e);
    return FALLBACK_URL;
  }
};
