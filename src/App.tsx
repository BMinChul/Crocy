import React, { useState } from 'react';
import './App.css';
import GameScene from './components/scene/GameScene';
import PreloadScene from './components/scene/PreloadScene';
import LobbyScene from './components/scene/LobbyScene';
import { CharacterData } from './models/CharacterData';
import { useLocalPlayerStore } from './stores/localPlayerStore';

enum AppState {
  PRELOAD = 'PRELOAD',
  LOBBY = 'LOBBY',
  GAME = 'GAME'
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PRELOAD);
  const initializePlayer = useLocalPlayerStore((state) => state.initializeFromData);

  const handleLoadingComplete = () => {
    setAppState(AppState.LOBBY);
  };

  const handleGameStart = (characterData: CharacterData) => {
    // Initialize the player store with selected character data
    initializePlayer(characterData);
    setAppState(AppState.GAME);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {appState === AppState.PRELOAD && <PreloadScene onComplete={handleLoadingComplete} />}
      {appState === AppState.LOBBY && <LobbyScene onGameStart={handleGameStart} />}
      {appState === AppState.GAME && <GameScene />}
    </div>
  );
};

export default App;
