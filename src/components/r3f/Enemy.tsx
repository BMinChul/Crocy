import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CharacterRenderer, RigidBodyObject, RigidBodyObjectRef } from 'vibe-starter-3d';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import Assets from '../../assets.json';
import { useCombatStore, calculateDamageWithElement, ElementType } from '../../stores/combatStore';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { generateItems } from '../../constants/items';
import LootItem from './LootItem';
import { BlobShadow } from '../effects/BlobShadow';
import { usePlayerActionStore } from '../../stores/playerActionStore';

interface EnemyProps {
  id: string; // Unique ID for this enemy instance
  position: [number, number, number];
  name?: string;
  maxHp?: number;
  level?: number;
  expReward?: number;
  modelUrl?: string;
  scale?: number;
  onDeath?: () => void;
  onCleanup?: () => void; // Called when fully ready to remove (after loot expires)
  // Manual element override, otherwise random
  element?: ElementType;
}

type AIState = 'idle' | 'chase' | 'attack' | 'dead';

const ELEMENTS: ElementType[] = ['Fire', 'Water', 'Earth', 'Wind'];

const ELEMENT_EMOJIS: Record<ElementType, string> = {
  'Fire': '🔥',
  'Water': '💧',
  'Earth': '⛰️',
  'Wind': '🌳',
  'Neutral': '',
};

