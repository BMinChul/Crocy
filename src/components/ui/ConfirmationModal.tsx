import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmLabel = "Yes",
  cancelLabel = "No"
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
       <div className="relative min-w-[300px] bg-[rgba(15,15,15,0.95)] border-2 border-yellow-600/50 shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-sm p-1">
          {/* Header */}
          <div className="bg-gradient-to-r from-transparent via-yellow-900/20 to-transparent p-2 border-b border-yellow-600/30 mb-4">
             <h2 className="text-center font-serif font-bold text-lg text-yellow-500 tracking-wider shadow-black drop-shadow-md">
                 {title}
             </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 text-center">
             <p className="text-gray-300 font-sans text-sm leading-relaxed">
                 {message}
             </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center p-4 pt-2">
             <button 
                onClick={onConfirm}
                className="px-6 py-1.5 bg-red-900/40 hover:bg-red-800/60 border border-red-500/30 hover:border-red-400 text-red-200 text-xs uppercase font-bold tracking-widest transition-all rounded-sm min-w-[80px]"
             >
                {confirmLabel}
             </button>
             <button 
                onClick={onCancel}
                className="px-6 py-1.5 bg-gray-800/40 hover:bg-gray-700/60 border border-gray-600/30 hover:border-gray-500 text-gray-300 text-xs uppercase font-bold tracking-widest transition-all rounded-sm min-w-[80px]"
             >
                {cancelLabel}
             </button>
          </div>
       </div>
    </div>
  );
};

export default ConfirmationModal;
