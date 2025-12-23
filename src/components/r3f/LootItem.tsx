import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { CollisionPayload, CuboidCollider } from '@react-three/rapier';
import { RigidBodyObject, RigidBodyObjectRef } from 'vibe-starter-3d';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInventoryStore, Item } from '../../stores/inventoryStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useCombatStore } from '../../stores/combatStore';
import { RigidBodyObjectType } from '../../constants/rigidBodyObjectType';
import Assets from '../../assets.json';

interface LootItemProps {
  id: string; // Unique ID for deduplication
  position: [number, number, number];
  type: 'item' | 'gold';
  item?: Item;
  goldValue?: number;
}

// Global Set to track collected loot IDs across component remounts (Strict Mode fix)
const collectedLootIds = new Set<string>();

const LootItem = ({ id, position: initialPosition, type, item, goldValue }: LootItemProps) => {
  const rigidBodyRef = useRef<RigidBodyObjectRef>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [collected, setCollected] = useState(false);
  const [expired, setExpired] = useState(false);
  const addItem = useInventoryStore(state => state.addItem);
  const addGold = useInventoryStore(state => state.addGold);
  const addDamageNumber = useCombatStore(state => state.addDamageNumber);
  
  // Magnet Settings
  const MAGNET_RANGE = 3.0;
  const COLLECT_RANGE = 0.5;
  const MAGNET_SPEED = 8.0;

  // Check if already collected (Global check)
  useEffect(() => {
    if (collectedLootIds.has(id)) {
        setCollected(true);
    }
  }, [id]);

  // Auto-cleanup after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
        setExpired(true);
    }, 60000); // 60s
    return () => clearTimeout(timer);
  }, []);

  const playSound = (soundUrl: string) => {
      const audio = new Audio(soundUrl);
      audio.volume = 0.4;
      audio.play().catch(e => console.warn('Audio play failed', e));
  };

  const performCollection = () => {
    // 1. Check Global ID Set (Prevents Double Notification / Logic)
    if (collectedLootIds.has(id) || expired) return;
    
    // 2. Mark as collected immediately in Global Set
    collectedLootIds.add(id);
    
    // 3. Local State Update
    setCollected(true);

    // Get Player Head Position for Floating Text
    const playerState = useLocalPlayerStore.getState().state;
    const playerHeadPos = new THREE.Vector3(playerState.position.x, playerState.position.y + 2.2, playerState.position.z);

    if (type === 'gold' && goldValue) {
        addGold(goldValue);
        // Visual & Audio
        addDamageNumber(playerHeadPos, `+${goldValue} Gold`, 'loot');
        if (Assets.sounds.coin_pickup?.url) playSound(Assets.sounds.coin_pickup.url);
    } else if (type === 'item' && item) {
        const success = addItem(item);
        if (success) {
            const nameDisplay = item.plusLevel ? `+${item.name} [+${item.plusLevel}]` : `+${item.name}`;
            addDamageNumber(playerHeadPos, nameDisplay, 'loot');
            if (Assets.sounds.item_pickup?.url) playSound(Assets.sounds.item_pickup.url);
        } else {
            // If inventory full, release lock
            collectedLootIds.delete(id);
            setCollected(false);
        }
    }
  };

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || collectedLootIds.has(id) || expired) return;

    // 1. Visual Animation (Spin & Bob)
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 2;
        // Only bob if NOT being sucked in (to avoid jitter)
        // actually bobbing is fine relative to parent
        // Lowered base height from 0.5 to 0.1 to look more "on the ground"
        groupRef.current.position.y = 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }

    // 2. Magnet Logic
    const playerPos = useLocalPlayerStore.getState().state.position;
    const currentPos = rigidBodyRef.current.translation();
    
    const pVec = new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z); // Target waist/chest
    const cVec = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z);
    
    const dist = cVec.distanceTo(pVec);

    if (dist < MAGNET_RANGE) {
        // Smart Weight Check: If item cannot be carried, do NOT magnetize
        if (type === 'item' && item && !useInventoryStore.getState().canCarry(item)) {
            return;
        }

        // LERP towards player
        const dir = pVec.sub(cVec).normalize();
        const moveDist = MAGNET_SPEED * delta;
        
        // If close enough to collect in this frame, just collect
        if (dist < COLLECT_RANGE) {
            performCollection();
        } else {
            // Move RigidBody manually (since it's Fixed type, setTranslation teleports it)
            const newPos = cVec.add(dir.multiplyScalar(moveDist));
            rigidBodyRef.current.setTranslation({ x: newPos.x, y: newPos.y, z: newPos.z }, true);
        }
    }
  });

  const handleTriggerEnter = (payload: CollisionPayload) => {
    if (collectedLootIds.has(id) || expired) return;
    
    // Check if the collider is the player
    const userData = payload.other.rigidBody?.userData as any;
    const isPlayer = userData?.type === RigidBodyObjectType.LOCAL_PLAYER || userData?.type === 'LOCAL_PLAYER' || userData?.type === 'Player';

    if (isPlayer) {
        performCollection();
    }
  };

  if (collectedLootIds.has(id) || expired) return null;

  // Visuals
  const isGold = type === 'gold';
  const color = isGold ? '#FFD700' : (item?.type === 'consumable' ? '#ff4444' : '#8B4513');
  
  // Label Logic
  let label = '';
  if (isGold) {
      label = 'Gold';
  } else if (item) {
      label = item.plusLevel ? `${item.name} [+${item.plusLevel}]` : item.name;
  }

  return (
    <RigidBodyObject 
        ref={rigidBodyRef}
        type="fixed" 
        position={initialPosition} 
        onTriggerEnter={handleTriggerEnter}
        colliders={false}
    >
       {/* Sensor for manual collection if magnet fails or player teleports on top */}
       <CuboidCollider args={[0.5, 0.5, 0.5]} sensor />
       
       <group ref={groupRef}>
          {/* Visual Representation */}
          {isGold ? (
             // Gold Coin Visual (Cylinder)
             <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
             </mesh>
          ) : (
             // Item Box Visual
             <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
             </mesh>
          )}
       </group>
    </RigidBodyObject>
  );
};

export default LootItem;
