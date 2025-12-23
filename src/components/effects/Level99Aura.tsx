import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

export const Level99Aura = () => {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate rings
    if (ringRef1.current) {
      ringRef1.current.rotation.z = time * 0.5;
      ringRef1.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -time * 0.3;
      ringRef2.current.scale.setScalar(1 + Math.cos(time * 1.5) * 0.05);
    }
    
    // Float text
    if (textRef.current) {
      textRef.current.position.y = 2.5 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Golden Particle Aura - Additive for glow */}
      <Sparkles 
        count={50}
        scale={[1.5, 3, 1.5]}
        size={6}
        speed={0.4}
        opacity={0.6}
        color="#FFD700"
        position={[0, 1, 0]}
        blending={THREE.AdditiveBlending}
      />

      {/* Rotating Floor Rings - Additive + No Depth Write */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        {/* Ring 1 */}
        <mesh ref={ringRef1}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.5} 
            side={THREE.DoubleSide} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        {/* Ring 2 */}
        <mesh ref={ringRef2} position={[0, 0, -0.01]}>
          <ringGeometry args={[0.7, 0.75, 32]} />
          <meshBasicMaterial 
            color="#FFA500" 
            transparent 
            opacity={0.3} 
            side={THREE.DoubleSide} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Ground Glow */}
      <pointLight position={[0, 0.5, 0]} color="#FFD700" intensity={1.5} distance={3} decay={2} />

      {/* "MAX" Text Badge */}
      <Billboard position={[0, 2.3, 0]} ref={textRef}>
        <Text
          fontSize={0.25}
          color="#FFD700"
          outlineWidth={0.02}
          outlineColor="#8B4513"
          anchorY="middle"
        >
          MAX
        </Text>
      </Billboard>
    </group>
  );
};