const Enemy = ({ 
  id, 
  position, 
  name = "Goblin", 
  maxHp = 50, 
  level = 1,
  expReward = 5,
  modelUrl,
  scale = 1,
  onDeath,
  onCleanup,
  element: initialElement
}: EnemyProps) => {
  // Assign random element if not provided
  const element = useMemo(() => initialElement || ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)], [initialElement]);
  
  const [hp, setHp] = useState(maxHp);
  const [isDead, setIsDead] = useState(false);
  const [shouldDestroy, setShouldDestroy] = useState(false); // Controls rendering of BODY only
  const [droppedLoot, setDroppedLoot] = useState<React.ReactNode>(null);
  
  // Physics Ref
  const rigidBodyRef = useRef<RigidBodyObjectRef>(null);
  const lastAttackTimeRef = useRef(0);
  
  // AI State
  const aiState = useRef<AIState>('idle');
  const wanderTarget = useRef<THREE.Vector3 | null>(null);
  const stateTimer = useRef(0); // General purpose timer for states
  const spawnPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const ATTACK_RANGE = 1.5;
  const DETECTION_RANGE = 6; // Slight increase to feel more natural
  const LOSE_AGGRO_RANGE = 10;
  const MOVE_SPEED = 2.5; // Slightly slower for wandering monsters
  const HOME_RADIUS = 60; // Max distance from spawn before forcing return (Village Size)
  const WANDER_RADIUS = 50.0; // Radius for random wander points (Village Size)
  const GLOBAL_CENTER = new THREE.Vector3(98, 0, 226); // Global map center logic
  
  // Flash effect state
  const flashTime = useRef(0);
  const wasFlashingRef = useRef(false);
  const modelRef = useRef<THREE.Group>(null);
  
  // Animation state
  // We use a ref and force update to ensure CharacterRenderer picks it up
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const animationState = useRef<string | undefined>('idle');
  
  const { addDamageNumber, registerTarget, unregisterTarget } = useCombatStore();
  
  // Animation Config
  const animationConfigMap = useMemo(() => ({
    'idle': { url: Assets.animations['idle-00'].url, loop: true },
    'run': { url: Assets.animations['run-medium'].url, loop: true },
    'attack': { url: Assets.animations['melee-attack'].url, loop: false, duration: 1.0 },
    'die': { url: Assets.animations['death-backward'].url, loop: false, clampWhenFinished: true }
  }), []);

  // Register as damageable target
  const enemyInstanceId = useMemo(() => Math.floor(Math.random() * 1000000), []);
  
  useEffect(() => {
    registerTarget(enemyInstanceId, {
      type: 'Enemy',
      name: name, // Expose name for debugging
      element, // Expose element to combat store
      getPosition: () => rigidBodyRef.current?.translation(),
      onHit: (damage, attackElement: ElementType = 'Neutral') => {
        if (isDead) return;
        
        // Calculate Elemental Damage
        const { finalDamage, isEffective, isWeak } = calculateDamageWithElement(damage, attackElement, element);
        
        setHp(prev => {
            const newHp = Math.max(0, prev - finalDamage);
            flashTime.current = 0.2;
            
            // Add damage number with style hint
            if (rigidBodyRef.current) {
                const pos = rigidBodyRef.current.translation();
                const type = isEffective ? 'effective' : (isWeak ? 'weak' : 'normal');
                addDamageNumber([pos.x, pos.y + 2, pos.z], finalDamage, type);
                
                // Play hit sound
                if (Assets.sounds.hit.url) {
                    const audio = new Audio(Assets.sounds.hit.url);
                    audio.volume = 0.5;
                    audio.play().catch(e => console.warn('Audio play failed', e));
                }
            }
            
            if (newHp <= 0 && !isDead) {
                setIsDead(true);
                aiState.current = 'dead';
                setCurrentAnimation('die');
                
                // === DROPS Logic ===
                const drops: React.ReactNode[] = [];
                const playerLevel = useLocalPlayerStore.getState().state.level;
                
                // 1. Guaranteed Gold
                const dropsGold = true; 
                // 2. Item Check
                const inLevelRange = Math.abs(level - playerLevel) <= 5;
                const dropsItem = Math.random() < 0.3 && inLevelRange;
                
                const rawPos = rigidBodyRef.current ? rigidBodyRef.current.translation() : new THREE.Vector3(...position);
                const groundY = rawPos.y - (0.8 * scale);
                const dropY = groundY + 0.5;
                const dropPos = new THREE.Vector3(rawPos.x, dropY, rawPos.z);

                if (dropsGold) {
                    const goldAmount = Math.floor(Math.random() * 41) + 10; // Random 10 to 50
                    drops.push(
                        <LootItem 
                            key="gold"
                            id={`${enemyInstanceId}_gold`}
                            position={[dropPos.x, dropPos.y, dropPos.z]} 
                            type="gold"
                            goldValue={goldAmount}
                        />
                    );
                }

                if (dropsItem) {
                    const allItems = generateItems();
                    const gear = allItems.filter(i => 
                        (i.type === 'weapon' || i.type === 'armor' || i.type === 'helmet') &&
                        i.requiredLevel && 
                        i.requiredLevel >= playerLevel - 5 && 
                        i.requiredLevel <= playerLevel + 5
                    );

                    if (gear.length > 0) {
                        const baseItem = gear[Math.floor(Math.random() * gear.length)];
                        let finalItem = { ...baseItem, id: `${baseItem.id}_${Math.random().toString(36).substr(2, 5)}` };
                        
                        if (Math.random() < 0.3) {
                            finalItem.plusLevel = Math.floor(Math.random() * 5) + 1;
                        }

                        drops.push(
                            <LootItem 
                                key="item"
                                id={finalItem.id}
                                position={[dropPos.x, dropPos.y + 0.2, dropPos.z]} 
                                type="item"
                                item={finalItem}
                            />
                        );
                    }
                }

                if (drops.length > 0) {
                    setDroppedLoot(<>{drops}</>);
                }
                
                if (onDeath) onDeath();
                setTimeout(() => { if (onCleanup) onCleanup(); }, 65000);
                setTimeout(() => setShouldDestroy(true), 1000);
                useLocalPlayerStore.getState().gainExp(expReward, level);
            } else {
                if (aiState.current === 'idle') {
                    aiState.current = 'chase';
                }
            }
            return newHp;
        });
      }
    });
    return () => unregisterTarget(enemyInstanceId);
  }, [registerTarget, unregisterTarget, enemyInstanceId, position, addDamageNumber, isDead, onDeath, onCleanup, element]);

  useEffect(() => {
    if (isDead) {
        unregisterTarget(enemyInstanceId);
    }
  }, [isDead, unregisterTarget, enemyInstanceId]);

  useEffect(() => {
    animationState.current = currentAnimation;
  }, [currentAnimation]);

  const handleTriggerEnter = (payload: any) => {
    if (isDead) return;
    const userData = payload.other.rigidBody?.userData;
    if (userData && (userData.type === 'Player' || userData.type === 'LOCAL_PLAYER')) {
        const now = Date.now();
        if (now - lastAttackTimeRef.current > 1000) {
            lastAttackTimeRef.current = now;
            useLocalPlayerStore.getState().takeDamage(5);
        }
    }
  };

  useFrame((state, delta) => {
    if (isDead || !rigidBodyRef.current) return;

    // Flash effect
    const isFlashing = flashTime.current > 0;
    if (modelRef.current && (isFlashing || wasFlashingRef.current)) {
      if (isFlashing) flashTime.current -= delta;
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
             // ... (Material cloning logic retained) ...
             const applyColor = (mat: THREE.Material) => {
                if (!mat || !mat.userData) return;
                if ((mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) && mat.userData.originalColor) {
                    if (isFlashing) mat.color.setHex(0xff0000);
                    else mat.color.copy(mat.userData.originalColor);
                }
            };
            if (Array.isArray(child.material)) child.material.forEach(applyColor);
            else if (child.material) applyColor(child.material);
        }
      });
      wasFlashingRef.current = isFlashing;
    }

    // AI Movement Logic
    const currentPos = new THREE.Vector3().copy(rigidBodyRef.current.translation() as THREE.Vector3);
    const playerPos = useLocalPlayerStore.getState().state.position;
    const distToPlayer = currentPos.distanceTo(playerPos);
    const distToSpawn = currentPos.distanceTo(spawnPosition);

    // Get current vertical velocity to preserve gravity
    const currentLinvel = rigidBodyRef.current.linvel();

    switch (aiState.current) {
        case 'idle':
            // 1. Aggro Check
            if (distToPlayer < DETECTION_RANGE) {
                aiState.current = 'chase';
                setCurrentAnimation('run');
                break;
            }

            // 2. Timer Logic for Random Wander
            stateTimer.current -= delta;
            
            // If timer expires, pick a new action
            if (stateTimer.current <= 0) {
                // Determine next wait time (3-5 seconds)
                stateTimer.current = 3 + Math.random() * 2; 

                // Logic: "If the monster is too far from its HOME center, force it to return."
                // User requirement: "Set a wander radius around coordinates (98, 226)."
                const homeTarget = GLOBAL_CENTER; // Use global center instead of spawnPosition if desired
                
                if (currentPos.distanceTo(homeTarget) > HOME_RADIUS + 5) {
                    // Force return to home area
                    wanderTarget.current = homeTarget.clone();
                } else {
                    // "Pick a Random Point within its Home Area"
                    const theta = Math.random() * Math.PI * 2;
                    const r = Math.random() * WANDER_RADIUS;
                    const x = homeTarget.x + r * Math.cos(theta);
                    const z = homeTarget.z + r * Math.sin(theta);
                    wanderTarget.current = new THREE.Vector3(x, homeTarget.y, z);
                }
                
                setCurrentAnimation('run');
            }

            // 3. Movement Logic
            if (wanderTarget.current) {
                const toTarget = new THREE.Vector3().subVectors(wanderTarget.current, currentPos);
                toTarget.y = 0; // Ignore vertical difference for movement calculation
                const distToTarget = toTarget.length();

                if (distToTarget < 0.5) {
                    // Reached target -> Stop
                    rigidBodyRef.current.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
                    setCurrentAnimation('idle');
                    wanderTarget.current = null;
                } else {
                    // Move towards target
                    toTarget.normalize().multiplyScalar(MOVE_SPEED * 0.7); // Walk slower than run
                    rigidBodyRef.current.setLinvel({ x: toTarget.x, y: currentLinvel.y, z: toTarget.z }, true);
                    
                    // Rotate to face target
                    const angle = Math.atan2(toTarget.x, toTarget.z);
                    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                    rigidBodyRef.current.setRotation(q, true);
                }
            } else {
                // Not moving, just standing still
                rigidBodyRef.current.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
                if (currentAnimation !== 'idle') setCurrentAnimation('idle');
            }
            break;

        case 'chase':
            if (distToPlayer < ATTACK_RANGE) {
                aiState.current = 'attack';
                stateTimer.current = 0;
                setCurrentAnimation('attack');
                rigidBodyRef.current.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
                break;
            }
            // Tether: If chased too far from home, give up
            if (distToPlayer > LOSE_AGGRO_RANGE || distToSpawn > HOME_RADIUS * 1.5) {
                aiState.current = 'idle';
                setCurrentAnimation('idle');
                wanderTarget.current = spawnPosition.clone(); // Return home immediately next frame
                rigidBodyRef.current.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
                break;
            }

            // Simple Chase Logic
            const toPlayer = new THREE.Vector3().subVectors(playerPos, currentPos);
            toPlayer.y = 0;
            toPlayer.normalize().multiplyScalar(MOVE_SPEED);
            
            rigidBodyRef.current.setLinvel({ x: toPlayer.x, y: currentLinvel.y, z: toPlayer.z }, true);
            
            const angleToPlayer = Math.atan2(toPlayer.x, toPlayer.z);
            const qToPlayer = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleToPlayer);
            rigidBodyRef.current.setRotation(qToPlayer, true);
            
            if (currentAnimation !== 'run') setCurrentAnimation('run');
            break;

        case 'attack':
            stateTimer.current += delta;
            
            // Face player while attacking
            const dirToPlayer = new THREE.Vector3().subVectors(playerPos, currentPos);
            dirToPlayer.y = 0;
            const attackAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
            const attackQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), attackAngle);
            rigidBodyRef.current.setRotation(attackQ, true);
            
            // Stop movement
            rigidBodyRef.current.setLinvel({ x: 0, y: currentLinvel.y, z: 0 }, true);
            
            if (stateTimer.current > 1.0) { // Attack duration
                if (distToPlayer <= ATTACK_RANGE) {
                    // Continue attacking
                    stateTimer.current = 0;
                    setCurrentAnimation('idle'); // Reset trigger
                    setTimeout(() => setCurrentAnimation('attack'), 50);
                } else {
                    aiState.current = 'chase';
                    setCurrentAnimation('run');
                }
            }
            break;
    }
  });

  if (shouldDestroy) {
    return <>{droppedLoot}</>;
  }

  return (
    <group>
      <RigidBodyObject
        ref={rigidBodyRef}
        position={position}
        colliders={false}
        type="dynamic"
        lockRotations
        userData={{ type: 'Enemy', id: id, enemyInstanceId: enemyInstanceId }}
        onTriggerEnter={handleTriggerEnter}
        onDoubleClick={(e) => {
            e.stopPropagation();
            useCombatStore.getState().setTarget(enemyInstanceId);
            usePlayerActionStore.getState().setIsAutoChasing(true);
        }}
      >
        {!isDead && (
            <CapsuleCollider 
                args={[0.5 * scale, 0.4 * scale]} 
                position={[0, 0.8 * scale, 0]} 
            />
        )}

        {/* --- REFINED MONSTER HEAD UI --- */}
        {!isDead && (
            <Billboard position={[0, 2.3 * scale, 0]}>
                
                {/* Background Shadow Box for Readability */}
                <mesh position={[0, 0.25, -0.01]}>
                    <planeGeometry args={[2.5, 0.7]} />
                    <meshBasicMaterial color="black" transparent opacity={0.4} />
                </mesh>

                {/* --- TOP ROW: [Element Emoji] [Level] [Name] --- */}
                <group position={[0, 0.35, 0]}>
                    
                    {/* 1. Element Emoji (Far Left, Enlarged) */}
                    {element !== 'Neutral' && ELEMENT_EMOJIS[element] && (
                        <Text
                            position={[-0.8, 0, 0]} 
                            fontSize={0.4} // Enlarged as requested
                            anchorX="center"
                            anchorY="middle"
                        >
                            {ELEMENT_EMOJIS[element]}
                        </Text>
                    )}

                    {/* 2. Level Text */}
                    <Text
                        position={[-0.4, 0, 0]}
                        fontSize={0.2}
                        color="#FFD700"
                        outlineWidth={0.02}
                        outlineColor="black"
                        anchorX="left"
                        anchorY="middle"
                    >
                        {`Lv.${level}`}
                    </Text>

                    {/* 3. Name Text */}
                    <Text
                        position={[0.15, 0, 0]}
                        fontSize={0.2}
                        color="white"
                        outlineWidth={0.02}
                        outlineColor="black"
                        anchorX="left"
                        anchorY="middle"
                    >
                        {name}
                    </Text>
                </group>

                {/* --- BOTTOM ROW: Red HP Bar --- */}
                {/* Background Bar */}
                <mesh position={[0, 0.05, 0]}>
                    <planeGeometry args={[1.5, 0.15]} />
                    <meshBasicMaterial color="#111111" />
                </mesh>

                {/* HP Fill - Strictly RED */}
                <group position={[-0.75, 0.05, 0.01]}> {/* Anchor Left */}
                    <mesh position={[(hp / maxHp) * 0.75, 0, 0]}>
                        <planeGeometry args={[(hp / maxHp) * 1.5, 0.11]} />
                        <meshBasicMaterial color="#FF0000" /> {/* PURE RED */}
                    </mesh>
                </group>

            </Billboard>
        )}

        <group ref={modelRef}>
          <CharacterRenderer
              url={modelUrl || Assets.characters['base-model'].url}
              targetHeight={1.6 * scale}
              animationConfigMap={animationConfigMap}
              animationState={animationState} 
          />
        </group>
        <BlobShadow scale={1.5 * scale} opacity={0.6} />
      </RigidBodyObject>
      {droppedLoot}
    </group>
  );
};

export default Enemy;
