import React from 'react';
import { useGameStore } from '../../stores/gameStore';

const TransitionEffect: React.FC = () => {
  const isTransitioning = useGameStore((state) => state.isTransitioning);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        opacity: isTransitioning ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        pointerEvents: 'none',
        zIndex: 40, // Below LoadingScreen (50) but above HUD
      }}
    />
  );
};

export default TransitionEffect;
