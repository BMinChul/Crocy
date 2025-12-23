import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RigidBodyObject, RigidBodyObjectRef } from 'vibe-starter-3d';
import { Billboard, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useCombatStore } from '../../stores/combatStore';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import Assets from '../../assets.json';
import { BlobShadow } from '../effects/BlobShadow';

import { usePlayerActionStore } from '../../stores/playerActionStore';

interface SlimeProps {
  id: string;
  position: [number, number, number];
}

const Slime = ({ id, position }: SlimeProps) => {
  const [hp, setHp] = useState(3);
  const [isDead, setIsDead] = useState(false);
  
  const rigidBodyRef = useRef<RigidBodyObjectRef>(null);
  const spriteRef = useRef<THREE.Group>(null);
  const texture = useTexture(Assets.characters.slime_sprite.url);
  const baseScale = useRef(1.0);
  
  // Pixel Art Settings
  useEffect(() => {
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Combat registration
  const { registerTarget, unregisterTarget, addDamageNumber } = useCombatStore();
  const updateQuestProgress = useGameStore((state) => state.updateQuestProgress);
  const enemyInstanceId = useMemo(() => Math.floor(Math.random() * 1000000), []);

  useEffect(() => {
    registerTarget(enemyInstanceId, {
      type: 'Enemy',
      getPosition: () => rigidBodyRef.current?.translation(),
      onHit: (damage) => {
        if (isDead) return;
        setHp(prev => {
            const newHp = Math.max(0, prev - damage);
            baseScale.current *= 0.9;
            if (rigidBodyRef.current) {
                const pos = rigidBodyRef.current.translation();
                addDamageNumber([pos.x, pos.y + 1, pos.z], damage);
            }
            if (newHp <= 0 && !isDead) {
                setIsDead(true);
                if (useGameStore.getState().quest.isActive) {
                    updateQuestProgress(1);
                }
            }
            return newHp;
        });
      }
    });
    return () => unregisterTarget(enemyInstanceId);
  }, [enemyInstanceId, isDead, addDamageNumber, updateQuestProgress]);

  // Touch Damage Logic
  const lastAttackTimeRef = useRef(0);
  const handleTriggerEnter = (payload: any) => {
    if (isDead) return;
    const userData = payload.other.rigidBody?.userData;
    if (userData && (userData.type === 'Player' || userData.type === 'LOCAL_PLAYER')) {
        const now = Date.now();
        if (now - lastAttackTimeRef.current > 1000) {
            lastAttackTimeRef.current = now;
            useLocalPlayerStore.getState().takeDamage(1);
        }
    }
  };

  useFrame((state, delta) => {
    if (isDead && rigidBodyRef.current) {
        if (baseScale.current > 0.05) {
             baseScale.current = THREE.MathUtils.lerp(baseScale.current, 0, delta * 5);
        } else {
             rigidBodyRef.current.setTranslation({ x: 0, y: -100, z: 0 }, true);
        }
    }

    if (spriteRef.current) {
        const time = state.clock.elapsedTime;
        const bounce = Math.sin(time * 5) * 0.1 + 0.9;
        const s = baseScale.current;
        
        // Bounce effect on sprite
        spriteRef.current.scale.set(s, s * bounce, 1);
        
        // Face player if possible (simple Billboard handles rotation, but we can flip X)
        // For now, standard Billboard is fine
    }
  });

  if (isDead && baseScale.current < 0.1) return null;

  return (
    <RigidBodyObject
        ref={rigidBodyRef}
        position={position}
        colliders={false}
        type="dynamic"
        lockRotations
        userData={{ type: 'Enemy', id: id, enemyInstanceId: enemyInstanceId }}
        onTriggerEnter={handleTriggerEnter}
    >
        <CapsuleCollider args={[0.3, 0.4]} position={[0, 0.4, 0]} />
        
        <group ref={spriteRef}>
            <Billboard position={[0, 0.6, 0]} locked={true}>
                <mesh>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial 
                        map={texture} 
                        transparent 
                        alphaTest={0.5} 
                        side={THREE.DoubleSide} 
                        toneMapped={false} 
                    />
                </mesh>
            </Billboard>
        </group>

        <Billboard position={[0, 1.2, 0]}>
            <Text
                fontSize={0.25}
                color="#EF4444"
                outlineWidth={0.02}
                outlineColor="black"
            >
                HP: {hp}
            </Text>
        </Billboard>
        
        <BlobShadow scale={1.0} opacity={0.6} />
    </RigidBodyObject>
  );
};

export default Slime;
