import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import { useCombatStore } from '../../stores/combatStore';
import * as THREE from 'three';
import Assets from '../../assets.json';

export const TargetIndicator = () => {
  const meshRef = useRef<THREE.Group>(null);
  const currentTargetId = useCombatStore((state) => state.currentTargetId);
  const hitRegistry = useCombatStore((state) => state.hitRegistry);

  const icons = useMemo(() => ({
    Fire: Assets.ui.icon_fire.url,
    Water: Assets.ui.icon_water.url,
    Earth: Assets.ui.icon_earth.url,
    Wind: Assets.ui.icon_wind.url,
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    if (currentTargetId === null) {
        meshRef.current.visible = false;
        return;
    }

    const target = hitRegistry.get(currentTargetId);
    if (!target) {
        meshRef.current.visible = false;
        return;
    }

    const pos = target.getPosition();
    if (pos) {
        meshRef.current.visible = true;
        // Handle both Vector3 and plain object
        const x = pos instanceof THREE.Vector3 ? pos.x : pos.x;
        const y = pos instanceof THREE.Vector3 ? pos.y : pos.y;
        const z = pos instanceof THREE.Vector3 ? pos.z : pos.z;
        
        meshRef.current.position.set(x, y + 0.05, z); // Slightly above ground
        
        // Rotate ring slowly
        const ring = meshRef.current.children[0];
        if (ring) ring.rotation.z += 2 * state.clock.getDelta();

        // Update Icon based on element
        const iconMesh = meshRef.current.children[1] as any;
        if (iconMesh && target.element && (target.element as string) in icons) {
            // We can't easily swap texture on Drei Image dynamically efficiently every frame without re-render, 
            // but for a single target indicator it is okay.
            // Ideally we pass the url prop.
            // However, Drei Image url prop is reactive.
        }
    } else {
        meshRef.current.visible = false;
    }
  });

  // Get current target element to pass to Image component
  const target = currentTargetId !== null ? hitRegistry.get(currentTargetId) : null;
  const element = target?.element as keyof typeof icons | undefined;
  const iconUrl = element ? icons[element] : null;

  return (
    <group ref={meshRef} visible={false}>
      {/* Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 32]} />
        <meshBasicMaterial color="red" transparent opacity={0.8} side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
      </mesh>
      
      {/* Element Icon - Displayed BEFORE name (floating above ring) */}
      {iconUrl && (
          <Image 
            url={iconUrl} 
            position={[0, 1.8, 0]} // Above head, slightly left/right if we want 'before name'
            scale={[0.5, 0.5]} 
            transparent
            opacity={1}
            side={THREE.DoubleSide}
          />
      )}
    </group>
  );
};
