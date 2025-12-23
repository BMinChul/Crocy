import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';

const TYPEWRITER_SPEED = 30; // ms per character

const DialogueBox = () => {
  const { dialogue, closeDialogue } = useGameStore();
  const { isOpen, speakerName, text, portraitUrl, options } = dialogue;
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textIndexRef = useRef(0);
  const typeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    textIndexRef.current = 0;

    const typeChar = () => {
      if (textIndexRef.current < text.length) {
        setDisplayedText(text.slice(0, textIndexRef.current + 1));
        textIndexRef.current++;
        typeTimeoutRef.current = setTimeout(typeChar, TYPEWRITER_SPEED);
      } else {
        setIsTyping(false);
      }
    };

    typeTimeoutRef.current = setTimeout(typeChar, TYPEWRITER_SPEED);

    return () => {
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
    };
  }, [isOpen, text]);

  // Skip typing on click
  const handleBoxClick = () => {
    if (isTyping) {
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
      setDisplayedText(text);
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 w-full h-auto z-[2000] p-4 flex justify-center items-end pointer-events-auto"
      onClick={handleBoxClick}
    >
      <div className="w-full max-w-4xl bg-black/80 border-4 border-blue-900/50 rounded-lg backdrop-blur-sm flex flex-row overflow-hidden shadow-2xl animate-slide-up">
        
        {/* Portrait Section */}
        <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-950/30 flex-shrink-0 border-r border-blue-800/30 relative">
          {portraitUrl ? (
            <img 
              src={portraitUrl} 
              alt={speakerName} 
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-300">
              <span className="text-4xl">?</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col relative">
          
          {/* Speaker Name */}
          <div className="text-blue-300 font-bold text-lg mb-2 tracking-wider uppercase">
            {speakerName}
          </div>
          
          {/* Text Area */}
          <div className="flex-1 text-white text-lg leading-relaxed min-h-[4rem] font-sans">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>

          {/* Options */}
          {!isTyping && options && options.length > 0 && (
            <div className="flex gap-4 mt-4 justify-end">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent box click (skip type) from triggering
                    option.onClick();
                  }}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-500 transition-colors font-bold shadow-lg"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Continue Hint (if no options) */}
          {!isTyping && (!options || options.length === 0) && (
            <div className="absolute bottom-4 right-6 text-blue-400 text-sm animate-bounce">
              Click to close
            </div>
          )}
          
          {/* Hidden Close Button for full overlay click logic */}
          {(!options || options.length === 0) && !isTyping && (
             <div className="absolute inset-0 z-10" onClick={closeDialogue} />
          )}

        </div>
      </div>
    </div>
  );
};

export default DialogueBox;
