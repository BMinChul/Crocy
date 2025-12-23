import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface UIWindowFrameProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string; // Tailwind width class, e.g., 'w-[400px]'
  height?: string; // Tailwind height class, e.g., 'h-[500px]'
  className?: string; // Additional classes
}

const UIWindowFrame: React.FC<UIWindowFrameProps> = ({ 
  title, 
  onClose, 
  children, 
  width = 'w-[400px]', 
  height = 'h-[500px]',
  className = ''
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none font-sans">
      <div className={`relative ${width} ${height} pointer-events-auto flex flex-col ${className} animate-in zoom-in-95 duration-200`}>
        
        {/* Main Unified Container */}
        <div className="ui-window-container flex flex-col w-full h-full overflow-hidden">
          
          {/* Header */}
          <div className="h-10 flex justify-between items-center mb-2 shrink-0 border-b border-[#444] pb-1">
            <h2 className="ui-title">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative text-gray-200">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UIWindowFrame;
