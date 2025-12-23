import React from 'react';
import Assets from '../../assets.json';
import { X } from 'lucide-react';

interface WorldMapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorldMapOverlay: React.FC<WorldMapOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fade-in p-4">
      {/* Map Container */}
      <div className="relative max-w-4xl w-full aspect-square md:aspect-video bg-[#1a1614] border-4 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-[#2a2018] to-amber-900 p-3 border-b border-amber-500/30 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl text-amber-200 font-serif tracking-widest drop-shadow-md">WORLD MAP</h2>
          <button 
            onClick={onClose}
            className="text-amber-200 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Map Image */}
        <div className="flex-1 relative overflow-auto bg-black flex items-center justify-center p-4">
          <img 
            src={Assets.ui.map_global.url} 
            alt="Global World Map" 
            className="max-w-full max-h-[80vh] object-contain shadow-lg rounded"
          />
          
          {/* You could add interactive markers here in the future */}
        </div>

        {/* Footer / Legend */}
        <div className="bg-[#1a1614] p-2 border-t border-amber-500/30 text-center text-amber-400/60 text-sm font-mono">
          Use the portals in the village to travel to these regions.
        </div>
      </div>
    </div>
  );
};

export default WorldMapOverlay;
