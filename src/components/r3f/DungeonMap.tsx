import React, { useEffect } from 'react';
import Floor from './Floor';
import Portal from './Portal';
import Player from './Player';
import Enemy from './Enemy';
import MonsterSpawner from './MonsterSpawner';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';

const DungeonMap = () => {
  const setTransitioning = useGameStore((state) => state.setTransitioning);
  const requestTeleport = useLocalPlayerStore((state) => state.requestTeleport);

  useEffect(() => {
    // 1. Player Start Point Logic
    // Force player to entrance position
    requestTeleport(0, 0, 0);

    // 2. VITAL: Fade In Logic
    // Ensure we start with black screen to hide loading artifacts
    setTransitioning(true);

    // Fade in after a short delay
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 500); // 0.5s fade in delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Player Spawn */}
      {/* Position is handled by requestTeleport in useEffect for precision */}
      <Player position={[0, 0, 0]} />
      
      <Floor />
      
      {/* Portal to Town */}
      <Portal 
        position={[0, 0, -10]} 
        targetMap="town" 
        label="Exit to Town" 
        color="#00ff00"
      />

      {/* Lighting for Cave Ambiance */}
      <pointLight position={[5, 3, 5]} intensity={0.8} color="#ff7700" distance={8} />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#ff7700" distance={8} />

      {/* Smart Respawn System: 15s Cycle, Max 30 monsters */}
      <MonsterSpawner 
        maxMonsters={30} 
        spawnInterval={15000} 
        center={[0, 0, 0]} 
        radius={20} 
      />
      
      {/* Boss Area (Unique Encounter) */}
      <group position={[0, 0, 15]}>
        <pointLight position={[0, 5, 0]} intensity={1.5} color="#ff0000" distance={10} />
        <Enemy id="goblin_king" position={[0, 0, 0]} name="Goblin King" maxHp={300} />
      </group>
    </>
  );
};

export default DungeonMap;
