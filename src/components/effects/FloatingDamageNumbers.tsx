import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { useCombatStore, DamageNumber } from '../../stores/combatStore';
import * as THREE from 'three';

const DamageText = ({ item }: { item: DamageNumber }) => {
  const ref = useRef<THREE.Group>(null);
  const { removeDamageNumber } = useCombatStore();
  const [opacity, setOpacity] = React.useState(1);

  const color = item.type === 'effective' ? '#ff0000' : 
                item.type === 'weak' ? '#aaaaaa' : 
                item.type === 'heal' ? '#00ff00' : 
                item.type === 'loot' ? '#FFD700' : '#ffffff';
  
  const scale = item.type === 'effective' ? 1.5 : 
                item.type === 'heal' ? 1.1 : 
                item.type === 'loot' ? 0.6 : // Smaller for loot
                item.type === 'weak' ? 0.7 : 0.8;

  useFrame((state, delta) => {
    if (ref.current) {
      // Float up - slower for loot
      const speed = item.type === 'loot' ? 1.0 : 1.5;
      ref.current.position.y += delta * speed;
      
      // Fade out logic
      const elapsed = Date.now() - item.timestamp;
      const duration = 1000; // 1 second
      
      if (elapsed > duration - 300) { // Fade out in last 300ms
        const fadeProgress = (elapsed - (duration - 300)) / 300;
        setOpacity(Math.max(0, 1 - fadeProgress));
      }

      if (elapsed > duration) {
        removeDamageNumber(item.id);
      }
    }
  });

  return (
    <group ref={ref} position={item.position}>
      <Billboard>
        <Text
          fontSize={0.8 * scale}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
          fontWeight="bold"
          fillOpacity={opacity}
          outlineOpacity={opacity}
        >
          {item.type === 'effective' ? 'Strong!\n' : ''}
          {item.type === 'weak' ? 'Weak\n' : ''}
          {item.type === 'heal' ? '+' : ''}
          {item.type === 'loot' ? '' : ''}
          {item.damage}
          {item.type === 'effective' && '!'}
        </Text>
      </Billboard>
    </group>
  );
};

const FloatingDamageNumbers = () => {
  const damageNumbers = useCombatStore((state) => state.damageNumbers);

  return (
    <group>
      {damageNumbers.map((dn) => (
        <DamageText key={dn.id} item={dn} />
      ))}
    </group>
  );
};

export default FloatingDamageNumbers;
