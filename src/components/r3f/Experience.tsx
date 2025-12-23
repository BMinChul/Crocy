import { Environment } from '@react-three/drei';
import TownMap from './TownMap';
import FloatingDamageNumbers from '../effects/FloatingDamageNumbers';
import HitParticles from '../effects/HitParticles';
import { ToonEffect } from '../effects/ToonEffect';
import { TargetIndicator } from './TargetIndicator';
import Player from './Player'; // 👈 [중요] 플레이어 컴포넌트 불러오기

import Assets from '../../assets.json';

const Experience = () => {
  return (
    <>
      {/* Global Environment - Default Town Style */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <Environment preset="city" background={false} />
      <color attach="background" args={['#87CEEB']} /> 
      
      {/* Single Unified Map */}
      <TownMap />

      {/* [중요] 플레이어 소환! 
         위치를 마을(TownMap)의 안전한 곳(98, 226)으로 지정합니다.
         이제 Player.tsx가 실행되면서 카메라도 같이 움직일 겁니다.
      */}
      <Player position={[98, 226, 0]} />

      {/* Global Effects */}
      <FloatingDamageNumbers />
      <HitParticles />
      <TargetIndicator />
      
      {/* Post-processing for Cel-shading/Toon look */}
      <ToonEffect />
    </>
  );
};

export default Experience;