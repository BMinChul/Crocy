import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Experience from '../r3f/Experience';
import R3FErrorBoundary from '../ui/common/R3FErrorBoundary';
import { useGameStore } from '../../stores/gameStore';
import MapPhysicsReadyChecker from '../r3f/MapPhysicsReadyChecker';

const GameSceneCanvas = () => {
  const { isMapPhysicsReady } = useGameStore();

  return (
    <>
      <Canvas 
        shadows={false} 
        orthographic
        // 초기 카메라는 맵 중앙 쯤을 비추도록 설정 (플레이어 로직이 로딩되면 플레이어가 카메라를 가져갑니다)
        camera={{ zoom: 32, position: [98, 226, 100], near: 0.1, far: 1000 }} 
        dpr={1} 
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          depth: true
        }}
      >
        <color attach="background" args={['#202030']} />
        <ambientLight intensity={1.5} /> 

        {/* Gravity 0 for top-down 2D */}
        <Physics paused={!isMapPhysicsReady} gravity={[0, 0, 0]}>
          
          {/* CameraController 제거됨: Player.tsx에서 직접 제어합니다 */}

          <Suspense fallback={null}>
            {!isMapPhysicsReady && <MapPhysicsReadyChecker />}
          </Suspense>

          <Suspense fallback={null}>
            <R3FErrorBoundary>
              <Experience />
            </R3FErrorBoundary>
          </Suspense>
        </Physics>
      </Canvas>
    </>
  );
};

export default GameSceneCanvas;