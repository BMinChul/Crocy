import React, { useEffect, useState } from 'react';
import { usePlayerActionStore } from '../../stores/playerActionStore';

const CastingBar = () => {
  const { isCasting, duration, startTime, label } = usePlayerActionStore((state) => state.casting);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isCasting) {
        setProgress(0);
        return;
    }

    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, (elapsed / duration) * 100);
        setProgress(p);

        if (p >= 100) {
            clearInterval(interval);
        }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isCasting, duration, startTime]);

  if (!isCasting) return null;

  return (
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-[5000] pointer-events-none">
       {/* Label */}
       <div className="text-yellow-200 text-sm font-bold tracking-wide mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] bg-black/40 px-2 py-0.5 rounded">
          {label}
       </div>
       
       {/* Bar Container */}
       <div className="w-48 h-3 bg-black/80 border border-gray-600 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {/* Fill */}
          <div 
             className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-200 shadow-[0_0_10px_rgba(0,200,255,0.5)]"
             style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          />
       </div>
    </div>
  );
};

export default CastingBar;
