import React, { useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import Portal from './Portal';
import Player from './Player';
import { GAME_ASSETS } from '../../config/GameAssetsRegistry';

// 2D Tile System
const TiledBackground = ({ center, size }: { center: { x: number, y: number }, size: number }) => {
  const texture = useTexture(GAME_ASSETS.tileset_v1.url);
  
  useEffect(() => {
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(size / 3, size / 3); 
  }, [texture, size]);

  return (
    <mesh position={[center.x, center.y, -1]}> {/* Background at Z = -1 */}
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

const Plaza = ({ position }: { position: [number, number, number] }) => {
    const texture = useTexture(GAME_ASSETS.iso_tile_scene2.url);

    useEffect(() => {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
    }, [texture]);

    return (
        <mesh position={position}>
            {/* Z-Index Handling: Slightly behind player plane 0, but above background -1 */}
            {/* position z should be calculated by Y-sort, but for static floor object -0.5 is fine */}
            <planeGeometry args={[20, 16]} /> 
            <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={1} />
        </mesh>
    );
};

const TownMap = () => {
  const MAP_SIZE = 60;
  // XY Coordinates now
  const CENTER_X = 98;
  const CENTER_Y = 226; 

  const positions = {
    portals: [
        { pos: [CENTER_X + 0, CENTER_Y + 20, 0], label: "North" },
        { pos: [CENTER_X + 20, CENTER_Y + 0, 0], label: "East" },
        { pos: [CENTER_X + 0, CENTER_Y - 20, 0], label: "South" },
        { pos: [CENTER_X - 20, CENTER_Y + 0, 0], label: "West" },
    ]
  };

  return (
    <>
      {/* ================= 2D BACKGROUND MAP (XY Plane) ================= */}
      <group>
        <TiledBackground center={{ x: CENTER_X, y: CENTER_Y }} size={MAP_SIZE} />
        <Plaza position={[CENTER_X, CENTER_Y, -0.5]} />
      </group>

      {/* Physics Walls (Optional bounds) */}
      <RigidBody type="fixed" friction={0}>
         {/* Floor is not needed for gravity (gravity=0), but boundaries are good */}
      </RigidBody>

      {/* ================= GAMEPLAY ELEMENTS ================= */}
      
      {/* Player Spawn */}
      <Player position={[CENTER_X, CENTER_Y, 0]} />
      
      {/* Portals */}
      {positions.portals.map((portal, idx) => (
          <Portal 
              key={`portal-${idx}`}
              position={portal.pos as [number, number, number]} 
              targetPosition={[CENTER_X, CENTER_Y, 0]} 
              label={portal.label} 
              color="#00ffff"
          />
      ))}
    </>
  );
};

export default TownMap;
