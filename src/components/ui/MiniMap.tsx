import React, { useState, useEffect, useRef } from 'react';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { GAME_ASSETS } from '../../config/GameAssetsRegistry';

interface MiniMapProps {
  onOpenWorldMap: () => void;
}

const MiniMap: React.FC<MiniMapProps> = ({ onOpenWorldMap }) => {
  const position = useLocalPlayerStore((state) => state.state.position);
  
  // Map configuration
  const MAP_SIZE_WORLD = 100; // The map represents a 100x100m world
  const MAP_IMAGE_SIZE = 1024; // Texture resolution
  const MINIMAP_SIZE = 200; // UI Size in pixels
  const CENTER_X = 98;
  const CENTER_Z = 226;
  
  // Calculate relative position percentage (0-100%)
  // Center is (98, 226). 
  // Map range: X [98-50, 98+50], Z [226-50, 226+50]
  
  // Conversion:
  // X world -> Image X (0 to 1)
  const mapX = (position.x - (CENTER_X - MAP_SIZE_WORLD/2)) / MAP_SIZE_WORLD;
  const mapY = (position.z - (CENTER_Z - MAP_SIZE_WORLD/2)) / MAP_SIZE_WORLD;

  // Visual Adjustment
  // We want the map to move behind the player.
  // If player moves RIGHT (positive X), map should move LEFT.
  // Center of minimap is (100, 100).
  // Background Position logic:
  // When mapX is 0.5 (center), bg pos should center the image.
  
  // Scale factor: How much 'world' fits in the minimap window?
  // Let's say we want to see 40m of the world.
  const ZOOM_LEVEL = 2.5; 
  
  const bgSize = MAP_IMAGE_SIZE * ZOOM_LEVEL;
  const bgPosX = MINIMAP_SIZE / 2 - mapX * bgSize;
  const bgPosY = MINIMAP_SIZE / 2 - mapY * bgSize;

  return (
    <div className="absolute top-5 right-5 z-[9999] flex flex-col items-end pointer-events-auto">
      {/* MiniMap Frame */}
      <div 
        className="relative rounded-full overflow-hidden border border-amber-400/50 shadow-[0_0_15px_rgba(0,0,0,0.8)] bg-black/80"
        style={{ 
          width: `${MINIMAP_SIZE}px`, 
          height: `${MINIMAP_SIZE}px`,
        }}
      >
        {/* Map Image Layer */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${GAME_ASSETS.tileset_v1.url})`,
            backgroundSize: `${bgSize}px ${bgSize}px`,
            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
            filter: 'brightness(0.8) contrast(1.2)'
          }}
        />
        
        {/* Player Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-lg z-10" />
        
        {/* Compass / Orientation */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] text-amber-200 font-bold">N</div>

        {/* World Map Button */}
        <button
          onClick={onOpenWorldMap}
          className="absolute bottom-0 right-0 w-12 h-12 hover:scale-110 transition-transform duration-200 z-20 focus:outline-none cursor-pointer"
          title="Open World Map"
        >
          <img 
            src={GAME_ASSETS.icon_worldmap.url} 
            alt="World Map"  
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </button>
      </div>

      {/* Coordinate Display */}
      <div className="mt-2 bg-black/60 px-3 py-1 rounded border border-amber-400/30 text-xs font-mono text-amber-100 shadow-md backdrop-blur-sm">
        <span className="text-amber-400 mr-1">LOC:</span>
        {Math.round(position.x)}, {Math.round(position.z)}
      </div>
    </div>
  );
};

export default MiniMap;
