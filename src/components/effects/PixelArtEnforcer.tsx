import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect } from 'react';

/**
 * PixelArtEnforcer Component
 * 
 * Enforces "Nearest Neighbor" texture filtering on all objects in the scene.
 * This is crucial for the "crisp pixels" look, preventing blurry textures.
 */
export const PixelArtEnforcer = () => {
  const { scene } = useThree();

  useEffect(() => {
    const enforcePixelArt = () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          
          materials.forEach((mat) => {
            // Traverse all texture maps and set to NearestFilter
            ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach((mapName) => {
              const texture = mat[mapName];
              if (texture && texture instanceof THREE.Texture) {
                if (texture.minFilter !== THREE.NearestFilter || texture.magFilter !== THREE.NearestFilter) {
                  texture.minFilter = THREE.NearestFilter;
                  texture.magFilter = THREE.NearestFilter;
                  texture.needsUpdate = true;
                }
              }
            });
            
            // Also force flat shading if desired for low-poly look, but keeping smooth for now
            // mat.flatShading = true;
            // mat.needsUpdate = true;
          });
        }
      });
    };

    // Run immediately
    enforcePixelArt();

    // Run periodically to catch dynamically loaded assets (e.g. players, enemies, items)
    // 1 second interval is sufficient performance-wise
    const interval = setInterval(enforcePixelArt, 1000);

    return () => clearInterval(interval);
  }, [scene]);

  return null;
};
