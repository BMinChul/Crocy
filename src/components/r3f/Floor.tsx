import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MASTER_ASSETS } from '../../config/masterAssets';

interface FloorProps {
  position?: [number, number, number];
  size?: [number, number];
  textureUrl?: string;
  color?: string;
}

const Floor = ({ 
  position = [0, 0, 0], 
  size = [100, 100], 
  textureUrl = MASTER_ASSETS.map_village_base, 
  color = '#ffffff' 
}: FloorProps) => {
  
  // Use a simple textured plane
  const TexturePlane = () => {
    const texture = useTexture(textureUrl);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // Adjust repeat based on size (assuming 10 repeats per 100 units)
    texture.repeat.set(size[0] / 10, size[1] / 10);
    texture.encoding = THREE.sRGBEncoding;
    
    return (
      <mesh receiveShadow position={[0, -0.1, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial map={texture} color={color} />
      </mesh>
    );
  };

  return (
    <RigidBody type="fixed" colliders={'cuboid'} position={position}>
      <TexturePlane />
    </RigidBody>
  );
};

export default Floor;
