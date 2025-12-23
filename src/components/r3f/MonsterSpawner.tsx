import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import Enemy from './Enemy';
import Assets from '../../assets.json';

interface MonsterData {
  id: string;
  position: [number, number, number];
  name: string;
  maxHp: number;
  level: number;
  expReward: number;
  modelUrl?: string;
  scale?: number;
  isDead?: boolean; // Track death state for respawn logic
}

interface MonsterSpawnerProps {
  maxMonsters?: number;
  spawnInterval?: number;
  center?: [number, number, number];
  radius?: number;
}

const MONSTER_TEMPLATES = [
  { name: "Goblin Guard", maxHp: 60, level: 10, expReward: 50, scale: 1.0 },
  { name: "Goblin Scout", maxHp: 50, level: 8, expReward: 40, scale: 0.9 },
  { name: "Goblin Leader", maxHp: 120, level: 12, expReward: 80, scale: 1.2 },
  { name: "Slime", maxHp: 30, level: 5, expReward: 10, scale: 0.6 },
];

const MonsterSpawner = ({ 
  maxMonsters = 30, 
  spawnInterval = 15000, // 15s
  center = [98, 0, 226], // New Map Center
  radius = 50 
}: MonsterSpawnerProps) => {
  const [monsters, setMonsters] = useState<MonsterData[]>([]);
  const nextIdRef = useRef(0);

  // Spawn Logic
  const spawnMonsters = useCallback((count: number) => {
    if (count <= 0) return;

    setMonsters(prev => {
      const newMonsters: MonsterData[] = [];
      for (let i = 0; i < count; i++) {
        const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const x = center[0] + r * Math.cos(angle);
        const z = center[2] + r * Math.sin(angle);
        
        newMonsters.push({
          id: `spawned_${Date.now()}_${nextIdRef.current++}`,
          position: [x, center[1], z],
          name: template.name,
          maxHp: template.maxHp,
          level: template.level,
          expReward: template.expReward,
          scale: template.scale,
          modelUrl: Assets.characters['base-model'].url,
          isDead: false
        });
      }
      return [...prev, ...newMonsters];
    });
  }, [center, radius]);

  // Initial Spawn
  useEffect(() => {
    spawnMonsters(maxMonsters);
  }, []);

  // Periodic Respawn Check (15s Cycle)
  useEffect(() => {
      const interval = setInterval(() => {
          setMonsters(prev => {
              // Count only ALIVE monsters
              const aliveCount = prev.filter(m => !m.isDead).length;
              const missing = maxMonsters - aliveCount;
              
              if (missing > 0) {
                  // Generate new monsters
                  const newMonsters: MonsterData[] = [];
                  for (let i = 0; i < missing; i++) {
                    const template = MONSTER_TEMPLATES[Math.floor(Math.random() * MONSTER_TEMPLATES.length)];
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * radius;
                    const x = center[0] + r * Math.cos(angle);
                    const z = center[2] + r * Math.sin(angle);
                    
                    newMonsters.push({
                      id: `spawned_${Date.now()}_${nextIdRef.current++}`,
                      position: [x, center[1], z],
                      name: template.name,
                      maxHp: template.maxHp,
                      level: template.level,
                      expReward: template.expReward,
                      scale: template.scale,
                      modelUrl: Assets.characters['base-model'].url,
                      isDead: false
                    });
                  }
                  console.log(`[Spawner] Cycle Check: Alive=${aliveCount}, Spawning=${missing}. Total will be 30.`);
                  return [...prev, ...newMonsters];
              }
              return prev;
          });
      }, spawnInterval);
      return () => clearInterval(interval);
  }, [maxMonsters, spawnInterval, center, radius]);

  const handleMonsterDeath = (id: string) => {
    // Mark as dead but KEEP in list so it can render loot
    setMonsters(prev => prev.map(m => m.id === id ? { ...m, isDead: true } : m));
  };

  const handleMonsterCleanup = (id: string) => {
    // Finally remove from list (loot expired/collected)
    setMonsters(prev => prev.filter(m => m.id !== id));
  };

  return (
    <>
      {monsters.map(m => (
        <Enemy 
          key={m.id}
          {...m}
          onDeath={() => handleMonsterDeath(m.id)}
          onCleanup={() => handleMonsterCleanup(m.id)}
        />
      ))}
    </>
  );
};

export default MonsterSpawner;
