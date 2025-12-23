import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RigidBodyObject } from 'vibe-starter-3d';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { RigidBodyObjectType } from '../../constants/rigidBodyObjectType';
import * as THREE from 'three';

interface PortalProps {
  position: [number, number, number];
  targetPosition: [number, number, number];
  label: string;
  color?: string;
}

const Portal: React.FC<PortalProps> = ({ position, targetPosition, label, color = '#00ffff' }) => {
  const showNotification = useGameStore((state) => state.showNotification);
  const requestTeleport = useLocalPlayerStore((state) => state.requestTeleport);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
      // Pulse effect
      if (Array.isArray(meshRef.current.material)) return;
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  const handleEnter = () => {
    requestTeleport(targetPosition[0], targetPosition[1], targetPosition[2]);
    showNotification(`Teleported to ${label}!`);
  };

  return (
    <group position={position}>
      <RigidBodyObject
        type="fixed"
        sensor
        colliders="hull"
        onTriggerEnter={(payload) => {
          const userData = payload.other.rigidBody?.userData as any;
          if (userData?.type === 'Player') {
             handleEnter();
          }
        }}
      >
        <mesh ref={meshRef} position={[0, 1.5, 0]}>
          <cylinderGeometry args={[1, 1, 3, 32, 1, true]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Inner glow */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 3, 16]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={5} transparent opacity={0.8} />
        </mesh>

        <pointLight color={color} intensity={2} distance={5} position={[0, 2, 0]} />
      </RigidBodyObject>
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  );
};

export default Portal;
