import React from 'react';
import { Cylinder } from '@react-three/drei';

interface BlobShadowProps {
  scale?: number;
  opacity?: number;
  color?: string;
}

export const BlobShadow = ({ scale = 1, opacity = 0.4, color = "black" }: BlobShadowProps) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <circleGeometry args={[0.6 * scale, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity} 
        depthWrite={false} 
        toneMapped={false}
      />
    </mesh>
  );
};
