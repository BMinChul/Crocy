import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCombatStore, HitEffect } from '../../stores/combatStore';
import * as THREE from 'three';

const Particle = ({ position, direction }: { position: THREE.Vector3; direction: THREE.Vector3 }) => {
  const ref = useRef<THREE.Mesh>(null);
  const speed = Math.random() * 3 + 2; // Speed 2-5
  
  useFrame((state, delta) => {
    if (ref.current) {
      // Move outwards
      ref.current.position.add(direction.clone().multiplyScalar(speed * delta));
      // Scale down
      const currentScale = ref.current.scale.x;
      if (currentScale > 0) {
          const newScale = Math.max(0, currentScale - delta * 3); // Shrink speed
          ref.current.scale.setScalar(newScale);
      }
    }
  });

  return (
    <mesh ref={ref} position={position} scale={0.2}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffaa00" emissive="#ff5500" emissiveIntensity={2} />
    </mesh>
  );
};

const SingleHitEffect = ({ item }: { item: HitEffect }) => {
    // Create 8 random particles for each hit
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => {
            const dir = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            return { id: i, dir };
        });
    }, []);

    return (
        <group position={item.position}>
            {particles.map((p) => (
                <Particle key={p.id} position={new THREE.Vector3(0, 0, 0)} direction={p.dir} />
            ))}
        </group>
    );
};

const HitParticles = () => {
  const hitEffects = useCombatStore((state) => state.hitEffects);

  return (
    <group>
      {hitEffects.map((he) => (
        <SingleHitEffect key={he.id} item={he} />
      ))}
    </group>
  );
};

export default HitParticles;
