import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { InputController } from './InputController';
import LoadingScreen from './LoadingScreen';
import ClassicRPGUI from './ClassicRPGUI';
import TransitionEffect from './TransitionEffect';

import DialogueBox from './DialogueBox';
import InventoryWindow from './InventoryWindow';
import EquipmentWindow from './EquipmentWindow';
import ShopWindow from './ShopWindow';
import StatWindow from './StatWindow';
import SkillWindow from './SkillWindow';
import PickupNotification from './PickupNotification';
import DebugPanel from './DebugPanel';
import MiniMap from './MiniMap';
import WorldMapOverlay from './WorldMapOverlay';
import { Bug } from 'lucide-react';

import { useInventoryStore } from '../../stores/inventoryStore';

/**
 * Game Scene UI Component
 *
 * This component manages UI overlays for the game scene.
 * It handles loading states and displays appropriate UI elements based on game state.
 */
const GameSceneUI = () => {
  // ⚠️ MUST CHECK: Map physics system ready state
  // Physics paused and loading screen displayed while this value is false
  const { isMapPhysicsReady, notification, quest, isVictory, setVictory, toggleSkillWindow, toggleStatWindow, toggleEquipmentWindow } = useGameStore();
  const { toggleInventory } = useInventoryStore();
  const [isDebugOpen, setIsDebugOpen] = React.useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = React.useState(false);

  useEffect(() => {
    // CRITICAL RECOVERY: Force UI activation after 5 seconds if physics check hangs
    const timer = setTimeout(() => {
      if (!isMapPhysicsReady) {
        console.warn("CRITICAL: Force activating UI due to physics check timeout");
        useGameStore.getState().setMapPhysicsReady(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isMapPhysicsReady]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Toggle Skill Window with 'K'
      if (e.code === 'KeyK') {
        toggleSkillWindow();
      }
      // Toggle Status Window with 'P'
      if (e.code === 'KeyP') {
        toggleStatWindow();
      }
      // Toggle Equipment with 'E'
      if (e.code === 'KeyE') {
        toggleEquipmentWindow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSkillWindow, toggleStatWindow, toggleInventory, toggleEquipmentWindow]);

  return (
    <>
      {/* Input Controller - Global input management (keyboard, touch) */}
      <InputController disableJoystick={false} disableKeyboard={false} disabled={!isMapPhysicsReady} />
      
      {/* Game UI Overlay - High Z-Index Layer */}
      {isMapPhysicsReady && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9999, 
          pointerEvents: 'none' 
        }}>
          {/* Enable pointer events only for interactive children */}
          <div style={{ pointerEvents: 'auto' }}>
          <ClassicRPGUI />
          <MiniMap onOpenWorldMap={() => setIsWorldMapOpen(true)} />
          <WorldMapOverlay isOpen={isWorldMapOpen} onClose={() => setIsWorldMapOpen(false)} />
          
          <ShopWindow />
          <StatWindow />
          <SkillWindow />
          <InventoryWindow />
          <EquipmentWindow />
          <PickupNotification />
          
          {/* Debug Toggle Button */}
          <button 
            onClick={() => setIsDebugOpen(!isDebugOpen)}
            className="absolute top-4 left-4 z-[2000] p-2 bg-slate-900/50 hover:bg-slate-900 text-white rounded-full border border-white/20 hover:border-white transition-colors"
            title="Toggle Debug Panel"
          >
            <Bug size={20} />
          </button>
          </div>
          
          {isDebugOpen && <div style={{ pointerEvents: 'auto' }}><DebugPanel onClose={() => setIsDebugOpen(false)} /></div>}

          {/* Quest HUD */}
          {quest?.isActive && !isVictory && (
            <div className="absolute top-5 right-5 bg-black/60 p-4 rounded-lg border-2 border-yellow-400 text-white font-mono z-[1000] pointer-events-none shadow-lg backdrop-blur-sm animate-fade-in-down">
              <div className="text-yellow-400 text-lg mb-1 font-bold tracking-widest border-b border-yellow-400/30 pb-1">QUEST</div>
              <div className="text-sm text-gray-300 mb-1">{quest.title}</div>
              <div className="text-2xl font-bold mt-1 text-center bg-black/40 rounded py-1 px-2">
                <span className="text-yellow-300">{quest.progress}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span className="text-white">{quest.target}</span>
              </div>
            </div>
          )}
          
          {/* Notification Overlay */}
          {notification && (
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#FFD700',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '24px',
              fontWeight: 'bold',
              zIndex: 100,
              pointerEvents: 'none',
              border: '2px solid #FFD700',
              textShadow: '2px 2px 0px #000',
              fontFamily: '"Press Start 2P", cursive, sans-serif'
            }}>
              {notification}
            </div>
          )}

          {/* Victory UI Overlay */}
          {isVictory && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
              <div className="text-center transform scale-150 animate-bounce-in">
                 <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 filter drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] tracking-wider mb-4 font-serif">
                   MISSION COMPLETE
                 </h1>
                 <h2 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase mb-8 drop-shadow-lg">
                   NFT EARNED!
                 </h2>
                 <div className="text-yellow-200 text-xl animate-pulse">
                   Check your inventory for the Legendary Gold Sword
                 </div>
                 
                 <button 
                   onClick={() => setVictory(false)}
                   className="mt-12 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded border-2 border-blue-400 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,100,255,0.5)]"
                 >
                   Continue Playing
                 </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transition Effect Overlay */}
      <TransitionEffect />

      {/* Loading Game Scene screen overlay */}
      {!isMapPhysicsReady && <LoadingScreen />}
    </>
  );
};

export default GameSceneUI;
