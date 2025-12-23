import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameServer } from '@agent8/gameserver';
import * as THREE from 'three';

import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useMultiPlayerStore } from '../../stores/multiPlayerStore';
import { RigidBodyPlayer, RigidBodyPlayerRef } from 'vibe-starter-3d';
import { CapsuleCollider } from '@react-three/rapier';
import { BlobShadow } from '../effects/BlobShadow';
import { GAME_ASSETS } from '../../config/GameAssetsRegistry';

// 32x32 Pixel Art Configuration
const SPRITE_SIZE = { w: 32, h: 32 };
// Based on typical RPG sprite sheets (e.g. 12 cols, 8 rows or similar)
const COLS = 12;
const ROWS = 8;
const ANIMATION_SPEED = 0.15;

const PlayerSpriteRenderer = ({ velocity }: { velocity: THREE.Vector3 }) => {
    // Use master asset for warrior
    const texture = useTexture(GAME_ASSETS.player_sprite.url);
    const spriteRef = useRef<THREE.Sprite>(null);
    
    // State
    const [frame, setFrame] = useState(0);
    const [direction, setDirection] = useState(0); // 0: Down, 1: Left, 2: Right, 3: Up
    const timer = useRef(0);

    // Setup Texture for Pixel Perfect Rendering
    useEffect(() => {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        // Sprite sheet setup
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1 / COLS, 1 / ROWS);
    }, [texture]);

    useFrame((state, delta) => {
        // XY Velocity for 2D
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const moving = speed > 0.1;

        if (moving) {
            // Determine Direction
            if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
                if (velocity.x > 0) setDirection(2); // Right
                else setDirection(1); // Left
            } else {
                if (velocity.y < 0) setDirection(0); // Down (Negative Y is down in 2D)
                else setDirection(3); // Up
            }

            // Animate
            timer.current += delta;
            if (timer.current >= ANIMATION_SPEED) {
                timer.current = 0;
                setFrame((prev) => (prev + 1) % 4); // Assume 4 frames per anim
            }
        } else {
            // Idle frame (usually 0)
            setFrame(0);
        }

        // Calculate UV coordinates
        const row = direction; 
        const col = frame;

        // UV mapping
        texture.offset.x = col / COLS;
        texture.offset.y = (ROWS - 1 - row) / ROWS;
    });

    return (
        <sprite ref={spriteRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1]}>
            <spriteMaterial map={texture} transparent alphaTest={0.5} toneMapped={false} />
        </sprite>
    );
};

const Player = ({ position = [98, 226, 0] }: { position?: [number, number, number] }) => {
  const { account } = useGameServer();
  const { registerConnectedPlayer, unregisterConnectedPlayer } = useMultiPlayerStore();
  const { setPosition: setLocalPlayerPosition } = useLocalPlayerStore();
  
  const { camera, pointer, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []); // Z=0 Plane

  const rigidBodyPlayerRef = useRef<RigidBodyPlayerRef>(null);
  const [velocity, setVelocity] = useState(new THREE.Vector3());
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  
  // Input State
  const keys = useRef<{ [key: string]: boolean }>({});

  // 1. Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 2. Mouse Click Listener (Raycaster)
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target !== gl.domElement || event.button !== 0) return;

      raycaster.setFromCamera(pointer, camera);
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, target);
      
      if (target) {
        targetPosition.current = target;
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [camera, pointer, gl, plane, raycaster]);

  // Server Registration
  useEffect(() => {
    if (!account) return;
    registerConnectedPlayer(account, rigidBodyPlayerRef);
    return () => unregisterConnectedPlayer(account);
  }, [account, registerConnectedPlayer, unregisterConnectedPlayer]);

  // Movement Logic
  useFrame((state) => {
    const player = rigidBodyPlayerRef.current;
    if (!player) return;

    const currentPos = player.translation();
    
    // --- [카메라 추적 로직 추가됨] ---
    // 카메라를 플레이어 위치로 이동시킵니다.
    // z: 100 (줌 아웃), y: -10 (약간 아래에서 위로 쿼터뷰 느낌)
    state.camera.position.set(currentPos.x, currentPos.y - 10, 100);
    state.camera.lookAt(currentPos.x, currentPos.y, 0);
    // -----------------------------

    // Z-Sorting: Set Z based on Y position for "behind buildings" effect
    // Lower Y = Higher Z (closer to camera)
    const zSort = -currentPos.y * 0.01; 
    player.setTranslation({ ...currentPos, z: zSort }, true);

    // Sync Store
    setLocalPlayerPosition(currentPos.x, currentPos.y, currentPos.z);

    // Calculate Velocity
    const moveSpeed = 5;
    let velX = 0;
    let velY = 0;
    let hasKeyInput = false;

    // Keyboard Input (WASD)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) { velY += 1; hasKeyInput = true; }
    if (keys.current['KeyS'] || keys.current['ArrowDown']) { velY -= 1; hasKeyInput = true; }
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) { velX -= 1; hasKeyInput = true; }
    if (keys.current['KeyD'] || keys.current['ArrowRight']) { velX += 1; hasKeyInput = true; }

    if (hasKeyInput) {
      // Normalize vector
      const len = Math.sqrt(velX * velX + velY * velY);
      if (len > 0) {
        velX = (velX / len) * moveSpeed;
        velY = (velY / len) * moveSpeed;
      }
      // Cancel target if keyboard used
      targetPosition.current = null;
    } else if (targetPosition.current) {
      // Mouse Target Movement
      const dx = targetPosition.current.x - currentPos.x;
      const dy = targetPosition.current.y - currentPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.1) {
        velX = (dx / dist) * moveSpeed;
        velY = (dy / dist) * moveSpeed;
      } else {
        targetPosition.current = null; // Arrived
      }
    }

    // Apply Velocity
    player.setLinvel({ x: velX, y: velY, z: 0 }, true);
    setVelocity(new THREE.Vector3(velX, velY, 0));
  });

  return (
    <RigidBodyPlayer
      ref={rigidBodyPlayerRef}
      userData={{ account, type: 'Player' }}
      position={position}
      targetHeight={1.6}
      autoCreateCollider={false}
      lockRotations
      gravityScale={0}
      // Lock Z axis for physics, allow X and Y
      enabledTranslations={[true, true, false]} 
    >
      {/* 2D Collider: Circle on the feet */}
      <CapsuleCollider args={[0.3, 0.3]} position={[0, -0.5, 0]} />
      
      <Suspense fallback={null}>
        <PlayerSpriteRenderer velocity={velocity} />
      </Suspense>
      
      <BlobShadow scale={1.2} opacity={0.5} position={[0, -0.7, 0]} rotation={[0, 0, 0]} />
    </RigidBodyPlayer>
  );
};

export default Player;